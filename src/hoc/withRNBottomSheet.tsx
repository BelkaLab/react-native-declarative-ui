import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { BackHandler, Dimensions, Image, Keyboard, Platform, StyleProp, StyleSheet, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { isIphoneX } from 'react-native-iphone-x-helper';
import Animated from 'react-native-reanimated';
import { StackActions } from 'react-navigation';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import { default as BottomSheet } from 'reanimated-bottom-sheet';
import { Colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

const HEADER_HEIGHT = 28;

export interface IRNBottomSheetProps extends NavigationStackScreenProps {
  dismissOverlay: (onDismissedCallback?: () => void) => void;
  hasTextInput?: boolean;
  isBackDropMode?: boolean;
  disabledInteraction?: boolean;
  minHeight?: number;
  headerBackgroundColor?: string;
  headerHeight?: number;
  knobColor?: string;
  renderCustomBackground?: () => React.ReactElement<{}>;
  isScrollEnabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const withRNBottomSheet = <P extends IRNBottomSheetProps>(ChildComponent: FunctionComponent<P>) => {
  const RNBottomSheet: FunctionComponent<IRNBottomSheetProps> = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const props: P = (route.params || {}) as P;
    const {
      hasTextInput,
      containerStyle,
    } = props;

    const screenHeight = Dimensions.get('window').height;

    const calculateSnaps = (currentHeight: number) => {
      if (hasTextInput) {
        // return isBackDropMode ? ['94%', 0, 0] : ['94%', 0];
        return ['94%', 0];
      }

      // if (canExtendFullScreen) {
      //   return ['94%', 350, 0];
      // }

      // turn to backdrop mode
      if (currentHeight >= screenHeight * 0.94 - HEADER_HEIGHT) {
        return [screenHeight * 0.94, 350, 0];
      } else {
        // return isBackDropMode
        //   ? [currentHeight + HEADER_HEIGHT || 350, currentHeight + HEADER_HEIGHT || 350, 0]
        //   : [currentHeight || 350, 0];
        return [currentHeight || 350, 0];
      }
    };

    const [isHeightComputed, setHeightComputed] = useState(false);
    const [snaps, setSnaps] = useState(calculateSnaps(0));
    const [shouldDismissQuickly, setShouldDismissQuickly] = useState(false);
    // const [isFirstOpening, setFirstOpening] = useState(true);
    const [isFirstOpening] = useState(new Animated.Value(-1));
    const [isScrollEnabled, setScrollEnabled] = useState(true);
    const [onDismissedCallback, setOnDismissedCallback] = useState<() => void | undefined>();

    const { useCode, set, block, cond, debug, greaterOrEq, lessOrEq, call } = Animated;
    const bottomSheet = useRef<BottomSheet>();
    const drawerCallbackNode = React.useRef<any>(new Animated.Value(1)).current;
    const clampedDrawerCallbackNode = React.useRef<Animated.Adaptable<any>>(
      Animated.interpolate(drawerCallbackNode, {
        extrapolate: Animated.Extrapolate.CLAMP,
        inputRange: [0, 1],
        outputRange: [0, 1]
      })
    ).current;

    useCode(() => {
      return block([
        cond(lessOrEq(clampedDrawerCallbackNode, 0.99), set(isFirstOpening, 1)),
        cond(
          greaterOrEq(clampedDrawerCallbackNode, 1),
          cond(
            greaterOrEq(isFirstOpening, 1),
            call([], () => {
              navigation.goBack();
              // This is due to a bug in react-navigation https://github.com/react-navigation/react-navigation/issues/4867
              // completeTransition();

              if (onDismissedCallback) {
                onDismissedCallback();
              }
            })
          ),
          set(isFirstOpening, 1)
        )
      ]);
    }, []);

    //TODO Check if needed
    const completeTransition = () => {
      const parent = navigation.dangerouslyGetParent();

      if (parent) {
        navigation.dispatch(
          StackActions.completeTransition({
            key: parent.state.key,
            toChildKey: parent.state.routes[parent.state.index].key
          })
        );
      }
    };

    useEffect(() => {
      const subscriptions = [
        Keyboard.addListener(Platform.select({ android: 'keyboardDidShow', ios: 'keyboardWillShow' }), keyboardDidShow),
        Keyboard.addListener(Platform.select({ android: 'keyboardDidHide', ios: 'keyboardWillHide' }), keyboardDidHide)
      ];

      const backButtonSubscription = BackHandler.addEventListener('hardwareBackPress', handleBackButton);

      return () => {
        subscriptions?.forEach(sub => sub.remove());

        if (backButtonSubscription) {
          backButtonSubscription.remove();
        }
      };
    }, []);

    useEffect(() => {
      if (isHeightComputed) {
        bottomSheet.current?.snapTo(0);
      }
    }, [isHeightComputed]);

    useEffect(() => {
      if (shouldDismissQuickly) {
        bottomSheet.current?.snapTo(1);
      }
    }, [shouldDismissQuickly]);

    const keyboardDidShow = () => {
      if (hasTextInput) {
        bottomSheet.current?.snapTo(0);
      }
    };

    const keyboardDidHide = () => {
      if (hasTextInput) {
        bottomSheet.current?.snapTo(1);
      }
    };

    const handleBackButton = () => {
      dismissOverlay();
      return true;
    };

    const dismissOverlay = (onDismissedCallback?: () => void) => {
      setOnDismissedCallback(onDismissedCallback);
      setShouldDismissQuickly(true);
    };

    const enableScroll = () => {
      setScrollEnabled(true);
    };

    const disableScroll = () => {
      setScrollEnabled(false);
    };

    const renderHeader = () => {
      const {
        headerBackgroundColor = Colors.WHITE,
        headerHeight = HEADER_HEIGHT,
        knobColor = Colors.GRAY_400,
        renderCustomBackground
      } = props;

      if (renderCustomBackground) {
        return (
          <View style={styles.listHeaderCustomContainer}>
            <View style={styles.customBackgroundContainer}>{renderCustomBackground()}</View>
            <View style={{ width: 24, height: 24 }} />
            <View style={[styles.knob, { backgroundColor: knobColor }]} />
            <TouchableOpacity onPress={() => dismissOverlay()} style={styles.knobContainer}>
              <Image
                source={require('../assets/android_clear_input.png')}
                style={{ tintColor: Colors.PRIMARY_BLUE, width: 16, height: 16 }}
              />
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <View
          style={[
            styles.listHeaderContainer,
            {
              height: headerHeight,
              backgroundColor: headerBackgroundColor
            }
          ]}
        >
          <View style={[styles.knob, { backgroundColor: knobColor }]} />
        </View>
      );
    };

    const renderContent = () => {
      return (
        <View
          onLayout={({ nativeEvent }) => {
            if (!isHeightComputed) {
              setSnaps(calculateSnaps(nativeEvent.layout.height));
              setHeightComputed(true);
            }
          }}
        >
          <ChildComponent {...props} dismissOverlay={dismissOverlay} isScrollEnabled={isScrollEnabled} />
          {isIphoneX() && <View style={globalStyles.iPhoneXBottomView} />}
        </View>
      );
    };

    return (
      <View style={[styles.root, containerStyle]}>
        <TouchableWithoutFeedback
          style={styles.backgroundContainer}
          onPress={() => {
            dismissOverlay();
          }}
        >
          <Animated.View
            style={[
              {
                flex: 1,
                backgroundColor: Colors.TOTAL_BLACK,
                opacity: Animated.sub(0.7, Animated.multiply(drawerCallbackNode, 0.9))
              }
            ]}
          />
        </TouchableWithoutFeedback>
        {!isHeightComputed && (
          <View style={{ position: 'absolute', bottom: -screenHeight * 3 }}>{renderContent()}</View>
        )}
        {isHeightComputed && (
          <BottomSheet
            ref={bottomSheet}
            callbackNode={drawerCallbackNode}
            snapPoints={snaps}
            enabledGestureInteraction={props?.isScrollable}
            enabledInnerScrolling={Platform.OS === 'android'}
            renderHeader={() => renderHeader()}
            renderContent={() => renderContent()}
            initialSnap={1}
          />
        )}
      </View>
    );
  };

  return RNBottomSheet;
};

export const bottomSheetOptions = () => {
  return {
    gestureEnabled: false,
    animationEnabled: false,
    cardStyle: { backgroundColor: 'transparent' }
  };
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  backgroundContainer: { width: '100%', height: '100%', backgroundColor: 'transparent' },
  listHeaderContainer: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'center',
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 16
  },
  listHeaderCustomContainer: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12
  },
  customBackgroundContainer: {
    position: 'absolute',
    height: HEADER_HEIGHT,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  knobContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: Colors.WHITE,
    marginRight: 8,
    marginTop: 8
  },
  knob: { width: 32, height: 4, borderRadius: 4, backgroundColor: Colors.GRAY_400, marginTop: 8 }
});

export default withRNBottomSheet;
