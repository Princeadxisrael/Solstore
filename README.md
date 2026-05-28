# Solana Mobile Storefront

A native Android storefront where every item is priced in USDC (stablecoin), but users can pay with SOL, USDC, BONK, or SKR. Non-USDC payments are routed through **Jupiter Swap** atomically.

---

## Stack decision

| Option | MWA support | Notes |
|---|---|---|
| **React Native + Expo** ✅ | First-party SDK | Official `create-solana-dapp` template, `@wallet-ui/react-native-web3js` |
| Kotlin | First-party SDK | Native only — no JS ecosystem, harder Jupiter integration |
| Flutter | Community SDK only | No official MWA SDK; lags behind protocol updates |

**iOS note**: MWA is Android-only per official Solana Mobile docs. iOS support is blocked by platform restrictions on inter-app communication.

---

## Project structure

```
solana-storefront/
├── index.js                      # Entry point — polyfill FIRST, then expo-router
├── polyfill.js                   # react-native-quick-crypto install
├── app/
│   ├── _layout.tsx               # Root: MobileWalletProvider + QueryClient + GestureHandler
│   └── index.tsx                 # Store screen route
├── src/
│   ├── constants/
│   │   ├── index.ts              # Token mints, RPC, Jupiter URLs, app identity
│   │   ├── catalogue.ts          # Store item data (replace with your API/program)
│   │   └── theme.ts              # Design tokens
│   ├── types/
│   │   └── index.ts              # StoreItem, PaymentQuote, TokenInfo, etc.
│   ├── services/
│   │   ├── jupiter.ts            # Quote + swap transaction builder
│   │   └── tokens.ts             # Price API + wallet balance fetcher
│   ├── store/
│   │   └── index.ts              # Zustand: cart state + checkout state
│   ├── hooks/
│   │   ├── usePayment.ts         # Orchestrates MWA sign + Jupiter swap
│   │   └── useTokenBalances.ts   # React Query wrapper for prices + balances
│   ├── components/
│   │   ├── WalletBar.tsx         # Top wallet address + connect/disconnect
│   │   ├── FeaturedBanner.tsx    # Hero featured item
│   │   ├── StoreItemCard.tsx     # Grid item card
│   │   ├── TokenOption.tsx       # Payment token selector row
│   │   └── CheckoutSheet.tsx     # Bottom sheet: token select + confirm + success
│   └── screens/
│       └── StoreScreen.tsx       # Main store listing screen
```

---

## Version rationale

| Tool | Version used | Why NOT the absolute latest |
|---|---|---|
| **Node.js** | **24 LTS** | Node 26 is "Current" only — it won't reach Active LTS until Oct 2026. Production must use Active LTS (24). Node 20 is Maintenance LTS (still valid but older). |
| **Java** | **21 LTS** | Java 26 is non-LTS (6-month lifespan, gone Sep 2026). Java 25 is the newest LTS but too new for React Native native modules and Android Gradle plugin to be fully validated against. Java 21 is the battle-tested LTS for Android toolchains. Gradle 9.x supports JVM 17–26. |

## Setup

### 1. Prerequisites

- Node.js 24 LTS (`nvm install 24`)
- Android Studio + Android SDK (API 34+)
- Android device or emulator with an **MWA-compatible wallet** installed  
  (Phantom, Solflare, or the [fakewallet](https://github.com/solana-mobile/mobile-wallet-adapter/tree/main/android/fakewallet) dev tool)

### 2. Install

```bash
npm install
```

### 3. Configure

Edit `src/constants/index.ts`:

```ts
// Replace with your Helius API key (https://helius.dev)
export const RPC_ENDPOINT = 'https://mainnet.helius-rpc.com/?api-key=YOUR_KEY';

// Replace with your deployed community token mint
TOKEN_MINTS.LAGOTOKEN = new PublicKey('YOUR_COMMUNITY_TOKEN_MINT');
```

### 4. Build & run

```bash
# IMPORTANT: Expo Go will NOT work — MWA requires a custom dev build
npm run android   # runs: expo run:android
```

> **Why not `expo start`?** MWA uses Kotlin native modules. The standard Expo Go app doesn't include them. You must build a custom dev client with `expo run:android`.

---

## Payment flow (technical)

```
User taps "Buy"
  └─ CheckoutSheet opens
       └─ usePayment.fetchQuote()
            └─ jupiter.ts getPaymentQuote()
                 ├─ If USDC: returns direct transfer quote (no swap)
                 ├─ If LAGOTOKEN: applies 5% discount, uses ExactOut mode
                 └─ Otherwise: calls Jupiter /v6/quote (ExactOut → always receive priceUsdc USDC)

User taps "Confirm & Sign"
  └─ usePayment.confirmPurchase()
       ├─ Fetches fresh quote (Jupiter quotes expire ~30s)
       ├─ buildSwapTransaction()
       │    ├─ USDC path: SPL createTransferInstruction (payer ATA → merchant ATA)
       │    └─ Swap path: Jupiter /v6/swap → VersionedTransaction deserialized
       ├─ signAndSendTransaction(tx)  ← MWA opens wallet bottom sheet
       │    Wallet signs + broadcasts to RPC. Do NOT call sendRawTransaction yourself.
       └─ connection.confirmTransaction() polls until 'confirmed'
```

---

## SKR token integration

SKR is the official Solana Mobile / Seeker ecosystem token, launched January 21 2026.

- **Mint address:** `SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3`
- **Staking program:** `SKRskrmtL83pcL4YqLWt6iPefDqwXQWHSw9S9vz94BZ`
- Already wired into `TOKEN_MINTS` in `src/constants/index.ts` — no placeholder to replace.
- Users paying with SKR receive a **5% discount** (`COMMUNITY_TOKEN_DISCOUNT`), rewarding Seeker device holders.
- SKR is routed through Jupiter like any other SPL token; it has active liquidity pools on mainnet.
- Always verify the mint address before interacting. scammers deploy fake SKR tokens with similar names.

