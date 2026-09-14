import { z } from 'zod';

export const committeeMemberSchema = z.object({
  member: z
    .object({
      id: z.number(),
      name: z.string(),
      type: z.enum(['household', 'member']),
      content_type: z.enum(['household', 'member']),
      object_id: z.number(),
    })
    .nullable()
    .refine((val) => val !== null, {
      message: 'Please select a household or member',
    }),
  position: z.enum([
    'chair',
    'vice_chair',
    'secretary',
    'joint_secretary',
    'treasurer',
    'member',
  ]),
  gender: z.string().min(1, 'Gender is required'),
  caste_ethnicity: z.string().optional().default(''),
  term_start: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date',
  }),
  term_end: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date',
  }),
  status: z.enum(['active', 'vacant', 'removed']),
  subcommittees: z.array(z.number()).default([]),
  photo: z.instanceof(File).optional(),
});

export type CommitteeMemberInput = z.infer<typeof committeeMemberSchema>;
