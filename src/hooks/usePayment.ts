import { useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { VersionedTransaction } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol';
import { useCheckoutStore } from '../store';
import { getPaymentQuote, buildSwapTransaction } from '../services/jupiter';
import { StoreItem } from '../types';
import { RPC_ENDPOINT, APP_IDENTITY } from '../constants';
import { useAuthorization } from './useAuthorization';

const connection = new Connection(RPC_ENDPOINT, 'confirmed');

export function usePayment() {
  const { account, connect } = useAuthorization();
  const {
    selectedToken,
    setQuote,
    setPaymentStatus,
    setTxSignature,
    setError,
  } = useCheckoutStore();

  const fetchQuote = useCallback(
    async (item: StoreItem) => {
      setPaymentStatus('quoting');
      try {
        const quote = await getPaymentQuote(selectedToken, item.priceUsdc);
        setQuote(quote);
        setPaymentStatus('idle');
        return quote;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quote');
        return null;
      }
    },
    [selectedToken, setQuote, setPaymentStatus, setError],
  );

  const confirmPurchase = useCallback(
    async (item: StoreItem) => {
      if (!account) {
        try { await connect(); } catch { setError('Wallet connection cancelled.'); return; }
      }

      setPaymentStatus('quoting');
      try {
        // Fresh quote — Jupiter quotes expire in ~30s
        const quote = await getPaymentQuote(selectedToken, item.priceUsdc);
        setQuote(quote);
        setPaymentStatus('signing');

        const payerPubkey    = account!.publicKey;
        const merchantPubkey = new PublicKey(item.sellerPubkey);

        // buildSwapTransaction returns VersionedTransaction
        // The web3js MWA wrapper's signAndSendTransactions calls .serialize() internally
        const tx: VersionedTransaction = await buildSwapTransaction(
          quote, payerPubkey, merchantPubkey, connection,
        );

        // The web3js wrapper's augmented signAndSendTransactions:
        //   - takes:    { transactions: VersionedTransaction[] }
        //   - returns:  base58-encoded signature strings[]
        // This is different from the raw protocol which uses base64 payloads/signatures.
        const signatures: string[] = await transact(async (wallet: MobileWallet) => {
          // Reauthorize to get a fresh session within transact()
          await wallet.authorize({
            identity: APP_IDENTITY,
            chain:'solana:mainnet-beta',
          });

          // Cast to the augmented web3js type — the proxy adds this method
          const augmented = wallet as unknown as {
            signAndSendTransactions: (params: {
              transactions: VersionedTransaction[];
            }) => Promise<string[]>;
          };

          return augmented.signAndSendTransactions({ transactions: [tx] });
        });

        // signatures[0] is already a base58 string from the web3js wrapper
        const sig = signatures[0];
        setPaymentStatus('confirming');

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
        await connection.confirmTransaction(
          { signature: sig, blockhash, lastValidBlockHeight },
          'confirmed',
        );

        setTxSignature(sig);
        setPaymentStatus('success');
      } catch (err) {
        const raw = err instanceof Error ? err.message : String(err);
        const isUserRejected =
          raw.toLowerCase().includes('cancel') ||
          raw.toLowerCase().includes('reject') ||
          raw.toLowerCase().includes('dismiss');
        setError(isUserRejected ? 'Transaction cancelled.' : `Payment failed: ${raw}`);
      }
    },
    [account, connect, selectedToken, setQuote, setPaymentStatus, setTxSignature, setError],
  );

  return { fetchQuote, confirmPurchase, isWalletConnected: !!account };
}