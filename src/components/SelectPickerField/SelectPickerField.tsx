import { flatMap, map } from 'lodash';
import find from 'lodash.find';
import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, TextInput, TextInputProperties, TextStyle, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { FloatingLabel } from '../../base/FloatingLabel';
import { ClearPickerFieldIcon } from '../../base/icons/ClearPickerFieldIcon';
import { OpenPickerFieldIcon } from '../../base/icons/OpenPickerFieldIcon';
import { ComposableItem } from '../../models/composableItem';
import { SelectPickerSection } from '../../models/selectPickerSection';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

export interface ISelectPickerFieldProps extends TextInputProperties {
  onRef?: (input: TextInput) => void;
  label: string;
  onPress: () => void;
  onClear: () => void;
  onFocusLabel?: () => void;
  onBlurLabel?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
  error?: string;
  disabled?: boolean;
  disableErrorMessage?: boolean;
  options?: ComposableItem[] | string[] | SelectPickerSection[];
  isSectionList?: boolean;
  displayProperty?: string;
  keyProperty?: string;
  itemValue?: ComposableItem | string;
  isPercentage?: boolean;
  isMandatory?: boolean;
  shouldShowClearButton?: boolean;
}

type State = {
  isFocused: boolean;
} & React.ComponentState;

export default class SelectPickerField extends React.Component<ISelectPickerFieldProps, State> {
  constructor(props: ISelectPickerFieldProps) {
    super(props);
    this.state = {
      isFocused: false
    };
  }

  render() {
    // const { isPercentage } = this.props;
    const {
      onRef,
      onFocusLabel,
      onBlurLabel,
      onPress,
      onClear,
      displayProperty,
      keyProperty,
      itemValue,
      placeholderStyle,
      inputStyle,
      options,
      error,
      isSectionList = false,
      disabled = false,
      shouldShowClearButton = false,
      ...rest
    } = this.props;

    return (
      <View style={[styles.containerStyle, this.props.containerStyle]}>
        <TouchableWithoutFeedback disabled={disabled} onPress={this.props.onPress}>
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
              isSelectField={true}
              value={this.retrieveDisplayValue(itemValue)}
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
            {!disabled && (
              !!itemValue && shouldShowClearButton
                ? <ClearPickerFieldIcon onClearPickerIconClicked={onClear} />
                : <OpenPickerFieldIcon onOpenPickerIconClicked={onPress} />
            )}
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

  private retrieveDisplayValue = (itemValue?: ComposableItem | string) => {
    // Add isPercentage check
    const { displayProperty, keyProperty, options, isSectionList } = this.props;

    if (!itemValue) {
      return undefined;
    }

    if (displayProperty && typeof itemValue === 'object') {
      return String(itemValue[displayProperty]);
    }

    if (isSectionList) {
      if (options && options.length > 0 && displayProperty && keyProperty) {
        return String(find(
          flatMap(
            map(
              options as SelectPickerSection[],
              option => option.data
            )
          ),
          item => item[keyProperty] === itemValue
        )![displayProperty]);
      }
    } else {
      if (options && options.length > 0 && displayProperty && keyProperty) {
        return String(find(options as ComposableItem[], item => item[keyProperty] === itemValue)![displayProperty]);
      }
    }

    return String(itemValue);
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
