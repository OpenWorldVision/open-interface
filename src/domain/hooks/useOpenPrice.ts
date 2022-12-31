import { ARBITRUM, MAINNET } from "config/chains";
import { getContract } from "config/contracts";
import { contractFetcher } from "lib/contracts/contractFetcher";
import { bigNumberify } from "lib/numbers";
import { useCallback } from "react";
import useSWR from "swr";
import UniswapV2 from "abis/UniswapV2.json";
import { BigNumber } from "ethers";

function useOpenPriceFromBsc() {
  const poolAddress = getContract(MAINNET, "PancakePair");
  const { data, mutate: updateReserves } = useSWR(["PancakePair", MAINNET, poolAddress, "getReserves"], {
    // @ts-ignore
    fetcher: contractFetcher(undefined, UniswapV2),
  });
  // @ts-ignore
  const { _reserve0: openReserve, _reserve1: busdReserve } = data || {};
  // @ts-ignore
  const PRECISION = bigNumberify(10).pow(18);
  let openPrice;
  if (busdReserve && openReserve) {
    openPrice = busdReserve.mul(PRECISION).div(openReserve);
  }

  const mutate = useCallback(() => {
    updateReserves(undefined, true);
  }, [updateReserves]);

  return { data: openPrice, mutate };
}

export function useOpenPrice(chainId, libraries, active) {
  const { data: openPriceFromBsc, mutate: mutateFromBsc } = useOpenPriceFromBsc();
  const openPrice: BigNumber = openPriceFromBsc;
  const mutate = useCallback(() => {
    mutateFromBsc();
  }, [mutateFromBsc]);

  return {
    openPrice,
    mutate,
    openPriceFromBsc,
  };
}
