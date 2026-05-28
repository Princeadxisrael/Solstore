import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthorization } from '../hooks/useAuthorization';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';

function truncate(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export function WalletBar() {
  const { account, connect, disconnect } = useAuthorization();

  return (
    <View style={styles.container}>
      {account ? (
        <>
          <View style={styles.addressPill}>
            <View style={styles.dot} />
            <Text style={styles.addressText}>
              {truncate(account.publicKey.toBase58())}
            </Text>
          </View>
          <TouchableOpacity onPress={disconnect} style={styles.disconnectBtn}>
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity onPress={connect} style={styles.connectBtn}>
          <Text style={styles.connectText}>Connect Wallet</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bg,
  },
  addressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.tag,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.green,
  },
  addressText: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    fontFamily: 'SpaceMono',
  },
  disconnectBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disconnectText: {
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  connectBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.sol,
  },
  connectText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: '#fff',
  },
});
