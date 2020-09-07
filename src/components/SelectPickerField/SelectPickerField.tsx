import find from 'lodash.find';
import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, TextInput, TextInputProperties, TextStyle, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { FloatingLabel } from '../../base/FloatingLabel';
import { OpenPickerFieldIcon } from '../../base/icons/OpenPickerFieldIcon';
import { ComposableItem } from '../../models/composableItem';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';
import { SelectPickerSection } from '../../models/selectPickerSection';
import { map, flatMap } from 'lodash';

export interface ISelectPickerFieldProps extends TextInputProperties {
  onRef?: (input: TextInput) => void;
  label: string;
  onPress: () => void;
  onFocusLabel?: () => void;
  onBlurLabel?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
  error?: string;
  disableErrorMessage?: boolean;
  options?: ComposableItem[] | string[] | SelectPickerSection[];
  isSectionList?: boolean;
  displayProperty?: string;
  keyProperty?: string;
  itemValue?: ComposableItem | string;
  isPercentage?: boolean;
  isMandatory?: boolean;
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
      displayProperty,
      keyProperty,
      itemValue,
      placeholderStyle,
      inputStyle,
      options,
      isSectionList = false,
      error,
      ...rest
    } = this.props;

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
              isSelectField={true}
              value={this.retrieveDisplayValue(itemValue)}
              style={[globalStyles.input, this.retrieveBorderColor(), { paddingRight: 28 }]}
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
