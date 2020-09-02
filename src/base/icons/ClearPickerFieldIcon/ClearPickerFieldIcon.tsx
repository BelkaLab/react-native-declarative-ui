import React, { Component } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export interface IClearPickerFieldIconProps {
  onClearPickerIconClicked: () => void;
}

export default class ClearPickerFieldIcon extends Component<IClearPickerFieldIconProps> {
  render() {
    return (
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={this.props.onClearPickerIconClicked}>
          <Image source={require('../../../assets/android_clear_input.png')} />
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
