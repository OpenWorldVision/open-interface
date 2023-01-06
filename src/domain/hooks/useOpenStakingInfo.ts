import { getContract } from "config/contracts";
import { contractFetcher } from "lib/contracts";
import useSWR from "swr";
import OpenStaking from "abis/OpenStaking.json";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "ethers";
import { useOpenPrice } from "./useOpenPrice";
import { expandDecimals } from "lib/numbers";
import { useMemo } from "react";

const DEFAULT_VALUES = [
  BigNumber.from("0"),
  BigNumber.from("0"),
  BigNumber.from("0"),
  BigNumber.from("0"),
  BigNumber.from("0"),
  BigNumber.from("0"),
  BigNumber.from("0"),
  BigNumber.from("0"),
];

function useOpenStakingInfo(chainId: number) {
  const { library, account } = useWeb3React();
  const openStakingAddress = getContract(chainId, "OpenStaking");
  const { data: stakingInfo } = useSWR<BigNumber[]>(
    ["OpenStaking", chainId, openStakingAddress, "getStakeInfo", account],
    {
      // @ts-ignore
      fetcher: contractFetcher(library, OpenStaking),
    }
  );

  const [
    totalPooledOpen,
    totalShares,
    myShares,
    totalOpenStaked,
    currentOpen,
    lastStakeTimestamp,
    unstakingFee,
    unstakingThreshold,
  ] = stakingInfo ?? DEFAULT_VALUES;

  const { openPrice } = useOpenPrice(chainId, {}, true);

  const totalPooledOpenInUsd = useMemo(() => {
    if (!totalPooledOpen || !openPrice) {
      return BigNumber.from("0");
    }
    return openPrice.mul(totalPooledOpen).div(expandDecimals(1, 6));
  }, [openPrice, totalPooledOpen]);

  const totalOpenStakedInUsd = useMemo(() => {
    if (!totalOpenStaked || !openPrice) {
      return BigNumber.from("0");
    }
    return totalOpenStaked.mul(openPrice).div(expandDecimals(1, 18));
  }, [openPrice, totalOpenStaked]);

  const currentOpenInUsd = useMemo(() => {
    if (!currentOpen || !openPrice) {
      return BigNumber.from("0");
    }
    return currentOpen.mul(openPrice).div(expandDecimals(1, 18));
  }, [openPrice, currentOpen]);

  const timeleftToUnstake = useMemo(() => {
    if (!lastStakeTimestamp || !unstakingThreshold) {
      return 0;
    }
    const timeCanUnstake = lastStakeTimestamp.add(unstakingThreshold).toNumber();
    const now = Math.floor(new Date().getTime() / 1000);
    if (now >= timeCanUnstake) {
      return 0;
    }
    return timeCanUnstake - now;
  }, [lastStakeTimestamp, unstakingThreshold]);

  return {
    totalPooledOpen,
    totalShares,
    totalPooledOpenInUsd,
    totalOpenStakedInUsd,
    myShares,
    totalStaked: totalOpenStaked,
    currentOpen,
    currentOpenInUsd,
    unstakingFee,
    timeleftToUnstake,
  };
}

export default useOpenStakingInfo;
