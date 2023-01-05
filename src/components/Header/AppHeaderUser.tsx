import { useWeb3React } from "@web3-react/core";
import AddressDropdown from "../AddressDropdown/AddressDropdown";
import ConnectWalletButton from "../Common/ConnectWalletButton";
import React, { useCallback, useEffect, useState } from "react";
import { HeaderLink } from "./HeaderLink";
import connectWalletImg from "img/ic_wallet_24.svg";

import "./Header.css";
import { isHomeSite, getAccountUrl } from "lib/legacy";
import { isDevelopment } from "lib/legacy";
import cx from "classnames";
import { t, Trans } from "@lingui/macro";
import NetworkDropdown from "../NetworkDropdown/NetworkDropdown";
import LanguagePopupHome from "../NetworkDropdown/LanguagePopupHome";
import { ARBITRUM, ARBITRUM_TESTNET, AVALANCHE, getChainName, MAINNET, TESTNET } from "config/chains";
import { switchNetwork } from "lib/wallets";
import { useChainId } from "lib/chains";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillTransfer } from "@fortawesome/free-solid-svg-icons";
import Modal from "components/Modal/Modal";
import ModalIncomingFeature from "components/ModalIncomingFeature/ModalIncomingFeature";

type Props = {
  openSettings: () => void;
  small?: boolean;
  setWalletModalVisible: (visible: boolean) => void;
  disconnectAccountAndCloseSettings: () => void;
  redirectPopupTimestamp: number;
  showRedirectModal: (to: string) => void;
};

export function AppHeaderUser({
  openSettings,
  small,
  setWalletModalVisible,
  disconnectAccountAndCloseSettings,
  redirectPopupTimestamp,
  showRedirectModal,
}: Props) {
  const { chainId } = useChainId();
  const { active, account } = useWeb3React();
  const showConnectionOptions = !isHomeSite();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const networkOptions = [
    {
      label: getChainName(TESTNET),
      value: TESTNET,
      icon: "ic_bsc.svg",
      color: "#264f79",
    },
    {
      label: getChainName(MAINNET),
      value: MAINNET,
      icon: "ic_bsc.svg",
      color: "#264f79",
    },
  ];

  useEffect(() => {
    if (active) {
      setWalletModalVisible(false);
    }
  }, [active, setWalletModalVisible]);

  const onNetworkSelect = useCallback(
    (option) => {
      if (option.value === chainId) {
        return;
      }
      if (option.isDevelopment) {
        ModalIncomingFeature.open();
        return;
      }
      return switchNetwork(option.value, active);
    },
    [chainId, active]
  );

  const selectorLabel = getChainName(chainId);

  if (!active) {
    return (
      <div className="App-header-user">
        <div className={cx("App-header-trade-link", { "homepage-header": isHomeSite() })}>
          <HeaderLink
            className="default-btn"
            to="/trade"
            redirectPopupTimestamp={redirectPopupTimestamp}
            showRedirectModal={showRedirectModal}
          >
            <FontAwesomeIcon icon={faMoneyBillTransfer} style={{ marginRight: 8 }} />
            <Trans>Trade</Trans>
          </HeaderLink>
        </div>
        {showConnectionOptions ? (
          <>
            <ConnectWalletButton onClick={() => setWalletModalVisible(true)}>
              {small ? <Trans>Connect</Trans> : <Trans>Connect Wallet</Trans>}
            </ConnectWalletButton>
            <NetworkDropdown
              small={small}
              networkOptions={networkOptions}
              selectorLabel={selectorLabel}
              onNetworkSelect={onNetworkSelect}
              openSettings={openSettings}
            />
          </>
        ) : (
          <LanguagePopupHome />
        )}
        <button
          style={{ marginLeft: "1.5rem" }}
          onClick={() => {
            setIsDarkTheme((prev) => !prev);
            document.body.classList.toggle("dark-theme");
          }}
        >
          {isDarkTheme ? "dark" : "light"}
        </button>
      </div>
    );
  }

  const accountUrl = getAccountUrl(chainId, account);

  return (
    <div className="App-header-user">
      <div className="App-header-trade-link">
        <HeaderLink
          className="default-btn"
          to="/trade"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <FontAwesomeIcon icon={faMoneyBillTransfer} style={{ marginRight: 8 }} />
          <Trans>Trade</Trans>
        </HeaderLink>
      </div>

      {showConnectionOptions ? (
        <>
          <div className="App-header-user-address">
            <AddressDropdown
              account={account}
              accountUrl={accountUrl}
              disconnectAccountAndCloseSettings={disconnectAccountAndCloseSettings}
            />
          </div>
          {/* <NetworkDropdown
            small={small}
            networkOptions={networkOptions}
            selectorLabel={selectorLabel}
            onNetworkSelect={onNetworkSelect}
            openSettings={openSettings}
          /> */}
        </>
      ) : (
        <LanguagePopupHome />
      )}
    </div>
  );
}
