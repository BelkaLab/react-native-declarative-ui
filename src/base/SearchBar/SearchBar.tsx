import React, { Component } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProperties,
  TouchableHighlight,
  View,
  ViewStyle
} from 'react-native';
// import FeatherIcon from 'react-native-vector-icons/Feather';
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
        <View style={[styles.inputContainer]}>
          {/* <FeatherIcon name="search" size={16} color={Colors.WHITE} /> */}
          <View />
          <TextInput
            {...props}
            style={[styles.input]}
            value={this.state.keyword}
            onChangeText={this.onChangeText}
            onSubmitEditing={this.onSearch}
            autoCorrect={false}
            returnKeyType="search"
            underlineColorAndroid="transparent"
            placeholderTextColor={Colors.WHITE}
            selectionColor={Colors.WHITE}
          />
          {Boolean(this.state.keyword) && (
            <TouchableHighlight onPress={this.onDelete} style={styles.iconXContainer}>
              <View style={[styles.iconXContent]}>
                <View />
                {/* <FeatherIcon name="x" color={Colors.WHITE} size={10} /> */}
              </View>
            </TouchableHighlight>
          )}
          {/* {Boolean(yearPicker) && this.renderYearBox()} */}
        </View>
        {this.props.onCancelSearch && (
          <TouchableHighlight
            onPress={this.onCancelSearch}
            style={{ alignContent: 'center', justifyContent: 'center', padding: 8 }}
          >
            <Text style={{ color: Colors.WHITE }}>localizations.cancel</Text>
            {/* text={'localizations.cancel'} color={Colors.WHITE} /> */}
          </TouchableHighlight>
        )}
      </View>
    );
  }

  //   private renderYearBox = () => {
  //     return (
  //       <View style={styles.yearBox}>
  //         <View style={[ficStyles.verticalDivider, { backgroundColor: Colors.WHITE_TEXT_DISABLED }]} />
  //         <Touchable
  //           onPress={this.onShowYearPicker}
  //           style={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}
  //         >
  //           <View style={{ flexDirection: 'row' }}>
  //             <Body text={String(this.props.currentYear)} color={Colors.WHITE} style={{ paddingHorizontal: 8 }} />
  //             <FeatherIcon name="chevron-down" size={20} color={Colors.WHITE} style={{ alignSelf: 'center' }} />
  //           </View>
  //         </Touchable>
  //       </View>
  //     );
  //   };

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
    // await this.setState({ keyword: '', autoCorrect: true });
    // await this.setState({ autoCorrect: false });
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
    height: 48,
    paddingLeft: 16,
    paddingRight: 8,
    elevation: 4
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    flex: 1,
    paddingHorizontal: 8,
    borderRadius: 10,
    // backgroundColor: Colors.WHITE_OPACITY_SEARCHBAR,
    backgroundColor: Colors.PRIMARY_BLUE,
    marginRight: 8
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    marginLeft: 8,
    color: Colors.WHITE
  },
  iconXContainer: {
    paddingHorizontal: 8,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconXContent: {
    // backgroundColor: Colors.WHITE_OPACITY_SEARCHBAR,
    backgroundColor: Colors.PRIMARY_BLUE,
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
