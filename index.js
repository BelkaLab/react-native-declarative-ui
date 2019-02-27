import { ComposableForm } from './src/ComposableForm';
import SharedOptions from './src/options/SharedOptions';
import { Navigation } from 'react-native-navigation';

try {
  Navigation.getLaunchArgs();
  SharedOptions.setRNNAvailable(true);
} catch (err) {
  SharedOptions.setRNNAvailable(false);
}

export { ComposableForm, SharedOptions };
