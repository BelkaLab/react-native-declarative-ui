import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ComposableItem } from '../../models/composableItem';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

export interface IItemPickerProps {
  pickedItem: ComposableItem | string;
  items: ComposableItem[] | string[];
  displayProperty?: string;
  keyProperty?: string;
  onPick: (item: ComposableItem | string) => void;
  topLabel?: string;
  isObjectMappedToKey?: boolean;
  renderSelectPickerItem?: (item: ComposableItem | string, displayProperty?: string) => React.ReactElement<{}>;
}

interface IState {
  items: ComposableItem[] | string[];
  //   currentText: string;
  isLoading: boolean;
  isFirstLoad: boolean;
}

export default class ItemPicker extends Component<IItemPickerProps, IState> {
  //   private selectableList!: GenericSelectableListTypeComponent<IItem>;

  constructor(props: IItemPickerProps) {
    super(props);
    this.state = {
      items: props.items,
      //   currentText: props.pickedItem ? (props.pickedItem[props.displayProp] as string) || '' : props.pickedItem || '',
      isLoading: false,
      isFirstLoad: true
    };
  }

  render() {
    // const { currentText, isLoading } = this.state;
    // const { isFilterable, topLabel } = this.props;
    const { isLoading } = this.state;
    const { topLabel } = this.props;

    return (
      <View style={globalStyles.pickerContainer}>
        {
          //     isFilterable ? (
          //   <SearchBar
          //     style={styles.searchBar}
          //     placeholder={localizations.omni_search_title}
          //     value={currentText}
          //     onSearch={this.onSearch}
          //     onChangeText={this.onChangeText}
          //     onDelete={this.onDelete}
          //     isInPicker={true}
          //   />
          // ) :
          <View style={styles.listHeaderContainer}>
            <Text>{topLabel}</Text>
          </View>
        }
        {isLoading ? (
          //   <CloudLoader />
          <View>Loader</View>
        ) : (
          <FlatList
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
    const { renderSelectPickerItem } = this.props;

    return (
      <TouchableOpacity onPress={() => this.props.onPick(item)}>
        {renderSelectPickerItem
          ? renderSelectPickerItem(item, this.props.displayProperty)
          : this.renderDefaultItem(item)}
      </TouchableOpacity>
    );
  };

  private renderDefaultItem = (item: ComposableItem | string) => {
    return (
      <View style={{ padding: 16 }}>
        {typeof item === 'object' && this.props.displayProperty ? (
          <Text>{String(item[this.props.displayProperty])}</Text>
        ) : (
          <Text>{item}</Text>
        )}
      </View>
    );
  };

  private toggleLoadingIndicator = (show: boolean) => {
    this.setState({
      isLoading: show
    });
  };
}

const HEADER_HEIGHT = 52;

const styles = StyleSheet.create({
  searchBar: {
    alignItems: 'center'
  },
  listHeaderContainer: {
    height: HEADER_HEIGHT,
    backgroundColor: Colors.GRAY_200,
    paddingLeft: 16,
    paddingBottom: 8,
    justifyContent: 'flex-end'
  }
});
