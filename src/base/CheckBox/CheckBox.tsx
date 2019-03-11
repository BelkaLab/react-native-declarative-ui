import React, { Component } from 'react';
import { Image, StyleProp, StyleSheet, Text, TextStyle, TouchableHighlight, View, ViewStyle } from 'react-native';

export interface ICheckBoxProps {
  onClick?: () => void;
  isIndeterminate?: boolean;
  isChecked?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  leftText?: string;
  leftTextView?: JSX.Element;
  rightText?: string;
  leftTextStyle?: StyleProp<TextStyle>;
  rightTextView?: JSX.Element;
  rightTextStyle?: StyleProp<TextStyle>;
  checkedImage?: JSX.Element;
  unCheckedImage?: JSX.Element;
  checkBoxColor?: string;
  disabled?: boolean;
}

interface IState {
  isChecked: boolean;
}

export default class CheckBox extends Component<ICheckBoxProps, IState> {
  constructor(props: ICheckBoxProps) {
    super(props);
    this.state = {
      isChecked: this.props.isChecked || false
    };
  }

  static getDerivedStateFromProps(nextProps: ICheckBoxProps, prevState: IState) {
    if (prevState.isChecked !== nextProps.isChecked) {
      //   this.setState({ isChecked: nextProps.isChecked });
      return {
        isChecked: nextProps.isChecked
      };
    }
    return null;
  }

  render() {
    return (
      <TouchableHighlight
        style={this.props.containerStyle}
        onPress={this.onClick}
        underlayColor="transparent"
        disabled={this.props.disabled}
      >
        <View style={styles.container}>
          {this.renderLeft()}
          {this.renderImage()}
          {this.renderRight()}
        </View>
      </TouchableHighlight>
    );
  }

  private onClick = () => {
    this.setState({
      isChecked: !this.state.isChecked
    });

    if (this.props.onClick) {
      this.props.onClick();
    }
  };

  private renderLeft = () => {
    if (this.props.leftTextView) {
      return this.props.leftTextView;
    }

    if (!this.props.leftText) {
      return null;
    }

    return <Text style={[styles.leftText, this.props.leftTextStyle]}>{this.props.leftText}</Text>;
  };

  private renderRight = () => {
    if (this.props.rightTextView) {
      return this.props.rightTextView;
    }

    if (!this.props.rightText) {
      return null;
    }

    return <Text style={[styles.rightText, this.props.rightTextStyle]}>{this.props.rightText}</Text>;
  };

  private renderImage = () => {
    if (this.props.isIndeterminate) {
      return this.retrieveCheckedImage();
    }

    if (this.state.isChecked) {
      return this.props.checkedImage ? this.props.checkedImage : this.retrieveCheckedImage();
    }

    return this.props.unCheckedImage ? this.props.unCheckedImage : this.retrieveCheckedImage();
  };

  private retrieveCheckedImage = () => {
    if (this.props.isIndeterminate) {
      return (
        <Image
          source={require('../../assets/ic_indeterminate_check_box.png')}
          style={{ tintColor: this.props.checkBoxColor }}
        />
      );
    }

    return (
      <Image
        source={
          this.state.isChecked
            ? require('../../assets/ic_check_box.png')
            : require('../../assets/ic_check_box_outline_blank.png')
        }
        style={{ tintColor: this.props.checkBoxColor }}
      />
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  leftText: {
    flex: 1
  },
  rightText: {
    flex: 1,
    marginLeft: 10
  }
});
