import numbro from 'numbro';
import Languages from 'numbro/dist/languages.min.js';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { CalendarTheme, LocaleConfig } from 'react-native-calendars';
import { ComposableItem } from '../models/composableItem';
import { SLIDE_BOTTOM_OVERLAY_KEY } from '../navigation/integration';
import { SlideBottomOverlay } from '../overlays/SlideBottomOverlay';
import { Colors } from '../styles/colors';
import { requireWrapper } from '../utils/helper';

export type ComposableFormOptions = {
  formContainer?: {
    externalPadding?: number;
    inlinePadding?: number;
    backgroundColor?: string;
  };
  labels?: {
    placeholderStyle?: StyleProp<TextStyle>;
    inputStyle?: StyleProp<TextStyle>;
  };
  calendars?: {
    singleDayTheme?: CalendarTheme;
  };
  pickers?: {
    headerBackgroundColor?: string;
    renderCustomBackground?: () => React.ReactElement<{}>;
    renderCustomCancelButton?: () => React.ReactElement<{}>;
  }
};

export type DefinedComposableFormOptions = {
  formContainer: {
    externalPadding?: number;
    inlinePadding?: number;
    backgroundColor?: string;
  };
  labels: {
    placeholderStyle?: StyleProp<TextStyle>;
    inputStyle?: StyleProp<TextStyle>;
  },
  calendars: {
    singleDayTheme?: CalendarTheme;
  };
  pickers: {
    headerBackgroundColor?: string;
    renderCustomBackground?: () => React.ReactElement<{}>;
    renderCustomCancelButton?: () => React.ReactElement<{}>;
  }
};

export type ComposableFormCustomComponents = {
  renderOverlayItem?: (item: ComposableItem | string, displayProperty?: string) => React.ReactElement<{}>;
  renderTopLabelItem?: (topLabel: string) => React.ReactElement<{}>;
  renderHeaderTime?: (header: string) => React.ReactElement<{}>;
};

class SharedOptions {
  private static instance: SharedOptions;

  private _isRNNAvailable: boolean = false;
  private _options: DefinedComposableFormOptions = {
    formContainer: {
      externalPadding: 16,
      inlinePadding: 16,
      backgroundColor: Colors.WHITE
    },
    labels: {},
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

  setLocale(locale: string) {
    LocaleConfig.defaultLocale = locale;
    numbro.registerLanguage(Languages[locale]);
    numbro.setLanguage(locale);
  }
}

export default SharedOptions.getInstance(); // do something with the instance...
