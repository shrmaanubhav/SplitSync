import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  Animated,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Replaced Reanimated with RN Animated to avoid native module crash
import { getCurrentTheme } from '../services/theme.service';

// Export constants for consistent spacing across the app
// Total height calculation: vertical padding (10*2) + icon size (26) + indicator (4) + spacing = ~50
// With additional padding and border radius, actual height is ~70
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

    // Cleanup function to stop animations
    return () => {
      // Stop all animations when component unmounts
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
        // Restart pulsing for active tab
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
            { iterations: -1 } // Infinite loop
          ).start();
        });
      } else {
        // Stop pulsing for inactive tabs
        pulseAnimations[index].stopAnimation(() => {
          pulseAnimations[index].setValue(0);
        });
      }
    });

    // Cleanup function
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
        {/* Single persistent indicator that moves between tabs */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 4,
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.primary,
            transform: [
              {
                translateX: indicatorPosition.interpolate({
                  inputRange: [0, 1, 2, 3, 4],
                  outputRange: [0, 1, 2, 3, 4].map(i => i * 70), // 70px per tab spacing
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

            // Pulse effect for active tab
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
                // Add bounce animation when switching tabs
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
                      // Default icons based on route name
                      <>
                        {route.name === 'Dashboard' && (
                          <Icon
                            name={isFocused ? 'home' : 'home-outline'}
                            size={26}
                            color={
                              isFocused ? theme.primary : theme.textTertiary
                            }
                          />
                        )}
                        {route.name === 'Groups' && (
                          <Icon
                            name={
                              isFocused
                                ? 'account-multiple'
                                : 'account-multiple-outline'
                            }
                            size={26}
                            color={
                              isFocused ? theme.primary : theme.textTertiary
                            }
                          />
                        )}
                        {route.name === 'Expenses' && (
                          <Icon
                            name={
                              isFocused
                                ? 'currency-usd'
                                : 'currency-usd-outline'
                            }
                            size={26}
                            color={
                              isFocused ? theme.primary : theme.textTertiary
                            }
                          />
                        )}
                        {route.name === 'Balances' && (
                          <Icon
                            name={isFocused ? 'scale-balance' : 'scale-balance'}
                            size={26}
                            color={
                              isFocused ? theme.primary : theme.textTertiary
                            }
                          />
                        )}
                        {route.name === 'Profile' && (
                          <Icon
                            name={isFocused ? 'account' : 'account-outline'}
                            size={26}
                            color={
                              isFocused ? theme.primary : theme.textTertiary
                            }
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
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
    // Add border for better definition
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    position: 'relative', // Add relative positioning for absolute indicator
    overflow: 'visible', // Allow indicator to be visible outside padding
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
  indicator: {
    position: 'absolute',
    bottom: 4,
    width: 36,
    height: 4,
    borderRadius: 2,
  },
});

export default FloatingTabBar;
