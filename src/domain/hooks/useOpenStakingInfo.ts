import { getContract } from "config/contracts";
import { contractFetcher } from "lib/contracts";
import useSWR from "swr";
import OpenStaking from "abis/OpenStaking.json";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "ethers";
import { useOpenPrice } from "./useOpenPrice";
import { expandDecimals } from "lib/numbers";
import { useMemo } from "react";

function useOpenStakingInfo(chainId: number) {
  const { library, account } = useWeb3React();
  const openStakingAddress = getContract(chainId, "OpenStaking");
  const { data: totalPooledOpen } = useSWR<BigNumber>(
    ["OpenStaking", chainId, openStakingAddress, "getTotalPooledEther"],
    {
      // @ts-ignore
      fetcher: contractFetcher(library, OpenStaking),
    }
  );

  const { data: totalShares } = useSWR<BigNumber>(["OpenStaking", chainId, openStakingAddress, "getTotalShares"], {
    // @ts-ignore
    fetcher: contractFetcher(library, OpenStaking),
  });

  const { data: myShares } = useSWR<BigNumber>(["OpenStaking", chainId, openStakingAddress, "sharesOf", account], {
    // @ts-ignore
    fetcher: contractFetcher(library, OpenStaking),
  });

  const { data: totalOpenStaked } = useSWR<BigNumber>(
    ["OpenStaking", chainId, openStakingAddress, "getStakedAmount", account],
    {
      // @ts-ignore
      fetcher: contractFetcher(library, OpenStaking),
    }
  );

  const { data: currentOpen } = useSWR<BigNumber>(["OpenStaking", chainId, openStakingAddress, "balanceOf", account], {
    // @ts-ignore
    fetcher: contractFetcher(library, OpenStaking),
  });
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

  return {
    totalPooledOpen: totalPooledOpen ? totalPooledOpen : BigNumber.from("0"),
    totalShares: totalShares ? totalShares : BigNumber.from("0"),
    totalPooledOpenInUsd,
    totalOpenStakedInUsd,
    myShares: myShares ? myShares : BigNumber.from("0"),
    totalStaked: totalOpenStaked ? totalOpenStaked : BigNumber.from("0"),
    currentOpen: currentOpen ? currentOpen : BigNumber.from("0"),
    currentOpenInUsd,
  };
}

export default useOpenStakingInfo;
