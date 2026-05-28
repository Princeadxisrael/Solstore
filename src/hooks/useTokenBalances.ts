import { useQuery } from '@tanstack/react-query';
import { Connection } from '@solana/web3.js';
import { fetchTokenPrices, fetchWalletBalances, buildTokenInfoList } from '../services/tokens';
import { TokenInfo } from '../types';
import { RPC_ENDPOINT } from '../constants';
import { useAuthorization } from './useAuthorization';

const connection = new Connection(RPC_ENDPOINT, 'confirmed');

export function useTokenBalances(): {
  tokens: TokenInfo[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { account } = useAuthorization();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tokenBalances', account?.publicKey.toBase58()],
    queryFn: async () => {
      const [prices, balances] = await Promise.all([
        fetchTokenPrices(),
        account
          ? fetchWalletBalances(account.publicKey, connection)
          : Promise.resolve({ SOL: 0, USDC: 0, BONK: 0, SKR: 0 }),
      ]);
      return buildTokenInfoList(prices, balances);
    },
    enabled: true,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return {
    tokens: data ?? [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
