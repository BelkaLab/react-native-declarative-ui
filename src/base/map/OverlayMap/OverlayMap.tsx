import delay from 'lodash.delay';
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { GooglePlaceDetail, GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { ComposableFormOptions } from '../../../options/SharedOptions';
import { ANIM_DURATION } from '../../../overlays/SlideBottomOverlay/SlideBottomOverlay';
import { Colors } from '../../../styles/colors';
import { globalStyles } from '../../../styles/globalStyles';

export interface IOverlayMapProps {
  apiKey: string;
  pickedPosition?: GooglePlaceDetail;
  onCancel?: () => void;
  onConfirm?: (pickedPosition: GooglePlaceDetail) => void;
  customFormOptions: ComposableFormOptions;
  headerBackgroundColor?: string;
  renderCustomBackground?: () => React.ReactElement<{}>;
  renderCustomCancelButton?: () => React.ReactElement<{}>;
}

interface IState {
  visible: boolean;
  pickedPosition?: GooglePlaceDetail;
}

export default class OverlayMap extends Component<IOverlayMapProps, IState> {
  constructor(props: IOverlayMapProps) {
    super(props);
    this.state = {
      visible: false
    };

    // this is to have a prop to know when animation is finished
    delay(() => {
      this.setState({
        visible: true
      });
    }, ANIM_DURATION);
  }

  render() {
    return (
      <View style={[globalStyles.pickerContainer, { flex: 0.8 }]}>
        {this.renderHeader()}
        {this.state.visible && (
          <GooglePlacesAutocomplete
            placeholder="Cerca"
            minLength={3}
            debounce={200}
            autoFocus={true}
            enableHighAccuracyLocation={false}
            timeout={30000}
            filterReverseGeocodingByTypes={['street_address']}
            query={{
              key: this.props.apiKey,
              language: 'it', // language of the results
              types: ['(cities)', 'address'] // default: 'geocode'
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
            nearbyPlacesAPI="GoogleReverseGeocoding" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
            GoogleReverseGeocodingQuery={{
              // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
              language: 'it'
            }}
            GooglePlacesSearchQuery={{
              // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
              rankby: 'distance'
            }}
            GooglePlacesDetailsQuery={{
              // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
              fields: 'formatted_address'
            }}
            currentLocation={true}
            currentLocationLabel="Usa la mia posizione"
          />
        )}
      </View>
    );
  }

  private renderHeader = () => {
    const { headerBackgroundColor, renderCustomBackground } = this.props;

    if (renderCustomBackground) {
      return (
        <View style={styles.listHeaderCustomerContainer}>
          <View style={styles.customBackgroundContainer}>{renderCustomBackground()}</View>
          {this.renderCancelButton()}
        </View>
      );
    }

    return (
      <View
        style={[
          styles.listHeaderContainer,
          {
            backgroundColor: headerBackgroundColor || Colors.WHITE
          }
        ]}
      >
        {this.renderCancelButton()}
      </View>
    );
  };

  private renderCancelButton = () => {
    const { renderCustomCancelButton } = this.props;
    if (renderCustomCancelButton) {
      return (
        <TouchableWithoutFeedback onPress={this.props.onCancel}>
          <View style={styles.buttonContainer}>{renderCustomCancelButton()}</View>
        </TouchableWithoutFeedback>
      );
    }

    return (
      <TouchableWithoutFeedback onPress={this.props.onCancel}>
        <View style={styles.buttonContainer}>
          <Text>Annulla</Text>
        </View>
      </TouchableWithoutFeedback>
    );
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
  listHeaderCustomerContainer: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6
  },
  customBackgroundContainer: {
    position: 'absolute',
    height: HEADER_HEIGHT,
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6
  },
  buttonContainer: { height: HEADER_HEIGHT, justifyContent: 'center' }
});
