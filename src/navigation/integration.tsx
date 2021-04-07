import React from 'react';
import { SelectPickerOverlay } from '../overlays/SelectPickerOverlay';
import { AutocompletePickerOverlay } from '../overlays/AutocompletePickerOverlay';
import { CalendarPickerOverlay } from '../overlays/CalendarPickerOverlay';
import { DurationPickerOverlay } from '../overlays/DurationPickerOverlay';
import { MapPickerOverlay } from '../overlays/MapPickerOverlay';
import { createStackNavigator } from '@react-navigation/stack';
import { bottomSheetOptions } from '../hoc/BottomOverlay';
import { SelectPickerSectionOverlay } from '../overlays/SelectPickerSectionOverlay';

export const SELECT_PICKER_OVERLAY_KEY = 'react-native-declarative-ui-select-picker-overlay';
export const SELECT_PICKER_SECTION_OVERLAY_KEY = 'react-native-declarative-ui-select-picker-section-overlay';
export const AUTOCOMPLETE_PICKER_OVERLAY_KEY = 'react-native-declarative-ui-autocomplete-picker-overlay';
export const CALENDAR_PICKER_OVERLAY_KEY = 'react-native-declarative-ui-calendar-picker-overlay';
export const DURATION_PICKER_OVERLAY_KEY = 'react-native-declarative-ui-calendar-duration-overlay';
export const MAP_PICKER_OVERLAY_KEY = 'react-native-declarative-ui-map-picker-overlay';

const Stack = createStackNavigator();

export const ComposableFormModals = [
  <Stack.Screen
    key={SELECT_PICKER_OVERLAY_KEY}
    name={SELECT_PICKER_OVERLAY_KEY}
    component={SelectPickerOverlay}
    options={bottomSheetOptions}
  />,
  <Stack.Screen
    key={SELECT_PICKER_SECTION_OVERLAY_KEY}
    name={SELECT_PICKER_SECTION_OVERLAY_KEY}
    component={SelectPickerSectionOverlay}
    options={bottomSheetOptions}
  />,
  <Stack.Screen
    key={AUTOCOMPLETE_PICKER_OVERLAY_KEY}
    name={AUTOCOMPLETE_PICKER_OVERLAY_KEY}
    component={AutocompletePickerOverlay}
    options={bottomSheetOptions}
  />,
  <Stack.Screen
    key={CALENDAR_PICKER_OVERLAY_KEY}
    name={CALENDAR_PICKER_OVERLAY_KEY}
    component={CalendarPickerOverlay}
    options={bottomSheetOptions}
  />,
  <Stack.Screen
    key={DURATION_PICKER_OVERLAY_KEY}
    name={DURATION_PICKER_OVERLAY_KEY}
    component={DurationPickerOverlay}
    options={bottomSheetOptions}
  />,
  <Stack.Screen
    key={MAP_PICKER_OVERLAY_KEY}
    name={MAP_PICKER_OVERLAY_KEY}
    component={MapPickerOverlay}
    options={bottomSheetOptions}
  />,
];
