import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { SingleDayCalendar } from '../../base/calendar/SingleDayCalendar';
import { IRNNBottomOverlayProps, withRNNBottomOverlay } from '../../hoc/RNNBottomOverlay';
import { ComposableFormOptions } from '../../options/SharedOptions';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

export interface ICalendarPickerOverlayProps {
  mode: 'single-day';
  pickedDate: string;
  onConfirm?: (pickedDate: string) => void;
  isAlreadyPicked?: boolean;
  customFormOptions: ComposableFormOptions;
  headerBackgroundColor?: string;
  renderCustomBackground?: () => React.ReactElement<{}>;
}

interface IState {}

class CalendarPickerOverlay extends Component<ICalendarPickerOverlayProps & IRNNBottomOverlayProps, IState> {
  private calendar!: SingleDayCalendar;

  constructor(props: ICalendarPickerOverlayProps & IRNNBottomOverlayProps) {
    super(props);
  }

  render() {
    return (
      <View style={[globalStyles.pickerContainer, { paddingBottom: 34 }]}>
        <SingleDayCalendar
          pickedDate={this.props.pickedDate}
          isAlreadyPicked={this.props.isAlreadyPicked}
          onPickDate={pickedDate => {
            if (this.props.onConfirm) {
              this.props.onConfirm(pickedDate);
            }
            this.props.dismissOverlay();
          }}
          onRef={calendar => {
            if (calendar) {
              this.calendar = calendar;
            }
          }}
          theme={this.props.customFormOptions.calendars && this.props.customFormOptions.calendars.singleDayTheme}
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

export default withRNNBottomOverlay(CalendarPickerOverlay);
