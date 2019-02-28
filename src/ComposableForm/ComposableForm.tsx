import every from 'lodash.every';
import find from 'lodash.find';
import isEqual from 'lodash.isequal';
import merge from 'lodash.merge';
import some from 'lodash.some';
import numbro from 'numbro';
import languages from 'numbro/dist/languages.min.js';
import React, { Component } from 'react';
import { Keyboard, Linking, Platform, StyleProp, StyleSheet, Text, TouchableHighlight, View, ViewStyle } from 'react-native';
import { ComposableFormCustomComponents } from 'react-native-declarative-ui';
import Modal from 'react-native-modal';
import { Colors } from '../../src/styles/colors';
import { TextInputInstance } from '../base/FloatingLabel';
import { RightFieldIcon } from '../base/icons/RightFieldIcon';
import { ItemPicker } from '../base/ItemPicker';
import { SearchableItemPicker } from '../base/SearchableItemPicker';
import { AutocompletePickerField } from '../components/AutocompletePickerField';
import { CheckBoxField } from '../components/CheckBoxField';
import { SelectPickerField } from '../components/SelectPickerField';
import { TextField } from '../components/TextField';
import { ComposableItem } from '../models/composableItem';
import { ComposableStructure, Dictionary } from '../models/composableStructure';
import { FormField } from '../models/formField';
import { showOverlay } from '../navigation/integration';
import SharedOptions, { ComposableFormOptions } from '../options/SharedOptions';

numbro.registerLanguage(languages['it-IT']);
numbro.setLanguage('it-IT');

const ANIM_DURATION = 200;

interface IComposableFormProps<T> {
  model: T;
  structure: ComposableStructure;
  onChange: (id: string, value?: unknown) => void;
  onSave?: () => void;
  onClear?: () => void;
  pickerMapper?: {
    [id: string]: ComposableItem[] | string[];
  };
  searchMapper?: {
    [id: string]: (filterText?: string) => Promise<ComposableItem[] | string[]>;
  };
  externalModel?: T;
  customStyle?: ComposableFormOptions;
  customComponents?: ComposableFormCustomComponents;
}

interface IState {
  structure: ComposableStructure;
  errors: Dictionary<string>;
  isFormFilled: boolean;
  isKeyboardOpened: boolean;
  isModalVisible: boolean;
  overlayComponent?: React.ReactElement<{}>;
}

export default class ComposableForm<T extends ComposableItem> extends Component<IComposableFormProps<T>, IState> {
  private fieldRefs: Dictionary<TextInputInstance> = {};
  private errors: Dictionary<string> = {};

  constructor(props: IComposableFormProps<T>) {
    super(props);

    this.validateStructureWithProps(props.structure, props);

    this.state = {
      structure: props.structure,
      errors: {},
      isFormFilled: false,
      isKeyboardOpened: false,
      isModalVisible: false
    };
  }

  private validateStructureWithProps = (structure: ComposableStructure, props: IComposableFormProps<T>) => {
    return;
  };

  componentDidMount() {
    const focusField = find(this.state.structure.fields, f => f.autoFocus && this.fieldRefs[f.id]) as
      | FormField
      | undefined;

    if (focusField) {
      this.fieldRefs[focusField.id].focus();
    }
  }

  async componentWillReceiveProps(nextProps: IComposableFormProps<T>) {
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
        {/* <View
          style={[
            { flexDirection: 'row', alignItems: 'center' },
            {
              height: 40,
              backgroundColor: Colors.WHITE,
              paddingHorizontal: 16
            }
          ]}
        >
          {Boolean(structure.headerIcon) && (
            <FeatherIcon
              style={{ paddingLeft: 8, paddingRight: 8 }}
              name={structure.headerIcon!}
              size={24}
              color={Colors.BLACK}
            />
          )}
          <Text>{structure.title}</Text>
        </View> */}
        <View
          style={{
            backgroundColor: this.getComposableFormOptions().formContainer.backgroundColor,
            padding: this.getComposableFormOptions().formContainer.externalPadding
          }}
        >
          {structure.fields.map((field, index) => this.renderFields(field, index, model, errors))}
        </View>
        {this.state.overlayComponent && (
          <Modal
            animationInTiming={ANIM_DURATION}
            animationOutTiming={ANIM_DURATION}
            backdropTransitionInTiming={ANIM_DURATION}
            backdropTransitionOutTiming={ANIM_DURATION}
            backdropColor={Colors.OVERLAY_OPACITY}
            onBackdropPress={() => {
              this.setState({
                isModalVisible: false
              });
            }}
            isVisible={this.state.isModalVisible}
            style={styles.overlayContainer}
          >
            {this.state.overlayComponent}
          </Modal>
        )}
      </View>
    );
  }

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
          `Field ${
            field.id
          } has isVisibilityFieldExternal setted as true, but you forgot to pass dependencyModel to ComposableForm as props`
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
        value={model[field.id] as string | undefined}
        editable={!field.disabled}
        multiline={field.multiline}
        keyboardType={field.keyboard || 'default'}
        isPassword={field.isPassword}
        autoCapitalize={
          field.autoCapitalize || (field.keyboard && field.keyboard === 'email-address' ? 'none' : 'sentences')
        }
        returnKeyType={field.nextField ? 'next' : 'done'}
        blurOnSubmit={field.multiline ? false : !field.nextField}
        selectionColor={Colors.PRIMARY_BLUE}
        onSubmitEditing={() => {
          if (field.nextField && this.fieldRefs[field.nextField]) {
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
        onFocus={() => {
          //   if (this.props.onFocus) {
          //     this.props.onFocus(this.fieldRefs[field.id]);
          //   }
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
        value={this.formatNumberWithLocale(model[field.id] as string | number | undefined)}
        editable={!field.disabled}
        // currency={field.isCurrency ? this.props.currency : undefined}
        // isPercentage={field.isPercentage}
        keyboardType="decimal-pad"
        returnKeyType={field.nextField ? 'next' : 'done'}
        blurOnSubmit={field.multiline ? false : !field.nextField}
        selectionColor={Colors.PRIMARY_BLUE}
        onSubmitEditing={() => {
          if (field.nextField && this.fieldRefs[field.nextField]) {
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
        onFocus={() => {
          // if (this.props.onFocus) {
          //   this.props.onFocus(this.inputsRef[field.id]);
          // }
        }}
        error={errors[field.id]}
        disableErrorMessage={isInline}
      />
    );
  };

  private formatNumberWithLocale = (n?: string | number): string | undefined => {
    if (Number(n) || n === 0) {
      return numbro(n).format();
    }

    return !!n ? String(n) : undefined;
  };

  private convertStringToNumber = (val: string) => {
    if (!val) {
      return undefined;
    }

    if (this.isSeparatorLastChar(val)) {
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

    if (SharedOptions.isRNNAvailable()) {
      showOverlay((dismissOverlay: () => void) => this.renderSelectPickerOverlay(field, model, dismissOverlay));
    } else {
      this.setState({
        isModalVisible: true,
        overlayComponent: this.renderSelectPickerOverlay(field, model, () =>
          this.setState({
            isModalVisible: false
          })
        )
      });
    }
  };

  private renderSelectPickerOverlay = (field: FormField, model: T, closeOverlay: () => void) => {
    const items = this.props.pickerMapper ? this.props.pickerMapper[field.id] || field.options! : field.options!;

    return (
      <ItemPicker
        pickedItem={model[field.id] as ComposableItem | string}
        items={items}
        displayProperty={field.displayProperty}
        keyProperty={field.keyProperty}
        onPick={(selectedItem: ComposableItem | string) => {
          this.setState({
            errors: {
              ...this.state.errors,
              [field.id]: ''
            }
          });

          if (field.shouldReturnKey) {
            if (typeof selectedItem !== 'object') {
              throw new Error(
                `Field ${
                  field.id
                } is setted as "isObjectMappedToKey" but your picker is returning a string instead of an object`
              );
            }
            this.props.onChange(field.id, selectedItem[field.keyProperty!]);
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

          closeOverlay();
        }}
        renderSelectPickerItem={this.getComposableFormCustomComponents().renderSelectPickerItem}
      />
    );
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

    if (SharedOptions.isRNNAvailable()) {
      showOverlay((dismissOverlay: () => void) => this.renderAutocompleteOverlay(field, model, dismissOverlay));
    } else {
      this.setState({
        isModalVisible: true,
        overlayComponent: this.renderAutocompleteOverlay(field, model, () =>
          this.setState({
            isModalVisible: false
          })
        )
      });
    }
  };

  private renderAutocompleteOverlay = (field: FormField, model: T, closeOverlay: () => void) => {
    const items = this.props.pickerMapper ? this.props.pickerMapper[field.id] || field.options! : field.options!;

    return (
      <View>
        <SearchableItemPicker
          pickedItem={model[field.id] as ComposableItem | string}
          items={items}
          displayProperty={field.displayProperty}
          keyProperty={field.keyProperty}
          onFilterItems={text => {
            return this.props.searchMapper![field.id](text);
          }}
          onPick={(selectedItem: ComposableItem | string) => {
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
                  this.props.onChange(
                    field.updateFieldId,
                    (selectedItem as ComposableItem)[field.updateFieldKeyProperty]
                  );
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

            closeOverlay();
          }}
          renderSelectPickerItem={this.getComposableFormCustomComponents().renderSelectPickerItem}
        />
      </View>
    );
  };

  private getComposableFormOptions = () => {
    const { customStyle } = this.props;

    return merge({}, SharedOptions.getDefaultOptions(), customStyle);
  };

  private getComposableFormCustomComponents = () => {
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
