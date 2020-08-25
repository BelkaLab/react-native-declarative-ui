import React, { FunctionComponent } from 'react';
import { Dimensions, Image, LayoutChangeEvent, Platform, StyleSheet, Text, TouchableOpacity as IosTouchableOpacity, TouchableWithoutFeedback as IosTouchableWithoutFeedback, View } from 'react-native';
import { FlatList, TouchableOpacity as AndroidTouchableOpacity, TouchableWithoutFeedback as AndroidTouchableWithoutFeedback } from 'react-native-gesture-handler';
import { isIphoneX } from 'react-native-iphone-x-helper';
import { withMappedNavigationParams } from 'react-navigation-props-mapper';
import { ComposableItem } from '../../models/composableItem';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';
import { IBottomOverlayProps, withBottomOverlay } from '../../hoc/BottomOverlay';
import { isEmpty } from 'lodash';

const TouchableOpacity = Platform.select({
  ios: IosTouchableOpacity,
  android: AndroidTouchableOpacity
});
const TouchableWithoutFeedback = Platform.select({
  ios: IosTouchableWithoutFeedback,
  android: AndroidTouchableWithoutFeedback
});

export interface ISelectPickerOverlayProps {
  items: ComposableItem[] | string[];
  pickedItem?: ComposableItem | string;
  displayProperty?: string;
  keyProperty?: string;
  onPick: (item: ComposableItem | string) => void;
  topLabel?: string;
  isObjectMappedToKey?: boolean;
  renderOverlayItem?: (item: ComposableItem | string, displayProperty?: string) => React.ReactElement<{}>;
  renderTopLabelItem?: (topLabel: string) => React.ReactElement<{}>;
  createNewItemLabel?: string;
  onCreateNewItemPressed?: () => void;
  onListLayout?: (event: LayoutChangeEvent) => void;
  headerBackgroundColor?: string;
  renderCustomBackground?: () => React.ReactElement<{}>;
  selectedItemTextColor?: string;
  selectedItemIconColor?: string;
  createNewItemTextColor?: string;
  createNewItemIconColor?: string;
  ListEmptyComponent?: () => (React.ComponentType<any> | React.ReactElement | null);
}

const SelectPickerOverlay: FunctionComponent<ISelectPickerOverlayProps & IBottomOverlayProps> = (props) => {
  const {
    items,
    renderOverlayItem,
    keyProperty,
    displayProperty,
    onPick,
    dismissOverlay,
    onCreateNewItemPressed,
    createNewItemLabel,
    onListLayout,
    pickedItem,
    selectedItemTextColor = Colors.PRIMARY_BLUE,
    selectedItemIconColor = Colors.PRIMARY_BLUE,
    createNewItemTextColor = Colors.PRIMARY_BLUE,
    createNewItemIconColor = Colors.PRIMARY_BLUE,
    topLabel,
    renderTopLabelItem,
    ListEmptyComponent,
  } = props;

  const renderItem = (item: ComposableItem | string) => {
    return (
      <TouchableOpacity
        onPress={() => {
          onPick(item);
          dismissOverlay();
        }}
      >
        {renderOverlayItem
          ? renderOverlayItem(item, displayProperty)
          : renderDefaultItem(item, keyProperty, displayProperty)}
      </TouchableOpacity>
    );
  };

  const renderDefaultItem = (item: ComposableItem | string, keyProperty?: string, displayProperty?: string) => {
    if (typeof item === 'object' && typeof pickedItem === 'object' && keyProperty && displayProperty) {
      const isSelected = item[keyProperty] === pickedItem[keyProperty];

      return (
        <View style={styles.createNewItemContainer}>
          <Text style={{ color: isSelected ? selectedItemTextColor : Colors.BLACK }}>
            {String(item[displayProperty])}
          </Text>
          {isSelected && (
            <Image source={require('../../assets/ic_check.png')} style={{ tintColor: selectedItemIconColor }} />
          )}
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

  const renderCreateNewItem = () => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          dismissOverlay(onCreateNewItemPressed);
        }}
      >
        <View style={styles.createNewItemButton}>
          <Image
            source={require('../../assets/ic_plus.png')}
            style={{ tintColor: createNewItemIconColor, marginEnd: 8 }}
          />
          <Text
            style={[
              styles.createNewItemText,
              {
                color: createNewItemTextColor
              }
            ]}
          >
            {createNewItemLabel}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const renderTopLabel = () => {
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

  const shouldShowEmptySet = isEmpty(items) && !!ListEmptyComponent;

  return (
    <View style={[globalStyles.pickerContainer]} onLayout={onListLayout}>
      {!shouldShowEmptySet && createNewItemLabel && renderCreateNewItem()}
      {!shouldShowEmptySet && renderTopLabel()}
      <FlatList<string | ComposableItem>
        keyboardShouldPersistTaps="handled"
        data={items}
        scrollEnabled={true}
        style={{ maxHeight: Dimensions.get('window').height * 0.94 - 40 }}
        contentContainerStyle={isIphoneX() && { paddingBottom: 34 }}
        renderItem={({ item }) => renderItem(item)}
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
        ListEmptyComponent={ListEmptyComponent && ListEmptyComponent()}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
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

export default withMappedNavigationParams()(withBottomOverlay(SelectPickerOverlay));
