import React, { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Trans } from "@lingui/macro";

import gmxBigIcon from "img/ic_gmx_custom.svg";
import logoGMX from "img/logo_GMX.svg";

import { isHomeSite } from "lib/legacy";

import { useWeb3React } from "@web3-react/core";

import APRLabel from "../APRLabel/APRLabel";
import { HeaderLink } from "../Header/HeaderLink";
import { ARBITRUM, AVALANCHE, MAINNET, TESTNET, getChainName } from "config/chains";
import { switchNetwork } from "lib/wallets";
import { useChainId } from "lib/chains";
import bgBuyOAP from "img/bg_buy_oap.svg";
import bgBuyOPEN from "img/bg_buy_open.svg";

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

  const buyURL = useMemo(() => {
    if (chainId === 56) {
      return "https://pancakeswap.finance/swap?outputCurrency=0x27a339d9B59b21390d7209b78a839868E319301B";
    }
    return "https://app.uniswap.org/#/swap?outputCurrency=0x58CB98A966F62aA6F2190eB3AA03132A0c3de3D5&inputCurrency=0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
  }, [chainId]);

  return (
    <div className="Home-token-card-options">
      <div className="Home-token-card-option">
        <div className="Home-token-card-option-background">
          <img src={bgBuyOPEN} alt="buyOPENIcon" style={{ height: "100%" }} />
        </div>
        <div className="Home-token-card-option-icon">
          <img className="buy-open-icon" alt="buyOPENIcon" style={{ width: 30, height: 30 }} /> OPEN
        </div>
        <div className="Home-token-card-option-info">
          <div className="Home-token-card-option-title">
            <Trans>
              OPEN controls 30% of protocol fee and net fee inflow, represent governance interests of OpenWorld
              protocol.
            </Trans>
          </div>

          <div className="Home-token-card-option-action">
            <div className="buy">
              <a href={buyURL} target="_blank" rel="noreferrer" className="default-btn">
                Buy on {getChainName(chainId)}
              </a>
            </div>
            <a
              href="https://wiki.openworld.vision/buy-token-open-and-oap"
              target="_blank"
              rel="noreferrer"
              className="default-btn-light  read-more"
            >
              <Trans>Read more</Trans>
            </a>
          </div>
        </div>
      </div>

      <div className="Home-token-card-option">
        <div className="Home-token-card-option-background">
          <img src={bgBuyOAP} alt="buyOAPIcon" style={{ height: "100%" }} />
        </div>
        <div className="Home-token-card-option-icon">
          <img className="buy-oap-icon" alt="buyOAPIcon" style={{ width: 30, height: 30 }} /> OAP
        </div>
        <div className="Home-token-card-option-info">
          <div className="Home-token-card-option-title">
            <Trans>OAP is the liquidity provider token. Accrues 70% of the platform's generated fees.</Trans>
          </div>

          <div className="Home-token-card-option-action">
            <div className="buy">
              <BuyLink to="/buy_oap" className="default-btn" network={TESTNET}>
                Buy on {getChainName(chainId)}
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
