import React, { Component } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import GooglePlacesAutocomplete from 'react-native-google-places-autocomplete';
import { ComposableFormOptions } from '../../../options/SharedOptions';
import { Colors } from '../../../styles/colors';
import { globalStyles } from '../../../styles/globalStyles';

export interface IOverlayMapProps {
  apiKey: string;
  pickedPosition?: any;
  onCancel?: () => void;
  onConfirm?: (pickedPosition: any) => void;
  customFormOptions: ComposableFormOptions;
}

interface IState {}

export default class OverlayMap extends Component<IOverlayMapProps, IState> {
  private calendar!: SingleDayCalendar;

  constructor(props: IOverlayMapProps) {
    super(props);
  }

  render() {
    return (
      <View style={globalStyles.pickerContainer}>
        <View style={styles.listHeaderContainer}>
          <TouchableWithoutFeedback onPress={this.props.onCancel}>
            <View style={styles.buttonContainer}>
              <Text>Annulla</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={this.onConfirmPressed}>
            <View style={styles.buttonContainer}>
              <Text>Conferma</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        {/* <SingleDayCalendar
          pickedDate={this.props.pickedDate}
          isAlreadyPicked={this.props.isAlreadyPicked}
          onRef={calendar => {
            if (calendar) {
              this.calendar = calendar;
            }
          }}
          theme={this.props.customFormOptions.calendars.singleDayTheme}
        /> */}
        <GooglePlacesAutocomplete
          placeholder="Cerca"
          minLength={3}
          debounce={200}
          autoFocus={false}
          query={{
            key: this.props.apiKey,
            language: 'en', // language of the results
            types: '(cities)' // default: 'geocode'
          }}
          currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
          currentLocationLabel="Current location"
        />
      </View>
    );
  }

  private onConfirmPressed = () => {
    const pickedDate = this.calendar.getSelectedDate();

    if (this.props.onConfirm && pickedDate) {
      this.props.onConfirm(pickedDate);
    }
  };
}

const HEADER_HEIGHT = 48;

const styles = StyleSheet.create({
  listHeaderContainer: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6,
    backgroundColor: Colors.GRAY_200,
    paddingHorizontal: 16
  },
  buttonContainer: { height: HEADER_HEIGHT, justifyContent: 'center' }
});
