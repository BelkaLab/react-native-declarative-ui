import { ComposableItem } from '../models/composableItem';
import { Colors } from '../styles/colors';

export type ComposableFormOptions = {
  formContainer: {
    externalPadding?: number;
    inlinePadding?: number;
    backgroundColor?: string;
  };
};

export type ComposableFormCustomComponents = {
  renderSelectPickerItem?: (item: ComposableItem | string, displayProperty?: string) => React.ReactElement<{}>;
};

class SharedOptions {
  private static instance: SharedOptions;

  private _isRNNAvailable: boolean = false;
  private _options: ComposableFormOptions = {
    formContainer: {
      externalPadding: 16,
      inlinePadding: 16,
      backgroundColor: Colors.WHITE
    }
  };
  private _customComponents: ComposableFormCustomComponents = {};

  private constructor() {
    // do something construct...
  }

  static getInstance() {
    if (!SharedOptions.instance) {
      SharedOptions.instance = new SharedOptions();
      // ... any one time initialization goes here ...
    }
    return SharedOptions.instance;
  }

  setRNNAvailable(isAvailable: boolean) {
    this._isRNNAvailable = isAvailable;
  }

  isRNNAvailable() {
    return this._isRNNAvailable;
  }

  setDefaultOptions(newOptions: ComposableFormOptions) {
    this._options = {
      ...this._options,
      ...newOptions
    };
  }

  getDefaultOptions() {
    return this._options;
  }

  setCustomComponents(customRenderers: ComposableFormCustomComponents) {
    this._customComponents = {
      ...this._customComponents,
      ...customRenderers
    };
  }

  getCustomComponents() {
    return this._customComponents;
  }
}

export default SharedOptions.getInstance(); // do something with the instance...
