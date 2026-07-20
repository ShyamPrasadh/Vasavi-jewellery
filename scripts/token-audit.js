#!/usr/bin/env node

/**
 * Token Audit Script
 * Scans CSS and TSX files for hardcoded visual values that should use design tokens.
 * Returns exit code 1 if errors are found (CI-ready).
 *
 * Usage: node scripts/token-audit.js
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');

// ── Token Maps ──────────────────────────────────────────────────────────────

const COLOR_MAP = {
    '#A67C00': 'var(--color-gold)',
    '#a67c00': 'var(--color-gold)',
    '#B8860B': 'var(--color-gold-hover)',
    '#b8860b': 'var(--color-gold-hover)',
    '#8C6B00': 'var(--color-gold-dark)',
    '#8c6b00': 'var(--color-gold-dark)',
    '#F4E4BC': 'var(--color-gold-light)',
    '#f4e4bc': 'var(--color-gold-light)',
    '#F9F5EC': 'var(--color-gold-muted)',
    '#f9f5ec': 'var(--color-gold-muted)',
    '#8B2332': 'var(--color-maroon)',
    '#8b2332': 'var(--color-maroon)',
    '#630d0d': 'var(--color-maroon) [legacy]',
    '#8a1a1a': 'var(--color-maroon-hover) [legacy]',
    '#4a0808': 'var(--color-maroon) [legacy]',
    '#FDFCFB': 'var(--color-bg)',
    '#fdfcfb': 'var(--color-bg)',
    '#1A202C': 'var(--color-text)',
    '#1a202c': 'var(--color-text)',
    '#0A192F': 'var(--color-text) [use --color-text instead]',
    '#0a192f': 'var(--color-text) [use --color-text instead]',
    '#111827': 'var(--color-dark)',
    '#333333': 'var(--color-dark) [use --color-dark instead]',
    '#b8962e': 'var(--color-gold-hover) [use --color-gold-hover instead]',
};

// ── File Discovery ──────────────────────────────────────────────────────────

function findFiles(dir, extensions) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.next') continue;
            results = results.concat(findFiles(fullPath, extensions));
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
            results.push(fullPath);
        }
    }
    return results;
}

// ── Scanners ────────────────────────────────────────────────────────────────

function scanCSSFile(filePath) {
    const issues = [];
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Skip tokens.css itself
    if (filePath.endsWith('tokens.css')) return issues;

    lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        const trimmed = line.trim();

        // Skip comments
        if (trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('//')) return;
        // Skip import lines
        if (trimmed.startsWith('@import')) return;

        // Check for hardcoded hex colors in CSS properties
        const hexMatches = line.match(/#[0-9A-Fa-f]{3,8}\b/g);
        if (hexMatches) {
            hexMatches.forEach(hex => {
                // Skip if inside a var() fallback (that's allowed in tokens.css pattern)
                if (line.includes(`var(`) && line.includes(hex)) {
                    // Check if it's a fallback value like var(--ds-gold, #A67C00)
                    const varPattern = new RegExp(`var\\([^,]+,\\s*${hex.replace('#', '\\#')}\\)`);
                    if (varPattern.test(line)) return;
                }

                const suggestion = COLOR_MAP[hex] || COLOR_MAP[hex.toLowerCase()];
                if (suggestion) {
                    issues.push({
                        type: 'error',
                        file: filePath,
                        line: lineNum,
                        message: `Hardcoded color ${hex}`,
                        suggestion: `Use ${suggestion}`
                    });
                }
            });
        }
    });

    return issues;
}

function scanTSXFile(filePath) {
    const issues = [];
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
        const lineNum = idx + 1;

        // Check for hardcoded Tailwind color classes with hex values
        // Pattern: bg-[#xxx], text-[#xxx], border-[#xxx], shadow-[#xxx]
        const tailwindHexPattern = /(?:bg|text|border|shadow|from|to|via)-\[#([0-9A-Fa-f]{3,8})\]/g;
        let match;

        while ((match = tailwindHexPattern.exec(line)) !== null) {
            const hex = '#' + match[1];
            const suggestion = COLOR_MAP[hex] || COLOR_MAP[hex.toLowerCase()];

            // These are known token-mapped values — flag them as warnings since they're in Tailwind classes
            if (suggestion) {
                issues.push({
                    type: 'warning',
                    file: filePath,
                    line: lineNum,
                    message: `Tailwind hardcoded color ${match[0]}`,
                    suggestion: `Consider mapping to token: ${suggestion}`
                });
            }
        }

        // Check for inline style hardcoded colors
        const inlineStyleHex = /style=\{?\{[^}]*#([0-9A-Fa-f]{3,8})/g;
        while ((match = inlineStyleHex.exec(line)) !== null) {
            const hex = '#' + match[1];
            const suggestion = COLOR_MAP[hex] || COLOR_MAP[hex.toLowerCase()];
            if (suggestion) {
                issues.push({
                    type: 'error',
                    file: filePath,
                    line: lineNum,
                    message: `Inline style hardcoded color #${match[1]}`,
                    suggestion: `Use ${suggestion}`
                });
            }
        }
    });

    return issues;
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
    console.log('\n🔍 Token Audit');
    console.log('━'.repeat(60));

    const cssFiles = findFiles(SRC_DIR, ['.css']);
    const tsxFiles = findFiles(SRC_DIR, ['.tsx', '.ts']);
    const allFiles = [...cssFiles, ...tsxFiles];

    console.log(`Scanning ${allFiles.length} file(s)...\n`);

    let allIssues = [];

    cssFiles.forEach(f => {
        allIssues = allIssues.concat(scanCSSFile(f));
    });

    tsxFiles.forEach(f => {
        allIssues = allIssues.concat(scanTSXFile(f));
    });

    const errors = allIssues.filter(i => i.type === 'error');
    const warnings = allIssues.filter(i => i.type === 'warning');

    // Group by file
    const byFile = {};
    allIssues.forEach(issue => {
        const rel = path.relative(path.join(__dirname, '..'), issue.file);
        if (!byFile[rel]) byFile[rel] = [];
        byFile[rel].push(issue);
    });

    Object.keys(byFile).sort().forEach(file => {
        console.log(`\n📄 ${file}`);
        byFile[file].forEach(issue => {
            const icon = issue.type === 'error' ? '  ✗' : '  ⚠';
            console.log(`${icon} L${issue.line}: ${issue.message}`);
            console.log(`    → ${issue.suggestion}`);
        });
    });

    console.log('\n' + '━'.repeat(60));
    console.log(`📊 Summary`);
    console.log(`   Files scanned:      ${allFiles.length}`);
    console.log(`   Files with issues:  ${Object.keys(byFile).length}`);
    console.log(`   Errors:             ${errors.length}`);
    console.log(`   Warnings:           ${warnings.length}`);
    console.log('━'.repeat(60) + '\n');

    if (errors.length > 0) {
        console.log('❌ Audit FAILED — fix errors before committing.\n');
        process.exit(1);
    } else if (warnings.length > 0) {
        console.log('⚠️  Audit passed with warnings.\n');
        process.exit(0);
    } else {
        console.log('✅ Audit PASSED — zero violations.\n');
        process.exit(0);
    }
}

main();
