import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TokenInfo } from '../types';
import { TokenSymbol } from '../constants';
import { PaymentQuote } from '../types';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';

interface Props {
  tokenInfo: TokenInfo;
  isSelected: boolean;
  approxAmount: string;   // always shown immediately from fallback prices
  quote: PaymentQuote | null;
  isLoadingQuote: boolean;
  onSelect: (symbol: TokenSymbol) => void;
}

const LOGO_LABEL: Record<TokenSymbol, string> = {
  SOL: '◎', USDC: '$', BONK: '🐶', SKR: '◈',
};
const LOGO_BG: Record<TokenSymbol, string> = {
  SOL:  'rgba(153,69,255,0.2)',
  USDC: 'rgba(39,117,202,0.2)',
  BONK: 'rgba(255,160,0,0.2)',
  SKR:  'rgba(20,241,149,0.15)',
};
const LOGO_COLOR: Record<TokenSymbol, string> = {
  SOL:  Colors.solLight,
  USDC: '#5BA4E6',
  BONK: Colors.bonk,
  SKR:  Colors.green,
};

export function TokenOption({ tokenInfo, isSelected, approxAmount, quote, onSelect }: Props) {
  const { symbol, walletBalance } = tokenInfo;

  const balanceLabel =
    symbol === 'BONK' ? `${walletBalance.toLocaleString('en', { maximumFractionDigits: 0 })} BONK`
    : symbol === 'SOL' ? `${walletBalance.toFixed(3)} SOL`
    : `${walletBalance.toFixed(2)} ${symbol}`;

  // Show live quote amount if available, otherwise show approx
  const displayAmount = (isSelected && quote)
    ? `${quote.inputAmountUi} ${symbol}`
    : `~${approxAmount} ${symbol}`;

  const isLiveQuote = isSelected && !!quote;

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      onPress={() => onSelect(symbol)}
      activeOpacity={0.8}
    >
      <View style={styles.left}>
        <View style={[styles.logo, { backgroundColor: LOGO_BG[symbol] }]}>
          <Text style={[styles.logoText, { color: LOGO_COLOR[symbol] }]}>
            {LOGO_LABEL[symbol]}
          </Text>
        </View>
        <View>
          <Text style={styles.tokenName}>{symbol}</Text>
          <Text style={styles.tokenBal}>bal: {balanceLabel}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, isLiveQuote && styles.amountLive]}>
          {displayAmount}
        </Text>
        {symbol === 'SKR' && (
          <Text style={[styles.equiv, { color: Colors.green }]}>-5% Seeker discount</Text>
        )}
        {symbol === 'USDC' && (
          <Text style={styles.equiv}>direct · no swap</Text>
        )}
        {isLiveQuote && symbol !== 'USDC' && symbol !== 'SKR' && (
          <Text style={styles.equiv}>live quote ✓</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.tag, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1.5, borderColor: 'transparent' },
  selected:   { borderColor: Colors.sol, backgroundColor: 'rgba(153,69,255,0.1)' },
  left:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo:       { width: 36, height: 36, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  logoText:   { fontSize: FontSize.lg, fontWeight: '700' },
  tokenName:  { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  tokenBal:   { fontSize: FontSize.xs, color: Colors.muted, fontFamily: 'SpaceMono' },
  right:      { alignItems: 'flex-end', minWidth: 100 },
  amount:     { fontSize: FontSize.sm, fontWeight: '600', color: Colors.muted, fontFamily: 'SpaceMono' },
  amountLive: { color: Colors.text },
  equiv:      { fontSize: FontSize.xs, color: Colors.muted, fontFamily: 'SpaceMono', marginTop: 2 },
});