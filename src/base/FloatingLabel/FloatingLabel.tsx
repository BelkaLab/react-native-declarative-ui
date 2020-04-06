import React, { PureComponent } from 'react';
import { Animated, Easing, Image, NativeSyntheticEvent, Platform, StyleProp, StyleSheet, Text, TextInput, TextInputEndEditingEventData, TextInputFocusEventData, TextInputProperties, TextStyle, TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { Colors } from '../../styles/colors';

const INPUT_HEIGHT = 35;

const defaultCleanStyle = {
  fontSize: 17,
  top: 7
};

const defaultDirtyStyle = {
  fontSize: 12,
  top: -17
};

const floatingLabelStyle: StyleProp<TextStyle> = {
  marginTop: 22,
  left: 10,
  color: Colors.WHITE,
  position: 'absolute'
};

interface IFloatingLabelProps extends TextInputProperties {
  onRef?: (ref: TextInput | null) => void;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  currencyStyle?: StyleProp<TextStyle>;
  dirtyStyle?: {
    fontSize: number;
    top: number;
  };
  cleanStyle?: {
    fontSize: number;
    top: number;
  };
  disabled?: boolean;
  isSelectField?: boolean;
  isPassword?: boolean;
  isPercentage?: boolean;
  currency?: string;
  style?: StyleProp<ViewStyle>;
  onFocusLabel?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onBlurLabel?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  isMandatory?: boolean;
}

interface IState {
  height: number;
  text?: string;
  isFocused: boolean;
  fontSize: Animated.Value;
  top: Animated.Value;
  passwordToggle: boolean;
}

export default class FloatingLabel extends PureComponent<IFloatingLabelProps, IState> {
  private input: TextInput | null = null;

  constructor(props: IFloatingLabelProps) {
    super(props);

    const isDirty = Boolean(this.props.value || this.props.placeholder);
    const cleanStyle = this.props.cleanStyle || defaultCleanStyle;
    const dirtyStyle = this.props.dirtyStyle || defaultDirtyStyle;

    this.state = {
      text: props.value,
      isFocused: this.props.autoFocus || false,
      height: 0,
      fontSize: new Animated.Value(isDirty ? dirtyStyle.fontSize : cleanStyle.fontSize),
      top: new Animated.Value(isDirty ? dirtyStyle.top : cleanStyle.top),
      passwordToggle: !!props.isPassword
    };
  }

  componentWillReceiveProps(props: IFloatingLabelProps) {
    if (props.value !== undefined && props.value !== this.state.text) {
      const shouldAnimate = Boolean(props.value);
      this.setState({ text: props.value });
      if (props.isSelectField) {
        this.animate(!!props.value);
      } else {
        this.animate(shouldAnimate || this.state.isFocused);
      }
    } else if (!props.value && !!this.state.text) {
      if (!isNaN(+this.state.text)) {
        return;
      }
      this.setState({ text: props.value });
      this.animate(false);
    }
  }

  componentWillUnmount() {
    if (this.props.onRef) {
      this.props.onRef(null);
    }
  }

  componentDidUpdate() {
    // if (Platform.OS === 'android' && this.props.isSelectField && this.input) {
    //   delay(() => {
    //     if (this.input) {
    //       this.input.setNativeProps({
    //         selection: {
    //           start: 0,
    //           end: 0
    //         }
    //       });
    //     }
    //   }, 10);
    // }
  }

  render() {
    const { style, isSelectField, isPercentage, currency, value, isPassword } = this.props;
    const { passwordToggle } = this.state;

    const hasSymbol = (this.state.isFocused || !!value) && (!!currency || !!isPercentage);

    return (
      <View style={[styles.element, style]}>
        {/* {isCurrency && this.renderSymbol(this.props.currency.symbol)}
        {isPercentage && this.renderSymbol('%')} */}
        {hasSymbol && this.renderSymbol(currency || '%')}
        {this.renderLabel()}
        {isSelectField ? (
          <View pointerEvents="none">{this.renderTextField(hasSymbol)}</View>
        ) : (
            this.renderTextField(hasSymbol)
          )}
        {
          isPassword
          && (
            passwordToggle
              ? (
                <View style={styles.passwordToggle}>
                  <TouchableOpacity onPress={this.onTogglePasswordVisibilityPressed}>
                    <Image source={require('../../assets/eye.png')} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.passwordToggle}>
                  <TouchableOpacity onPress={this.onTogglePasswordVisibilityPressed}>
                    <Image source={require('../../assets/eye-slash.png')} />
                  </TouchableOpacity>
                </View>
              )
          )
        }
      </View>
    );
  }

  private renderTextField = (hasSymbol: boolean) => {
    const {
      children,
      style,
      onFocus,
      onBlur,
      onFocusLabel,
      onBlurLabel,
      onEndEditing,
      inputStyle,
      value,
      ...rest
    } = this.props;
    const { passwordToggle } = this.state;

    return (
      <View style={styles.inputContainer}>
        <TouchableWithoutFeedback
          onPress={() => {
            if (this.input && !this.state.isFocused) {
              this.input.focus();
            }
          }}
        >
          <View style={{ flexGrow: 1, height: 20 }} />
        </TouchableWithoutFeedback>
        <TextInput
          {...rest}
          value={value}
          ref={input => {
            this.input = input;

            if (this.props.onRef) {
              this.props.onRef(input);
            }
          }}
          style={[
            styles.input,
            inputStyle,
            {
              height: Math.max(INPUT_HEIGHT, this.state.height)
            },
            Platform.select({ ios: this.props.multiline && { paddingTop: 6 } }),
            Platform.select({
              android: {
                paddingBottom: this.state.height > INPUT_HEIGHT ? 6 : 0,
                paddingTop: this.state.height > INPUT_HEIGHT ? 4 : 0
              }
            }),
            hasSymbol && {
              paddingLeft: 0
            }
          ]}
          secureTextEntry={passwordToggle}
          onContentSizeChange={event => {
            if (this.props.multiline) {
              const height = event.nativeEvent.contentSize.height;

              this.setState({
                height: Platform.select({
                  android: height,
                  ios: this.props.multiline && height > INPUT_HEIGHT ? height + 14 : height
                })
              });
            }
          }}
          onBlur={this._onBlur}
          onFocus={this._onFocus}
          onChangeText={this.onChangeText}
          onEndEditing={this.onEndEditing}
        />
      </View>
    );
  };

  renderSymbol(symbol: string) {
    const { currencyStyle } = this.props;
    return <Text style={[styles.symbol, currencyStyle]}>{symbol}</Text>;
  }

  renderLabel() {
    return (
      <Animated.Text
        style={[styles.label, this.props.labelStyle, { fontSize: this.state.fontSize, top: this.state.top }]}
      >
        {this.props.children}
        {this.props.isMandatory && <View style={{ width: 4, height: 4 }} />}
        {this.props.isMandatory && <Text style={{ color: Colors.RED }}>*</Text>}
      </Animated.Text>
    );
  }

  onTogglePasswordVisibilityPressed = () => {
    this.setState(state => ({ passwordToggle: !state.passwordToggle }));
  }

  onChangeText = (text: string) => {
    this.setState({ text });

    if (this.props.onChangeText) {
      this.props.onChangeText(text);
    }
  };

  onEndEditing = (event: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
    this.setState({ text: event.nativeEvent.text });

    if (this.props.onEndEditing) {
      this.props.onEndEditing(event);
    }
  };

  private animate = (isDirty: boolean) => {
    const cleanStyle = this.props.cleanStyle || defaultCleanStyle;
    const dirtyStyle = this.props.dirtyStyle || defaultDirtyStyle;

    const nextStyle = isDirty ? dirtyStyle : cleanStyle;

    Animated.parallel([
      Animated.timing(this.state.fontSize, {
        toValue: nextStyle.fontSize,
        duration: 60,
        easing: Easing.ease
      }),
      Animated.timing(this.state.top, {
        toValue: nextStyle.top,
        duration: 60,
        easing: Easing.ease,
        useNativeDriver: false
      })
    ]).start();
  };

  private _onFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (!this.state.isFocused) {
      this.animate(true);
      this.setState({ isFocused: true }, () => {
        if (this.props.onFocusLabel) {
          this.props.onFocusLabel(e);
        }
      });
    }
  };

  private _onBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (!this.state.text) {
      this.animate(false);
    }

    // if (Platform.OS === 'android' && this.input) {
    //   this.input.setNativeProps({
    //     selection: {
    //       start: 0,
    //       end: 0
    //     }
    //   });
    // }

    this.setState({ isFocused: false }, () => {
      if (this.props.onBlurLabel) {
        this.props.onBlurLabel(e);
      }
    });
  };
}

const styles = StyleSheet.create({
  element: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: 'transparent'
  },
  input: {
    height: INPUT_HEIGHT + 5,
    backgroundColor: 'transparent',
    color: 'black',
    fontSize: 20,
    borderRadius: 4,
    paddingLeft: 10
  },
  inputContainer: {
    flexGrow: 1,
    borderColor: 'gray',
    backgroundColor: 'transparent',
    borderRadius: 4
  },
  symbol: {
    fontSize: 17,
    paddingLeft: 10,
    paddingRight: 8,
    marginTop: Platform.select({ android: 29, ios: 30 })
  },
  label: floatingLabelStyle,
  passwordToggle: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center'
  },
});
