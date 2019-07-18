import { LocaleConfig } from 'react-native-calendars';
import { ComposableForm } from './src/ComposableForm';
import { KeyboardAvoidingScrollView } from './src/KeyboardAvoidingScrollView';
import SharedOptions from './src/options/SharedOptions';

export { ComposableForm, KeyboardAvoidingScrollView, SharedOptions };

LocaleConfig.locales['it-IT'] = {
  monthNames: [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre'
  ],
  monthNamesShort: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
  dayNames: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
};
