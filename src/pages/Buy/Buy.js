import React from "react";
import { Trans } from "@lingui/macro";
import Footer from "components/Footer/Footer";
import "./Buy.css";
import TokenCard from "components/TokenCard/TokenCard";
import buyGMXIcon from "img/buy_gmx.svg";
import SEO from "components/Common/SEO";
import { getPageTitle } from "lib/legacy";
import icCoin from "img/ic_coin.svg";
import ExternalLink from "components/ExternalLink/ExternalLink";

export default function BuyGMXGLP() {
  return (
    <SEO title={getPageTitle("Buy OAP or OPEN")}>
      <div className="BuyGMXGLP page-layout">
        <div className="BuyGMXGLP-container default-container">
          <div className="section-title-block">
            <div className="section-title-icon">
              <img src={buyGMXIcon} alt="buyGMXIcon" />
            </div>
            <img className="Page-icon" src={icCoin} alt="icCoin" />
            <div className="section-title-content">
              <div className="Page-title">
                <Trans>Buy OPEN or OAP</Trans>
              </div>
              <div className="Page-description">
                <Trans>
                  Stake <ExternalLink href="https://wiki.openworld.vision/buy-token-open-and-oap">OAP</ExternalLink> to
                  earn rewards.
                </Trans>
              </div>
            </div>
          </div>
          <TokenCard />
        </div>
        <Footer />
      </div>
    </SEO>
  );
}
