import React, { Component } from 'react';
import { Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

export interface IRightFieldIconProps {
  rightIcon: string;
  onRightIconClick?: () => void;
}

export default class RightFieldIcon extends Component<IRightFieldIconProps> {
  render() {
    return (
      <View style={styles.iconContainer}>
        <TouchableOpacity
          onPress={() => {
            if (this.props.onRightIconClick) {
              this.props.onRightIconClick();
            }
          }}
        >
          <Image
            source={Platform.select({
              ios: require('../../../assets/ios_clear_input.png'),
              android: require('../../../assets/android_clear_input.png')
            })}
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'absolute',
    right: 10,
    backgroundColor: 'transparent'
  },
  icon: {
    padding: 6
  }
});
