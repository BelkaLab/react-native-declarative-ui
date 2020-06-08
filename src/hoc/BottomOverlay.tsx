import delay from 'lodash.delay';
import React, { FunctionComponent, useState, useEffect, useRef } from 'react';
import { BackHandler, Dimensions, EmitterSubscription, Image, Keyboard, LayoutChangeEvent, NativeEventSubscription, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { default as BottomSheet } from 'reanimated-bottom-sheet';
import { Colors } from '../styles/colors';
import { useNavigation, useRoute } from '@react-navigation/native';

export interface IBottomOverlayProps {
  dismissOverlay: (onDismissedCallback?: () => void) => void;
  canExtendFullScreen?: boolean;
  hasTextInput?: boolean;
  isBackDropMode?: boolean;
  disabledInteraction?: boolean;
  minHeight?: number;
  headerBackgroundColor?: string;
  headerHeight?: number;
  knobColor?: string;
  renderCustomBackground?: () => React.ReactElement<{}>;
}

type OverlayContent = {
  onListLayout?: (event: LayoutChangeEvent) => void;
};

export const withBottomOverlay = <P extends OverlayContent & IBottomOverlayProps>(ChildComponent: FunctionComponent<P>) => {
  const BottomOverlay: FunctionComponent<IBottomOverlayProps> = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const props: P = (route.params || {}) as P;
    const {
      hasTextInput,
      isBackDropMode,
      disabledInteraction,
    } = props;

    const calculateSnaps = (currentHeight: number) => {
      if (hasTextInput) {
        return isBackDropMode ? ['94%', 0, 0] : ['94%', 0];
      }

      // turn to backdrop mode
      if (currentHeight >= Dimensions.get('window').height * 0.94 - HEADER_HEIGHT) {
        return [Dimensions.get('window').height * 0.94, 350, 0];
      } else {
        return isBackDropMode
          ? [currentHeight + HEADER_HEIGHT || 350, currentHeight + HEADER_HEIGHT || 350, 0]
          : [currentHeight || 350, 0];
      }
    };

    const [height, setHeight] = useState<number>(0);
    const [snaps, setSnaps] = useState<Array<string | number>>(calculateSnaps(0));
    const [isHeightComputed, setIsHeightComputed] = useState<boolean>(!isBackDropMode);
    const [isContentEnoughBig, setIsContentEnoughBig] = useState<boolean>(false);
    const [onDismissedCallback, setOnDismissedCallback] = useState<() => void | undefined>();

    const [backButtonSubscription, setBackButtonSubscription] = useState<NativeEventSubscription | undefined>();
    const [subscriptions, setSubscriptions] = useState<EmitterSubscription[]>([]);
    const [timerId, setTimerId] = useState<number | undefined>();

    const { useCode, set, block, cond, debug, greaterOrEq, lessOrEq, call } = Animated;
    const bottomSheet = useRef<BottomSheet>();
    const isFirstOpening = new Animated.Value(-1);
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

    useEffect(() => {
      setSubscriptions([
        Keyboard.addListener('keyboardDidShow', keyboardDidShow),
        Keyboard.addListener('keyboardDidHide', keyboardDidHide)
      ]);

      setBackButtonSubscription(BackHandler.addEventListener('hardwareBackPress', handleBackButton));

      return () => {
        subscriptions.forEach(sub => !!sub && sub.remove());

        if (backButtonSubscription) {
          backButtonSubscription.remove();
        }
      }
    }, []);

    const keyboardDidShow = () => {
      if (bottomSheet.current) {
        // this.bottomSheet.current.snapTo(1);
      }
    };

    const keyboardDidHide = () => {
      if (bottomSheet.current) {
        // this.bottomSheet.current.snapTo(1);
      }
    };

    const handleBackButton = () => {
      dismissOverlay();
      return true;
    };

    const dismissOverlay = (onDismissedCallback?: () => void) => {
      setOnDismissedCallback(onDismissedCallback);

      delay(() => {
        if (bottomSheet.current) {
          bottomSheet.current!.snapTo(isBackDropMode ? 2 : 1);
        }
      }, 10);
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
      return isBackDropMode ? (
        <View>
          <ChildComponent
            {...props as P}
            dismissOverlay={dismissOverlay}
            onListLayout={({ nativeEvent }) => {
              if (!isHeightComputed) {
                if (timerId) {
                  clearTimeout(timerId);

                  setTimerId(undefined);
                }
                // we're already over max, so it's backdrop mode officially
                if (nativeEvent.layout.height >= Dimensions.get('window').height * 0.94 - HEADER_HEIGHT) {
                  setHeight(nativeEvent.layout.height);
                  setIsContentEnoughBig(true);
                  setIsHeightComputed(true);
                  setSnaps(calculateSnaps(nativeEvent.layout.height));

                  delay(() => {
                    if (bottomSheet.current) {
                      bottomSheet.current.snapTo(1);
                    }
                  }, 20);
                } else {
                  if (!isContentEnoughBig) {
                    setHeight(nativeEvent.layout.height);
                    setSnaps(calculateSnaps(nativeEvent.layout.height));

                    delay(() => {
                      setIsHeightComputed(true);

                      if (bottomSheet.current) {
                        bottomSheet.current.snapTo(1);
                      }
                    }, 200);
                  }
                }
              } else {
                setHeight(nativeEvent.layout.height);
              }
            }}
          />
        </View>
      ) : (
          <View
            onLayout={({ nativeEvent }) => {
              if (height === 0) {
                setHeight(nativeEvent.layout.height);
                setSnaps(calculateSnaps(nativeEvent.layout.height));
                delay(() => {
                  if (bottomSheet.current) {
                    bottomSheet.current.snapTo(0);
                  }
                }, 10);
              }
            }}
          >
            <ChildComponent {...props as P} dismissOverlay={dismissOverlay} />
          </View>
        );
    };

    return (
      <View style={styles.root}>
        <TouchableWithoutFeedback
          style={styles.backgroundContainer}
          onPress={() =>
            bottomSheet.current && bottomSheet.current.snapTo(isBackDropMode ? 2 : 1)
          }
        >
          <Animated.View
            style={[
              {
                flex: 1,
                backgroundColor: Colors.TOTAL_BLACK,
                opacity: Animated.sub(0.5, Animated.multiply(drawerCallbackNode, 0.9))
              }
            ]}
          />
        </TouchableWithoutFeedback>
        {!isHeightComputed && (
          <View style={{ position: 'absolute', bottom: -Dimensions.get('window').height * 10 }}>
            {renderContent()}
          </View>
        )}
        {isHeightComputed && (
          <BottomSheet
            ref={bottomSheet}
            callbackNode={drawerCallbackNode}
            snapPoints={snaps}
            enabledGestureInteraction={!disabledInteraction && isBackDropMode}
            enabledInnerScrolling={
              !disabledInteraction &&
              isBackDropMode &&
              height >= Dimensions.get('window').height * 0.94 - HEADER_HEIGHT
            }
            renderHeader={() => renderHeader()}
            renderContent={() => renderContent()}
            initialSnap={isBackDropMode ? 2 : 1}
          />
        )}
      </View>
    );
  };

  return BottomOverlay;
}

export const bottomSheetOptions = () => {
  return {
    gestureEnabled: false,
    animationEnabled: false,
    cardStyle: { backgroundColor: 'transparent' }
  };
};

const HEADER_HEIGHT = 28;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  backgroundContainer: { width: '100%', height: '100%' },
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
