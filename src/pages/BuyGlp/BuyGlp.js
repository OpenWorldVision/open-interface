import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import GlpSwap from "components/Glp/GlpSwap";
import Footer from "components/Footer/Footer";
import "./BuyGlp.css";

import { getNativeToken } from "config/tokens";
import { useChainId } from "lib/chains";
import icCoin from "img/ic_coin.svg";

export default function BuyGlp(props) {
  const { chainId } = useChainId();
  const history = useHistory();
  const [isBuying, setIsBuying] = useState(true);
  const nativeTokenSymbol = getNativeToken(chainId).symbol;

  useEffect(() => {
    const hash = history.location.hash.replace("#", "");
    const buying = hash === "redeem" ? false : true;
    setIsBuying(buying);
  }, [history.location.hash]);

  return (
    <div className="default-container page-layout">
      <div className="section-title-block">
        <div className="section-title-icon">
          <img src={icCoin} alt="icCoin" />
        </div>
        {/* <div className="section-title-content">
          <div className="Page-title">
            <Trans>Buy / Sell OAP</Trans>
          </div>
          <div className="Page-description">
            <Trans>
              Purchase{" "}
              <ExternalLink href="https://wiki.openworld.vision/buy-token-open-and-oap">OAP tokens</ExternalLink> to
              earn {nativeTokenSymbol} fees from swaps and leverages trading.
            </Trans>
            <br />
            <Trans>
              Note that there is a minimum holding time of 15 minutes after a purchase.
              <br />
              View <Link to="/earn">staking</Link> page.
            </Trans>
          </div>
        </div> */}
      </div>
      <GlpSwap {...props} isBuying={isBuying} setIsBuying={setIsBuying} />
      <Footer />
    </div>
  );
}
