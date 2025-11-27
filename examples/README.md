# SmartDocConverter Examples

This directory contains example scripts demonstrating how to use the various document conversion features of SmartDocConverter.

## Running Examples

All examples can be run using `tsx`:

```bash
npx tsx examples/<example-name>.ts
```

## Available Examples

### PDF to JPG Converter

**File:** `test-pdf-to-jpg-converter.ts`

Demonstrates the complete PDF to JPG conversion functionality:
- Creating sample PDFs with text content
- Converting first page only
- Converting all pages
- Using different quality settings
- High-resolution output

**Run:**
```bash
npx tsx examples/test-pdf-to-jpg-converter.ts
```

**Output:** Generated files will be in `examples/output/`

## Output Directory

The `examples/output/` directory contains the results of running the examples. This directory is automatically created when running examples and contains:

- Sample PDF documents
- Generated ZIP archives with JPG images
- Extracted image files

## Clean Up

To clean the output directory:

```bash
rm -rf examples/output
```

## Adding New Examples

To add a new example:

1. Create a new `.ts` file in the `examples/` directory
2. Import the converter functions you want to demonstrate
3. Create sample input files or use existing ones
4. Run the conversion with different options
5. Save output to `examples/output/`

Example template:

```typescript
import { convertSomething } from '../src/lib/converters/something';
import fs from 'fs';
import path from 'path';

async function main() {
  const outputDir = path.join(__dirname, 'output');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Your example code here
}

main().catch(console.error);
```
