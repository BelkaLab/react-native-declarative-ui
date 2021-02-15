import React, { FunctionComponent, useState } from 'react';
import { View } from 'react-native';
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
  const {
    pickedDate,
    isAlreadyPicked,
    onPickDate,
    theme,
  } = props;

  const [markedDate, setMarkedDate] = useState<{ [date: string]: DotMarking; }>(
    isAlreadyPicked && pickedDate
      ? {
        [pickedDate]: {
          selected: true
        }
      }
      : {}
  );
  const [selectedDay, setSelectedDay] = useState<string | undefined>(pickedDate);

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
        firstDay={1}
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

export default SingleDayCalendar;