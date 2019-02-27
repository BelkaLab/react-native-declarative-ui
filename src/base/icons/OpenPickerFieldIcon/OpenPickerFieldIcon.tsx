import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
// import FeatherIcon from 'react-native-vector-icons/Feather';
import { Colors } from '../../../styles/colors';

export interface IOpenPickerFieldIconProps {
  onOpenPickerIconClicked: () => void;
}

export default class OpenPickerFieldIcon extends Component<IOpenPickerFieldIconProps> {
  render() {
    return (
      <View
        // animation="zoomIn"
        // duration={150}
        // easing="ease-in"
        // useNativeDriver={true}
        style={styles.iconContainer}
      >
        <TouchableOpacity onPress={this.props.onOpenPickerIconClicked}>
          <View />
          {/* <FeatherIcon style={styles.icon} name="chevron-down" size={24} color={Colors.GRAY_600} /> */}
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'absolute',
    right: 2,
    backgroundColor: 'transparent'
  },
  icon: {
    padding: 6
  }
});
