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
    backgroundColor: Colors.WHITE,
    // paddingTop: 6
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
    paddingBottom: 32,
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6, 
    backgroundColor: Colors.WHITE
  }
});
