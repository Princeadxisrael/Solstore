import { StoreItem } from '../types';

// Seller pubkeys are valid base58 Solana addresses.
// In production these would be each merchant's actual wallet address.
// These are real valid Solana public keys used as placeholders.
const DEMO_SELLER_1 = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';
const DEMO_SELLER_2 = 'GsbwXfJraMomNxBcjYLcG3mxkBUiyWXAB32fGbSMQRdW';
const DEMO_SELLER_3 = 'BrEqc6zHVR19tLTFk1cRJjBa36RWNJKpRBpZHnMPHcS2';
const DEMO_SELLER_4 = 'DRpbCBMxVnDK7mVeX7oMkMwoTcPAe7nGzjRXKBfS3n4H';
const DEMO_SELLER_5 = 'Hm5ZBMmPaHLddysZK9fTBmhfVbwBkxhD7X1LkXmRfbnT';
const DEMO_SELLER_6 = 'FwKF3pxCezBHRKRLZVMmFjXNXJAdRGpBzD7x4M7jNR5X';
const DEMO_SELLER_7 = 'E4fAoMkBJvGJNRG6eDMGZDHvG1RN9XjGhEbKAQZkVHyN';
const DEMO_SELLER_8 = 'CKwT9GHZV3VBJPHp3cpNMWUPJiJh3v3vMNjMNmCKQHfG';

export const STORE_ITEMS: StoreItem[] = [
  {
    id: 'adire-scarf-001',
    name: 'Adire Silk Scarf',
    description: 'Hand-dyed indigo fabric, limited batch from Abeokuta artisans. Verified on-chain provenance via NFT certificate.',
    emoji: '🧣',
    priceUsdc: 42.00,
    seller: 'weaver.skr',
    sellerPubkey: DEMO_SELLER_1,
    category: 'crafts',
    acceptedTokens: ['SOL', 'USDC', 'SKR'],
    inStock: true,
    tags: ['featured', 'artisan', 'limited'],
  },
  {
    id: 'suya-platter-001',
    name: 'Suya Platter',
    description: 'Spiced grilled beef skewers with groundnut sauce. Pickup from Mallam Ibrahim\'s stall, Lekki Market.',
    emoji: '🍢',
    priceUsdc: 8.50,
    seller: 'mallam_ibrahim.skr',
    sellerPubkey: DEMO_SELLER_2,
    category: 'food',
    acceptedTokens: ['SOL', 'USDC', 'BONK', 'SKR'],
    inStock: true,
    tags: ['food', 'pickup'],
  },
  {
    id: 'ankara-tote-001',
    name: 'Ankara Tote Bag',
    description: 'Handcrafted tote bag with premium Ankara print. Each bag is unique — pattern varies per batch.',
    emoji: '👜',
    priceUsdc: 22.00,
    seller: 'fabric_queens.skr',
    sellerPubkey: DEMO_SELLER_3,
    category: 'crafts',
    acceptedTokens: ['SOL', 'USDC', 'BONK', 'SKR'],
    inStock: true,
    tags: ['fashion', 'handmade'],
  },
  {
    id: 'palm-oil-001',
    name: 'Palm Oil (5L)',
    description: 'Cold-pressed, unrefined red palm oil from Edo State. Sourced directly from smallholder farmers.',
    emoji: '🫙',
    priceUsdc: 14.00,
    seller: 'agro_chukwu.skr',
    sellerPubkey: DEMO_SELLER_4,
    category: 'food',
    acceptedTokens: ['SOL', 'USDC', 'SKR'],
    inStock: true,
    tags: ['groceries', 'organic'],
  },
  {
    id: 'braiding-001',
    name: 'Hair Braiding (2hr)',
    description: 'Professional hair braiding session. Book a slot with Chinyere — Island or Mainland locations.',
    emoji: '✂️',
    priceUsdc: 30.00,
    seller: 'chinyere.skr',
    sellerPubkey: DEMO_SELLER_5,
    category: 'services',
    acceptedTokens: ['SOL', 'USDC', 'SKR'],
    inStock: true,
    tags: ['beauty', 'booking'],
  },
  {
    id: 'zobo-001',
    name: 'Zobo Drink (6-pk)',
    description: 'Chilled hibiscus drink, naturally sweetened with ginger and cloves. 330ml bottles.',
    emoji: '🍹',
    priceUsdc: 6.00,
    seller: 'zobo_express.skr',
    sellerPubkey: DEMO_SELLER_6,
    category: 'food',
    acceptedTokens: ['BONK', 'USDC', 'SKR'],
    inStock: true,
    tags: ['drinks', 'cold'],
  },
  {
    id: 'asooke-001',
    name: 'Aso-Oke Fabric',
    description: 'Traditional Yoruba hand-woven fabric. 5-yard bolt in royal blue and gold pattern.',
    emoji: '🪡',
    priceUsdc: 55.00,
    seller: 'weavercraft.skr',
    sellerPubkey: DEMO_SELLER_7,
    category: 'crafts',
    acceptedTokens: ['SOL', 'USDC'],
    inStock: true,
    tags: ['traditional', 'fabric'],
  },
  {
    id: 'egusi-001',
    name: 'Egusi Soup (2kg)',
    description: 'Home-cooked egusi soup with assorted meat, frozen and ready for pickup or delivery.',
    emoji: '🍲',
    priceUsdc: 18.00,
    seller: 'mama_nkechi.skr',
    sellerPubkey: DEMO_SELLER_8,
    category: 'food',
    acceptedTokens: ['USDC', 'SKR'],
    inStock: false,
    tags: ['food', 'delivery'],
  },
];