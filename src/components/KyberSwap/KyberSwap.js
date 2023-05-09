import { useConnectWallet } from "@web3-onboard/react";
import React, { memo } from "react";
import { ethers } from "ethers";
import { Widget } from "@kyberswap/widgets";
import { getTokenBySymbol } from "config/tokens";
import "./KyberSwap.css";
import { getContract } from "config/contracts";

const KyberSwap = memo((props) => {
  const { chainId } = props;

  const [{ wallet }] = useConnectWallet();
  const feeSwapAddress = getContract(chainId, "FeeSwap");

  let ethersProvider;

  if (wallet) {
    ethersProvider = new ethers.providers.Web3Provider(wallet.provider, "any");
  }

  return (
    <div className="kyber-custom">
      <Widget
        provider={ethersProvider}
        defaultTokenOut={getTokenBySymbol(chainId, "BUSD").address}
        feeSetting={{
          feeAmount: 100,
          isInBps: true,
          chargeFeeBy: "currency_in",
          feeReceiver: feeSwapAddress,
        }}
        client="openworld"
      />
    </div>
  );
});

export default KyberSwap;
