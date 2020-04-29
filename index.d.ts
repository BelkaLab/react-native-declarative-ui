
declare module 'react-native-declarative-ui' {
  import { ScrollViewProperties } from 'react-native';
  import { CalendarTheme } from 'react-native-calendars';
  import { NavigationParams, NavigationRoute } from 'react-navigation';
  import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';

  export type ComposableItem = {
    [key: string]: unknown;
  };

  type Validation = string | string[] | { [key: string]: string[][] };

  interface ComposableFormProps<T> {
    model: T;
    structure: ComposableStructure;
    onChange: (id: string, value?: unknown) => void;
    onSave?: () => void;
    onClear?: () => void;
    onFocus?: (input: TextInput) => void;
    onFormFilled: (isFilled: boolean) => void;
    navigation: StackNavigationProp<NavigationRoute<NavigationParams>, NavigationParams>;
    backgroundColor?: string;
    loadingMapper?: {
      [id: string]: boolean;
    };
    pickerMapper?: {
      [id: string]: ComposableItem[] | string[];
    };
    searchMapper?: {
      [id: string]: (filterText?: string) => Promise<ComposableItem[] | string[]>;
    };
    createNewItemMapper?: {
      [id: string]: {
        label: string;
        callback: () => void;
      };
    };
    externalModel?: T;
    customStyle?: ComposableFormOptions;
    customComponents?: ComposableFormCustomComponents;
    googleApiKey?: string;
    dynamicValidations?: unknown;
  }

  export class ComposableForm<T> extends React.Component<ComposableFormProps<T>, any> { }

  export type ComposableFormOptions = {
    formContainer?: {
      externalPadding?: number;
      inlinePadding?: number;
      backgroundColor?: string;
    };
    textFields?: {
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
    },
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
      backgroundColor?: string;
      segmentActiveTextStyle?: {
        color: string;
      },
      segmentInactiveTextStyle?: {
        color: string;
      }
    }
  };

  export type ComposableFormCustomComponents = {
    renderOverlayItem?: (item: ComposableItem | string, displayProperty?: string) => React.ReactElement<{}>;
    renderTopLabelItem?: (topLabel: string) => React.ReactElement<{}>;
    renderToggleLabelItem?: (label: string) => React.ReactElement<{}>;
    renderHeaderTitle?: (header: string) => React.ReactElement<{}>;
  };

  class SharedOptionsManager {
    setRNNAvailable: (isAvailable: boolean) => void;
    isRNNAvailable: () => boolean;

    setDefaultOptions: (newOptions: ComposableFormOptions) => void;
    getDefaultOptions: () => ComposableFormOptions;

    setCustomComponents: (customRenderers: ComposableFormCustomComponents) => void;
    getCustomComponents: () => ComposableFormCustomComponents;

    setLocale: (locale: string) => void;
  }

  const SharedOptions: SharedOptionsManager;

  export { SharedOptions };
  export { ComposableFormModals };

  interface IKeyboardAvoidingScrollViewProps extends ScrollViewProperties {
    focusedField?: TextInput;
    marginBottom?: number;
    additionalOffset?: number;
  }

  export class KeyboardAvoidingScrollView extends React.Component<IKeyboardAvoidingScrollViewProps, any> { }

  const ComposableFormModals: object

}
