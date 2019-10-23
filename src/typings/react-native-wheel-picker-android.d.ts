declare module 'react-native-wheel-picker-android' {
    import React from 'react';
    import { StyleProp, ViewStyle, ViewProperties, NativeMethodsMixinStatic } from 'react-native';

    export interface TimePickerProps extends ViewProperties {

    }

    export interface TimePickerStatic extends NativeMethodsMixinStatic, React.ComponentClass<TimePickerProps> {

    }

    type WheelPicker = TimePickerStatic;
    var WheelPicker: TimePickerStatic;

    export interface TimePickerProps extends ViewProperties {

    }

    export interface TimePickerStatic extends NativeMethodsMixinStatic, React.ComponentClass<TimePickerProps> {

    }

    type TimePicker = TimePickerStatic;
    var TimePicker: TimePickerStatic;

    export { WheelPicker, TimePicker };
}