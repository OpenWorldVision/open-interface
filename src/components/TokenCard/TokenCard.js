import { Trans } from "@lingui/macro";
import { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";

import { isHomeSite } from "lib/legacy";

import { useWeb3React } from "@web3-react/core";

import { TESTNET, getChainName, getDexListUrl } from "config/chains";
import bgBuyOAP from "img/bg_buy_oap.svg";
import bgBuyOPEN from "img/bg_buy_open.svg";
import { useChainId } from "lib/chains";
import { HeaderLink } from "../Header/HeaderLink";

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

  const renderButtonBuy = useCallback(() => {
    return getDexListUrl(chainId).map((item) => {
      return (
        <a href={item.url} target="_blank" rel="noreferrer" className="default-btn">
          {`Buy on ${item.title}`}
        </a>
      );
    });
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
            <div className="buy">{renderButtonBuy()}</div>
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
