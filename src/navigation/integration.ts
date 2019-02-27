import { Navigation } from 'react-native-navigation';

export const SLIDE_BOTTOM_OVERLAY_KEY = 'react-native-declarative-ui-slide-bottom-overlay';

export function showOverlay(renderOverlayComponent: (dismissOverlay: () => void) => React.ReactElement<{}>) {
  //   Navigation.showOverlay({
  //     component: {
  //       name: OverlayKeys.notificationOverlay,
  //       passProps: {
  //         type,
  //         message,
  //         dismissDuration
  //       },
  //       options: {
  //         overlay: {
  //           interceptTouchOutside: false
  //         },
  //         layout: {
  //           backgroundColor: 'transparent'
  //         }
  //       }
  //     }
  //   });

  Navigation.showOverlay({
    component: {
      name: SLIDE_BOTTOM_OVERLAY_KEY,
      passProps: {
        renderOverlayComponent
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
}
