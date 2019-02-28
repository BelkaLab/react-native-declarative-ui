import React, { Component } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native';
import { ComposableItem } from '../../models/composableItem';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';
import { SearchBar } from '../SearchBar';

export interface ISearchableOverlayItemListProps {
  pickedItem: ComposableItem | string;
  items: ComposableItem[] | string[];
  onFilterItems: (filterText?: string) => Promise<ComposableItem[] | string[]>;
  displayProperty?: string;
  keyProperty?: string;
  onPick: (item: ComposableItem | string) => void;
  topLabel?: string;
  isObjectMappedToKey?: boolean;
  renderOverlayItem?: (item: ComposableItem | string, displayProperty?: string) => React.ReactElement<{}>;
}

interface IState {
  items: ComposableItem[] | string[];
  currentText: string;
  isLoading: boolean;
  isFirstLoad: boolean;
}

export default class SearchableOverlayItemList extends Component<ISearchableOverlayItemListProps, IState> {
  constructor(props: ISearchableOverlayItemListProps) {
    super(props);
    this.state = {
      items: props.items,
      currentText:
        props.pickedItem && typeof props.pickedItem === 'object'
          ? (props.pickedItem[props.displayProperty!] as string) || ''
          : props.pickedItem || '',
      isLoading: false,
      isFirstLoad: true
    };
  }

  render() {
    const { currentText, isLoading } = this.state;

    return (
      <View style={[globalStyles.pickerContainer, { height: Dimensions.get('window').height * 0.8 }]}>
        <SearchBar
          // placeholder={'Cerca'}
          value={currentText}
          onSearch={this.onSearch}
          onChangeText={this.onChangeText}
          onDelete={this.onDelete}
        />
        {this.renderHelperPicker()}
        {isLoading ? (
          <View>
            <Text>Loader</Text>
          </View>
        ) : (
          <FlatList
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
    const { renderOverlayItem: renderSelectPickerItem } = this.props;

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

  private renderHelperPicker = () => {
    const { currentText } = this.state;

    if (this.props.pickedItem && currentText) {
      return (
        <View style={styles.helperPickerContainer}>
          {this.renderUseThisField()}
          <TouchableHighlight
            onPress={() => {
              this.props.onPick('');
            }}
            style={{ paddingVertical: 8, paddingHorizontal: 16 }}
          >
            <View />
            {/* <FeatherIcon name="x" size={16} color={Colors.RED} /> */}
          </TouchableHighlight>
        </View>
      );
    } else {
      return this.renderUseThisField();
    }
  };

  private renderUseThisField = () => {
    const { currentText } = this.state;

    return Boolean(currentText) ? (
      <TouchableHighlight
        onPress={() => {
          this.props.onPick(currentText);
        }}
      >
        <View style={styles.pickedTextContainer}>
          {/* <Body text={localizations.autocomplete_use_this} color={Colors.GRAY_TEXT} /> */}
          <Text>Utilizza: </Text>
          <Text>{currentText}</Text>
        </View>
      </TouchableHighlight>
    ) : (
      <View />
    );
  };

  private toggleLoadingIndicator = (show: boolean) => {
    this.setState({
      isLoading: show
    });
  };

  private onSearch = async (queryText: string) => {
    const { onFilterItems } = this.props;

    this.toggleLoadingIndicator(true);
    const items = await onFilterItems(queryText);
    this.toggleLoadingIndicator(false);

    this.setState({
      currentText: queryText,
      items
    });
  };

  private onChangeText = (filterText: string) => {
    this.setState({
      currentText: filterText
    });

    this.onSearch(filterText);
  };

  private onDelete = () => {
    const { onFilterItems } = this.props;

    this.setState({
      currentText: ''
    });

    onFilterItems();
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
  },
  pickedTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 48,
    paddingHorizontal: 16
  },
  helperPickerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});
