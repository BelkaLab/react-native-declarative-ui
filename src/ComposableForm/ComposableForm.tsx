import { transformAll } from '@overgear/yup-ast';
import { useNavigation } from '@react-navigation/native';
import to from 'await-to-js';
import every from 'lodash.every';
import filter from 'lodash.filter';
import find from 'lodash.find';
import first from 'lodash.first';
import has from 'lodash.has';
import isEqual from 'lodash.isequal';
import merge from 'lodash.merge';
import some from 'lodash.some';
import moment from 'moment';
import numbro from 'numbro';
import React, { useEffect, useState, useImperativeHandle, forwardRef, Ref } from 'react';
import { EmitterSubscription, findNodeHandle, Keyboard, Linking, Platform, StyleProp, StyleSheet, Text, TextInput, TouchableNativeFeedback, TouchableOpacity, View, ViewStyle } from 'react-native';
import { GooglePlaceDetail } from 'react-native-google-places-autocomplete';
import { Schema, ValidationError } from 'yup';
import { RightFieldIcon } from '../base/icons/RightFieldIcon';
import { AutocompletePickerField } from '../components/AutocompletePickerField';
import { CheckBoxField } from '../components/CheckBoxField';
import { DatePickerField } from '../components/DatePickerField';
import { DurationPickerField } from '../components/DurationPickerField';
import { MapPickerField } from '../components/MapPickerField';
import { Segment } from '../components/Segment';
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
  model: T;
  structure: ComposableStructure;
  onChange: (id: string, value?: unknown) => void;
  onFormFilled: (isFilled: boolean) => void;
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

const ComposableForm = <T extends ComposableItem>(
  props: IComposableFormProps<T>,
  ref: Ref<{ isValid: () => void }>
) => {
  const {
    model,
    structure,
    onChange,
    onFormFilled,
    onFocus,
    loadingMapper,
    pickerMapper,
    searchMapper,
    createNewItemMapper,
    externalModel,
    customStyle,
    customComponents,
    googleApiKey,
    dynamicValidations,
  } = props;

  useImperativeHandle(ref, () => ({ isValid }));

  const validateStructureWithProps = (structure: ComposableStructure, props: IComposableFormProps<T>) => {
    // add all fields check here
    // if props.googleApiKey is undefined, cannot use MapField
    return;
  };

  validateStructureWithProps(props.structure, props);

  const [errors, setErrors] = useState<Dictionary<string>>({});
  const [isKeyboardOpened, setIsKeyboardOpened] = useState<boolean>(false);
  const [isAutoFocused, setIsAutoFocused] = useState<boolean>(false);
  const [isFocusingMultiline, setIsFocusingMultiline] = useState<boolean | undefined>();
  const [isScreenVisible, setIsScreenVisible] = useState<boolean>(false);
  const [subscriptions, setSubscriptions] = useState<EmitterSubscription[] | undefined>();
  const [navigationSubs, setNavigationSubs] = useState<(() => void)[] | undefined>();

  const fieldRefs: Dictionary<TextInput> = {};
  const navigation = useNavigation();

  useEffect(() => {
    setSubscriptions([
      Keyboard.addListener(
        Platform.select({ ios: 'keyboardWillHide', android: 'keyboardDidHide' }),
        keyboardDidShow
      ),
      Keyboard.addListener(
        Platform.select({ ios: 'keyboardWillHide', android: 'keyboardDidHide' }),
        keyboardDidHide
      )
    ]);

    return () => subscriptions?.forEach((emitter) => (!!emitter && !!emitter.remove) && emitter.remove());
  }, []);

  useEffect(() => {
    setNavigationSubs([
      navigation.addListener('focus', () => {
        setIsScreenVisible(true);
      }),
      navigation.addListener('blur', () => {
        setIsScreenVisible(false);
      }),
    ]);

    return () => navigationSubs?.forEach((unsubscribe) => unsubscribe());
  }, []);

  useEffect(() => {
    if (!isAutoFocused && isScreenVisible) {
      const focusField = find(structure.fields, (f: FormField) => f.autoFocus && fieldRefs[f.id]) as
        | FormField
        | undefined;

      if (focusField) {
        fieldRefs[focusField.id].focus();
      }

      setIsAutoFocused(true);
    }
  }, [isAutoFocused, isScreenVisible]);

  useEffect(() => {
    if (model) {
      checkIfFormIsFilled(model);

      if (structure) {
        structure.fields.map(field => {
          if (!field.persistentValue && isFieldNotVisible(field, model) && !!model[field.id]) {
            onChange(field.id, undefined);
          }
        });
      }
    }
  }, [model]);

  const keyboardDidShow = () => {
    setIsKeyboardOpened(true);
  };

  const keyboardDidHide = () => {
    setIsKeyboardOpened(false);

    if (!isFocusingMultiline) {
      blurTextFields();
    }
  };

  const blurTextFields = () => {
    // Check if input has focus and remove it
    for (const [, input] of Object.entries(fieldRefs)) {
      if (input && input.isFocused() && findNodeHandle(input)) {
        input.blur();
      }
    }
  };

  const checkIfFormIsFilled = (model: T) => {
    if (structure) {
      // add check if we have errors on non mandatory fields
      const isFilled = !some(
        filter(structure.fields, (field: FormField) => isFieldMandatoryAndNotFilled(field, model)), // Mandatory fields
        (field: FormField) => model[field.id] === undefined || model[field.id] === '' || model[field.id] === false
      );

      onFormFilled(isFilled);
    }
  };

  const isFieldMandatoryAndNotFilled = (field: FormField, model: T): boolean => {
    if (isFieldNotVisible(field, model)) {
      return false;
    };

    if (field.validation) {
      const schema: Schema<unknown> = transformAll(field.validation);

      try {
        schema.validateSync(model[field.id]);
        return false;
      } catch (err) {
        return err.type === 'required' || (err.type === 'oneOf' && err.params.values === "true");
      }
    } else if ((field.type === 'inline' || field.type === 'group') && field.childs) {
      let isInnerFilled = false;
      for (const child of field.childs) {
        isInnerFilled = isInnerFilled || isFieldMandatoryAndNotFilled(child, model);
      }

      return isInnerFilled;
    }

    return false;
  };

  const validateForm = async (fields: FormField[], model: T): Promise<boolean> => {
    setErrors({});

    let newErrors: Dictionary<string> = {};

    for (const field of fields) {
      if ((field.type === 'inline' || field.type === 'group') && field.childs) {
        for (const child of field.childs) {
          if ((child.type === 'inline' || child.type === 'group') && child.childs) {
            for (const innerChild of child.childs) {
              newErrors = await validateField(innerChild, model, newErrors);
            }
          } else {
            newErrors = await validateField(child, model, newErrors);
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
        newErrors = await validateField(field, model, newErrors);
      }
    }

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

    setErrors(newErrors);

    return !some(newErrors, (error: string) => error !== undefined);
  };

  const validateField = async (
    field: FormField,
    model: T,
    errors: Dictionary<string>
  ): Promise<Dictionary<string>> => {
    if (isFieldNotVisible(field, model)) {
      return errors;
    };

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

  const isFieldNotVisible = (field: FormField, model: T) => {
    if (field.visibilityFieldId !== undefined && field.visibilityFieldValue !== undefined) {
      // This is a visibilityField, that means we have a condition on parent to show/hide the field in the form
      const {
        keyProperty,
        visibilityFieldId,
        visibilityFieldValue,
        isVisibilityFieldExternal,
        isVisibilityConditionInverted
      } = field;

      if (isVisibilityFieldExternal && !externalModel) {
        throw new Error(
          `Field ${field.id} has isVisibilityFieldExternal setted as true, but you forgot to pass dependencyModel to ComposableForm as props`
        );
      }

      if (Array.isArray(visibilityFieldValue)) {
        const shouldBeHidden = isVisibilityConditionInverted
          ? some(visibilityFieldValue, (value: ComposableItem | string) =>
            shouldFieldBeHidden(
              !isVisibilityFieldExternal ? model! : externalModel!,
              visibilityFieldId,
              value,
              isVisibilityConditionInverted,
              keyProperty
            )
          )
          : every(visibilityFieldValue, (value: ComposableItem | string) =>
            shouldFieldBeHidden(
              !isVisibilityFieldExternal ? model! : externalModel!,
              visibilityFieldId,
              value,
              isVisibilityConditionInverted,
              keyProperty
            )
          );

        return shouldBeHidden;
      } else {
        return shouldFieldBeHidden(
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

  const shouldFieldBeHidden = (
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

  const isValid = async (): Promise<boolean> => {
    return await validateForm(structure!.fields, model);
  };

  const getComposableFormOptions = (): DefinedComposableFormOptions => {
    return merge({}, SharedOptions.getDefaultOptions(), customStyle);
  };

  const getComposableFormCustomComponents = (): ComposableFormCustomComponents => {
    return merge({}, SharedOptions.getCustomComponents(), customComponents);
  };

  const renderFields = (
    field: FormField,
    index: string | number,
    model: T,
    errors: Dictionary<string>,
    groupId: string = '',
    flex?: number,
    customStyle?: StyleProp<ViewStyle>
  ) => {
    if (isFieldNotVisible(field, model)) {
      return <View key={index} />;
    }

    const isInline = !!flex && flex < 1;

    switch (field.type) {
      case 'header':
        return (
          <View
            key={index}
            style={{
              marginTop: getComposableFormOptions().formContainer.inlinePadding
            }}
          >
            {!!getComposableFormCustomComponents().renderHeaderTitle ? (
              getComposableFormCustomComponents().renderHeaderTitle!(field.label)
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
            style={[styles.formRow, { flex, marginTop: getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {renderTextField(field, model, errors, isInline, customStyle)}
          </View>
        );
      case 'number':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {renderNumberField(field, model, errors, isInline, customStyle)}
          </View>
        );
      case 'checkbox':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {renderCheckBoxField(field, model, errors, customStyle)}
          </View>
        );
      case 'toggle':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {renderToggleField(field, model, errors, customStyle)}
          </View>
        );
      case 'select':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {renderSelectField(field, model, errors, isInline, customStyle)}
          </View>
        );
      case 'autocomplete':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {renderAutocompleteField(field, model, errors, isInline, customStyle)}
          </View>
        );
      case 'date':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {renderDateField(field, model, errors, isInline, customStyle)}
          </View>
        );
      case 'duration':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {renderDurationField(field, model, errors, isInline, customStyle)}
          </View>
        );
      case 'map':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {renderMapField(field, model, errors, isInline, customStyle)}
          </View>
        );
      case 'segment':
        return (
          <View
            key={index}
            style={[styles.formRow, { flex, marginTop: getComposableFormOptions().formContainer.inlinePadding }]}
          >
            {renderSegment(field, model, customStyle)}
          </View>
        );
      case 'inline':
        return (
          <View key={index}>
            <View style={styles.formRow}>
              {field.childs!.map((childField, childIndex) =>
                renderFields(
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
            {hasErrorsInline(field.childs!) && (
              <Text style={globalStyles.errorMessage}>{retrieveErrorMessageInline(field.childs!)}</Text>
            )}
          </View>
        );
      default:
        throw new Error(`Field ${field.id} has a type which is currently not supported: ${field.type}`);
    }
  };

  const renderTextField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    isInline: boolean = false,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    return (
      <TextField
        onRef={input => {
          fieldRefs[field.id] = input;

          if (field.disabled) {
            setSelectionAtStart(input);
          }
        }}
        // label={localizations.getString(field.label, localizations.getLanguage()) || field.label}
        label={field.label}
        description={field.description}
        containerStyle={[{ flex: 1 }, customStyle]}
        placeholderStyle={getComposableFormOptions().labels.placeholderStyle}
        inputStyle={getComposableFormOptions().labels.inputStyle}
        color={getComposableFormOptions().textFields.color}
        descriptionColor={getComposableFormOptions().textFields.descriptionColor}
        disabledColor={getComposableFormOptions().textFields.disabledColor}
        backgroundColor={getComposableFormOptions().textFields.backgroundColor}
        disabledBackgroundColor={getComposableFormOptions().textFields.disabledBackgroundColor}
        floatingLabelColor={getComposableFormOptions().textFields.floatingLabelColor}
        focusedFloatingLabelColor={getComposableFormOptions().textFields.focusedFloatingLabelColor}
        errorFloatingLabelColor={getComposableFormOptions().textFields.errorFloatingLabelColor}
        disabledFloatingLabelColor={getComposableFormOptions().textFields.disabledFloatingLabelColor}
        borderColor={getComposableFormOptions().textFields.borderColor}
        errorBorderColor={getComposableFormOptions().textFields.errorBorderColor}
        focusedBorderColor={getComposableFormOptions().textFields.focusedBorderColor}
        disabledBorderColor={getComposableFormOptions().textFields.disabledBorderColor}
        errorMessageColor={getComposableFormOptions().textFields.errorMessageColor}
        value={model[field.id] as string | undefined}
        editable={!field.disabled && !(loadingMapper && loadingMapper[field.id])}
        multiline={field.multiline}
        maxLength={field.maxLength}
        scrollEnabled={false} // fix for trigger scroll on iOS when keyboard opens
        keyboardType={field.keyboard || 'default'}
        isPassword={field.isPassword}
        autoCapitalize={
          field.autoCapitalize || (field.keyboard && field.keyboard === 'email-address' ? 'none' : 'sentences')
        }
        returnKeyType={field.nextField ? 'next' : 'done'}
        blurOnSubmit={field.multiline ? false : !field.nextField}
        selectionColor={getComposableFormOptions().textFields.selectionColor || Colors.PRIMARY_BLUE}
        onSubmitEditing={event => {
          if (field.nextField && fieldRefs[field.nextField] && !fieldRefs[field.nextField].isFocused()) {
            fieldRefs[field.nextField].focus();
          }
        }}
        onChangeText={val => {
          setErrors({
            ...errors,
            [field.id]: ''
          });

          onChange(field.id, val);
        }}
        rightContent={
          <RightFieldIcon
            rightIcon={Platform.select({ ios: 'cancel', android: 'clear' })}
            onRightIconClick={() => {
              setErrors({
                ...errors,
                [field.id]: ''
              });

              onChange(field.id, '');
            }}
          />
        }
        rightContentVisibility={field.isPassword || !!model[field.id]}
        isLoading={loadingMapper && loadingMapper[field.id]}
        onFocusLabel={() => {
          if (onFocus) {
            onFocus(fieldRefs[field.id]);
          }

          setIsFocusingMultiline(false);
        }}
        onTouchStart={() => {
          if (field.multiline) {
            setIsFocusingMultiline(true);
          }
        }}
        error={errors[field.id]}
        isMandatory={field.isMandatory}
        disableErrorMessage={isInline}
      />
    );
  };

  const renderNumberField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    isInline: boolean = false,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    return (
      <TextField
        onRef={input => {
          fieldRefs[field.id] = input;

          if (field.disabled) {
            setSelectionAtStart(input);
          }
        }}
        // label={localizations.getString(field.label, localizations.getLanguage()) || field.label}
        label={field.label}
        description={field.description}
        containerStyle={[{ flex: 1 }, customStyle]}
        placeholderStyle={getComposableFormOptions().labels.placeholderStyle}
        inputStyle={getComposableFormOptions().labels.inputStyle}
        color={getComposableFormOptions().textFields.color}
        descriptionColor={getComposableFormOptions().textFields.descriptionColor}
        disabledColor={getComposableFormOptions().textFields.disabledColor}
        backgroundColor={getComposableFormOptions().textFields.backgroundColor}
        disabledBackgroundColor={getComposableFormOptions().textFields.disabledBackgroundColor}
        floatingLabelColor={getComposableFormOptions().textFields.floatingLabelColor}
        focusedFloatingLabelColor={getComposableFormOptions().textFields.focusedFloatingLabelColor}
        errorFloatingLabelColor={getComposableFormOptions().textFields.errorFloatingLabelColor}
        disabledFloatingLabelColor={getComposableFormOptions().textFields.disabledFloatingLabelColor}
        borderColor={getComposableFormOptions().textFields.borderColor}
        errorBorderColor={getComposableFormOptions().textFields.errorBorderColor}
        focusedBorderColor={getComposableFormOptions().textFields.focusedBorderColor}
        disabledBorderColor={getComposableFormOptions().textFields.disabledBorderColor}
        errorMessageColor={getComposableFormOptions().textFields.errorMessageColor}
        value={formatNumberWithLocale(model[field.id] as string | number | undefined)}
        editable={!field.disabled && !(loadingMapper && loadingMapper[field.id])}
        currency={field.currency}
        maxLength={field.maxLength}
        isPercentage={field.isPercentage}
        keyboardType="decimal-pad"
        returnKeyType={field.nextField ? 'next' : 'done'}
        blurOnSubmit={field.multiline ? false : !field.nextField}
        selectionColor={getComposableFormOptions().textFields.selectionColor || Colors.PRIMARY_BLUE}
        isLoading={loadingMapper && loadingMapper[field.id]}
        onSubmitEditing={() => {
          if (field.nextField && fieldRefs[field.nextField] && !fieldRefs[field.nextField].isFocused()) {
            fieldRefs[field.nextField].focus();
          }
        }}
        onChangeText={val => {
          setErrors({
            ...errors,
            [field.id]: ''
          });

          onChange(field.id, convertStringToNumber(val));
        }}
        onFocusLabel={() => {
          if (onFocus) {
            onFocus(fieldRefs[field.id]);
          }
        }}
        onBlurLabel={() => {
          onChange(field.id, restoreNumberWithLocale(model[field.id] as string | number | undefined));
        }}
        error={errors[field.id]}
        isMandatory={field.isMandatory}
        disableErrorMessage={isInline}
      />
    );
  };

  const restoreNumberWithLocale = (val?: string | number): number | undefined => {
    if (!val) {
      return undefined;
    }

    if (!isNaN(Number(val))) {
      return numbro(val).value();
    }

    return numbro.unformat(String(val));
  };

  const formatNumberWithLocale = (n?: string | number): string | undefined => {
    if (!!n && isSeparatorLastChar(String(n))) {
      const numberString = String(n);
      return `${numberString.slice(0, numberString.length - 1)},`;
    }

    if (Number(n) || n === 0) {
      return numbro(n).format();
    }

    return !!n ? String(n) : undefined;
  };

  const convertStringToNumber = (val: string) => {
    if (!val) {
      return undefined;
    }

    if (isSeparatorLastChar(val) || ((val.includes(',') || val.includes('.')) && val.slice(-1) === '0')) {
      return val;
    }

    return numbro.unformat(val);
  };

  const isSeparatorLastChar = (n: string) => {
    return n.match(/^-?\d*(\.|,)$/) !== null;
  };

  const renderCheckBoxField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    return (
      <CheckBoxField
        color={getComposableFormOptions().checkBoxes?.color}
        containerStyle={[{ flex: 1 }, customStyle]}
        isChecked={model[field.id] as boolean}
        rightTextView={
          field.urlLink
            ? renderCheckBoxLink(field)
            : undefined
        }
        rightText={field.checkboxTextPosition === 'right' ? field.label : undefined}
        leftText={!field.checkboxTextPosition || field.checkboxTextPosition === 'left' ? field.label : undefined}
        onClick={() => {
          Keyboard.dismiss();
          onChange(field.id, !model[field.id]);
        }}
        error={errors[field.id]}
        isMandatory={field.isMandatory}
      />
    );
  };

  const renderCheckBoxLink = (field: FormField) => {
    if (Platform.OS === 'android') {
      return (
        <View style={styles.checkboxUrlContainer}>
          <Text>{field.label}</Text>
          <TouchableNativeFeedback onPress={() => Linking.openURL(field.urlLink!)}>
            <Text
              style={{
                color: getComposableFormOptions().checkBoxes?.urlColor || Colors.PRIMARY_BLUE,
                fontWeight: '600'
              }}
            >
              {field.checkBoxLabelUrl}
            </Text>
          </TouchableNativeFeedback>
        </View>
      );
    }

    return (
      <View style={styles.checkboxUrlContainer}>
        <Text>{field.label}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(field.urlLink!)}>
          <Text
            style={{
              color: getComposableFormOptions().checkBoxes?.urlColor || Colors.PRIMARY_BLUE,
              fontWeight: '600'
            }}
          >
            {field.checkBoxLabelUrl}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderToggleField = (
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
        renderCustomLabel={getComposableFormCustomComponents().renderToggleLabelItem}
        trackColor={getComposableFormOptions().toggles.trackColor}
        label={field.label}
        onValueChange={val => {
          setErrors({
            ...errors,
            [field.id]: ''
          });

          onChange(field.id, val);
        }}
        disabled={field.disabled}
        isMandatory={field.isMandatory}
      />
    );
  };

  const renderSelectField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    isInline: boolean = false,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    return (
      <SelectPickerField
        onRef={input => {
          fieldRefs[field.id] = input;

          setSelectionAtStart(input);
        }}
        containerStyle={[{ flex: 1 }, customStyle]}
        placeholderStyle={getComposableFormOptions().labels.placeholderStyle}
        inputStyle={getComposableFormOptions().labels.inputStyle}
        // label={localizations.getString(field.label, localizations.getLanguage()) || field.label}
        label={field.label}
        onPress={() => openSelectPicker(field, model)}
        itemValue={model[field.id] as ComposableItem | string}
        // isPercentage={field.isPercentage}
        displayProperty={field.displayProperty}
        keyProperty={field.keyProperty}
        error={errors[field.id]}
        disableErrorMessage={isInline}
        isMandatory={field.isMandatory}
        options={pickerMapper ? pickerMapper[field.id] || field.options : field.options}
      />
    );
  };

  const openSelectPicker = (field: FormField, model: T) => {
    Keyboard.dismiss();

    const items = pickerMapper ? pickerMapper[field.id] || field.options! : field.options!;

    navigation.navigate(SELECT_PICKER_OVERLAY_KEY, {
      pickedItem: retrievePickedItem(items, model[field.id] as ComposableItem | string, field.keyProperty),
      items,
      displayProperty: field.displayProperty,
      keyProperty: field.keyProperty,
      topLabel: field.pickerLabel,
      headerBackgroundColor: getComposableFormOptions().pickers.headerBackgroundColor,
      renderCustomBackground: getComposableFormOptions().pickers.renderCustomBackground,
      knobColor: getComposableFormOptions().pickers.knobColor,
      onCreateNewItemPressed: () => {
        if (createNewItemMapper) {
          createNewItemMapper[field.id].callback();
        }
      },
      createNewItemLabel: createNewItemMapper && createNewItemMapper[field.id].label,
      onPick: (selectedItem: ComposableItem | string) => {
        setErrors({
          ...errors,
          [field.id]: ''
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
          onChange(field.id, getValueByKey(selectedItem as ComposableItem, field.keyProperty));
        } else {
          onChange(field.id, selectedItem);
        }

        if (field.updateFieldId && field.updateFieldKeyProperty) {
          onChange(field.updateFieldId, (selectedItem as ComposableItem)[field.updateFieldKeyProperty]);
          setErrors({
            ...errors,
            [field.updateFieldId]: ''
          });
        }
      },
      renderOverlayItem: getComposableFormCustomComponents().renderOverlayItem,
      renderTopLabelItem: getComposableFormCustomComponents().renderTopLabelItem,
      isBackDropMode: true,
      selectedItemTextColor: getComposableFormOptions().selectPickers.selectedItemTextColor,
      selectedItemIconColor: getComposableFormOptions().selectPickers.selectedItemIconColor,
      createNewItemTextColor: getComposableFormOptions().selectPickers.createNewItemTextColor,
      createNewItemIconColor: getComposableFormOptions().selectPickers.createNewItemIconColor
    });
  };

  const retrievePickedItem = (
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

    return find<ComposableItem>(items as ComposableItem[], (item: ComposableItem) => getValueByKey(item, keyProperty) === value);
  };

  const renderAutocompleteField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    isInline: boolean = false,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    const items = pickerMapper ? pickerMapper[field.id] || field.options! : field.options!;

    return (
      <AutocompletePickerField
        onRef={input => {
          fieldRefs[field.id] = input;

          setSelectionAtStart(input);
        }}
        containerStyle={[{ flex: 1 }, customStyle]}
        placeholderStyle={getComposableFormOptions().labels.placeholderStyle}
        inputStyle={getComposableFormOptions().labels.inputStyle}
        // label={localizations.getString(field.label, localizations.getLanguage()) || field.label}
        label={field.label}
        onPress={() => openAutocompletePicker(field, model)}
        itemValue={model[field.id] as ComposableItem | string}
        // isPercentage={field.isPercentage}
        displayProperty={field.displayProperty}
        keyProperty={field.keyProperty}
        error={errors[field.id]}
        isMandatory={field.isMandatory}
        disableErrorMessage={isInline}
        options={items}
      />
    );
  };

  const openAutocompletePicker = (field: FormField, model: T) => {
    Keyboard.dismiss();

    const items = pickerMapper ? pickerMapper[field.id] || field.options! : field.options!;

    navigation.navigate(AUTOCOMPLETE_PICKER_OVERLAY_KEY, {
      pickedItem: model[field.id] as ComposableItem | string,
      items,
      displayProperty: field.displayProperty,
      keyProperty: field.keyProperty,
      renderOverlayItem: getComposableFormCustomComponents().renderOverlayItem,
      headerBackgroundColor: getComposableFormOptions().pickers.headerBackgroundColor,
      renderCustomBackground: getComposableFormOptions().pickers.renderCustomBackground,
      knobColor: getComposableFormOptions().pickers.knobColor,
      onFilterItems: (text: string) => searchMapper![field.id](text),
      onPick: (selectedItem: ComposableItem | string) => {
        setErrors({
          ...errors,
          [field.id]: ''
        });

        if (field.shouldReturnKey) {
          if (typeof selectedItem === 'string') {
            onChange(field.id, selectedItem);
            if (field.updateFieldId && field.updateFieldKeyProperty) {
              onChange(field.updateFieldId, undefined);
            }
          } else {
            onChange(field.id, selectedItem[field.keyProperty!] as string);
            if (field.updateFieldId && field.updateFieldKeyProperty) {
              onChange(field.updateFieldId, (selectedItem as ComposableItem)[field.updateFieldKeyProperty]);
            }
          }
        } else {
          onChange(field.id, selectedItem);
        }
        if (field.updateFieldId && field.updateFieldKeyProperty) {
          setErrors({
            ...errors,
            [field.updateFieldId]: ''
          });
        }
      },
      hasTextInput: true,
      minHeight: 350
    });
  };

  // is a date picker field renderer for fields of type date
  const renderDateField = (
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
          fieldRefs[field.id] = input;

          setSelectionAtStart(input);
        }}
        containerStyle={[{ flex: 1 }, customStyle]}
        placeholderStyle={getComposableFormOptions().labels.placeholderStyle}
        inputStyle={getComposableFormOptions().labels.inputStyle}
        value={date}
        // floatingLabel={localizations.getString(field.label, localizations.getLanguage()) || field.label}
        label={field.label}
        // editable={false}
        onPress={() => openCalendar(field, model)}
        onRightIconClick={() => openCalendar(field, model)}
        error={errors[field.id]}
        isMandatory={field.isMandatory}
        disableErrorMessage={isInline}
      />
    );
  };

  const openCalendar = (field: FormField, model: T) => {
    Keyboard.dismiss();

    navigation.navigate(CALENDAR_PICKER_OVERLAY_KEY, {
      pickedDate: model[field.id] ? moment(model[field.id] as string, 'YYYY-MM-DD').format('YYYY-MM-DD') : Date(),
      isAlreadyPicked: Boolean(model[field.id]),
      mode: 'single-day',
      headerBackgroundColor: getComposableFormOptions().pickers.headerBackgroundColor,
      renderCustomBackground: getComposableFormOptions().pickers.renderCustomBackground,
      knobColor: getComposableFormOptions().pickers.knobColor,
      onConfirm: (selectedItem: string) => {
        setErrors({
          ...errors,
          [field.id]: ''
        });

        onChange(field.id, selectedItem);
      },
      customFormOptions: getComposableFormOptions()
    });
  };

  // is a map picker field renderer for fields of type date
  const renderMapField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    isInline: boolean = false,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    return (
      <MapPickerField
        onRef={input => {
          fieldRefs[field.id] = input;

          setSelectionAtStart(input);
        }}
        containerStyle={[{ flex: 1 }, customStyle]}
        placeholderStyle={getComposableFormOptions().labels.placeholderStyle}
        inputStyle={getComposableFormOptions().labels.inputStyle}
        // label={localizations.getString(field.label, localizations.getLanguage()) || field.label}
        label={field.label}
        onPress={() => openMapPicker(field, model)}
        positionValue={model[field.id] as GooglePlaceDetail}
        // itemValue={model[field.id] as ComposableItem | string}
        // isPercentage={field.isPercentage}
        // displayProperty={field.displayProperty}
        // keyProperty={field.keyProperty}
        error={errors[field.id]}
        isMandatory={field.isMandatory}
        disableErrorMessage={isInline}
      // options={pickerMapper ? pickerMapper[field.id] || field.options : field.options}
      />
    );
  };

  const openMapPicker = (field: FormField, model: T) => {
    Keyboard.dismiss();

    navigation.navigate(MAP_PICKER_OVERLAY_KEY, {
      apiKey: googleApiKey!,
      pickedPosition: model[field.id] as GooglePlaceDetail,
      headerBackgroundColor: getComposableFormOptions().pickers.headerBackgroundColor,
      renderCustomBackground: getComposableFormOptions().pickers.renderCustomBackground,
      knobColor: getComposableFormOptions().pickers.knobColor,
      renderCustomCancelButton: getComposableFormOptions().pickers.renderCustomCancelButton,
      onConfirm: (pickedPosition: GooglePlaceDetail) => {
        setErrors({
          ...errors,
          [field.id]: ''
        });

        onChange(field.id, pickedPosition);
      },
      customFormOptions: getComposableFormOptions(),
      hasTextInput: true,
      minHeight: 350
    });
  };

  // is a component to pick between several items
  const renderSegment = (
    field: FormField,
    model: T,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    return (
      <Segment
        data={field.options as string[]}
        containerStyle={[{ flex: 1 }, customStyle]}
        activeItemIndex={model[field.id] as number}
        onChange={(index) => onChange(field.id, index)}
        backgroundColor={getComposableFormOptions().segments.backgroundColor}
        activeTextStyle={getComposableFormOptions().segments.segmentActiveTextStyle}
        inactiveTextStyle={getComposableFormOptions().segments.segmentInactiveTextStyle}
        activeItemColor={getComposableFormOptions().segments.activeItemColor}
      />
    );
  };

  // is a duration picker field renderer for fields of type date
  const renderDurationField = (
    field: FormField,
    model: T,
    errors: Dictionary<string>,
    isInline: boolean = false,
    customStyle: StyleProp<ViewStyle> = {}
  ) => {
    const duration = retrieveDuration(model[field.id] as number | undefined);

    return (
      <DurationPickerField
        onRef={input => {
          fieldRefs[field.id] = input;

          setSelectionAtStart(input);
        }}
        containerStyle={[{ flex: 1 }, customStyle]}
        placeholderStyle={getComposableFormOptions().labels.placeholderStyle}
        inputStyle={getComposableFormOptions().labels.inputStyle}
        value={duration}
        label={field.label}
        onPress={() => openDuration(field, model)}
        onRightIconClick={() => openDuration(field, model)}
        error={errors[field.id]}
        isMandatory={field.isMandatory}
        disableErrorMessage={isInline}
      />
    );
  };

  const retrieveDuration = (duration?: number) => {
    if (!duration) {
      return undefined;
    }

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60 < 10 ? `0${duration % 60}` : duration % 60;

    return `${hours}:${minutes}`;
  };

  const openDuration = (field: FormField, model: T) => {
    Keyboard.dismiss();

    navigation.navigate(DURATION_PICKER_OVERLAY_KEY, {
      pickedAmount: model[field.id] as number,
      headerBackgroundColor: getComposableFormOptions().pickers.headerBackgroundColor,
      renderCustomBackground: getComposableFormOptions().pickers.renderCustomBackground,
      knobColor: getComposableFormOptions().pickers.knobColor,
      headerHeight: 14,
      onConfirm: (selectedItem: number) => {
        setErrors({
          ...errors,
          [field.id]: ''
        });

        onChange(field.id, selectedItem);
      },
      customFormOptions: getComposableFormOptions(),
      disabledInteraction: Platform.OS === 'android'
    });
  };

  const hasErrorsInline = (fields: FormField[]): boolean => {
    return some(fields, (f: FormField) => has(errors, f.id) && errors[f.id]);
  };

  const retrieveErrorMessageInline = (fields: FormField[]): string => {
    const found = find(fields, (f: FormField) => errors[f.id] !== undefined);
    return found ? errors[found.id] : '';
  };

  const setSelectionAtStart = (input: TextInput) => {
    if (input) {
      input.setNativeProps({
        selection: { start: 0, end: 0 }
      });
    }
  }

  return (
    <View
      style={[
        styles.formContainer,
        { backgroundColor: getComposableFormOptions().formContainer.backgroundColor }
      ]}
    >
      <View
        style={{
          backgroundColor: getComposableFormOptions().formContainer.backgroundColor,
          padding: getComposableFormOptions().formContainer.externalPadding
        }}
      >
        {structure.fields.map((field, index) => renderFields(field, index, model, errors))}
      </View>
    </View>
  );
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
  overlayContainer: { justifyContent: 'flex-end', margin: 0 },
  segmentActiveText: { color: Colors.WHITE },
  segmentInactiveText: { color: Colors.BLACK }
});

export default forwardRef(ComposableForm);