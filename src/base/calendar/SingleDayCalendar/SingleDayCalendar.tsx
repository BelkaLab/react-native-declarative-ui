import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, CalendarTheme, DotMarking } from 'react-native-calendars';
import { Colors } from '../../../styles/colors';

export interface ISingleDayCalendarProps {
  onRef?: (ref: SingleDayCalendar | null) => void;
  pickedDate?: string;
  isAlreadyPicked?: boolean;
  onPickDate?: (date: string) => void;
  theme?: CalendarTheme;
}

interface IState {
  markedDate: {
    [date: string]: DotMarking;
  };
  selectedDay?: string;
}

const CALENDAR_HEIGHT = 350;

export default class SingleDayCalendar extends Component<ISingleDayCalendarProps, IState> {
  constructor(props: ISingleDayCalendarProps) {
    super(props);
    this.state = {
      markedDate:
        props.isAlreadyPicked && props.pickedDate
          ? {
              [props.pickedDate]: {
                selected: true
              }
            }
          : {},
      selectedDay: props.isAlreadyPicked ? props.pickedDate : undefined
    };
  }

  componentDidMount() {
    if (this.props.onRef != null) {
      this.props.onRef(this);
    }
  }

  componentWillUnmount() {
    if (this.props.onRef != null) {
      this.props.onRef(null);
    }
  }

  getSelectedDate = () => {
    return this.state.selectedDay;
  };

  render() {
    const { theme } = this.props;
    const { markedDate, selectedDay } = this.state;

    return (
      <View
        style={{
          height: CALENDAR_HEIGHT,
          backgroundColor: theme ? theme.calendarBackground || Colors.WHITE : Colors.WHITE
        }}
      >
        <Calendar
          current={selectedDay}
          markedDates={markedDate}
          onDayPress={date => {
            this.setState({
              markedDate: {
                ...{ [date.dateString]: { selected: true } }
              },
              selectedDay: date.dateString
            });

            if (this.props.onPickDate) {
              this.props.onPickDate(date.dateString);
            }
          }}
          theme={theme}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pickerContainer: {}
});

const singleDayCalendarStyle: CalendarTheme = {
  // calendarBackground: Colors.MIDDLE_LIGHT_GRAY,
  // textSectionTitleColor: Colors.GRAY_TEXT,
  // selectedDayBackgroundColor: Colors.BLUE_PRIMARY,
  // selectedDayTextColor: Colors.WHITE,
  // todayTextColor: Colors.BLUE_PRIMARY,
  // dayTextColor: Colors.BLACK,
  // arrowColor: Colors.BLUE_PRIMARY,
  // monthTextColor: Colors.BLUE_PRIMARY,
  // textMonthFontWeight: '600',
  // textDayFontSize: 17,
  // textMonthFontSize: 17,
  // textDayHeaderFontSize: 15
};
