import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, TextInputProperties, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { FloatingLabel, TextInputInstance } from '../../base/FloatingLabel';
import { OpenPickerFieldIcon } from '../../base/icons/OpenPickerFieldIcon';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

export interface IDatePickerFieldProps extends TextInputProperties {
  onRef?: (input: TextInputInstance) => void;
  label: string;
  onPress: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  error?: string;
  disableErrorMessage?: boolean;

  onRightIconClick?: () => void;
  rightContent?: JSX.Element;
}

type State = {
  isFocused: boolean;
} & React.ComponentState;

export default class DatePickerField extends React.Component<IDatePickerFieldProps, State> {
  private inputRef!: FloatingLabel;
  private textInput!: FloatingLabel;

  constructor(props: IDatePickerFieldProps) {
    super(props);
    this.state = {
      isFocused: false
    };
  }

  render() {
    const { onRef, onFocus, onBlur, onPress, error, ...rest } = this.props;

    return (
      <View style={[styles.containerStyle, this.props.containerStyle]}>
        <TouchableWithoutFeedback onPress={this.props.onPress}>
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
              style={[globalStyles.input, this.retrieveBorderColor(), { paddingRight: 28 }]}
              labelStyle={{ backgroundColor: 'transparent', color: Colors.GRAY_600 }}
              inputStyle={styles.inputStyle}
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
            <OpenPickerFieldIcon onOpenPickerIconClicked={onPress} />
          </View>
        </TouchableWithoutFeedback>
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
    const { error, value } = this.props;
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
    fontSize: 17
  },
  errorMessage: {
    color: Colors.RED,
    fontSize: 12
  }
});
