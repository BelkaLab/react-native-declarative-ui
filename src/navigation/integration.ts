export const SLIDE_BOTTOM_OVERLAY_KEY = 'react-native-declarative-ui-slide-bottom-overlay';

export function showOverlay(renderOverlayComponent: (dismissOverlay: () => void) => React.ReactElement<{}>) {
  try {
    const Navigation = require('react-native-navigation');

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
  } catch (err) {
    console.log(err);
  }
}
