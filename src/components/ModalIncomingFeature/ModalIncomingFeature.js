import { t, Trans } from "@lingui/macro";
import Modal from "components/Modal/Modal";
import React, { Component } from "react";
import "./ModalIncomingFeature.css";

export default class ModalIncomingFeature extends Component {
  static instance = null;

  static open() {
    if (ModalIncomingFeature.instance) {
      ModalIncomingFeature.instance.setState({
        visible: true,
      });
    }
  }
  static close() {
    if (ModalIncomingFeature.instance) {
      ModalIncomingFeature.instance.setState({
        visible: true,
      });
    }
  }

  constructor(props) {
    super(props);
    ModalIncomingFeature.instance = this;
    this.state = { visible: false };
  }
  close() {
    if (ModalIncomingFeature.instance) {
      ModalIncomingFeature.instance.setState({ visible: false });
    }
  }

  render() {
    return (
      <Modal className="IncomingFeatureModal" isVisible={this.state.visible} setIsVisible={this.close} label={t`Opps!`}>
        <Trans>Incoming feature...</Trans>
      </Modal>
    );
  }
}
