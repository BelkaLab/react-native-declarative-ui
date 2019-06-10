import React, { Component } from 'react';
import { Dimensions, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { GooglePlaceDetail, GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { ComposableFormOptions } from '../../../options/SharedOptions';
import { Colors } from '../../../styles/colors';
import { globalStyles } from '../../../styles/globalStyles';

const deviceHeight = Dimensions.get('window').height;

export interface IOverlayMapProps {
  apiKey: string;
  pickedPosition?: GooglePlaceDetail;
  onCancel?: () => void;
  onConfirm?: (pickedPosition: GooglePlaceDetail) => void;
  customFormOptions: ComposableFormOptions;
}

interface IState {
  pickedPosition?: GooglePlaceDetail;
}

export default class OverlayMap extends Component<IOverlayMapProps, IState> {
  constructor(props: IOverlayMapProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View
        style={[
          globalStyles.pickerContainer,
          {
            height: deviceHeight * 0.8
          }
        ]}
      >
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
            language: 'it', // language of the results
            types: 'address' // default: 'geocode'
          }}
          styles={{
            textInputContainer: {
              backgroundColor: Colors.WHITE,
              borderTopWidth: 0,
              borderBottomWidth: 0
            },
            textInput: {
              backgroundColor: Colors.GRAY_300
            }
          }}
          fetchDetails={true}
          onPress={(_, details) => {
            // 'details' is provided when fetchDetails = true
            if (details) {
              this.setState({
                pickedPosition: details
              });
            }

            const picked = details || this.props.pickedPosition;
            if (this.props.onConfirm && picked) {
              this.props.onConfirm(picked);
            }
          }}
          getDefaultValue={() => {
            return this.props.pickedPosition ? this.props.pickedPosition.formatted_address : '';
          }}
          nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
          GooglePlacesSearchQuery={{
            // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
            rankby: 'distance'
          }}
          GooglePlacesDetailsQuery={{
            // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
            fields: 'formatted_address'
          }}
        />
      </View>
    );
  }

  private onConfirmPressed = () => {
    const picked = this.state.pickedPosition || this.props.pickedPosition;
    if (this.props.onConfirm && picked) {
      this.props.onConfirm(picked);
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
