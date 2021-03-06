import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, TextInput, TextInputProperties, TextStyle, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { FloatingLabel } from '../../base/FloatingLabel';
import { OpenPickerFieldIcon } from '../../base/icons/OpenPickerFieldIcon';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

export interface IDatePickerFieldProps extends TextInputProperties {
  onRef?: (input: TextInput) => void;
  label: string;
  onPress: () => void;
  onFocusLabel?: () => void;
  onBlurLabel?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
  error?: string;
  disabled?: boolean;
  disableErrorMessage?: boolean;
  onRightIconClick?: () => void;
  rightContent?: JSX.Element;
}

type State = {
  isFocused: boolean;
} & React.ComponentState;

export default class DatePickerField extends React.Component<IDatePickerFieldProps, State> {
  constructor(props: IDatePickerFieldProps) {
    super(props);
    this.state = {
      isFocused: false
    };
  }

  render() {
    const {
      onRef,
      onFocusLabel,
      onBlurLabel,
      onPress,
      label,
      error,
      disableErrorMessage,
      placeholderStyle,
      inputStyle,
      containerStyle,
      disabled = false,
      ...rest
    } = this.props;

    return (
      <View style={[styles.containerStyle, containerStyle]}>
        <TouchableWithoutFeedback disabled={disabled} onPress={onPress}>
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
              editable={false}
              isSelectField={true} // Check if needed
              style={[
                globalStyles.input,
                this.retrieveBorderColor(),
                disabled && styles.disabled,
                { paddingRight: 28 }
              ]}
              labelStyle={[{ backgroundColor: 'transparent', color: Colors.GRAY_600 }, placeholderStyle]}
              inputStyle={[styles.inputStyle, inputStyle]}
              dirtyStyle={{
                fontSize: 15,
                top: Platform.select({ ios: -14, android: -16 })
              }}
              cleanStyle={{
                fontSize: 17,
                top: Platform.select({ ios: 0, android: -2 })
              }}
              onFocusLabel={() => {
                if (!this.state.isFocused) {
                  this.setState({
                    isFocused: true
                  });
                }

                if (onFocusLabel) {
                  onFocusLabel();
                }
              }}
              onBlurLabel={() => {
                if (this.state.isFocused) {
                  this.setState({ isFocused: false });
                }

                if (onBlurLabel) {
                  onBlurLabel();
                }
              }}
            >
              {label}
            </FloatingLabel>
            {!disabled && (
              <OpenPickerFieldIcon onOpenPickerIconClicked={onPress} />
            )}
          </View>
        </TouchableWithoutFeedback>
        {!!error && this.renderError(error, !!disableErrorMessage)}
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
    const { error, disabled = false, value } = this.props;
    const { isFocused } = this.state;

    if (disabled) {
      return {
        borderColor: Colors.GRAY_200
      }
    }

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
  disabled: { backgroundColor: Colors.GRAY_200 },
  inputStyle: {
    borderWidth: 0,
    fontSize: 17
  },
  errorMessage: {
    color: Colors.RED,
    fontSize: 12,
    marginTop: 8,
    marginStart: 4
  }
});
