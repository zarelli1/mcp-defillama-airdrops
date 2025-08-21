import { z } from 'zod';

export const AirdropSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  value: z.string().optional(),
  status: z.string(),
  deadline: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  url: z.string().optional(),
  category: z.string().optional(),
  chain: z.string().optional(),
  estimatedValue: z.string().optional(),
  difficulty: z.string().optional(),
  lastUpdated: z.string().optional(),
  // Novos campos DeFiLlama
  tvl: z.string().optional(),
  listedAt: z.string().optional(),
  change1d: z.string().optional(),
  change7d: z.string().optional(),
  change1m: z.string().optional(),
  logo: z.string().optional(),
  symbol: z.string().optional(),
  mcap: z.string().optional()
});

export type Airdrop = z.infer<typeof AirdropSchema>;

// Schema para dados DeFiLlama mais completos
export const DefiProtocolSchema = z.object({
  name: z.string(),
  symbol: z.string().optional(),
  category: z.string().optional(),
  tvl: z.number().optional(),
  change_1d: z.number().optional(),
  change_7d: z.number().optional(),
  change_1m: z.number().optional(),
  listedAt: z.number().optional(),
  logo: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
  chain: z.string().optional(),
  mcap: z.number().optional()
});

export type DefiProtocol = z.infer<typeof DefiProtocolSchema>;

// Schema para dados DexScreener com todas as métricas solicitadas
export const DexScreenerTokenSchema = z.object({
  chainId: z.string(),
  dexId: z.string(),
  url: z.string(),
  pairAddress: z.string(),
  labels: z.array(z.string()).optional(),
  baseToken: z.object({
    address: z.string(),
    name: z.string(),
    symbol: z.string()
  }),
  quoteToken: z.object({
    address: z.string(), 
    name: z.string(),
    symbol: z.string()
  }),
  priceNative: z.string().optional(),
  priceUsd: z.string().optional(),
  txns: z.object({
    m5: z.object({
      buys: z.number(),
      sells: z.number()
    }),
    h1: z.object({
      buys: z.number(),
      sells: z.number()
    }),
    h6: z.object({
      buys: z.number(),
      sells: z.number()
    }),
    h24: z.object({
      buys: z.number(),
      sells: z.number()
    })
  }).optional(),
  volume: z.object({
    h24: z.number(),
    h6: z.number(),
    h1: z.number(),
    m5: z.number()
  }).optional(),
  priceChange: z.object({
    m5: z.number(),
    h1: z.number(),
    h6: z.number(),
    h24: z.number()
  }).optional(),
  liquidity: z.object({
    usd: z.number(),
    base: z.number(),
    quote: z.number()
  }).optional(),
  fdv: z.number().optional(),
  marketCap: z.number().optional(),
  pairCreatedAt: z.number().optional()
});

// Schema para métricas formatadas do DexScreener
export const DexScreenerMetricsSchema = z.object({
  token: z.string(),
  symbol: z.string(),
  price: z.string(),
  age: z.string(),
  txns: z.object({
    m5: z.number(),
    h1: z.number(),
    h6: z.number(),
    h24: z.number()
  }),
  volume: z.object({
    m5: z.string(),
    h1: z.string(),
    h6: z.string(),
    h24: z.string()
  }),
  makers: z.object({
    m5: z.number(),
    h1: z.number(),
    h6: z.number(),
    h24: z.number()
  }),
  liquidity: z.string(),
  mcap: z.string(),
  chain: z.string(),
  dex: z.string(),
  pairAddress: z.string(),
  url: z.string()
});

export type DexScreenerToken = z.infer<typeof DexScreenerTokenSchema>;
export type DexScreenerMetrics = z.infer<typeof DexScreenerMetricsSchema>;

export const DexScreenerProfileSchema = z.object({
  chainId: z.string(),
  tokenAddress: z.string(),
  icon: z.string().optional(),
  header: z.string().optional(),
  description: z.string().optional(),
  links: z.array(z.object({
    label: z.string(),
    url: z.string()
  })).optional()
});

export type DexScreenerProfile = z.infer<typeof DexScreenerProfileSchema>;

export interface ScrapingOptions {
  maxPages?: number;
  onlyActive?: boolean;
  minValue?: number;
  chains?: string[];
  includeProfileData?: boolean;
}