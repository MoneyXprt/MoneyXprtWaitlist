import { z } from 'zod';

export const SnapshotSchema = z.any(); // TODO: refine if engine snapshot type is formalized

export const RecommendBodySchema = z.object({
  snapshot: SnapshotSchema,
  includeHighRisk: z.boolean().optional(),
  userId: z.string().uuid().optional(),
});

export type RecommendBody = z.infer<typeof RecommendBodySchema>;

export const PlaybookBodySchema = z.object({
  snapshot: SnapshotSchema,
  selected: z.array(z.string()).min(0),
  includeHighRisk: z.boolean().optional(),
});

export type PlaybookBody = z.infer<typeof PlaybookBodySchema>;

export const ExplainGetSchema = z.object({
  code: z.string().optional(),
});

export const ExplainPostSchema = z.object({
  code: z.string().optional(),
});

export const PlaybookExportBodySchema = z.object({
  playbook: z.any(),
});

export type PlaybookExportBody = z.infer<typeof PlaybookExportBodySchema>;

