import { t, Trans } from "@lingui/macro";
import Modal from "components/Modal/Modal";
import { BigNumber, ethers } from "ethers";
import { callContract, contractFetcher } from "lib/contracts";
import { formatAmount, formatAmountFree, parseValue } from "lib/numbers";
import { useState } from "react";
import useSWR from "swr";
import Token from "abis/Token.json";
import OpenStaking from "abis/OpenStaking.json";
import { approveTokens } from "domain/tokens";
import { getContract } from "config/contracts";

const { AddressZero } = ethers.constants;

function StakeModal(props) {
  const {
    isVisible,
    setIsVisible,
    chainId,
    title,
    maxAmount,
    value,
    setValue,
    active,
    account,
    library,
    stakingTokenSymbol,
    stakingTokenAddress,
    setPendingTxns,
  } = props;
  const openStakingAddress = getContract(chainId, "OpenStaking");
  const [isStaking, setIsStaking] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const { data: tokenAllowance } = useSWR<BigNumber>(
    active && stakingTokenAddress && [active, chainId, stakingTokenAddress, "allowance", account, openStakingAddress],
    {
      fetcher: contractFetcher(library, Token),
    }
  );

  let amount = parseValue(value, 18);
  const needApproval = openStakingAddress !== AddressZero && tokenAllowance && amount && amount.gt(tokenAllowance);

  const getError = () => {
    if (!amount || amount.eq(0)) {
      return t`Enter an amount`;
    }
    if (maxAmount && amount.gt(maxAmount)) {
      return t`Max amount exceeded`;
    }
  };

  const onClickPrimary = () => {
    if (needApproval) {
      // @ts-ignore
      approveTokens({
        setIsApproving,
        library,
        tokenAddress: stakingTokenAddress,
        spender: openStakingAddress,
        chainId,
      });
      return;
    }

    setIsStaking(true);
    const contract = new ethers.Contract(openStakingAddress, OpenStaking.abi, library.getSigner());

    callContract(chainId, contract, "submit", [AddressZero, amount], {
      sentMsg: t`Stake submitted!`,
      failMsg: t`Stake failed.`,
      setPendingTxns,
    })
      .then(async (res) => {
        setIsVisible(false);
      })
      .finally(() => {
        setIsStaking(false);
      });
  };

  const isPrimaryEnabled = () => {
    const error = getError();
    if (error) {
      return false;
    }
    if (isApproving) {
      return false;
    }
    if (isStaking) {
      return false;
    }
    return true;
  };

  const getPrimaryText = () => {
    const error = getError();
    if (error) {
      return error;
    }
    if (isApproving) {
      return t`Approving ${stakingTokenSymbol}...`;
    }
    if (needApproval) {
      return t`Approve ${stakingTokenSymbol}`;
    }
    if (isStaking) {
      return t`Staking...`;
    }
    return t`Stake`;
  };

  return (
    <div className="StakeModal">
      <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={title}>
        <div className="Exchange-swap-section">
          <div className="Exchange-swap-section-top">
            <div className="muted">
              <div className="Exchange-swap-usd">
                <Trans>Stake</Trans>
              </div>
            </div>
            <div className="muted align-right clickable" onClick={() => setValue(formatAmountFree(maxAmount, 18, 18))}>
              <Trans>Max: {formatAmount(maxAmount, 18, 4, true)}</Trans>
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
            <div className="PositionEditor-token-symbol">{stakingTokenSymbol}</div>
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

export default StakeModal;
