import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StoreItem } from '../types';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';

interface Props {
  item: StoreItem;
  onBuy: (item: StoreItem) => void;
}

export function FeaturedBanner({ item, onBuy }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.tag}>✦ FEATURED DROP</Text>
      <View style={styles.row}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <View>
          <Text style={styles.price}>${item.priceUsdc.toFixed(2)}</Text>
          <Text style={styles.priceSub}>≈ {item.acceptedTokens.join(' · ')}</Text>
        </View>
        <TouchableOpacity style={styles.buyBtn} onPress={() => onBuy(item)} activeOpacity={0.8}>
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: '#1A0A30',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(153,69,255,0.25)',
  },
  tag: {
    fontSize: FontSize.xs,
    fontFamily: 'SpaceMono',
    color: Colors.solLight,
    marginBottom: Spacing.sm,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  emoji: {
    fontSize: 40,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  desc: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    lineHeight: 18,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.green,
  },
  priceSub: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    fontFamily: 'SpaceMono',
    marginTop: 2,
  },
  buyBtn: {
    backgroundColor: Colors.sol,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  buyBtnText: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: '#fff',
  },
});
