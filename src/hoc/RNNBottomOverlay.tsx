import delay from 'lodash.delay';
import React, { Component, ComponentType } from 'react';
import { BackHandler, Dimensions, EmitterSubscription, Image, Keyboard, LayoutChangeEvent, NativeEventSubscription, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Navigation } from 'react-native-navigation';
import Animated from 'react-native-reanimated';
import { default as BottomSheet, default as BottomSheetBehavior } from 'reanimated-bottom-sheet';
import { Colors } from '../styles/colors';

export interface IRNNBottomOverlayProps {
  componentId: string;
  dismissOverlay: (onDismissedCallback?: () => void) => void;
  canExtendFullScreen?: boolean;
  hasTextInput?: boolean;
  isBackDropMode?: boolean;
  minHeight?: number;
  headerBackgroundColor?: string;
  renderCustomBackground?: () => React.ReactElement<{}>;
}

interface IState {
  height: number;
  backgroundColor: string;
  onDismissedCallback?: () => void;
  snaps: Array<string | number>;
  isHeightComputed: boolean;
}

type OverlayContent = {
  onListLayout?: (event: LayoutChangeEvent) => void;
};

export const withRNNBottomOverlay = <P extends OverlayContent & IRNNBottomOverlayProps>(
  ChildComponent: ComponentType<P>
) =>
  class WithRNNBottomOverlay extends Component<P & IRNNBottomOverlayProps, IState> {
    private backButtonSubscription?: NativeEventSubscription;
    private subscriptions!: EmitterSubscription[];
    private bottomSheet = React.createRef<BottomSheetBehavior>();
    private animationState: Animated.Value<number> = new Animated.Value(0);
    private timerId?: number;

    constructor(props: P & IRNNBottomOverlayProps) {
      super(props);

      this.state = {
        height: 0,
        backgroundColor: 'transparent',
        snaps: this.calcuateSnaps(props, 0),
        isHeightComputed: !props.isBackDropMode
      };
    }

    private calcuateSnaps = (props: P & IRNNBottomOverlayProps, currentHeight: number) => {
      // if (props.minHeight && currentHeight <= props.minHeight) {
      //   currentHeight = props.minHeight;
      // }

      if (props.hasTextInput) {
        return this.props.isBackDropMode ? ['94%', 0, 0] : ['94%', 0];
      }

      if (props.canExtendFullScreen) {
        return ['94%', 350, 0];
      }

      // turn to backdrop mode
      if (currentHeight >= Dimensions.get('window').height * 0.94 - HEADER_HEIGHT) {
        return [Dimensions.get('window').height * 0.94, 350, 0];
      } else {
        return this.props.isBackDropMode
          ? [currentHeight + HEADER_HEIGHT || 350, currentHeight + HEADER_HEIGHT || 350, 0]
          : [currentHeight || 350, 0];
      }
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
        this.bottomSheet.current.snapTo(this.props.isBackDropMode ? 2 : 1);
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
            onPress={() =>
              this.bottomSheet.current && this.bottomSheet.current.snapTo(this.props.isBackDropMode ? 2 : 1)
            }
          >
            <Animated.View
              style={[
                {
                  flex: 1,
                  backgroundColor,
                  opacity: Animated.sub(0.6, Animated.multiply(this.animationState, 0.9))
                }
              ]}
            />
          </TouchableWithoutFeedback>
          {!this.state.isHeightComputed && (
            <View style={{ position: 'absolute', bottom: -Dimensions.get('window').height * 10 }}>
              {this.renderContent()}
            </View>
          )}
          {this.state.isHeightComputed && (
            <BottomSheet
              ref={this.bottomSheet}
              callbackNode={this.animationState}
              snapPoints={snaps}
              enabledGestureInteraction={this.props.isBackDropMode}
              enabledInnerScrolling={
                this.props.isBackDropMode && this.state.height >= Dimensions.get('window').height * 0.94 - HEADER_HEIGHT
              }
              renderHeader={() => this.renderHeader()}
              renderContent={() => this.renderContent()}
              initialSnap={this.props.isBackDropMode ? 2 : 1}
            />
          )}
        </View>
      );
    }

    private renderHeader = () => {
      const { headerBackgroundColor, renderCustomBackground } = this.props;

      if (renderCustomBackground) {
        return (
          <View style={styles.listHeaderCustomContainer}>
            <View style={styles.customBackgroundContainer}>{renderCustomBackground()}</View>
            <View style={{ width: 24, height: 24 }} />
            <View style={styles.knob} />
            <TouchableOpacity onPress={() => this.dismissOverlay()} style={styles.knobContainer}>
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
              backgroundColor: headerBackgroundColor || Colors.WHITE
            }
          ]}
        />
      );
    };

    private renderContent = () => {
      return this.props.isBackDropMode ? (
        <View>
          <ChildComponent
            {...this.props as P}
            dismissOverlay={this.dismissOverlay}
            onListLayout={({ nativeEvent }) => {
              if (this.timerId) {
                clearTimeout(this.timerId);

                this.timerId = delay(() => {
                  this.handleBackdropUpdate();
                }, 100);
              } else {
                this.timerId = delay(() => {
                  this.handleBackdropUpdate();
                }, 100);
              }

              if (nativeEvent.layout.height > this.state.height) {
                this.setState({
                  height: nativeEvent.layout.height,
                  snaps: this.calcuateSnaps(this.props, nativeEvent.layout.height)
                });
              }
            }}
          />
        </View>
      ) : (
        <View
          onLayout={({ nativeEvent }) => {
            if (this.state.height === 0) {
              this.setState({
                height: nativeEvent.layout.height,
                snaps: this.calcuateSnaps(this.props, nativeEvent.layout.height)
              });
              if (this.bottomSheet.current) {
                this.bottomSheet.current.snapTo(0);
              }

              delay(() => {
                this.setState({
                  backgroundColor: Colors.TOTAL_BLACK
                });
              }, 20);
            }
          }}
        >
          <ChildComponent {...this.props as P} dismissOverlay={this.dismissOverlay} />
        </View>
      );
    };

    private handleBackdropUpdate = () => {
      this.setState({
        isHeightComputed: true
      });

      if (this.bottomSheet.current) {
        this.bottomSheet.current.snapTo(1);
      }

      delay(() => {
        this.setState({ backgroundColor: Colors.TOTAL_BLACK });
      }, 20);
    };
  };

const HEADER_HEIGHT = 40;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  backgroundContainer: { width: '100%', height: '100%' },
  listHeaderContainer: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  knob: { width: 32, height: 4, borderRadius: 4, backgroundColor: Colors.WHITE, marginTop: 8 }
});
