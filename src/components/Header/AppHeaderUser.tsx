import { useWeb3React } from "@web3-react/core";
import AddressDropdown from "../AddressDropdown/AddressDropdown";
import ConnectWalletButton from "../Common/ConnectWalletButton";
import React, { useCallback, useEffect, useState } from "react";
import { HeaderLink } from "./HeaderLink";
import connectWalletImg from "img/ic_wallet_24.svg";

import "./Header.css";
import { isHomeSite, getAccountUrl, isLocal } from "lib/legacy";
import { isDevelopment } from "lib/legacy";
import cx from "classnames";
import { t, Trans } from "@lingui/macro";
import NetworkDropdown from "../NetworkDropdown/NetworkDropdown";
import LanguagePopupHome from "../NetworkDropdown/LanguagePopupHome";
import { ARBITRUM, ARBITRUM_TESTNET, AVALANCHE, getChainName, HARMONY, MAINNET, TESTNET } from "config/chains";
import { switchNetwork } from "lib/wallets";
import { useChainId } from "lib/chains";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins, faMoneyBillTransfer } from "@fortawesome/free-solid-svg-icons";
import ModalIncomingFeature from "components/ModalIncomingFeature/ModalIncomingFeature";
import SwitchThemeButton from "components/Common/SwitchThemeButton";
import Switch from "react-switch";
import { IS_LIGHT_THEME } from "config/localStorage";
import Modal from "components/Modal/Modal";

type Props = {
  openSettings: () => void;
  small?: boolean;
  setWalletModalVisible: (visible: boolean) => void;
  disconnectAccountAndCloseSettings: () => void;
  redirectPopupTimestamp: number;
  showRedirectModal: (to: string) => void;
  onlyIcon?: boolean;
};

export function AppHeaderUser({
  openSettings,
  small,
  setWalletModalVisible,
  disconnectAccountAndCloseSettings,
  redirectPopupTimestamp,
  showRedirectModal,
  onlyIcon,
}: Props) {
  const { chainId } = useChainId();
  const { active, account } = useWeb3React();
  const showConnectionOptions = !isHomeSite();
  const [isDarkTheme, setIsDarkTheme] = useState(!JSON.parse(localStorage.getItem(IS_LIGHT_THEME) || `false`));
  const networkOptions = [
    {
      label: getChainName(ARBITRUM),
      value: ARBITRUM,
      icon: "arbitrum.png",
      color: "#264f79",
    },
  ];
  if (isLocal()) {
    networkOptions.push({
      label: getChainName(TESTNET),
      value: TESTNET,
      icon: "ic_bsc.svg",
      color: "#264f79",
    });
  }

  useEffect(() => {
    if (active) {
      setWalletModalVisible(false);
    }
  }, [active, setWalletModalVisible]);

  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add("dark-theme");
    }
  }, []);

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
        <HeaderLink
          className="default-btn"
          to="/buy_oap"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <FontAwesomeIcon icon={faCoins} />
          {onlyIcon ? null : (
            <div style={{ marginLeft: 8, fontWeight: 700 }}>
              <Trans>Buy OAP</Trans>
            </div>
          )}
        </HeaderLink>
        <div className={cx("App-header-trade-link", { "homepage-header": isHomeSite() })}>
          <HeaderLink
            className="default-btn"
            to="/trade"
            redirectPopupTimestamp={redirectPopupTimestamp}
            showRedirectModal={showRedirectModal}
          >
            <FontAwesomeIcon icon={faMoneyBillTransfer} />
            {onlyIcon ? null : (
              <div style={{ marginLeft: 8, fontWeight: 700 }}>
                <Trans>Trade</Trans>
              </div>
            )}
          </HeaderLink>
        </div>
        {showConnectionOptions ? (
          <div className="connect-wallet">
            <ConnectWalletButton onClick={() => setWalletModalVisible(true)}>
              {onlyIcon ? null : <Trans>Connect Wallet</Trans>}
            </ConnectWalletButton>
            <div className="connect-wallet-divider" />
            <NetworkDropdown
              small={small}
              networkOptions={networkOptions}
              selectorLabel={selectorLabel}
              onNetworkSelect={onNetworkSelect}
              openSettings={openSettings}
            />
          </div>
        ) : (
          <LanguagePopupHome />
        )}
        <SwitchThemeButton
          small={onlyIcon}
          onClick={() => {
            setIsDarkTheme((prev) => {
              const newState = !prev;
              localStorage.setItem(IS_LIGHT_THEME, `${prev}`);
              return newState;
            });
            document.body.classList.toggle("dark-theme");
          }}
          isDarkTheme={isDarkTheme}
        >
          <Switch
            onChange={() => {
              setIsDarkTheme((prev) => {
                const newState = !prev;
                localStorage.setItem(IS_LIGHT_THEME, `${prev}`);
                return newState;
              });
              document.body.classList.toggle("dark-theme");
            }}
            checked={!isDarkTheme}
            uncheckedIcon={false}
            checkedIcon={false}
            width={33}
            height={20}
            handleDiameter={15}
            className={"switch"}
            offColor={"#0F1A44"}
            onColor={"#375BD2"}
            onHandleColor={!isDarkTheme ? "#FFFFFF80" : "##FFFFFF"}
          />
        </SwitchThemeButton>
      </div>
    );
  }

  const accountUrl = getAccountUrl(chainId, account);

  return (
    <div className="App-header-user">
      <HeaderLink
        className="default-btn"
        to="/buy_oap"
        redirectPopupTimestamp={redirectPopupTimestamp}
        showRedirectModal={showRedirectModal}
      >
        <FontAwesomeIcon icon={faCoins} />
        {onlyIcon ? null : (
          <div style={{ marginLeft: 8, fontWeight: 700 }}>
            <Trans>Buy OAP</Trans>
          </div>
        )}
      </HeaderLink>
      <div className="App-header-trade-link">
        <HeaderLink
          className="default-btn btn-trade"
          to="/trade"
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          <FontAwesomeIcon icon={faMoneyBillTransfer} />
          {onlyIcon ? null : (
            <div style={{ marginLeft: 8, fontWeight: 700 }}>
              <Trans>Trade</Trans>
            </div>
          )}
        </HeaderLink>
      </div>

      {showConnectionOptions ? (
        <>
          <div className="App-header-user-address">
            <div className="connect-wallet">
              <AddressDropdown
                account={account}
                accountUrl={accountUrl}
                disconnectAccountAndCloseSettings={disconnectAccountAndCloseSettings}
              />
              <div className="connect-wallet-divider" />
              <NetworkDropdown
                small={small}
                networkOptions={networkOptions}
                selectorLabel={selectorLabel}
                onNetworkSelect={onNetworkSelect}
                openSettings={openSettings}
              />
            </div>
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
      <SwitchThemeButton
        small={onlyIcon}
        onClick={() => {
          setIsDarkTheme((prev) => {
            const newState = !prev;
            localStorage.setItem(IS_LIGHT_THEME, `${prev}`);
            return newState;
          });
          document.body.classList.toggle("dark-theme");
        }}
        isDarkTheme={isDarkTheme}
      >
        <Switch
          onChange={() => {
            setIsDarkTheme((prev) => {
              const newState = !prev;
              localStorage.setItem(IS_LIGHT_THEME, `${prev}`);
              return newState;
            });
            document.body.classList.toggle("dark-theme");
          }}
          checked={!isDarkTheme}
          uncheckedIcon={false}
          checkedIcon={false}
          width={33}
          height={22}
          handleDiameter={15}
          className={"switch"}
          offColor={"#0F1A44"}
          onColor={"#375BD2"}
          onHandleColor={!isDarkTheme ? "#FFFFFF80" : "##FFFFFF"}
        />
      </SwitchThemeButton>
    </div>
  );
}
