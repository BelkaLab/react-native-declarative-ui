import numbro from 'numbro';
import Languages from 'numbro/dist/languages.min.js';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { CalendarTheme, LocaleConfig } from 'react-native-calendars';
import { ComposableItem } from '../models/composableItem';
import { Colors } from '../styles/colors';

export type ComposableFormOptions = {
  formContainer?: {
    externalPadding?: number;
    inlinePadding?: number;
    backgroundColor?: string;
  };
  textFields: {
    backgroundColor?: string;
    disabledBackgroundColor?: string;
    floatingLabelColor?: string;
    focusedFloatingLabelColor?: string;
    errorFloatingLabelColor?: string;
    disabledFloatingLabelColor?: string;
    color?: string;
    descriptionColor?: string;
    disabledColor?: string;
    borderColor?: string;
    focusedBorderColor?: string;
    errorBorderColor?: string;
    disabledBorderColor?: string;
    selectionColor?: string;
    errorMessageColor?: string;
  },
  checkBoxes?: {
    color?: string;
    urlColor?: string;
  },
  labels?: {
    placeholderStyle?: StyleProp<TextStyle>;
    inputStyle?: StyleProp<TextStyle>;
  };
  calendars?: {
    singleDayTheme?: CalendarTheme;
  };
  pickers?: {
    knobColor?: string;
    headerBackgroundColor?: string;
    renderCustomBackground?: () => React.ReactElement<{}>;
    renderCustomCancelButton?: () => React.ReactElement<{}>;
  };
  selectPickers?: {
    selectedItemTextColor?: string;
    selectedItemIconColor?: string;
    createNewItemTextColor?: string;
    createNewItemIconColor?: string;
  };
  segments?: {
    activeItemColor?: string;
    segmentActiveTextStyle?: StyleProp<TextStyle>;
    segmentInactiveTextStyle?: StyleProp<TextStyle>;
    backgroundColor?: string;
  };
  toggles?: {
    trackColor?: {
      false: string;
      true: string;
    }
  }
};

export type DefinedComposableFormOptions = {
  formContainer: {
    externalPadding?: number;
    inlinePadding?: number;
    backgroundColor?: string;
  };
  textFields: {
    backgroundColor?: string;
    disabledBackgroundColor?: string;
    floatingLabelColor?: string;
    focusedFloatingLabelColor?: string;
    errorFloatingLabelColor?: string;
    disabledFloatingLabelColor?: string;
    color?: string;
    descriptionColor?: string;
    disabledColor?: string;
    borderColor?: string;
    focusedBorderColor?: string;
    errorBorderColor?: string;
    disabledBorderColor?: string;
    selectionColor?: string;
    errorMessageColor?: string;
  },
  checkBoxes?: {
    color?: string;
    urlColor?: string;
  },
  labels: {
    placeholderStyle?: StyleProp<TextStyle>;
    inputStyle?: StyleProp<TextStyle>;
  },
  calendars: {
    singleDayTheme?: CalendarTheme;
  };
  pickers: {
    knobColor?: string;
    headerBackgroundColor?: string;
    renderCustomBackground?: () => React.ReactElement<{}>;
    renderCustomCancelButton?: () => React.ReactElement<{}>;
  };
  selectPickers: {
    selectedItemTextColor?: string;
    selectedItemIconColor?: string;
    createNewItemTextColor?: string;
    createNewItemIconColor?: string;
  };
  segments: {
    activeItemColor?: string;
    segmentActiveTextStyle?: StyleProp<TextStyle>;
    segmentInactiveTextStyle?: StyleProp<TextStyle>;
    backgroundColor?: string;
  };
  toggles: {
    trackColor?: {
      false: string;
      true: string;
    }
  }
};

export type ComposableFormCustomComponents = {
  renderOverlayItem?: (item: ComposableItem | string, displayProperty?: string) => React.ReactElement<{}>;
  renderTopLabelItem?: (topLabel: string) => React.ReactElement<{}>;
  renderToggleLabelItem?: (label: string) => React.ReactElement<{}>;
  renderHeaderTitle?: (header: string) => React.ReactElement<{}>;
};

class SharedOptions {
  private static instance: SharedOptions;

  private _options: DefinedComposableFormOptions = {
    formContainer: {
      externalPadding: 16,
      inlinePadding: 16,
      backgroundColor: Colors.WHITE
    },
    textFields: {},
    checkBoxes: {},
    labels: {},
    calendars: {},
    pickers: {},
    selectPickers: {},
    segments: {
      activeItemColor: Colors.PRIMARY_BLUE,
      backgroundColor: Colors.WHITE,
      segmentActiveTextStyle: {
        color: Colors.WHITE
      },
      segmentInactiveTextStyle: {
        color: Colors.BLACK
      }
    },
    toggles: {}
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
