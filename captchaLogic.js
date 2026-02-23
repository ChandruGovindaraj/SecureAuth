const WORDS = [
    'CAT', 'DOG', 'TREE', 'MOON', 'STAR', 'CODE', 'JAVA', 'NODE', 'DATA', 'AI',
    'CLOUD', 'PIXEL', 'MATRIX', 'VECTOR', 'LOGIC', 'ALGO', 'BINARY', 'MODEL', 'STACK', 'QUEUE',
    'DEBUG', 'APPLE', 'BIRD', 'CAR', 'DESK', 'EARTH', 'FIRE', 'GOLD', 'HAT', 'ICE',
    'JUMP', 'KITE', 'LAKE', 'MIND', 'NEST', 'OCEAN', 'PATH', 'QUIZ', 'RAIN', 'SUN',
    'TIME', 'USER', 'VIEW', 'WIND', 'XRAY', 'YARN', 'ZIP', 'ATOM', 'BYTE', 'CORE',
    'DISK', 'EDGE', 'FILE', 'GEAR', 'HOST', 'ICON', 'JSON', 'KEY', 'LINK', 'MAC',
    'NULL', 'OPEN', 'PORT', 'ROOT', 'SYNC', 'TAG', 'URL', 'VOID', 'WEB', 'XML',
    'BETA', 'CACHE', 'DART', 'ECHO', 'FONT', 'GRID', 'HASH', 'INFO', 'JEST', 'KILO',
    'LOOP', 'MOCK', 'NULL', 'OOPS', 'PING', 'QUIT', 'REST', 'SAFE', 'TEST', 'UNIT'
];

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// 5x4 grid = 20 cells
export function generateCaptchaChallenge() {
    const allItems = new Set();
    while (allItems.size < 20) {
        if (Math.random() > 0.5) {
            allItems.add(WORDS[Math.floor(Math.random() * WORDS.length)]);
        } else {
            allItems.add(getRandomIntInclusive(10, 999).toString());
        }
    }
    const itemsArray = Array.from(allItems);

    const targets = [];
    const availableIndices = Array.from({ length: 20 }, (_, i) => i);
    for (let i = 0; i < 4; i++) {
        const rand = Math.floor(Math.random() * availableIndices.length);
        const idx = availableIndices.splice(rand, 1)[0];
        targets.push(itemsArray[idx]);
    }

    const instruction = `Select exactly these items: ${targets.join(', ')}`;

    // Shuffle grid
    for (let i = itemsArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [itemsArray[i], itemsArray[j]] = [itemsArray[j], itemsArray[i]];
    }

    const grid = itemsArray.map((value, id) => ({ id, value }));
    return { instruction, targets, grid };
}

export function verifyCaptchaSelection(selectedIds, grid, targets, timeTakenMs) {
    // Bot check
    if (timeTakenMs < 2000) {
        return { success: false, reason: "Suspicious activity detected 🚫 (Completed too fast)" };
    }

    // Calculate the correct IDs
    const correctIds = grid.filter(cell => targets.includes(cell.value)).map(c => c.id);

    // Did they select all correct ones and NO incorrect ones
    if (selectedIds.length !== correctIds.length) {
        return { success: false, reason: "You missed some items or selected wrong ones!" };
    }

    const allSelectedAreCorrect = selectedIds.every(id => correctIds.includes(id));
    if (!allSelectedAreCorrect) {
        return { success: false, reason: "You selected incorrect items!" };
    }

    return { success: true };
}
