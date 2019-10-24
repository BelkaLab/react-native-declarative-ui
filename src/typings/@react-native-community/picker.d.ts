declare module '@react-native-community/picker' {
    import React from 'react';

    export interface PickerProps<T> extends ViewProperties {

    }

    export interface PickerStatic<T> extends NativeMethodsMixinStatic, React.ComponentClass<PickerProps<T>> {

    }

    type Picker = PickerStatic<T>;
    var Picker: PickerStatic<T>;

    export { Picker };
}