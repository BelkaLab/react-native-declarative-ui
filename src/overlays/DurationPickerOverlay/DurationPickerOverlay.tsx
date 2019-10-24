import { Picker } from '@react-native-community/picker';
import React, { Component } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { IRNNBottomOverlayProps, withRNNBottomOverlay } from '../../hoc/RNNBottomOverlay';
import { ComposableFormOptions } from '../../options/SharedOptions';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

export interface IDurationPickerOverlayProps {
  pickedAmount: number;
  onConfirm?: (pickedAmount: number) => void;
  customFormOptions: ComposableFormOptions;
  headerBackgroundColor?: string;
  renderCustomBackground?: () => React.ReactElement<{}>;
}

interface IState {
  selectedHour?: number;
  selectedMinute?: number;
}

class DurationPickerOverlay extends Component<IDurationPickerOverlayProps & IRNNBottomOverlayProps, IState> {
  constructor(props: IDurationPickerOverlayProps & IRNNBottomOverlayProps) {
    super(props);
    this.state = {
      selectedHour: Math.floor((props.pickedAmount || 0) / 60),
      selectedMinute: (props.pickedAmount || 0) % 60
    };
  }

  render() {
    return (
      <View style={[globalStyles.pickerContainer, { paddingBottom: 34 }]}>
        {this.renderPicker()}
        <View style={{ paddingHorizontal: 16, marginBottom: 34 }}>
          <Button title="Conferma" onPress={this.onConfirmPressed} />
        </View>
      </View>
    );
  }

  private renderPicker = () => {
    const { selectedHour, selectedMinute } = this.state;

    return (
      <View>
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, marginStart: 4 }}>
          <Text style={{ fontSize: 16, flex: 1 }}>Ore</Text>
          <Text style={{ fontSize: 16, flex: 1 }}>Minuti</Text>
        </View>
        <View style={styles.body}>
          <Picker
            selectedValue={`${selectedHour}`}
            style={styles.picker}
            // itemStyle={this.props.itemStyle}
            onValueChange={itemValue => this.onValueChange(Number(itemValue), selectedMinute)}
          >
            {this.getHourItems()}
          </Picker>
          <Text style={styles.separator}>:</Text>
          <Picker
            selectedValue={selectedMinute && selectedMinute < 10 ? `0${selectedMinute}` : `${selectedMinute}`}
            style={styles.picker}
            // itemStyle={this.props.itemStyle}
            onValueChange={itemValue => this.onValueChange(selectedHour, Number(itemValue))}
          >
            {this.getMinuteItems()}
          </Picker>
        </View>
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
      const item = <Picker.Item key={value} value={value} label={value + hourUnit} />;
      items.push(item);
    }
    return items;
  };

  getMinuteItems = () => {
    const items = [];
    // const { maxMinute, minuteInterval, minuteUnit } = this.props;
    const maxMinute = 59;
    const minuteInterval = 1;
    const minuteUnit = '';
    const interval = maxMinute / minuteInterval;
    for (let i = 0; i <= interval; i++) {
      const value = i * minuteInterval;
      const newValue = value < 10 ? `0${value}` : `${value}`;
      const item = <Picker.Item key={value} value={newValue} label={newValue + minuteUnit} />;
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
  buttonContainer: { height: HEADER_HEIGHT, justifyContent: 'center' },
  body: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8
  },
  picker: {
    flex: 1
  },
  separator: {
    alignSelf: 'center',
    fontSize: 16
  }
});

export default withRNNBottomOverlay(DurationPickerOverlay);
