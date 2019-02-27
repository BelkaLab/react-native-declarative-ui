import { FormField } from './formField';

export type ComposableStructure = {
  title: string;
  model: string;
  fields: FormField[];
  buttonLabel?: string;
  buttonDescription?: string;
  headerIcon?: string;
};

export type Dictionary<T> = {
  [key: string]: T;
};
