import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { withMappedNavigationParams } from 'react-navigation-props-mapper';
import { Picker } from '../../components/Picker';
import { ITEM_HEIGHT, PickerItem } from '../../components/Picker/Picker';
import { TextButton } from '../../components/TextButton';
import { IBottomOverlayProps, withBottomOverlay } from '../../hoc/BottomOverlay';
import { ComposableFormOptions } from '../../options/SharedOptions';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

export interface IDurationPickerOverlayProps {
  pickedAmount: number;
  onConfirm?: (pickedAmount: number) => void;
  customFormOptions: ComposableFormOptions;
  headerBackgroundColor?: string;
  renderCustomBackground?: () => React.ReactElement<{}>;
  headerButtonColor?: string;
}

interface IState {
  selectedHour?: number;
  selectedMinute?: number;
}

class DurationPickerOverlay extends Component<IDurationPickerOverlayProps & IBottomOverlayProps, IState> {
  constructor(props: IDurationPickerOverlayProps & IBottomOverlayProps) {
    super(props);
    this.state = {
      selectedHour: Math.floor((props.pickedAmount || 0) / 60),
      selectedMinute: (props.pickedAmount || 0) % 60
    };
  }

  render() {
    const {
      headerButtonColor = Colors.WHITE,
      headerBackgroundColor = Colors.PRIMARY_BLUE
    } = this.props;

    return (
      <View style={[globalStyles.pickerContainer, { height: "100%" }]}>
        <View style={[styles.header, { backgroundColor: headerBackgroundColor }]}>
          <TextButton
            title="Annulla"
            color={headerButtonColor}
            fontWeight="400"
            onPress={() => this.props.dismissOverlay()}
          />
          <TextButton
            title="Conferma"
            color={headerButtonColor}
            fontWeight="600"
            onPress={this.onConfirmPressed}
          />
        </View>
        {this.renderPicker()}
      </View>
    );
  }

  private renderPicker = () => {
    const { selectedHour, selectedMinute } = this.state;

    return (
      <>
        <View style={[styles.container, {zIndex: -1}]}>
          <View style={styles.selectedItemIndicator} />
        </View>
        <View style={styles.body}>
          <Picker
            data={this.getHourItems()}
            label="ore"
            selectedValue={selectedHour}
            containerStyle={styles.picker}
            itemContainerStyle={{paddingStart: 80}}
            onValueChange={itemValue => this.onValueChange(Number(itemValue), selectedMinute)}
          />
          <Picker
            data={this.getMinuteItems()}
            label="minuti"
            selectedValue={selectedMinute}
            containerStyle={styles.picker}
            itemContainerStyle={{paddingEnd: 80}}
            onValueChange={itemValue => this.onValueChange(selectedHour, Number(itemValue))}
          />
        </View>
      </>
    );
  };

  onValueChange = (selectedHour?: number, selectedMinute?: number) => {
    this.setState({ selectedHour, selectedMinute });
  };

  getHourItems = () => {
    const items = [];
    // const { maxHour, hourInterval, hourUnit } = this.props;
    const maxHour = 8;
    const hourInterval = 1;
    const hourUnit = '';
    const interval = maxHour / hourInterval;
    for (let i = 0; i <= interval; i++) {
      const value = `${i * hourInterval}`;
      //const item = <Picker.Item key={value} value={value} label={value + hourUnit} />;
      const item: PickerItem = {
        value: value,
        label: value + hourUnit
      }
      items.push(item);
    }
    return items;
  };

  getMinuteItems = () => {
    const items = [];
    // const { maxMinute, minuteInterval, minuteUnit } = this.props;
    const maxMinute = 55;
    const minuteInterval = 5;
    const minuteUnit = '';
    const interval = maxMinute / minuteInterval;
    for (let i = 0; i <= interval; i++) {
      const value = i * minuteInterval;
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

  private onConfirmPressed = () => {
    if (this.props.onConfirm) {
      this.props.onConfirm(Number((this.state.selectedHour || 0) * 60) + Number(this.state.selectedMinute || 0));
    }
    this.props.dismissOverlay();
  };
}

const HEADER_HEIGHT = 48;

const styles = StyleSheet.create({
  listHeaderContainer: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6,
    backgroundColor: Colors.GRAY_200,
    paddingHorizontal: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14
  },
  buttonText: { fontSize: 17 },
  buttonContainer: { height: HEADER_HEIGHT, justifyContent: 'center' },
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
  pickerLabel: {
    fontSize: 17,
    color: Colors.BLACK,
    alignSelf: 'center'
  },
  spaceBetweenPickers: { width: 20 }
});

export default withMappedNavigationParams()(withBottomOverlay(DurationPickerOverlay));
