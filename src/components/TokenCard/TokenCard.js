import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { Trans } from "@lingui/macro";

import gmxBigIcon from "img/ic_gmx_custom.svg";
import logoGMX from "img/logo_GMX.svg";

import { isHomeSite } from "lib/legacy";

import { useWeb3React } from "@web3-react/core";

import APRLabel from "../APRLabel/APRLabel";
import { HeaderLink } from "../Header/HeaderLink";
import { ARBITRUM, AVALANCHE, TESTNET } from "config/chains";
import { switchNetwork } from "lib/wallets";
import { useChainId } from "lib/chains";
import ExternalLink from "components/ExternalLink/ExternalLink";
import logoOAP from "img/logo_oap.svg";
import logoOAPWhite from "img/logo_oap_white.svg";
import bgBuyOAP from "img/bg_buy_oap.svg";

export default function TokenCard({ showRedirectModal, redirectPopupTimestamp }) {
  const isHome = isHomeSite();
  const { chainId } = useChainId();
  const { active } = useWeb3React();

  // const changeNetwork = useCallback(
  //   (network) => {
  //     if (network === chainId) {
  //       return;
  //     }
  //     if (!active) {
  //       setTimeout(() => {
  //         return switchNetwork(network, active);
  //       }, 500);
  //     } else {
  //       return switchNetwork(network, active);
  //     }
  //   },
  //   [chainId, active]
  // );

  const BuyLink = ({ className, to, children, network }) => {
    if (isHome && showRedirectModal) {
      return (
        <HeaderLink
          to={to}
          className={className}
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          {children}
        </HeaderLink>
      );
    }

    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  };

  return (
    <div className="Home-token-card-options">
      <div className="Home-token-card-option">
        <div className="Home-token-card-option-background">
          <img src={bgBuyOAP} alt="buyOAPIcon" style={{ height: "100%" }} />
        </div>
        <div className="Home-token-card-option-icon">
          <img src={logoOAPWhite} alt="buyOAPIcon" style={{ width: 30, height: 30 }} /> OAP
        </div>
        <div className="Home-token-card-option-info">
          <div className="Home-token-card-option-title">
            <Trans>OAP is the liquidity provider token. Accrues 70% of the platform's generated fees.</Trans>
          </div>

          <div className="Home-token-card-option-action">
            <div className="buy">
              <BuyLink to="/buy_oap" className="default-btn" network={TESTNET}>
                <Trans>Buy on BSC</Trans>
              </BuyLink>
            </div>
            <a
              href="https://wiki.openworld.vision/tokenomics"
              target="_blank"
              rel="noreferrer"
              className="default-btn-light  read-more"
            >
              <Trans>Read more</Trans>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
