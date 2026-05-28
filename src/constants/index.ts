import { PublicKey } from '@solana/web3.js';

// RPC — use Helius for production reliability + priority fees
// export const RPC_ENDPOINT = 'https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY';
export const RPC_ENDPOINT= 'https://api.mainnet-beta.solana.com';
export const RPC_CHAIN = 'solana:mainnet-beta' as const;

// Well-known SPL token mints on mainnet
export const TOKEN_MINTS = {
  USDC: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  SOL:  new PublicKey('So11111111111111111111111111111111111111112'),  // wrapped SOL
  BONK: new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'),
  // SKR — official Solana Mobile / Seeker ecosystem token
  // Mint: SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3 (launched Jan 21 2026)
  SKR: new PublicKey('SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3'),
} as const;

export type TokenSymbol = keyof typeof TOKEN_MINTS;

// Jupiter v6 Swap API
export const JUPITER_QUOTE_URL = 'https://lite-api.jup.ag/swap/v1/quote';
export const JUPITER_SWAP_URL  = 'https://lite-api.jup.ag/swap/v1/swap';
export const JUPITER_PRICE_URL= 'https://lite-api.jup.ag/price/v2';

// SKR token discount — rewards Solana Mobile ecosystem participants
export const COMMUNITY_TOKEN_DISCOUNT = 0.05; // 5% discount for SKR payments

// App identity shown to wallets during MWA authorization
export const APP_IDENTITY = {
  name: 'Lagos Web3 Market',
  uri:  'https://lagosweb3.market',
  icon: 'favicon.png',
} as const;

// Slippage in basis points (50 = 0.5%)
export const SLIPPAGE_BPS = 50;
