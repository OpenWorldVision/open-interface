import { t, Trans } from "@lingui/macro";
import Modal from "components/Modal/Modal";
import { ethers } from "ethers";
import { callContract } from "lib/contracts";
import { formatAmount, formatAmountFree, parseValue } from "lib/numbers";
import React, { useState } from "react";
import useOpenStakingInfo from "domain/hooks/useOpenStakingInfo";
import OpenStaking from "abis/OpenStaking.json";
import { getContract } from "config/contracts";

function UnstakeModal(props) {
  const { isVisible, setIsVisible, chainId, title, value, setValue, library, unstakingTokenSymbol, setPendingTxns } =
    props;
  const { totalStaked } = useOpenStakingInfo(chainId);

  const openStakingAddress = getContract(chainId, "OpenStaking");
  const [isUnstaking, setIsUnstaking] = useState(false);

  let amount = parseValue(value, 18);

  const getError = () => {
    if (!amount) {
      return t`Enter an amount`;
    }
    if (amount.gt(totalStaked)) {
      return t`Max amount exceeded`;
    }
  };

  const onClickPrimary = () => {
    setIsUnstaking(true);
    const contract = new ethers.Contract(openStakingAddress, OpenStaking.abi, library.getSigner());
    callContract(chainId, contract, "unstake", [amount], {
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
  };

  const isPrimaryEnabled = () => {
    const error = getError();
    if (error) {
      return false;
    }
    if (isUnstaking) {
      return false;
    }
    return true;
  };

  const getPrimaryText = () => {
    const error = getError();
    if (error) {
      return error;
    }
    if (isUnstaking) {
      return t`Unstaking...`;
    }
    return t`Unstake`;
  };

  return (
    <div className="StakeModal">
      <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={title}>
        <div className="Exchange-swap-section">
          <div className="Exchange-swap-section-top">
            <div className="muted">
              <div className="Exchange-swap-usd">
                <Trans>Unstake</Trans>
              </div>
            </div>
            <div
              className="muted align-right clickable"
              onClick={() => setValue(formatAmountFree(totalStaked, 18, 18))}
            >
              <Trans>Max: {formatAmount(totalStaked, 18, 2, true)}</Trans>
            </div>
          </div>
          <div className="Exchange-swap-section-bottom">
            <div>
              <input
                type="number"
                placeholder="0.0"
                className="Exchange-swap-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div className="PositionEditor-token-symbol">{unstakingTokenSymbol}</div>
          </div>
        </div>

        <div className="Exchange-swap-button-container">
          <button className="App-cta Exchange-swap-button" onClick={onClickPrimary} disabled={!isPrimaryEnabled()}>
            {getPrimaryText()}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default UnstakeModal;
