import { ARBITRUM, ARBITRUM_TESTNET, AVALANCHE, MAINNET } from "./chains";

export const GMX_STATS_API_URL = "http://api.openworld.vision:8080/api/v1/gmx/stats";

const BACKEND_URLS = {
  default: "https://gmx-server-mainnet.uw.r.appspot.com",

  [MAINNET]: "https://api.openworld.vision/api/v1/open",
  [ARBITRUM_TESTNET]: "https://gambit-server-devnet.uc.r.appspot.com",
  [ARBITRUM]: "https://gmx-server-mainnet.uw.r.appspot.com",
  [AVALANCHE]: "https://gmx-avax-server.uc.r.appspot.com",
};
export function getServerBaseUrl(chainId: number) {
  if (!chainId) {
    throw new Error("chainId is not provided");
  }

  if (document.location.hostname.includes("deploy-preview")) {
    const fromLocalStorage = localStorage.getItem("SERVER_BASE_URL");
    if (fromLocalStorage) {
      return fromLocalStorage;
    }
  }

  return BACKEND_URLS[chainId] || BACKEND_URLS.default;
}

export const KEEPER_BOT_API = "https://keeper-bot.openworld.vision";

export function getServerUrl(chainId: number, path: string) {
  return `${getServerBaseUrl(chainId)}${path}`;
}
