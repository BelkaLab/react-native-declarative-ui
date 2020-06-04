import { useNavigation, useRoute } from '@react-navigation/native';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { BackHandler, Keyboard, Platform, StyleProp, StyleSheet, TouchableWithoutFeedback, View, ViewStyle, Dimensions } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import Animated from 'react-native-reanimated';
import { default as BottomSheet } from 'reanimated-bottom-sheet';
import { Colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import { NavigationStackScreenProps } from 'react-navigation-stack';
import { StackActions } from 'react-navigation';

const HEADER_HEIGHT = 28;

export interface IRNBottomSheetProps extends NavigationStackScreenProps {
  dismissOverlay: (onDismissedCallback?: () => void) => void;
  hasTextInput?: boolean;
  canExtendFullScreen?: boolean;
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
  const RNBottomSheet: FunctionComponent<IRNBottomSheetProps> = props => {
    const navigation = useNavigation();
    const route = useRoute();

    const screenHeight = Dimensions.get('window').height;

    const calculateSnaps = (props: IRNBottomSheetProps, currentHeight: number) => {
      if (props.hasTextInput) {
        // return this.props.isBackDropMode ? ['94%', 0, 0] : ['94%', 0];
        return ['94%', 350, 0];
      }

      // if (props.canExtendFullScreen) {
      //   return ['94%', 350, 0];
      // }

      // turn to backdrop mode
      if (currentHeight >= screenHeight * 0.94 - HEADER_HEIGHT) {
        return [screenHeight * 0.94, 350, 0];
      } else {
        // return this.props.isBackDropMode
        // ? [currentHeight + HEADER_HEIGHT || 350, currentHeight + HEADER_HEIGHT || 350, 0]
        // : [currentHeight || 350, 0];
        return [currentHeight || 350, 0];
      }
    };

    const { hasTextInput, containerStyle } = props;

    const [isHeightComputed, setHeightComputed] = useState(false);
    const [snaps, setSnaps] = useState(calculateSnaps(props, 0));
    const [shouldDismissQuickly, setShouldDismissQuickly] = useState(false);
    // const [isFirstOpening, setFirstOpening] = useState(true);
    const isFirstOpening = new Animated.Value(-1);
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
        bottomSheet.current?.snapTo(hasTextInput ? 1 : 0);
      }
    }, [isHeightComputed]);

    useEffect(() => {
      if (shouldDismissQuickly) {
        bottomSheet.current?.snapTo(hasTextInput ? 2 : 1);
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

    const renderContent = () => {
      return (
        <View
          onLayout={({ nativeEvent }) => {
            if (!isHeightComputed) {
              setSnaps(calculateSnaps(props, nativeEvent.layout.height));
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
            enabledGestureInteraction={route.params?.isScrollable}
            enabledInnerScrolling={Platform.OS === 'android'}
            renderContent={() => renderContent()}
            initialSnap={hasTextInput ? 2 : 1}
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
  backgroundContainer: { width: '100%', height: '100%', backgroundColor: 'transparent' }
});

export default withRNBottomSheet;
