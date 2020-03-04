import React from 'react';
import { FlatList, ListRenderItemInfo, StyleProp, StyleSheet, Text, View, ViewStyle, ViewToken } from 'react-native';
import { Colors } from '../../styles/colors';

const PICKER_HEIGHT = 216;
const ITEM_HEIGHT = 43;

export interface IPickerProps {
  data: PickerItem[];
  containerStyle?: StyleProp<ViewStyle>;
  onValueChange?(value: any): void;
  activeColor?: string;
  inactiveColor?: string;
}

export interface PickerItem {
  value: any;
  label: string;
}

interface IState {
  middleIndex: number | null;
  momentumActive: boolean;
}

class Picker extends React.Component<IPickerProps, IState> {
  viewabilityConfig: any;
  flatListRef?: FlatList<PickerItem> | null;

  constructor(props: IPickerProps) {
    super(props);
    this.viewabilityConfig = {
      itemVisiblePercentThreshold: 50
    };
    this.state = {
      middleIndex: null,
      momentumActive: false,
    }
  }

  render() {
    const { data, containerStyle } = this.props;
    const { middleIndex } = this.state;
    const emptyPickerItem: PickerItem = {
      value: 0,
      label: ""
    }
    const newData = [emptyPickerItem].concat(data).concat([emptyPickerItem]);

    return (
      <View style={[styles.container, containerStyle]}>
        <FlatList<PickerItem>
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          ref={(ref) => { this.flatListRef = ref; }}
          data={newData}
          renderItem={(info: ListRenderItemInfo<PickerItem>) => this.renderItem(info, middleIndex)}
          onViewableItemsChanged={this.viewableItemsChanged}
          viewabilityConfig={this.viewabilityConfig}
          decelerationRate="fast"
          snapToOffsets={data.map((val, index: number) => index * ITEM_HEIGHT)}
        />
      </View>
    );
  }

  private renderItem = ({ item, index }: ListRenderItemInfo<PickerItem>, middleIndex: number | null) => {
    const { data, activeColor, inactiveColor } = this.props;

    const isFirstItem = index === 0;
    const isLastItem = index === data.length + 1;

    if (isFirstItem || isLastItem)
      return <View style={styles.firstLastSpacing} />

    const isMiddleItem = middleIndex === index;
    const color = isMiddleItem ? (activeColor || Colors.BLACK) : (inactiveColor || Colors.GRAY_500)

    return (
      <View style={styles.itemContainer}>
        <Text style={[styles.itemText, { color }]}>
          {item.label}
        </Text>
      </View>
    );
  };

  private viewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[]; changed: ViewToken[]; }) => {
    const { data, onValueChange } = this.props;
    const scrolledToEnd = viewableItems[0]?.item === data[data.length - 3];
    const middleItem = viewableItems.length > 4 || scrolledToEnd
      ? viewableItems[2]
      : viewableItems[1];
    if (middleItem) {
      this.setState((prevState) => ({ middleIndex: middleItem.index }));
      if (onValueChange)
        onValueChange(middleItem.item.value);
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: PICKER_HEIGHT
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT
  },
  itemText: {
    fontSize: 17
  },
  firstLastSpacing: {
    height: ITEM_HEIGHT * 2
  }
});

export default Picker;