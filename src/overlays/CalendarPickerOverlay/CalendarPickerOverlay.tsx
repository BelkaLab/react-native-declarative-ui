import React, { FunctionComponent, useState } from 'react';
import { View } from 'react-native';
import { SingleDayCalendar } from '../../base/calendar/SingleDayCalendar';
import { ComposableFormOptions } from '../../options/SharedOptions';
import { globalStyles } from '../../styles/globalStyles';
import { withMappedNavigationParams } from 'react-navigation-props-mapper';
import withRNBottomSheet, { IRNBottomSheetProps } from '../../hoc/withRNBottomSheet';

export interface ICalendarPickerOverlayProps {
  mode: 'single-day';
  pickedDate: string;
  onConfirm?: (pickedDate: string) => void;
  isAlreadyPicked?: boolean;
  customFormOptions: ComposableFormOptions;
  headerBackgroundColor?: string;
  renderCustomBackground?: () => React.ReactElement<{}>;
}

const CalendarPickerOverlay: FunctionComponent<ICalendarPickerOverlayProps & IRNBottomSheetProps> = (props) => {
  const {
    onConfirm,
    pickedDate,
    isAlreadyPicked,
    dismissOverlay,
    customFormOptions,
  } = props;

  return (
    <View style={[globalStyles.pickerContainer, { paddingBottom: 34 }]}>
      <SingleDayCalendar
        pickedDate={pickedDate}
        isAlreadyPicked={isAlreadyPicked}
        onPickDate={pickedDate => {
          if (onConfirm) {
            onConfirm(pickedDate);
          }
          dismissOverlay();
        }}
        theme={customFormOptions.calendars && customFormOptions.calendars.singleDayTheme}
      />
    </View>
  );
}

export default withMappedNavigationParams()(withRNBottomSheet(CalendarPickerOverlay));
