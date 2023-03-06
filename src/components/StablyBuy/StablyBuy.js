import { useConnectWallet } from "@web3-onboard/react";
import { getStablyUrl } from "config/chains";
import React, { memo } from "react";
import "./StablyBuy.css";

const StablyBuy = memo((props) => {
  const { chainId } = props;

  const [{ wallet }] = useConnectWallet();

  const objParams = {
    asset: "USDS",
    filter: true,
    network: "bnbchain",
  };
  const address = wallet?.accounts?.[0]?.address;
  if (address) {
    objParams.address = address;
  }

  const params = new URLSearchParams(objParams).toString();

  const stablyUrl = getStablyUrl(chainId) + "?" + params;

  return <iframe className="stably-custom" title="StablyBuy" src={stablyUrl} />;
});

export default StablyBuy;
