/**
 * DPX DOCS — STORACHA DEPLOY SCRIPT
 *
 * Builds the Astro site and uploads the dist/ folder to Storacha (IPFS + Filecoin).
 * Returns the CID and the exact DNS TXT record to update in GoDaddy.
 *
 * Usage:
 *   node deploy-storacha.mjs
 *   node deploy-storacha.mjs --skip-build   (if dist/ is already fresh)
 *
 * Requirements:
 *   STORACHA_KEY   in .env — from: npx w3 key create
 *   STORACHA_PROOF in .env — from: npx w3 delegation create ... | base64
 *
 * After running:
 *   1. Copy the CID from the output
 *   2. In GoDaddy → DNS → TXT records → update _dnslink.docs.untitledfinancial.xyz
 *      to:  dnslink=/ipfs/<CID>
 *   3. Wait 1–5 min for DNS propagation
 *   4. Visit https://docs.untitledfinancial.xyz (via IPFS gateway)
 */

import { createReadStream, readdirSync, statSync, readFileSync } from "fs";
import { join, relative, extname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { config } from "dotenv";

config(); // load .env

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST_DIR  = join(__dirname, "dist");
const SKIP_BUILD = process.argv.includes("--skip-build");

// ─────────────────────────────────────────────────────────────────────────────
// MIME TYPE MAP
// ─────────────────────────────────────────────────────────────────────────────
const MIME_TYPES = {
  ".html": "text/html",
  ".css":  "text/css",
  ".js":   "application/javascript",
  ".json": "application/json",
  ".txt":  "text/plain",
  ".xml":  "application/xml",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".ico":  "image/x-icon",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".webp": "image/webp",
};

function getMime(filePath) {
  return MIME_TYPES[extname(filePath).toLowerCase()] || "application/octet-stream";
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLECT ALL FILES IN dist/
// ─────────────────────────────────────────────────────────────────────────────
function collectFiles(dir, baseDir = dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectFiles(fullPath, baseDir));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║  DPX Docs — Storacha Deploy                                  ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  // Check credentials
  const key   = process.env.STORACHA_KEY;
  const proof = process.env.STORACHA_PROOF;

  if (!key || !proof) {
    console.error("✗ Missing credentials. Add to .env:\n");
    console.error("  STORACHA_KEY=...    ← from: npx w3 key create");
    console.error("  STORACHA_PROOF=...  ← from: npx w3 delegation create <DID> --can 'store/add' --can 'upload/add' | base64\n");
    console.error("Run: node deploy-storacha.mjs setup  for full instructions");
    process.exit(1);
  }

  // Step 1: Build
  if (!SKIP_BUILD) {
    console.log("▶ Step 1: Building Astro site...");
    try {
      execSync("npm run build", { stdio: "inherit", cwd: __dirname });
      console.log("✓ Build complete\n");
    } catch {
      console.error("✗ Build failed. Fix errors above and retry.");
      process.exit(1);
    }
  } else {
    console.log("▶ Step 1: Skipping build (--skip-build)\n");
  }

  // Step 2: Connect to Storacha
  console.log("▶ Step 2: Connecting to Storacha...");
  const { create }      = await import("@web3-storage/w3up-client");
  const Signer          = await import("@ucanto/principal/ed25519");
  const { importDAG }   = await import("@ucanto/core/delegation");
  const { CarReader }   = await import("@ipld/car");

  const principal  = Signer.parse(key);
  const client     = await create({ principal });
  const proofBytes = Buffer.from(proof, "base64");
  const reader     = await CarReader.fromBytes(proofBytes);
  const blocks     = [];
  for await (const block of reader.blocks()) blocks.push(block);
  const { importDAG: _importDAG } = await import("@ucanto/core/delegation");
  const dag    = importDAG(blocks);
  const space  = await client.addSpace(dag);
  await client.setCurrentSpace(space.did());
  console.log(`✓ Connected to space: ${space.did()}\n`);

  // Step 3: Collect files
  console.log("▶ Step 3: Collecting files from dist/...");
  const filePaths = collectFiles(DIST_DIR);
  console.log(`  Found ${filePaths.length} files\n`);

  // Step 4: Upload as directory
  console.log("▶ Step 4: Uploading to Storacha (IPFS + Filecoin)...");
  const fileObjects = filePaths.map((filePath) => {
    const relativePath = relative(DIST_DIR, filePath);
    const content      = readFileSync(filePath);
    const type         = getMime(filePath);
    return new File([content], relativePath, { type });
  });

  const cid = await client.uploadDirectory(fileObjects);
  const cidStr = cid.toString();

  // Step 5: Output results
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║  ✓ UPLOAD COMPLETE                                           ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");
  console.log(`CID:      ${cidStr}`);
  console.log(`IPFS URL: https://${cidStr}.ipfs.w3s.link\n`);

  console.log("─────────────────────────────────────────────────────────────");
  console.log("NEXT: Update GoDaddy DNS\n");
  console.log("Go to GoDaddy → untitledfinancial.xyz → DNS → TXT Records");
  console.log("Add or update:\n");
  console.log(`  Name:   _dnslink.docs`);
  console.log(`  Value:  dnslink=/ipfs/${cidStr}`);
  console.log(`  TTL:    600 (10 minutes)\n`);
  console.log("─────────────────────────────────────────────────────────────");
  console.log("After DNS propagates (1–10 min), your site is live at:");
  console.log("  https://docs.untitledfinancial.xyz  (via IPFS gateway)");
  console.log(`  https://${cidStr}.ipfs.w3s.link  (direct CID, always works)\n`);

  // Save CID to file for reference
  const record = {
    cid:       cidStr,
    url:       `https://${cidStr}.ipfs.w3s.link`,
    deployedAt: new Date().toISOString(),
    fileCount:  filePaths.length,
    dnslink:   `dnslink=/ipfs/${cidStr}`,
  };

  const { writeFileSync } = await import("fs");
  writeFileSync(
    join(__dirname, ".storacha-deploys.json"),
    JSON.stringify([
      record,
      ...(() => {
        try { return JSON.parse(readFileSync(join(__dirname, ".storacha-deploys.json"), "utf8")); }
        catch { return []; }
      })()
    ], null, 2)
  );

  console.log("Deploy history saved to .storacha-deploys.json\n");
  return cidStr;
}

// Setup helper
if (process.argv[2] === "setup") {
  console.log(`
DPX Docs — Storacha Setup
══════════════════════════

1. Install w3 CLI:
   npm install -g @web3-storage/w3cli

2. Log in with your existing Storacha account:
   npx w3 login your@email.com

3. List your spaces (pick one for DPX docs):
   npx w3 space ls

4. Set the space:
   npx w3 space use <space-name>

5. Generate a signing key:
   npx w3 key create
   → Copy the output (starts with MgCa...)

6. Generate a delegation proof:
   npx w3 delegation create <DID-from-step-5> --can 'store/add' --can 'upload/add' | base64
   → Copy the base64 output

7. Create .env in dpx-docs/:
   STORACHA_KEY=MgCa...
   STORACHA_PROOF=...base64

8. Deploy:
   node deploy-storacha.mjs

9. Update GoDaddy DNS (output will tell you exactly what to set)
`);
  process.exit(0);
}

main().catch((err) => {
  console.error("\n✗ Deploy failed:", err.message);
  console.error(err.stack);
  process.exit(1);
});
