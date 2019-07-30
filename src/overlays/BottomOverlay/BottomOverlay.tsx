import React, { Component } from 'react';
import { IRNNBottomSheetProps, withRNNBottomSheet } from '../../hoc/RNNBottomSheet';

interface IBottomOverlayProps extends IRNNBottomSheetProps {
  renderOverlayComponent: (dismissOverlay: () => void) => React.ReactElement<{}>;
}

class BottomOverlay extends Component<IBottomOverlayProps> {
  render() {
    return this.props.renderOverlayComponent(this.props.dismissOverlay);
  }
}

export default withRNNBottomSheet(BottomOverlay);
