import React from 'react';
import { EmitterSubscription, findNodeHandle, Keyboard, Platform, ScrollView, ScrollViewProperties, TextInput } from 'react-native';

const DEFAULT_OFFSET = 64;
const DEFAULT_ADDITIONAL_OFFSET = 12;

interface IKeyboardAvoidingScrollViewProps extends ScrollViewProperties {
  focusedField?: TextInput;
  marginBottom?: number;
  additionalOffset?: number;
}

interface IState {
  keyboardVisible: boolean;
}

type KeyboardAvoidingScrollViewInstance = React.Component<ScrollViewProperties, React.ComponentState> &
  IKeyboardAvoidingScrollViewStatic;

type KeyboardNativeHandleToKeyboard = {
  scrollResponderScrollNativeHandleToKeyboard: (
    currentlyFocusedField: number,
    offset?: number,
    animated?: boolean
  ) => void;
};

interface IKeyboardAvoidingScrollViewStatic extends ScrollView {
  getScrollResponder(): JSX.Element & KeyboardNativeHandleToKeyboard;
}

export default class KeyboardAvoidingScrollView extends React.Component<IKeyboardAvoidingScrollViewProps, IState> {
  private keyboardAvoidingScrollView!: KeyboardAvoidingScrollViewInstance;
  private subscriptions!: EmitterSubscription[];

  constructor(props: IKeyboardAvoidingScrollViewProps) {
    super(props);
    this.state = {
      keyboardVisible: false
    };
  }

  componentWillMount() {
    this.subscriptions = [
      Keyboard.addListener('keyboardDidShow', this.keyboardDidShow),
      Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.remove());
  }

  keyboardDidShow = () => {
    this.setState({ keyboardVisible: true });
    if (Platform.OS === 'android' && this.props.focusedField) {
      this.scrollToField();
    }
  };

  keyboardDidHide = () => {
    this.setState({ keyboardVisible: false });
  };

  componentWillReceiveProps(nextProps: IKeyboardAvoidingScrollViewProps) {
    if (Platform.OS === 'android' && nextProps.focusedField !== this.props.focusedField) {
      this.scrollToField();
    }
  }

  private scrollToField = () => {
    const currentlyFocusedField = findNodeHandle(TextInput.State.currentlyFocusedField());
    const scrollResponder = this.keyboardAvoidingScrollView.getScrollResponder();

    if (currentlyFocusedField && scrollResponder) {
      const additionalOffset = this.props.additionalOffset || DEFAULT_ADDITIONAL_OFFSET;
      scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
        currentlyFocusedField,
        DEFAULT_OFFSET + additionalOffset,
        true
      );
    }
  };

  render() {
    const { children, marginBottom, contentContainerStyle, ...props } = this.props;
    const { keyboardVisible } = this.state;

    return (
      <ScrollView
        {...props}
        ref={(scroll: KeyboardAvoidingScrollViewInstance) => {
          if (scroll) {
            this.keyboardAvoidingScrollView = scroll;
          }
        }}
        keyboardDismissMode="none"
        keyboardShouldPersistTaps="handled"
        style={{ marginBottom }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          contentContainerStyle,
          {
            paddingBottom: Platform.select({ android: keyboardVisible ? 220 : 32, ios: 32 })
          }
        ]}
      >
        {children}
      </ScrollView>
    );
  }
}
