declare module 'react-native-declarative-ui' {
  import { CalendarTheme } from 'react-native-calendars';

  export type ComposableItem = {
    [key: string]: unknown;
  };

  interface ComposableFormProps<T> {
    model: T;
    structure: ComposableStructure;
    onChange: (id: string, value?: unknown) => void;
    onSave?: () => void;
    onClear?: () => void;
    onFocus?: (input: TextInput) => void;
    backgroundColor?: string;
    pickerMapper?: {
      [id: string]: ComposableItem[] | string[];
    };
    searchMapper?: {
      [id: string]: (filterText?: string) => Promise<ComposableItem[] | string[]>;
    };
    externalModel?: T;
    customStyle?: ComposableFormOptions;
    customComponents?: ComposableFormCustomComponents;
    googleApiKey?: string;
  }

  export class ComposableForm<T> extends React.Component<ComposableFormProps<T>, any> { }

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
      headerBackgroundColor?: string;
      headerCustomBackground?: () => React.ReactElement<{}>;
    }
  };

  export type ComposableFormCustomComponents = {
    renderOverlayItem?: (item: ComposableItem | string, displayProperty?: string) => React.ReactElement<{}>;
    renderTopLabelItem?: (topLabel: string) => React.ReactElement<{}>
  };

  class SharedOptionsManager {
    setRNNAvailable: (isAvailable: boolean) => void;
    isRNNAvailable: () => boolean;

    setDefaultOptions: (newOptions: ComposableFormOptions) => void;
    getDefaultOptions: () => ComposableFormOptions;

    setCustomComponents: (customRenderers: ComposableFormCustomComponents) => void;
    getCustomComponents: () => ComposableFormCustomComponents;
  }

  const SharedOptions: SharedOptionsManager;

  export { SharedOptions };
}
