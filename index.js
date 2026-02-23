import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db.js';
import { generateOTP, sendOTP, hashPattern } from './utils.js';
import { generatePatternChallenge, verifyStaticPattern, generateGridForUser, validateGrid } from './patternLogic.js';
import { generateCaptchaChallenge, verifyCaptchaSelection } from './captchaLogic.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve Static Frontend
app.use(express.static(path.join(__dirname, '../dist')));

let db;
initDb().then(database => {
    db = database;
});

// --- ROUTES ---

// 1. Registration
app.post('/api/register', async (req, res) => {
    const { email, pattern } = req.body;
    if (!email || !pattern || !Array.isArray(pattern) || pattern.length > 4 || pattern.length === 0) {
        return res.status(400).json({ error: 'Valid email and pattern (1-4 steps) are required.' });
    }

    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists. Please login instead.' });
    }

    try {
        const hashed = hashPattern(pattern);

        // **NEW (ITERATION 4)**: Pre-generate a solvable static grid for this user
        const savedGridObj = generateGridForUser(pattern);

        await db.run(
            `INSERT INTO users(email, hashed_pattern, saved_grid) VALUES(?, ?, ?)`,
            [email, JSON.stringify(pattern), JSON.stringify(savedGridObj)]
        );
        res.json({ success: true, message: 'User registered successfully.' });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists.' });
        }
        res.status(500).json({ error: 'Database error' });
    }
});

// 2. Initial Login attempt (Checks attempts to decide challenge)
app.post('/api/login/init', async (req, res) => {
    const { email } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
        // Even if user not found, don't reveal to prevent enumeration. E.g. pretend success and show a fake grid.
        // For hackathon purposes, we will just return 404 for simplicity.
        return res.status(404).json({ error: 'User not found' });
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
        return res.status(403).json({ error: 'Account temporarily locked. Please try again later.' });
    }

    const attempts = user.attempt_count;

    // Level 1: Advanced 9x9 Captcha
    if (attempts === 0) {
        const captchaData = generateCaptchaChallenge();
        setChallenge(email, { type: 'captcha', targets: captchaData.targets, grid: captchaData.grid });
        return res.json({
            action: 'captcha',
            challenge: captchaData
        });
    }

    // Level 2 & 3: Standard Pattern Grid
    if (attempts === 1 || attempts === 2) {
        const rawPattern = JSON.parse(user.hashed_pattern);
        let savedGridObj = { grid: [] };
        let gridMigrated = false;

        if (user.saved_grid) {
            savedGridObj = JSON.parse(user.saved_grid);

            // ─── AUTO-MIGRATION: validate stored grid against strict rules ───
            const check = validateGrid(savedGridObj.grid, rawPattern);
            if (!check.valid) {
                console.warn(`⚠️  Migrating grid for ${email}: ${check.reason}`);
                savedGridObj = generateGridForUser(rawPattern);
                gridMigrated = true;
            } else {
                // Fail-safe final check: ensure zero duplicate pairs
                const pairKeys = savedGridObj.grid.map(c => `${c.shape}:${c.color}`);
                const uniqueCount = new Set(pairKeys).size;
                if (uniqueCount !== savedGridObj.grid.length) {
                    console.warn(`⚠️  Fail-safe migration for ${email}: ${savedGridObj.grid.length - uniqueCount} duplicate pairs found`);
                    savedGridObj = generateGridForUser(rawPattern);
                    gridMigrated = true;
                }
            }
        } else {
            // No saved grid → generate and save
            savedGridObj = generateGridForUser(rawPattern);
            gridMigrated = true;
        }

        // Persist migrated grid back to DB so next login is already clean
        if (gridMigrated) {
            await db.run('UPDATE users SET saved_grid = ? WHERE email = ?',
                [JSON.stringify(savedGridObj), email]);
            console.log(`✅ Grid migrated & saved for ${email}`);
        }

        const challengeData = generatePatternChallenge(rawPattern, savedGridObj.grid);

        setChallenge(email, { type: 'pattern', originalPattern: rawPattern, ruleObj: challengeData.ruleData });

        return res.json({
            action: 'pattern',
            challenge: challengeData
        });
    }

    // Level 4+: OTP Fallback
    if (attempts >= 3) {
        const otp = generateOTP();
        const expiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

        await db.run('DELETE FROM otps WHERE email = ?', [email]); // clear old OTP
        await db.run('INSERT INTO otps (email, otp_code, expires_at) VALUES (?, ?, ?)', [email, otp, expiry]);

        try {
            const result = await sendOTP(email, otp);
            setChallenge(email, { type: 'otp' });
            // In dev/console-only mode, include the OTP in the response
            // so the frontend can display it directly.
            if (!result.delivered) {
                return res.json({
                    action: 'otp',
                    message: 'OTP sent to console (dev mode).',
                    devOtp: result.otp
                });
            }
            return res.json({ action: 'otp', message: 'OTP sent to your email.' });
        } catch (e) {
            console.error('Failed to send OTP email:', e);
            return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
        }
    }
});

// Hacky session storage for active challenges
const activeChallenges = new Map();
function setChallenge(email, data) { activeChallenges.set(email, data); }
function getChallenge(email) { return activeChallenges.get(email); }
function clearChallenge(email) { activeChallenges.delete(email); }

// 3. Verify Pattern
app.post('/api/login/verify-pattern', async (req, res) => {
    const { email, selectedSequence } = req.body;
    const challenge = getChallenge(email);

    if (!challenge || challenge.type !== 'pattern') {
        return res.status(400).json({ error: 'No active pattern challenge' });
    }

    // CHANGE 1: Static Pattern Validation
    // Instead of using a rule validator, we ensure the array matches exactly in shape, color, and order.
    const isValid = verifyStaticPattern(selectedSequence, challenge.originalPattern);

    if (isValid) {
        clearChallenge(email);
        await db.run('UPDATE users SET attempt_count = 0 WHERE email = ?', [email]);
        return res.json({ success: true, message: 'Correct pattern! Logged in.' });
    } else {
        clearChallenge(email);
        await db.run('UPDATE users SET attempt_count = attempt_count + 1 WHERE email = ?', [email]);
        return res.status(400).json({ success: false, error: 'Incorrect pattern' });
    }
});

// 4. Verify OTP
app.post('/api/login/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    const record = await db.get('SELECT * FROM otps WHERE email = ? ORDER BY id DESC LIMIT 1', [email]);

    if (!record) return res.status(400).json({ error: 'No OTP found or Expired' });

    const now = new Date();
    const expiry = new Date(record.expires_at);

    if (now > expiry) {
        return res.status(400).json({ error: 'OTP Expired' });
    }

    if (record.attempts >= 3) {
        await db.run('DELETE FROM otps WHERE id = ?', [record.id]);
        // Lock out for 4 hours
        const lockTime = new Date(Date.now() + 4 * 60 * 60 * 1000);
        await db.run('UPDATE users SET locked_until = ?, attempt_count = 0 WHERE email = ?', [lockTime.toISOString(), email]);
        clearChallenge(email);
        return res.status(400).json({ error: 'Session Expired. Blocked for 4 hours.' });
    }

    if (record.otp_code === otp) {
        clearChallenge(email);
        await db.run('DELETE FROM otps WHERE email = ?', [email]);
        await db.run('UPDATE users SET attempt_count = 0 WHERE email = ?', [email]);
        return res.json({ success: true, message: 'OTP verified. Logged in.' });
    } else {
        await db.run('UPDATE otps SET attempts = attempts + 1 WHERE id = ?', [record.id]);
        return res.status(400).json({ error: 'Invalid OTP' });
    }
});

// 5. Verify Captcha
app.post('/api/login/verify-captcha', async (req, res) => {
    const { email, selectedIds, timeTakenMs } = req.body;
    const challenge = getChallenge(email);

    if (!challenge || challenge.type !== 'captcha') {
        return res.status(400).json({ error: 'No active captcha challenge' });
    }

    const result = verifyCaptchaSelection(selectedIds, challenge.grid, challenge.targets, timeTakenMs);

    if (result.success) {
        clearChallenge(email);
        await db.run('UPDATE users SET attempt_count = 1 WHERE email = ?', [email]);
        return res.json({ success: true, message: 'Captcha verified! Proceeding to the next step...' });
    } else {
        // Don't clear challenge, let them "Try Again" according to rules, or "Bye Bye"
        return res.status(400).json({ success: false, error: result.reason });
    }
});

// 6. Forgot Order / Recovery Flow
app.post('/api/forgot-order', async (req, res) => {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid Credentials! please try again' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
        return res.status(400).json({ error: 'Invalid Credentials! please try again' });
    }

    // Check Daily Limit
    let count = user.daily_resend_count || 0;
    const lastDate = user.last_resend_date ? new Date(user.last_resend_date) : null;
    const today = new Date().toISOString().split('T')[0];
    const lastDateStr = lastDate ? lastDate.toISOString().split('T')[0] : null;

    if (lastDateStr === today) {
        if (count >= 3) {
            return res.status(400).json({ error: 'Email retry limit exceeded. Try again tomorrow' });
        }
        count++;
    } else {
        count = 1;
    }

    await db.run('UPDATE users SET daily_resend_count = ?, last_resend_date = ? WHERE email = ?',
        [count, new Date().toISOString(), email]);

    // Send Magic PIN
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes strictly

    await db.run('INSERT INTO otps (email, otp_code, expires_at) VALUES (?, ?, ?)', [email, otp, expiry.toISOString()]);

    try {
        const result = await sendOTP(email, otp);
        if (!result.delivered) {
            // Dev mode: console fallback — include OTP in response
            return res.json({
                success: true,
                message: 'Magic PIN logged to server console (dev mode).',
                devOtp: result.otp
            });
        }
        return res.json({ success: true, message: 'Magic PIN sent to your email.' });
    } catch (e) {
        console.error('Nodemailer error:', e);
        return res.status(500).json({ error: 'Failed to send email. Please try again.' });
    }
});

// Helper route to reset attempts for testing
app.post('/api/reset-attempts', async (req, res) => {
    const { email } = req.body;
    await db.run('UPDATE users SET attempt_count = 0, locked_until = NULL WHERE email = ?', [email]);
    res.json({ success: true });
});

const startServer = (port = PORT) => {
    app.listen(port, () => {
        console.log(`Server running on port ${port} `);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error(err);
        }
    });
};

startServer();
