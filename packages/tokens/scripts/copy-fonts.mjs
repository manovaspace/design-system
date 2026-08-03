import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// Outside dist/ so tsup --clean does not race Next consumers importing ?url fonts.
const fontsDir = join(root, "fonts");

const fontFiles = [
  "@fontsource/estedad/files/estedad-arabic-400-normal.woff2",
  "@fontsource/estedad/files/estedad-arabic-500-normal.woff2",
  "@fontsource/estedad/files/estedad-arabic-600-normal.woff2",
  "@fontsource/inter/files/inter-latin-400-normal.woff2",
  "@fontsource/inter/files/inter-latin-500-normal.woff2",
];

mkdirSync(fontsDir, { recursive: true });

for (const relativePath of fontFiles) {
  const source = join(root, "node_modules", relativePath);
  const filename = relativePath.split("/").pop();
  if (!filename || !existsSync(source)) {
    throw new Error(`Missing font file: ${source}`);
  }
  cpSync(source, join(fontsDir, filename));
}

console.log(`Copied ${fontFiles.length} font files to fonts/`);
