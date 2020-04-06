import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, TextInput, TextInputProperties, TextStyle, View, ViewStyle } from 'react-native';
import { FloatingLabel } from '../../base/FloatingLabel';
import { LoaderIcon } from '../../base/icons/LoaderIcon';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

export interface ITextFieldProps extends TextInputProperties {
  onRef?: (input: TextInput) => void;
  label: string;
  onFocusLabel?: () => void;
  onBlurLabel?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
  rightContent?: JSX.Element;
  rightContentVisibility?: boolean;
  isLoading?: boolean;
  error?: string;
  editable?: boolean;
  disableErrorMessage?: boolean;
  isPassword?: boolean;
  isPercentage?: boolean;
  currency?: string;
  isMandatory?: boolean;
  color?: string;
  disabledColor?: string;
  backgroundColor?: string;
  disabledBackgroundColor?: string;
  floatingLabelColor?: string;
  disabledFloatingLabelColor?: string;
  borderColor?: string;
  disabledBorderColor?: string;
  focusedBorderColor?: string;
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
    const {
      backgroundColor = 'transparent',
      disabledBackgroundColor = 'transparent',
      floatingLabelColor = Colors.GRAY_600,
      disabledFloatingLabelColor = Colors.GRAY_500,
      color = Colors.BLACK,
      disabledColor = Colors.GRAY_600,
      editable = true,
      onFocusLabel,
      onBlurLabel,
      onRef,
      error,
      rightContent,
      rightContentVisibility,
      placeholderStyle,
      inputStyle,
      isLoading,
      ...rest
    } = this.props;

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
            editable={editable}
            style={[
              globalStyles.input,
              this.retrieveBorderColor(),
              rightContent &&
              rightContentVisibility && {
                paddingRight: !!rest.value && (!!rest.currency || !!rest.isPercentage) ? 46 : 28
              },
              {
                backgroundColor: editable ? backgroundColor : disabledBackgroundColor
              }
            ]}
            labelStyle={[
              {
                backgroundColor: 'transparent',
                color: editable ? floatingLabelColor : disabledFloatingLabelColor
              },
              placeholderStyle
            ]}
            currencyStyle={{
              color: editable ? Colors.GRAY_600 : Colors.GRAY_500
            }}
            inputStyle={[
              styles.inputStyle,
              { color: editable ? color : disabledColor },
              inputStyle
            ]}
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

              if (this.props.onFocusLabel) {
                this.props.onFocusLabel();
              }
            }}
            onBlurLabel={() => {
              if (this.state.isFocused) {
                this.setState({ isFocused: false });
              }

              if (this.props.onBlurLabel) {
                this.props.onBlurLabel();
              }
            }}
          >
            {this.props.label}
          </FloatingLabel>
          {rightContentVisibility && rightContent && !isLoading}
          {isLoading && <LoaderIcon />}
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
    const {
      error,
      editable,
      value,
      focusedBorderColor = Colors.PRIMARY_BLUE,
      borderColor = Colors.GRAY_400,
      disabledBorderColor = Colors.GRAY_200,
    } = this.props;
    const { isFocused } = this.state;

    if (isFocused) {
      return {
        borderColor: focusedBorderColor
      };
    }

    if (error) {
      return {
        borderColor: Colors.RED
      };
    }

    if (!editable) {
      return {
        borderColor: disabledBorderColor
      };
    }

    if (Boolean(value)) {
      return {
        borderColor: Colors.GRAY_500
      };
    }

    return {
      borderColor: borderColor
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
    fontSize: 12,
    marginTop: 8,
    marginStart: 4
  }
});
