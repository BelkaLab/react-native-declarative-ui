import React, { FunctionComponent } from 'react';
import { View } from 'react-native';
import { withMappedNavigationParams } from 'react-navigation-props-mapper';
import { SingleDayCalendar } from '../../base/calendar/SingleDayCalendar';
import { IBottomOverlayProps, withBottomOverlay } from '../../hoc/BottomOverlay';
import { ComposableFormOptions } from '../../options/SharedOptions';
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

const CalendarPickerOverlay: FunctionComponent<ICalendarPickerOverlayProps & IBottomOverlayProps> = (props) => {
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

export default withMappedNavigationParams()(withBottomOverlay(CalendarPickerOverlay));
