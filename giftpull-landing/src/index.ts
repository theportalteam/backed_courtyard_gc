export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/waitlist" && request.method === "POST") {
      return handleWaitlist(request);
    }

    return new Response(landingHTML(), {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  },
};

async function handleWaitlist(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email;
    if (!email || !email.includes("@")) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }
    // In production, store in KV or D1. For now, just acknowledge.
    console.log(`Waitlist signup: ${email}`);
    return Response.json({ success: true, message: "You're on the list!" });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}

function landingHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GiftPull — The Gamified Gift Card Marketplace</title>
  <meta name="description" content="Buy, pull, trade. The most exciting way to get gift cards. Gacha packs with positive EV, instant buyback, and a thriving P2P marketplace." />
  <meta property="og:title" content="GiftPull — The Gamified Gift Card Marketplace" />
  <meta property="og:description" content="Buy, pull, trade. Gacha packs with positive EV, instant buyback, and a thriving P2P marketplace." />
  <meta property="og:type" content="website" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg: #0A0E1A;
      --surface: #1A1F2E;
      --border: #2A2F3E;
      --primary: #3B82F6;
      --primary-glow: rgba(59, 130, 246, 0.3);
      --success: #10B981;
      --warning: #F59E0B;
      --epic: #8B5CF6;
      --danger: #EF4444;
      --text: #F9FAFB;
      --text-secondary: #9CA3AF;
      --text-muted: #6B7280;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      overflow-x: hidden;
    }

    /* ─── Nav ─── */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      backdrop-filter: blur(20px);
      background: rgba(10, 14, 26, 0.85);
      border-bottom: 1px solid var(--border);
    }
    .nav-inner {
      max-width: 1200px; margin: 0 auto;
      padding: 0 24px; height: 64px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .logo {
      font-size: 1.5rem; font-weight: 900;
      background: linear-gradient(135deg, var(--primary), var(--epic), var(--warning));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .nav-links { display: flex; gap: 8px; align-items: center; }
    .nav-links a {
      color: var(--text-secondary); text-decoration: none;
      padding: 8px 16px; border-radius: 8px; font-size: 0.875rem; font-weight: 500;
      transition: all 0.2s;
    }
    .nav-links a:hover { color: var(--text); background: rgba(255,255,255,0.05); }
    .btn-nav {
      background: var(--primary); color: white !important;
      -webkit-text-fill-color: white !important;
      padding: 8px 20px !important; border-radius: 8px; font-weight: 600 !important;
    }
    .btn-nav:hover { background: #2563EB !important; }

    /* ─── Hero ─── */
    .hero {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      text-align: center; padding: 120px 24px 80px; position: relative;
    }
    .hero::before {
      content: ''; position: absolute; inset: 0;
      background:
        radial-gradient(circle at 30% 40%, rgba(59,130,246,0.15), transparent 50%),
        radial-gradient(circle at 70% 60%, rgba(139,92,246,0.1), transparent 50%),
        radial-gradient(circle at 50% 80%, rgba(245,158,11,0.08), transparent 40%);
      pointer-events: none;
    }
    .hero-content { position: relative; max-width: 800px; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 6px 16px; border-radius: 100px; font-size: 0.8rem; font-weight: 600;
      background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3);
      color: var(--primary); margin-bottom: 24px; letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .hero-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    h1 {
      font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900;
      line-height: 1.1; margin-bottom: 24px;
      background: linear-gradient(to right, var(--text), var(--text-secondary));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    h1 span {
      background: linear-gradient(135deg, var(--primary), var(--epic));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .hero-sub {
      font-size: 1.2rem; color: var(--text-secondary);
      max-width: 600px; margin: 0 auto 40px;
    }
    .hero-cta { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 32px; border-radius: 12px; font-size: 1rem; font-weight: 700;
      text-decoration: none; border: none; cursor: pointer; transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--primary), #2563EB);
      color: white; box-shadow: 0 4px 24px var(--primary-glow);
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px var(--primary-glow); }
    .btn-secondary {
      background: var(--surface); color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover { border-color: var(--primary); background: rgba(59,130,246,0.1); }

    /* ─── Stats ─── */
    .stats {
      display: flex; justify-content: center; gap: 48px; margin-top: 64px;
      flex-wrap: wrap;
    }
    .stat { text-align: center; }
    .stat-value {
      font-size: 2rem; font-weight: 800;
      background: linear-gradient(135deg, var(--warning), var(--danger));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .stat-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }

    /* ─── Features ─── */
    .features { padding: 120px 24px; }
    .section-header { text-align: center; margin-bottom: 64px; }
    .section-header h2 {
      font-size: 2.5rem; font-weight: 800; margin-bottom: 16px;
      -webkit-text-fill-color: var(--text);
    }
    .section-header p { color: var(--text-secondary); font-size: 1.1rem; max-width: 600px; margin: 0 auto; }
    .features-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px; max-width: 1200px; margin: 0 auto;
    }
    .feature-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; padding: 32px; transition: all 0.3s;
    }
    .feature-card:hover { border-color: var(--primary); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
    .feature-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; margin-bottom: 20px;
    }
    .feature-card h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 12px; }
    .feature-card p { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.7; }

    /* ─── How It Works ─── */
    .how-it-works { padding: 120px 24px; background: var(--surface); }
    .steps {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 32px; max-width: 1000px; margin: 0 auto;
    }
    .step { text-align: center; padding: 24px; }
    .step-number {
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--epic));
      display: flex; align-items: center; justify-content: center;
      font-size: 1.25rem; font-weight: 800; margin: 0 auto 20px;
    }
    .step h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
    .step p { color: var(--text-secondary); font-size: 0.9rem; }

    /* ─── Tiers ─── */
    .tiers { padding: 120px 24px; }
    .tiers-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px; max-width: 1000px; margin: 0 auto;
    }
    .tier-card {
      background: var(--surface); border-radius: 16px; padding: 32px;
      text-align: center; position: relative; overflow: hidden;
      border: 2px solid var(--border); transition: all 0.3s;
    }
    .tier-card:hover { transform: translateY(-4px); }
    .tier-common { border-color: var(--success); }
    .tier-common:hover { box-shadow: 0 0 40px rgba(16,185,129,0.2); }
    .tier-rare { border-color: var(--primary); }
    .tier-rare:hover { box-shadow: 0 0 40px rgba(59,130,246,0.2); }
    .tier-epic { border-color: var(--epic); }
    .tier-epic:hover { box-shadow: 0 0 40px rgba(139,92,246,0.2); }
    .tier-name { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px; }
    .tier-price { font-size: 2.5rem; font-weight: 900; margin-bottom: 4px; }
    .tier-ev { font-size: 0.85rem; font-weight: 600; margin-bottom: 20px; }
    .tier-odds { list-style: none; text-align: left; }
    .tier-odds li {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
      font-size: 0.85rem; color: var(--text-secondary);
    }
    .tier-odds li:last-child { border-bottom: none; }
    .odds-badge { font-weight: 600; }

    /* ─── Waitlist ─── */
    .waitlist {
      padding: 120px 24px; text-align: center;
      background: linear-gradient(180deg, var(--bg), var(--surface));
    }
    .waitlist h2 { font-size: 2.5rem; font-weight: 800; margin-bottom: 16px; -webkit-text-fill-color: var(--text); }
    .waitlist p { color: var(--text-secondary); margin-bottom: 32px; font-size: 1.1rem; }
    .waitlist-form {
      display: flex; gap: 12px; max-width: 480px; margin: 0 auto;
      flex-wrap: wrap; justify-content: center;
    }
    .waitlist-form input {
      flex: 1; min-width: 240px; padding: 14px 20px; border-radius: 12px;
      background: var(--bg); border: 1px solid var(--border);
      color: var(--text); font-size: 1rem; outline: none;
      font-family: inherit;
    }
    .waitlist-form input:focus { border-color: var(--primary); }
    .waitlist-form button { white-space: nowrap; }
    .waitlist-msg { margin-top: 16px; font-size: 0.9rem; }
    .waitlist-msg.success { color: var(--success); }
    .waitlist-msg.error { color: var(--danger); }

    /* ─── Footer ─── */
    footer {
      padding: 48px 24px; text-align: center;
      border-top: 1px solid var(--border);
    }
    footer p { color: var(--text-muted); font-size: 0.85rem; }
    footer a { color: var(--primary); text-decoration: none; }
    footer a:hover { text-decoration: underline; }

    /* ─── Mobile ─── */
    @media (max-width: 768px) {
      .nav-links a:not(.btn-nav) { display: none; }
      .stats { gap: 24px; }
      .stat-value { font-size: 1.5rem; }
      .hero-cta { flex-direction: column; align-items: center; }
      .btn { width: 100%; max-width: 300px; justify-content: center; }
    }
  </style>
</head>
<body>

  <!-- Nav -->
  <nav>
    <div class="nav-inner">
      <div class="logo">GiftPull</div>
      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#packs">Packs</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#waitlist" class="btn-nav">Join Waitlist</a>
      </div>
    </div>
  </nav>

  <!-- Hero -->
  <section class="hero">
    <div class="hero-content">
      <div class="hero-badge"><span class="dot"></span> Coming Soon</div>
      <h1>The Most Exciting Way<br/>to Get <span>Gift Cards</span></h1>
      <p class="hero-sub">
        Buy at a discount. Pull from gacha packs with positive EV.
        Trade on our P2P marketplace. Every purchase earns points toward the leaderboard.
      </p>
      <div class="hero-cta">
        <a href="#waitlist" class="btn btn-primary">Join the Waitlist</a>
        <a href="#features" class="btn btn-secondary">Learn More</a>
      </div>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">+7-15%</div>
          <div class="stat-label">Positive EV</div>
        </div>
        <div class="stat">
          <div class="stat-value">95%</div>
          <div class="stat-label">Instant Buyback</div>
        </div>
        <div class="stat">
          <div class="stat-value">10+</div>
          <div class="stat-label">Top Brands</div>
        </div>
        <div class="stat">
          <div class="stat-value">3</div>
          <div class="stat-label">Pack Tiers</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section class="features" id="features">
    <div class="section-header">
      <h2>Three Ways to Win</h2>
      <p>A complete gift card ecosystem — buy, pull, or trade. Every path gives you more value than traditional gift card stores.</p>
    </div>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon" style="background: rgba(16,185,129,0.15); color: var(--success);">&#128722;</div>
        <h3>Storefront</h3>
        <p>Browse gift cards from Xbox, Steam, PlayStation, Amazon, and more. Buy at face value or grab discounted cards. Bundles save you up to 20%.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background: rgba(139,92,246,0.15); color: var(--epic);">&#127183;</div>
        <h3>Gacha Packs</h3>
        <p>Pull randomized gift card packs with transparent odds and guaranteed positive expected value. Common, Rare, and Epic tiers. Every pull is a thrill.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background: rgba(59,130,246,0.15); color: var(--primary);">&#129309;</div>
        <h3>P2P Marketplace</h3>
        <p>List your cards or buy from other users at a discount. Verified sellers, escrow protection, and dispute resolution built in.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background: rgba(245,158,11,0.15); color: var(--warning);">&#11088;</div>
        <h3>Points & Leaderboard</h3>
        <p>Earn points on every purchase. Climb the weekly and monthly leaderboards for prizes. Top players win gift cards and massive point bonuses.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background: rgba(239,68,68,0.15); color: var(--danger);">&#128260;</div>
        <h3>95% Buyback</h3>
        <p>Don't like what you pulled? Sell it back instantly for 95% of face value in USDC. No haggling, no waiting. One click.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon" style="background: rgba(6,182,212,0.15); color: #06B6D4;">&#128176;</div>
        <h3>Stripe + USDC</h3>
        <p>Pay with credit card via Stripe or with USDC on Base. USDC payments earn 1.25x bonus points. Your choice, your advantage.</p>
      </div>
    </div>
  </section>

  <!-- How It Works -->
  <section class="how-it-works" id="how-it-works">
    <div class="section-header">
      <h2>How It Works</h2>
      <p>From signup to your first pull in under 2 minutes.</p>
    </div>
    <div class="steps">
      <div class="step">
        <div class="step-number">1</div>
        <h3>Sign Up</h3>
        <p>Create your account with email. No wallet needed to start.</p>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <h3>Choose Your Path</h3>
        <p>Buy cards from the storefront, pull gacha packs, or browse the marketplace.</p>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <h3>Pull & Reveal</h3>
        <p>Open packs with exciting animations. Every pull has positive EV.</p>
      </div>
      <div class="step">
        <div class="step-number">4</div>
        <h3>Keep, Sell, or Trade</h3>
        <p>Keep your card, buyback at 95%, or list it on the marketplace.</p>
      </div>
    </div>
  </section>

  <!-- Pack Tiers -->
  <section class="tiers" id="packs">
    <div class="section-header">
      <h2>Pack Tiers</h2>
      <p>Three tiers, transparent odds, guaranteed positive expected value.</p>
    </div>
    <div class="tiers-grid">
      <div class="tier-card tier-common">
        <div class="tier-name" style="color: var(--success);">Common</div>
        <div class="tier-price">$10</div>
        <div class="tier-ev" style="color: var(--success);">+7% EV</div>
        <ul class="tier-odds">
          <li><span>Common ($5)</span> <span class="odds-badge" style="color: var(--text-muted);">60%</span></li>
          <li><span>Uncommon ($10)</span> <span class="odds-badge" style="color: var(--success);">25%</span></li>
          <li><span>Rare ($15)</span> <span class="odds-badge" style="color: var(--primary);">10%</span></li>
          <li><span>Epic ($25)</span> <span class="odds-badge" style="color: var(--epic);">4%</span></li>
          <li><span>Legendary ($50)</span> <span class="odds-badge" style="color: var(--warning);">1%</span></li>
        </ul>
      </div>
      <div class="tier-card tier-rare">
        <div class="tier-name" style="color: var(--primary);">Rare</div>
        <div class="tier-price">$25</div>
        <div class="tier-ev" style="color: var(--primary);">+10% EV</div>
        <ul class="tier-odds">
          <li><span>Common ($10)</span> <span class="odds-badge" style="color: var(--text-muted);">40%</span></li>
          <li><span>Uncommon ($15)</span> <span class="odds-badge" style="color: var(--success);">30%</span></li>
          <li><span>Rare ($25)</span> <span class="odds-badge" style="color: var(--primary);">18%</span></li>
          <li><span>Epic ($50)</span> <span class="odds-badge" style="color: var(--epic);">9%</span></li>
          <li><span>Legendary ($100)</span> <span class="odds-badge" style="color: var(--warning);">3%</span></li>
        </ul>
      </div>
      <div class="tier-card tier-epic">
        <div class="tier-name" style="color: var(--epic);">Epic</div>
        <div class="tier-price">$75</div>
        <div class="tier-ev" style="color: var(--epic);">+15% EV</div>
        <ul class="tier-odds">
          <li><span>Common ($25)</span> <span class="odds-badge" style="color: var(--text-muted);">20%</span></li>
          <li><span>Uncommon ($50)</span> <span class="odds-badge" style="color: var(--success);">25%</span></li>
          <li><span>Rare ($75)</span> <span class="odds-badge" style="color: var(--primary);">25%</span></li>
          <li><span>Epic ($100)</span> <span class="odds-badge" style="color: var(--epic);">20%</span></li>
          <li><span>Legendary ($200)</span> <span class="odds-badge" style="color: var(--warning);">10%</span></li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Waitlist -->
  <section class="waitlist" id="waitlist">
    <h2>Get Early Access</h2>
    <p>Join the waitlist and be first to pull when we launch.</p>
    <form class="waitlist-form" id="waitlistForm">
      <input type="email" placeholder="Enter your email" required />
      <button type="submit" class="btn btn-primary">Join Waitlist</button>
    </form>
    <div class="waitlist-msg" id="waitlistMsg"></div>
  </section>

  <!-- Footer -->
  <footer>
    <p>&copy; 2026 GiftPull. Built by <a href="https://github.com/theportalteam" target="_blank">The Portal Team</a>.</p>
  </footer>

  <script>
    document.getElementById('waitlistForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = e.target.querySelector('input');
      const msg = document.getElementById('waitlistMsg');
      const email = input.value.trim();

      try {
        const res = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (res.ok) {
          msg.textContent = 'You\\'re on the list! We\\'ll email you when we launch.';
          msg.className = 'waitlist-msg success';
          input.value = '';
        } else {
          msg.textContent = data.error || 'Something went wrong.';
          msg.className = 'waitlist-msg error';
        }
      } catch {
        msg.textContent = 'Network error. Try again.';
        msg.className = 'waitlist-msg error';
      }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  </script>

</body>
</html>`;
}
