import nodemailer from 'nodemailer';
import crypto from 'crypto';

// ─── helpers ────────────────────────────────────────────────────────────────

function isRealCred(user) {
    return user && !user.includes('your_') && user.includes('@');
}

function makeGmailTransport(user, pass) {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
    });
}

// ─── build provider chain at startup ────────────────────────────────────────

const PROVIDERS = []; // ordered provider list, built once

// Provider 1 — Primary Gmail
if (isRealCred(process.env.EMAIL_USER_1) && process.env.EMAIL_PASS_1) {
    PROVIDERS.push({
        name: 'Primary Gmail',
        from: process.env.EMAIL_USER_1,
        transport: makeGmailTransport(process.env.EMAIL_USER_1, process.env.EMAIL_PASS_1),
    });
}

// Provider 2 — Backup Gmail
if (isRealCred(process.env.EMAIL_USER_2) && process.env.EMAIL_PASS_2) {
    PROVIDERS.push({
        name: 'Backup Gmail',
        from: process.env.EMAIL_USER_2,
        transport: makeGmailTransport(process.env.EMAIL_USER_2, process.env.EMAIL_PASS_2),
    });
}

// Provider 3 — Ethereal (dev only, async — created lazily)
let _etherealTransport = null;
async function getEtherealTransport() {
    if (_etherealTransport) return _etherealTransport;
    const testAccount = await Promise.race([
        nodemailer.createTestAccount(),
        new Promise((_, rej) => setTimeout(() => rej(new Error('Ethereal timeout')), 5000)),
    ]);
    _etherealTransport = {
        name: 'Ethereal (dev)',
        from: '"SecureAuth" <no-reply@secureauth.local>',
        transport: nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        }),
    };
    console.log(`📧 Ethereal ready  user=${testAccount.user}`);
    console.log(`   Preview login: https://ethereal.email/login`);
    return _etherealTransport;
}

// Log which providers are configured
if (PROVIDERS.length === 0) {
    console.log('📧 No real email credentials found in .env — will use Ethereal then console fallback.');
} else {
    PROVIDERS.forEach((p, i) => console.log(`📧 Email provider ${i + 1}: ${p.name} (${p.from})`));
}

// ─── OTP email content builder ───────────────────────────────────────────────

function buildMailOptions(from, to, otp) {
    return {
        from,
        to,
        subject: '🔐 Your Login OTP',
        text: `Your OTP is: ${otp}\n\nExpires in 3 minutes. Keep it secret.`,
        html: `
            <div style="font-family:sans-serif;max-width:480px;padding:32px;background:#0f0f1a;border-radius:12px;color:#fff;">
                <h2 style="color:#60c8ff;margin-bottom:8px;">🔐 Your Login OTP</h2>
                <p style="color:#aaa;">Your one-time PIN:</p>
                <div style="font-size:42px;font-weight:bold;letter-spacing:12px;color:#fff;margin:24px 0;">${otp}</div>
                <p style="color:#aaa;font-size:13px;">Expires in <strong>3 minutes</strong>. Never share this code.</p>
            </div>
        `,
    };
}

// ─── sendOTP — waterfall across providers ───────────────────────────────────

/**
 * Tries each configured provider in order until one succeeds.
 * Returns { delivered: true, provider } on success,
 *         { delivered: false, otp }     if all providers fail (console-only fallback).
 * 
 * NEVER throws — callers always get a usable result.
 */
export async function sendOTP(email, otp) {
    console.log('══════════════════════════════════════════════');
    console.log(`📤 Sending OTP to: ${email}   OTP: ${otp}`);

    // --- Try each real provider first ---
    const allProviders = [...PROVIDERS];

    // Also try Ethereal in dev mode (no real providers configured)
    if (allProviders.length === 0) {
        try {
            const ep = await getEtherealTransport();
            allProviders.push(ep);
        } catch (e) {
            console.warn(`   Ethereal unavailable: ${e.message}`);
        }
    }

    for (const provider of allProviders) {
        try {
            const info = await provider.transport.sendMail(
                buildMailOptions(provider.from, email, otp)
            );
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`   ✅ Delivered via ${provider.name}  msgId=${info.messageId}`);
            if (previewUrl) console.log(`   📩 Preview: ${previewUrl}`);
            console.log('══════════════════════════════════════════════\n');
            return { delivered: true, provider: provider.name };
        } catch (err) {
            console.warn(`   ⚠️  ${provider.name} failed: ${err.message}`);
        }
    }

    // --- All providers failed — console-only fallback ---
    console.log('   🔴 All providers failed. Falling back to console-only mode.');
    console.log(`   📋 OTP for ${email}: ${otp}`);
    console.log('   ℹ️  Add EMAIL_USER_1 + EMAIL_PASS_1 to .env for real delivery');
    console.log('══════════════════════════════════════════════\n');
    return { delivered: false, otp };
}

// ─── utilities ───────────────────────────────────────────────────────────────

export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashPattern(patternArray) {
    const patternString = JSON.stringify(patternArray);
    return crypto.createHash('sha256').update(patternString).digest('hex');
}
