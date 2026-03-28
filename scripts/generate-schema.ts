import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { createGenerator, type Config } from 'ts-json-schema-generator';

const config: Config = {
  path: resolve('schema/draft/schema.ts'),
  tsconfig: resolve('tsconfig.json'),
  type: 'AcrsExtensionParams',
  additionalProperties: false,
};

const generator = createGenerator(config);
const schema = generator.createSchema(config.type);

schema.$schema = 'https://json-schema.org/draft/2020-12/schema';
schema.$id = 'https://acrs-spec.org/schema/v1/acrs-extension.schema.json';

// Post-process: add item-level patterns that JSDoc @items.pattern can't express
const defs = (schema as Record<string, unknown>).definitions as Record<string, Record<string, unknown>>;

const compliance = defs.AcrsCompliance?.properties as Record<string, Record<string, unknown>> | undefined;
if (compliance?.data_residency?.items) {
  (compliance.data_residency.items as Record<string, unknown>).pattern = '^[A-Z]{2}$';
}

const categories = defs.AcrsCategories?.properties as Record<string, Record<string, unknown>> | undefined;
if (categories?.tags?.items) {
  (categories.tags.items as Record<string, unknown>).pattern = '^[a-z0-9-]+$';
}

const output = resolve('schema/draft/schema.json');
writeFileSync(output, JSON.stringify(schema, null, 2) + '\n');

console.log(`Schema written to ${output}`);
