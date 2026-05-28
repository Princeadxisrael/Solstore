import { create } from 'zustand';
import { CartItem, PaymentQuote, PaymentStatus, StoreItem, TokenSymbol } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (item: StoreItem) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  totalUsdc: () => number;
}

interface CheckoutState {
  selectedItem: StoreItem | null;
  selectedToken: TokenSymbol;
  quote: PaymentQuote | null;
  paymentStatus: PaymentStatus;
  lastTxSignature: string | null;
  errorMessage: string | null;

  openCheckout: (item: StoreItem) => void;
  closeCheckout: () => void;
  setSelectedToken: (token: TokenSymbol) => void;
  setQuote: (quote: PaymentQuote | null) => void;
  setPaymentStatus: (status: PaymentStatus) => void;
  setTxSignature: (sig: string) => void;
  setError: (msg: string | null) => void;
  resetPayment: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const existing = get().items.find((ci) => ci.item.id === item.id);
    if (existing) {
      set((s) => ({
        items: s.items.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci,
        ),
      }));
    } else {
      set((s) => ({ items: [...s.items, { item, quantity: 1 }] }));
    }
  },

  removeItem: (itemId) =>
    set((s) => ({ items: s.items.filter((ci) => ci.item.id !== itemId) })),

  clearCart: () => set({ items: [] }),

  totalUsdc: () =>
    get().items.reduce((sum, ci) => sum + ci.item.priceUsdc * ci.quantity, 0),
}));

export const useCheckoutStore = create<CheckoutState>((set) => ({
  selectedItem: null,
  selectedToken: 'SOL',
  quote: null,
  paymentStatus: 'idle',
  lastTxSignature: null,
  errorMessage: null,

  openCheckout: (item) =>
    set({ selectedItem: item, selectedToken: 'SOL', quote: null, paymentStatus: 'idle', errorMessage: null }),

  closeCheckout: () =>
    set({ selectedItem: null, quote: null, paymentStatus: 'idle', errorMessage: null }),

  setSelectedToken: (token) => set({ selectedToken: token, quote: null }),

  setQuote: (quote) => set({ quote }),

  setPaymentStatus: (status) => set({ paymentStatus: status }),

  setTxSignature: (sig) => set({ lastTxSignature: sig }),

  setError: (msg) => set({ errorMessage: msg, paymentStatus: 'error' }),

  resetPayment: () =>
    set({ paymentStatus: 'idle', quote: null, errorMessage: null, lastTxSignature: null }),
}));
