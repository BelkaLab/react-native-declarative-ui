import Geolocation from '@react-native-community/geolocation';
import React, { FunctionComponent, useEffect } from 'react';
import { Dimensions, Platform, View } from 'react-native';
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';
import { GooglePlaceDetail, GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { withMappedNavigationParams } from 'react-navigation-props-mapper';
import withRNBottomSheet, { IRNBottomSheetProps } from '../../hoc/withRNBottomSheet';
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

const MapPickerOverlay: FunctionComponent<IMapPickerOverlayProps & IRNBottomSheetProps> = props => {
  const {
    apiKey,
    pickedPosition: initialPosition,
    onConfirm,
    dismissOverlay,
  } = props;

  useEffect(() => {
    if (Platform.OS === 'android') {
      AndroidKeyboardAdjust.setAdjustPan();
    }

    return () => {
      if (Platform.OS === 'android') {
        AndroidKeyboardAdjust.setAdjustResize();
      }
    }
  }, []);

  useEffect(() => {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse'
    });

    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
    }
  }, []);

  return (
    <View style={[globalStyles.pickerContainer, { height: Dimensions.get('window').height }]}>
      <GooglePlacesAutocomplete
        placeholder="Cerca"
        minLength={3}
        debounce={200}
        enableHighAccuracyLocation={false}
        timeout={30000}
        filterReverseGeocodingByTypes={['route', 'street_address', 'locality']}
        query={{
          key: apiKey,
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
          const picked = details || initialPosition;
          if (onConfirm && picked) {
            onConfirm(picked);
          }

          dismissOverlay();
        }}
        getDefaultValue={() => {
          return initialPosition ? initialPosition.formatted_address : '';
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

export default withMappedNavigationParams()(withRNBottomSheet(MapPickerOverlay));
