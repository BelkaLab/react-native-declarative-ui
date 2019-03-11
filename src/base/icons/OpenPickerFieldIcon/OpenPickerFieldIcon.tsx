import React, { Component } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export interface IOpenPickerFieldIconProps {
  onOpenPickerIconClicked: () => void;
}

export default class OpenPickerFieldIcon extends Component<IOpenPickerFieldIconProps> {
  render() {
    return (
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={this.props.onOpenPickerIconClicked}>
          <Image source={require('../../../assets/chevron_down.png')} />
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
