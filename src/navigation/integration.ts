import React from 'react';
import { ISelectPickerOverlayProps, SELECT_PICKER_OVERLAY } from '../overlays/SelectPickerOverlay/SelectPickerOverlay';
import { requireWrapper } from '../utils/helper';
export const PICKER_OVERLAY_KEY = 'react-native-declarative-ui-picker-overlay';

export function showOverlay(renderOverlayComponent: (dismissOverlay: () => void) => React.ReactElement<{}>) {
  try {
    const Navigation = requireWrapper('react-native-navigation');

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
    const Navigation = requireWrapper('react-native-navigation');

    Navigation.showOverlay({
      component: {
        name: SELECT_PICKER_OVERLAY,
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
