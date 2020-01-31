import Geolocation from '@react-native-community/geolocation';
import React, { Component } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';
import { GooglePlaceDetail, GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { withMappedNavigationParams } from 'react-navigation-props-mapper';
import { IBottomOverlayProps, withBottomOverlay } from '../../hoc/BottomOverlay';
import { ComposableFormOptions } from '../../options/SharedOptions';
import { Colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

export interface IMapPickerOverlayProps {
  apiKey: string;
  pickedPosition?: GooglePlaceDetail;
  onConfirm?: (pickedPosition: GooglePlaceDetail) => void;
  customFormOptions: ComposableFormOptions;
  headerBackgroundColor?: string;
  renderCustomBackground?: () => React.ReactElement<{}>;
  renderCustomCancelButton?: () => React.ReactElement<{}>;
}

interface IState {
  pickedPosition?: GooglePlaceDetail;
}

class MapPickerOverlay extends Component<IMapPickerOverlayProps & IBottomOverlayProps, IState> {
  constructor(props: IMapPickerOverlayProps & IBottomOverlayProps) {
    super(props);

    if (Platform.OS === 'android') {
      AndroidKeyboardAdjust.setAdjustPan();
    }
  }

  componentDidMount() {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse'
    });

    Geolocation.requestAuthorization();
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      AndroidKeyboardAdjust.setAdjustResize();
    }
  }

  render() {
    return (
      <View style={[globalStyles.pickerContainer, { height: '100%' }]}>
        <GooglePlacesAutocomplete
          placeholder="Cerca"
          minLength={3}
          debounce={200}
          enableHighAccuracyLocation={false}
          timeout={30000}
          filterReverseGeocodingByTypes={['route', 'street_address', 'locality']}
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

            this.props.dismissOverlay();
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
      </View>
    );
  }
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

export default withMappedNavigationParams()(withBottomOverlay(MapPickerOverlay));
