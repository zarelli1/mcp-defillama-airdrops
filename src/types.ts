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

export interface ScrapingOptions {
  maxPages?: number;
  onlyActive?: boolean;
  minValue?: number;
  chains?: string[];
}