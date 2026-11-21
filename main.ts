// main.ts — entry for make.fun news-image-20261120.
//
// "The World in One Day — 20 November 2026": a news-atlas infographic summing
// up Friday 20 November 2026's world news in one 1024x1024 image.
//
// The program copies the bundled image (entry.png, in this repository) to the
// output directory as entry.png, after checking it against the competition's
// guardrails: PNG or JPEG magic bytes, exactly 1024x1024 pixels, at most
// 1 MiB. Standard library only; no network.

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1_048_576;
const EXPECTED_WIDTH = 1024;
const EXPECTED_HEIGHT = 1024;

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);

interface Dimensions {
  width: number;
  height: number;
}

function pngDimensions(buf: Buffer): Dimensions {
  // IHDR chunk: length (4 bytes) + "IHDR" (4) + width (4, big-endian) +
  // height (4, big-endian), starting right after the 8-byte signature.
  if (buf.length < 24 || buf.toString("ascii", 12, 16) !== "IHDR") {
    throw new Error("PNG is missing its IHDR chunk");
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegDimensions(buf: Buffer): Dimensions {
  // Walk the JPEG markers to the first SOF0/SOF2 segment, which carries the
  // height (2 bytes) followed by the width (2 bytes).
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) {
      throw new Error("JPEG marker out of sync");
    }
    const marker = buf[offset + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    const length = buf.readUInt16BE(offset + 2);
    if (marker === 0xc0 || marker === 0xc2) {
      return {
        height: buf.readUInt16BE(offset + 5),
        width: buf.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  throw new Error("JPEG has no SOF0/SOF2 segment");
}

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = join(here, "entry.png");
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const target = join(outDir, "entry.png");

  const bytes = readFileSync(source);
  if (bytes.length > MAX_BYTES) {
    throw new Error(
      `entry.png is ${bytes.length} bytes, over the ${MAX_BYTES} byte cap`,
    );
  }

  let dimensions: Dimensions;
  if (bytes.subarray(0, 8).equals(PNG_MAGIC)) {
    dimensions = pngDimensions(bytes);
  } else if (bytes.subarray(0, 3).equals(JPEG_MAGIC)) {
    dimensions = jpegDimensions(bytes);
  } else {
    throw new Error("entry.png is neither PNG nor JPEG (unrecognised magic bytes)");
  }
  if (dimensions.width !== EXPECTED_WIDTH || dimensions.height !== EXPECTED_HEIGHT) {
    throw new Error(
      `entry.png is ${dimensions.width}x${dimensions.height}, ` +
        `expected ${EXPECTED_WIDTH}x${EXPECTED_HEIGHT}`,
    );
  }

  mkdirSync(outDir, { recursive: true });
  copyFileSync(source, target);

  // Integrity check: the written file must be byte-identical to the source,
  // so the two grading runs can never disagree about the entry's bytes.
  const written = readFileSync(target);
  const digest = (b: Buffer): string => createHash("sha256").update(b).digest("hex");
  if (!written.equals(bytes)) {
    throw new Error(
      `output mismatch: wrote sha256 ${digest(written)}, ` +
        `expected ${digest(bytes)}`,
    );
  }
  console.log(
    `wrote ${target} (${written.length} bytes, ` +
      `${dimensions.width}x${dimensions.height}, sha256 ${digest(written)})`,
  );
}

main();
