import type { Network } from "@aptos-labs/wallet-adapter-react";

// @ts-ignore
export const NETWORK: Network = "testnet";
export const MODULE_ADDRESS =
  "0x2ec54d3c04c089c3bc383f5615214c3346a03b0cec5d3df1d74efe12111dc834";
export const APTOS_API_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY;
export const GPT_API_KEY = process.env.NEXT_GPT_API_KEY;
export const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY;
export const APTOS_GRAPHQL_ADDRESS = `https://api.${NETWORK}.aptoslabs.com/v1/graphql`;
export const APTOS_COLLECTION_ADDRESS = `0x4388093d9f53631fa9d3fb0e39d907a00ba125d5451a0360673016919c939adc`;
export const NODIT_INDEXER_ENDPOINT =
  "https://aptos-testnet.nodit.io/Plqw3uewTesXVyHAmWRnsf6~fFHhuskp/v1/graphql";
