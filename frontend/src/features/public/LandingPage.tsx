import { useRef, useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useInView,
} from 'framer-motion';
import { Box, Container, Typography, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import { useGetInternshipsQuery } from '../../api/internshipApi';

// Always-dark color palette — the landing page is always cinematic dark
const C = {
  bg: '#040810',
  bg2: '#070d1c',
  border: 'rgba(255,255,255,0.07)',
  borderHi: 'rgba(255,255,255,0.15)',
  text: '#EEF2FF',
  muted: 'rgba(238,242,255,0.58)',
  dim: 'rgba(238,242,255,0.3)',
  accent: '#3D63F8',
  accentLt: '#7B9BFF',
  gradient: 'linear-gradient(135deg, #3D63F8 0%, #8B5CF6 100%)',
  gradientHero: 'linear-gradient(135deg, #7B9BFF 0%, #A78BFA 100%)',
  glow: 'rgba(61,99,248,0.3)',
};

// ─── Cursor glow ─────────────────────────────────────────────────────────────
function CursorGlow() {
  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const sx = useSpring(mx, { damping: 28, stiffness: 220 });
  const sy = useSpring(my, { damping: 28, stiffness: 220 });

  useEffect(() => {
    const fn = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener('mousemove', fn);
    return () => window.removeEventListener('mousemove', fn);
  }, [mx, my]);

  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0,
        pointerEvents: 'none', zIndex: 9998,
        x: sx, y: sy,
        marginLeft: -280, marginTop: -280,
        width: 560, height: 560, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(61,99,248,0.09) 0%, transparent 60%)',
      }}
    />
  );
}

// ─── Magnetic wrapper ─────────────────────────────────────────────────────────
function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { damping: 18, stiffness: 280 });
  const sy = useSpring(y, { damping: 18, stiffness: 280 });

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - r.left - r.width / 2) * 0.22);
        y.set((e.clientY - r.top - r.height / 2) * 0.22);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

// ─── Scroll-reveal wrapper ────────────────────────────────────────────────────
function Reveal({ children, delay = 0, distance = 36 }: {
  children: React.ReactNode; delay?: number; distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-56px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: distance }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── 3D tilt card ─────────────────────────────────────────────────────────────
function TiltCard({ children, strength = 12 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { damping: 26, stiffness: 340 });
  const sry = useSpring(ry, { damping: 26, stiffness: 340 });

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d', perspective: 900, height: '100%' }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * strength);
        ry.set(((e.clientX - r.left) / r.width - 0.5) * strength);
      }}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated count-up ────────────────────────────────────────────────────────
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 1800;
    const tick = 16;
    const steps = dur / tick;
    const inc = to / steps;
    let cur = 0;
    const id = setInterval(() => {
      cur += inc;
      if (cur >= to) { setN(to); clearInterval(id); }
      else setN(Math.floor(cur));
    }, tick);
    return () => clearInterval(id);
  }, [inView, to]);

  const display = n >= 1000 ? `${Math.floor(n / 1000)}K` : `${n}`;
  return <span ref={ref}>{display}{suffix}</span>;
}

// ─── Floating hero card ───────────────────────────────────────────────────────
function HeroCard({ title, company, stipend, type, skills }: {
  title: string; company: string; stipend: string; type: string; skills: string[];
}) {
  const tc = type === 'Remote' ? '#10B981' : type === 'Hybrid' ? '#F59E0B' : C.accentLt;
  const tb = type === 'Remote' ? 'rgba(16,185,129,0.14)' : type === 'Hybrid' ? 'rgba(245,158,11,0.14)' : 'rgba(61,99,248,0.14)';
  return (
    <Box sx={{
      width: 218, p: 2, borderRadius: '16px',
      background: 'rgba(7,13,28,0.9)',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(24px)',
      boxShadow: '0 32px 72px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
        <Box sx={{
          width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
          background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '0.875rem', color: 'white',
        }}>
          {company[0]}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: C.text, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: C.muted }}>{company}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
        {skills.map((s) => (
          <Box key={s} sx={{ px: 0.875, py: 0.2, borderRadius: '5px', background: 'rgba(255,255,255,0.07)', fontSize: '0.67rem', color: C.muted }}>
            {s}
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', color: C.text }}>
          {stipend}
          <Typography component="span" sx={{ fontSize: '0.7rem', color: C.dim, fontWeight: 400 }}>/mo</Typography>
        </Typography>
        <Box sx={{ px: 0.9, py: 0.25, borderRadius: '5px', background: tb, color: tc, fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {type}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Mock internships fallback ────────────────────────────────────────────────
const MOCK_JOBS: any[] = [
  { id: 'm1', title: 'Frontend Engineer', company: { name: 'Razorpay' }, type: 'remote', location: 'Remote', skills: ['React', 'TypeScript', 'CSS'], stipend: { min: 35000 }, durationWeeks: 12 },
  { id: 'm2', title: 'ML Researcher', company: { name: 'Google' }, type: 'hybrid', location: 'Bangalore', skills: ['Python', 'PyTorch', 'NLP'], stipend: { min: 55000 }, durationWeeks: 16 },
  { id: 'm3', title: 'Product Designer', company: { name: 'Figma' }, type: 'remote', location: 'Remote', skills: ['Figma', 'UX Research', 'Prototyping'], stipend: { min: 28000 }, durationWeeks: 10 },
  { id: 'm4', title: 'DevOps Engineer', company: { name: 'CRED' }, type: 'remote', location: 'Remote', skills: ['AWS', 'Docker', 'Kubernetes'], stipend: { min: 45000 }, durationWeeks: 14 },
  { id: 'm5', title: 'Data Analyst', company: { name: 'Swiggy' }, type: 'hybrid', location: 'Bangalore', skills: ['Python', 'SQL', 'dbt'], stipend: { min: 22000 }, durationWeeks: 8 },
  { id: 'm6', title: 'Backend Engineer', company: { name: 'Zepto' }, type: 'onsite', location: 'Mumbai', skills: ['Go', 'PostgreSQL', 'Redis'], stipend: { min: 40000 }, durationWeeks: 12 },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const heroContentY = useTransform(scrollY, [0, 650], [0, -100]);
  const heroContentOp = useTransform(scrollY, [0, 480], [1, 0]);
  const fc1Y = useTransform(scrollY, [0, 650], [0, -75]);
  const fc2Y = useTransform(scrollY, [0, 650], [0, -35]);
  const fc3Y = useTransform(scrollY, [0, 650], [0, -105]);

  const { data } = useGetInternshipsQuery({ limit: 6 });
  const apiJobs = (data?.data || []) as any[];
  const jobs = apiJobs.length > 0 ? apiJobs : MOCK_JOBS;

  return (
    <Box sx={{ background: C.bg, color: C.text, overflowX: 'hidden' }}>
      <CursorGlow />

      {/* ════════════════════════════════ HERO ════════════════════════════ */}
      <Box
        ref={heroRef}
        sx={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}
      >
        {/* Gradient mesh */}
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: `
            radial-gradient(ellipse 80% 65% at 10% 55%, rgba(61,99,248,0.16) 0%, transparent 55%),
            radial-gradient(ellipse 55% 48% at 88% 12%, rgba(139,92,246,0.13) 0%, transparent 52%),
            radial-gradient(ellipse 45% 45% at 55% 90%, rgba(61,99,248,0.07) 0%, transparent 52%),
            ${C.bg}
          `,
        }} />

        {/* Dot grid */}
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 100% 80% at 50% 0%, black 20%, transparent 90%)',
        }} />

        {/* Floating cards — lg screens only */}
        <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          <motion.div style={{ position: 'absolute', top: '12%', right: '6%', y: fc1Y }}>
            <motion.div initial={{ opacity: 0, x: 70, scale: 0.88 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 1.2, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}>
              <motion.div animate={{ y: [0, -16, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}>
                <HeroCard title="React Engineer" company="Stripe" stipend="₹35K" type="Remote" skills={['React', 'TypeScript']} />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div style={{ position: 'absolute', bottom: '20%', right: '4%', y: fc2Y }}>
            <motion.div initial={{ opacity: 0, x: 60, scale: 0.88 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 1.2, delay: 1.15, ease: [0.22, 1, 0.36, 1] }}>
              <motion.div animate={{ y: [0, 14, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}>
                <HeroCard title="ML Engineer" company="OpenAI" stipend="₹50K" type="Hybrid" skills={['Python', 'PyTorch']} />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div style={{ position: 'absolute', top: '53%', right: '21%', y: fc3Y }}>
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.88 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.2, delay: 1.35, ease: [0.22, 1, 0.36, 1] }}>
              <motion.div animate={{ y: [0, -11, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 3.5 }}>
                <HeroCard title="Product Designer" company="Figma" stipend="₹28K" type="Remote" skills={['Figma', 'UX']} />
              </motion.div>
            </motion.div>
          </motion.div>
        </Box>

        {/* Hero text content */}
        <motion.div style={{ y: heroContentY, opacity: heroContentOp, position: 'relative', zIndex: 2, width: '100%' }}>
          <Container maxWidth="lg" sx={{ py: { xs: 14, md: 16 } }}>
            <Box sx={{ maxWidth: { xs: '100%', md: '58%', lg: '54%' } }}>

              {/* Pulsing badge */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 1,
                  px: 1.75, py: 0.875, borderRadius: '100px', mb: 3.5,
                  background: 'rgba(61,99,248,0.1)', border: '1px solid rgba(61,99,248,0.22)',
                }}>
                  <motion.div
                    animate={{ scale: [1, 1.45, 1], opacity: [1, 0.55, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: 7, height: 7, borderRadius: '50%', background: C.accentLt, boxShadow: `0 0 10px ${C.accentLt}`, flexShrink: 0 }}
                  />
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: C.accentLt, letterSpacing: '0.025em' }}>
                    Premium Internship Platform
                  </Typography>
                </Box>
              </motion.div>

              {/* Masked line-by-line headline */}
              {['Find Internships', 'That Match', 'Your Future.'].map((line, i) => (
                <Box key={i} sx={{ overflow: 'hidden', lineHeight: 1 }}>
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.88, delay: 0.32 + i * 0.13, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Typography sx={{
                      display: 'block',
                      fontSize: { xs: '2.75rem', sm: '3.75rem', md: '4.5rem', lg: '5.25rem' },
                      fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.045em', pb: '0.06em',
                      ...(i === 2 ? {
                        background: C.gradientHero,
                        WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                      } : { color: C.text }),
                    }}>
                      {line}
                    </Typography>
                  </motion.div>
                </Box>
              ))}

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.92 }}>
                <Typography sx={{ fontSize: { xs: '1rem', md: '1.125rem' }, color: C.muted, mt: 3, mb: 4, maxWidth: 450, lineHeight: 1.78 }}>
                  Connect with 500+ verified companies. Apply in under 60 seconds. Track progress and earn certificates.
                </Typography>
              </motion.div>

              {/* Search */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.0 }}>
                <Box
                  component="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    navigate(q ? `/internships?q=${encodeURIComponent(q)}` : '/internships');
                  }}
                  sx={{
                    display: 'flex', gap: 1, mb: 3, maxWidth: 500,
                    p: '6px', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    transition: 'border-color 0.25s',
                    '&:focus-within': { borderColor: 'rgba(61,99,248,0.5)', background: 'rgba(61,99,248,0.04)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 1, pl: 1.5 }}>
                    <SearchIcon sx={{ color: C.dim, fontSize: 18, flexShrink: 0 }} />
                    <Box
                      component="input"
                      value={q}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
                      placeholder="Role, skill, company, or location…"
                      sx={{
                        border: 'none', outline: 'none', background: 'transparent',
                        color: C.text, fontSize: '0.9375rem', width: '100%', fontFamily: 'inherit',
                        '&::placeholder': { color: C.dim },
                      }}
                    />
                  </Box>
                  <Box
                    component="button"
                    type="submit"
                    sx={{
                      px: 2.5, py: 1.25, borderRadius: '10px', border: 'none',
                      background: C.gradient, color: 'white',
                      fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                      transition: 'opacity 0.18s', fontFamily: 'inherit', flexShrink: 0,
                      '&:hover': { opacity: 0.88 },
                    }}
                  >
                    Search
                  </Box>
                </Box>
              </motion.div>

              {/* CTA buttons */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.06 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 4 }}>
                  <Magnetic>
                    <Box component={RouterLink} to="/internships" sx={{
                      display: 'inline-flex', alignItems: 'center', gap: 1,
                      px: 3, py: 1.5, borderRadius: '12px', textDecoration: 'none',
                      background: C.gradient, color: 'white',
                      fontWeight: 700, fontSize: '0.9375rem',
                      boxShadow: `0 8px 36px ${C.glow}`,
                      transition: 'box-shadow 0.2s, transform 0.2s',
                      '&:hover': { boxShadow: `0 14px 48px ${C.glow}`, transform: 'translateY(-1px)' },
                    }}>
                      Explore internships <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </Box>
                  </Magnetic>
                  <Magnetic>
                    <Box component={RouterLink} to="/register" sx={{
                      display: 'inline-flex', alignItems: 'center', gap: 1,
                      px: 3, py: 1.5, borderRadius: '12px', textDecoration: 'none',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.13)',
                      color: C.text, fontWeight: 600, fontSize: '0.9375rem',
                      transition: 'all 0.2s',
                      '&:hover': { background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.22)' },
                    }}>
                      Post internship
                    </Box>
                  </Magnetic>
                </Stack>
              </motion.div>

              {/* Popular tags */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.22 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1} alignItems="center">
                  <Typography sx={{ fontSize: '0.8rem', color: C.dim }}>Popular:</Typography>
                  {['React', 'Machine Learning', 'Finance', 'Design', 'DevOps'].map((tag) => (
                    <Box key={tag} component="button" onClick={() => navigate(`/internships?q=${tag}`)} sx={{
                      px: 1.5, py: 0.5, borderRadius: '100px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.04)',
                      color: C.muted, fontSize: '0.8rem', cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.2s',
                      '&:hover': { background: 'rgba(61,99,248,0.13)', borderColor: 'rgba(61,99,248,0.32)', color: C.accentLt },
                    }}>
                      {tag}
                    </Box>
                  ))}
                </Stack>
              </motion.div>
            </Box>
          </Container>
        </motion.div>

        {/* Scroll mouse indicator */}
        <Box sx={{ position: 'absolute', bottom: 38, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
              <Box sx={{
                width: 26, height: 44, borderRadius: '13px',
                border: '1.5px solid rgba(255,255,255,0.18)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center', pt: '8px',
              }}>
                <motion.div
                  animate={{ y: [0, 14, 0], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: 4, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.38)' }}
                />
              </Box>
            </motion.div>
          </motion.div>
        </Box>
      </Box>

      {/* ════════════════════════════════ STATS ═══════════════════════════ */}
      <Box sx={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, py: { xs: 7, md: 9 }, background: C.bg2 }}>
        <Container maxWidth="lg">
          <Reveal>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 5, sm: 8, md: 14 }, flexWrap: 'wrap' }}>
              {[
                { to: 50000, s: '+', label: 'Students placed' },
                { to: 500, s: '+', label: 'Partner companies' },
                { to: 95, s: '%', label: 'Placement rate' },
                { to: 60, s: 's', label: 'Avg. apply time' },
              ].map(({ to, s, label }) => (
                <Box key={label} sx={{ textAlign: 'center' }}>
                  <Typography sx={{
                    fontSize: { xs: '2.25rem', md: '3.25rem' }, fontWeight: 800, letterSpacing: '-0.045em',
                    background: C.gradientHero, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                    lineHeight: 1,
                  }}>
                    <CountUp to={to} suffix={s} />
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: C.muted, mt: 0.75 }}>{label}</Typography>
                </Box>
              ))}
            </Box>
          </Reveal>
        </Container>
      </Box>

      {/* ════════════════════════════ FEATURES ════════════════════════════ */}
      <Box sx={{ py: { xs: 13, md: 20 }, background: C.bg }}>
        <Container maxWidth="lg">
          <Reveal>
            <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: C.accentLt, letterSpacing: '0.13em', textTransform: 'uppercase', mb: 2 }}>
                Why IMP
              </Typography>
              <Typography sx={{ fontSize: { xs: '1.875rem', md: '3rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: C.text, lineHeight: 1.1 }}>
                Everything you need to
                <Box component="span" sx={{ display: { xs: 'inline', md: 'block' }, background: C.gradientHero, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                  {' '}land your dream internship
                </Box>
              </Typography>
            </Box>
          </Reveal>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }, gap: 2 }}>
            {[
              { icon: '✦', title: 'AI-Powered Matching', desc: 'Personalized recommendations based on your skills, projects, and career goals — not just job title keywords.', tint: 'rgba(61,99,248,0.14)' },
              { icon: '◈', title: 'Verified Companies', desc: 'Every company is vetted before listing. No spam, no ghost listings — only legitimate, quality opportunities.', tint: 'rgba(139,92,246,0.13)' },
              { icon: '⚡', title: 'Apply in 60 Seconds', desc: 'Your profile does the heavy lifting. One-click apply — no repetitive forms, no copy-paste.', tint: 'rgba(236,72,153,0.12)' },
              { icon: '◎', title: 'Real-Time Progress', desc: 'Live task board, mentor feedback, and milestone tracking. Never miss a deadline or update.', tint: 'rgba(16,185,129,0.12)' },
              { icon: '◇', title: 'Earn Certificates', desc: 'Complete internships and receive verified certificates that employers recognize and trust.', tint: 'rgba(245,158,11,0.12)' },
              { icon: '❋', title: 'Career Support', desc: "Mentorship, resume reviews, and mock interviews from professionals who've been where you want to go.", tint: 'rgba(99,102,241,0.13)' },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.07}>
                <TiltCard strength={10}>
                  <Box sx={{
                    p: 3.5, borderRadius: '20px', height: '100%',
                    background: f.tint, border: `1px solid ${C.border}`,
                    transition: 'border-color 0.3s',
                    '&:hover': { borderColor: C.borderHi },
                    cursor: 'default',
                  }}>
                    <Typography sx={{ fontSize: '1.55rem', mb: 2.5, display: 'block' }}>{f.icon}</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', color: C.text, mb: 1.5, letterSpacing: '-0.02em' }}>{f.title}</Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: C.muted, lineHeight: 1.74 }}>{f.desc}</Typography>
                  </Box>
                </TiltCard>
              </Reveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ══════════════════════ LIVE INTERNSHIPS ══════════════════════════ */}
      <Box sx={{ py: { xs: 13, md: 20 }, background: C.bg2 }}>
        <Container maxWidth="lg">
          <Reveal>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: { xs: 7, md: 10 }, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: C.accentLt, letterSpacing: '0.13em', textTransform: 'uppercase', mb: 1.5 }}>
                  Live Opportunities
                </Typography>
                <Typography sx={{ fontSize: { xs: '1.75rem', md: '2.75rem' }, fontWeight: 800, letterSpacing: '-0.045em', color: C.text }}>
                  Featured internships
                </Typography>
              </Box>
              <Box component={RouterLink} to="/internships" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: C.accentLt, fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none', transition: 'gap 0.22s', '&:hover': { gap: 1.5 } }}>
                View all <ArrowForwardIcon sx={{ fontSize: 15 }} />
              </Box>
            </Box>
          </Reveal>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 2 }}>
            {jobs.slice(0, 6).map((job: any, i: number) => {
              const typeBg = job.type === 'remote' ? 'rgba(16,185,129,0.11)' : job.type === 'hybrid' ? 'rgba(245,158,11,0.11)' : 'rgba(61,99,248,0.11)';
              const typeFg = job.type === 'remote' ? '#10B981' : job.type === 'hybrid' ? '#F59E0B' : C.accentLt;
              return (
                <Reveal key={job.id || i} delay={i * 0.055}>
                  <TiltCard strength={9}>
                    <Box
                      component={RouterLink}
                      to={`/internships/${job.id}`}
                      sx={{
                        display: 'block', p: { xs: 2.5, md: 3 }, borderRadius: '18px',
                        background: 'rgba(255,255,255,0.025)',
                        border: `1px solid ${C.border}`, textDecoration: 'none', height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(61,99,248,0.32)', boxShadow: '0 28px 72px rgba(0,0,0,0.35)' },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                        <Box sx={{
                          width: 46, height: 46, borderRadius: '13px', flexShrink: 0,
                          background: 'linear-gradient(135deg, rgba(61,99,248,0.22), rgba(139,92,246,0.1))',
                          border: '1px solid rgba(61,99,248,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '1.0625rem', color: C.accentLt,
                        }}>
                          {(job.company?.name || '?')[0].toUpperCase()}
                        </Box>
                        <Box sx={{ px: 1.1, py: 0.38, borderRadius: '7px', background: typeBg, color: typeFg, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {job.type}
                        </Box>
                      </Box>

                      <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', color: C.text, mb: 0.5, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {job.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: C.muted, mb: 2.5 }}>{job.company?.name}</Typography>

                      <Stack direction="row" spacing={2} sx={{ mb: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOnOutlinedIcon sx={{ fontSize: 13, color: C.dim }} />
                          <Typography sx={{ fontSize: '0.8rem', color: C.muted }}>{job.location}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: C.dim }} />
                          <Typography sx={{ fontSize: '0.8rem', color: C.muted }}>{job.durationWeeks}w</Typography>
                        </Box>
                      </Stack>

                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 3 }}>
                        {(job.skills || []).slice(0, 3).map((s: string) => (
                          <Box key={s} sx={{ px: 1.1, py: 0.3, borderRadius: '6px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, fontSize: '0.72rem', color: C.muted }}>
                            {s}
                          </Box>
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2.5, borderTop: `1px solid ${C.border}` }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.0625rem', color: C.text, letterSpacing: '-0.03em' }}>
                          ₹{job.stipend?.min?.toLocaleString()}
                          <Typography component="span" sx={{ fontSize: '0.78rem', color: C.dim, fontWeight: 400 }}>/mo</Typography>
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: C.accentLt, fontSize: '0.875rem', fontWeight: 600 }}>
                          Apply <ArrowForwardIcon sx={{ fontSize: 14 }} />
                        </Box>
                      </Box>
                    </Box>
                  </TiltCard>
                </Reveal>
              );
            })}
          </Box>

          <Reveal delay={0.28}>
            <Box sx={{ textAlign: 'center', mt: 7 }}>
              <Magnetic>
                <Box component={RouterLink} to="/internships" sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 1,
                  px: 3, py: 1.5, borderRadius: '12px', textDecoration: 'none',
                  background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`,
                  color: C.text, fontWeight: 600, fontSize: '0.9375rem',
                  transition: 'all 0.2s',
                  '&:hover': { background: 'rgba(61,99,248,0.1)', borderColor: 'rgba(61,99,248,0.3)' },
                }}>
                  Browse all internships <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Box>
              </Magnetic>
            </Box>
          </Reveal>
        </Container>
      </Box>

      {/* ═══════════════════════ HOW IT WORKS ═════════════════════════════ */}
      <Box sx={{ py: { xs: 13, md: 20 }, background: C.bg }}>
        <Container maxWidth="md">
          <Reveal>
            <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: C.accentLt, letterSpacing: '0.13em', textTransform: 'uppercase', mb: 2 }}>
                The Process
              </Typography>
              <Typography sx={{ fontSize: { xs: '1.875rem', md: '3rem' }, fontWeight: 800, letterSpacing: '-0.04em', color: C.text }}>
                From sign-up to certified
              </Typography>
            </Box>
          </Reveal>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { n: '01', title: 'Create your profile', desc: 'Add your skills, education, and projects in 5 minutes. Your profile is the single source of truth for every application.' },
              { n: '02', title: 'Discover & apply', desc: 'Browse AI-matched internships or search by role, skill, or company. One-click apply with your saved profile.' },
              { n: '03', title: 'Intern & grow', desc: 'Track tasks on a live board, receive mentor feedback, and hit milestones. Your progress is visible every step.' },
              { n: '04', title: 'Get certified', desc: 'Complete the internship and earn a verified certificate — credible proof of real-world experience for employers.' },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <Box sx={{
                  display: 'flex', gap: 3, alignItems: 'flex-start', p: 3.5, borderRadius: '18px',
                  background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`,
                  transition: 'all 0.3s',
                  '&:hover': { background: 'rgba(61,99,248,0.055)', borderColor: 'rgba(61,99,248,0.22)' },
                }}>
                  <Box sx={{
                    width: 52, height: 52, borderRadius: '14px', flexShrink: 0,
                    background: C.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.875rem', color: 'white', letterSpacing: '0.02em',
                    boxShadow: `0 10px 28px ${C.glow}`,
                  }}>
                    {s.n}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', color: C.text, mb: 0.75, letterSpacing: '-0.02em' }}>
                      {s.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: C.muted, lineHeight: 1.74 }}>{s.desc}</Typography>
                  </Box>
                </Box>
              </Reveal>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ═══════════════════════════════ CTA ══════════════════════════════ */}
      <Box sx={{ py: { xs: 16, md: 24 }, position: 'relative', overflow: 'hidden', background: C.bg2 }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 60% at 50% 50%, rgba(61,99,248,0.13), transparent 70%)' }} />
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Reveal>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.25rem' }, fontWeight: 800,
                letterSpacing: '-0.045em', color: C.text, mb: 2, lineHeight: 1.06,
              }}>
                Ready to launch
                <Box component="span" sx={{ display: 'block', background: C.gradientHero, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                  your career?
                </Box>
              </Typography>
              <Typography sx={{ fontSize: '1.0625rem', color: C.muted, mb: 6, lineHeight: 1.75 }}>
                Join 50,000+ students who found their first role through IMP. It's completely free to get started.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
                <Magnetic>
                  <Box component={RouterLink} to="/register" sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 1,
                    px: 3.5, py: 1.625, borderRadius: '12px', textDecoration: 'none',
                    background: C.gradient, color: 'white', fontWeight: 700, fontSize: '1rem',
                    boxShadow: `0 10px 44px ${C.glow}`,
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    '&:hover': { boxShadow: `0 18px 60px ${C.glow}`, transform: 'translateY(-2px)' },
                  }}>
                    Get started free <ArrowForwardIcon sx={{ fontSize: 17 }} />
                  </Box>
                </Magnetic>
                <Magnetic>
                  <Box component={RouterLink} to="/internships" sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 1,
                    px: 3.5, py: 1.5, borderRadius: '12px', textDecoration: 'none',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.13)',
                    color: C.text, fontWeight: 600, fontSize: '1rem',
                    transition: 'all 0.2s',
                    '&:hover': { background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.22)' },
                  }}>
                    Browse internships
                  </Box>
                </Magnetic>
              </Stack>
            </Box>
          </Reveal>
        </Container>
      </Box>

      {/* ══════════════════════════ FOOTER ════════════════════════════════ */}
      <Box component="footer" sx={{ borderTop: `1px solid ${C.border}`, py: { xs: 5, md: 7 }, background: C.bg }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.0625rem', color: C.text, letterSpacing: '-0.025em' }}>
                Internship Platform
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: C.dim, mt: 0.5 }}>
                © 2026 IMP. All rights reserved.
              </Typography>
            </Box>
            <Stack direction="row" spacing={{ xs: 2.5, md: 4 }} flexWrap="wrap">
              {([['About', '/about'], ['Internships', '/internships'], ['Contact', '/contact'], ['Log in', '/login'], ['Register', '/register']] as [string, string][]).map(([label, to]) => (
                <Box key={label} component={RouterLink} to={to} sx={{ fontSize: '0.875rem', color: C.muted, textDecoration: 'none', transition: 'color 0.2s', '&:hover': { color: C.text } }}>
                  {label}
                </Box>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
