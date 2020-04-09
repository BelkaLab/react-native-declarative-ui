import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { CheckBox } from '../../base/CheckBox';
import { ICheckBoxProps } from '../../base/CheckBox/CheckBox';
import { Colors } from '../../styles/colors';

// export type CheckBoxTypeComponent = React.Component<ICheckBoxFieldProps, React.ComponentState> & CheckBoxStatic;

export interface ICheckBoxFieldProps extends ICheckBoxProps {
  onRef?: (input: CheckBox | null) => void;
  containerStyle?: StyleProp<ViewStyle>;
  error?: string | undefined;
  disableErrorMessage?: boolean;
  color?: string;
}

export default class CheckBoxField extends React.Component<ICheckBoxFieldProps, React.ComponentState> {
  render() {
    const {
      containerStyle,
      onRef,
      error,
      disableErrorMessage,
      color = Colors.SECONDARY_BLUE,
      ...rest
    } = this.props;

    return (
      <View style={[containerStyle, styles.containerStyle]}>
        <CheckBox {...rest} checkBoxColor={color} ref={input => onRef && onRef(input)} />
        {Boolean(error) && !disableErrorMessage && <Text style={styles.errorMessage}>{error}</Text>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {},
  errorMessage: {
    color: 'red',
    fontSize: 12,
    marginTop: 8,
    marginStart: 4
  }
});
