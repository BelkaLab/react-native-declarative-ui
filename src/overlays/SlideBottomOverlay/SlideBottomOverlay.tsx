import React, { Component } from 'react';
import { Animated, Dimensions, Easing, PanResponder, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { ComponentEvent, Navigation } from 'react-native-navigation';
import { Colors } from '../../styles/colors';

const deviceHeight = Dimensions.get('window').height;
const ANIM_DURATION = 200;

interface ISlideBottomOverlayProps extends ComponentEvent {
  renderOverlayComponent: (dismissOverlay: () => void) => React.ReactElement<{}>;
}

interface IState {
  overlayHeight: number;
  overlaySlide: Animated.Value;
  backgroundOpacity: Animated.Value;
}

export default class SlideBottomOverlay extends Component<ISlideBottomOverlayProps, IState> {
  constructor(props: ISlideBottomOverlayProps) {
    super(props);

    this.state = {
      overlayHeight: 0,
      overlaySlide: new Animated.Value(deviceHeight),
      backgroundOpacity: new Animated.Value(0)
    };
  }

  private dismissOverlay = () => {
    Animated.parallel([
      Animated.timing(this.state.overlaySlide, {
        toValue: this.state.overlayHeight,
        duration: ANIM_DURATION,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.timing(this.state.backgroundOpacity, {
        toValue: 0,
        duration: ANIM_DURATION,
        useNativeDriver: false
      })
    ]).start(() => {
      Navigation.dismissOverlay(this.props.componentId);
    });
  };

  render() {
    return (
      <TouchableWithoutFeedback style={{ flex: 1 }} onPress={this.dismissOverlay}>
        <Animated.View
          style={[
            styles.backgroundContainer,
            {
              backgroundColor: this.state.backgroundOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: ['transparent', Colors.OVERLAY_OPACITY]
              })
            }
          ]}
        >
          <Animated.View
            style={{
              transform: [{ translateY: this.state.overlaySlide }]
            }}
            {...PanResponder.create({
              onStartShouldSetPanResponder: () => true
            }).panHandlers}
          >
            <TouchableWithoutFeedback
              onLayout={({ nativeEvent }) => {
                if (this.state.overlayHeight === 0) {
                  this.setState({ overlayHeight: nativeEvent.layout.height });
                  this.state.overlaySlide.setValue(nativeEvent.layout.height);

                  Animated.parallel([
                    Animated.timing(this.state.overlaySlide, {
                      toValue: 0,
                      duration: ANIM_DURATION,
                      easing: Easing.ease,
                      useNativeDriver: true
                    }),
                    Animated.timing(this.state.backgroundOpacity, {
                      toValue: 1,
                      duration: ANIM_DURATION,
                      useNativeDriver: false
                    })
                  ]).start();
                }
              }}
            >
              <View style={styles.overlayContainer}>{this.props.renderOverlayComponent(this.dismissOverlay)}</View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    backgroundColor: 'transparent'
  },
  overlayContainer: {
    overflow: 'hidden',
    maxHeight: deviceHeight * 0.8,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8
  }
});
