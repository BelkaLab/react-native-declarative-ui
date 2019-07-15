import filter from 'lodash.filter';
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ComposableForm, KeyboardAvoidingScrollView, SharedOptions } from 'react-native-declarative-ui';
import { Colors } from '../styles/colors';

type City = {
  city: string;
};

export interface IHomeProps {}

interface IState {
  model: {
    email?: string;
    password?: string;
    acceptToS?: boolean;
    language?: {
      code: string;
      name: string;
    };
    city?: string;
    age?: number;
    phone?: string;
    fax?: string;
  };
  cities: City[];
}

SharedOptions.setDefaultOptions({
  formContainer: {
    externalPadding: 20,
    inlinePadding: 16
  },
  calendars: {}
});

export default class Home extends Component<IHomeProps, IState> {
  constructor(props: IHomeProps) {
    super(props);

    this.state = {
      model: {},
      cities: [{ city: 'Trento' }, { city: 'Verona' }, { city: 'Parigi' }]
    };
  }

  render() {
    return (
      <View style={styles.root}>
        <KeyboardAvoidingScrollView style={{ flex: 1 }}>
          <ComposableForm
            model={this.state.model}
            onChange={this.onChangeHandler}
            structure={require('../../src/assets/test.json')}
            searchMapper={{
              city: async text => {
                if (text) {
                  return filter(this.state.cities, (city: City) => city.city.includes(text));
                }

                return this.state.cities;
              }
            }}
            pickerMapper={{
              city: this.state.cities,
              language: [
                {
                  code: 'it',
                  name: 'Italiano'
                },
                {
                  code: 'en',
                  name: 'Inglese'
                }
              ]
            }}
          />
          <View style={styles.modelContainer}>
            <Text>Model: </Text>
            <Text>{JSON.stringify(this.state.model)}</Text>
          </View>
        </KeyboardAvoidingScrollView>
      </View>
    );
  }

  private onChangeHandler = (id: string, value: unknown) => {
    this.setState(state => ({
      model: {
        ...state.model,
        [id]: value
      }
    }));
  };
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 32,
    alignItems: 'stretch',
    backgroundColor: 'white'
  },
  modelContainer: { padding: 20, borderTopWidth: 1, borderColor: Colors.GRAY_300 }
});
