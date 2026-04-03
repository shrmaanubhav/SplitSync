import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  Animated,
  Dimensions, // ✅ Added Dimensions
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getCurrentTheme } from '../services/theme.service';

export const FLOATING_TAB_BAR_HEIGHT = 70;
export const FLOATING_TAB_BAR_BOTTOM_MARGIN = 24;
export const FLOATING_TAB_BAR_VERTICAL_PADDING = 10;
export const FLOATING_TAB_BAR_BORDER_RADIUS = 28;

const FloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const theme = getCurrentTheme();
  const animatedValues = React.useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  // Animation for the entire tab bar appearing
  const tabBarOpacity = React.useRef(new Animated.Value(0)).current;
  const tabBarTranslateY = React.useRef(new Animated.Value(50)).current;

  // Pulse animation for active tab
  const pulseAnimations = React.useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  // Indicator position animation
  const indicatorPosition = React.useRef(new Animated.Value(0)).current;
  
  // ✅ EXACT PIXEL MATH FOR PERFECT ALIGNMENT
  const totalTabs = state.routes.length;
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const TAB_BAR_WIDTH = SCREEN_WIDTH * 0.94; // 94% width from styles
  const INNER_WIDTH = TAB_BAR_WIDTH - 32; // Minus paddingHorizontal (16 * 2)
  const TAB_WIDTH = INNER_WIDTH / totalTabs;
  const INDICATOR_WIDTH = 36;
  const INITIAL_LEFT = 16 + (TAB_WIDTH / 2) - (INDICATOR_WIDTH / 2);

  React.useEffect(() => {
    // Fade in and slide up the tab bar when component mounts
    Animated.parallel([
      Animated.timing(tabBarOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(tabBarTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animations for active tabs
    state.routes.forEach((_, index) => {
      if (state.index === index) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimations[index], {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnimations[index], {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    });

    return () => {
      state.routes.forEach((_, index) => {
        pulseAnimations[index].stopAnimation();
      });
    };
  }, []);

  React.useEffect(() => {
    // Animate indicator position when tab changes
    Animated.timing(indicatorPosition, {
      toValue: state.index,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Update pulse animations when tab changes
    state.routes.forEach((_, index) => {
      if (state.index === index) {
        pulseAnimations[index].stopAnimation(() => {
          Animated.loop(
            Animated.sequence([
              Animated.timing(pulseAnimations[index], {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(pulseAnimations[index], {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
            { iterations: -1 }
          ).start();
        });
      } else {
        pulseAnimations[index].stopAnimation(() => {
          pulseAnimations[index].setValue(0);
        });
      }
    });

    return () => {
      state.routes.forEach((_, index) => {
        pulseAnimations[index].removeAllListeners();
      });
    };
  }, [state.index]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: tabBarOpacity,
          transform: [{ translateY: tabBarTranslateY }],
        },
      ]}
    >
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.cardBackground,
            shadowColor: theme.shadow,
          },
        ]}
      >
        {/* ✅ FIXED INDICATOR WITH EXACT MATH */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 4,
            left: INITIAL_LEFT,
            width: INDICATOR_WIDTH,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.primary,
            transform: [
              {
                translateX: indicatorPosition.interpolate({
                  inputRange: state.routes.map((_, i) => i),
                  outputRange: state.routes.map((_, i) => i * TAB_WIDTH),
                }),
              },
            ],
          }}
        />

        <View style={{ flexDirection: 'row', width: '100%' }}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const scale = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.2],
            });
            const opacity = animatedValues[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0.6, 1],
            });

            const pulseScale = pulseAnimations[index].interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.05],
            });

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                Animated.sequence([
                  Animated.timing(animatedValues[index], {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                  }),
                  Animated.timing(animatedValues[index], {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true,
                  }),
                ]).start();

                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <View key={index} style={styles.tab}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.tabButton}
                >
                  <Animated.View
                    style={{
                      transform: [{ scale: isFocused ? pulseScale : scale }],
                      opacity,
                    }}
                  >
                    {options.tabBarIcon ? (
                      options.tabBarIcon({
                        focused: isFocused,
                        color: isFocused ? theme.primary : theme.textTertiary,
                        size: 26,
                      })
                    ) : (
                      <>
                        {route.name === 'Dashboard' && (
                          <Icon
                            name={isFocused ? 'home' : 'home-outline'}
                            size={26}
                            color={isFocused ? theme.primary : theme.textTertiary}
                          />
                        )}
                        {route.name === 'Groups' && (
                          <Icon
                            name={isFocused ? 'account-multiple' : 'account-multiple-outline'}
                            size={26}
                            color={isFocused ? theme.primary : theme.textTertiary}
                          />
                        )}
                        {route.name === 'Expenses' && (
                          <Icon
                            name={isFocused ? 'currency-usd' : 'currency-usd'}
                            size={26}
                            color={isFocused ? theme.primary : theme.textTertiary}
                          />
                        )}
                        {route.name === 'Balances' && (
                          <Icon
                            name={isFocused ? 'scale-balance' : 'scale-balance'}
                            size={26}
                            color={isFocused ? theme.primary : theme.textTertiary}
                          />
                        )}
                        {route.name === 'Profile' && (
                          <Icon
                            name={isFocused ? 'account' : 'account-outline'}
                            size={26}
                            color={isFocused ? theme.primary : theme.textTertiary}
                          />
                        )}
                      </>
                    )}
                  </Animated.View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: FLOATING_TAB_BAR_BOTTOM_MARGIN,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: FLOATING_TAB_BAR_BORDER_RADIUS,
    paddingVertical: FLOATING_TAB_BAR_VERTICAL_PADDING,
    paddingHorizontal: 16,
    width: '94%',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    position: 'relative', 
    overflow: 'visible', 
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 20,
  },
});

export default FloatingTabBar;