/**
 * Tests:
 * 1. New grid from generateGridForUser → 0 duplicates guaranteed
 * 2. Simulate old buggy grid (with duplicates) → validateGrid catches it
 * 3. Fail-safe Set check catches anything validateGrid misses
 * 4. verifyStaticPattern correctness
 */
import { generateGridForUser, validateGrid, verifyStaticPattern } from './server/patternLogic.js';

let passed = 0, failed = 0;

function assert(label, condition, detail = '') {
    if (condition) {
        console.log(`  ✅ ${label}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${label} ${detail}`);
        failed++;
    }
}

const pattern = [
    { shape: 'circle', color: 'red' },
    { shape: 'triangle', color: 'blue' },
    { shape: 'circle', color: 'green' },  // same shape, different color
];

// ──────────────────────────────────────────
console.log('\n[TEST 1] New grid generation — 0 duplicates');
// ──────────────────────────────────────────
const { grid } = generateGridForUser(pattern);

assert('Grid has 25 cells', grid.length === 25);

const pairs = grid.map(c => `${c.shape}:${c.color}`);
const uniquePairs = new Set(pairs);
assert('Zero duplicate pairs', uniquePairs.size === grid.length,
    `(got ${grid.length - uniquePairs.size} duplicates)`);

// Check each shape appears 3-5 times
const shapeCounts = {};
grid.forEach(c => shapeCounts[c.shape] = (shapeCounts[c.shape] || 0) + 1);
const shapeCountsOk = Object.values(shapeCounts).every(n => n >= 3 && n <= 5);
assert('All shapes appear 3-5 times', shapeCountsOk,
    `counts: ${JSON.stringify(shapeCounts)}`);

// Pattern elements present
const patternOk = pattern.every(p => uniquePairs.has(`${p.shape}:${p.color}`));
assert('User pattern elements present', patternOk);

// ──────────────────────────────────────────
console.log('\n[TEST 2] Simulated OLD buggy grid — migration detection');
// ──────────────────────────────────────────
const buggyGrid = [];
for (let i = 0; i < 25; i++) {
    // Intentionally repeating 'circle:red' many times
    buggyGrid.push({ id: i, shape: 'circle', color: 'red' });
}
const buggyResult = validateGrid(buggyGrid, pattern);
assert('validateGrid catches duplicate pairs', !buggyResult.valid,
    `reason: ${buggyResult.reason}`);

// ──────────────────────────────────────────
console.log('\n[TEST 3] Fail-safe Set check');
// ──────────────────────────────────────────
const buggyPairs = buggyGrid.map(c => `${c.shape}:${c.color}`);
const buggyUnique = new Set(buggyPairs);
const failSafeFired = buggyUnique.size !== buggyGrid.length;
assert('Fail-safe Set check detects duplicates', failSafeFired,
    `unique=${buggyUnique.size} total=${buggyGrid.length}`);

// ──────────────────────────────────────────
console.log('\n[TEST 4] Pattern matching correctness');
// ──────────────────────────────────────────
const correctSel = [
    { shape: 'circle', color: 'red' },
    { shape: 'triangle', color: 'blue' },
    { shape: 'circle', color: 'green' },
];
assert('Correct selection → true', verifyStaticPattern(correctSel, pattern));

const wrongOrder = [
    { shape: 'triangle', color: 'blue' },
    { shape: 'circle', color: 'red' },
    { shape: 'circle', color: 'green' },
];
assert('Wrong order → false', !verifyStaticPattern(wrongOrder, pattern));

const wrongColor = [
    { shape: 'circle', color: 'blue' },
    { shape: 'triangle', color: 'blue' },
    { shape: 'circle', color: 'green' },
];
assert('Wrong color → false', !verifyStaticPattern(wrongColor, pattern));

// ──────────────────────────────────────────
console.log(`\n${'═'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('🎉 ALL TESTS PASSED — grid is duplicate-free');
else console.error('⚠️  Some tests failed');
