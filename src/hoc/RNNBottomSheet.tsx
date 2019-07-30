import delay from 'lodash.delay';
import React, { Component, ComponentType } from 'react';
import { BackHandler, NativeEventSubscription, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import Animated from 'react-native-reanimated';
import { default as BottomSheet, default as BottomSheetBehavior } from 'reanimated-bottom-sheet';
import { Colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import { requireWrapper } from '../utils/helper';

export interface IRNNBottomSheetProps {
  componentId: string;
  dismissOverlay: (onDismissedCallback?: () => void) => void;
  isScrollable?: boolean;
}

interface IState {
  height: number;
  backgroundColor: string;
  onDismissedCallback?: () => void;
}

export const withRNNBottomSheet = <P extends {}>(ChildComponent: ComponentType<P>) =>
  class WithRNNBottomSheet extends Component<P & IRNNBottomSheetProps, IState> {
    private backButtonSubscription?: NativeEventSubscription;
    private bottomSheet = React.createRef<BottomSheetBehavior>();
    private animationState: Animated.Value<number> = new Animated.Value(0);

    constructor(props: P & IRNNBottomSheetProps) {
      super(props);

      this.state = {
        height: 0,
        backgroundColor: 'transparent'
      };
    }

    componentDidMount() {
      this.backButtonSubscription = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
      if (this.backButtonSubscription) {
        this.backButtonSubscription.remove();
      }
    }

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
      const { backgroundColor, height } = this.state;

      return (
        <View style={styles.root}>
          <Animated.Code
            exec={Animated.block([
              Animated.call([this.animationState], async ([animationStateValue]) => {
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
                if (animationStateValue >= 0.97) {
                  try {
                    const Navigation = requireWrapper('react-native-navigation');
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
            // Add check for bigger components
            snapPoints={[0, height || 100]}
            enabledGestureInteraction={this.props.isScrollable}
            enabledInnerScrolling={false}
            renderContent={() => (
              <View
                onLayout={({ nativeEvent }) => {
                  this.setState({
                    height: nativeEvent.layout.height
                  });

                  if (this.bottomSheet.current) {
                    this.bottomSheet.current.snapTo(1);
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
