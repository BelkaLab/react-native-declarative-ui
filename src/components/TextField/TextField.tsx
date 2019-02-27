import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, TextInputProperties, View, ViewStyle } from 'react-native';
import { FloatingLabel, TextInputInstance } from '../../base/FloatingLabel';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

export interface ITextFieldProps extends TextInputProperties {
  onRef?: (input: TextInputInstance) => void;
  label: string;
  onFocus?: () => void;
  onBlur?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  rightContent?: JSX.Element;
  rightContentVisibility?: boolean;
  error?: string;
  disableErrorMessage?: boolean;
  isPassword?: boolean;
  //   isPercentage?: boolean;
}

type State = {
  isFocused: boolean;
} & React.ComponentState;

export default class TextField extends React.Component<ITextFieldProps, State> {
  constructor(props: ITextFieldProps) {
    super(props);
    this.state = {
      isFocused: false
    };
  }

  render() {
    const { onFocus, onBlur, onRef, error, rightContent, rightContentVisibility, ...rest } = this.props;

    return (
      <View style={[styles.containerStyle, this.props.containerStyle]}>
        <View
          style={[
            globalStyles.inputContainer,
            { borderColor: this.state.isFocused ? Colors.LIGHT_THIRD_BLUE : error ? Colors.LIGHT_RED : 'transparent' }
          ]}
        >
          <FloatingLabel
            {...rest}
            onRef={input => {
              if (onRef && input) {
                onRef(input);
              }
            }}
            style={[
              globalStyles.input,
              this.retrieveBorderColor(),
              rightContent && rightContentVisibility && { paddingRight: 28 }
              //   this.props.currency && this.props.value
              //     ? { paddingLeft: this.getPaddingBySymbolLenght(this.props.currency.symbol) }
              //     : this.props.isPercentage && this.props.value
              //       ? { paddingLeft: 16 }
              //       : { paddingLeft: 0 }
            ]}
            labelStyle={{
              backgroundColor: 'transparent',
              color: !this.props.editable ? Colors.GRAY_500 : Colors.GRAY_600
            }}
            inputStyle={[styles.inputStyle, { color: !this.props.editable ? Colors.GRAY_600 : Colors.BLACK }]}
            dirtyStyle={{
              fontSize: 15,
              top: Platform.select({ ios: -14, android: -16 })
            }}
            cleanStyle={{
              fontSize: 17,
              top: Platform.select({ ios: 0, android: -2 })
            }}
            onFocus={() => {
              if (!this.state.isFocused) {
                this.setState({
                  isFocused: true
                });
              }

              if (this.props.onFocus) {
                this.props.onFocus();
              }
            }}
            onBlur={() => {
              if (this.state.isFocused) {
                this.setState({ isFocused: false });
              }

              if (this.props.onBlur) {
                this.props.onBlur();
              }
            }}
          >
            {this.props.label}
          </FloatingLabel>
          {rightContentVisibility && rightContent}
        </View>
        {!!error && this.renderError(error, !!this.props.disableErrorMessage)}
      </View>
    );
  }

  private renderError = (error: string, disableErrorMessage: boolean) => {
    if (disableErrorMessage) {
      return null;
    }

    return <Text style={styles.errorMessage}>{error}</Text>;
  };

  private retrieveBorderColor = () => {
    const { error, editable, value } = this.props;
    const { isFocused } = this.state;

    if (isFocused) {
      return {
        borderColor: Colors.PRIMARY_BLUE
      };
    }

    if (error) {
      return {
        borderColor: Colors.RED
      };
    }

    if (!editable) {
      return {
        borderColor: Colors.GRAY_200
      };
    }

    if (Boolean(value)) {
      return {
        borderColor: Colors.GRAY_500
      };
    }

    return {
      borderColor: Colors.GRAY_400
    };
  };
}

const styles = StyleSheet.create({
  containerStyle: {},
  fieldGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputStyle: {
    borderWidth: 0,
    padding: 0,
    fontSize: 17
  },
  errorMessage: {
    color: Colors.RED,
    fontSize: 12
  }
});
