import React, { Component } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Colors } from '../../../styles/colors';
import { globalStyles } from '../../../styles/globalStyles';
import { SingleDayCalendar } from '../SingleDayCalendar';

export interface IOverlayCalendarProps {
  mode: 'single-day';
  pickedDate: string;
  onCancel?: () => void;
  onConfirm?: (pickedDate: string) => void;
  isAlreadyPicked?: boolean;
}

interface IState {}

export default class OverlayCalendar extends Component<IOverlayCalendarProps, IState> {
  private calendar!: SingleDayCalendar;

  constructor(props: IOverlayCalendarProps) {
    super(props);
  }

  render() {
    return (
      <View style={globalStyles.pickerContainer}>
        <View style={styles.listHeaderContainer}>
          <TouchableWithoutFeedback onPress={this.props.onCancel}>
            <Text>Annulla</Text>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={this.onConfirmPressed}>
            <Text>Conferma</Text>
          </TouchableWithoutFeedback>
        </View>
        <SingleDayCalendar
          pickedDate={this.props.pickedDate}
          isAlreadyPicked={this.props.isAlreadyPicked}
          onRef={calendar => {
            if (calendar) {
              this.calendar = calendar;
            }
          }}
        />
      </View>
    );
  }

  // render() {
  //   const navBarGradient = require('../../../img/gradient_top_bar.png');

  //   return (
  //     <View style={styles.root}>
  //       <View style={styles.underView}>
  //         <Touchable style={{ height: '100%' }} onPress={() => this.props.navigator.dismissLightBox()}>
  //           <View />
  //         </Touchable>
  //         <View style={styles.bottomView}>
  //           <View style={styles.backgroundGradient}>
  //             <Image source={navBarGradient} resizeMode="stretch" style={{ width: '100%', height: 48 }} />
  //           </View>
  //           <View style={styles.buttonContainer}>
  //             {this.props.onCancel && (
  //               <Touchable style={{ height: HEADER_HEIGHT, justifyContent: 'center' }} onPress={this.props.onCancel}>
  //                 <Body text={localizations.cancel} color={Colors.WHITE} />
  //               </Touchable>
  //             )}
  //             {this.props.onConfirm && (
  //               <Touchable style={{ height: HEADER_HEIGHT, justifyContent: 'center' }} onPress={this.onConfirmPressed}>
  //                 <Body text={localizations.confirm} color={Colors.WHITE} style={{ fontWeight: 'bold' }} />
  //               </Touchable>
  //             )}
  //           </View>

  //           {this.renderCalendar()}
  //         </View>
  //       </View>
  //     </View>
  //   );
  // }

  // private renderCalendar = () => {
  //   return (
  //     <SingleDayCalendar
  //       pickedDate={this.props.pickedDate}
  //       isAlreadyPicked={this.props.isAlreadyPicked}
  //       onRef={calendar => {
  //         if (calendar) {
  //           this.calendar = calendar;
  //         }
  //       }}
  //     />
  //   );
  // };

  private onConfirmPressed = () => {
    const pickedDate = this.calendar.getSelectedDate();

    if (this.props.onConfirm && pickedDate) {
      this.props.onConfirm(pickedDate);
    }
  };
}

const HEADER_HEIGHT = 48;

const styles = StyleSheet.create({
  listHeaderContainer: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopRightRadius: 6,
    borderTopLeftRadius: 6,
    backgroundColor: Colors.GRAY_200,
    paddingHorizontal: 16
  }
});
