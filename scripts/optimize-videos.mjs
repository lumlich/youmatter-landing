import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

const inputDir = path.join("assets", "videos");
const outputDir = path.join("assets", "videos-optimized");

await fs.mkdir(outputDir, { recursive: true });

const files = await fs.readdir(inputDir);

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.on("data", (data) => {
      process.stdout.write(data);
    });

    child.stderr.on("data", (data) => {
      process.stderr.write(data);
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });
}

for (const file of files) {
  const ext = path.extname(file).toLowerCase();

  if (![".mp4", ".mov", ".m4v"].includes(ext)) {
    continue;
  }

  const inputPath = path.join(inputDir, file);
  const baseName = path.basename(file, ext);
  const outputPath = path.join(outputDir, `${baseName}.mp4`);

  console.log(`\nOptimizing ${file}...`);

  await runFfmpeg([
    "-y",
    "-i",
    inputPath,

    // Use video stream and optional audio stream if present.
    "-map",
    "0:v:0",
    "-map",
    "0:a?",

    // Resize to web-friendly width while preserving aspect ratio.
    "-vf",
    "scale=1280:-2",

    // Web-friendly MP4 output.
    "-c:v",
    "libx264",
    "-crf",
    "26",
    "-preset",
    "medium",
    "-pix_fmt",
    "yuv420p",

    // Keep audio if present, but compress it.
    "-c:a",
    "aac",
    "-b:a",
    "96k",

    // Better streaming behavior.
    "-movflags",
    "+faststart",

    outputPath,
  ]);

  const original = await fs.stat(inputPath);
  const optimized = await fs.stat(outputPath);

  const originalMb = (original.size / 1024 / 1024).toFixed(2);
  const optimizedMb = (optimized.size / 1024 / 1024).toFixed(2);

  console.log(`${file} -> ${baseName}.mp4 | ${originalMb} MB -> ${optimizedMb} MB`);
}