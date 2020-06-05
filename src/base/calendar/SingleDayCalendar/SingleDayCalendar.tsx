import React, { FunctionComponent, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, CalendarTheme, DotMarking } from 'react-native-calendars';
import { Colors } from '../../../styles/colors';

export interface ISingleDayCalendarProps {
  pickedDate?: string;
  isAlreadyPicked?: boolean;
  onPickDate?: (date: string) => void;
  theme?: CalendarTheme;
}

const CALENDAR_HEIGHT = 350;

const SingleDayCalendar: FunctionComponent<ISingleDayCalendarProps> = (props) => {
  const [markedDate, setMarkedDate] = useState<{ [date: string]: DotMarking; }>(
    props.isAlreadyPicked && props.pickedDate
      ? {
        [props.pickedDate]: {
          selected: true
        }
      }
      : {}
  );
  const [selectedDay, setSelectedDay] = useState<string | undefined>();

  const {
    theme,
    onPickDate,
  } = props;

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
          setMarkedDate({
            [date.dateString]: { selected: true }
          });
          setSelectedDay(date.dateString);

          if (onPickDate) {
            onPickDate(date.dateString);
          }
        }}
        theme={theme}
      />
    </View>
  );
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

export default SingleDayCalendar;