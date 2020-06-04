import React, { FunctionComponent, useEffect, useState } from 'react';
import { Animated, Easing, Image, NativeSyntheticEvent, Platform, StyleProp, StyleSheet, Text, TextInput, TextInputEndEditingEventData, TextInputFocusEventData, TextInputProperties, TextStyle, TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { Colors } from '../../styles/colors';

const INPUT_HEIGHT = 35;

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

const FloatingLabel: FunctionComponent<IFloatingLabelProps> = (props) => {
  const {
    value,
    placeholder,
    autoFocus,
    multiline,
    children,
    onRef,
    inputStyle,
    labelStyle,
    currencyStyle,
    dirtyStyle = styles.defaultDirtyStyle,
    cleanStyle = styles.defaultCleanStyle,
    isSelectField,
    isPassword,
    isPercentage,
    currency,
    style,
    onFocusLabel,
    onBlurLabel,
    isMandatory,
  } = props;

  const isDirty = Boolean(value || placeholder);

  const [height, setHeight] = useState<number>(0);
  const [text, setText] = useState<string | undefined>(props.value);
  const [isFocused, setIsFocused] = useState<boolean>(autoFocus || false);
  const [passwordToggle, setPasswordToggle] = useState<boolean>(!!isPassword);
  const [input, setInput] = useState<TextInput | null>(null);

  const fontSize = new Animated.Value(isDirty ? dirtyStyle.fontSize : cleanStyle.fontSize);
  const top = new Animated.Value(isDirty ? dirtyStyle.top : cleanStyle.top);
  const hasSymbol = (isFocused || !!value) && (!!currency || !!isPercentage);

  useEffect(() => {
    return () => {
      if (onRef) {
        onRef(null);
      }
    };
  }, []);

  useEffect(() => {
    if (value !== undefined && value !== text) {
      const shouldAnimate = Boolean(value);

      setText(value);

      if (isSelectField) {
        animate(!!value);
      } else {
        animate(shouldAnimate || isFocused);
      }
    } else if (!value && !!text) {
      if (!isNaN(+text)) {
        return;
      }

      setText(value);
      animate(false);
    }
  }, [value, text]);

  const renderTextField = (hasSymbol: boolean) => {
    const {
      children,
      style,
      onFocus,
      onBlur,
      onFocusLabel,
      onBlurLabel,
      onEndEditing,
      value,
      ...rest
    } = props;

    return (
      <View style={styles.inputContainer}>
        <TouchableWithoutFeedback
          onPress={() => {
            if (input && !isFocused) {
              input.focus();
            }
          }}
        >
          <View style={{ flexGrow: 1, height: 20 }} />
        </TouchableWithoutFeedback>
        <TextInput
          {...rest}
          value={value}
          ref={input => {
            setInput(input);

            if (props.onRef) {
              props.onRef(input);
            }
          }}
          style={[
            styles.input,
            inputStyle,
            {
              height: Math.max(INPUT_HEIGHT, height)
            },
            Platform.select({ ios: props.multiline && { paddingTop: 6 } }),
            Platform.select({
              android: {
                paddingBottom: height > INPUT_HEIGHT ? 6 : 0,
                paddingTop: height > INPUT_HEIGHT ? 4 : 0
              }
            }),
            hasSymbol && {
              paddingLeft: 0
            }
          ]}
          secureTextEntry={passwordToggle}
          onContentSizeChange={event => {
            if (multiline) {
              const height = event.nativeEvent.contentSize.height;

              setHeight(Platform.select({
                android: height,
                ios: multiline && height > INPUT_HEIGHT ? height + 14 : height
              }))
            }
          }}
          onBlur={_onBlur}
          onFocus={_onFocus}
          onChangeText={onChangeText}
          onEndEditing={onEndEditing}
        />
      </View>
    );
  };

  const renderSymbol = (symbol: string) => {
    return <Text style={[styles.symbol, currencyStyle]}>{symbol}</Text>;
  }

  const renderLabel = () => {
    return (
      <Animated.Text
        style={[styles.label, labelStyle, { fontSize, top }]}
      >
        {children}
        {isMandatory && <View style={{ width: 4, height: 4 }} />}
        {isMandatory && <Text style={{ color: Colors.RED }}>*</Text>}
      </Animated.Text>
    );
  }

  const onTogglePasswordVisibilityPressed = () => {
    setPasswordToggle(previous => !previous);
  }

  const onChangeText = (text: string) => {
    setText(text);

    if (onChangeText) {
      onChangeText(text);
    }
  };

  const onEndEditing = (event: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
    setText(event.nativeEvent.text);

    if (onEndEditing) {
      onEndEditing(event);
    }
  };

  const animate = (isDirty: boolean) => {
    const nextStyle = isDirty ? dirtyStyle : cleanStyle;

    Animated.parallel([
      Animated.timing(fontSize, {
        toValue: nextStyle.fontSize,
        duration: 60,
        easing: Easing.ease
      }),
      Animated.timing(top, {
        toValue: nextStyle.top,
        duration: 60,
        easing: Easing.ease,
        useNativeDriver: false
      })
    ]).start();
  };

  const _onFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (!isFocused) {
      animate(true);

      setIsFocused(true);

      if (onFocusLabel) {
        onFocusLabel(e);
      }
    }
  };

  const _onBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    if (!text) {
      animate(false);
    }

    // if (Platform.OS === 'android' && this.input) {
    //   this.input.setNativeProps({
    //     selection: {
    //       start: 0,
    //       end: 0
    //     }
    //   });
    // }

    setIsFocused(false);

    if (onBlurLabel) {
      onBlurLabel(e);
    }
  };

  return (
    <View style={[styles.element, style]}>
      {/* {isCurrency && this.renderSymbol(this.props.currency.symbol)}
      {isPercentage && this.renderSymbol('%')} */}
      {hasSymbol && renderSymbol(currency || '%')}
      {renderLabel()}
      {isSelectField ? (
        <View pointerEvents="none">{renderTextField(hasSymbol)}</View>
      ) : (
          renderTextField(hasSymbol)
        )}
      {
        isPassword
        && (
          passwordToggle
            ? (
              <View style={styles.passwordToggle}>
                <TouchableOpacity onPress={onTogglePasswordVisibilityPressed}>
                  <Image source={require('../../assets/eye.png')} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.passwordToggle}>
                <TouchableOpacity onPress={onTogglePasswordVisibilityPressed}>
                  <Image source={require('../../assets/eye-slash.png')} />
                </TouchableOpacity>
              </View>
            )
        )
      }
    </View>
  );
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
  passwordToggle: {
    position: 'absolute',
    right: 6,
    top: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center'
  },
  label: {
    marginTop: 22,
    left: 10,
    color: Colors.WHITE,
    position: 'absolute'
  },
  defaultCleanStyle: {
    fontSize: 17,
    top: 7
  },
  defaultDirtyStyle: {
    fontSize: 12,
    top: -17
  }
});

export default FloatingLabel;