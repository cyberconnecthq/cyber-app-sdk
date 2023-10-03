import {
  optimism,
  optimismGoerli,
  type Chain,
  polygon,
  polygonMumbai,
  arbitrum,
  arbitrumGoerli,
  linea,
  lineaTestnet,
  base,
  baseGoerli,
  bsc,
  bscTestnet,
  scrollSepolia,
} from "viem/chains";

export const opBnbMainnet = {
  id: 204,
  name: "opBNB",
  network: "opBNB",
  rpcUrls: {
    public: {
      http: [
        "https://opbnb-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3",
      ],
    },
    default: {
      http: [
        `https://opbnb-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3`,
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "BlockScout",
      url: "https://opbnbscan.com",
    },
  },
  nativeCurrency: bsc.nativeCurrency,
};

export const opBnbTestnet = {
  id: 5611,
  name: "opBNB Testnet",
  network: "opBNB testnet",
  rpcUrls: {
    public: {
      http: [
        "https://opbnb-testnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3",
      ],
    },
    default: {
      http: [
        `https://opbnb-testnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3`,
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "BlockScout",
      url: "https://testnet.opbnbscan.com",
    },
  },
  nativeCurrency: bscTestnet.nativeCurrency,
};

// This is for TypeScript error: https://github.com/microsoft/TypeScript/issues/42873
const chainNames = [
  "optimism",
  "optimismGoerli",
  "polygon",
  "polygonMumbai",
  "arbitrum",
  "arbitrumGoerli",
  "linea",
  "lineaTestnet",
  "base",
  "baseGoerli",
  "opBnb",
  "opBnbTestnet",
  "scrollSepolia",
] as const;

export const availableChains: Record<(typeof chainNames)[number], Chain> = {
  optimism,
  optimismGoerli,
  polygon,
  polygonMumbai,
  arbitrum,
  arbitrumGoerli,
  linea,
  lineaTestnet,
  base,
  baseGoerli,
  opBnb: opBnbMainnet,
  opBnbTestnet,
  scrollSepolia,
} as const;
