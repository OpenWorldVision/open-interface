import "./AddressDropdown.css";
import { Menu } from "@headlessui/react";
import { Trans } from "@lingui/macro";
import { shortenAddress, useENS } from "lib/legacy";
import { useCopyToClipboard, createBreakpoint } from "react-use";
import externalLink from "img/ic_new_link_16.svg";
import copy from "img/ic_copy_16.svg";
import disconnect from "img/ic_sign_out_16.svg";
import { FaChevronDown } from "react-icons/fa";
import Davatar from "@davatar/react";
import { helperToast } from "lib/helperToast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faCopy, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

function AddressDropdown({ account, accountUrl, disconnectAccountAndCloseSettings }) {
  const useBreakpoint = createBreakpoint({ L: 600, M: 550, S: 400 });
  const breakpoint = useBreakpoint();
  const [, copyToClipboard] = useCopyToClipboard();
  const { ensName } = useENS(account);

  return (
    <Menu>
      <Menu.Button as="div">
        <button className="App-cta small transparent address-btn">
          <div className="user-avatar">
            <Davatar size={20} address={account} />
          </div>
          <span className="user-address">{ensName || shortenAddress(account, breakpoint === "S" ? 9 : 13)}</span>
          <FaChevronDown  color={'#f1f2f2'}/>
        </button>
      </Menu.Button>
      <div>
        <Menu.Items as="div" className="menu-items">
          <Menu.Item>
            <div
              className="menu-item"
              onClick={() => {
                copyToClipboard(account);
                helperToast.success("Address copied to your clipboard");
              }}
            >
              <FontAwesomeIcon icon={faCopy} />
              <p>
                <Trans>Copy Address</Trans>
              </p>
            </div>
          </Menu.Item>
          <Menu.Item>
            <a href={accountUrl} target="_blank" rel="noopener noreferrer" className="menu-item">
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
              <p>
                <Trans>View in Explorer</Trans>
              </p>
            </a>
          </Menu.Item>
          <Menu.Item>
            <div className="menu-item" onClick={disconnectAccountAndCloseSettings}>
              <FontAwesomeIcon icon={faRightFromBracket} />
              <p>
                <Trans>Disconnect</Trans>
              </p>
            </div>
          </Menu.Item>
        </Menu.Items>
      </div>
    </Menu>
  );
}

export default AddressDropdown;
