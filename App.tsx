import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap } from 'lucide-react';
import { AuthFlow } from '@/components/auth/AuthFlow';
import { AnimatedMascot } from '@/components/mascot/AnimatedMascot';
import { Footer } from '@/components/Footer';
import { useAuthStore } from '@/components/auth/useAuthStore';
import { useThemeStore } from '@/components/useThemeStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from 'sonner';
import './App.css';

// ─── Glitter ──────────────────────────────────────────────────────────────────
interface Glitter {
  id: number; x: number; delay: number; duration: number; size: number; color: string;
}
const GLITTER_COLORS = [
  'rgba(100,220,255,0.9)', 'rgba(180,100,255,0.9)', 'rgba(255,255,255,0.95)',
  'rgba(80,200,160,0.85)', 'rgba(255,200,80,0.7)', 'rgba(255,120,200,0.8)',
];
function createGlitters(count: number): Glitter[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100,
    delay: Math.random() * 6, duration: 3 + Math.random() * 4,
    size: 2 + Math.random() * 3,
    color: GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)],
  }));
}

function App() {
  const { loginState, isAuthenticated, isRegisterPattern } = useAuthStore();
  const isPatternMode = loginState === 'PATTERN' || isRegisterPattern;
  const { isDark } = useThemeStore();

  // Cursor glow
  const [cursor, setCursor] = useState({ x: -500, y: -500 });
  useEffect(() => {
    const t = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', t);
    return () => window.removeEventListener('mousemove', t);
  }, []);

  // ── Smart scroll-hide header ──────────────────────────────────────────────
  const [headerVisible, setHeaderVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      if (y < 60) setHeaderVisible(true);
      else if (y > lastY + 6) setHeaderVisible(false);   // scrolling down → hide
      else if (y < lastY - 4) setHeaderVisible(true);    // scrolling up  → show
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [glitters] = useState<Glitter[]>(() => createGlitters(60));

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      data-theme={isDark ? 'dark' : 'light'}
      style={{ background: 'var(--bg)', color: 'var(--text)', transition: 'background 0.5s ease, color 0.4s ease' }}
    >

      {/* Cursor glow */}
      <div className="pointer-events-none fixed inset-0 z-[999]"
        style={{
          background: `radial-gradient(600px circle at ${cursor.x}px ${cursor.y}px, rgba(100,220,255,0.06), transparent 60%)`,
          transition: 'background 0.04s ease',
        }} />

      {/* Glitter */}
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {glitters.map((g) => (
          <motion.div key={g.id} className="absolute rounded-full"
            style={{
              left: `${g.x}%`, top: 0, width: g.size, height: g.size,
              background: g.color, boxShadow: `0 0 ${g.size * 2}px ${g.color}`,
              filter: 'blur(0.3px)',
            }}
            animate={{ y: ['0vh', '110vh'], opacity: [0, 1, 0.8, 0], scale: [0.5, 1, 0.7, 0.2] }}
            transition={{ duration: g.duration, delay: g.delay, repeat: Infinity, ease: 'linear', repeatDelay: Math.random() * 2 }}
          />
        ))}
      </div>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/3 rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)`,
            backgroundSize: '50px 50px',
          }} />
      </div>

      {/* ── Smart Scroll-Hide Header ───────────────────────────────────────── */}
      <AnimatePresence>
        {headerVisible && (
          <motion.header
            key="header"
            initial={{ y: -90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
            style={{
              background: scrolled ? 'rgba(5,5,8,0.75)' : 'transparent',
              backdropFilter: scrolled ? 'blur(22px)' : 'none',
              borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
              transition: 'background 0.4s, backdrop-filter 0.4s, border-bottom 0.4s',
            }}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Logo */}
              <motion.div className="flex items-center gap-3 cursor-pointer"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                <motion.div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg"
                  whileHover={{ rotate: [0, -8, 8, 0], boxShadow: '0 0 30px rgba(100,220,255,0.6)' }}
                  transition={{ duration: 0.4 }}
                >
                  <ShieldCheck className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-white font-bold text-lg leading-tight tracking-wide">SecureAuth</h1>
                  <p className="text-white/40 text-[10px] tracking-widest uppercase font-medium">Adaptive System</p>
                </div>
              </motion.div>

              {/* Right side: live badge + theme toggle */}
              <div className="flex items-center gap-3">
                <motion.div
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(0,255,100,0.08)', border: '1px solid rgba(0,255,100,0.2)' }}
                  animate={{ boxShadow: ['0 0 8px rgba(0,255,100,0.2)', '0 0 20px rgba(0,255,100,0.45)', '0 0 8px rgba(0,255,100,0.2)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.span className="w-2 h-2 rounded-full bg-green-400"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  <span className="text-green-400 text-xs font-semibold tracking-wide">System Live</span>
                  <Zap className="w-3 h-3 text-green-400" />
                </motion.div>
                <ThemeToggle />
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="relative z-10 min-h-screen flex flex-col">
        <section className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

              {/* Auth */}
              <motion.div
                className="order-2 lg:order-1 flex justify-center"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }}
              >
                <AuthFlow />
              </motion.div>

              {/* Mascot */}
              {!isAuthenticated && (
                <motion.div
                  className="order-1 lg:order-2 hidden lg:flex items-center justify-center min-h-[400px]"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.35 }}
                >
                  <AnimatedMascot isPatternMode={isPatternMode} />
                </motion.div>
              )}

            </div>
          </div>
        </section>
        <Footer />
      </main>

      <Toaster position="top-center" theme="dark" richColors />
    </div>
  );
}

export default App;
