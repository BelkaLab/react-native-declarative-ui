import React from 'react';
import { SelectPickerOverlay } from '../overlays/SelectPickerOverlay';
import { AutocompletePickerOverlay } from '../overlays/AutocompletePickerOverlay';
import { CalendarPickerOverlay } from '../overlays/CalendarPickerOverlay';
import { DurationPickerOverlay } from '../overlays/DurationPickerOverlay';
import { MapPickerOverlay } from '../overlays/MapPickerOverlay';
import { createStackNavigator } from '@react-navigation/stack';
import { bottomSheetOptions } from '../hoc/BottomOverlay';
import { SelectPickerSectionOverlay } from '../overlays/SelectPickerSectionOverlay';

export const SELECT_PICKER_OVERLAY_KEY = 'react-native-declarative-ui-select-picker-overlay';
export const SELECT_PICKER_SECTION_OVERLAY_KEY = 'react-native-declarative-ui-select-picker-section-overlay';
export const AUTOCOMPLETE_PICKER_OVERLAY_KEY = 'react-native-declarative-ui-autocomplete-picker-overlay';
export const CALENDAR_PICKER_OVERLAY_KEY = 'react-native-declarative-ui-calendar-picker-overlay';
export const DURATION_PICKER_OVERLAY_KEY = 'react-native-declarative-ui-calendar-duration-overlay';
export const MAP_PICKER_OVERLAY_KEY = 'react-native-declarative-ui-map-picker-overlay';

const Stack = createStackNavigator();

export const ComposableFormModals = [
  <Stack.Screen
    name={SELECT_PICKER_OVERLAY_KEY}
    component={SelectPickerOverlay}
    options={bottomSheetOptions}
  />,
  <Stack.Screen
    name={SELECT_PICKER_SECTION_OVERLAY_KEY}
    component={SelectPickerSectionOverlay}
    options={bottomSheetOptions}
  />,
  <Stack.Screen
    name={AUTOCOMPLETE_PICKER_OVERLAY_KEY}
    component={AutocompletePickerOverlay}
    options={bottomSheetOptions}
  />,
  <Stack.Screen
    name={CALENDAR_PICKER_OVERLAY_KEY}
    component={CalendarPickerOverlay}
    options={bottomSheetOptions}
  />,
  <Stack.Screen
    name={DURATION_PICKER_OVERLAY_KEY}
    component={DurationPickerOverlay}
    options={bottomSheetOptions}
  />,
  <Stack.Screen
    name={MAP_PICKER_OVERLAY_KEY}
    component={MapPickerOverlay}
    options={bottomSheetOptions}
  />,
];

// export function showSelectOverlay(passProps: ISelectPickerOverlayProps) {
//   try {
//     Navigation.showOverlay({
//       component: {
//         name: SELECT_PICKER_OVERLAY_KEY,
//         passProps: {
//           ...passProps,
//           isBackDropMode: true
//         },
//         options: {
//           overlay: {
//             interceptTouchOutside: false
//           },
//           layout: {
//             backgroundColor: 'transparent'
//           }
//         }
//       }
//     });
//   } catch (err) {
//     console.log('Cannot use RNN showPickerOverlay before installing dependency');
//   }
// }

// export function showAutocompleteOverlay(passProps: IAutocompletePickerOverlayProps) {
//   try {
//     Navigation.showOverlay({
//       component: {
//         name: AUTOCOMPLETE_PICKER_OVERLAY_KEY,
//         passProps: {
//           ...passProps,
//           canExtendFullScreen: true,
//           hasTextInput: true,
//           minHeight: 350
//         },
//         options: {
//           overlay: {
//             interceptTouchOutside: false
//           },
//           layout: {
//             backgroundColor: 'transparent'
//           }
//         }
//       }
//     });
//   } catch (err) {
//     console.log('Cannot use RNN showAutocompleteOverlay before installing dependency');
//   }
// }

// export function showCalendarOverlay(passProps: ICalendarPickerOverlayProps) {
//   try {
//     Navigation.showOverlay({
//       component: {
//         name: CALENDAR_PICKER_OVERLAY_KEY,
//         passProps,
//         options: {
//           overlay: {
//             interceptTouchOutside: false
//           },
//           layout: {
//             backgroundColor: 'transparent'
//           }
//         }
//       }
//     });
//   } catch (err) {
//     console.log('Cannot use RNN showCalendarOverlay before installing dependency');
//   }
// }

// export function showDurationOverlay(passProps: IDurationPickerOverlayProps) {
//   try {
//     Navigation.showOverlay({
//       component: {
//         name: DURATION_PICKER_OVERLAY_KEY,
//         passProps: {
//           ...passProps,
//           disabledInteraction: Platform.OS === 'android'
//         },
//         options: {
//           overlay: {
//             interceptTouchOutside: false
//           },
//           layout: {
//             backgroundColor: 'transparent'
//           }
//         }
//       }
//     });
//   } catch (err) {
//     console.log('Cannot use RNN showCalendarOverlay before installing dependency');
//   }
// }

// export function showMapOverlay(passProps: IMapPickerOverlayProps) {
//   try {
//     Navigation.showOverlay({
//       component: {
//         name: MAP_PICKER_OVERLAY_KEY,
//         passProps: {
//           ...passProps,
//           canExtendFullScreen: true,
//           hasTextInput: true,
//           minHeight: 350
//         },
//         options: {
//           overlay: {
//             interceptTouchOutside: true
//           },
//           layout: {
//             backgroundColor: 'transparent'
//           }
//         }
//       }
//     });
//   } catch (err) {
//     console.log('Cannot use RNN showMapOverlay before installing dependency');
//   }
// }
