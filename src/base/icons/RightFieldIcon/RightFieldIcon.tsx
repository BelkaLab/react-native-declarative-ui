import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
// import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../../styles/colors';

export interface IRightFieldIconProps {
  rightIcon: string;
  onRightIconClick?: () => void;
}

export default class RightFieldIcon extends Component<IRightFieldIconProps> {
  render() {
    return (
      <View
        // animation="zoomIn"
        // duration={150}
        // easing="ease-in"
        // useNativeDriver={true}
        style={styles.iconContainer}
      >
        <TouchableOpacity
          onPress={() => {
            if (this.props.onRightIconClick) {
              this.props.onRightIconClick();
            }
          }}
        >
          <View />
          {/* <MaterialIcon style={styles.icon} name={this.props.rightIcon} size={20} color={Colors.GRAY_500} /> */}
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
