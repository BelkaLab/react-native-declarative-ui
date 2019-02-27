export type ComposableFormOptions = {
  formContainer: {
    externalPadding?: number;
    inlinePadding?: number;
  };
};

class SharedOptions {
  private static instance: SharedOptions;
  private options: ComposableFormOptions = {
    formContainer: {
      externalPadding: 16,
      inlinePadding: 16
    }
  };

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
    this.options = {
      ...this.options,
      ...newOptions
    };
  }

  getDefaultOptions() {
    return this.options;
  }
}

export default SharedOptions.getInstance(); // do something with the instance...
