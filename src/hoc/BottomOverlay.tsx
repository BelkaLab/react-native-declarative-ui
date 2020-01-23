import delay from 'lodash.delay';
import React, { Component, ComponentType } from 'react';
import { BackHandler, Dimensions, EmitterSubscription, Image, Keyboard, LayoutChangeEvent, NativeEventSubscription, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { StackActions } from 'react-navigation';
import { NavigationStackOptions, NavigationStackScreenProps } from 'react-navigation-stack';
import { default as BottomSheet, default as BottomSheetBehavior } from 'reanimated-bottom-sheet';
import { Colors } from '../styles/colors';

export interface IBottomOverlayProps extends NavigationStackScreenProps {
  dismissOverlay: (onDismissedCallback?: () => void) => void;
  canExtendFullScreen?: boolean;
  hasTextInput?: boolean;
  isBackDropMode?: boolean;
  disabledInteraction?: boolean;
  minHeight?: number;
  headerBackgroundColor?: string;
  renderCustomBackground?: () => React.ReactElement<{}>;
}

interface IState {
  height: number;
  isFirstOpening: boolean;
  snaps: Array<string | number>;
  isHeightComputed: boolean;
  isContentEnoughBig: boolean;
  onDismissedCallback?: () => void;
}

type OverlayContent = {
  onListLayout?: (event: LayoutChangeEvent) => void;
};

export const withBottomOverlay = <P extends OverlayContent & IBottomOverlayProps>(ChildComponent: ComponentType<P>) =>
  class WithBottomOverlay extends Component<P & IBottomOverlayProps, IState> {
    private backButtonSubscription?: NativeEventSubscription;
    private subscriptions!: EmitterSubscription[];
    private bottomSheet = React.createRef<BottomSheetBehavior>();
    private animationState: Animated.Value<number> = new Animated.Value(1);
    private timerId?: number;

    constructor(props: P & IBottomOverlayProps) {
      super(props);

      this.state = {
        height: 0,
        isFirstOpening: true,
        snaps: this.calcuateSnaps(props, 0),
        isContentEnoughBig: false,
        isHeightComputed: !props.isBackDropMode
      };
    }

    static navigationOptions = (): NavigationStackOptions => {
      return {
        gestureEnabled: false,
        animationEnabled: false,
        cardStyle: { backgroundColor: 'transparent' }
      };
    };

    completeTransition() {
      const { navigation } = this.props;
      const parent = navigation.dangerouslyGetParent();

      if (parent) {
        navigation.dispatch(
          StackActions.completeTransition({
            key: parent.state.key,
            toChildKey: parent.state.routes[parent.state.index].key
          })
        );
      }
    }

    private calcuateSnaps = (props: P & IBottomOverlayProps, currentHeight: number) => {
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

      delay(() => {
        if (this.bottomSheet.current) {
          this.bottomSheet.current!.snapTo(this.props.isBackDropMode ? 2 : 1);
        }
      }, 10);
    };

    render() {
      const { snaps } = this.state;

      return (
        <View style={styles.root}>
          <Animated.Code
            exec={Animated.block([
              Animated.call([this.animationState], async ([animationStateValue]) => {
                // console.log(this.state.isFirstOpening, this.state.height, animationStateValue);

                if (animationStateValue >= 0.99 && animationStateValue < 1 && !this.state.isFirstOpening) {
                  this.props.navigation.goBack();

                  this.completeTransition();

                  if (this.state.onDismissedCallback) {
                    this.state.onDismissedCallback();
                  }
                } else if (animationStateValue < 0.99 && this.state.isFirstOpening) {
                  this.setState({
                    isFirstOpening: false
                  });
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
                  backgroundColor: Colors.TOTAL_BLACK,
                  opacity: Animated.sub(0.5, Animated.multiply(this.animationState, 0.9))
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
              enabledGestureInteraction={!this.props.disabledInteraction && this.props.isBackDropMode}
              enabledInnerScrolling={
                !this.props.disabledInteraction &&
                this.props.isBackDropMode &&
                this.state.height >= Dimensions.get('window').height * 0.94 - HEADER_HEIGHT
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
        >
          <View style={styles.knob} />
        </View>
      );
    };

    private renderContent = () => {
      return this.props.isBackDropMode ? (
        <View>
          <ChildComponent
            {...this.props as P}
            dismissOverlay={this.dismissOverlay}
            onListLayout={({ nativeEvent }) => {
              if (!this.state.isHeightComputed) {
                if (this.timerId) {
                  clearTimeout(this.timerId);
                  this.timerId = undefined;
                }
                // we're already over max, so it's backdrop mode officially
                if (nativeEvent.layout.height >= Dimensions.get('window').height * 0.94 - HEADER_HEIGHT) {
                  this.setState({
                    height: nativeEvent.layout.height,
                    isContentEnoughBig: true,
                    isHeightComputed: true,
                    snaps: this.calcuateSnaps(this.props, nativeEvent.layout.height)
                  });

                  delay(() => {
                    if (this.bottomSheet.current) {
                      this.bottomSheet.current.snapTo(1);
                    }
                  }, 20);
                } else {
                  if (!this.state.isContentEnoughBig) {
                    this.setState({
                      height: nativeEvent.layout.height,
                      snaps: this.calcuateSnaps(this.props, nativeEvent.layout.height)
                    });

                    this.timerId = setTimeout(() => {
                      this.setState({
                        isHeightComputed: true
                      });

                      if (this.bottomSheet.current) {
                        this.bottomSheet.current.snapTo(1);
                      }
                    }, 200);
                  }
                }
              } else {
                this.setState({
                  height: nativeEvent.layout.height
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
              delay(() => {
                if (this.bottomSheet.current) {
                  this.bottomSheet.current.snapTo(0);
                }
              }, 10);
            }
          }}
        >
          <ChildComponent {...this.props as P} dismissOverlay={this.dismissOverlay} />
        </View>
      );
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
