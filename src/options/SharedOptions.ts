import React from 'react';
import { SLIDE_BOTTOM_OVERLAY_KEY } from 'react-native-declarative-ui/src/navigation/integration';
import { SlideBottomOverlay } from 'react-native-declarative-ui/src/overlays/SlideBottomOverlay';
import { requireF } from 'react-native-declarative-ui/src/utils/helper';
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
  renderOverlayItem?: (item: ComposableItem | string, displayProperty?: string) => React.ReactElement<{}>;
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

    try {
      const Navigation = requireF('react-native-navigation');
      
      Navigation.registerComponent(SLIDE_BOTTOM_OVERLAY_KEY, () => SlideBottomOverlay);
      SharedOptions.instance.setRNNAvailable(true);
    } catch (err) {
      SharedOptions.instance.setRNNAvailable(false);
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
