import { StyleSheet } from 'react-native';
import { Colors } from './colors';

const INPUT_HEIGHT = 60;
const SMALL_INPUT_HEIGHT = 54;

export const globalStyles = StyleSheet.create({
  input: {
    minHeight: INPUT_HEIGHT,
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.GRAY_400,
    borderRadius: 4,
    backgroundColor: Colors.WHITE
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 6,
    borderColor: 'transparent'
  },
  pickerContainer: {
    backgroundColor: Colors.WHITE
  },
  iPhoneXBottomView: {
    height: 34,
    backgroundColor: Colors.GRAY_200
  },
  errorMessage: {
    color: Colors.RED,
    fontSize: 12,
    marginTop: 8,
    marginStart: 4
  }
});
