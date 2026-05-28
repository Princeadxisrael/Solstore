import axios from 'axios';
import {
  Connection,
  PublicKey,
  VersionedTransaction,
  TransactionMessage,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
} from '@solana/spl-token';
import {
  JUPITER_QUOTE_URL,
  JUPITER_SWAP_URL,
  TOKEN_MINTS,
  SLIPPAGE_BPS,
  COMMUNITY_TOKEN_DISCOUNT,
} from '../constants';
import { PaymentQuote, TokenSymbol } from '../types';

const USDC_DECIMALS = 6;

const FALLBACK_PRICES: Record<TokenSymbol, number> = {
  SOL:  142,
  USDC: 1,
  BONK: 0.0000148,
  SKR:  0.12,
};

export function getApproxInputAmount(inputToken: TokenSymbol, priceUsdc: number): string {
  const discount = inputToken === 'SKR' ? (1 - COMMUNITY_TOKEN_DISCOUNT) : 1;
  const effectiveUsdc = priceUsdc * discount;
  if (inputToken === 'USDC') return effectiveUsdc.toFixed(2);
  const amount = effectiveUsdc / FALLBACK_PRICES[inputToken];
  if (inputToken === 'BONK') return amount.toLocaleString('en', { maximumFractionDigits: 0 });
  if (inputToken === 'SOL')  return amount.toFixed(4);
  return amount.toFixed(2);
}

export async function getPaymentQuote(
  inputToken: TokenSymbol,
  priceUsdc: number,
): Promise<PaymentQuote> {
  const communityDiscount = inputToken === 'SKR';
  const effectiveUsdc = communityDiscount
    ? priceUsdc * (1 - COMMUNITY_TOKEN_DISCOUNT)
    : priceUsdc;

  if (inputToken === 'USDC') {
    const rawAmount = Math.ceil(effectiveUsdc * 10 ** USDC_DECIMALS);
    return {
      inputToken: 'USDC',
      inputAmount: rawAmount,
      inputAmountUi: effectiveUsdc.toFixed(2),
      outputToken: 'USDC',
      outputAmount: rawAmount,
      priceImpactPct: 0,
      routePlan: [],
      quoteResponse: null,
      isDirectTransfer: true,
      communityDiscount,
    };
  }

  const outputAmountLamports = Math.ceil(effectiveUsdc * 10 ** USDC_DECIMALS);
  const params = new URLSearchParams({
    inputMint:   TOKEN_MINTS[inputToken].toBase58(),
    outputMint:  TOKEN_MINTS.USDC.toBase58(),
    amount:      outputAmountLamports.toString(),
    swapMode:    'ExactOut',
    slippageBps: SLIPPAGE_BPS.toString(),
  });

  const { data: quoteResponse } = await axios.get(
    `${JUPITER_QUOTE_URL}?${params}`,
    { timeout: 10000 },
  );

  const inputAmountNative = Number(quoteResponse.inAmount);
  const inputAmountUi = formatTokenAmount(inputAmountNative, getTokenDecimals(inputToken), inputToken);

  return {
    inputToken,
    inputAmount: inputAmountNative,
    inputAmountUi,
    outputToken: 'USDC',
    outputAmount: outputAmountLamports,
    priceImpactPct: parseFloat(quoteResponse.priceImpactPct || '0'),
    routePlan: quoteResponse.routePlan ?? [],
    quoteResponse,
    isDirectTransfer: false,
    communityDiscount,
  };
}

// Returns VersionedTransaction — the web3js MWA wrapper calls .serialize() internally
export async function buildSwapTransaction(
  quote: PaymentQuote,
  payerPublicKey: PublicKey,
  merchantPublicKey: PublicKey,
  connection: Connection,
): Promise<VersionedTransaction> {
  if (quote.isDirectTransfer) {
    return buildDirectUsdcTransfer(payerPublicKey, merchantPublicKey, quote.outputAmount, connection);
  }

  const { data } = await axios.post(
    JUPITER_SWAP_URL,
    { quoteResponse: quote.quoteResponse, userPublicKey: payerPublicKey.toBase58() },
    { timeout: 15000 },
  );

  // Jupiter returns a base64 serialized VersionedTransaction
  const txBytes = Buffer.from(data.swapTransaction, 'base64');
  return VersionedTransaction.deserialize(txBytes);
}

async function buildDirectUsdcTransfer(
  payer: PublicKey,
  merchant: PublicKey,
  amountLamports: number,
  connection: Connection,
): Promise<VersionedTransaction> {
  const usdcMint    = TOKEN_MINTS.USDC;
  const payerAta    = getAssociatedTokenAddressSync(usdcMint, payer);
  const merchantAta = getAssociatedTokenAddressSync(usdcMint, merchant);

  const { blockhash } = await connection.getLatestBlockhash('confirmed');

  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: [
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10_000 }),
      createAssociatedTokenAccountIdempotentInstruction(payer, merchantAta, merchant, usdcMint),
      createTransferInstruction(payerAta, merchantAta, payer, amountLamports),
    ],
  }).compileToV0Message();

  return new VersionedTransaction(message);
}

function getTokenDecimals(token: TokenSymbol): number {
  return { SOL: 9, USDC: 6, BONK: 5, SKR: 6 }[token];
}

function formatTokenAmount(raw: number, decimals: number, token: TokenSymbol): string {
  const ui = raw / 10 ** decimals;
  if (token === 'BONK') return ui.toLocaleString('en', { maximumFractionDigits: 0 });
  if (token === 'SOL')  return ui.toFixed(4);
  return ui.toFixed(2);
}