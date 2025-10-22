import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import { LIT_RPC } from '@lit-protocol/constants';

// Ref: https://github.com/t3-oss/t3-env/pull/145
const booleanStrings = ['true', 'false', true, false, '1', '0', 'yes', 'no', 'y', 'n', 'on', 'off'];
const BooleanOrBooleanStringSchema = z
  .any()
  .refine((val) => booleanStrings.includes(val), { message: 'must be boolean' })
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const normalized = val.toLowerCase().trim();
      if (['true', 'yes', 'y', '1', 'on'].includes(normalized)) return true;
      if (['false', 'no', 'n', '0', 'off'].includes(normalized)) return false;
      throw new Error(`Invalid boolean string: "${val}"`);
    }
    throw new Error(`Expected boolean or boolean string, got: ${typeof val}`);
  });

export const env = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    ALCHEMY_API_KEY: z.string().optional(),
    ALCHEMY_POLICY_ID: z.string().optional(),
    ALLOWED_AUDIENCE: z.string().url(),
    BASE_RPC_URL: z.string().url(),
    CHRONICLE_YELLOWSTONE_RPC: z.string().url().default(LIT_RPC.CHRONICLE_YELLOWSTONE),
    CORS_ALLOWED_DOMAIN: z.string().url(),
    DEFAULT_TX_CONFIRMATIONS: z.coerce.number().default(6),
    ENABLE_APP_VERSIONING: z.boolean().optional().default(false),
    IS_DEVELOPMENT: BooleanOrBooleanStringSchema,
    MONGODB_URI: z.string().url(),
    PORT: z.coerce.number(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_DSN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    VINCENT_APP_ID: z.coerce.number(),
    VINCENT_DELEGATEE_PRIVATE_KEY: z.string(),
  },
});
