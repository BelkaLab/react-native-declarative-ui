import { delay, findIndex } from 'lodash';
import React from 'react';
import { FlatList, ListRenderItemInfo, StyleProp, StyleSheet, Text, View, ViewStyle, ViewToken } from 'react-native';
import { Colors } from '../../styles/colors';

const PICKER_HEIGHT = 216;
export const ITEM_HEIGHT = 42;
const ITEM_LAYOUT = (index: number) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index
});

export interface IPickerProps {
  data: PickerItem[];
  label?: string;
  selectedValue?: number;
  containerStyle?: StyleProp<ViewStyle>;
  itemContainerStyle?: StyleProp<ViewStyle>;
  onValueChange?(value: number): void;
  activeColor?: string;
  inactiveColor?: string;
}

export interface PickerItem {
  value: number;
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

  componentDidMount() {
    const { data, selectedValue } = this.props;
    if (selectedValue) {
      const index = findIndex(data, (item) => item.value === selectedValue);

      if (index !== -1) {
        delay(() => this.flatListRef?.scrollToIndex({ animated: false, index }), 250);
      }
    }
  }

  render() {
    const { data, label, containerStyle, itemContainerStyle } = this.props;
    const { middleIndex } = this.state;
    const emptyPickerItem: PickerItem = {
      value: 0,
      label: ""
    }
    const newData = [emptyPickerItem].concat(data).concat([emptyPickerItem]);

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={[styles.labelContainer, itemContainerStyle]}>
          <Text style={styles.label}>
            {label}
          </Text>
        </View>
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
          getItemLayout={(_, index) => ITEM_LAYOUT(index)}
        />
      </View>
    );
  }

  private renderItem = ({ item, index }: ListRenderItemInfo<PickerItem>, middleIndex: number | null) => {
    const { data, label, activeColor, inactiveColor, itemContainerStyle } = this.props;

    const isFirstItem = index === 0;
    const isLastItem = index === data.length + 1;

    if (isFirstItem || isLastItem)
      return <View style={styles.firstLastSpacing} />

    const isMiddleItem = middleIndex === index;
    const color = isMiddleItem ? (activeColor || Colors.BLACK) : (inactiveColor || Colors.GRAY_500)

    return (
      <View style={[styles.itemContainer, itemContainerStyle]}>
        <Text style={[styles.itemText, { color }]}>
          {item.label}
        </Text>
        <Text style={[styles.itemText, { color: Colors.TRANSPARENT }]}>
          {label}
        </Text>
      </View>
    );
  };

  private viewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[]; changed: ViewToken[]; }) => {
    const { onValueChange } = this.props;
    const isAtStart = viewableItems.length === 4 && viewableItems[0]?.index === 0;
    const middleItem = isAtStart ? viewableItems[0] : viewableItems[1];
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
  labelContainer: {
    //zIndex: -1,
    position: 'absolute',
    top: 0,
    left: 50,
    right: 0,
    bottom: 2,
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center'
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT
  },
  itemText: {
    fontSize: 17,
    textAlign: 'center'
  },
  firstLastSpacing: {
    height: ITEM_HEIGHT * 2
  },
  label: {
    flex: 1,
    fontSize: 17,
    color: Colors.BLACK,
    textAlign: 'center'
  }
});

export default Picker;