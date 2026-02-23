const SHAPES = ['circle', 'square', 'triangle', 'star', 'diamond', 'pentagon'];
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

// ─── helpers ────────────────────────────────────────────────────────────────

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pairKey(shape, color) { return `${shape}:${color}`; }

// ─── grid validation ─────────────────────────────────────────────────────────

/**
 * Full 5-rule validation:
 *  1. Exactly 25 cells
 *  2. No duplicate shape-color pair
 *  3. Each shape appears 3-5 times
 *  4. No shape reuses a color (implicit from rule 2, explicit check)
 *  5. All user pattern elements present
 */
export function validateGrid(grid, originalPattern) {
    if (grid.length !== 25)
        return { valid: false, reason: `Grid has ${grid.length} cells (need 25)` };

    // Check no duplicate pairs
    const pairSet = new Set();
    for (const cell of grid) {
        const k = pairKey(cell.shape, cell.color);
        if (pairSet.has(k)) return { valid: false, reason: `Duplicate pair: ${k}` };
        pairSet.add(k);
    }

    // Count per shape
    const shapeCounts = {};
    const shapeColors = {}; // shape → Set of colors used
    for (const cell of grid) {
        shapeCounts[cell.shape] = (shapeCounts[cell.shape] || 0) + 1;
        if (!shapeColors[cell.shape]) shapeColors[cell.shape] = new Set();
        shapeColors[cell.shape].add(cell.color);
    }

    for (const shape of SHAPES) {
        const cnt = shapeCounts[shape] || 0;
        if (cnt < 3 || cnt > 5)
            return { valid: false, reason: `Shape "${shape}" appears ${cnt} times (need 3-5)` };
        // Since pairs are unique, color count equals shape count automatically
    }

    // All pattern elements must exist
    for (const item of originalPattern) {
        if (!pairSet.has(pairKey(item.shape, item.color)))
            return { valid: false, reason: `Pattern element ${pairKey(item.shape, item.color)} missing` };
    }

    return { valid: true, reason: '' };
}

// ─── core grid builder ───────────────────────────────────────────────────────

/**
 * Build a candidate grid.
 *
 * RULES:
 *  • Exactly 25 cells
 *  • Each of the 6 shapes appears 3-5 times
 *  • Each shape uses only UNIQUE colors (no color repeated within a shape)
 *  • No global duplicate (shape, color) pair
 *  • User pattern elements are guaranteed to be present
 *
 * Distribution: 25 cells across 6 shapes → [4,4,4,4,4,5] (one random shape gets 5)
 *   → total = 24 + 1 = 25 ✓
 */
function buildCandidateGrid(originalPattern) {
    // Step 1 — decide how many times each shape appears
    // 5 shapes × 4 + 1 shape × 5 = 25
    const counts = [4, 4, 4, 4, 4, 5];
    const shapesShuffled = shuffle(SHAPES); // randomise which shape gets 5

    // Reserve required colors for pattern elements (per-shape)
    // patternColorMap: shape → Set of colors that MUST be included
    const patternColorMap = {};
    for (const item of originalPattern) {
        if (!patternColorMap[item.shape]) patternColorMap[item.shape] = new Set();
        patternColorMap[item.shape].add(item.color);
    }

    const cells = [];

    // Step 2 — build color list for each shape
    for (let si = 0; si < shapesShuffled.length; si++) {
        const shape = shapesShuffled[si];
        const numColors = counts[si];

        // Start with required pattern colors for this shape
        const required = [...(patternColorMap[shape] || new Set())];
        // Fill remaining slots with unique random colors
        const available = shuffle(COLORS.filter(c => !required.includes(c)));
        const colorList = [...required, ...available].slice(0, numColors);

        // If we couldn't fit all required colors (pattern > numColors slots), expand
        // This happens if pattern has more elements for one shape than its slot count
        const allRequired = [...(patternColorMap[shape] || new Set())];
        for (const rc of allRequired) {
            if (!colorList.includes(rc)) colorList.push(rc);
        }

        for (const color of colorList) {
            cells.push({ shape, color });
        }
    }

    // Step 3 — shuffle positions
    const shuffledCells = shuffle(cells);

    // Step 4 — assign IDs
    return shuffledCells.slice(0, 25).map((cell, idx) => ({ id: idx, ...cell }));
}

// ─── public API ─────────────────────────────────────────────────────────────

/**
 * Generate a validated 5×5 grid at registration.
 * Retries up to 50 times until all rules pass.
 */
export function generateGridForUser(originalPattern) {
    let grid;
    let result;
    let tries = 0;

    do {
        grid = buildCandidateGrid(originalPattern);
        result = validateGrid(grid, originalPattern);
        tries++;
        if (tries > 50) {
            console.warn(`⚠️  generateGridForUser: gave up after 50 tries. Last reason: ${result.reason}`);
            break;
        }
    } while (!result.valid);

    if (result.valid) {
        const perShape = {};
        grid.forEach(c => { perShape[c.shape] = (perShape[c.shape] || 0) + 1; });
        console.log(`✅ Grid built in ${tries} try/tries. Per shape:`, perShape);
    }

    return { grid };
}

/**
 * At login: use the stored static grid.
 * SHUFFLE-ONLY — positions reorder but shape+color per cell NEVER changes.
 */
export function generatePatternChallenge(originalPattern, staticGrid) {
    const shuffled = shuffle(staticGrid.map(cell => ({ ...cell })));
    return {
        ruleText: 'Select your secret sequence in the exact order you registered it.',
        ruleType: 'static',
        ruleData: {},
        grid: shuffled
    };
}

/**
 * Static 1:1 sequence validator (shape + color + order must all match).
 */
export function verifyStaticPattern(selectedItems, originalPattern) {
    if (!Array.isArray(selectedItems) || !Array.isArray(originalPattern)) return false;
    if (selectedItems.length !== originalPattern.length) return false;
    for (let i = 0; i < originalPattern.length; i++) {
        if (selectedItems[i].shape !== originalPattern[i].shape ||
            selectedItems[i].color !== originalPattern[i].color) {
            return false;
        }
    }
    return true;
}
