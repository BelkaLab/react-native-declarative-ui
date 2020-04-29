import React, { Component } from 'react';
import { StyleProp, StyleSheet, Switch, SwitchProperties, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../styles/colors';

export interface IToggleFieldProps extends SwitchProperties {
  onRef?: (input: Switch) => void;
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
  disableSeparator?: boolean;
  renderCustomLabel?: (label: string) => React.ReactElement<{}>;
  trackColor?: {
    false: string;
    true: string;
  }
}

export default class ToggleField extends Component<IToggleFieldProps, React.ComponentState> {
  render() {
    const {
      disableSeparator,
      onRef,
      label,
      containerStyle,
      renderCustomLabel,
      trackColor = { true: Colors.PRIMARY_BLUE, false: Colors.GRAY_100 },
      ...rest
    } = this.props;

    return (
      <View style={this.props.containerStyle ? this.props.containerStyle : styles.containerStyle}>
        <View style={styles.group}>
          {!!renderCustomLabel ? renderCustomLabel(label) : <Text>{label}</Text>}
          <Switch
            {...rest}
            ref={input => input && this.props.onRef && this.props.onRef(input)}
            trackColor={trackColor}
          />
        </View>
        {!disableSeparator && <View style={styles.separator} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {},
  group: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.GRAY_200
  }
});
