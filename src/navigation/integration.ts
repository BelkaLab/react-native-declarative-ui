import React from 'react';
import { Navigation } from 'react-native-navigation';
import { ISelectPickerOverlayProps } from '../overlays/SelectPickerOverlay/SelectPickerOverlay';

export const PICKER_OVERLAY_KEY = 'react-native-declarative-ui-picker-overlay';
export const SELECT_PICKER_OVERLAY_KEY = 'react-native-declarative-ui-select-picker-overlay';

export function showOverlay(renderOverlayComponent: (dismissOverlay: () => void) => React.ReactElement<{}>) {
  try {
    Navigation.showOverlay({
      component: {
        name: PICKER_OVERLAY_KEY,
        passProps: {
          renderOverlayComponent
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

export function showPickerOverlay(passProps: ISelectPickerOverlayProps) {
  try {
    Navigation.showOverlay({
      component: {
        name: SELECT_PICKER_OVERLAY_KEY,
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
    console.log('Cannot use RNN showPickerOverlay before installing dependency');
  }
}
