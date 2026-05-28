import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { StoreItem } from '../types';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';
import { TokenSymbol } from '../constants';

interface Props {
  item: StoreItem;
  onPress: (item: StoreItem) => void;
}

const TOKEN_COLORS: Record<TokenSymbol, { bg: string; text: string }> = {
  SOL:       { bg: 'rgba(153,69,255,0.15)', text: Colors.solLight },
  USDC:      { bg: 'rgba(39,117,202,0.15)', text: '#5BA4E6' },
  BONK:      { bg: 'rgba(255,160,0,0.15)',  text: Colors.bonk },
  SKR: { bg: 'rgba(20,241,149,0.12)', text: Colors.green },
};

export function StoreItemCard({ item, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, !item.inStock && styles.outOfStock]}
      onPress={() => item.inStock && onPress(item)}
      activeOpacity={0.75}
    >
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.seller}>@{item.seller.replace('.skr', '')}</Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>${item.priceUsdc.toFixed(2)}</Text>
        <Text style={styles.priceUnit}>USDC</Text>
      </View>

      {!item.inStock && (
        <View style={styles.soldOutBadge}>
          <Text style={styles.soldOutText}>Sold out</Text>
        </View>
      )}

      <View style={styles.tokenRow}>
        {item.acceptedTokens.slice(0, 3).map((t) => (
          <View
            key={t}
            style={[styles.tokenTag, { backgroundColor: TOKEN_COLORS[t].bg }]}
          >
            <Text style={[styles.tokenTagText, { color: TOKEN_COLORS[t].text }]}>
              {t === 'SKR' ? 'SKR' : t}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    flex: 1,
  },
  outOfStock: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 3,
    lineHeight: 18,
  },
  seller: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    fontFamily: 'SpaceMono',
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  price: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.green,
  },
  priceUnit: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    fontFamily: 'SpaceMono',
  },
  tokenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: Spacing.sm,
  },
  tokenTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  tokenTagText: {
    fontSize: 9,
    fontFamily: 'SpaceMono',
    fontWeight: '500',
  },
  soldOutBadge: {
    marginTop: Spacing.xs,
    backgroundColor: 'rgba(255,87,87,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  soldOutText: {
    fontSize: 9,
    color: Colors.danger,
    fontFamily: 'SpaceMono',
  },
});
