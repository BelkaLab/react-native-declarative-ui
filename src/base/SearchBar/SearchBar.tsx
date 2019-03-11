import React, { Component } from 'react';
import { Image, Platform, StyleProp, StyleSheet, Text, TextInput, TextInputProperties, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Colors } from '../../../src/styles/colors';

export interface ISearchBarProps extends TextInputProperties {
  onSearch?: (text: string) => void;
  onDelete?: () => void;
  onCancelSearch?: () => void;
  onChangeText?: (text: string) => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

interface IState {
  keyword: string;
}

export default class SearchBar extends Component<ISearchBarProps, IState> {
  constructor(props: ISearchBarProps) {
    super(props);
    this.state = {
      keyword: props.value || ''
    };
  }

  render() {
    const { contentContainerStyle, ...props } = this.props;

    return (
      <View style={[styles.searchBarContainer, contentContainerStyle]}>
        <View style={styles.inputContainer}>
          <Image source={require('../../assets/search.png')} style={{ width: 16, height: 16, marginHorizontal: 8 }} />
          <TextInput
            {...props}
            style={styles.input}
            value={this.state.keyword}
            onChangeText={this.onChangeText}
            onSubmitEditing={this.onSearch}
            autoCorrect={false}
            returnKeyType="search"
            underlineColorAndroid="transparent"
            placeholderTextColor={Colors.WHITE}
          />
          {Boolean(this.state.keyword) && (
            <TouchableOpacity onPress={this.onDelete} style={styles.iconXContainer}>
              <View style={styles.iconXContent}>
                <Image
                  source={Platform.select({
                    ios: require('../../assets/ios_clear_input.png'),
                    android: require('../../assets/android_clear_input.png')
                  })}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
        {this.props.onCancelSearch && (
          <TouchableOpacity
            onPress={this.onCancelSearch}
            style={{ alignContent: 'center', justifyContent: 'center', padding: 8 }}
          >
            <Text style={{ color: Colors.WHITE }}>localizations.cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  private onChangeText = async (text: string) => {
    await this.setState({ keyword: text });
    if (this.props.onChangeText) {
      await this.props.onChangeText(this.state.keyword);
    }
  };

  private onSearch = async () => {
    if (this.props.onSearch) {
      await this.props.onSearch(this.state.keyword);
    }
  };

  private onCancelSearch = () => {
    if (this.props.onCancelSearch) {
      this.props.onCancelSearch();
    }
  };

  private onDelete = async () => {
    await this.setState({ keyword: '' });
    if (this.props.onDelete) {
      await this.props.onDelete();
    }
  };
}

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 64,
    paddingTop: 16,
    paddingHorizontal: 16,
    elevation: 4
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.GRAY_400,
    backgroundColor: Colors.GRAY_100
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: 'transparent',
    color: Colors.BLACK
  },
  iconXContainer: {
    paddingHorizontal: 8,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconXContent: {
    backgroundColor: Colors.WHITE_OPACITY_SEARCHBAR,
    borderRadius: 8,
    height: 14,
    width: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  yearBox: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
