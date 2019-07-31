import delay from 'lodash.delay';
import React, { Component, ComponentType } from 'react';
import { BackHandler, EmitterSubscription, Keyboard, NativeEventSubscription, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { Navigation } from 'react-native-navigation';
import Animated from 'react-native-reanimated';
import { default as BottomSheet, default as BottomSheetBehavior } from 'reanimated-bottom-sheet';
import { Colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';

export interface IRNNBottomOverlayProps {
  componentId: string;
  dismissOverlay: (onDismissedCallback?: () => void) => void;
  isScrollable?: boolean;
  canExtendFullScreen?: boolean;
  hasTextInput?: boolean;
  minHeight?: number;
}

interface IState {
  height: number;
  backgroundColor: string;
  onDismissedCallback?: () => void;
  snaps: Array<string | number>;
}

export const withRNNBottomOverlay = <P extends {}>(ChildComponent: ComponentType<P>) =>
  class WithRNNBottomOverlay extends Component<P & IRNNBottomOverlayProps, IState> {
    private backButtonSubscription?: NativeEventSubscription;
    private subscriptions!: EmitterSubscription[];
    private bottomSheet = React.createRef<BottomSheetBehavior>();
    private animationState: Animated.Value<number> = new Animated.Value(0);

    constructor(props: P & IRNNBottomOverlayProps) {
      super(props);

      this.state = {
        height: 0,
        backgroundColor: 'transparent',
        snaps: this.calcuateSnaps(props, 0)
      };
    }

    private calcuateSnaps = (props: P & IRNNBottomOverlayProps, currentHeight: number) => {
      if (props.minHeight && currentHeight <= props.minHeight) {
        currentHeight = props.minHeight;
      }

      if (props.hasTextInput) {
        return [0, '94%'];
      }

      if (props.canExtendFullScreen) {
        return [0, 150, '94%'];
      }

      return [0, currentHeight || 250];
    };

    componentWillMount() {
      this.subscriptions = [
        Keyboard.addListener('keyboardDidShow', this.keyboardDidShow),
        Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
      ];

      this.backButtonSubscription = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
      this.subscriptions.forEach(sub => sub.remove());

      if (this.backButtonSubscription) {
        this.backButtonSubscription.remove();
      }
    }

    keyboardDidShow = () => {
      if (this.bottomSheet.current) {
        // this.bottomSheet.current.snapTo(1);
      }
    };

    keyboardDidHide = () => {
      if (this.bottomSheet.current) {
        // this.bottomSheet.current.snapTo(1);
      }
    };

    handleBackButton = () => {
      this.dismissOverlay();
      return true;
    };

    private dismissOverlay = (onDismissedCallback?: () => void) => {
      this.setState({
        onDismissedCallback
      });

      if (this.bottomSheet.current) {
        this.bottomSheet.current.snapTo(0);
      }
    };

    render() {
      const { backgroundColor, snaps } = this.state;

      return (
        <View style={styles.root}>
          <Animated.Code
            exec={Animated.block([
              Animated.call([this.animationState], async ([animationStateValue]) => {
                // console.log(animationStateValue);

                if (animationStateValue >= 0 && this.state.backgroundColor === 'transparent') {
                  delay(
                    () =>
                      this.setState({
                        backgroundColor: Colors.TOTAL_BLACK
                      }),
                    1
                  );
                }
                // when animationState is equal to 1, sheet is to bottom (out of viewport)
                // we go for 0.97, because it's enough to trigger dismissOverlay and have a better interaction
                // if (animationStateValue >= 0.97) {
                if (animationStateValue === 1) {
                  try {
                    await Navigation.dismissOverlay(this.props.componentId);

                    if (this.state.onDismissedCallback) {
                      this.state.onDismissedCallback();
                    }
                  } catch (err) {
                    // Overlay already dismissed
                  }
                }
              })
            ])}
          />

          <TouchableWithoutFeedback
            style={styles.backgroundContainer}
            onPress={() => this.bottomSheet.current && this.bottomSheet.current.snapTo(0)}
          >
            <Animated.View
              style={[
                {
                  flex: 1,
                  backgroundColor,
                  opacity: Animated.sub(0.5, Animated.multiply(this.animationState, 0.9))
                }
              ]}
            />
          </TouchableWithoutFeedback>

          <BottomSheet
            ref={this.bottomSheet}
            callbackNode={this.animationState}
            snapPoints={snaps}
            enabledGestureInteraction={this.props.isScrollable}
            enabledInnerScrolling={false}
            renderContent={() => (
              <View
                onLayout={({ nativeEvent }) => {
                  if (this.state.height === 0) {
                    this.setState({
                      height: nativeEvent.layout.height,
                      snaps: this.calcuateSnaps(this.props, nativeEvent.layout.height)
                    });

                    if (this.bottomSheet.current) {
                      this.bottomSheet.current.snapTo(1);
                    }
                  }
                }}
              >
                <ChildComponent {...this.props as P} dismissOverlay={this.dismissOverlay} />
                {isIphoneX() && <View style={globalStyles.iPhoneXBottomView} />}
              </View>
            )}
            initialSnap={0}
          />
        </View>
      );
    }
  };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  backgroundContainer: { width: '100%', height: '100%' }
});
