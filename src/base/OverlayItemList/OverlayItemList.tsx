import React, { Component } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { ComposableItem } from '../../models/composableItem';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

export interface IOverlayItemListProps {
  items: ComposableItem[] | string[];
  pickedItem?: ComposableItem | string;
  displayProperty?: string;
  keyProperty?: string;
  onPick: (item: ComposableItem | string) => void;
  topLabel?: string;
  isObjectMappedToKey?: boolean;
  headerBackgroundColor?: string;
  renderCustomBackground?: () => React.ReactElement<{}>;
  renderOverlayItem?: (item: ComposableItem | string, displayProperty?: string) => React.ReactElement<{}>;
  renderTopLabelItem?: (topLabel: string) => React.ReactElement<{}>;
  createNewItemLabel?: string;
  onCreateNewItemPressed?: () => void;
}

interface IState {
  items: ComposableItem[] | string[];
  isLoading: boolean;
  isFirstLoad: boolean;
}

export default class OverlayItemList extends Component<IOverlayItemListProps, IState> {
  constructor(props: IOverlayItemListProps) {
    super(props);
    this.state = {
      items: props.items,
      isLoading: false,
      isFirstLoad: true
    };
  }

  render() {
    const { isLoading } = this.state;

    return (
      <View style={globalStyles.pickerContainer}>
        {this.renderHeader()}
        {this.props.createNewItemLabel && this.renderCreateNewItem()}
        {this.renderTopLabel()}
        {isLoading ? (
          <View>Loader</View>
        ) : (
          <FlatList<string | ComposableItem>
            // contentContainerStyle={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
            data={this.state.items}
            //   contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => this.renderItem(item)}
            //   ListEmptyComponent={this.props.emptySetPlaceholder}
            ItemSeparatorComponent={() => (
              <View
                style={{
                  height: 1,
                  width: '100%',
                  backgroundColor: Colors.GRAY_200,
                  marginLeft: 16
                }}
              />
            )}
            extraData={this.state}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
    );
  }

  private renderItem = (item: ComposableItem | string) => {
    const { renderOverlayItem, keyProperty, displayProperty } = this.props;

    return (
      <TouchableOpacity onPress={() => this.props.onPick(item)}>
        {renderOverlayItem
          ? renderOverlayItem(item, displayProperty)
          : this.renderDefaultItem(item, keyProperty, displayProperty)}
      </TouchableOpacity>
    );
  };

  private renderDefaultItem = (item: ComposableItem | string, keyProperty?: string, displayProperty?: string) => {
    const { pickedItem } = this.props;
    if (typeof item === 'object' && typeof pickedItem === 'object' && keyProperty && displayProperty) {
      const isSelected = item[keyProperty] === pickedItem[keyProperty];

      return (
        <View style={styles.createNewItemContainer}>
          <Text style={{ color: isSelected ? Colors.PRIMARY_BLUE : Colors.BLACK }}>
            {String(item[displayProperty])}
          </Text>
          <Image source={require('../../assets/ic_check.png')} style={{ tintColor: Colors.PRIMARY_BLUE }} />
        </View>
      );
    }

    return (
      <View style={{ padding: 16 }}>
        {typeof item === 'object' && displayProperty ? (
          <Text>{String(item[displayProperty])}</Text>
        ) : (
          <Text>{item}</Text>
        )}
      </View>
    );
  };

  private renderHeader = () => {
    const { headerBackgroundColor, renderCustomBackground } = this.props;

    if (renderCustomBackground) {
      return (
        <View style={styles.listHeaderCustomerContainer}>
          <View style={styles.customBackgroundContainer}>{renderCustomBackground()}</View>
        </View>
      );
    }
    return (
      <View
        style={[
          styles.listHeaderContainer,
          {
            backgroundColor: headerBackgroundColor || Colors.WHITE
          }
        ]}
      />
    );
  };

  private renderCreateNewItem = () => {
    return (
      <TouchableWithoutFeedback onPress={this.props.onCreateNewItemPressed}>
        <View style={styles.createNewItemButton}>
        <Image source={require('../../assets/ic_plus.png')} style={{ tintColor: Colors.PRIMARY_BLUE, marginEnd: 8 }} />
          <Text style={styles.createNewItemText}>{this.props.createNewItemLabel}</Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  private renderTopLabel = () => {
    const { topLabel, renderTopLabelItem } = this.props;

    if (topLabel) {
      return renderTopLabelItem ? (
        renderTopLabelItem(topLabel)
      ) : (
        <View style={styles.topLabelContainer}>
          <Text style={{ fontSize: 15 }}>{topLabel}</Text>
        </View>
      );
    }

    return null;
  };

  private toggleLoadingIndicator = (show: boolean) => {
    this.setState({
      isLoading: show
    });
  };
}

const HEADER_HEIGHT = 48;
const TOP_LABEL_HEIGHT = 40;

const styles = StyleSheet.create({
  searchBar: {
    alignItems: 'center'
  },
  listHeaderContainer: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 16
  },
  listHeaderCustomerContainer: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6
  },
  customBackgroundContainer: {
    position: 'absolute',
    height: HEADER_HEIGHT,
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6
  },
  buttonContainer: { height: HEADER_HEIGHT, justifyContent: 'center' },
  topLabelContainer: {
    height: TOP_LABEL_HEIGHT,
    backgroundColor: Colors.GRAY_200,
    paddingLeft: 16,
    paddingBottom: 8,
    paddingTop: 14
  },
  createNewItemContainer: { padding: 16, flexDirection: 'row', justifyContent: 'space-between' },
  createNewItemButton: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  createNewItemText: { fontSize: 17, color: Colors.PRIMARY_BLUE }
});
