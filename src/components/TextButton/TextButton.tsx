import React, { Component } from 'react';
import { ActivityIndicator, GestureResponderEvent, Platform, StyleProp, StyleSheet, Text, TouchableNativeFeedback, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Colors } from '../../styles/colors';

export interface ITextButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  color?: string;
  fontWeight?: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
  disabled?: boolean;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default class TextButton extends Component<ITextButtonProps> {
  constructor(props: ITextButtonProps) {
    super(props);
  }

  render() {
    const { color: textColor, fontWeight, onPress, title, disabled, isLoading } = this.props;
    const color = textColor || (disabled ? Colors.GRAY_400 : Colors.PRIMARY_BLUE);

    if (Platform.OS === "android") {
      return (
        <>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator />
            </View>
          ) : (
              <TouchableNativeFeedback
                onPress={onPress}
                disabled={disabled}
                style={[styles.touchableContainer, this.props.style]}
              >
                <Text style={{ fontSize: 17, color, fontWeight }}>
                  {title}
                </Text>
              </TouchableNativeFeedback>
            )}
        </>
      );
    }

    return (
      <>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        ) : (
            <TouchableOpacity
              onPress={onPress}
              disabled={disabled}
              style={[styles.touchableContainer, this.props.style]}
            >
              <Text style={{ fontSize: 17, color, fontWeight }}>
                {title}
              </Text>
            </TouchableOpacity>
          )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignContent: 'center',
    justifyContent: 'center',
    minWidth: 100
  },
  touchableContainer: { backgroundColor: Colors.TRANSPARENT }
});
