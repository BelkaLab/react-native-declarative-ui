import { map } from 'lodash';
import React, { useState } from 'react';
import { Platform, StyleProp, StyleSheet, Text, TextStyle, TouchableNativeFeedback, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Colors } from '../../styles/colors';

export interface ISegmentProps {
  data: string[];
  containerStyle?: StyleProp<ViewStyle>;
  activeItemIndex?: number;
  onChange?(index: number): void;
  activeItemColor?: string;
  disabledActiveItemColor?: string;
  activeTextStyle?: StyleProp<TextStyle>;
  inactiveTextStyle?: StyleProp<TextStyle>;
  backgroundColor?: string;
  disabledBackgroundColor?: string;
  borderColor?: string;
  disabledBorderColor?: string;
  disabled?: boolean;
}

const Segment = (props: ISegmentProps) => {
  const {
    data,
    containerStyle = {},
    activeItemIndex = 0,
    onChange,
    activeItemColor = Colors.PRIMARY_BLUE,
    disabledActiveItemColor = Colors.GRAY_600,
    activeTextStyle = { color: Colors.WHITE },
    inactiveTextStyle = { color: Colors.BLACK },
    backgroundColor = Colors.WHITE,
    disabledBackgroundColor = Colors.GRAY_200,
    borderColor = Colors.GRAY_500,
    disabledBorderColor = Colors.GRAY_200,
    disabled = false
  } = props;

  const [activeIndex, setIndex] = useState(activeItemIndex);

  const itemPressed = (index: number) => {
    if (activeIndex !== index) {
      setIndex(index);
      if (onChange)
        onChange(index);
    }
  }

  return (
    <View style={[
      styles.container,
      {
        borderColor: disabled ? disabledBorderColor : borderColor,
        backgroundColor: disabled ? disabledBackgroundColor : backgroundColor
      },
      containerStyle
    ]}>
      {map(data, (item, index) => {
        const isActive = index === activeIndex;
        const isLastItem = index === (data.length - 1);
        // Android Buttons should have the ripple effect
        if (Platform.OS === 'android') {
          return (
            <TouchableNativeFeedback
              onPress={() => itemPressed(index)}
              disabled={disabled || isActive}
            >
              <View
                style={[
                  styles.segmentItem,
                  {
                    backgroundColor: disabled
                      ? (isActive ? disabledActiveItemColor : disabledBackgroundColor)
                      : (isActive ? activeItemColor : backgroundColor),
                    marginRight: !isLastItem ? 1 : 0
                  }
                ]}>
                <Text style={isActive ? activeTextStyle : inactiveTextStyle}>
                  {item}
                </Text>
              </View>
            </TouchableNativeFeedback>
          );
        }
        return (
          <TouchableOpacity
            onPress={() => itemPressed(index)}
            style={[
              styles.segmentItem,
              {
                backgroundColor: disabled
                  ? (isActive ? disabledActiveItemColor : disabledBackgroundColor)
                  : (isActive ? activeItemColor : backgroundColor),
                marginRight: !isLastItem ? 1 : 0
              }
            ]}
            disabled={disabled || isActive}>
            <Text style={isActive ? activeTextStyle : inactiveTextStyle}>
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    padding: 2,
    borderRadius: 3,
    borderWidth: 1
  },
  disabled: { backgroundColor: Colors.GRAY_200 },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderRadius: 3,
    minHeight: 28
  },
  fullWidth: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'stretch'
  }
});

export default Segment;