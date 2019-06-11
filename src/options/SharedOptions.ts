import React from 'react';
import { CalendarTheme } from 'react-native-calendars';
import { ComposableItem } from '../models/composableItem';
import { SLIDE_BOTTOM_OVERLAY_KEY } from '../navigation/integration';
import { SlideBottomOverlay } from '../overlays/SlideBottomOverlay';
import { Colors } from '../styles/colors';
import { requireWrapper } from '../utils/helper';

export type ComposableFormOptions = {
  formContainer: {
    externalPadding?: number;
    inlinePadding?: number;
    backgroundColor?: string;
  };
  calendars: {
    singleDayTheme?: CalendarTheme;
  };
  pickers: {
    headerBackgroundColors?: string | string[];
  }
};

export type ComposableFormCustomComponents = {
  renderOverlayItem?: (item: ComposableItem | string, displayProperty?: string) => React.ReactElement<{}>;
  renderTopLabelItem?: (topLabel: string) => React.ReactElement<{}>
};

class SharedOptions {
  private static instance: SharedOptions;

  private _isRNNAvailable: boolean = false;
  private _options: ComposableFormOptions = {
    formContainer: {
      externalPadding: 16,
      inlinePadding: 16,
      backgroundColor: Colors.WHITE
    },
    calendars: {},
    pickers: {}
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
      const Navigation = requireWrapper('react-native-navigation');

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
