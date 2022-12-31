import { t, Trans } from "@lingui/macro";
import StatsTooltipRow from "components/StatsTooltip/StatsTooltipRow";
import Tooltip from "components/Tooltip/Tooltip";
import { useOpenPrice } from "domain/hooks/useOpenPrice";
import useOpenStakingInfo from "domain/hooks/useOpenStakingInfo";
import { BigNumber } from "ethers";
import { useChainId } from "lib/chains";
import { PRECISION, USD_DECIMALS } from "lib/legacy";
import { expandDecimals, formatAmount, formatKeyAmount } from "lib/numbers";
import { useMemo } from "react";
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
  const { chainId } = useChainId();
  const { processedData, active, onStaking, onUnstaking } = props;
  const { openPrice } = useOpenPrice(chainId, {}, active);
  const {
    totalPooledOpen,
    totalShares,
    totalPooledOpenInUsd,
    totalStaked,
    totalOpenStakedInUsd,
    myShares,
    currentOpen,
    currentOpenInUsd,
  } = useOpenStakingInfo(chainId);

  const apr = useMemo(() => {
    if (!currentOpen || !totalStaked || currentOpen.eq("0") || totalStaked.eq("0")) {
      return BigNumber.from("0");
    }
    return currentOpen
      .mul(PRECISION)
      .div(totalStaked)
      .sub(PRECISION)
      .div(BigNumber.from("7"))
      .mul(BigNumber.from("100"));
  }, [currentOpen, totalStaked]);

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
          <div className="value">
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
          <div className="value">
            {formatKeyAmount(processedData, "gmxBalance", 18, 2, true)} OPEN ($
            {formatAmount(openBalanceUsd, 18, 2, true)})
          </div>
        </div>

        <div className="App-card-divider"></div>
        <div className="App-card-row">
          <div className="label">
            <Trans>Staked</Trans>
          </div>
          <div className="value">
            {formatAmount(totalStaked, 18, 2, true)} OPEN ($
            {formatAmount(totalOpenStakedInUsd, 18, 2, true)})
          </div>
        </div>

        <div className="App-card-row">
          <div className="label">
            <Trans>Shares</Trans>
          </div>
          <div className="value">{`${formatAmount(myShares, 18, 2, true)} shares (${formatAmount(
            percentageOfShare,
            2,
            4,
            true
          )}%)`}</div>
        </div>

        <div className="App-card-row">
          <div className="label">
            <Trans>Current</Trans>
          </div>
          <div className="value">
            {formatAmount(currentOpen, 18, 2, true)} OPEN ($
            {formatAmount(currentOpenInUsd, 18, 2, true)})
          </div>
        </div>
        <div className="App-card-row">
          <div className="label">
            <Trans>APR</Trans>
          </div>
          <div className="value" style={{ color: "#53BA95" }}>
            <Tooltip
              handle={`${formatAmount(apr, 30, 2, true)}%`}
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
        <div className="App-card-divider"></div>

        <div className="App-card-row">
          <div className="label">
            <Trans>Total Shares</Trans>
          </div>
          <div className="value">
            {!totalShares && "..."}
            {totalShares && `${formatAmount(totalShares, 18, 0, true)} shares`}
          </div>
        </div>

        <div className="App-card-row">
          <div className="label">
            <Trans>Total Pooled OPEN</Trans>
          </div>
          <div className="value">
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
          <a
            className="App-button-option App-card-option"
            href="https://pancakeswap.finance/swap?outputCurrency=0x27a339d9B59b21390d7209b78a839868E319301B"
            target="_blank"
            rel="noreferrer"
          >
            <Trans>Buy OPEN</Trans>
          </a>
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
