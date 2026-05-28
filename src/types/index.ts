import { TokenSymbol } from '../constants';

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  priceUsdc: number;           // canonical stablecoin price
  seller: string;              // seller's .skr domain or wallet label
  sellerPubkey: string;        // seller's Solana public key (base58)
  category: ItemCategory;
  acceptedTokens: TokenSymbol[];
  inStock: boolean;
  tags: string[];
}

export type ItemCategory = 'food' | 'crafts' | 'services' | 'community';

export interface TokenInfo {
  symbol: TokenSymbol;
  name: string;
  decimals: number;
  usdPrice: number;            // fetched from Jupiter price API
  walletBalance: number;       // user's balance in native units
}

export interface PaymentQuote {
  inputToken: TokenSymbol;
  inputAmount: number;         // in native token units (lamports / raw)
  inputAmountUi: string;       // human-readable display string
  outputToken: 'USDC';
  outputAmount: number;        // in USDC lamports (6 decimals)
  priceImpactPct: number;
  routePlan: RoutePlan[];
  quoteResponse: unknown;      // raw Jupiter quote — passed back to /swap
  isDirectTransfer: boolean;   // true when paying in USDC directly
  communityDiscount: boolean;
}

export interface RoutePlan {
  swapInfo: {
    ammKey: string;
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
  };
  percent: number;
}

export interface CartItem {
  item: StoreItem;
  quantity: number;
}

export type PaymentStatus = 'idle' | 'quoting' | 'signing' | 'confirming' | 'success' | 'error';
