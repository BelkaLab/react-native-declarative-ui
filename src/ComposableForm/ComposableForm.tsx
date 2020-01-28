import { transformAll } from '@overgear/yup-ast';
import to from 'await-to-js';
import every from 'lodash.every';
import find from 'lodash.find';
import first from 'lodash.first';
import has from 'lodash.has';
import isEqual from 'lodash.isequal';
import merge from 'lodash.merge';
import some from 'lodash.some';
import moment from 'moment';
import numbro from 'numbro';
import React, { Component } from 'react';
import { EmitterSubscription, findNodeHandle, Keyboard, Linking, Platform, StyleProp, StyleSheet, Text, TextInput, TouchableHighlight, View, ViewStyle } from 'react-native';
import { GooglePlaceDetail } from 'react-native-google-places-autocomplete';
import { NavigationRoute } from 'react-navigation';
import { StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { Schema, ValidationError } from 'yup';
import { RightFieldIcon } from '../base/icons/RightFieldIcon';
import { AutocompletePickerField } from '../components/AutocompletePickerField';
import { CheckBoxField } from '../components/CheckBoxField';
import { DatePickerField } from '../components/DatePickerField';
import { DurationPickerField } from '../components/DurationPickerField';
import { MapPickerField } from '../components/MapPickerField';
import { SelectPickerField } from '../components/SelectPickerField';
import { TextField } from '../components/TextField';
import { ToggleField } from '../components/ToggleField';
import { ComposableItem } from '../models/composableItem';
import { ComposableStructure, Dictionary } from '../models/composableStructure';
import { FormField } from '../models/formField';
import { AUTOCOMPLETE_PICKER_OVERLAY_KEY, CALENDAR_PICKER_OVERLAY_KEY, DURATION_PICKER_OVERLAY_KEY, MAP_PICKER_OVERLAY_KEY, SELECT_PICKER_OVERLAY_KEY } from '../navigation/integration';
import SharedOptions, { ComposableFormCustomComponents, ComposableFormOptions, DefinedComposableFormOptions } from '../options/SharedOptions';
import { Colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import { getValueByKey, isObject } from '../utils/helper';

interface IComposableFormProps<T> {
  navigation: StackNavigationProp<NavigationRoute, {}>;
  model: T;
  structure: ComposableStructure;
  onChange: (id: string, value?: unknown) => void;
  onSave?: () => void;
  onClear?: () => void;
  onFocus?: (inputField?: TextInput) => void;
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
  dynamicValidations?: string[] | string[][];
}

interface IState {
  structure: ComposableStructure;
  errors: Dictionary<string>;
  isFormFilled: boolean;
  isKeyboardOpened: boolean;
  isModalVisible: boolean;
  isAutoFocused: boolean;
  isFocusingMultiline?: boolean;
}

export default class ComposableForm<T extends ComposableItem> extends Component<IComposableFormProps<T>, IState> {
  private fieldRefs: Dictionary<TextInput> = {};
  private errors: Dictionary<string> = {};
  private subscriptions!: EmitterSubscription[];

  constructor(props: IComposableFormProps<T>) {
    super(props);

    this.validateStructureWithProps(props.structure, props);

    this.state = {
      structure: props.structure,
      errors: {},
      isFormFilled: false,
      isKeyboardOpened: false,
      isModalVisible: false,
      isAutoFocused: false
    };
  }

  private validateStructureWithProps = (structure: ComposableStructure, props: IComposableFormProps<T>) => {
    // add all fields check here
    // if props.googleApiKey is undefined, cannot use MapField
    return;
  };

  componentWillMount() {
    this.subscriptions = [
      Keyboard.addListener(
        Platform.select({ ios: 'keyboardWillHide', android: 'keyboardDidHide' }),
        this.keyboardDidShow
      ),
      Keyboard.addListener(
        Platform.select({ ios: 'keyboardWillHide', android: 'keyboardDidHide' }),
        this.keyboardDidHide
      )
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.remove());
  }

  keyboardDidShow = () => {
    this.setState({
      isKeyboardOpened: true
    });
  };

  keyboardDidHide = () => {
    this.setState({
      isKeyboardOpened: false
    });

    if (!this.state.isFocusingMultiline) {
      this.blurTextFields();
    }
  };

  componentDidUpdate() {
    if (!this.state.isAutoFocused) {
      const focusField = find(this.state.structure.fields, f => f.autoFocus && this.fieldRefs[f.id]) as
        | FormField
        | undefined;

      if (focusField) {
        this.fieldRefs[focusField.id].focus();
      }

      this.setState({
        isAutoFocused: true
      });
    }
  }

  async UNSAFE_componentWillReceiveProps(nextProps: IComposableFormProps<T>) {
    if (!isEqual(nextProps.model, this.props.model)) {
      // this.checkIfFormIsFilled(nextProps.model);

      if (this.state.structure) {
        this.state.structure.fields.map(field => {
          if (this.isFieldNotVisible(field, nextProps.model) && !!nextProps.model[field.id]) {
            this.props.onChange(field.id, undefined);
          }
        });
      }
    }
  }

  render() {
    const { structure, errors } = this.state;
    const { model } = this.props;

    return (
      <View
        style={[
          styles.formContainer,
          { backgroundColor: this.getComposableFormOptions().formContainer.backgroundColor }
        ]}
      >
        <View
          style={{
            backgroundColor: this.getComposableFormOptions().formContainer.backgroundColor,
            padding: this.getComposableFormOptions().formContainer.externalPadding
          }}
        >
          {structure.fields.map((field, index) => this.renderFields(field, index, model, errors))}
        </View>
      </View>
    );
  }

  private blurTextFields = () => {
    // Check if input has focus and remove it
    for (const [_, input] of Object.entries(this.fieldRefs)) {
      if (input && input.isFocused() && findNodeHandle(input)) {
        input.blur();
      }
    }
  };

  private isFieldNotVisible = (field: FormField, model: T) => {
    if (field.visibilityFieldId !== undefined && field.visibilityFieldValue !== undefined) {
      // This is a visibilityField, that means we have a condition on parent to show/hide the field in the form
      const {
        keyProperty,
        visibilityFieldId,
        visibilityFieldValue,
        isVisibilityFieldExternal,
        isVisibilityConditionInverted
      } = field;
      const { externalModel } = this.props;

      if (isVisibilityFieldExternal && !externalModel) {
        throw new Error(
          `Field ${field.id} has isVisibilityFieldExternal setted as true, but you forgot to pass dependencyModel to ComposableForm as props`
        );
      }

      if (Array.isArray(visibilityFieldValue)) {
        const shouldFieldBeHidden = isVisibilityConditionInverted
          ? some(visibilityFieldValue, (value: ComposableItem | string) =>
              this.shouldFieldBeHidden(
                !isVisibilityFieldExternal ? model! : externalModel!,
                visibilityFieldId,
                value,
                isVisibilityConditionInverted,
                keyProperty
              )
            )
          : every(visibilityFieldValue, (value: ComposableItem | string) =>
              this.shouldFieldBeHidden(
                !isVisibilityFieldExternal ? model! : externalModel!,
                visibilityFieldId,
                value,
                isVisibilityConditionInverted,
                keyProperty
              )
            );

        return shouldFieldBeHidden;
      } else {
        return this.shouldFieldBeHidden(
          !isVisibilityFieldExternal ? model! : externalModel!,
          visibilityFieldId,
          visibilityFieldValue,
          isVisibilityConditionInverted,
          keyProperty
        );
      }
    }

    return false;
  };

  private shouldFieldBeHidden = (
    model: T,
    visibilityFieldId: string,
    visibilityFieldValue: ComposableItem | string,
    isVisibilityConditionInverted: boolean = false,
    keyProperty?: string
  ) => {
    const isVisible =
      !model[visibilityFieldId] ||
      (keyProperty
        ? (visibilityFieldValue as ComposableItem)[keyProperty] !==
          (model[visibilityFieldId] as ComposableItem)[keyProperty]
        : !isEqual(visibilityFieldValue, model[visibilityFieldId]));

    return isVisibilityConditionInverted ? !isVisible : isVisible;
  };

  private checkIfFormIsFilled = (model: T) => {
    if (this.state.structure) {
      // add check if we have errors on non mandatory fields
      // const isFilled = !some(
      //   filter(this.state.structure.fields, (field: FormField) => this.isFieldMandatory(field)), // Mandatory fields
      //   (field: FormField) => model[field.id] === undefined || model[field.id] === '' || model[field.id] === false
      // );
      // this.setState({
      //   isFormFilled: isFilled
      // });
      // this.props.onFormStatus(isFilled);
    }
  };

  isValid = async (): Promise<boolean> => {
    const { structure } = this.state;
    const { model } = this.props;

    return await this.validateForm(structure!.fields, model);
  };

  private validateForm = async (fields: FormField[], model: T): Promise<boolean> => {
    const { dynamicValidations } = this.props;

    console.log(dynamicValidations);
    
    this.setState({
      errors: {}
    });
    let newErrors: Dictionary<string> = {};

    for (const field of fields) {
      if ((field.type === 'inline' || field.type === 'group') && field.childs) {
        for (const child of field.childs) {
          if ((child.type === 'inline' || child.type === 'group') && child.childs) {
            for (const innerChild of child.childs) {
              newErrors = await this.validateField(innerChild, model, newErrors);
            }
          } else {
            newErrors = await this.validateField(child, model, newErrors);
          }
        }
      }
      // } else if (field.validateWithNextField) {
      // const validation = validateCouple(
      //   { [field.id]: model[field.id] as string, [fields[index + 1].id]: model[fields[index + 1].id] as string },
      //   {
      //     ...field.validation,
      //     ...fields[index + 1].validation
      //   }
      // );
      // newErrors = {
      //   ...newErrors,
      //   [field.id]: validation && validation[field.id] ? validation[field.id][0] : undefined,
      //   [fields[index + 1].id]:
      //     validation && validation[fields[index + 1].id] ? validation[fields[index + 1].id][0] : undefined
      // };
      // }
      else if (!field.skipValidation) {
        newErrors = await this.validateField(field, model, newErrors);
      }
    }
    // forEach(fields, async (field, index) => {
    //   if (field.type === 'inline' || field.type === 'group') {
    //     forEach(field.childs, async f => {
    //       if (f.type === 'inline' || f.type === 'group') {
    //         forEach(f.childs, async item => {
    //           newErrors = await this.validateField(item, model, newErrors);
    //         });
    //       } else {
    //         debugger;
    //         newErrors = await this.validateField(f, model, newErrors);
    //       }
    //     });
    //   } else if (field.validateWithNextField) {
    //     // const validation = validateCouple(
    //     //   { [field.id]: model[field.id] as string, [fields[index + 1].id]: model[fields[index + 1].id] as string },
    //     //   {
    //     //     ...field.validation,
    //     //     ...fields[index + 1].validation
    //     //   }
    //     // );
    //     // newErrors = {
    //     //   ...newErrors,
    //     //   [field.id]: validation && validation[field.id] ? validation[field.id][0] : undefined,
    //     //   [fields[index + 1].id]:
    //     //     validation && validation[fields[index + 1].id] ? validation[fields[index + 1].id][0] : undefined
    //     // };
    //   } else if (!field.skipValidation) {
    //     newErrors = await this.validateField(field, model, newErrors);
    //   }
    // });

    if (dynamicValidations) {
      const schema: Schema<Dictionary<string>> = transformAll(dynamicValidations);

      for (const key in schema) {
        const [error] = await to<unknown, ValidationError>(schema[key].validate(model[key]));
  
        if (error) {
          newErrors = {
            ...newErrors,
            [key]: first(error.errors)
          } as Dictionary<string>;
        }
      }
    }

    this.setState({
      errors: newErrors
    });

    return !some(newErrors, (error: string) => error !== undefined);
  };

  private validateField = async (
    field: FormField,
    model: T,
    errors: Dictionary<string>
  ): Promise<Dictionary<string>> => {
    if (field.validation) {
      const schema: Schema<unknown> = transformAll(field.validation);

      const [error] = await to<unknown, ValidationError>(schema.validate(model[field.id]));

      if (error) {
        const newErrors = {
          ...errors,
          [field.id]: first(error.errors)
        } as Dictionary<string>;
        
        return Promise.resolve(newErrors);
      }

      // return {
      //   ...errors,
      //   [field.id]:
      //     field.id === 'iban'
      //       ? IBAN.isValid(model[field.id] as string) || !model[field.id]
      //         ? undefined
      //         : field.validation.message
      //       : validate(field.id, model[field.id] as string | number | boolean | Date, field.validation)
      // };
    }
    return Promise.resolve(errors);
  };

  private hasErrorsInline = (fields: FormField[]): boolean => {
    return some(fields, f => has(this.state.errors, f.id) && this.state.errors[f.id]);
  };

  private retrieveErrorMessageInline = (fields: FormField[]): string => {
    const found = find(fields, f => this.state.errors[f.id] !== undefined);
    return found ? this.state.errors[found.id] : '';
  };

  private renderFields = (
    field: FormField,
    index: string | number,
    model: T,
    errors: Dictionary<string>,
    groupId: string = '',
    flex?: number,
    customStyle?: StyleProp<ViewStyle>
  ) => {
    if (this.isFieldNotVisible(field, model)) {
      return <View key={index} />;
    }

    const isInline = !!flex && flex < 1;

    switch (field.type) {
      case 'header':
        return (
          <View
            key={index}
            style={{
              marginTop: this.getComposableFormOptions().formContainer.inlinePadding
            }}
          >
            {!!this.getComposableFormCustomComponents().renderHeaderTitle ? (
              this.getComposableFormCustomComponents().renderHeaderTitle!(field.label)
            ) : (
              <Text
                style={{
                  fontSize: 16,
                  color: Colors.BLACK
                }}
              >
                {field.label}
              </Text>
            )}
          </View>
        );
      case 'text':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: this.getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {this.renderTextField(field, model, errors, isInline, customStyle)}
          </View>
        );
      case 'number':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: this.getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {this.renderNumberField(field, model, errors, isInline, customStyle)}
          </View>
        );
      case 'checkbox':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: this.getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {this.renderCheckBoxField(field, model, errors, customStyle)}
          </View>
        );
      case 'toggle':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: this.getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {this.renderToggleField(field, model, errors, customStyle)}
          </View>
        );
      case 'select':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: this.getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {this.renderSelectField(field, model, errors, isInline, customStyle)}
          </View>
        );
      case 'autocomplete':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: this.getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {this.renderAutocompleteField(field, model, errors, isInline, customStyle)}
          </View>
        );
      case 'date':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: this.getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {this.renderDateField(field, model, errors, isInline, customStyle)}
          </View>
        );
      case 'duration':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: this.getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {this.renderDurationField(field, model, errors, isInline, customStyle)}
          </View>
        );
      case 'map':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: this.getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {this.renderMapField(field, model, errors, isInline, customStyle)}
          </View>
        );
      case 'inline':
        return (
          <View key={index}>
            <View style={styles.formRow}>
              {field.childs!.map((childField, childIndex) =>
                this.renderFields(
                  childField,
                  field.id + childIndex,
                  model,
                  errors,
                  '',
                  childField.flex,
                  childIndex === 0 ? { marginRight: 8 } : { marginLeft: 8 }
                )
              )}
            </View>
            {this.hasErrorsInline(field.childs!) && (
              <Text style={globalStyles.errorMessage}>{this.retrieveErrorMessageInline(field.childs!)}</Text>
            )}
          </View>
        );
      default:
        throw new Error(`Field ${field.id} has a type which is currently not supported: ${field.type}`);
    }
  };

  private renderTextField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    isInline: boolean = false,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    return (
      <TextField
        onRef={input => {
          this.fieldRefs[field.id] = input;
        }}
        // label={localizations.getString(field.label, localizations.getLanguage()) || field.label}
        label={field.label}
        containerStyle={[{ flex: 1 }, customStyle]}
        placeholderStyle={this.getComposableFormOptions().labels.placeholderStyle}
        inputStyle={this.getComposableFormOptions().labels.inputStyle}
        value={model[field.id] as string | undefined}
        editable={!field.disabled && !(this.props.loadingMapper && this.props.loadingMapper[field.id])}
        multiline={field.multiline}
        scrollEnabled={false} // fix for trigger scroll on iOS when keyboard opens
        keyboardType={field.keyboard || 'default'}
        isPassword={field.isPassword}
        autoCapitalize={
          field.autoCapitalize || (field.keyboard && field.keyboard === 'email-address' ? 'none' : 'sentences')
        }
        returnKeyType={field.nextField ? 'next' : 'done'}
        blurOnSubmit={field.multiline ? false : !field.nextField}
        selectionColor={Colors.PRIMARY_BLUE}
        onSubmitEditing={event => {
          if (field.nextField && this.fieldRefs[field.nextField] && !this.fieldRefs[field.nextField].isFocused()) {
            this.fieldRefs[field.nextField].focus();
          }
        }}
        onChangeText={val => {
          this.setState({
            errors: {
              ...this.state.errors,
              [field.id]: ''
            }
          });
          this.props.onChange(field.id, val);
        }}
        rightContent={
          <RightFieldIcon
            rightIcon={Platform.select({ ios: 'cancel', android: 'clear' })}
            onRightIconClick={() => {
              this.setState({
                errors: {
                  ...this.state.errors,
                  [field.id]: ''
                }
              });
              this.props.onChange(field.id, '');
            }}
          />
        }
        rightContentVisibility={!!model[field.id]}
        isLoading={this.props.loadingMapper && this.props.loadingMapper[field.id]}
        onFocusLabel={() => {
          if (this.props.onFocus) {
            this.props.onFocus(this.fieldRefs[field.id]);
          }

          this.setState({
            isFocusingMultiline: false
          });
        }}
        onTouchStart={() => {
          if (field.multiline) {
            this.setState({
              isFocusingMultiline: true
            });
          }
        }}
        error={errors[field.id]}
        disableErrorMessage={isInline}
      />
    );
  };

  private renderNumberField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    isInline: boolean = false,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    return (
      <TextField
        onRef={input => {
          this.fieldRefs[field.id] = input;
        }}
        // label={localizations.getString(field.label, localizations.getLanguage()) || field.label}
        label={field.label}
        containerStyle={[{ flex: 1 }, customStyle]}
        placeholderStyle={this.getComposableFormOptions().labels.placeholderStyle}
        inputStyle={this.getComposableFormOptions().labels.inputStyle}
        value={this.formatNumberWithLocale(model[field.id] as string | number | undefined)}
        editable={!field.disabled && !(this.props.loadingMapper && this.props.loadingMapper[field.id])}
        currency={field.currency}
        isPercentage={field.isPercentage}
        keyboardType="decimal-pad"
        returnKeyType={field.nextField ? 'next' : 'done'}
        blurOnSubmit={field.multiline ? false : !field.nextField}
        selectionColor={Colors.PRIMARY_BLUE}
        isLoading={this.props.loadingMapper && this.props.loadingMapper[field.id]}
        onSubmitEditing={() => {
          if (field.nextField && this.fieldRefs[field.nextField] && !this.fieldRefs[field.nextField].isFocused()) {
            this.fieldRefs[field.nextField].focus();
          }
        }}
        onChangeText={val => {
          this.setState({
            errors: {
              ...this.state.errors,
              [field.id]: ''
            }
          });
          this.props.onChange(field.id, this.convertStringToNumber(val));
        }}
        onFocusLabel={() => {
          if (this.props.onFocus) {
            this.props.onFocus(this.fieldRefs[field.id]);
          }
        }}
        onBlurLabel={() => {
          this.props.onChange(field.id, this.restoreNumberWithLocale(model[field.id] as string | number | undefined));
        }}
        error={errors[field.id]}
        disableErrorMessage={isInline}
      />
    );
  };

  private restoreNumberWithLocale = (val?: string | number): number | undefined => {
    if (!val) {
      return undefined;
    }

    if (!isNaN(Number(val))) {
      return numbro(val).value();
    }

    return numbro.unformat(String(val));
  };

  private formatNumberWithLocale = (n?: string | number): string | undefined => {
    if (!!n && this.isSeparatorLastChar(String(n))) {
      const numberString = String(n);
      return `${numberString.slice(0, numberString.length - 1)},`;
    }

    if (Number(n) || n === 0) {
      return numbro(n).format();
    }

    return !!n ? String(n) : undefined;
  };

  private convertStringToNumber = (val: string) => {
    if (!val) {
      return undefined;
    }

    if (this.isSeparatorLastChar(val) || ((val.includes(',') || val.includes('.')) && val.slice(-1) === '0')) {
      return val;
    }

    return numbro.unformat(val);
  };

  private isSeparatorLastChar = (n: string) => {
    return n.match(/^-?\d*(\.|,)$/) !== null;
  };

  private renderCheckBoxField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    return (
      <CheckBoxField
        containerStyle={[{ flex: 1 }, customStyle]}
        isChecked={model[field.id] as boolean}
        rightTextView={
          field.urlLink ? (
            <View style={styles.checkboxUrlContainer}>
              <Text>{field.label}</Text>
              <TouchableHighlight onPress={() => Linking.openURL(field.urlLink!)}>
                <Text style={{ color: Colors.PRIMARY_BLUE, fontWeight: '600' }}>{field.checkBoxLabelUrl}</Text>
              </TouchableHighlight>
            </View>
          ) : (
            undefined
          )
        }
        rightText={field.checkboxTextPosition === 'right' ? field.label : undefined}
        leftText={!field.checkboxTextPosition || field.checkboxTextPosition === 'left' ? field.label : undefined}
        onClick={() => {
          Keyboard.dismiss();
          this.props.onChange(field.id, !model[field.id]);
        }}
        error={errors[field.id]}
      />
    );
  };

  private renderToggleField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    return (
      <ToggleField
        containerStyle={[{ flex: 1 }, customStyle]}
        value={model[field.id] as boolean}
        disableSeparator={field.disableSeparator}
        renderCustomLabel={this.getComposableFormCustomComponents().renderToggleLabelItem}
        // label={localizations.getString(field.label, localizations.getLanguage()) || field.label}
        label={field.label}
        onValueChange={val => {
          this.setState({
            errors: {
              ...this.state.errors,
              [field.id]: ''
            }
          });
          this.props.onChange(field.id, val);
        }}
        disabled={field.disabled}
      />
    );
  };

  private renderSelectField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    isInline: boolean = false,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    return (
      <SelectPickerField
        onRef={input => {
          this.fieldRefs[field.id] = input;
        }}
        containerStyle={[{ flex: 1 }, customStyle]}
        placeholderStyle={this.getComposableFormOptions().labels.placeholderStyle}
        inputStyle={this.getComposableFormOptions().labels.inputStyle}
        // label={localizations.getString(field.label, localizations.getLanguage()) || field.label}
        label={field.label}
        onPress={() => this.openSelectPicker(field, model)}
        itemValue={model[field.id] as ComposableItem | string}
        // isPercentage={field.isPercentage}
        displayProperty={field.displayProperty}
        keyProperty={field.keyProperty}
        error={errors[field.id]}
        disableErrorMessage={isInline}
        options={this.props.pickerMapper ? this.props.pickerMapper[field.id] || field.options : field.options}
      />
    );
  };

  private openSelectPicker = (field: FormField, model: T) => {
    Keyboard.dismiss();

    const items = this.props.pickerMapper ? this.props.pickerMapper[field.id] || field.options! : field.options!;

    this.props.navigation.navigate(SELECT_PICKER_OVERLAY_KEY, {
      pickedItem: this.retrievePickedItem(items, model[field.id] as ComposableItem | string, field.keyProperty),
      items,
      displayProperty: field.displayProperty,
      keyProperty: field.keyProperty,
      topLabel: field.pickerLabel,
      headerBackgroundColor: this.getComposableFormOptions().pickers.headerBackgroundColor,
      renderCustomBackground: this.getComposableFormOptions().pickers.renderCustomBackground,
      onCreateNewItemPressed: () => {
        if (this.props.createNewItemMapper) {
          this.props.createNewItemMapper[field.id].callback();
        }
      },
      createNewItemLabel: this.props.createNewItemMapper && this.props.createNewItemMapper[field.id].label,
      onPick: (selectedItem: ComposableItem | string) => {
        this.setState({
          errors: {
            ...this.state.errors,
            [field.id]: ''
          }
        });

        if (field.shouldReturnKey) {
          if (!isObject(selectedItem)) {
            throw new Error(
              `Field ${field.id} is setted as "shouldReturnKey" but your picker is returning a string instead of an object`
            );
          }
          if (!field.keyProperty) {
            throw new Error(
              `Field ${field.id} is setted as "shouldReturnKey" but your json is not specifying a keyProperty`
            );
          }
          this.props.onChange(field.id, getValueByKey(selectedItem as ComposableItem, field.keyProperty));
        } else {
          this.props.onChange(field.id, selectedItem);
        }

        if (field.updateFieldId && field.updateFieldKeyProperty) {
          this.props.onChange(field.updateFieldId, (selectedItem as ComposableItem)[field.updateFieldKeyProperty]);
          this.setState({
            errors: {
              ...this.state.errors,
              [field.updateFieldId]: ''
            }
          });
        }
      },
      renderOverlayItem: this.getComposableFormCustomComponents().renderOverlayItem,
      renderTopLabelItem: this.getComposableFormCustomComponents().renderTopLabelItem,
      isBackDropMode: true
    });
  };

  private retrievePickedItem = (
    items: ComposableItem[] | string[],
    value: ComposableItem | string,
    keyProperty?: string
  ) => {
    if (!keyProperty || !isObject(first<ComposableItem | string>(items))) {
      return value;
    }

    if (keyProperty && isObject(value)) {
      return value;
    }

    return find<ComposableItem>(items as ComposableItem[], item => getValueByKey(item, keyProperty) === value);
  };

  private renderAutocompleteField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    isInline: boolean = false,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    const items = this.props.pickerMapper ? this.props.pickerMapper[field.id] || field.options! : field.options!;

    return (
      <AutocompletePickerField
        onRef={input => {
          this.fieldRefs[field.id] = input;
        }}
        containerStyle={[{ flex: 1 }, customStyle]}
        placeholderStyle={this.getComposableFormOptions().labels.placeholderStyle}
        inputStyle={this.getComposableFormOptions().labels.inputStyle}
        // label={localizations.getString(field.label, localizations.getLanguage()) || field.label}
        label={field.label}
        onPress={() => this.openAutocompletePicker(field, model)}
        itemValue={model[field.id] as ComposableItem | string}
        // isPercentage={field.isPercentage}
        displayProperty={field.displayProperty}
        keyProperty={field.keyProperty}
        error={errors[field.id]}
        disableErrorMessage={isInline}
        options={items}
      />
    );
  };

  private openAutocompletePicker = (field: FormField, model: T) => {
    Keyboard.dismiss();

    const items = this.props.pickerMapper ? this.props.pickerMapper[field.id] || field.options! : field.options!;

    this.props.navigation.navigate(AUTOCOMPLETE_PICKER_OVERLAY_KEY, {
      pickedItem: model[field.id] as ComposableItem | string,
      items,
      displayProperty: field.displayProperty,
      keyProperty: field.keyProperty,
      renderOverlayItem: this.getComposableFormCustomComponents().renderOverlayItem,
      headerBackgroundColor: this.getComposableFormOptions().pickers.headerBackgroundColor,
      renderCustomBackground: this.getComposableFormOptions().pickers.renderCustomBackground,
      onFilterItems: (text: string) => this.props.searchMapper![field.id](text),
      onPick: (selectedItem: ComposableItem | string) => {
        this.setState({
          errors: {
            ...this.state.errors,
            [field.id]: ''
          }
        });
        if (field.shouldReturnKey) {
          if (typeof selectedItem === 'string') {
            this.props.onChange(field.id, selectedItem);
            if (field.updateFieldId && field.updateFieldKeyProperty) {
              this.props.onChange(field.updateFieldId, undefined);
            }
          } else {
            this.props.onChange(field.id, selectedItem[field.keyProperty!] as string);
            if (field.updateFieldId && field.updateFieldKeyProperty) {
              this.props.onChange(field.updateFieldId, (selectedItem as ComposableItem)[field.updateFieldKeyProperty]);
            }
          }
        } else {
          this.props.onChange(field.id, selectedItem);
        }
        if (field.updateFieldId && field.updateFieldKeyProperty) {
          this.setState({
            errors: {
              ...this.state.errors,
              [field.updateFieldId]: ''
            }
          });
        }
      },
      canExtendFullScreen: true,
      hasTextInput: true,
      minHeight: 350
    });
  };

  // This is a date picker field renderer for fields of type date
  private renderDateField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    isInline: boolean = false,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    const date = model[field.id] ? moment(model[field.id] as string, 'YYYY-MM-DD').format('DD/MM/YYYY') : undefined;

    return (
      <DatePickerField
        onRef={input => {
          this.fieldRefs[field.id] = input;
        }}
        containerStyle={[{ flex: 1 }, customStyle]}
        placeholderStyle={this.getComposableFormOptions().labels.placeholderStyle}
        inputStyle={this.getComposableFormOptions().labels.inputStyle}
        value={date}
        // floatingLabel={localizations.getString(field.label, localizations.getLanguage()) || field.label}
        label={field.label}
        // editable={false}
        onPress={() => this.openCalendar(field, model)}
        onRightIconClick={() => this.openCalendar(field, model)}
        error={errors[field.id]}
        disableErrorMessage={isInline}
      />
    );
  };

  private openCalendar = (field: FormField, model: T) => {
    Keyboard.dismiss();

    this.props.navigation.navigate(CALENDAR_PICKER_OVERLAY_KEY, {
      pickedDate: model[field.id] ? moment(model[field.id] as string, 'YYYY-MM-DD').format('YYYY-MM-DD') : Date(),
      isAlreadyPicked: Boolean(model[field.id]),
      mode: 'single-day',
      headerBackgroundColor: this.getComposableFormOptions().pickers.headerBackgroundColor,
      renderCustomBackground: this.getComposableFormOptions().pickers.renderCustomBackground,
      onConfirm: (selectedItem: string) => {
        this.setState({
          errors: {
            ...this.state.errors,
            [field.id]: ''
          }
        });

        this.props.onChange(field.id, selectedItem);
      },
      customFormOptions: this.getComposableFormOptions()
    });
  };

  // This is a map picker field renderer for fields of type date
  private renderMapField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    isInline: boolean = false,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    return (
      <MapPickerField
        onRef={input => {
          this.fieldRefs[field.id] = input;
        }}
        containerStyle={[{ flex: 1 }, customStyle]}
        placeholderStyle={this.getComposableFormOptions().labels.placeholderStyle}
        inputStyle={this.getComposableFormOptions().labels.inputStyle}
        // label={localizations.getString(field.label, localizations.getLanguage()) || field.label}
        label={field.label}
        onPress={() => this.openMapPicker(field, model)}
        positionValue={model[field.id] as GooglePlaceDetail}
        // itemValue={model[field.id] as ComposableItem | string}
        // isPercentage={field.isPercentage}
        // displayProperty={field.displayProperty}
        // keyProperty={field.keyProperty}
        error={errors[field.id]}
        disableErrorMessage={isInline}
        // options={this.props.pickerMapper ? this.props.pickerMapper[field.id] || field.options : field.options}
      />
    );
  };

  private openMapPicker = (field: FormField, model: T) => {
    Keyboard.dismiss();

    this.props.navigation.navigate(MAP_PICKER_OVERLAY_KEY, {
      apiKey: this.props.googleApiKey!,
      pickedPosition: model[field.id] as GooglePlaceDetail,
      headerBackgroundColor: this.getComposableFormOptions().pickers.headerBackgroundColor,
      renderCustomBackground: this.getComposableFormOptions().pickers.renderCustomBackground,
      renderCustomCancelButton: this.getComposableFormOptions().pickers.renderCustomCancelButton,
      onConfirm: (pickedPosition: GooglePlaceDetail) => {
        this.setState({
          errors: {
            ...this.state.errors,
            [field.id]: ''
          }
        });

        this.props.onChange(field.id, pickedPosition);
      },
      customFormOptions: this.getComposableFormOptions(),
      canExtendFullScreen: true,
      hasTextInput: true,
      minHeight: 350
    });
  };

  // This is a duration picker field renderer for fields of type date
  private renderDurationField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    isInline: boolean = false,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    const duration = this.retrieveDuration(model[field.id] as number | undefined);

    return (
      <DurationPickerField
        onRef={input => {
          this.fieldRefs[field.id] = input;
        }}
        containerStyle={[{ flex: 1 }, customStyle]}
        placeholderStyle={this.getComposableFormOptions().labels.placeholderStyle}
        inputStyle={this.getComposableFormOptions().labels.inputStyle}
        value={duration}
        label={field.label}
        onPress={() => this.openDuration(field, model)}
        onRightIconClick={() => this.openDuration(field, model)}
        error={errors[field.id]}
        disableErrorMessage={isInline}
      />
    );
  };

  private retrieveDuration = (duration?: number) => {
    if (!duration) {
      return undefined;
    }

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60 < 10 ? `0${duration % 60}` : duration % 60;

    return `${hours}:${minutes}`;
  };

  private openDuration = (field: FormField, model: T) => {
    Keyboard.dismiss();

    this.props.navigation.navigate(DURATION_PICKER_OVERLAY_KEY, {
      pickedAmount: model[field.id] as number,
      headerBackgroundColor: this.getComposableFormOptions().pickers.headerBackgroundColor,
      renderCustomBackground: this.getComposableFormOptions().pickers.renderCustomBackground,
      onConfirm: (selectedItem: number) => {
        this.setState({
          errors: {
            ...this.state.errors,
            [field.id]: ''
          }
        });

        this.props.onChange(field.id, selectedItem);
      },
      customFormOptions: this.getComposableFormOptions(),
      disabledInteraction: Platform.OS === 'android'
    });
  };

  private getComposableFormOptions = (): DefinedComposableFormOptions => {
    const { customStyle } = this.props;

    return merge({}, SharedOptions.getDefaultOptions(), customStyle);
  };

  private getComposableFormCustomComponents = (): ComposableFormCustomComponents => {
    const { customComponents } = this.props;

    return merge({}, SharedOptions.getCustomComponents(), customComponents);
  };
}

const styles = StyleSheet.create({
  formContainer: {
    justifyContent: 'center',
    alignItems: 'stretch',
    borderColor: Colors.GRAY_200,
    backgroundColor: Colors.WHITE
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch'
  },
  checkboxUrlContainer: { flexDirection: 'row', paddingHorizontal: 8, width: '100%' },
  overlayContainer: { justifyContent: 'flex-end', margin: 0 }
});
