import { t, Trans } from "@lingui/macro";
import StatsTooltip from "components/StatsTooltip/StatsTooltip";
import StatsTooltipRow from "components/StatsTooltip/StatsTooltipRow";
import Tooltip from "components/Tooltip/Tooltip";
import { useOpenPrice } from "domain/hooks/useOpenPrice";
import useOpenStakingInfo from "domain/hooks/useOpenStakingInfo";
import { BigNumber } from "ethers";
import { USD_DECIMALS } from "lib/legacy";
import { expandDecimals, formatAmount, formatKeyAmount } from "lib/numbers";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
type Props = {
  gmxPrice: any;
  gmxPriceFromAvalanche: any;
  processedData: any;
  nativeTokenSymbol: string;
  active: boolean;
  totalGmxStaked: any;
  avaxGmxStaked: any;
  stakedGmxSupplyUsd: any;
  totalGmxSupply: any;
  arbitrumGmxStaked: any;
  totalSupplyUsd: any;
  wrappedTokenSymbol: string;
  onStaking: () => void;
  onUnstaking: () => void;
};
function OpenStaking(props: Props) {
  const {
    processedData,
    nativeTokenSymbol,
    active,
    totalGmxStaked,
    avaxGmxStaked,
    arbitrumGmxStaked,
    wrappedTokenSymbol,
    onStaking,
    onUnstaking,
  } = props;
  const { openPrice } = useOpenPrice(97, {}, active);
  const {
    totalPooledOpen,
    totalShares,
    totalPooledOpenInUsd,
    totalStaked,
    totalOpenStakedInUsd,
    myShares,
    currentOpen,
  } = useOpenStakingInfo(97);

  const openBalanceUsd = useMemo(() => {
    if (!openPrice || !processedData.gmxBalance) {
      return 0;
    }
    return openPrice.mul(processedData.gmxBalance).div(expandDecimals(1, 18));
  }, [openPrice, processedData.gmxBalance]);

  const percentageOfShare = useMemo(() => {
    if (totalShares.eq(BigNumber.from("0"))) {
      return 0;
    }

    return myShares.mul(10000).div(totalShares);
  }, [myShares, totalShares]);
  return (
    <div className="App-card StakeV2-gmx-card">
      <div className="App-card-title">OPEN</div>
      <div className="App-card-divider"></div>
      <div className="App-card-content">
        <div className="App-card-row">
          <div className="label">
            <Trans>Price</Trans>
          </div>
          <div>
            {!openPrice && "..."}
            {openPrice && (
              <Tooltip
                position="right-bottom"
                className="nowrap"
                handle={"$" + formatAmount(openPrice, 18, 4, true)}
                renderContent={() => (
                  <>
                    <StatsTooltipRow label={t`Price on BSC`} value={formatAmount(openPrice, 18, 4, true)} />
                  </>
                )}
              />
            )}
          </div>
        </div>
        <div className="App-card-row">
          <div className="label">
            <Trans>Wallet</Trans>
          </div>
          <div>
            {formatKeyAmount(processedData, "gmxBalance", 18, 2, true)} OPEN ($
            {formatAmount(openBalanceUsd, 18, 2, true)})
          </div>
        </div>
        <div className="App-card-row">
          <div className="label">
            <Trans>Staked</Trans>
          </div>
          <div>
            {formatAmount(totalStaked, 18, 2, true)} OPEN ($
            {formatAmount(totalOpenStakedInUsd, 18, 2, true)})
          </div>
        </div>

        <div className="App-card-row">
          <div className="label">
            <Trans>Shares</Trans>
          </div>
          <div>{formatAmount(myShares, 18, 2, true)} shares</div>
        </div>

        <div className="App-card-row">
          <div className="label">
            <Trans>% shares</Trans>
          </div>
          <div>{formatAmount(percentageOfShare, 2, 2, true)} %</div>
        </div>
        <div className="App-card-divider"></div>
        <div className="App-card-row">
          <div className="label">
            <Trans>APR</Trans>
          </div>
          <div>
            <Tooltip
              handle={`${formatKeyAmount(processedData, "gmxAprTotalWithBoost", 2, 2, true)}%`}
              position="right-bottom"
              renderContent={() => {
                return (
                  <>
                    <div>
                      <br />
                      <Trans>
                        APRs are updated weekly on Wednesday and will depend on the fees collected for the week.
                      </Trans>
                    </div>
                  </>
                );
              }}
            />
          </div>
        </div>
        <div className="App-card-row">
          <div className="label">
            <Trans>Rewards</Trans>
          </div>
          <div>{formatAmount(currentOpen.sub(totalStaked), 18, 2, true)}</div>
        </div>

        <div className="App-card-divider"></div>
        <div className="App-card-row">
          <div className="label">
            <Trans>Total Shares</Trans>
          </div>
          <div>
            {!totalShares && "..."}
            {totalShares && `${formatAmount(totalShares, 18, 0, true)} shares`}
          </div>
        </div>

        <div className="App-card-row">
          <div className="label">
            <Trans>Total Pooled OPEN</Trans>
          </div>
          <div>
            {!totalPooledOpen && "..."}
            {totalPooledOpen &&
              `${formatAmount(totalPooledOpen, 18, 0, true)} OPEN ($${formatAmount(
                totalPooledOpenInUsd,
                USD_DECIMALS,
                0,
                true
              )})`}
          </div>
        </div>
        <div className="App-card-divider" />
        <div className="App-card-options">
          <Link className="App-button-option App-card-option" to="/buy_open">
            <Trans>Buy OPEN</Trans>
          </Link>
          {active && (
            <button className="App-button-option App-card-option" onClick={onStaking}>
              <Trans>Stake</Trans>
            </button>
          )}
          {active && (
            <button className="App-button-option App-card-option" onClick={onUnstaking}>
              <Trans>Unstake</Trans>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OpenStaking;
