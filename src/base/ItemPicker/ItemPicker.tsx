import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
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

  componentDidMount() {
    // if (this.props.onRef != null) {
    //   this.props.onRef(this);
    // }
    // if (this.props.apiProp) {
    //   this.getItems();
    // }
  }

  componentWillUnmount() {
    // if (this.props.onRef != null) {
    //   this.props.onRef(null);
    // }
  }

  getSelectedItem = () => {
    // return this.selectableList.getSelectedItem();
  };

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
          <View>Loeader</View>
        ) : (
          // <View style={{ height: '100%' }}>
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
          // </View>
        )}
      </View>
    );
  }

  private renderItem = (item: ComposableItem | string) => {
    return (
      <TouchableHighlight onPress={() => this.props.onPick(item)}>
        {typeof item === 'object' ? <Text>{String(item[this.props.displayProperty!])}</Text> : <Text>{item}</Text>}
      </TouchableHighlight>
    );
  };

  private toggleLoadingIndicator = (show: boolean) => {
    this.setState({
      isLoading: show
    });
  };

  //   private getItems = async (text?: string) => {
  //     const { companyAccessToken, apiProp, filterRegex, isLocalFilter } = this.props;
  //     const { isFirstLoad } = this.state;

  //     this.toggleLoadingIndicator(true);

  //     // not handled via api, filter locally
  //     if (!apiProp || (!isFirstLoad && isLocalFilter)) {
  //       this.setState({
  //         items: text
  //           ? (filter(this.props.items, item => (item[this.props.displayProp] as string).includes(text)) as IItem[])
  //           : this.props.items
  //       });
  //     } else {
  //       const apiCall = retrieveApiCallByApiProp(apiProp!);

  //       if (filterRegex) {
  //         // handled via API, filter on server, with a special condition
  //         // you should add here the logic for more specific filters
  //         const regex = new RegExp(filterRegex);

  //         const [error, items] = await to(
  //           regex.test(text!) ? apiCall(companyAccessToken!, text) : apiCall(companyAccessToken!, undefined, text)
  //         );

  //         if (!items) {
  //           throw error;
  //         } else {
  //           this.setState({
  //             items: this.props.items ? [...this.props.items, ...items] : items
  //           });
  //         }
  //       } else {
  //         // handle via API, filter on server, no custom condition
  //         const [error, items] = await to(apiCall(companyAccessToken!));

  //         if (!items) {
  //           throw error;
  //         } else {
  //           this.setState({
  //             items: this.props.items ? [...this.props.items, ...items] : items
  //           });
  //         }
  //       }
  //     }

  //     this.toggleLoadingIndicator(false);

  //     if (this.state.isFirstLoad) {
  //       this.setState({
  //         isFirstLoad: false
  //       });
  //     }
  //   };

  //   private onSearch = (queryText: string) => {
  //     const { companyAccessToken, apiProp } = this.props;

  //     this.setState({
  //       currentText: queryText
  //     });

  //     retrieveApiCallByApiProp(apiProp!)(companyAccessToken!, queryText);
  //   };

  //   private onChangeText = debounce((queryText: string) => {
  //     this.setState({
  //       currentText: queryText
  //     });

  //     this.onSearch(queryText);
  //   }, 300);

  //   private onDelete = () => {
  //     this.setState({
  //       currentText: ''
  //     });
  //     this.getItems();
  //   };
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
