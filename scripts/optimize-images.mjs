import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const inputDir = path.join("assets", "images");
const outputDir = path.join("assets", "images-webp");

const maxSize = 2200;
const quality = 88;

await fs.mkdir(outputDir, { recursive: true });

const files = await fs.readdir(inputDir);

for (const file of files) {
  const ext = path.extname(file).toLowerCase();

  if (![".jpg", ".jpeg", ".png"].includes(ext)) {
    continue;
  }

  const inputPath = path.join(inputDir, file);
  const baseName = path.basename(file, ext);
  const outputPath = path.join(outputDir, `${baseName}.webp`);

  await sharp(inputPath)
    .rotate()
    .resize({
      width: maxSize,
      height: maxSize,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 6,
    })
    .toFile(outputPath);

  const original = await fs.stat(inputPath);
  const optimized = await fs.stat(outputPath);

  const originalKb = Math.round(original.size / 1024);
  const optimizedKb = Math.round(optimized.size / 1024);

  console.log(
    `${file} -> ${baseName}.webp | ${originalKb} KB -> ${optimizedKb} KB`
  );
}
