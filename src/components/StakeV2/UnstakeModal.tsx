import { t, Trans } from "@lingui/macro";
import Modal from "components/Modal/Modal";
import { BigNumber, ethers } from "ethers";
import { callContract } from "lib/contracts";
import { bigNumberify, formatAmount, formatAmountFree, parseValue } from "lib/numbers";
import React, { useCallback, useMemo, useState } from "react";
import useOpenStakingInfo from "domain/hooks/useOpenStakingInfo";
import OpenStaking from "abis/OpenStaking.json";
import { getContract } from "config/contracts";

function UnstakeModal(props) {
  const { isVisible, setIsVisible, chainId, title, library, setPendingTxns } = props;
  const { totalStaked, unstakingFee, currentOpen } = useOpenStakingInfo(chainId);

  const openStakingAddress = getContract(chainId, "OpenStaking");
  const [isUnstaking, setIsUnstaking] = useState(false);

  const handleUnstakeAll = useCallback(() => {
    setIsUnstaking(true);
    const contract = new ethers.Contract(openStakingAddress, OpenStaking.abi, library.getSigner());
    callContract(chainId, contract, "unstake", [], {
      sentMsg: t`Unstake submitted!`,
      failMsg: t`Unstake failed.`,
      successMsg: t`Unstake completed!`,
      setPendingTxns,
    })
      .then(async () => {
        setIsVisible(false);
      })
      .finally(() => {
        setIsUnstaking(false);
      });
  }, [chainId, library, openStakingAddress, setIsVisible, setPendingTxns]);

  const getPrimaryText = () => {
    if (isUnstaking) {
      return t`Unstaking...`;
    }
    return t`Unstake All`;
  };
  const totalReceive = useMemo(() => {
    if (!unstakingFee || !currentOpen) {
      return bigNumberify("0");
    }

    return currentOpen.sub(currentOpen.mul(unstakingFee).div(BigNumber.from("10000")));
  }, [currentOpen, unstakingFee]);

  return (
    <div className="StakeModal">
      <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={title}>
        <div className="Exchange-swap-section">
          <div className="App-card-row card-row-mt2">
            <div className="label">
              <Trans>Unstake</Trans>
            </div>
            <div className="value">
              {!totalStaked && "..."}
              {formatAmount(totalStaked, 18, 2, true)} OPEN
            </div>
          </div>
          <div className="App-card-row card-row-mt2">
            <div className="label">
              <Trans>Staking fee</Trans>
            </div>
            <div className="value">
              {!unstakingFee && "..."}
              {unstakingFee && `${formatAmount(unstakingFee, 2, 2, true)} %`}
            </div>
          </div>
          <div className="App-card-divider"></div>
          <div className="App-card-row card-row-mt2">
            <div className="label">
              <Trans>You'll receive </Trans>
            </div>
            <div className="value">
              {!totalReceive && "..."}
              {totalReceive && `${formatAmount(totalReceive, 18, 2, true)} OPEN`}
            </div>
          </div>
        </div>

        <div className="Exchange-swap-button-container">
          <button className="App-cta Exchange-swap-button" onClick={handleUnstakeAll}>
            {getPrimaryText()}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default UnstakeModal;
