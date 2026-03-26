import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';
import {
  PanGestureHandler,
  GestureHandlerRootView,
  State,
} from 'react-native-gesture-handler';
import { useStore } from '../store/useStore';
import { currencyService } from '../services/currency.service';
import { getCurrentTheme } from '../services/theme.service';

interface Currency {
  _id: string;
  code: string;
  name: string;
  symbol: string;
  createdAt: string;
  updatedAt: string;
}

const CurrencySelector: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (currency: Currency) => void;
  selectedCurrency: string;
}> = ({ visible, onClose, onSelect, selectedCurrency }) => {
  const screenHeight = Dimensions.get('window').height;
  const panY = useRef(new Animated.Value(screenHeight)).current;
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const { darkMode } = useStore();
  const theme = getCurrentTheme();

  // Load currencies from backend
  useEffect(() => {
    const loadCurrencies = async () => {
      if (visible) {
        try {
          const currencyData = await currencyService.loadCurrencies();
          setCurrencies(currencyData);
        } catch (error) {
          console.error('Error loading currencies:', error);
        }
      }
    };

    loadCurrencies();
  }, [visible]);

  // Filter currencies based on search query
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) return currencies;

    const query = searchQuery.toLowerCase();
    return currencies.filter(
      currency =>
        currency.code.toLowerCase().includes(query) ||
        currency.name.toLowerCase().includes(query) ||
        currency.symbol.toLowerCase().includes(query)
    );
  }, [searchQuery, currencies]);

  const renderCurrencyItem = ({ item }: { item: Currency }) => (
    <TouchableOpacity
      style={[
        styles.currencyItem,
        {
          backgroundColor: theme.cardBackground,
          borderBottomColor: theme.border,
        },
        selectedCurrency === item.code && styles.selectedCurrencyItem,
      ]}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <Text style={[styles.currencyCode, { color: theme.textPrimary }]}>
        {item.code}
      </Text>
      <Text style={[styles.currencyName, { color: theme.textSecondary }]}>
        {item.name}
      </Text>
      <Text style={[styles.currencySymbol, { color: theme.textPrimary }]}>
        {item.symbol}
      </Text>
    </TouchableOpacity>
  );

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { absoluteY: panY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { velocityY, absoluteY } = event.nativeEvent;

      // If dragging up with enough velocity or position, expand
      if (velocityY < -500 || absoluteY < screenHeight * 0.3) {
        setIsExpanded(true);
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
      // If dragging down with enough velocity or position, collapse
      else if (velocityY > 500 || absoluteY > screenHeight * 0.6) {
        setIsExpanded(false);
        Animated.spring(panY, {
          toValue: screenHeight * 0.5,
          useNativeDriver: false,
        }).start();
      }
      // Otherwise, snap back to current state
      else {
        Animated.spring(panY, {
          toValue: isExpanded ? 0 : screenHeight * 0.5,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  // Animate the modal when visibility changes
  useEffect(() => {
    if (visible) {
      // Start from bottom (off-screen) and animate to half screen position
      panY.setValue(screenHeight);
      Animated.spring(panY, {
        toValue: screenHeight * 0.5,
        useNativeDriver: false,
        speed: 10,
      }).start();
    } else {
      // Animate to bottom (off-screen) when closing
      Animated.spring(panY, {
        toValue: screenHeight,
        useNativeDriver: false,
        speed: 10,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.shadow }]}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
            minDist={10}
          >
            <Animated.View
              style={[
                styles.modalContent,
                {
                  height: screenHeight,
                  backgroundColor: theme.cardBackground,
                  transform: [{ translateY: panY }],
                },
              ]}
            >
              <View
                style={[styles.header, { borderBottomColor: theme.border }]}
              >
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                  Select Currency
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Text style={[styles.closeButton, { color: theme.primary }]}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.dragIndicator,
                  { backgroundColor: theme.textTertiary },
                ]}
              />

              {/* Search Bar */}
              <View
                style={[
                  styles.searchContainer,
                  { borderBottomColor: theme.border },
                ]}
              >
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: darkMode
                        ? theme.headerBackground
                        : theme.cardBackground,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                    },
                  ]}
                  placeholder="Search currencies..."
                  placeholderTextColor={theme.textTertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <FlatList
                data={filteredCurrencies}
                renderItem={renderCurrencyItem}
                keyExtractor={item => item._id}
                style={styles.currencyList}
                contentContainerStyle={styles.currencyListContent}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text
                      style={[styles.emptyText, { color: theme.textSecondary }]}
                    >
                      No currencies found
                    </Text>
                    <Text
                      style={[styles.emptyText, { color: theme.textSecondary }]}
                    >
                      Try a different search term
                    </Text>
                  </View>
                }
                showsVerticalScrollIndicator={true}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                ListFooterComponent={<View style={{ height: 20 }} />}
                // These props help with gesture conflict resolution
                scrollEventThrottle={16}
                bounces={false}
              />
            </Animated.View>
          </PanGestureHandler>
        </GestureHandlerRootView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 10,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  currencyList: {
    flex: 1,
  },
  currencyListContent: {
    paddingBottom: 20,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  selectedCurrencyItem: {
    backgroundColor: 'rgba(255, 140, 102, 0.1)', // Light orange background for selected item
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  currencyName: {
    fontSize: 16,
  },
  currencySymbol: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default CurrencySelector;
