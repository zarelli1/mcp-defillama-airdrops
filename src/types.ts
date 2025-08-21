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
  lastUpdated: z.string().optional()
});

export type Airdrop = z.infer<typeof AirdropSchema>;

export interface ScrapingOptions {
  maxPages?: number;
  onlyActive?: boolean;
  minValue?: number;
  chains?: string[];
}