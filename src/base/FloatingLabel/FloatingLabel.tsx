import React, { Component } from 'react';
import { Animated, Easing, Platform, StyleProp, StyleSheet, Text, TextInput, TextInputProperties, TextInputStatic, TextStyle, View, ViewStyle } from 'react-native';
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
  paddingLeft: 10,
  color: Colors.WHITE,
  position: 'absolute'
};

interface IFloatingLabelProps extends TextInputProperties {
  onRef?: (ref: TextInputInstance | null) => void;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
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
  //   isPercentage: boolean;
  //   currency: any;
  style?: StyleProp<ViewStyle>;
}

interface IState {
  height: number;
  isDirty: boolean;
  text?: string;
  isFocused: boolean;
  fontSize: Animated.Value;
  top: Animated.Value;
}

export type TextInputInstance = React.Component<TextInputProperties, React.ComponentState> & TextInputStatic;

export default class FloatingLabel extends Component<IFloatingLabelProps, IState> {
  constructor(props: IFloatingLabelProps) {
    super(props);

    const isDirty = Boolean(this.props.value || this.props.placeholder);
    const cleanStyle = this.props.cleanStyle || defaultCleanStyle;
    const dirtyStyle = this.props.dirtyStyle || defaultDirtyStyle;

    this.state = {
      text: props.value,
      isDirty,
      isFocused: this.props.autoFocus || false,
      height: 0,
      fontSize: new Animated.Value(isDirty ? dirtyStyle.fontSize : cleanStyle.fontSize),
      top: new Animated.Value(isDirty ? dirtyStyle.top : cleanStyle.top)
    };
  }

  componentWillReceiveProps(props: IFloatingLabelProps) {
    if (props.value !== undefined && props.value !== this.state.text) {
      const shouldAnimate = Boolean(props.value);
      this.setState({ text: props.value, isDirty: !!Boolean(props.value) });
      if (props.isSelectField) {
        this.animate(!!props.value);
      } else {
        this.animate(shouldAnimate || this.state.isFocused);
      }
    } else if (!props.value && !!this.state.text) {
      if (!isNaN(+this.state.text)) {
        return;
      }
      this.setState({ text: props.value, isDirty: false });
      this.animate(false);
    }
  }

  render() {
    const { style, isSelectField } = this.props;

    return (
      <View style={[styles.element, style]}>
        {/* {isCurrency && this.renderSymbol(this.props.currency.symbol)}
        {isPercentage && this.renderSymbol('%')} */}
        {this.renderLabel()}
        {isSelectField ? <View pointerEvents="none">{this.renderTextField()}</View> : this.renderTextField()}
      </View>
    );
  }

  private renderTextField = () => {
    const { children, style, onFocus, onBlur, onEndEditing, isPassword, inputStyle, value, ...rest } = this.props;

    return (
      <TextInput
        {...rest}
        value={value}
        ref={(input: TextInputInstance) => this.props.onRef && this.props.onRef(input)}
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
          })
        ]}
        secureTextEntry={isPassword}
        onContentSizeChange={event => {
          const height = event.nativeEvent.contentSize.height;

          this.setState({
            height: Platform.select({
              android: height,
              ios: this.props.multiline && height > INPUT_HEIGHT ? height + 14 : height
            })
          });
        }}
        onBlur={this.onBlur}
        onFocus={this.onFocus}
        onChangeText={this.onChangeText}
        onEndEditing={this.onEndEditing}
      />
    );
  };

  renderSymbol(symbol: string) {
    return <Text style={styles.symbol}>{symbol}</Text>;
  }

  renderLabel() {
    return (
      <Animated.Text
        style={[styles.label, this.props.labelStyle, { fontSize: this.state.fontSize, top: this.state.top }]}
      >
        {this.props.children}
      </Animated.Text>
    );
  }

  onChangeText = (text: string) => {
    this.setState({ text });

    if (this.props.onChangeText) {
      this.props.onChangeText(text);
    }
  };

  onEndEditing = (event: { nativeEvent: { text: string } }) => {
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
        duration: 150,
        easing: Easing.ease
        // useNativeDriver: true
      }),
      Animated.timing(this.state.top, {
        toValue: nextStyle.top,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: false
      })
    ]).start();
  };

  private onFocus = () => {
    this.animate(true);
    this.setState({ isDirty: true, isFocused: true });
    if (this.props.onFocus) {
      this.props.onFocus();
    }
  };

  private onBlur = () => {
    if (!this.state.text) {
      this.animate(false);
      this.setState({ isDirty: false });
    }

    this.setState({ isFocused: false });

    if (this.props.onBlur) {
      this.props.onBlur();
    }
  };
}

const styles = StyleSheet.create({
  element: {
    position: 'relative'
  },
  input: {
    height: INPUT_HEIGHT + 5,
    borderColor: 'gray',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    borderWidth: 1,
    color: 'black',
    fontSize: 20,
    borderRadius: 4,
    paddingLeft: 10,
    marginTop: 20
  },
  symbol: { position: 'absolute', bottom: 8, left: 8, fontSize: 17 },
  label: floatingLabelStyle
});
