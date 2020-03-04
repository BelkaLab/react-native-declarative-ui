import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Picker } from '../../components/Picker';
import { PickerItem } from '../../components/Picker/Picker';
import { TextButton } from '../../components/TextButton';
import { withMappedNavigationParams } from 'react-navigation-props-mapper';
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
      <View style={[globalStyles.pickerContainer, { paddingBottom: 34 }]}>
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
    const paddingHorizontal = Platform.OS === "android" ? 16 : 0;

    return (
      <View style={[styles.body, { paddingHorizontal, paddingBottom: 34 }]}>
        <View style={styles.emptySpace} />
        <Picker
          data={this.getHourItems()}
          containerStyle={styles.picker}
          onValueChange={itemValue => this.onValueChange(Number(itemValue), selectedMinute)}
        />
        <Text style={styles.pickerLabel}>ore</Text>
        <View style={styles.emptySpace} />
        <Picker
          data={this.getMinuteItems()}
          containerStyle={styles.picker}
          onValueChange={itemValue => this.onValueChange(selectedHour, Number(itemValue))}
        />
        <Text style={styles.pickerLabel}>minuti</Text>
        <View style={styles.emptySpace} />
      </View>
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
  body: {
    flexDirection: 'row'
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
  emptySpace: {
    flex: 1
  }
});

export default withMappedNavigationParams()(withBottomOverlay(DurationPickerOverlay));
