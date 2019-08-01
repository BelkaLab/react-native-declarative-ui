import { Navigation } from 'react-native-navigation';
import { IAutocompletePickerOverlayProps } from '../overlays/AutocompletePickerOverlay/AutocompletePickerOverlay';
import { ICalendarPickerOverlayProps } from '../overlays/CalendarPickerOverlay/CalendarPickerOverlay';
import { IMapPickerOverlayProps } from '../overlays/MapPickerOverlay/MapPickerOverlay';
import { ISelectPickerOverlayProps } from '../overlays/SelectPickerOverlay/SelectPickerOverlay';

export const SELECT_PICKER_OVERLAY_KEY = 'react-native-declarative-ui-select-picker-overlay';
export const AUTOCOMPLETE_PICKER_OVERLAY_KEY = 'react-native-declarative-ui-autocomplete-picker-overlay';
export const CALENDAR_PICKER_OVERLAY_KEY = 'react-native-declarative-ui-calendar-picker-overlay';
export const MAP_PICKER_OVERLAY_KEY = 'react-native-declarative-ui-map-picker-overlay';

export function showSelectOverlay(passProps: ISelectPickerOverlayProps) {
  try {
    Navigation.showOverlay({
      component: {
        name: SELECT_PICKER_OVERLAY_KEY,
        passProps: {
          ...passProps,
          isBackDropMode: true
        },
        options: {
          overlay: {
            interceptTouchOutside: false
          },
          layout: {
            backgroundColor: 'transparent'
          }
        }
      }
    });
  } catch (err) {
    console.log('Cannot use RNN showPickerOverlay before installing dependency');
  }
}

export function showAutocompleteOverlay(passProps: IAutocompletePickerOverlayProps) {
  try {
    Navigation.showOverlay({
      component: {
        name: AUTOCOMPLETE_PICKER_OVERLAY_KEY,
        passProps: {
          ...passProps,
          canExtendFullScreen: true,
          hasTextInput: true,
          minHeight: 350
        },
        options: {
          overlay: {
            interceptTouchOutside: false
          },
          layout: {
            backgroundColor: 'transparent'
          }
        }
      }
    });
  } catch (err) {
    console.log('Cannot use RNN showAutocompleteOverlay before installing dependency');
  }
}

export function showCalendarOverlay(passProps: ICalendarPickerOverlayProps) {
  try {
    Navigation.showOverlay({
      component: {
        name: CALENDAR_PICKER_OVERLAY_KEY,
        passProps,
        options: {
          overlay: {
            interceptTouchOutside: false
          },
          layout: {
            backgroundColor: 'transparent'
          }
        }
      }
    });
  } catch (err) {
    console.log('Cannot use RNN showCalendarOverlay before installing dependency');
  }
}

export function showMapOverlay(passProps: IMapPickerOverlayProps) {
  try {
    Navigation.showOverlay({
      component: {
        name: MAP_PICKER_OVERLAY_KEY,
        passProps: {
          ...passProps,
          canExtendFullScreen: true,
          hasTextInput: true,
          minHeight: 350
        },
        options: {
          overlay: {
            interceptTouchOutside: true
          },
          layout: {
            backgroundColor: 'transparent'
          }
        }
      }
    });
  } catch (err) {
    console.log('Cannot use RNN showMapOverlay before installing dependency');
  }
}
