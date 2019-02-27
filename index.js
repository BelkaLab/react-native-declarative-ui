import { ComposableForm } from './src/ComposableForm';
import SharedOptions from './src/options/SharedOptions';
import { SlideBottomOverlay } from './src/overlays/SlideBottomOverlay';
import { Navigation } from 'react-native-navigation';
import { SLIDE_BOTTOM_OVERLAY_KEY } from './src/navigation/integration';

try {
  Navigation.getLaunchArgs();
  Navigation.registerComponent(SLIDE_BOTTOM_OVERLAY_KEY, () => SlideBottomOverlay);
  SharedOptions.setRNNAvailable(true);
} catch (err) {
  SharedOptions.setRNNAvailable(false);
}

export { ComposableForm, SharedOptions };
