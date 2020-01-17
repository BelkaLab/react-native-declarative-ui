declare module 'react-native-android-keyboard-adjust' {
    export interface IAndroidAdjustKeyboard {
        setAdjustNothing: () => void;
        setAdjustPan: () => void;
        setAdjustResize: () => void;
        setAdjustUnspecified: () => void;
        setAlwaysVisible: () => void;
        setAlwaysHidden: () => void;
        setVisible: () => void;
        setHidden: () => void;
        setUnchanged: () => void;
    }

    var AndroidKeyboardAdjust: IAndroidAdjustKeyboard;
    type AndroidKeyboardAdjust = IAndroidAdjustKeyboard;

    export default AndroidKeyboardAdjust;
}
