import { faCheck, faEarthAsia, faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu } from "@headlessui/react";
import { t, Trans } from "@lingui/macro";
import cx from "classnames";
import { ARBITRUM, CHAIN_NAMES_MAP, HARMONY } from "config/chains";
import { LANGUAGE_LOCALSTORAGE_KEY } from "config/localStorage";
import bnbIcon from "img/ic_binance_logo.svg";
import harmonyIcon from "img/harmony.jpeg";
import arbitrumcon from "img/arbitrum.png";
import { useChainId } from "lib/chains";
import { defaultLocale, dynamicActivate, isTestLanguage, locales } from "lib/i18n";
import { importImage } from "lib/legacy";
import { useRef, useState } from "react";
import ModalWithPortal from "../Modal/ModalWithPortal";
import "./NetworkDropdown.css";

const LANGUAGE_MODAL_KEY = "LANGUAGE";
const NETWORK_MODAL_KEY = "NETWORK";

export default function NetworkDropdown(props) {
  const currentLanguage = useRef(localStorage.getItem(LANGUAGE_LOCALSTORAGE_KEY) || defaultLocale);
  const [activeModal, setActiveModal] = useState(null);

  function getModalContent(modalName) {
    switch (modalName) {
      case LANGUAGE_MODAL_KEY:
        return <LanguageModalContent currentLanguage={currentLanguage} />;
      case NETWORK_MODAL_KEY:
        return (
          <NetworkModalContent
            setActiveModal={setActiveModal}
            networkOptions={props.networkOptions}
            onNetworkSelect={props.onNetworkSelect}
            selectorLabel={props.selectorLabel}
            openSettings={props.openSettings}
          />
        );
      default:
        return;
    }
  }

  function getModalProps(modalName) {
    switch (modalName) {
      case LANGUAGE_MODAL_KEY:
        return {
          className: "language-popup",
          isVisible: activeModal === LANGUAGE_MODAL_KEY,
          setIsVisible: () => setActiveModal(null),
          label: t`Select Language`,
        };
      case NETWORK_MODAL_KEY:
        return {
          className: "network-popup",
          isVisible: activeModal === NETWORK_MODAL_KEY,
          setIsVisible: () => setActiveModal(null),
          label: t`Networks and Settings`,
        };
      default:
        return {};
    }
  }

  return (
    <>
      {props.small ? (
        <div className="App-header-network" onClick={() => setActiveModal(NETWORK_MODAL_KEY)}>
          <div className="network-dropdown">
            <NavIcons selectorLabel={props.selectorLabel} />
          </div>
        </div>
      ) : (
        <DesktopDropdown
          currentLanguage={currentLanguage}
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          {...props}
        />
      )}
      <ModalWithPortal {...getModalProps(activeModal)}>{getModalContent(activeModal)}</ModalWithPortal>
    </>
  );
}
function NavIcons({ selectorLabel }) {
  let icon = bnbIcon;
  switch (selectorLabel) {
    case CHAIN_NAMES_MAP[HARMONY]: {
      icon = harmonyIcon;
      break;
    }
    case CHAIN_NAMES_MAP[ARBITRUM]: {
      icon = arbitrumcon;
      break;
    }
    default: {
      break;
    }
  }
  return (
    <>
      <button className={cx("btn-primary small transparent")}>
        <img className="network-dropdown-icon" src={icon} alt={selectorLabel} />
      </button>
      <div className="network-dropdown-seperator" />
    </>
  );
}

function DesktopDropdown({ setActiveModal, selectorLabel, networkOptions, onNetworkSelect, openSettings }) {
  return (
    <div className="App-header-network">
      <Menu>
        <Menu.Button as="div" className="network-dropdown">
          <NavIcons selectorLabel={selectorLabel} />
        </Menu.Button>
        <Menu.Items as="div" className="menu-items network-dropdown-items">
          <div className="dropdown-label">
            <Trans>Networks</Trans>
          </div>
          <div className="network-dropdown-list">
            <NetworkMenuItems
              networkOptions={networkOptions}
              selectorLabel={selectorLabel}
              onNetworkSelect={onNetworkSelect}
            />
          </div>
          <div className="network-dropdown-divider" />
          <Menu.Item>
            <div className="network-dropdown-menu-item menu-item" onClick={openSettings}>
              <div className="menu-item-group">
                <div className="menu-item-icon">
                  <FontAwesomeIcon icon={faGear} fontSize={18} />
                </div>
                <span className="network-dropdown-item-label">
                  <Trans>Settings</Trans>
                </span>
              </div>
            </div>
          </Menu.Item>
          <Menu.Item>
            <div
              className="network-dropdown-menu-item menu-item last-dropdown-menu"
              onClick={() => setActiveModal(LANGUAGE_MODAL_KEY)}
            >
              <div className="menu-item-group">
                <div className="menu-item-icon">
                  <FontAwesomeIcon icon={faEarthAsia} fontSize={18} />
                </div>
                <span className="network-dropdown-item-label">
                  <Trans>Language</Trans>
                </span>
              </div>
            </div>
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </div>
  );
}

function NetworkMenuItems({ networkOptions, selectorLabel, onNetworkSelect }) {
  const { chainId } = useChainId();
  async function handleNetworkSelect(option) {
    await onNetworkSelect(option);
  }
  return networkOptions.map((network) => {
    const networkIcon = importImage(network.icon);
    const isActive = chainId === network.value;
    return (
      <Menu.Item key={network.value}>
        <div
          className="network-dropdown-menu-item menu-item"
          onClick={() => handleNetworkSelect({ value: network.value, isDevelopment: network.isDevelopment })}
        >
          <div className="menu-item-group">
            <div className="menu-item-icon">
              <img className="network-dropdown-icon" src={networkIcon} alt={network.label} />
            </div>
            <span className="network-dropdown-item-label">{network.label}</span>
          </div>
          {/* <div className="network-dropdown-menu-item-img">
            <div className={cx("active-dot", { [selectorLabel]: selectorLabel === network.label })} />
          </div> */}
          {isActive && (
            <div className="network-dropdown-menu-item-img">
              <FontAwesomeIcon icon={faCheck} />
            </div>
          )}
        </div>
      </Menu.Item>
    );
  });
}

function LanguageModalContent({ currentLanguage }) {
  return Object.keys(locales).map((item) => {
    // const image = !isTestLanguage(item) && importImage(`flag_${item}.svg`);
    return (
      <div
        key={item}
        className={cx("network-dropdown-menu-item  menu-item language-modal-item", {
          active: currentLanguage.current === item,
        })}
        onClick={() => {
          if (!isTestLanguage(item)) {
            localStorage.setItem(LANGUAGE_LOCALSTORAGE_KEY, item);
          }
          dynamicActivate(item);
        }}
      >
        <div className="menu-item-group">
          <div className="menu-item-icon">
            {/* {isTestLanguage(item) ? "🫐" : <img className="network-dropdown-icon" src={image} alt={locales[item]} />} */}
          </div>
          <span className="network-dropdown-item-label menu-item-label">{locales[item]}</span>
        </div>
        <div className="network-dropdown-menu-item-img">
          {currentLanguage.current === item && <FontAwesomeIcon icon={faCheck} fontSize={16} />}
        </div>
      </div>
    );
  });
}
function NetworkModalContent({ networkOptions, onNetworkSelect, selectorLabel, setActiveModal, openSettings }) {
  const { chainId } = useChainId();

  async function handleNetworkSelect(option) {
    setActiveModal(false);
    await onNetworkSelect(option);
  }

  return (
    <div className="network-dropdown-items">
      <div className="network-dropdown-list">
        <span className="network-dropdown-label">
          <Trans>Networks</Trans>
        </span>

        {networkOptions.map((network) => {
          const networkIcon = importImage(network.icon);
          const isActive = chainId === network.value;
          return (
            <div
              className="network-option"
              onClick={() => handleNetworkSelect({ value: network.value, isDevelopment: network.isDevelopment })}
              key={network.value}
            >
              <div className="menu-item-group">
                <img
                  src={networkIcon}
                  alt={network.label}
                  style={{ width: 24, height: 24, marginLeft: 4, borderRadius: 24 / 2 }}
                />
                <span>{network.label}</span>
              </div>
              {/* <div className={cx("active-dot", { [selectorLabel]: selectorLabel === network.label })} /> */}
              {isActive && (
                <div className="network-dropdown-menu-item-img">
                  <FontAwesomeIcon icon={faCheck} fontSize={16} style={{ marginRight: 8 }} />
                </div>
              )}
            </div>
          );
        })}
        <span className="network-dropdown-label more-options">
          <Trans>More Options</Trans>
        </span>
        <div
          className="network-option"
          onClick={() => {
            setActiveModal(LANGUAGE_MODAL_KEY);
          }}
        >
          <div className="menu-item-group">
            <div className="network-option-img">
              <FontAwesomeIcon icon={faEarthAsia} fontSize={18} style={{ marginLeft: 4 }} />
            </div>
            <span className="network-option-img-label">
              <Trans>Language</Trans>
            </span>
          </div>
        </div>
        <div
          className="network-option"
          onClick={() => {
            openSettings();
            setActiveModal(null);
          }}
        >
          <div className="menu-item-group">
            <div className="network-option-img">
              <FontAwesomeIcon icon={faGear} fontSize={18} style={{ marginLeft: 4 }} />
            </div>
            <span className="network-option-img-label">
              <Trans>Settings</Trans>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
