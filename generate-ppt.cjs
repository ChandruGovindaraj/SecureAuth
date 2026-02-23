// SecureAuth Technologies — PPT Generator
// Run with: node generate-ppt.cjs
const PptxGenJS = require('pptxgenjs');
const pptx = new PptxGenJS();

// ── Theme ─────────────────────────────────────────────────────────────────────
const T = {
    bg: '050810',
    bgCard: '0C0F1E',
    cyan: '00D4FF',
    purple: '9D4DFF',
    white: 'FFFFFF',
    gray: '8899AA',
    green: '00FF88',
    gradient: [{ color: '00D4FF' }, { color: '9D4DFF' }],
};

pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'SecureAuth Technologies';
pptx.subject = 'SecureAuth — Passwordless Auth System';
pptx.title = 'SecureAuth Technologies';

// ── Helper: add gradient-text heading ────────────────────────────────────────
function heading(slide, text, y, size = 32) {
    slide.addText(text, {
        x: 0.5, y, w: '90%', h: 0.6,
        fontSize: size, bold: true,
        color: T.cyan,
        fontFace: 'Calibri',
    });
}
function body(slide, text, y, opts = {}) {
    slide.addText(text, {
        x: 0.7, y, w: '88%', h: 'auto',
        fontSize: opts.size || 14,
        color: opts.color || T.white,
        fontFace: 'Calibri',
        ...opts,
    });
}
function card(slide, x, y, w, h, title, lines, accent = T.cyan) {
    // Card background
    slide.addShape(pptx.ShapeType.roundRect, {
        x, y, w, h,
        fill: { color: T.bgCard },
        line: { color: accent, width: 1 },
        rectRadius: 0.12,
    });
    slide.addText(title, {
        x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.35,
        fontSize: 13, bold: true, color: accent, fontFace: 'Calibri',
    });
    slide.addText(lines, {
        x: x + 0.15, y: y + 0.45, w: w - 0.3, h: h - 0.6,
        fontSize: 11, color: '99BBDD', fontFace: 'Calibri',
        paraSpaceAfter: 4,
    });
}
function darkSlide(slide) {
    slide.background = { color: T.bg };
    // Top accent line
    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.04,
        fill: {
            type: 'gradient', gradientType: 'linear', angle: 90,
            stops: [{ position: 0, color: T.cyan }, { position: 100, color: T.purple }]
        },
        line: { type: 'none' },
    });
}
function sectionBadge(slide, label) {
    slide.addText(label.toUpperCase(), {
        x: 0.5, y: 0.15, w: 2.5, h: 0.28,
        fontSize: 9, bold: true, color: T.cyan,
        align: 'center', fontFace: 'Calibri',
        fill: { color: '001C2A' },
        line: { color: T.cyan, width: 0.5 },
        rectRadius: 0.06,
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — TITLE
// ══════════════════════════════════════════════════════════════════════════════
{
    const s = pptx.addSlide();
    darkSlide(s);
    // Glow orb (simulated as a soft ellipse)
    s.addShape(pptx.ShapeType.ellipse, {
        x: 2, y: 1, w: 5, h: 4,
        fill: { type: 'solid', color: '001428' },
        line: { type: 'none' },
    });
    s.addText('🛡', { x: 5.5, y: 0.9, w: 1.5, h: 1.5, fontSize: 64, align: 'center' });
    s.addText('SecureAuth Technologies', {
        x: 0.5, y: 2.1, w: '90%', h: 0.9,
        fontSize: 40, bold: true, color: T.cyan,
        align: 'center', fontFace: 'Calibri',
    });
    s.addText('Next-Generation Passwordless Authentication', {
        x: 0.5, y: 3.05, w: '90%', h: 0.5,
        fontSize: 17, color: T.gray, align: 'center', fontFace: 'Calibri',
    });
    s.addShape(pptx.ShapeType.rect, {
        x: 3.5, y: 3.6, w: 5.5, h: 0.04,
        fill: {
            type: 'gradient', gradientType: 'linear', angle: 90,
            stops: [{ position: 0, color: T.cyan }, { position: 100, color: T.purple }]
        },
        line: { type: 'none' },
    });
    s.addText('"Built Secure, Built to Secure"', {
        x: 0.5, y: 3.75, w: '90%', h: 0.4,
        fontSize: 14, color: T.purple, italic: true, align: 'center', fontFace: 'Calibri',
    });
    s.addText('Authors:  Chandru  ·  Daksh  ·  Jivesh', {
        x: 0.5, y: 4.4, w: '90%', h: 0.3,
        fontSize: 12, color: '556677', align: 'center', fontFace: 'Calibri',
    });
    s.addText('NexJam Hackathon 2026', {
        x: 0.5, y: 4.85, w: '90%', h: 0.25,
        fontSize: 11, color: '334455', align: 'center', fontFace: 'Calibri',
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — PROBLEM STATEMENT
// ══════════════════════════════════════════════════════════════════════════════
{
    const s = pptx.addSlide();
    darkSlide(s);
    sectionBadge(s, 'Problem');
    heading(s, 'The Password Problem', 0.55);
    const rows = [
        [{ text: 'Problem', options: { bold: true, color: T.cyan, fontSize: 12 } },
        { text: 'Impact', options: { bold: true, color: T.cyan, fontSize: 12 } }],
        ['81% of data breaches use stolen / weak passwords', 'Credentials at constant risk'],
        ['Users reuse passwords across 5+ services', 'Single breach = mass compromise'],
        ['Password managers create single points of failure', 'One vault cracked = everything lost'],
        ['Phishing bypasses even complex passwords', 'Social engineering trivially effective'],
        ['SMS OTP is SIM-swappable', 'Two-factor no longer sufficient alone'],
    ];
    s.addTable(rows, {
        x: 0.5, y: 1.25, w: 11.5, h: 3.2,
        colW: [6.5, 5.0],
        border: { pt: 0.5, color: '1A2A3A' },
        fill: T.bgCard,
        fontFace: 'Calibri', fontSize: 12,
        color: T.white,
    });
    s.addText('💡  SecureAuth replaces passwords entirely with adaptive visual + OTP challenges', {
        x: 0.5, y: 4.55, w: '90%', h: 0.4,
        fontSize: 13, color: T.green, bold: true, fontFace: 'Calibri',
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — SOLUTION OVERVIEW
// ══════════════════════════════════════════════════════════════════════════════
{
    const s = pptx.addSlide();
    darkSlide(s);
    sectionBadge(s, 'Solution');
    heading(s, 'What is SecureAuth?', 0.55);
    body(s, 'A three-layer adaptive authentication engine — NO passwords, NO biometrics,\nNO hardware tokens required.', 1.15, { size: 14, color: T.gray });
    card(s, 0.5, 1.7, 3.6, 1.4, '🎨  Layer 1 — Visual Pattern',
        'User selects 3–6 cells on a unique\npersonalised 5×5 shape+colour grid.\nOrder & combination must match.', T.cyan);
    card(s, 4.35, 1.7, 3.6, 1.4, '🤖  Layer 2 — CAPTCHA',
        'On failed attempt, an alphanumeric\nCAPTCHA is added as a second\nfactor in the same flow.', T.purple);
    card(s, 8.2, 1.7, 3.7, 1.4, '📧  Layer 3 — Magic PIN',
        '6-digit OTP sent via multi-provider\nemail waterfall (Gmail → Ethereal\n→ Console). Expires in 3 mins.', T.green);
    card(s, 0.5, 3.3, 11.4, 1.35, '🔐  Security Guarantees',
        [
            { text: '✦  No plaintext secrets ever stored   ', options: { color: T.cyan } },
            { text: '✦  Visual patterns hashed (SHA-256)   ', options: { color: T.cyan } },
            { text: '✦  Grid shuffled on every login   ', options: { color: T.cyan } },
            { text: '✦  Rate-limited: 3 OTPs/day    ', options: { color: T.cyan } },
            { text: '✦  Per-user unique grid — zero shared cells', options: { color: T.cyan } },
        ], T.white);
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — SYSTEM ARCHITECTURE
// ══════════════════════════════════════════════════════════════════════════════
{
    const s = pptx.addSlide();
    darkSlide(s);
    sectionBadge(s, 'Architecture');
    heading(s, 'System Architecture', 0.55);

    const layers = [
        { label: 'Frontend', color: T.cyan, items: 'React 18 + TypeScript\nVite Build System\nFramer Motion\nZustand State\nTailwind CSS' },
        { label: 'API Layer', color: T.purple, items: 'Express.js REST API\n6 Auth Endpoints\nJWT-less Stateless\nInput Validation\nRate Limiting' },
        { label: 'Logic', color: T.green, items: 'patternLogic.js\nGrid Generation\nPattern Hashing\nOTP Manager\nChallenge Engine' },
        { label: 'Data', color: 'FF8800', items: 'SQLite (better-sqlite3)\nUsers Table\nOTPs Table\nChallenges Store\nAuto-migration' },
    ];
    layers.forEach((l, i) => {
        card(s, 0.5 + i * 3.05, 1.2, 2.9, 3.35, l.label, l.items, l.color);
    });
    s.addText('⟵  Browser  ──  HTTP/JSON  ──  Node.js Server  ──  SQLite DB  ⟶', {
        x: 0.5, y: 4.65, w: '90%', h: 0.3,
        fontSize: 12, color: '445566', align: 'center', fontFace: 'Calibri',
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — AUTHENTICATION FLOW
// ══════════════════════════════════════════════════════════════════════════════
{
    const s = pptx.addSlide();
    darkSlide(s);
    sectionBadge(s, 'Auth Flow');
    heading(s, 'Login Flow — Progressive Security', 0.55);

    const steps = [
        { n: '1', label: 'Enter Email', desc: 'POST /api/login/init\nReturns challenge type based on attempt history', c: T.cyan },
        { n: '2', label: 'Pattern Grid', desc: 'Shuffled 5×5 grid displayed.\nUser selects cells in memorised order.', c: T.cyan },
        { n: '3', label: 'Fail?', desc: 'Attempt count increments.\nCAPTCHA added from attempt 2.', c: T.purple },
        { n: '4', label: '3 Failures', desc: 'OTP email triggered.\nMagic PIN valid for 3 minutes.', c: '00FF88' },
        { n: '5', label: 'Verify OTP', desc: 'PIN matched & deleted.\nSession authenticated, count reset.', c: T.green },
    ];
    steps.forEach((st, i) => {
        const x = 0.3 + i * 2.42;
        s.addShape(pptx.ShapeType.roundRect, {
            x, y: 1.3, w: 2.2, h: 2.6,
            fill: { color: T.bgCard }, line: { color: st.c, width: 1 }, rectRadius: 0.1,
        });
        s.addText(st.n, { x: x + 0.05, y: 1.35, w: 0.5, h: 0.4, fontSize: 18, bold: true, color: st.c, fontFace: 'Calibri' });
        s.addText(st.label, { x: x + 0.1, y: 1.75, w: 2.0, h: 0.35, fontSize: 13, bold: true, color: T.white, fontFace: 'Calibri' });
        s.addText(st.desc, { x: x + 0.1, y: 2.15, w: 2.0, h: 1.6, fontSize: 10.5, color: '99AABB', fontFace: 'Calibri' });
        if (i < 4) s.addText('→', { x: x + 2.22, y: 2.45, w: 0.2, h: 0.3, fontSize: 18, color: '334455', fontFace: 'Calibri' });
    });

    // Registration note
    s.addShape(pptx.ShapeType.roundRect, {
        x: 0.3, y: 4.05, w: 11.9, h: 0.85,
        fill: { color: '001A10' }, line: { color: T.green, width: 0.8 }, rectRadius: 0.08,
    });
    s.addText('📋  Registration:  Enter email  →  Unique 5×5 grid generated  →  Select 3–6 cells (pattern)  →  Hash stored  →  Account created', {
        x: 0.5, y: 4.12, w: 11.5, h: 0.65,
        fontSize: 12, color: T.green, fontFace: 'Calibri',
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — VISUAL GRID ALGORITHM
// ══════════════════════════════════════════════════════════════════════════════
{
    const s = pptx.addSlide();
    darkSlide(s);
    sectionBadge(s, 'Core Algorithm');
    heading(s, '5×5 Visual Pattern Grid', 0.55);

    const rules = [
        ['Rule', 'Detail', 'Why It Matters'],
        ['No duplicate pairs', 'Each (shape, colour) combo appears at most once across all 25 cells', 'Zero ambiguity in pattern selection'],
        ['Shape frequency', 'Each of 6 shapes appears exactly 4–5 times; total = 25', 'Balanced grid, no bias toward any shape'],
        ['Unique colours per shape', 'Every colour used within a shape is different from others of the same shape', 'User can uniquely identify their pattern'],
        ['Pattern always present', 'Registered cells are injected first, random fill after', 'Login impossible to break by removal'],
        ['Login shuffle', 'Fisher-Yates on deep copy — shape+colour never change, only position', 'Prevents position memorisation attacks'],
    ];
    s.addTable(rules, {
        x: 0.5, y: 1.2, w: 11.5, h: 3.2,
        colW: [2.5, 5.5, 3.5],
        rowH: [0.38, 0.55, 0.55, 0.55, 0.55, 0.55],
        border: { pt: 0.5, color: '1A2A3A' },
        fill: T.bgCard, fontFace: 'Calibri', fontSize: 11, color: T.white,
    });
    body(s, '6 Shapes  ×  8 Colours  =  48 unique pairs available  →  Only 25 chosen per grid  →  Guarantee via backtrack generator', 4.5, { size: 12, color: T.gray });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — EMAIL / OTP SYSTEM
// ══════════════════════════════════════════════════════════════════════════════
{
    const s = pptx.addSlide();
    darkSlide(s);
    sectionBadge(s, 'Email Engine');
    heading(s, 'Multi-Provider OTP Waterfall', 0.55);

    const providers = [
        { n: '1', label: 'Primary Gmail', desc: 'EMAIL_USER_1\n+ App Password', c: T.cyan },
        { n: '2', label: 'Backup Gmail', desc: 'EMAIL_USER_2\n+ App Password', c: T.purple },
        { n: '3', label: 'Ethereal (Dev)', desc: 'Auto-created test\naccount, preview URL', c: '00FF88' },
        { n: '4', label: 'Console Fallback', desc: 'OTP logged to\nterminal + toast UI', c: 'FF8800' },
    ];
    providers.forEach((p, i) => {
        const x = 0.5 + i * 3.05;
        s.addShape(pptx.ShapeType.roundRect, { x, y: 1.25, w: 2.85, h: 1.8, fill: { color: T.bgCard }, line: { color: p.c, width: 1 }, rectRadius: 0.1 });
        s.addText(`${p.n}.`, { x: x + 0.12, y: 1.3, w: 0.4, h: 0.35, fontSize: 14, bold: true, color: p.c, fontFace: 'Calibri' });
        s.addText(p.label, { x: x + 0.12, y: 1.65, w: 2.6, h: 0.33, fontSize: 12.5, bold: true, color: T.white, fontFace: 'Calibri' });
        s.addText(p.desc, { x: x + 0.12, y: 2.0, w: 2.6, h: 0.9, fontSize: 11, color: '99AABB', fontFace: 'Calibri' });
        if (i < 3) s.addText('→', { x: x + 2.87, y: 2.0, w: 0.2, h: 0.3, fontSize: 16, color: '334455', fontFace: 'Calibri' });
    });
    s.addText('Tries each provider in sequence · 5-second timeout on Ethereal · Returns { delivered: bool, otp: string }',
        { x: 0.5, y: 3.2, w: 11.5, h: 0.3, fontSize: 11.5, color: T.gray, fontFace: 'Calibri' });

    // OTP props table
    const rows2 = [
        [{ text: 'Property', options: { bold: true, color: T.cyan } }, { text: 'Value', options: { bold: true, color: T.cyan } }],
        ['Length', '6 digits (100,000 – 999,999)'],
        ['Expiry', '3 minutes from issue'],
        ['Daily limit', '3 requests per email address'],
        ['Storage', 'Plain text, deleted on use or expiry'],
        ['Hash', 'Never — OTP is deleted, not compared repeatably'],
    ];
    s.addTable(rows2, {
        x: 0.5, y: 3.6, w: 11.5, h: 1.25,
        colW: [3.5, 8.0],
        border: { pt: 0.5, color: '1A2A3A' },
        fill: T.bgCard, fontFace: 'Calibri', fontSize: 11.5, color: T.white,
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — DATABASE SCHEMA
// ══════════════════════════════════════════════════════════════════════════════
{
    const s = pptx.addSlide();
    darkSlide(s);
    sectionBadge(s, 'Database');
    heading(s, 'SQLite — Database Schema', 0.55);

    const tables = [
        { name: 'users', rows: [['id', 'INTEGER PK'], ['email', 'TEXT UNIQUE'], ['pattern_hash', 'TEXT'], ['grid', 'TEXT (JSON)'], ['attempts', 'INTEGER'], ['last_attempt', 'DATETIME']] },
        { name: 'otps', rows: [['id', 'INTEGER PK'], ['email', 'TEXT'], ['otp_code', 'TEXT'], ['expires_at', 'DATETIME'], ['used', 'INTEGER']] },
        { name: 'challenges', rows: [['email (key)', 'TEXT'], ['type', "TEXT ('pattern'|'otp'|'captcha')"], ['data', 'TEXT (JSON)'], ['expires_at', 'DATETIME']] },
    ];
    tables.forEach((t, i) => {
        const x = 0.4 + i * 4.1;
        s.addShape(pptx.ShapeType.roundRect, { x, y: 1.25, w: 3.85, h: 3.45, fill: { color: T.bgCard }, line: { color: T.cyan, width: 0.8 }, rectRadius: 0.1 });
        s.addText(t.name, { x: x + 0.15, y: 1.3, w: 3.5, h: 0.32, fontSize: 13, bold: true, color: T.cyan, fontFace: 'Calibri' });
        s.addShape(pptx.ShapeType.rect, { x: x + 0.1, y: 1.62, w: 3.65, h: 0.02, fill: { color: '1A2A3A' }, line: { type: 'none' } });
        t.rows.forEach((r, j) => {
            s.addText(r[0], { x: x + 0.15, y: 1.68 + j * 0.43, w: 1.7, h: 0.35, fontSize: 10.5, bold: true, color: '7DCFFF', fontFace: 'Courier New' });
            s.addText(r[1], { x: x + 1.9, y: 1.68 + j * 0.43, w: 1.8, h: 0.35, fontSize: 10, color: '99AABB', fontFace: 'Calibri' });
        });
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 9 — FRONTEND COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════
{
    const s = pptx.addSlide();
    darkSlide(s);
    sectionBadge(s, 'Frontend');
    heading(s, 'React Component Architecture', 0.55);

    const comps = [
        { name: 'App.tsx', desc: 'Root layout, scroll-hide header, glitter particles, theme provider, cursor glow', c: T.cyan },
        { name: 'AuthFlow.tsx', desc: 'Switches between auth-tabs and success screen using AnimatePresence', c: T.purple },
        { name: 'AuthTabs.tsx', desc: 'Login / Register tab switcher — routes to LoginForm or RegisterForm', c: T.cyan },
        { name: 'LoginForm.tsx', desc: 'Email input → fetches challenge → dispatches to Pattern / OTP / CAPTCHA sub-screens', c: T.purple },
        { name: 'PatternChallenge.tsx', desc: 'Renders the 5×5 grid, handles cell selection, submits pattern to server', c: T.green },
        { name: 'OtpChallenge.tsx', desc: '6-digit PIN input with countdown timer and resend logic', c: '00FF88' },
        { name: 'CaptchaChallenge.tsx', desc: 'Renders alphanumeric CAPTCHA image, handles text submission', c: T.purple },
        { name: 'AnimatedMascot.tsx', desc: '3D-tilt ghost emoji + neon scrolling marquee + animated motto', c: T.cyan },
        { name: 'Footer.tsx', desc: 'Brand info, security features, social icons (Insta/YouTube/X), modals', c: T.gray },
        { name: 'AuthorsSection.tsx', desc: 'Neon author cards with magnetic hover, particle bursts, spinning rings', c: 'FF8800' },
    ];
    const colSize = 5;
    comps.forEach((c, i) => {
        const col = i < colSize ? 0 : 1;
        const row = i % colSize;
        const x = 0.4 + col * 6.3;
        const y = 1.25 + row * 0.72;
        s.addShape(pptx.ShapeType.roundRect, { x, y, w: 6.0, h: 0.62, fill: { color: T.bgCard }, line: { color: c.c, width: 0.6 }, rectRadius: 0.08 });
        s.addText(c.name, { x: x + 0.12, y: y + 0.06, w: 2.0, h: 0.25, fontSize: 10.5, bold: true, color: c.c, fontFace: 'Courier New' });
        s.addText(c.desc, { x: x + 0.12, y: y + 0.31, w: 5.75, h: 0.24, fontSize: 9.5, color: '99AABB', fontFace: 'Calibri' });
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 10 — SECURITY MODEL
// ══════════════════════════════════════════════════════════════════════════════
{
    const s = pptx.addSlide();
    darkSlide(s);
    sectionBadge(s, 'Security');
    heading(s, 'Security Model', 0.55);

    const threats = [
        ['Threat', 'Mitigation', 'Layer'],
        ['Brute-force login', 'Challenge escalates to OTP after 3 fails; rate-limited', 'Server + DB'],
        ['Credential theft', 'No passwords stored — pattern hash is meaningless without the grid', 'DB'],
        ['Replay attacks', 'Grid position shuffled per login; OTP single-use & 3-min TTL', 'Logic'],
        ['Phishing', 'No password to phish; grid is user-specific and visual', 'Design'],
        ['OTP interception', '6-digit = 1-in-1M chance; multi-provider fallback never leaks to client in prod', 'Email'],
        ['Position prediction', 'Fisher-Yates shuffle with crypto seeding ensures random cell positions', 'Algorithm'],
        ['Database breach', 'Pattern stored as SHA-256 hash; grid JSON is useless without live app', 'DB'],
        ['SIM-swap', 'Email OTP (not SMS); Gmail App Password isolation per device', 'Email'],
    ];
    s.addTable(threats, {
        x: 0.4, y: 1.2, w: 12.1, h: 3.55,
        colW: [2.8, 6.2, 3.1],
        border: { pt: 0.5, color: '1A2A3A' },
        fill: T.bgCard, fontFace: 'Calibri', fontSize: 11, color: T.white,
    });
    s.addText('🔐  Zero passwords stored at any point in the entire system lifecycle', {
        x: 0.5, y: 4.85, w: '90%', h: 0.3,
        fontSize: 13, bold: true, color: T.green, fontFace: 'Calibri',
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 11 — API REFERENCE
// ══════════════════════════════════════════════════════════════════════════════
{
    const s = pptx.addSlide();
    darkSlide(s);
    sectionBadge(s, 'API');
    heading(s, 'REST API Reference', 0.55);

    const apis = [
        ['Method', 'Endpoint', 'Body', 'Response'],
        ['POST', '/api/register', '{ email, pattern: [{shape,color}] }', '{ message } or error'],
        ['POST', '/api/login/init', '{ email }', '{ action: "pattern"|"otp"|"captcha", challenge }'],
        ['POST', '/api/login/verify', '{ email, pattern: [{shape,color}] }', '{ success } or next challenge'],
        ['POST', '/api/login/verify-captcha', '{ email, captcha }', '{ success } or error'],
        ['POST', '/api/login/verify-otp', '{ email, otp }', '{ success } or error'],
        ['POST', '/api/forgot-order', '{ email }', '{ message, devOtp? }'],
    ];
    s.addTable(apis, {
        x: 0.4, y: 1.2, w: 12.1, h: 3.5,
        colW: [1.0, 2.8, 4.5, 3.8],
        border: { pt: 0.5, color: '1A2A3A' },
        fill: T.bgCard, fontFace: 'Calibri', fontSize: 11, color: T.white,
    });
    s.addText('Base URL: http://localhost:3000   |   Content-Type: application/json   |   Auth: session-based challenge state', {
        x: 0.5, y: 4.85, w: '90%', h: 0.25, fontSize: 11, color: '556677', fontFace: 'Calibri',
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 12 — TECH STACK
// ══════════════════════════════════════════════════════════════════════════════
{
    const s = pptx.addSlide();
    darkSlide(s);
    sectionBadge(s, 'Tech Stack');
    heading(s, 'Technology Stack', 0.55);

    const stack = [
        { cat: 'Frontend', color: T.cyan, techs: 'React 18, TypeScript, Vite 7, Framer Motion, Tailwind CSS, Zustand, Sonner, Lucide Icons' },
        { cat: 'Backend', color: T.purple, techs: 'Node.js, Express.js, better-sqlite3 SQLite, Nodemailer (multi-provider), Crypto (SHA-256, OTP), CORS' },
        { cat: 'Dev Tools', color: T.green, techs: 'Vite Dev Server, ESLint, TypeScript Compiler, npm scripts, dotenv (.env config)' },
        { cat: 'Design', color: 'FF8800', techs: 'Custom glassmorphism UI, Framer Motion spring animations, CSS custom property theming (dark/light), neon glow palette' },
    ];
    stack.forEach((st, i) => {
        card(s, 0.4, 1.2 + i * 0.92, 12.1, 0.82, st.cat, st.techs, st.color);
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 13 — DEMO FLOW
// ══════════════════════════════════════════════════════════════════════════════
{
    const s = pptx.addSlide();
    darkSlide(s);
    sectionBadge(s, 'Live Demo');
    heading(s, 'Demo Walk-Through', 0.55);

    const steps2 = [
        { label: 'Start Server', cmd: 'cd nexjam_1\nnode server/index.js', color: T.cyan },
        { label: 'Open Browser', cmd: 'http://localhost:3000', color: T.purple },
        { label: 'Register', cmd: 'Enter email → See 5×5 grid\n→ Select 3–6 cells → Submit', color: T.green },
        { label: 'Login ✅', cmd: 'Enter email → same grid\n→ select same cells in order', color: T.cyan },
        { label: 'Fail → CAPTCHA', cmd: 'Wrong cells → fail\n→ CAPTCHA appears at attempt 2', color: T.purple },
        { label: 'Magic PIN', cmd: '3 fails → PIN emailed\n→ enter 6-digit code → success', color: 'FF8800' },
        { label: 'Scroll Footer', cmd: 'Authors · Privacy Policy\n· Documentation · Social Icons', color: T.green },
        { label: 'Toggle Theme', cmd: 'Header top-right pill\n→ click to switch light/dark', color: T.cyan },
    ];
    steps2.forEach((st, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 0.4 + col * 3.1;
        const y = 1.25 + row * 1.65;
        s.addShape(pptx.ShapeType.roundRect, { x, y, w: 2.9, h: 1.5, fill: { color: T.bgCard }, line: { color: st.color, width: 1 }, rectRadius: 0.1 });
        s.addText(`${i + 1}. ${st.label}`, { x: x + 0.12, y: y + 0.1, w: 2.65, h: 0.32, fontSize: 12.5, bold: true, color: st.color, fontFace: 'Calibri' });
        s.addText(st.cmd, { x: x + 0.12, y: y + 0.45, w: 2.65, h: 0.9, fontSize: 10.5, color: '99AABB', fontFace: 'Calibri' });
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 14 — FUTURE SCOPE
// ══════════════════════════════════════════════════════════════════════════════
{
    const s = pptx.addSlide();
    darkSlide(s);
    sectionBadge(s, 'Future');
    heading(s, 'Future Scope & Enhancements', 0.55);

    const ideas = [
        { icon: '🌐', title: 'Biometric Fusion', desc: 'WebAuthn / FaceID as optional layer 4 — already architected in challenge engine' },
        { icon: '📱', title: 'Mobile App', desc: 'React Native port — same grid logic works natively on iOS & Android' },
        { icon: '🔗', title: 'OAuth Integration', desc: 'SecureAuth as OIDC provider — plug into any app replacing username+password' },
        { icon: '🤖', title: 'AI Anomaly Detection', desc: 'ML model to flag unusual pattern timings or geographic login anomalies' },
        { icon: '🌍', title: 'Multi-language', desc: 'i18n support across the UI; grid labels internationalised' },
        { icon: '📊', title: 'Admin Dashboard', desc: 'Real-time login attempt heatmap, OTP delivery stats, user management' },
    ];
    ideas.forEach((id, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 0.4 + col * 4.15;
        const y = 1.3 + row * 1.65;
        s.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.95, h: 1.5, fill: { color: T.bgCard }, line: { color: T.purple, width: 0.7 }, rectRadius: 0.1 });
        s.addText(`${id.icon}  ${id.title}`, { x: x + 0.12, y: y + 0.1, w: 3.7, h: 0.35, fontSize: 13, bold: true, color: T.cyan, fontFace: 'Calibri' });
        s.addText(id.desc, { x: x + 0.12, y: y + 0.5, w: 3.7, h: 0.85, fontSize: 11, color: '99AABB', fontFace: 'Calibri' });
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 15 — THANK YOU
// ══════════════════════════════════════════════════════════════════════════════
{
    const s = pptx.addSlide();
    darkSlide(s);
    s.addText('🛡', { x: 4.5, y: 0.5, w: 3.5, h: 1.5, fontSize: 72, align: 'center' });
    s.addText('Thank You!', {
        x: 0.5, y: 2.0, w: '90%', h: 0.8,
        fontSize: 48, bold: true, color: T.cyan, align: 'center', fontFace: 'Calibri',
    });
    s.addShape(pptx.ShapeType.rect, {
        x: 3.5, y: 2.85, w: 5.5, h: 0.04,
        fill: {
            type: 'gradient', gradientType: 'linear', angle: 90,
            stops: [{ position: 0, color: T.cyan }, { position: 100, color: T.purple }]
        },
        line: { type: 'none' },
    });
    s.addText('"Built Secure, Built to Secure"', {
        x: 0.5, y: 2.95, w: '90%', h: 0.4,
        fontSize: 15, color: T.purple, italic: true, align: 'center', fontFace: 'Calibri',
    });
    s.addText('Chandru  ·  Daksh  ·  Jivesh', {
        x: 0.5, y: 3.55, w: '90%', h: 0.4,
        fontSize: 18, bold: true, color: T.white, align: 'center', fontFace: 'Calibri',
    });
    s.addText('SecureAuth Technologies  |  NexJam Hackathon 2026', {
        x: 0.5, y: 4.05, w: '90%', h: 0.3,
        fontSize: 12, color: '334455', align: 'center', fontFace: 'Calibri',
    });
    s.addText('http://localhost:3000', {
        x: 0.5, y: 4.45, w: '90%', h: 0.3,
        fontSize: 13, color: T.cyan, align: 'center', fontFace: 'Calibri',
    });
}

// ── Save ──────────────────────────────────────────────────────────────────────
const outPath = 'SecureAuth_Presentation.pptx';
pptx.writeFile({ fileName: outPath })
    .then(() => console.log(`\n✅  PPT saved → ${outPath}\n`))
    .catch(e => console.error('Error:', e));
