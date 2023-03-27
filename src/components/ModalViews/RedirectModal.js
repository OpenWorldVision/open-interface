import "./RedirectModal.css";
import Modal from "../Modal/Modal";
import Checkbox from "../Checkbox/Checkbox";
import { t, Trans } from "@lingui/macro";
import ExternalLink from "components/ExternalLink/ExternalLink";
import { getAppBaseUrl } from "lib/legacy";
import { NavLink } from "react-router-dom";

export function RedirectPopupModal({
  redirectModalVisible,
  setRedirectModalVisible,
  appRedirectUrl,
  setRedirectPopupTimestamp,
  setShouldHideRedirectModal,
  shouldHideRedirectModal,
  removeRedirectPopupTimestamp,
  selectedToPage,
  hideRedirectModal,
}) {
  const onClickAgree = () => {
    if (hideRedirectModal) {
      hideRedirectModal();
    }
    if (shouldHideRedirectModal) {
      setRedirectPopupTimestamp(Date.now());
    }
  };
  const baseUrl = getAppBaseUrl();

  return (
    <Modal
      className="RedirectModal"
      isVisible={redirectModalVisible}
      setIsVisible={setRedirectModalVisible}
      label={t`Launch App`}
    >
      <Trans>You are leaving OPEN.io and will be redirected to a third party, independent website.</Trans>
      <br />
      <br />
      <Trans>
        The website is a community deployed and maintained instance of the open source{" "}
        <ExternalLink href="https://github.com/OpenWorldVision/gmx-interface">OPEN front end</ExternalLink>, hosted and
        served on the distributed, peer-to-peer <ExternalLink href="https://ipfs.io/">IPFS network</ExternalLink>.
      </Trans>
      <br />
      <br />
      <Trans>
        Alternative links can be found in the{" "}
        <ExternalLink href="https://wiki.openworld.vision/app-links">docs</ExternalLink>.
        <br />
        <br />
        By clicking Agree you accept the <ExternalLink href={baseUrl + "/terms-and-conditions"}>
          T&Cs
        </ExternalLink> and <ExternalLink href={baseUrl + "/referral-terms"}>Referral T&Cs</ExternalLink>.
        <br />
        <br />
      </Trans>
      <div className="mb-sm">
        <Checkbox isChecked={shouldHideRedirectModal} setIsChecked={setShouldHideRedirectModal}>
          <Trans>Don't show this message again for 30 days.</Trans>
        </Checkbox>
      </div>
      <NavLink to={selectedToPage} className="App-cta Exchange-swap-button" onClick={() => onClickAgree()}>
        <Trans>Agree</Trans>
      </NavLink>
    </Modal>
  );
}
