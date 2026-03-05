/**
 * Design System Token Generator
 * Reads Figma token exports and produces CSS variables.
 *
 * Usage: node src/design-system/generate-css-vars.js
 */

const fs = require("fs");
const path = require("path");

// ── paths ──────────────────────────────────────────────────────────────────
const LIGHT_JSON = path.resolve(__dirname, "../../design figma en token/light.tokens.json");
const DARK_JSON = path.resolve(__dirname, "../../design figma en token/Dark.tokens.json");
const OUT_CSS = path.resolve(__dirname, "tokens.css");
const OUT_JSON = path.resolve(__dirname, "tokens.json");

// ── helpers ────────────────────────────────────────────────────────────────

/** Extract hex value from a Figma $value (object or string alias). */
function resolveHex(val) {
    if (!val) return null;
    // Direct hex object
    if (typeof val === "object" && val.hex) {
        const hex = val.hex;
        const alpha = val.alpha != null ? val.alpha : 1;
        if (alpha < 1) {
            // Convert to rgba
            const r = Math.round((val.components?.[0] ?? 0) * 255);
            const g = Math.round((val.components?.[1] ?? 0) * 255);
            const b = Math.round((val.components?.[2] ?? 0) * 255);
            const a = Math.round(alpha * 100) / 100;
            return `rgba(${r},${g},${b},${a})`;
        }
        return hex;
    }
    // Alias string like "{BG}" — skip for now
    if (typeof val === "string") return null;
    return null;
}

/** Walk the token tree and collect { path[], hex } entries. */
function collectTokens(obj, pathParts = []) {
    const results = [];
    for (const key of Object.keys(obj)) {
        // Skip meta keys
        if (key.startsWith("$")) continue;
        const node = obj[key];
        if (node && typeof node === "object") {
            if ("$value" in node) {
                const hex = resolveHex(node.$value);
                if (hex) {
                    results.push({ path: [...pathParts, key], hex });
                }
            } else {
                results.push(...collectTokens(node, [...pathParts, key]));
            }
        }
    }
    return results;
}

/** Turn a path array into a CSS variable name. */
function toCssVar(parts) {
    return (
        "--token-" +
        parts
            .map((p) => p.replace(/\s+/g, "-").toLowerCase())
            .join("-")
    );
}

// ── build simplified tokens.json ──────────────────────────────────────────
function buildSimpleTokens(lightRaw, darkRaw) {
    const light = collectTokens(lightRaw);
    const dark = collectTokens(darkRaw);

    const tokens = {};
    for (const { path, hex } of light) {
        tokens[path.join(".")] = { light: hex };
    }
    for (const { path, hex } of dark) {
        const key = path.join(".");
        if (tokens[key]) {
            tokens[key].dark = hex;
        } else {
            tokens[key] = { dark: hex };
        }
    }
    return tokens;
}

// ── generate CSS ───────────────────────────────────────────────────────────
function generateCss(lightRaw, darkRaw) {
    const lightTokens = collectTokens(lightRaw);
    const darkTokens = collectTokens(darkRaw);

    // Light vars
    const lightVars = lightTokens
        .map(({ path, hex }) => `  ${toCssVar(path)}: ${hex};`)
        .join("\n");

    // Dark overrides
    const darkVars = darkTokens
        .map(({ path, hex }) => `  ${toCssVar(path)}: ${hex};`)
        .join("\n");

    return `/*
 * ⚠️  AUTO-GENERATED — do not edit by hand.
 * Run:  node src/design-system/generate-css-vars.js
 */

/* ── Light (default) ───────────────────────────────── */
:root {
${lightVars}
}

/* ── Dark overrides ────────────────────────────────── */
html[data-theme="dark"],
html.dark {
${darkVars}
}
`;
}

// ── Convenience palette aliases ────────────────────────────────────────────
/** Print human-readable colour palette, grouped by category. */
function printSummary(tokens) {
    const groups = {};
    for (const key of Object.keys(tokens)) {
        const top = key.split(".").slice(0, 2).join(".");
        if (!groups[top]) groups[top] = [];
        groups[top].push(key);
    }
    const count = Object.keys(tokens).length;
    console.log(`\n📦 ${count} tokens found across ${Object.keys(groups).length} groups`);
    for (const g of Object.keys(groups)) {
        console.log(`   ${g}  (${groups[g].length})`);
    }
}

// ── main ───────────────────────────────────────────────────────────────────
(function main() {
    console.log("🔄  Reading Figma token exports…");

    let lightRaw, darkRaw;
    try {
        lightRaw = JSON.parse(fs.readFileSync(LIGHT_JSON, "utf8"));
    } catch (e) {
        console.error("❌  Cannot read light.tokens.json:", e.message);
        process.exit(1);
    }
    try {
        darkRaw = JSON.parse(fs.readFileSync(DARK_JSON, "utf8"));
    } catch (e) {
        console.warn("⚠️  Cannot read Dark.tokens.json — dark overrides skipped.");
        darkRaw = {};
    }

    const simpleTokens = buildSimpleTokens(lightRaw, darkRaw);
    const css = generateCss(lightRaw, darkRaw);

    fs.writeFileSync(OUT_CSS, css, "utf8");
    console.log(`✅  tokens.css  →  ${OUT_CSS}`);

    fs.writeFileSync(OUT_JSON, JSON.stringify(simpleTokens, null, 2), "utf8");
    console.log(`✅  tokens.json →  ${OUT_JSON}`);

    printSummary(simpleTokens);
    console.log("\n🎉  Done! Import tokens.css in your globals.css or layout.\n");
})();
