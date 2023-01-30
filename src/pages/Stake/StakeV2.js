import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Trans, t } from "@lingui/macro";
import { useWeb3React } from "@web3-react/core";

import Modal from "components/Modal/Modal";
import Checkbox from "components/Checkbox/Checkbox";
import Tooltip from "components/Tooltip/Tooltip";
import Footer from "components/Footer/Footer";

import Vault from "abis/Vault.json";
import ReaderV2 from "abis/ReaderV2.json";
import Vester from "abis/Vester.json";
import RewardRouter from "abis/RewardRouter.json";
import RewardReader from "abis/RewardReader.json";
import GlpManager from "abis/GlpManager.json";

import { ethers } from "ethers";
import {
  GLP_DECIMALS,
  USD_DECIMALS,
  PLACEHOLDER_ACCOUNT,
  getBalanceAndSupplyData,
  getDepositBalanceData,
  getVestingData,
  getStakingData,
  getProcessedData,
  getPageTitle,
} from "lib/legacy";
import { useGmxPrice, useTotalGmxStaked, useTotalGmxSupply } from "domain/legacy";
import { ARBITRUM, getChainName, getConstant, MAINNET } from "config/chains";

import useSWR from "swr";

import { getContract } from "config/contracts";

import "./StakeV2.css";
import SEO from "components/Common/SEO";
import StatsTooltipRow from "components/StatsTooltip/StatsTooltipRow";
import { getServerUrl } from "config/backend";
import { callContract, contractFetcher } from "lib/contracts";
import { useLocalStorageSerializeKey } from "lib/localStorage";
import { helperToast } from "lib/helperToast";
import { bigNumberify, expandDecimals, formatAmount, formatAmountFree, formatKeyAmount, parseValue } from "lib/numbers";
import { useChainId } from "lib/chains";
import UnstakeModal from "components/StakeV2/UnstakeModal";
import StakeModal from "components/StakeV2/StakeModal";
import OpenStaking from "components/StakeV2/OpenStaking";

const { AddressZero } = ethers.constants;

function VesterDepositModal(props) {
  const {
    isVisible,
    setIsVisible,
    chainId,
    title,
    maxAmount,
    value,
    setValue,
    balance,
    vestedAmount,
    averageStakedAmount,
    maxVestableAmount,
    library,
    stakeTokenLabel,
    reserveAmount,
    maxReserveAmount,
    vesterAddress,
    setPendingTxns,
  } = props;
  const [isDepositing, setIsDepositing] = useState(false);

  let amount = parseValue(value, 18);

  let nextReserveAmount = reserveAmount;

  let nextDepositAmount = vestedAmount;
  if (amount) {
    nextDepositAmount = vestedAmount.add(amount);
  }

  let additionalReserveAmount = bigNumberify(0);
  if (amount && averageStakedAmount && maxVestableAmount && maxVestableAmount.gt(0)) {
    nextReserveAmount = nextDepositAmount.mul(averageStakedAmount).div(maxVestableAmount);
    if (nextReserveAmount.gt(reserveAmount)) {
      additionalReserveAmount = nextReserveAmount.sub(reserveAmount);
    }
  }

  const getError = () => {
    if (!amount || amount.eq(0)) {
      return t`Enter an amount`;
    }
    if (maxAmount && amount.gt(maxAmount)) {
      return t`Max amount exceeded`;
    }
    if (nextReserveAmount.gt(maxReserveAmount)) {
      return t`Insufficient staked tokens`;
    }
  };

  const onClickPrimary = () => {
    setIsDepositing(true);
    const contract = new ethers.Contract(vesterAddress, Vester.abi, library.getSigner());

    callContract(chainId, contract, "deposit", [amount], {
      sentMsg: t`Deposit submitted!`,
      failMsg: t`Deposit failed!`,
      successMsg: t`Deposited!`,
      setPendingTxns,
    })
      .then(async (res) => {
        setIsVisible(false);
      })
      .finally(() => {
        setIsDepositing(false);
      });
  };

  const isPrimaryEnabled = () => {
    const error = getError();
    if (error) {
      return false;
    }
    if (isDepositing) {
      return false;
    }
    return true;
  };

  const getPrimaryText = () => {
    const error = getError();
    if (error) {
      return error;
    }
    if (isDepositing) {
      return t`Depositing...`;
    }
    return t`Deposit`;
  };

  return (
    <SEO title={getPageTitle("Earn")}>
      <div className="StakeModal">
        <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={title} className="non-scrollable">
          <div className="Exchange-swap-section">
            <div className="Exchange-swap-section-top">
              <div className="muted">
                <div className="Exchange-swap-usd">
                  <Trans>Deposit</Trans>
                </div>
              </div>
              <div
                className="muted align-right clickable"
                onClick={() => setValue(formatAmountFree(maxAmount, 18, 18))}
              >
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
              <div className="PositionEditor-token-symbol">esOPEN</div>
            </div>
          </div>
          <div className="VesterDepositModal-info-rows">
            <div className="Exchange-info-row">
              <div className="Exchange-info-label">
                <Trans>Wallet</Trans>
              </div>
              <div className="align-right">{formatAmount(balance, 18, 2, true)} esOPEN</div>
            </div>
            <div className="Exchange-info-row">
              <div className="Exchange-info-label">
                <Trans>Vault Capacity</Trans>
              </div>
              <div className="align-right">
                <Tooltip
                  handle={`${formatAmount(nextDepositAmount, 18, 2, true)} / ${formatAmount(
                    maxVestableAmount,
                    18,
                    2,
                    true
                  )}`}
                  position="right-bottom"
                  renderContent={() => {
                    return (
                      <div>
                        <p className="">
                          <Trans>Vault Capacity for your Account:</Trans>
                        </p>
                        <StatsTooltipRow
                          showDollar={false}
                          label={t`Deposited`}
                          value={`${formatAmount(vestedAmount, 18, 2, true)} esOPEN`}
                        />
                        <StatsTooltipRow
                          showDollar={false}
                          label={t`Max Capacity`}
                          value={`${formatAmount(maxVestableAmount, 18, 2, true)} esOPEN`}
                        />
                      </div>
                    );
                  }}
                />
              </div>
            </div>
            <div className="Exchange-info-row">
              <div className="Exchange-info-label">
                <Trans>Reserve Amount</Trans>
              </div>
              <div className="align-right">
                <Tooltip
                  handle={`${formatAmount(
                    reserveAmount && reserveAmount.gte(additionalReserveAmount)
                      ? reserveAmount
                      : additionalReserveAmount,
                    18,
                    2,
                    true
                  )} / ${formatAmount(maxReserveAmount, 18, 2, true)}`}
                  position="right-bottom"
                  renderContent={() => {
                    return (
                      <>
                        <StatsTooltipRow
                          label={t`Current Reserved`}
                          value={formatAmount(reserveAmount, 18, 2, true)}
                          showDollar={false}
                        />
                        <StatsTooltipRow
                          label={t`Additional reserve required`}
                          value={formatAmount(additionalReserveAmount, 18, 2, true)}
                          showDollar={false}
                        />
                        {amount && nextReserveAmount.gt(maxReserveAmount) && (
                          <>
                            <br />
                            <Trans>
                              You need a total of at least {formatAmount(nextReserveAmount, 18, 2, true)}{" "}
                              {stakeTokenLabel} to vest {formatAmount(amount, 18, 2, true)} esOPEN.
                            </Trans>
                          </>
                        )}
                      </>
                    );
                  }}
                />
              </div>
            </div>
          </div>
          <div className="Exchange-swap-button-container">
            <button className="App-cta Exchange-swap-button" onClick={onClickPrimary} disabled={!isPrimaryEnabled()}>
              {getPrimaryText()}
            </button>
          </div>
        </Modal>
      </div>
    </SEO>
  );
}

function VesterWithdrawModal(props) {
  const { isVisible, setIsVisible, chainId, title, library, vesterAddress, setPendingTxns } = props;
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const onClickPrimary = () => {
    setIsWithdrawing(true);
    const contract = new ethers.Contract(vesterAddress, Vester.abi, library.getSigner());

    callContract(chainId, contract, "withdraw", [], {
      sentMsg: t`Withdraw submitted.`,
      failMsg: t`Withdraw failed.`,
      successMsg: t`Withdrawn!`,
      setPendingTxns,
    })
      .then(async (res) => {
        setIsVisible(false);
      })
      .finally(() => {
        setIsWithdrawing(false);
      });
  };

  return (
    <div className="StakeModal">
      <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={title}>
        <Trans>
          <div>
            This will withdraw and unreserve all tokens as well as pause vesting.
            <br />
            <br />
            esOPEN tokens that have been converted to OPEN will remain as OPEN tokens.
            <br />
            <br />
            To claim OPEN tokens without withdrawing, use the "Claim" button under the Total Rewards section.
            <br />
            <br />
          </div>
        </Trans>
        <div className="Exchange-swap-button-container">
          <button className="App-cta Exchange-swap-button" onClick={onClickPrimary} disabled={isWithdrawing}>
            {!isWithdrawing && "Confirm Withdraw"}
            {isWithdrawing && "Confirming..."}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function ClaimModal(props) {
  const {
    isVisible,
    setIsVisible,
    rewardRouterAddress,
    library,
    chainId,
    setPendingTxns,
    nativeTokenSymbol,
    wrappedTokenSymbol,
  } = props;
  const [isClaiming, setIsClaiming] = useState(false);
  const [shouldClaimGmx, setShouldClaimGmx] = useLocalStorageSerializeKey(
    [chainId, "StakeV2-claim-should-claim-gmx"],
    false
  );
  const [shouldClaimEsGmx, setShouldClaimEsGmx] = useLocalStorageSerializeKey(
    [chainId, "StakeV2-claim-should-claim-es-gmx"],
    false
  );
  const [shouldClaimWeth, setShouldClaimWeth] = useLocalStorageSerializeKey(
    [chainId, "StakeV2-claim-should-claim-weth"],
    true
  );
  const [shouldConvertWeth, setShouldConvertWeth] = useLocalStorageSerializeKey(
    [chainId, "StakeV2-claim-should-convert-weth"],
    true
  );

  const isPrimaryEnabled = () => {
    return !isClaiming;
  };

  const getPrimaryText = () => {
    if (isClaiming) {
      return t`Claiming...`;
    }
    return t`Claim`;
  };

  const onClickPrimary = () => {
    setIsClaiming(true);
    const contract = new ethers.Contract(rewardRouterAddress, RewardRouter.abi, library.getSigner());
    callContract(
      chainId,
      contract,
      "handleRewards",
      [
        false,
        false, // shouldStakeGmx
        false,
        false, // shouldStakeEsGmx
        false, // shouldStakeMultiplierPoints
        shouldClaimWeth,
        shouldConvertWeth,
      ],
      {
        sentMsg: t`Claim submitted.`,
        failMsg: t`Claim failed.`,
        successMsg: t`Claim completed!`,
        setPendingTxns,
      }
    )
      .then(async (res) => {
        setIsVisible(false);
      })
      .finally(() => {
        setIsClaiming(false);
      });
  };

  const toggleConvertWeth = (value) => {
    if (value) {
      setShouldClaimWeth(true);
    }
    setShouldConvertWeth(value);
  };

  return (
    <div className="StakeModal">
      <Modal isVisible={isVisible} setIsVisible={setIsVisible} label={t`Claim Rewards`}>
        <div className="CompoundModal-menu">
          {/* <div>
            <Checkbox isChecked={shouldClaimGmx} setIsChecked={setShouldClaimGmx}>
              <Trans>Claim OPEN Rewards</Trans>
            </Checkbox>
          </div> */}
          {/* <div>
            <Checkbox isChecked={shouldClaimEsGmx} setIsChecked={setShouldClaimEsGmx}>
              <Trans>Claim esOPEN Rewards</Trans>
            </Checkbox>
          </div> */}
          <div>
            <Checkbox isChecked={shouldClaimWeth} setIsChecked={setShouldClaimWeth} disabled={shouldConvertWeth}>
              <Trans>Claim {wrappedTokenSymbol} Rewards</Trans>
            </Checkbox>
          </div>
          <div>
            <Checkbox isChecked={shouldConvertWeth} setIsChecked={toggleConvertWeth}>
              <Trans>
                Convert {wrappedTokenSymbol} to {nativeTokenSymbol}
              </Trans>
            </Checkbox>
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

export default function StakeV2({ setPendingTxns, connectWallet }) {
  const { active, library, account } = useWeb3React();
  const { chainId } = useChainId();

  const chainName = getChainName(chainId);

  const hasInsurance = false;

  const [isStakeModalVisible, setIsStakeModalVisible] = useState(false);
  const [stakeModalTitle, setStakeModalTitle] = useState("");
  const [stakeModalMaxAmount, setStakeModalMaxAmount] = useState(undefined);
  const [stakeValue, setStakeValue] = useState("");
  const [stakingTokenSymbol, setStakingTokenSymbol] = useState("");
  const [stakingTokenAddress, setStakingTokenAddress] = useState("");
  const [stakingFarmAddress, setStakingFarmAddress] = useState("");
  const [stakeMethodName, setStakeMethodName] = useState("");

  const [isUnstakeModalVisible, setIsUnstakeModalVisible] = useState(false);
  const [unstakeModalTitle, setUnstakeModalTitle] = useState("");
  const [unstakeModalMaxAmount, setUnstakeModalMaxAmount] = useState(undefined);
  const [unstakeModalReservedAmount, setUnstakeModalReservedAmount] = useState(undefined);
  const [unstakeValue, setUnstakeValue] = useState("");
  const [unstakingTokenSymbol, setUnstakingTokenSymbol] = useState("");
  const [unstakeMethodName, setUnstakeMethodName] = useState("");

  const [isVesterDepositModalVisible, setIsVesterDepositModalVisible] = useState(false);
  const [vesterDepositTitle, setVesterDepositTitle] = useState("");
  const [vesterDepositStakeTokenLabel, setVesterDepositStakeTokenLabel] = useState("");
  const [vesterDepositMaxAmount, setVesterDepositMaxAmount] = useState("");
  const [vesterDepositBalance, setVesterDepositBalance] = useState("");
  const [vesterDepositEscrowedBalance, setVesterDepositEscrowedBalance] = useState("");
  const [vesterDepositVestedAmount, setVesterDepositVestedAmount] = useState("");
  const [vesterDepositAverageStakedAmount, setVesterDepositAverageStakedAmount] = useState("");
  const [vesterDepositMaxVestableAmount, setVesterDepositMaxVestableAmount] = useState("");
  const [vesterDepositValue, setVesterDepositValue] = useState("");
  const [vesterDepositReserveAmount, setVesterDepositReserveAmount] = useState("");
  const [vesterDepositMaxReserveAmount, setVesterDepositMaxReserveAmount] = useState("");
  const [vesterDepositAddress, setVesterDepositAddress] = useState("");

  const [isVesterWithdrawModalVisible, setIsVesterWithdrawModalVisible] = useState(false);
  const [vesterWithdrawTitle, setVesterWithdrawTitle] = useState(false);
  const [vesterWithdrawAddress, setVesterWithdrawAddress] = useState("");

  const [isCompoundModalVisible, setIsCompoundModalVisible] = useState(false);
  const [isClaimModalVisible, setIsClaimModalVisible] = useState(false);

  const rewardRouterAddress = getContract(chainId, "RewardRouter");
  const oapRewardRouterAddress = getContract(chainId, "OapRewardRouter");
  const rewardReaderAddress = getContract(chainId, "RewardReader");
  const readerAddress = getContract(chainId, "Reader");

  const vaultAddress = getContract(chainId, "Vault");
  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN");
  const openAddress = getContract(chainId, "OPEN");
  const esGmxAddress = getContract(chainId, "ES_GMX");
  // const bnGmxAddress = getContract(chainId, "BN_GMX");
  const glpAddress = getContract(chainId, "OAP");
  // const stakedGmxTrackerAddress = getContract(chainId, "StakedGmxTracker");
  // const bonusGmxTrackerAddress = getContract(chainId, "BonusGmxTracker");
  // const feeGmxTrackerAddress = getContract(chainId, "FeeGmxTracker");

  const stakedGlpTrackerAddress = getContract(chainId, "StakedGlpTracker");
  const feeGlpTrackerAddress = getContract(chainId, "FeeGlpTracker");

  const glpManagerAddress = getContract(chainId, "GlpManager");

  // const stakedGmxDistributorAddress = getContract(chainId, "StakedGmxDistributor");
  const stakedGlpDistributorAddress = getContract(chainId, "StakedGlpDistributor");

  // const gmxVesterAddress = getContract(chainId, "GmxVester");
  const glpVesterAddress = getContract(chainId, "GlpVester");

  const vesterAddresses = [glpVesterAddress];

  const excludedEsGmxAccounts = [stakedGlpDistributorAddress];

  const nativeTokenSymbol = getConstant(chainId, "nativeTokenSymbol");
  const wrappedTokenSymbol = getConstant(chainId, "wrappedTokenSymbol");

  const walletTokens = [
    openAddress,
    esGmxAddress,
    glpAddress,
    // stakedGmxTrackerAddress
  ];

  const depositTokens = [
    // openAddress,
    // esGmxAddress,
    // stakedGmxTrackerAddress,
    // bonusGmxTrackerAddress,
    // bnGmxAddress,
    glpAddress,
  ];
  const rewardTrackersForDepositBalances = [
    // stakedGmxTrackerAddress,
    // stakedGmxTrackerAddress,
    // bonusGmxTrackerAddress,
    // feeGmxTrackerAddress,
    // feeGmxTrackerAddress,
    feeGlpTrackerAddress,
  ];
  const rewardTrackersForStakingInfo = [
    // stakedGmxTrackerAddress,
    // bonusGmxTrackerAddress,
    // feeGmxTrackerAddress,
    stakedGlpTrackerAddress,
    feeGlpTrackerAddress,
  ];

  const { data: walletBalances } = useSWR(
    [
      `StakeV2:walletBalances:${active}`,
      chainId,
      readerAddress,
      "getTokenBalancesWithSupplies",
      account || PLACEHOLDER_ACCOUNT,
    ],
    {
      fetcher: contractFetcher(library, ReaderV2, [walletTokens]),
    }
  );

  const { data: depositBalances } = useSWR(
    [
      `StakeV2:depositBalances:${active}`,
      chainId,
      rewardReaderAddress,
      "getDepositBalances",
      account || PLACEHOLDER_ACCOUNT,
    ],
    {
      fetcher: contractFetcher(library, RewardReader, [depositTokens, rewardTrackersForDepositBalances]),
    }
  );

  const { data: stakingInfo } = useSWR(
    [`StakeV2:stakingInfo:${active}`, chainId, rewardReaderAddress, "getStakingInfo", account || PLACEHOLDER_ACCOUNT],
    {
      fetcher: contractFetcher(library, RewardReader, [rewardTrackersForStakingInfo]),
    }
  );

  // const { data: stakedGmxSupply } = useSWR(
  //   [`StakeV2:stakedGmxSupply:${active}`, chainId, openAddress, "balanceOf", stakedGmxTrackerAddress],
  //   {
  //     fetcher: contractFetcher(library, Token),
  //   }
  // );

  const stakedGmxSupply = bigNumberify("0");

  const { data: aums } = useSWR([`StakeV2:getAums:${active}`, chainId, glpManagerAddress, "getAums"], {
    fetcher: contractFetcher(library, GlpManager),
  });

  const { data: nativeTokenPrice } = useSWR(
    [`StakeV2:nativeTokenPrice:${active}`, chainId, vaultAddress, "getMinPrice", nativeTokenAddress],
    {
      fetcher: contractFetcher(library, Vault),
    }
  );

  const { data: esGmxSupply } = useSWR(
    [`StakeV2:esGmxSupply:${active}`, chainId, readerAddress, "getTokenSupply", esGmxAddress],
    {
      fetcher: contractFetcher(library, ReaderV2, [excludedEsGmxAccounts]),
    }
  );

  // const { data: vestingInfo } = useSWR(
  //   [`StakeV2:vestingInfo:${active}`, chainId, readerAddress, "getVestingInfo", account || PLACEHOLDER_ACCOUNT],
  //   {
  //     fetcher: contractFetcher(library, ReaderV2, [vesterAddresses]),
  //   }
  // );

  const { gmxPrice } = useGmxPrice(chainId, { arbitrum: chainId === ARBITRUM ? library : undefined }, active);

  let { total: totalGmxSupply } = useTotalGmxSupply();

  let { avax: avaxGmxStaked, arbitrum: arbitrumGmxStaked, total: totalGmxStaked } = useTotalGmxStaked();

  const gmxSupplyUrl = getServerUrl(chainId, "/open_supply");
  const { data: openSupply } = useSWR([gmxSupplyUrl], {
    fetcher: (...args) => fetch(...args).then((res) => res.json()),
  });

  const isGmxTransferEnabled = true;

  let esGmxSupplyUsd;
  if (esGmxSupply && gmxPrice) {
    esGmxSupplyUsd = esGmxSupply.mul(gmxPrice).div(expandDecimals(1, 18));
  }

  let aum;
  if (aums && aums.length > 0) {
    aum = aums[0].add(aums[1]).div(2);
  }

  const { balanceData, supplyData } = getBalanceAndSupplyData(walletBalances);
  const depositBalanceData = getDepositBalanceData(depositBalances);
  const stakingData = getStakingData(stakingInfo);
  // const vestingData = getVestingData(vestingInfo);

  const processedData = getProcessedData(
    balanceData,
    supplyData,
    depositBalanceData,
    stakingData,
    {},
    aum,
    nativeTokenPrice,
    stakedGmxSupply,
    gmxPrice,
    openSupply?.supply
  );

  let hasMultiplierPoints = false;
  let multiplierPointsAmount;
  if (processedData && processedData.bonusGmxTrackerRewards && processedData.bnGmxInFeeGmx) {
    multiplierPointsAmount = processedData.bonusGmxTrackerRewards.add(processedData.bnGmxInFeeGmx);
    if (multiplierPointsAmount.gt(0)) {
      hasMultiplierPoints = true;
    }
  }
  let totalRewardTokens;
  if (processedData && processedData.bnGmxInFeeGmx && processedData.bonusGmxInFeeGmx) {
    totalRewardTokens = processedData.bnGmxInFeeGmx.add(processedData.bonusGmxInFeeGmx);
  }

  let totalRewardTokensAndGlp;
  if (totalRewardTokens && processedData && processedData.glpBalance) {
    totalRewardTokensAndGlp = totalRewardTokens.add(processedData.glpBalance);
  }

  const bonusGmxInFeeGmx = processedData ? processedData.bonusGmxInFeeGmx : undefined;

  let stakedGmxSupplyUsd;
  if (!totalGmxStaked.isZero() && gmxPrice) {
    stakedGmxSupplyUsd = totalGmxStaked.mul(gmxPrice).div(expandDecimals(1, 18));
  }

  let totalSupplyUsd;
  if (totalGmxSupply && !totalGmxSupply.isZero() && gmxPrice) {
    totalSupplyUsd = totalGmxSupply.mul(gmxPrice).div(expandDecimals(1, 18));
  }

  let maxUnstakeableGmx = bigNumberify(0);
  // if (
  //   totalRewardTokens &&
  //   vestingData &&
  //   vestingData.gmxVesterPairAmount &&
  //   multiplierPointsAmount &&
  //   processedData.bonusGmxInFeeGmx
  // ) {
  //   const availableTokens = totalRewardTokens.sub(vestingData.gmxVesterPairAmount);
  //   const stakedTokens = processedData.bonusGmxInFeeGmx;
  //   const divisor = multiplierPointsAmount.add(stakedTokens);
  //   if (divisor.gt(0)) {
  //     maxUnstakeableGmx = availableTokens.mul(stakedTokens).div(divisor);
  //   }
  // }

  const showStakeOpenModal = () => {
    if (!isGmxTransferEnabled) {
      helperToast.error(t`OPEN transfers not yet enabled`);
      return;
    }

    setIsStakeModalVisible(true);
    setStakeModalTitle(t`Stake OPEN`);
    setStakeModalMaxAmount(processedData.gmxBalance);
    setStakeValue("");
    setStakingTokenSymbol("OPEN");
    setStakingTokenAddress(openAddress);
    // setStakingFarmAddress(stakedGmxTrackerAddress);
    setStakeMethodName("stakeGmx");
  };

  const showStakeEsGmxModal = () => {
    setIsStakeModalVisible(true);
    setStakeModalTitle(t`Stake esOPEN`);
    setStakeModalMaxAmount(processedData.esGmxBalance);
    setStakeValue("");
    setStakingTokenSymbol("esOPEN");
    setStakingTokenAddress(esGmxAddress);
    setStakingFarmAddress(AddressZero);
    setStakeMethodName("stakeEsGmx");
  };

  // const showGmxVesterDepositModal = () => {
  //   let remainingVestableAmount = vestingData.gmxVester.maxVestableAmount.sub(vestingData.gmxVester.vestedAmount);
  //   if (processedData.esGmxBalance.lt(remainingVestableAmount)) {
  //     remainingVestableAmount = processedData.esGmxBalance;
  //   }

  //   setIsVesterDepositModalVisible(true);
  //   setVesterDepositTitle(t`OPEN Vault`);
  //   setVesterDepositStakeTokenLabel("staked OPEN + esOPEN + Multiplier Points");
  //   setVesterDepositMaxAmount(remainingVestableAmount);
  //   setVesterDepositBalance(processedData.esGmxBalance);
  //   setVesterDepositEscrowedBalance(vestingData.gmxVester.escrowedBalance);
  //   setVesterDepositVestedAmount(vestingData.gmxVester.vestedAmount);
  //   setVesterDepositMaxVestableAmount(vestingData.gmxVester.maxVestableAmount);
  //   setVesterDepositAverageStakedAmount(vestingData.gmxVester.averageStakedAmount);
  //   setVesterDepositReserveAmount(vestingData.gmxVester.pairAmount);
  //   setVesterDepositMaxReserveAmount(totalRewardTokens);
  //   setVesterDepositValue("");
  //   // setVesterDepositAddress(gmxVesterAddress);
  // };

  // const showGlpVesterDepositModal = () => {
  //   let remainingVestableAmount = vestingData.glpVester.maxVestableAmount.sub(vestingData.glpVester.vestedAmount);
  //   if (processedData.esGmxBalance.lt(remainingVestableAmount)) {
  //     remainingVestableAmount = processedData.esGmxBalance;
  //   }

  //   setIsVesterDepositModalVisible(true);
  //   setVesterDepositTitle(t`OAP Vault`);
  //   setVesterDepositStakeTokenLabel("staked OAP");
  //   setVesterDepositMaxAmount(remainingVestableAmount);
  //   setVesterDepositBalance(processedData.esGmxBalance);
  //   setVesterDepositEscrowedBalance(vestingData.glpVester.escrowedBalance);
  //   setVesterDepositVestedAmount(vestingData.glpVester.vestedAmount);
  //   setVesterDepositMaxVestableAmount(vestingData.glpVester.maxVestableAmount);
  //   setVesterDepositAverageStakedAmount(vestingData.glpVester.averageStakedAmount);
  //   setVesterDepositReserveAmount(vestingData.glpVester.pairAmount);
  //   setVesterDepositMaxReserveAmount(processedData.glpBalance);
  //   setVesterDepositValue("");
  //   setVesterDepositAddress(glpVesterAddress);
  // };

  // const showGmxVesterWithdrawModal = () => {
  //   if (!vestingData || !vestingData.gmxVesterVestedAmount || vestingData.gmxVesterVestedAmount.eq(0)) {
  //     helperToast.error(t`You have not deposited any tokens for vesting.`);
  //     return;
  //   }

  //   setIsVesterWithdrawModalVisible(true);
  //   setVesterWithdrawTitle(t`Withdraw from OPEN Vault`);
  //   // setVesterWithdrawAddress(gmxVesterAddress);
  // };

  // const showGlpVesterWithdrawModal = () => {
  //   if (!vestingData || !vestingData.glpVesterVestedAmount || vestingData.glpVesterVestedAmount.eq(0)) {
  //     helperToast.error(t`You have not deposited any tokens for vesting.`);
  //     return;
  //   }

  //   setIsVesterWithdrawModalVisible(true);
  //   setVesterWithdrawTitle(t`Withdraw from OAP Vault`);
  //   setVesterWithdrawAddress(glpVesterAddress);
  // };

  const showUnstakeOpenModal = () => {
    if (!isGmxTransferEnabled) {
      helperToast.error(t`OPEN transfers not yet enabled`);
      return;
    }
    setIsUnstakeModalVisible(true);
    setUnstakeModalTitle(t`Unstake OPEN`);
    let maxAmount = processedData.gmxInStakedGmx;
    // if (
    //   processedData.gmxInStakedGmx &&
    //   vestingData &&
    //   vestingData.gmxVesterPairAmount.gt(0) &&
    //   maxUnstakeableGmx &&
    //   maxUnstakeableGmx.lt(processedData.gmxInStakedGmx)
    // ) {
    //   maxAmount = maxUnstakeableGmx;
    // }
    setUnstakeModalMaxAmount(maxAmount);
    // setUnstakeModalReservedAmount(vestingData.gmxVesterPairAmount);
    setUnstakeValue("");
    setUnstakingTokenSymbol("OPEN");
    setUnstakeMethodName("unstakeGmx");
  };

  // const showUnstakeEsGmxModal = () => {
  //   setIsUnstakeModalVisible(true);
  //   setUnstakeModalTitle(t`Unstake esOPEN`);
  //   let maxAmount = processedData.esGmxInStakedGmx;
  //   if (
  //     processedData.esGmxInStakedGmx &&
  //     vestingData &&
  //     vestingData.gmxVesterPairAmount.gt(0) &&
  //     maxUnstakeableGmx &&
  //     maxUnstakeableGmx.lt(processedData.esGmxInStakedGmx)
  //   ) {
  //     maxAmount = maxUnstakeableGmx;
  //   }
  //   setUnstakeModalMaxAmount(maxAmount);
  //   setUnstakeModalReservedAmount(vestingData.gmxVesterPairAmount);
  //   setUnstakeValue("");
  //   setUnstakingTokenSymbol("esOPEN");
  //   setUnstakeMethodName("unstakeEsGmx");
  // };

  const renderMultiplierPointsLabel = useCallback(() => {
    return t`Multiplier Points APR`;
  }, []);

  const renderMultiplierPointsValue = useCallback(() => {
    return (
      <Tooltip
        handle={`100.00%`}
        position="right-bottom"
        renderContent={() => {
          return (
            <Trans>
              Boost your rewards with Multiplier Points.&nbsp;
              <a href="https://wiki.openworld.vision/rewards#multiplier-points" rel="noreferrer" target="_blank">
                More info
              </a>
              .
            </Trans>
          );
        }}
      />
    );
  }, []);

  let earnMsg;
  if (totalRewardTokensAndGlp && totalRewardTokensAndGlp.gt(0)) {
    let gmxAmountStr;
    if (processedData.gmxInStakedGmx && processedData.gmxInStakedGmx.gt(0)) {
      gmxAmountStr = formatAmount(processedData.gmxInStakedGmx, 18, 2, true) + " OPEN";
    }
    let esGmxAmountStr;
    if (processedData.esGmxInStakedGmx && processedData.esGmxInStakedGmx.gt(0)) {
      esGmxAmountStr = formatAmount(processedData.esGmxInStakedGmx, 18, 2, true) + " esOPEN";
    }
    let mpAmountStr;
    if (processedData.bonusGmxInFeeGmx && processedData.bnGmxInFeeGmx.gt(0)) {
      mpAmountStr = formatAmount(processedData.bnGmxInFeeGmx, 18, 2, true) + " MP";
    }
    let glpStr;
    if (processedData.glpBalance && processedData.glpBalance.gt(0)) {
      glpStr = formatAmount(processedData.glpBalance, 18, 2, true) + " OAP";
    }
    const amountStr = [gmxAmountStr, esGmxAmountStr, mpAmountStr, glpStr].filter((s) => s).join(", ");
    earnMsg = (
      <div>
        <Trans>
          You are earning {nativeTokenSymbol} rewards with {formatAmount(totalRewardTokensAndGlp, 18, 2, true)} tokens.
          <br />
          Tokens: {amountStr}.
        </Trans>
      </div>
    );
  }

  return (
    <div className="default-container page-layout">
      <StakeModal
        isVisible={isStakeModalVisible}
        setIsVisible={setIsStakeModalVisible}
        chainId={chainId}
        title={stakeModalTitle}
        maxAmount={stakeModalMaxAmount}
        value={stakeValue}
        setValue={setStakeValue}
        active={active}
        account={account}
        library={library}
        stakingTokenSymbol={stakingTokenSymbol}
        stakingTokenAddress={stakingTokenAddress}
        farmAddress={stakingFarmAddress}
        rewardRouterAddress={rewardRouterAddress}
        stakeMethodName={stakeMethodName}
        hasMultiplierPoints={hasMultiplierPoints}
        setPendingTxns={setPendingTxns}
        nativeTokenSymbol={nativeTokenSymbol}
        wrappedTokenSymbol={wrappedTokenSymbol}
      />

      <UnstakeModal
        setPendingTxns={setPendingTxns}
        isVisible={isUnstakeModalVisible}
        setIsVisible={setIsUnstakeModalVisible}
        chainId={chainId}
        title={unstakeModalTitle}
        maxAmount={unstakeModalMaxAmount}
        reservedAmount={unstakeModalReservedAmount}
        value={unstakeValue}
        setValue={setUnstakeValue}
        library={library}
        unstakingTokenSymbol={unstakingTokenSymbol}
        rewardRouterAddress={rewardRouterAddress}
        unstakeMethodName={unstakeMethodName}
        multiplierPointsAmount={multiplierPointsAmount}
        bonusGmxInFeeGmx={bonusGmxInFeeGmx}
      />

      <VesterDepositModal
        isVisible={isVesterDepositModalVisible}
        setIsVisible={setIsVesterDepositModalVisible}
        chainId={chainId}
        title={vesterDepositTitle}
        stakeTokenLabel={vesterDepositStakeTokenLabel}
        maxAmount={vesterDepositMaxAmount}
        balance={vesterDepositBalance}
        escrowedBalance={vesterDepositEscrowedBalance}
        vestedAmount={vesterDepositVestedAmount}
        averageStakedAmount={vesterDepositAverageStakedAmount}
        maxVestableAmount={vesterDepositMaxVestableAmount}
        reserveAmount={vesterDepositReserveAmount}
        maxReserveAmount={vesterDepositMaxReserveAmount}
        value={vesterDepositValue}
        setValue={setVesterDepositValue}
        library={library}
        vesterAddress={vesterDepositAddress}
        setPendingTxns={setPendingTxns}
      />
      <VesterWithdrawModal
        isVisible={isVesterWithdrawModalVisible}
        setIsVisible={setIsVesterWithdrawModalVisible}
        vesterAddress={vesterWithdrawAddress}
        chainId={chainId}
        title={vesterWithdrawTitle}
        library={library}
        setPendingTxns={setPendingTxns}
      />
      {/* <CompoundModal
        active={active}
        account={account}
        setPendingTxns={setPendingTxns}
        isVisible={isCompoundModalVisible}
        setIsVisible={setIsCompoundModalVisible}
        rewardRouterAddress={rewardRouterAddress}
        totalVesterRewards={processedData.totalVesterRewards}
        wrappedTokenSymbol={wrappedTokenSymbol}
        nativeTokenSymbol={nativeTokenSymbol}
        library={library}
        chainId={chainId}
      /> */}
      <ClaimModal
        active={active}
        account={account}
        setPendingTxns={setPendingTxns}
        isVisible={isClaimModalVisible}
        setIsVisible={setIsClaimModalVisible}
        rewardRouterAddress={oapRewardRouterAddress}
        totalVesterRewards={processedData.totalVesterRewards}
        wrappedTokenSymbol={wrappedTokenSymbol}
        nativeTokenSymbol={nativeTokenSymbol}
        library={library}
        chainId={chainId}
      />
      <div className="section-title-block">
        <div className="section-title-icon"></div>
        <div className="section-title-content">
          <div className="Page-title">
            <Trans>Earn</Trans>
          </div>
          <div className="Page-description">
            <Trans>
              Stake{" "}
              <a href="https://wiki.openworld.vision/tokenomics" target="_blank" rel="noopener noreferrer">
                OAP
              </a>{" "}
              to earn rewards.
            </Trans>
          </div>
          {earnMsg && <div className="Page-description">{earnMsg}</div>}
        </div>
      </div>
      <div className="StakeV2-content">
        <div className="StakeV2-cards">
          <OpenStaking
            processedData={processedData}
            active
            onStaking={showStakeOpenModal}
            onUnstaking={showUnstakeOpenModal}
          />

          <div className="App-card primary StakeV2-gmx-card StakeV2-total-rewards-card">
            <div className="App-card-title">
              <Trans>Total Rewards</Trans>
            </div>
            <div className="App-card-divider no-margin" style={{ height: 0 }}></div>
            <div className="App-card-content">
              <div className="App-card-row">
                <div className="label">
                  {nativeTokenSymbol} ({wrappedTokenSymbol})
                </div>
                <div>
                  {formatKeyAmount(processedData, "totalNativeTokenRewards", 18, 4, true)} ($
                  {formatKeyAmount(processedData, "totalNativeTokenRewardsUsd", USD_DECIMALS, 2, true)})
                </div>
              </div>
              {/* <div className="App-card-row">
                <div className="label">OPEN</div>
                <div>
                  {formatKeyAmount(processedData, "totalVesterRewards", 18, 4, true)} ($
                  {formatKeyAmount(processedData, "totalVesterRewardsUsd", USD_DECIMALS, 2, true)})
                </div>
              </div> */}
              {/* <div className="App-card-row">
                <div className="label">
                  <Trans>Escrowed OPEN</Trans>
                </div>
                <div>
                  {formatKeyAmount(processedData, "totalEsGmxRewards", 18, 4, true)} ($
                  {formatKeyAmount(processedData, "totalEsGmxRewardsUsd", USD_DECIMALS, 2, true)})
                </div>
              </div> */}

              <div className="App-card-row">
                <div className="label">
                  <Trans>Total</Trans>
                </div>
                <div>${formatKeyAmount(processedData, "totalRewardsUsd", USD_DECIMALS, 2, true)}</div>
              </div>

              <div className="App-card-divider"></div>
              <div className="App-card-options">
                {/* {active && (
                    <button
                      className="App-button-option App-card-option"
                      onClick={() => setIsCompoundModalVisible(true)}
                    >
                      <Trans>Compound</Trans>
                    </button>
                  )} */}
                {active && (
                  <button className="App-button-option App-card-option" onClick={() => setIsClaimModalVisible(true)}>
                    <Trans>Claim</Trans>
                  </button>
                )}
                {!active && (
                  <button className="App-button-option App-card-option" onClick={() => connectWallet()}>
                    <Trans>Connect Wallet</Trans>
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="App-card StakeV2-gmx-card">
            <div className="App-card-title">OAP ({chainName})</div>
            <div className="App-card-content">
              {/* <div className="App-card-divider"></div> */}
              <div className="App-card-row">
                <div className="label">
                  <Trans>Price</Trans>
                </div>
                <div>${formatKeyAmount(processedData, "glpPrice", USD_DECIMALS, 3, true)}</div>
              </div>
              <div className="App-card-row">
                <div className="label">
                  <Trans>Wallet</Trans>
                </div>
                <div>
                  {formatKeyAmount(processedData, "glpBalance", GLP_DECIMALS, 2, true)} OAP ($
                  {formatKeyAmount(processedData, "glpBalanceUsd", USD_DECIMALS, 2, true)})
                </div>
              </div>
              <div className="App-card-row">
                <div className="label">
                  <Trans>Staked</Trans>
                </div>
                <div>
                  {formatKeyAmount(processedData, "glpBalance", GLP_DECIMALS, 2, true)} OAP ($
                  {formatKeyAmount(processedData, "glpBalanceUsd", USD_DECIMALS, 2, true)})
                </div>
              </div>
              <div className="App-card-divider"></div>
              <div className="App-card-row">
                <div className="label">
                  <Trans>APR</Trans>
                </div>
                <div>
                  <Tooltip
                    handle={`${formatKeyAmount(processedData, "glpAprTotal", 2, 2, true)}%`}
                    position="right-bottom"
                    renderContent={() => {
                      return (
                        <>
                          <StatsTooltipRow
                            label={`${nativeTokenSymbol} (${wrappedTokenSymbol}) APR`}
                            value={`${formatKeyAmount(processedData, "glpAprForNativeToken", 2, 2, true)}%`}
                            showDollar={false}
                          />
                          {/* <StatsTooltipRow
                            label="Escrowed OPEN APR"
                            value={`${formatKeyAmount(processedData, "glpAprForEsGmx", 2, 2, true)}%`}
                            showDollar={false}
                          /> */}
                          <br />

                          <Trans>
                            APRs are updated weekly on Monday and will depend on the fees collected for the week.
                          </Trans>
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
                <div>
                  <Tooltip
                    handle={`$${formatKeyAmount(processedData, "totalGlpRewardsUsd", USD_DECIMALS, 2, true)}`}
                    position="right-bottom"
                    renderContent={() => {
                      return (
                        <>
                          <StatsTooltipRow
                            label={`${nativeTokenSymbol} (${wrappedTokenSymbol})`}
                            value={`${formatKeyAmount(
                              processedData,
                              "feeGlpTrackerRewards",
                              18,
                              4
                            )} ($${formatKeyAmount(processedData, "feeGlpTrackerRewardsUsd", USD_DECIMALS, 2, true)})`}
                            showDollar={false}
                          />
                          {/* <StatsTooltipRow
                            label="Escrowed OPEN"
                            value={`${formatKeyAmount(
                              processedData,
                              "stakedGlpTrackerRewards",
                              18,
                              4
                            )} ($${formatKeyAmount(
                              processedData,
                              "stakedGlpTrackerRewardsUsd",
                              USD_DECIMALS,
                              2,
                              true
                            )})`}
                            showDollar={false}
                          /> */}
                        </>
                      );
                    }}
                  />
                </div>
              </div>
              <div className="App-card-divider"></div>
              <div className="App-card-row">
                <div className="label">
                  <Trans>Total Staked</Trans>
                </div>
                <div>
                  {formatKeyAmount(processedData, "glpSupply", 18, 2, true)} OAP ($
                  {formatKeyAmount(processedData, "glpSupplyUsd", USD_DECIMALS, 2, true)})
                </div>
              </div>
              <div className="App-card-row">
                <div className="label">
                  <Trans>Total Supply</Trans>
                </div>
                <div>
                  {formatKeyAmount(processedData, "glpSupply", 18, 2, true)} OAP ($
                  {formatKeyAmount(processedData, "glpSupplyUsd", USD_DECIMALS, 2, true)})
                </div>
              </div>
              <div className="App-card-divider"></div>
              <div className="App-card-options">
                <Link className="App-button-option App-card-option" to="/buy_oap">
                  <Trans>Buy OAP</Trans>
                </Link>
                <Link className="App-button-option App-card-option" to="/buy_oap#redeem">
                  <Trans>Sell OAP</Trans>
                </Link>
                {hasInsurance && (
                  <a
                    className="App-button-option App-card-option"
                    href="https://app.insurace.io/Insurance/Cart?id=124&referrer=545066382753150189457177837072918687520318754040"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Trans>Purchase Insurance</Trans>
                  </a>
                )}
              </div>
            </div>
          </div>
          {/* <div className="App-card StakeV2-gmx-card">
            <div className="App-card-title">
              <Trans>Escrowed OPEN</Trans>
            </div>
            <div className="App-card-content">
              <div className="App-card-row">
                <div className="label">
                  <Trans>Price</Trans>
                </div>
                <div>${formatAmount(gmxPrice, USD_DECIMALS, 2, true)}</div>
              </div>
              <div className="App-card-row">
                <div className="label">
                  <Trans>Wallet</Trans>
                </div>
                <div>
                  {formatKeyAmount(processedData, "esGmxBalance", 18, 2, true)} esOPEN ($
                  {formatKeyAmount(processedData, "esGmxBalanceUsd", USD_DECIMALS, 2, true)})
                </div>
              </div>
              <div className="App-card-row">
                <div className="label">
                  <Trans>Staked</Trans>
                </div>
                <div>
                  {formatKeyAmount(processedData, "esGmxInStakedGmx", 18, 2, true)} esOPEN ($
                  {formatKeyAmount(processedData, "esGmxInStakedGmxUsd", USD_DECIMALS, 2, true)})
                </div>
              </div>
              <div className="App-card-divider"></div>
              <div className="App-card-row">
                <div className="label">
                  <Trans>APR</Trans>
                </div>
                <div>
                  <div>
                    <Tooltip
                      handle={`${formatKeyAmount(processedData, "gmxAprTotalWithBoost", 2, 2, true)}%`}
                      position="right-bottom"
                      renderContent={() => {
                        return (
                          <>
                            <StatsTooltipRow
                              label={`${nativeTokenSymbol} (${wrappedTokenSymbol}) Base APR`}
                              value={`${formatKeyAmount(processedData, "gmxAprForNativeToken", 2, 2, true)}%`}
                              showDollar={false}
                            />
                            {processedData.bnGmxInFeeGmx && processedData.bnGmxInFeeGmx.gt(0) && (
                              <StatsTooltipRow
                                label={`${nativeTokenSymbol} (${wrappedTokenSymbol}) Boosted APR`}
                                value={`${formatKeyAmount(processedData, "gmxBoostAprForNativeToken", 2, 2, true)}%`}
                                showDollar={false}
                              />
                            )}
                            <StatsTooltipRow
                              label="Escrowed OPEN APR"
                              value={`${formatKeyAmount(processedData, "gmxAprForEsGmx", 2, 2, true)}%`}
                              showDollar={false}
                            />
                          </>
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="App-card-row">
                <div className="label">{renderMultiplierPointsLabel()}</div>
                <div>{renderMultiplierPointsValue()}</div>
              </div>
              <div className="App-card-divider"></div>
              <div className="App-card-row">
                <div className="label">
                  <Trans>Total Staked</Trans>
                </div>
                <div>
                  {formatKeyAmount(processedData, "stakedEsGmxSupply", 18, 0, true)} esOPEN ($
                  {formatKeyAmount(processedData, "stakedEsGmxSupplyUsd", USD_DECIMALS, 0, true)})
                </div>
              </div>
              <div className="App-card-row">
                <div className="label">
                  <Trans>Total Supply</Trans>
                </div>
                <div>
                  {formatAmount(esGmxSupply, 18, 0, true)} esOPEN ($
                  {formatAmount(esGmxSupplyUsd, USD_DECIMALS, 0, true)})
                </div>
              </div>
              <div className="App-card-divider"></div>
              <div className="App-card-options">
                {active && (
                  <button className="App-button-option App-card-option" onClick={() => showStakeEsGmxModal()}>
                    <Trans>Stake</Trans>
                  </button>
                )}
                {active && (
                  <button className="App-button-option App-card-option" onClick={() => showUnstakeEsGmxModal()}>
                    <Trans>Unstake</Trans>
                  </button>
                )}
                {!active && (
                  <button className="App-button-option App-card-option" onClick={() => connectWallet()}>
                    <Trans> Connect Wallet</Trans>
                  </button>
                )}
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <Footer />
    </div>
  );
}
