import React, { PureComponent } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '../../../styles/colors';

export default class LoaderIcon extends PureComponent {
  render() {
    return (
      <View style={styles.iconContainer}>
        <ActivityIndicator size="small" color={Colors.PRIMARY_BLUE} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'absolute',
    right: 10,
    backgroundColor: 'transparent',
    padding: 6
  }
});
