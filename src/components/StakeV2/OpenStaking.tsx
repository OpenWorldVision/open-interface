import { t, Trans } from "@lingui/macro";
import StatsTooltipRow from "components/StatsTooltip/StatsTooltipRow";
import Tooltip from "components/Tooltip/Tooltip";
import { MAINNET } from "config/chains";
import { useOpenPrice } from "domain/hooks/useOpenPrice";
import useOpenStakingInfo from "domain/hooks/useOpenStakingInfo";
import { BigNumber } from "ethers";
import { useChainId } from "lib/chains";
import { PRECISION, USD_DECIMALS } from "lib/legacy";
import { expandDecimals, formatAmount, formatKeyAmount } from "lib/numbers";
import { useMemo } from "react";
import Countdown from "react-countdown";
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
    timeleftToUnstake,
  } = useOpenStakingInfo(chainId);

  const apr = useMemo(() => {
    if (!totalPooledOpen || !totalShares || totalPooledOpen.eq("0") || totalShares.eq("0")) {
      return BigNumber.from("0");
    }
    const START_DATE = 1672963200;

    const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

    const now = Math.floor(new Date().getTime() / 1000);
    const diff = now - START_DATE;
    const tokensPerInterval = totalPooledOpen.div(BigNumber.from(diff));

    return tokensPerInterval.mul(WEEK_IN_SECONDS).mul(expandDecimals(1, 20)).div(totalShares);
  }, [totalPooledOpen, totalShares]);

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

  const unstakeCountdown = Date.now() + timeleftToUnstake * 1000;

  const buyURL = useMemo(() => {
    if (chainId === 56) {
      return "https://pancakeswap.finance/swap?outputCurrency=0x27a339d9B59b21390d7209b78a839868E319301B";
    }
    return "https://app.uniswap.org/#/swap?outputCurrency=0x58CB98A966F62aA6F2190eB3AA03132A0c3de3D5&inputCurrency=0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
  }, [chainId]);

  // Release in mainnet soon

  return (
    <div className="App-card StakeV2-gmx-card">
      <div className="App-card-title">OPEN</div>
      <div className="App-card-content">
        {/* <div className="App-card-divider"></div> */}
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
        <div className="App-card-row">
          <div className="label">
            <Trans>Your stOPEN</Trans>
          </div>
          <div className="value">{`${formatAmount(myShares, 18, 2, true)} stOPEN (${formatAmount(
            percentageOfShare,
            2,
            4,
            true
          )}%)`}</div>
        </div>

        <div className="App-card-divider"></div>
        <div className="App-card-row">
          <div className="label">
            <Trans>Staked OPEN</Trans>
          </div>
          <div className="value">
            {formatAmount(totalStaked, 18, 2, true)} OPEN ($
            {formatAmount(totalOpenStakedInUsd, 18, 2, true)})
          </div>
        </div>

        <div className="App-card-row">
          <div className="label">
            <Trans>Current OPEN</Trans>
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
              handle={`${formatAmount(apr, 18, 2, true)}%`}
              position="right-bottom"
              renderContent={() => {
                return (
                  <>
                    <div>
                      <Trans>
                        APRs are updated weekly on Monday and will depend on the fees collected for the week.
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
            <Trans>Total stOPEN</Trans>
          </div>
          <div className="value">
            {!totalShares && "..."}
            {totalShares && `${formatAmount(totalShares, 18, 0, true)} stOPEN`}
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
        {timeleftToUnstake !== 0 && (
          <>
            <div className="App-card-row">
              <div className="label">
                <Trans>Time to unstake</Trans>
              </div>
              <div className="value">
                <Countdown date={unstakeCountdown} />
              </div>
            </div>
            <div className="App-card-divider" />
          </>
        )}

        <div className="App-card-options">
          <a className="App-button-option App-card-option" href={buyURL} target="_blank" rel="noreferrer">
            <Trans>Buy OPEN</Trans>
          </a>
          {active && (
            <button className="App-button-option App-card-option" onClick={onStaking}>
              <Trans>Stake</Trans>
            </button>
          )}
          {active && (
            <button className="App-button-option App-card-option" onClick={onUnstaking} disabled={!!timeleftToUnstake}>
              <Trans>Unstake</Trans>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OpenStaking;
