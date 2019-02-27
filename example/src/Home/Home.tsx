import filter from 'lodash.filter';
import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ComposableForm, SharedOptions } from 'react-native-declarative-ui';

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
  cities: Array<{ city: string }>;
}

SharedOptions.setDefaultOptions({
  formContainer: {
    externalPadding: 20,
    inlinePadding: 16
  }
});

export default class Home extends Component<IHomeProps, IState> {
  constructor(props: IHomeProps) {
    super(props);

    this.state = {
      model: {
        email: '',
        password: '',
        city: ''
      },
      cities: [{ city: 'Trento' }, { city: 'Verona' }, { city: 'Parigi' }]
    };
  }

  render() {
    return (
      <View style={styles.root}>
        <ComposableForm
          model={this.state.model}
          onChange={this.onChangeHandler}
          structure={require('../../src/assets/test.json')}
          searchMapper={{
            city: async text => {
              if (text) {
                return filter(this.state.cities, city => city.city.includes(text));
              }

              return this.state.cities;
            }
          }}
          pickerMapper={{
            city: this.state.cities
          }}
        />
        <Text>{JSON.stringify(this.state.model)}</Text>
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
  }
});
