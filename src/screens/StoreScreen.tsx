import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, SafeAreaView,
} from 'react-native';
import { useCheckoutStore } from '../store';
import { WalletBar } from '../components/WalletBar';
import { StoreItemCard } from '../components/StoreItemCard';
import { FeaturedBanner } from '../components/FeaturedBanner';
import { CheckoutSheet } from '../components/CheckoutSheet';
import { STORE_ITEMS } from '../constants/catalogue';
import { StoreItem, ItemCategory } from '../types';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';

const CATEGORIES: Array<{ label: string; value: ItemCategory | 'all' }> = [
  { label: 'All',       value: 'all' },
  { label: 'Food',      value: 'food' },
  { label: 'Crafts',    value: 'crafts' },
  { label: 'Services',  value: 'services' },
  { label: 'Community', value: 'community' },
];

export function StoreScreen() {
  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'all'>('all');
  const { openCheckout } = useCheckoutStore();

  const featured = STORE_ITEMS.find((i) => i.tags.includes('featured') && i.inStock)!;

  const filteredItems = useMemo(() =>
    STORE_ITEMS.filter(
      (i) => !i.tags.includes('featured') &&
             (activeCategory === 'all' || i.category === activeCategory),
    ),
    [activeCategory],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <WalletBar />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Store header */}
            <View style={styles.storeHeader}>
              <Text style={styles.storeTitle}>Lagos Web3 Market</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>

            {/* Category tabs */}
            <FlatList
              horizontal
              data={CATEGORIES}
              keyExtractor={(c) => c.value}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabs}
              renderItem={({ item: cat }) => (
                <TouchableOpacity
                  style={[styles.tab, activeCategory === cat.value && styles.tabActive]}
                  onPress={() => setActiveCategory(cat.value)}
                >
                  <Text
                    style={[styles.tabText, activeCategory === cat.value && styles.tabTextActive]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* Featured item */}
            {activeCategory === 'all' && (
              <FeaturedBanner item={featured} onBuy={openCheckout} />
            )}

            <Text style={styles.sectionLabel}>
              {activeCategory === 'all' ? 'All Items' : CATEGORIES.find(c => c.value === activeCategory)?.label}
              {'  '}
              <Text style={styles.sectionCount}>{filteredItems.length} listings</Text>
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <StoreItemCard item={item} onPress={openCheckout} />
          </View>
        )}
      />

      <CheckoutSheet />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  storeTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(20,241,149,0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(20,241,149,0.2)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.green,
  },
  liveText: {
    fontSize: FontSize.xs,
    fontFamily: 'SpaceMono',
    color: Colors.green,
  },
  tabs: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.sol,
    borderColor: Colors.sol,
  },
  tabText: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },
  sectionLabel: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sectionCount: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    fontWeight: '400',
    fontFamily: 'SpaceMono',
  },
  listContent: {
    paddingBottom: 100,
  },
  row: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardWrapper: {
    flex: 1,
  },
});
