import React, { FunctionComponent, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { withMappedNavigationParams } from 'react-navigation-props-mapper';
import { Picker } from '../../components/Picker';
import { ITEM_HEIGHT, PickerItem } from '../../components/Picker/Picker';
import { TextButton } from '../../components/TextButton';
import { IBottomOverlayProps, withBottomOverlay } from '../../hoc/BottomOverlay';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

export interface IDurationPickerOverlayProps {
  pickedAmount: number;
  onConfirm?: (pickedAmount: number) => void;
  headerBackgroundColor?: string;
  headerButtonColor?: string;
  maxHours?: number;
  hoursInterval?: number;
  maxMinutes?: number;
  minutesInterval?: number;
}

const DurationPickerOverlay: FunctionComponent<IDurationPickerOverlayProps & IBottomOverlayProps> = props => {
  const {
    onConfirm,
    dismissOverlay,
    headerButtonColor = Colors.WHITE,
    headerBackgroundColor = Colors.PRIMARY_BLUE,
    maxHours = 8,
    hoursInterval = 1,
    maxMinutes = 55,
    minutesInterval = 5
  } = props;

  const [selectedHour, setSelectedHour] = useState<number | undefined>(Math.floor((props.pickedAmount || 0) / 60));
  const [selectedMinute, setSelectedMinute] = useState<number | undefined>((props.pickedAmount || 0) % 60);

  const renderPicker = () => {
    const isIOS = Platform.OS === "ios";

    return (
      <>
        <View style={[styles.container, { zIndex: -1, top: isIOS ? 30 : 34 }]}>
          <View style={styles.selectedItemIndicator} />
        </View>
        <View style={styles.body}>
          <Picker
            data={getHourItems()}
            label="ore"
            selectedValue={selectedHour}
            containerStyle={styles.picker}
            itemContainerStyle={{ paddingStart: 80 }}
            onValueChange={itemValue => onValueChange(Number(itemValue), selectedMinute)}
          />
          <Picker
            data={getMinuteItems()}
            label="minuti"
            selectedValue={selectedMinute}
            containerStyle={styles.picker}
            itemContainerStyle={{ paddingEnd: 80 }}
            onValueChange={itemValue => onValueChange(selectedHour, Number(itemValue))}
          />
        </View>
      </>
    );
  };

  const onValueChange = (selectedHour?: number, selectedMinute?: number) => {
    setSelectedHour(selectedHour);
    setSelectedMinute(selectedMinute);
  };

  const getHourItems = () => {
    const items = [];
    // const { maxHour, hourInterval, hourUnit } = this.props;
    const hourUnit = '';
    const interval = maxHours / hoursInterval;
    for (let i = 0; i <= interval; i++) {
      const value = `${i * hoursInterval}`;
      //const item = <Picker.Item key={value} value={value} label={value + hourUnit} />;
      const item: PickerItem = {
        value: value,
        label: value + hourUnit
      }
      items.push(item);
    }
    return items;
  };

  const getMinuteItems = () => {
    const items = [];
    // const { maxMinute, minuteInterval, minuteUnit } = this.props;
    const minuteUnit = '';
    const interval = maxMinutes / minutesInterval;
    for (let i = 0; i <= interval; i++) {
      const value = i * minutesInterval;
      const newValue = value < 10 ? `0${value}` : `${value}`;
      //const item = <Picker.Item key={value} value={newValue} label={newValue + minuteUnit} />;
      const item: PickerItem = {
        value: newValue,
        label: newValue + minuteUnit
      }
      items.push(item);
    }
    return items;
  };

  const onConfirmPressed = () => {
    if (onConfirm) {
      onConfirm(Number((selectedHour || 0) * 60) + Number(selectedMinute || 0));
    }
    dismissOverlay();
  };

  return (
    <View style={[globalStyles.pickerContainer, { height: "100%" }]}>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor }]}>
        <TextButton
          title="Annulla"
          color={headerButtonColor}
          fontWeight="400"
          onPress={() => dismissOverlay()}
        />
        <TextButton
          title="Conferma"
          color={headerButtonColor}
          fontWeight="600"
          onPress={onConfirmPressed}
        />
      </View>
      {renderPicker()}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14
  },
  container: {
    flex: 1,
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedItemIndicator: {
    height: ITEM_HEIGHT,
    width: "100%",
    alignSelf: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.GRAY_200
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 80
  },
  picker: {
    flex: 1,
    paddingTop: 2
  },
  spaceBetweenPickers: { width: 20 }
});

export default withMappedNavigationParams()(withBottomOverlay(DurationPickerOverlay));
