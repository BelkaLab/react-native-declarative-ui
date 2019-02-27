import { Colors } from '../styles/colors';

export type ComposableFormOptions = {
  formContainer: {
    externalPadding?: number;
    inlinePadding?: number;
    backgroundColor?: string;
  };
};

class SharedOptions {
  private static instance: SharedOptions;

  private _options: ComposableFormOptions = {
    formContainer: {
      externalPadding: 16,
      inlinePadding: 16,
      backgroundColor: Colors.WHITE
    }
  };
  private _isRNNAvailable: boolean = false;

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

  setDefaultOptions(newOptions: ComposableFormOptions) {
    this._options = {
      ...this._options,
      ...newOptions
    };
  }

  getDefaultOptions() {
    return this._options;
  }

  setRNNAvailable(isAvailable: boolean) {
    this._isRNNAvailable = isAvailable;
  }

  isRNNAvailable() {
    return this._isRNNAvailable;
  }
}

export default SharedOptions.getInstance(); // do something with the instance...
