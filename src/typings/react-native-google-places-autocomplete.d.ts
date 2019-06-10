declare module 'react-native-google-places-autocomplete' {
    import React from 'react';
    import { NativeMethodsMixinStatic, ViewProperties } from 'react-native';

    export interface GooglePlacesAutocompleteProps extends ViewProperties {
        //     container	object(View)
        // description	object(Text style)
        // textInputContainer	object(View style)
        // textInput	object(style)
        // loader	object(View style)
        // listView	object(ListView style)
        // predefinedPlacesDescription	object(Text style)
        // poweredContainer	object(View style)
        // powered	object(Image style)
        // separator	object(View style)
        // row	object(View style)
    }

    export interface GooglePlacesAutocompleteStatic extends NativeMethodsMixinStatic, React.ComponentClass<GooglePlacesAutocompleteProps> {

    }

    var GooglePlacesAutocomplete: GooglePlacesAutocompleteStatic;
    type GooglePlacesAutocomplete = GooglePlacesAutocompleteStatic;

    export default GooglePlacesAutocomplete;
}
