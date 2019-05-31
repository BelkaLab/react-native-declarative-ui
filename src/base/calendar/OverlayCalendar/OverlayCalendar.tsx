import React, { Component } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { ComposableFormOptions } from '../../../options/SharedOptions';
import { Colors } from '../../../styles/colors';
import { globalStyles } from '../../../styles/globalStyles';
import { SingleDayCalendar } from '../SingleDayCalendar';

export interface IOverlayCalendarProps {
  mode: 'single-day';
  pickedDate: string;
  onCancel?: () => void;
  onConfirm?: (pickedDate: string) => void;
  isAlreadyPicked?: boolean;
  customFormOptions: ComposableFormOptions;
}

interface IState {}

export default class OverlayCalendar extends Component<IOverlayCalendarProps, IState> {
  private calendar!: SingleDayCalendar;

  constructor(props: IOverlayCalendarProps) {
    super(props);
  }

  render() {
    return (
      <View style={globalStyles.pickerContainer}>
        <View style={styles.listHeaderContainer}>
          <TouchableWithoutFeedback onPress={this.props.onCancel}>
            <View style={styles.buttonContainer}>
              <Text>Annulla</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={this.onConfirmPressed}>
            <View style={styles.buttonContainer}>
              <Text>Conferma</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <SingleDayCalendar
          pickedDate={this.props.pickedDate}
          isAlreadyPicked={this.props.isAlreadyPicked}
          onRef={calendar => {
            if (calendar) {
              this.calendar = calendar;
            }
          }}
          theme={this.props.customFormOptions.calendars.singleDayTheme}
        />
      </View>
    );
  }

  private onConfirmPressed = () => {
    const pickedDate = this.calendar.getSelectedDate();

    if (this.props.onConfirm && pickedDate) {
      this.props.onConfirm(pickedDate);
    }
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
  buttonContainer: { height: HEADER_HEIGHT, justifyContent: 'center' }
});
