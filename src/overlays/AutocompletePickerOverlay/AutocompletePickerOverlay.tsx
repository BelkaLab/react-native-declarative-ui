import React, { FunctionComponent, useState, useEffect } from 'react';
import { Dimensions, Image, Platform, StyleSheet, Text, TouchableOpacity as IosTouchableOpacity, View } from 'react-native';
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';
import { FlatList, TouchableOpacity as AndroidTouchableOpacity } from 'react-native-gesture-handler';
import { withMappedNavigationParams } from 'react-navigation-props-mapper';
import { SearchBar } from '../../base/autocomplete/SearchBar';
import { ComposableItem } from '../../models/composableItem';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';
import { withBottomOverlay, IBottomOverlayProps } from '../../hoc/BottomOverlay';

const TouchableOpacity = Platform.select({
  ios: IosTouchableOpacity,
  android: AndroidTouchableOpacity
});

export interface IAutocompletePickerOverlayProps {
  pickedItem: ComposableItem | string;
  items: ComposableItem[] | string[];
  onFilterItems: (filterText?: string) => Promise<ComposableItem[] | string[]>;
  displayProperty?: string;
  keyProperty?: string;
  onPick: (item: ComposableItem | string) => void;
  topLabel?: string;
  isObjectMappedToKey?: boolean;
  renderOverlayItem?: (item: ComposableItem | string, displayProperty?: string) => React.ReactElement<{}>;
  headerBackgroundColor?: string;
  renderCustomBackground?: () => React.ReactElement<{}>;
  isMandatory?: boolean;
}

const AutocompletePickerOverlay: FunctionComponent<IAutocompletePickerOverlayProps & IBottomOverlayProps> = (props) => {
  const {
    renderOverlayItem: renderSelectPickerItem,
    onPick,
    dismissOverlay,
    displayProperty,
    pickedItem,
    onFilterItems,
  } = props;

  const [items, setItems] = useState<ComposableItem[] | string[]>(props.items);
  const [currentText, setCurrentText] = useState<string>(
    props.pickedItem && typeof props.pickedItem === 'object'
      ? (props.pickedItem[props.displayProperty!] as string) || ''
      : props.pickedItem || ''
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      AndroidKeyboardAdjust.setAdjustPan();
    }

    return () => {
      if (Platform.OS === 'android') {
        AndroidKeyboardAdjust.setAdjustResize();
      }
    }
  }, []);

  const renderItem = (item: ComposableItem | string) => {
    return (
      <TouchableOpacity
        onPress={() => {
          onPick(item);
          dismissOverlay();
        }}
      >
        {renderSelectPickerItem
          ? renderSelectPickerItem(item, displayProperty)
          : renderDefaultItem(item)}
      </TouchableOpacity>
    );
  };

  const renderDefaultItem = (item: ComposableItem | string) => {
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

  const renderHelperPicker = () => {
    if (pickedItem && currentText) {
      return (
        <View style={styles.helperPickerContainer}>
          {renderUseThisField()}
          <TouchableOpacity
            onPress={() => {
              onPick('');
            }}
            style={{ padding: 8, marginHorizontal: 16 }}
          >
            <Image
              source={require('../../assets/android_clear_input.png')}
              style={{ tintColor: Colors.RED, width: 16, height: 16 }}
            />
          </TouchableOpacity>
        </View>
      );
    } else {
      return renderUseThisField();
    }
  };

  const renderUseThisField = () => {
    return Boolean(currentText) ? (
      <TouchableOpacity
        onPress={() => {
          onPick(currentText);
        }}
      >
        <View style={styles.pickedTextContainer}>
          <Text style={{ color: Colors.GRAY_600 }}>Use: </Text>
          <Text style={{ fontWeight: '600' }}>{currentText}</Text>
        </View>
      </TouchableOpacity>
    ) : (
        <View />
      );
  };

  const toggleLoadingIndicator = (show: boolean) => {
    setIsLoading(show);
  };

  const onSearch = async (queryText: string) => {
    toggleLoadingIndicator(true);
    const items = await onFilterItems(queryText);
    toggleLoadingIndicator(false);

    setCurrentText(queryText);
    setItems(items);
  };

  const onChangeText = (filterText: string) => {
    setCurrentText(filterText);

    onSearch(filterText);
  };

  const onDelete = () => {
    setCurrentText('');

    onFilterItems();
  };

  return (
    <View style={[globalStyles.pickerContainer, { height: Dimensions.get('window').height }]}>
      <SearchBar
        // placeholder={'Cerca'}
        value={currentText}
        onSearch={onSearch}
        onChangeText={onChangeText}
        onDelete={onDelete}
      />
      {renderHelperPicker()}
      {isLoading ? (
        <View>
          <Text>Loader</Text>
        </View>
      ) : (
          <FlatList<string | ComposableItem>
            keyboardShouldPersistTaps="handled"
            data={items}
            //   contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => renderItem(item)}
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
            keyExtractor={(item, index) => index.toString()}
          />
        )}
    </View>
  );
}

const HEADER_HEIGHT = 48;

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

export default withMappedNavigationParams()(withBottomOverlay(AutocompletePickerOverlay));
