import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PublicKey } from '@solana/web3.js';
import {
  AuthorizationResult,
  AuthorizeAPI,
  ReauthorizeAPI,
} from '@solana-mobile/mobile-wallet-adapter-protocol';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { APP_IDENTITY, RPC_CHAIN } from '../constants';

export type ConnectedAccount = {
  status: 'connected';
  publicKey: PublicKey;
  authToken: string;
  label: string;
};

type AuthContextType = {
  account: ConnectedAccount | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * MWA returns account.address as Base64EncodedAddress (base64 string of 32 raw bytes).
 * PublicKey constructor accepts raw bytes (Uint8Array) or base58 string — NOT base64.
 * We must decode base64 → Uint8Array first.
 */
function base64ToPublicKey(base64Address: string): PublicKey {
  const bytes = Buffer.from(base64Address, 'base64');
  return new PublicKey(bytes);
}

export function AuthorizationProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<ConnectedAccount | null>(null);

  const connect = useCallback(async () => {
    try {
      await transact(async (wallet: AuthorizeAPI & ReauthorizeAPI) => {
        const result: AuthorizationResult = await wallet.authorize({
          identity: APP_IDENTITY,
          chain: RPC_CHAIN,
        });

        // address is Base64EncodedAddress — must decode before passing to PublicKey
        const pubkey = base64ToPublicKey(result.accounts[0].address);

        setAccount({
          status: 'connected',
          publicKey: pubkey,
          authToken: result.auth_token,
          label: result.accounts[0].label ?? pubkey.toBase58().slice(0, 8),
        });

        return result;
      });
    } catch (err) {
      // User cancelled or wallet not found — fail silently
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.toLowerCase().includes('cancel') && !msg.toLowerCase().includes('reject')) {
        console.error('MWA authorization error:', msg);
      }
    }
  }, []);

  const disconnect = useCallback(() => setAccount(null), []);

  return (
    <AuthContext.Provider value={{ account, connect, disconnect }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthorization(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthorization must be used inside AuthorizationProvider');
  return ctx;
}