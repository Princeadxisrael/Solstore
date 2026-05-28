import React, { useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Pressable, ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { useCheckoutStore } from '../store';
import { usePayment } from '../hooks/usePayment';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { TokenOption } from './TokenOption';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';
import { TokenSymbol } from '../constants';
import { getApproxInputAmount } from '../services/jupiter';

export function CheckoutSheet() {
  const {
    selectedItem,
    selectedToken,
    quote,
    paymentStatus,
    lastTxSignature,
    errorMessage,
    setSelectedToken,
    closeCheckout,
    resetPayment,
  } = useCheckoutStore();

  const { confirmPurchase } = usePayment();
  const { tokens } = useTokenBalances();

  const translateY = useSharedValue(600);
  const opacity    = useSharedValue(0);
  const isVisible  = !!selectedItem;

  useEffect(() => {
    if (isVisible) {
      opacity.value    = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 180 });
    } else {
      opacity.value    = withTiming(0, { duration: 150 });
      translateY.value = withTiming(600, { duration: 200 });
    }
  }, [isVisible]);

  const sheetStyle    = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const handleTokenSelect = useCallback(
    (symbol: TokenSymbol) => {
      if (paymentStatus === 'signing' || paymentStatus === 'confirming') return;
      setSelectedToken(symbol);
    },
    [paymentStatus, setSelectedToken],
  );

  const handleConfirm = useCallback(async () => {
    if (!selectedItem) return;
    await confirmPurchase(selectedItem);
  }, [selectedItem, confirmPurchase]);

  const handleClose = useCallback(() => {
    if (paymentStatus === 'signing' || paymentStatus === 'confirming') return;
    closeCheckout();
  }, [paymentStatus, closeCheckout]);

  if (!selectedItem) return null;

  const isBusy    = paymentStatus === 'signing' || paymentStatus === 'confirming' || paymentStatus === 'quoting';
  const isSuccess = paymentStatus === 'success';
  const isError   = paymentStatus === 'error';

  const acceptedTokenInfos = tokens.filter(
    (t) => selectedItem.acceptedTokens.includes(t.symbol as TokenSymbol),
  );

  const confirmLabel = () => {
    if (paymentStatus === 'quoting')    return 'Fetching quote…';
    if (paymentStatus === 'signing')    return 'Sign in wallet…';
    if (paymentStatus === 'confirming') return 'Confirming…';
    return `Pay with ${selectedToken === 'SKR' ? 'SKR' : selectedToken}`;
  };

  return (
    <Modal transparent visible={isVisible} animationType="none" onRequestClose={handleClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handle} />

          {isSuccess ? (
            <SuccessView
              item={selectedItem.name}
              price={selectedItem.priceUsdc}
              token={selectedToken}
              txSig={lastTxSignature ?? ''}
              onDone={() => { resetPayment(); closeCheckout(); }}
            />
          ) : (
            <>
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>{selectedItem.name}</Text>
                  <Text style={styles.subtitle}>Select token to pay · quote fetched at confirm</Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.totalAmount}>${selectedItem.priceUsdc.toFixed(2)}</Text>
              <Text style={styles.totalLabel}>priced in USDC · converted at checkout</Text>

              {isError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              <View style={styles.tokenList}>
                {acceptedTokenInfos.length > 0 ? (
                  acceptedTokenInfos.map((t) => (
                    <TokenOption
                      key={t.symbol}
                      tokenInfo={t}
                      isSelected={selectedToken === t.symbol}
                      // Use live quote if available, else show approx from fallback prices
                      approxAmount={getApproxInputAmount(t.symbol as TokenSymbol, selectedItem.priceUsdc)}
                      quote={selectedToken === t.symbol ? quote : null}
                      isLoadingQuote={false}
                      onSelect={handleTokenSelect}
                    />
                  ))
                ) : (
                  // Fallback: show all 4 tokens with approx prices when token balances not loaded
                  (['SOL', 'USDC', 'BONK', 'SKR'] as TokenSymbol[])
                    .filter((s) => selectedItem.acceptedTokens.includes(s))
                    .map((symbol) => (
                      <TokenOption
                        key={symbol}
                        tokenInfo={{ symbol, name: symbol, decimals: 6, usdPrice: 0, walletBalance: 0 }}
                        isSelected={selectedToken === symbol}
                        approxAmount={getApproxInputAmount(symbol, selectedItem.priceUsdc)}
                        quote={selectedToken === symbol ? quote : null}
                        isLoadingQuote={false}
                        onSelect={handleTokenSelect}
                      />
                    ))
                )}
              </View>

              {quote && !quote.isDirectTransfer && (
                <View style={styles.routeInfo}>
                  <View style={styles.routeDot} />
                  <Text style={styles.routeText}>
                    {selectedToken} → USDC via Jupiter · {quote.routePlan.length} hop
                    {quote.routePlan.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.confirmBtn, isBusy && styles.confirmBtnDisabled]}
                onPress={handleConfirm}
                disabled={isBusy}
                activeOpacity={0.8}
              >
                {isBusy
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.confirmBtnText}>{confirmLabel()}</Text>
                }
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

function SuccessView({
  item, price, token, txSig, onDone,
}: { item: string; price: number; token: TokenSymbol; txSig: string; onDone: () => void }) {
  return (
    <View style={styles.successContainer}>
      <View style={styles.successRing}>
        <Text style={{ fontSize: 36 }}>✓</Text>
      </View>
      <Text style={styles.successTitle}>Payment Confirmed</Text>
      <Text style={styles.successSub}>{item} · ${price.toFixed(2)}</Text>
      <Text style={styles.successSub}>
        Paid with {token}{token !== 'USDC' ? ' via Jupiter' : ' directly'}
      </Text>
      <View style={styles.txHashPill}>
        <Text style={styles.txHashText}>tx: {txSig.slice(0, 8)}…{txSig.slice(-6)}</Text>
      </View>
      <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
        <Text style={styles.doneBtnText}>Back to Store</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root:               { flex: 1, justifyContent: 'flex-end' },
  backdrop:           { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet:              { backgroundColor: '#1A1A24', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: Spacing.xl, paddingBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderBottomWidth: 0 },
  handle:             { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.pill, alignSelf: 'center', marginTop: Spacing.md, marginBottom: Spacing.lg },
  header:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  title:              { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
  subtitle:           { fontSize: FontSize.xs, color: Colors.muted, fontFamily: 'SpaceMono', marginTop: 2 },
  closeBtn:           { padding: Spacing.xs },
  closeBtnText:       { fontSize: FontSize.lg, color: Colors.muted },
  totalAmount:        { fontSize: 28, fontWeight: '700', color: Colors.green, textAlign: 'center', marginBottom: 4 },
  totalLabel:         { fontSize: FontSize.xs, color: Colors.muted, fontFamily: 'SpaceMono', textAlign: 'center', marginBottom: Spacing.lg },
  errorBanner:        { backgroundColor: 'rgba(255,87,87,0.12)', borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.sm, borderWidth: 1, borderColor: 'rgba(255,87,87,0.3)' },
  errorText:          { fontSize: FontSize.sm, color: Colors.danger, fontFamily: 'SpaceMono' },
  tokenList:          { gap: Spacing.sm, marginBottom: Spacing.md },
  routeInfo:          { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(20,241,149,0.06)', borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.md, borderWidth: 1, borderColor: 'rgba(20,241,149,0.15)' },
  routeDot:           { width: 7, height: 7, borderRadius: Radius.pill, backgroundColor: Colors.green },
  routeText:          { fontSize: FontSize.xs, color: 'rgba(20,241,149,0.8)', fontFamily: 'SpaceMono', flex: 1 },
  confirmBtn:         { backgroundColor: Colors.sol, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  confirmBtnDisabled: { backgroundColor: '#333' },
  confirmBtnText:     { fontSize: FontSize.lg, fontWeight: '700', color: '#fff' },
  successContainer:   { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  successRing:        { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(20,241,149,0.15)', borderWidth: 2, borderColor: Colors.green, alignItems: 'center', justifyContent: 'center' },
  successTitle:       { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, marginTop: Spacing.sm },
  successSub:         { fontSize: FontSize.sm, color: Colors.muted, fontFamily: 'SpaceMono' },
  txHashPill:         { backgroundColor: Colors.tag, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.sm, marginTop: Spacing.sm },
  txHashText:         { fontSize: FontSize.xs, color: Colors.solLight, fontFamily: 'SpaceMono' },
  doneBtn:            { marginTop: Spacing.xl, paddingHorizontal: 40, paddingVertical: 12, borderRadius: Radius.md, backgroundColor: Colors.sol },
  doneBtnText:        { fontSize: FontSize.base, fontWeight: '700', color: '#fff' },
});