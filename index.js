import { ComposableForm } from './src/ComposableForm';
import { SLIDE_BOTTOM_OVERLAY_KEY } from './src/navigation/integration';
import SharedOptions from './src/options/SharedOptions';
import { SlideBottomOverlay } from './src/overlays/SlideBottomOverlay';

try {
  const Navigation = require('react-native-navigation');
  Navigation.getLaunchArgs();
  Navigation.registerComponent(SLIDE_BOTTOM_OVERLAY_KEY, () => SlideBottomOverlay);
  SharedOptions.setRNNAvailable(true);
} catch (err) {
  SharedOptions.setRNNAvailable(false);
}

export { ComposableForm, SharedOptions };

