declare module 'react-native-declarative-ui' {
  interface ComposableFormProps<T> {
    model: T;
    structure: ComposableStructure;
    onChange: (id: string, value?: unknown) => void;
    onSave?: () => void;
    onClear?: () => void;
    backgroundColor?: string;
    pickerMapper?: {
      [id: string]: ComposableItem[] | string[];
    };
    searchMapper?: {
      [id: string]: (filterText?: string) => Promise<ComposableItem[] | string[]>;
    };
    externalModel?: T;
  }

  export class ComposableForm<T> extends React.Component<ComposableFormProps<T>, any> {}

  export type ComposableFormOptions = {
    formContainer: {
      externalPadding?: number;
      inlinePadding?: number;
    };
  };

  class SharedOptionsManager {
    setDefaultOptions: (newOptions: ComposableFormOptions) => void;

    getDefaultOptions: () => ComposableFormOptions;
  }

  const SharedOptions: SharedOptionsManager;

  export { SharedOptions };
}
