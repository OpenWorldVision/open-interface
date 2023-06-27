import { Trans, t } from "@lingui/macro";
import Modal from "components/Modal/Modal";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import metamaskImg from "img/metamask.png";
import coinbaseImg from "img/coinbaseWallet.png";
import walletConnectImg from "img/walletconnect-circle-blue.svg";
import CheckIcon from "img/Octagon_Check.svg";
import "./ConnectWalletModal.scss";

type Props = {
  onActivateMetamask: () => void;
  onActivateCoinbase: () => void;
  onActivateWalletConnect: () => void;
};

function ConnectWalletModal(props: Props, ref: any) {
  const { onActivateCoinbase, onActivateMetamask, onActivateWalletConnect } = props;
  const [walletModalVisible, setWalletModalVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    toggle: () => setWalletModalVisible((prev) => !prev),
    setVisible: (visible: boolean) => setWalletModalVisible(visible),
  }));

  return (
    <Modal
      className="Connect-wallet-modal"
      isVisible={walletModalVisible}
      setIsVisible={setWalletModalVisible}
      label={t`Connect to a Wallet`}
    >
      <div style={{ display: "flex", flexDirection: "row", alignItems: "start", margin: "16px 0" }}>
        <img src={CheckIcon} alt="Check Icon" />

        <div className="term-of-use">
          By connecting a wallet, I agree to OpenWorld <br /> <span>Terms of Use</span>, <span>Risks</span>,{" "}
          <span>Cookies Policy</span>, use of <span>3rd party services</span> and <span>Privacy Policy</span>
        </div>
      </div>

      <button className="Wallet-btn MetaMask-btn" onClick={onActivateMetamask}>
        <img src={metamaskImg} alt="MetaMask" />
        <div>
          <Trans id={""}>MetaMask</Trans>
        </div>
      </button>
      <button className="Wallet-btn CoinbaseWallet-btn" onClick={onActivateCoinbase}>
        <img src={coinbaseImg} alt="Coinbase Wallet" />
        <div>
          <Trans id={""}>Coinbase Wallet</Trans>
        </div>
      </button>
      <button className="Wallet-btn WalletConnect-btn" onClick={onActivateWalletConnect}>
        <img src={walletConnectImg} alt="WalletConnect" />
        <div>
          <Trans id={""}>WalletConnect</Trans>
        </div>
      </button>
      <div className="new-to-ether-section">
        <div className="title">New to Ethereum?</div>
        <div className="subtitle">
          OpenWorld Dex Perp is a DeFi app on Ethereum. Set up an Ethereum Wallet to swap and provide liquidity here.
          Learn more
        </div>
      </div>
    </Modal>
  );
}

export default forwardRef(ConnectWalletModal);
