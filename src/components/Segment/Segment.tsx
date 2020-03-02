import { map } from 'lodash';
import React, { useState } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Colors } from '../../styles/colors';

export interface ISegmentProps {
  data: string[];
  containerStyle?: StyleProp<ViewStyle>;
  activeItemIndex?: number;
  onChange?(index: number): void;
  activeItemColor?: string;
  activeTextStyle?: StyleProp<TextStyle>;
  inactiveTextStyle?: StyleProp<TextStyle>;
  backgroundColor?: string;
  borderColor?: string;
}

const Segment = (props: ISegmentProps) => {
  const {
    data,
    containerStyle = {},
    activeItemIndex = 0,
    onChange,
    activeItemColor = Colors.PRIMARY_BLUE,
    activeTextStyle = { color: Colors.WHITE },
    inactiveTextStyle = { color: Colors.BLACK },
    backgroundColor = Colors.WHITE,
    borderColor = Colors.GRAY_500
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
    <View style={[styles.container, { borderColor, backgroundColor }, containerStyle]}>
      {map(data, (item, index) => {
        const isActive = index === activeIndex;
        return (
          <TouchableOpacity
            onPress={() => itemPressed(index)}
            style={[
              styles.segmentItem,
              { backgroundColor: isActive ? activeItemColor : backgroundColor }
            ]}
            disabled={isActive}>
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
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderRadius: 3,
    minHeight: 28
  }
});

export default Segment;