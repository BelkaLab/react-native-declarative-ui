import { ComposableItem } from './composableItem';

export type FormField = {
  id: string;
  label: string;
  type:
  | 'text'
  | 'number'
  | 'checkbox'
  | 'select'
  | 'autocomplete'
  | 'date'
  | 'duration'
  | 'map'
  | 'toggle'
  | 'group'
  | 'inline'
  | 'header'
  | 'title'
  | 'separator'
  | 'segment';
  // text props
  description?: string;
  nextField?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  isPassword?: boolean;
  maxLength?: number;
  keyboard?: 'email-address' | 'default';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  // number props
  isPercentage?: boolean;
  currency?: string;
  // checkbox props
  checkboxTextPosition?: 'left' | 'right';
  urlLink?: string;
  checkBoxLabelUrl?: string;
  // toggle props
  disableSeparator?: boolean;
  // select props
  options?: ComposableItem[] | string[];
  keyProperty?: string;
  displayProperty?: string;
  pickerLabel?: string;
  shouldReturnKey?: boolean;
  updateFieldId?: string;
  updateFieldKeyProperty?: string;
  // visibility props
  visibilityFieldId?: string;
  visibilityFieldValue?: ComposableItem | ComposableItem[] | string | string[];
  isVisibilityFieldExternal?: boolean;
  isVisibilityConditionInverted?: boolean;
  persistentValue?: boolean;
  // inline props
  flex?: number;
  childs?: FormField[];
  // validation props
  validation?: string[] | string[][];
  skipValidation?: boolean;
  isMandatory?: boolean;
};
