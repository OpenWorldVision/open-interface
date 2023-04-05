import { useConnectWallet } from "@web3-onboard/react";
import React, { memo } from "react";
import { ethers } from "ethers";
import { Widget } from "@kyberswap/widgets";
import { getTokenBySymbol } from "config/tokens";
import "./KyberSwap.css";

const darkTheme = {
  text: "#FFFFFF",
  subText: "#A9A9A9",
  primary: "#1C1C1C",
  dialog: "#313131",
  secondary: "#0F0F0F",
  interactive: "#292929",
  stroke: "#505050",
  accent: "#657290",
  success: "#189470",
  warning: "#FF9901",
  error: "#FF537B",
  fontFamily: "Work Sans",
  borderRadius: "16px",
  buttonRadius: "999px",
  boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.04)",
};

const KyberSwap = memo((props) => {
  // @ts-ignore
  const { chainId } = props;

  const [{ wallet }] = useConnectWallet();

  let ethersProvider;

  if (wallet) {
    ethersProvider = new ethers.providers.Web3Provider(wallet.provider, "any");
  }

  return (
    <div className="kyber-custom">
      <Widget
        theme={darkTheme}
        tokenList={[]}
        provider={ethersProvider}
        defaultTokenOut={getTokenBySymbol(chainId, "BUSD").address}
        width={100}
        // @ts-ignore
        feeSetting={{
          chargeFeeBy: "currency_in",
          feeAmount: 500,
        }}
      />
    </div>
  );
});

export default KyberSwap;
