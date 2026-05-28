import axios from 'axios';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { TOKEN_MINTS, TokenSymbol } from '../constants';
import { TokenInfo } from '../types';

const JUPITER_PRICE_URL = 'https://price.jup.ag/v6/price';

/**
 * Fetch USD prices for all supported tokens from Jupiter Price API v6.
 */
export async function fetchTokenPrices(): Promise<Record<TokenSymbol, number>> {
  const mints = Object.values(TOKEN_MINTS)
    .map((pk) => pk.toBase58())
    .join(',');

  const { data } = await axios.get(`${JUPITER_PRICE_URL}?ids=${mints}`);

  const prices: Partial<Record<TokenSymbol, number>> = {};
  for (const [symbol, mint] of Object.entries(TOKEN_MINTS) as [TokenSymbol, PublicKey][]) {
    const mintStr = mint.toBase58();
    prices[symbol] = data.data[mintStr]?.price ?? 0;
  }

  return prices as Record<TokenSymbol, number>;
}

/**
 * Fetch SPL token balances for a given wallet.
 * Returns balances in UI units (not raw lamports).
 */
export async function fetchWalletBalances(
  walletPubkey: PublicKey,
  connection: Connection,
): Promise<Record<TokenSymbol, number>> {
  const balances: Partial<Record<TokenSymbol, number>> = {};

  // SOL balance
  const lamports = await connection.getBalance(walletPubkey, 'confirmed');
  balances.SOL = lamports / 1e9;

  // SPL token balances
  const splTokens: Array<{ symbol: TokenSymbol; decimals: number }> = [
    { symbol: 'USDC',      decimals: 6 },
    { symbol: 'BONK',      decimals: 5 },
    { symbol: 'SKR', decimals: 6 },
  ];

  await Promise.all(
    splTokens.map(async ({ symbol, decimals }) => {
      try {
        const ata = getAssociatedTokenAddressSync(TOKEN_MINTS[symbol], walletPubkey);
        const info = await connection.getTokenAccountBalance(ata, 'confirmed');
        balances[symbol] = info.value.uiAmount ?? 0;
      } catch {
        // ATA doesn't exist yet → zero balance
        balances[symbol] = 0;
      }
    }),
  );

  return balances as Record<TokenSymbol, number>;
}

/**
 * Compose full TokenInfo records combining prices and balances.
 */
export function buildTokenInfoList(
  prices: Record<TokenSymbol, number>,
  balances: Record<TokenSymbol, number>,
): TokenInfo[] {
  return [
    {
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      usdPrice: prices.SOL,
      walletBalance: balances.SOL,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      usdPrice: 1.0,
      walletBalance: balances.USDC,
    },
    {
      symbol: 'BONK',
      name: 'Bonk',
      decimals: 5,
      usdPrice: prices.BONK,
      walletBalance: balances.BONK,
    },
    {
      symbol: 'SKR',
      name: 'SKR / Seeker',
      decimals: 6,
      usdPrice: prices.SKR,
      walletBalance: balances.SKR,
    },
  ];
}
