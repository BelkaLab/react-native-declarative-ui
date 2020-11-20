import React, { Component } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export interface IClearPickerFieldIconProps {
  onClearPickerIconClicked: () => void;
  disabled?: boolean;
}

export default class ClearPickerFieldIcon extends Component<IClearPickerFieldIconProps> {
  render() {
    const {
      onClearPickerIconClicked,
      disabled = false
    } = this.props;

    return (
      <View style={styles.iconContainer}>
        <TouchableOpacity disabled={disabled} onPress={onClearPickerIconClicked}>
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
