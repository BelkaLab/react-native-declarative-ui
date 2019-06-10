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
  | 'map'
  | 'toggle'
  | 'group'
  | 'inline'
  | 'header'
  | 'title'
  | 'separator';
  // text props
  nextField?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  isPassword?: boolean;
  keyboard?: 'email-address' | 'default';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  // number props
  isPercentage?: boolean;
  currency?: string;
  // checkbox props
  checkboxTextPosition?: 'left' | 'right';
  urlLink?: string;
  checkBoxLabelUrl?: string;
  // select props
  options?: ComposableItem[] | string[];
  keyProperty?: string;
  displayProperty?: string;
  shouldReturnKey?: boolean;
  updateFieldId?: string;
  updateFieldKeyProperty?: string;
  visibilityFieldId?: string;
  visibilityFieldValue?: ComposableItem | ComposableItem[] | string | string[];
  isVisibilityFieldExternal?: boolean;
  isVisibilityConditionInverted?: boolean;
  // inline props
  flex?: number;
  childs?: FormField[];
};
