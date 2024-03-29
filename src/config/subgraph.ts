import { ARBITRUM, AVALANCHE, MAINNET, TESTNET } from "./chains";

export const SUBGRAPH_URLS = {
  [ARBITRUM]: {
    stats: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-stats",
    referrals: "https://api.thegraph.com/subgraphs/name/nnphuong9718/open-arb-referrals",
    nissohVault: "https://api.thegraph.com/subgraphs/name/nissoh/gmx-vault",
  },

  [AVALANCHE]: {
    stats: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-avalanche-stats",
    referrals: "https://api.thegraph.com/subgraphs/name/gmx-io/gmx-avalanche-referrals",
  },

  common: {
    chainLink: "https://api.thegraph.com/subgraphs/name/deividask/chainlink",
    owChainLink: "https://api.thegraph.com/subgraphs/name/nntam2013/chainlink_pricefeed_bnb_2",
  },
  [TESTNET]: {
    stats: "https://graphiql.openworld.vision/subgraphs/name/nnphuong1997/open-bsc-stats",
    referrals: "https://graphiql.openworld.vision/subgraphs/name/nnphuong1997/open-bsc-referrals8",
  },
  [MAINNET]: {
    stats: "https://graphiql.openworld.vision/subgraphs/name/nnphuong1997/open-bsc-stats",
    referrals: "https://api.thegraph.com/subgraphs/name/nnphuong9718/open-bsc-referrals-mainnet",
  },
};
