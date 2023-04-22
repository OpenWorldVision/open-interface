import { useConnectWallet } from "@web3-onboard/react";
import { ARBITRUM, HARMONY, MAINNET, getStablyUrl } from "config/chains";
import React, { memo } from "react";
import "./StablyBuy.css";

const StablyBuy = memo((props) => {
  const { chainId } = props;

  const [{ wallet }] = useConnectWallet();

  const objParams = {
    asset: "USDS",
    filter: true,
    network: chainId === HARMONY ? "Harmony" : chainId === ARBITRUM ? "Arbitrum" : "Bnbbeaconchain",
    integrationID: "openworld-7779b4fe",
  };
  const address = wallet?.accounts?.[0]?.address;
  if (address) {
    objParams.address = address;
  }

  const params = new URLSearchParams(objParams).toString();

  const stablyUrl = getStablyUrl(chainId) + "?" + params;

  return (
    <div className="stably-custom">
      <iframe title="StablyBuy" src={stablyUrl} />
    </div>
  );
});

export default StablyBuy;
