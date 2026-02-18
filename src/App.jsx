import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
// Product, Event, LineItem stored in localStorage

const STORAGE_KEYS = {
  products: "vst_products",
  events: "vst_events",
  theme: "vst_theme",
  user: "vst_user",
};

const load = (key) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
};
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const uid = () => Math.random().toString(36).slice(2, 10);

const CATEGORIES = ["All", "Food", "Drink", "Snack", "Merch", "Other"];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0d0d14;
      --bg2: #13131e;
      --bg3: #1a1a28;
      --surface: #1e1e2e;
      --surface2: #252538;
      --border: rgba(255,255,255,0.07);
      --accent: #c084fc;
      --accent2: #f97316;
      --accent3: #34d399;
      --text: #f1f0ff;
      --text2: #a09ec4;
      --text3: #6d6b8a;
      --danger: #f87171;
      --card-shadow: 0 4px 24px rgba(0,0,0,0.4);
      --radius: 18px;
      --radius-sm: 10px;
    }
    .light {
      --bg: #f5f3ff;
      --bg2: #ede9fe;
      --bg3: #e8e3fd;
      --surface: #fff;
      --surface2: #f8f7ff;
      --border: rgba(0,0,0,0.08);
      --accent: #7c3aed;
      --accent2: #ea580c;
      --accent3: #059669;
      --text: #1a1624;
      --text2: #4c4567;
      --text3: #9089b3;
      --danger: #dc2626;
      --card-shadow: 0 4px 24px rgba(124,58,237,0.10);
    }

    html, body, #root { height: 100%; }

    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--bg);
      color: var(--text);
      -webkit-tap-highlight-color: transparent;
      overflow: hidden;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

    .app {
      max-width: 430px;
      height: 100vh;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    /* Animated background */
    .bg-layer {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      max-width: 430px;
      margin: 0 auto;
    }
    .bg-gradient {
      position: absolute;
      inset: 0;
      background: var(--bg);
    }
    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.18;
      animation: orb-drift 8s ease-in-out infinite;
    }
    .bg-orb1 {
      width: 260px; height: 260px;
      background: #7c3aed;
      top: -60px; left: -60px;
      animation-delay: 0s;
    }
    .bg-orb2 {
      width: 200px; height: 200px;
      background: #f97316;
      bottom: 20%; right: -40px;
      animation-delay: -3s;
    }
    .bg-orb3 {
      width: 150px; height: 150px;
      background: #06b6d4;
      top: 40%; left: 30%;
      animation-delay: -5s;
    }
    @keyframes orb-drift {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(20px, -20px) scale(1.05); }
      66% { transform: translate(-10px, 15px) scale(0.95); }
    }

    /* Grid shimmer */
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(var(--border) 1px, transparent 1px),
        linear-gradient(90deg, var(--border) 1px, transparent 1px);
      background-size: 32px 32px;
      opacity: 0.4;
    }

    /* Particles */
    .particle {
      position: absolute;
      width: 2px; height: 2px;
      border-radius: 50%;
      background: var(--accent);
      opacity: 0;
      animation: particle-float linear infinite;
    }
    @keyframes particle-float {
      0% { transform: translateY(100vh) translateX(0); opacity: 0; }
      10% { opacity: 0.4; }
      90% { opacity: 0.4; }
      100% { transform: translateY(-20px) translateX(30px); opacity: 0; }
    }

    /* Screen */
    .screen {
      position: relative;
      z-index: 1;
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding-bottom: 80px;
    }

    /* Header */
    .header {
      position: sticky;
      top: 0;
      z-index: 10;
      padding: 16px 20px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(13,13,20,0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
    }
    .light .header {
      background: rgba(245,243,255,0.85);
    }
    .header-title {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 22px;
      background: linear-gradient(135deg, var(--text), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .header-actions { display: flex; gap: 8px; align-items: center; }
    .icon-btn {
      width: 38px; height: 38px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text2);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      font-size: 18px;
    }
    .icon-btn:hover { background: var(--surface2); color: var(--accent); border-color: var(--accent); transform: scale(1.05); }
    .icon-btn:active { transform: scale(0.95); }

    /* Bottom nav */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 430px;
      z-index: 10;
      background: rgba(13,13,20,0.92);
      backdrop-filter: blur(20px);
      border-top: 1px solid var(--border);
      display: flex;
      padding: 8px 16px 12px;
      gap: 4px;
    }
    .light .bottom-nav { background: rgba(245,243,255,0.92); }
    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 6px 4px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      background: transparent;
      color: var(--text3);
      font-family: 'DM Sans', sans-serif;
      font-size: 10px;
      font-weight: 500;
    }
    .nav-item.active { color: var(--accent); background: rgba(192,132,252,0.1); }
    .nav-item:hover:not(.active) { color: var(--text2); background: var(--surface); }
    .nav-icon { font-size: 20px; line-height: 1; }

    /* Cards */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
      transition: all 0.25s ease;
    }
    .card:hover { box-shadow: var(--card-shadow); transform: translateY(-2px); border-color: rgba(192,132,252,0.2); }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      font-family: 'DM Sans', sans-serif;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.2s;
      position: relative;
      overflow: hidden;
    }
    .btn::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      opacity: 0;
      transition: opacity 0.2s;
      background: rgba(255,255,255,0.1);
    }
    .btn:hover::after { opacity: 1; }
    .btn:active { transform: scale(0.97); }
    .btn-primary {
      background: linear-gradient(135deg, #7c3aed, #c084fc);
      color: white;
      padding: 14px 24px;
      box-shadow: 0 4px 20px rgba(124,58,237,0.35);
    }
    .btn-primary:hover { box-shadow: 0 4px 30px rgba(124,58,237,0.55); transform: translateY(-1px); }
    .btn-orange {
      background: linear-gradient(135deg, #ea580c, #f97316);
      color: white;
      padding: 14px 24px;
      box-shadow: 0 4px 20px rgba(249,115,22,0.35);
    }
    .btn-orange:hover { box-shadow: 0 4px 30px rgba(249,115,22,0.55); transform: translateY(-1px); }
    .btn-ghost {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text2);
      padding: 12px 20px;
    }
    .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
    .btn-danger { background: linear-gradient(135deg, #dc2626, #f87171); color: white; padding: 12px 20px; }
    .btn-full { width: 100%; }

    /* Inputs */
    .input-group { margin-bottom: 14px; }
    .input-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--text3);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
    }
    .input {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      color: var(--text);
      outline: none;
      transition: all 0.2s;
    }
    .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(192,132,252,0.15); }
    .input::placeholder { color: var(--text3); }
    select.input { cursor: pointer; }

    /* Badge */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
    }
    .badge-purple { background: rgba(192,132,252,0.15); color: var(--accent); }
    .badge-orange { background: rgba(249,115,22,0.15); color: var(--accent2); }
    .badge-green { background: rgba(52,211,153,0.15); color: var(--accent3); }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 500;
      z-index: 100;
      opacity: 0;
      transition: all 0.3s;
      pointer-events: none;
      white-space: nowrap;
      max-width: 340px;
    }
    .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(8px);
      z-index: 50;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 0 0 0 0;
      max-width: 430px;
      margin: 0 auto;
    }
    .modal {
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: 24px 24px 0 0;
      padding: 24px 20px 36px;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      animation: slide-up 0.3s ease;
    }
    @keyframes slide-up {
      from { transform: translateY(60px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .modal-handle {
      width: 40px; height: 4px;
      background: var(--border);
      border-radius: 2px;
      margin: 0 auto 20px;
    }
    .modal-title {
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 20px;
      margin-bottom: 20px;
    }

    /* Section */
    .section { padding: 16px 20px 0; }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .section-title {
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 18px;
    }

    /* Product card in grid */
    .product-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .product-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px 14px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
    }
    .product-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--accent), var(--accent2));
      opacity: 0;
      transition: opacity 0.2s;
    }
    .product-card:hover::before, .product-card:active::before { opacity: 1; }
    .product-card:hover { border-color: rgba(192,132,252,0.3); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
    .product-card:active { transform: scale(0.96); background: var(--surface2); }
    .product-card .name { font-weight: 600; font-size: 14px; line-height: 1.2; margin-bottom: 4px; }
    .product-card .price { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: var(--accent2); }
    .product-card .qty-badge {
      position: absolute;
      top: 10px; right: 10px;
      width: 24px; height: 24px;
      border-radius: 8px;
      background: var(--accent);
      color: white;
      font-size: 12px;
      font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .product-card .cat { font-size: 11px; color: var(--text3); margin-top: 4px; }

    /* Stats row */
    .stats-row {
      display: flex;
      gap: 10px;
      padding: 16px 20px;
    }
    .stat-card {
      flex: 1;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 14px 12px;
      text-align: center;
    }
    .stat-value {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 20px;
      line-height: 1;
    }
    .stat-label { font-size: 10px; color: var(--text3); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.06em; }
    .stat-green .stat-value { color: var(--accent3); }
    .stat-purple .stat-value { color: var(--accent); }
    .stat-orange .stat-value { color: var(--accent2); }

    /* Hero card (dashboard event card) */
    .hero-card {
      margin: 16px 20px;
      background: linear-gradient(135deg, #3b0764, #1e1b4b);
      border-radius: 22px;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    .hero-card::after {
      content: '';
      position: absolute;
      top: -30px; right: -30px;
      width: 120px; height: 120px;
      border-radius: 50%;
      background: rgba(192,132,252,0.2);
    }
    .hero-amount {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 38px;
      color: white;
      line-height: 1;
    }
    .hero-label { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.08em; }
    .hero-meta { font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 12px; }

    /* Search bar */
    .search-wrap {
      position: relative;
      margin: 0 20px 12px;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
      color: var(--text3);
    }
    .search-input {
      padding-left: 38px !important;
    }

    /* Category pills */
    .cat-pills {
      display: flex;
      gap: 8px;
      padding: 0 20px 12px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .cat-pills::-webkit-scrollbar { display: none; }
    .cat-pill {
      flex-shrink: 0;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text2);
      transition: all 0.2s;
      white-space: nowrap;
    }
    .cat-pill.active { background: var(--accent); border-color: var(--accent); color: white; }
    .cat-pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    /* Numpad */
    .numpad {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 16px;
    }
    .numpad-key {
      height: 60px;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: var(--surface);
      font-size: 20px;
      font-family: 'Syne', sans-serif;
      font-weight: 600;
      color: var(--text);
      cursor: pointer;
      transition: all 0.15s;
      display: flex; align-items: center; justify-content: center;
    }
    .numpad-key:hover { background: var(--surface2); border-color: var(--accent); }
    .numpad-key:active { transform: scale(0.94); background: var(--accent); color: white; }
    .numpad-key.delete { color: var(--danger); }

    /* Event list item */
    .event-item {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .event-item:hover { border-color: rgba(192,132,252,0.3); transform: translateX(3px); }
    .event-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; }
    .event-date { font-size: 12px; color: var(--text3); margin-top: 2px; }
    .event-totals { display: flex; gap: 12px; margin-top: 10px; flex-wrap: wrap; }

    /* Qty controls */
    .qty-controls {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 20px 0;
    }
    .qty-btn {
      width: 52px; height: 52px;
      border-radius: 16px;
      border: 1px solid var(--border);
      background: var(--surface);
      font-size: 22px;
      color: var(--text);
      cursor: pointer;
      transition: all 0.15s;
      display: flex; align-items: center; justify-content: center;
    }
    .qty-btn:hover { background: var(--accent); border-color: var(--accent); color: white; transform: scale(1.05); }
    .qty-btn:active { transform: scale(0.92); }
    .qty-display {
      flex: 1;
      text-align: center;
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 40px;
      color: var(--text);
    }

    /* Undo button */
    .undo-fab {
      position: fixed;
      bottom: 88px;
      right: calc(50% - 210px + 16px);
      z-index: 20;
      width: 52px; height: 52px;
      border-radius: 16px;
      background: var(--surface2);
      border: 1px solid var(--border);
      color: var(--text2);
      font-size: 20px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .undo-fab:hover { background: var(--danger); border-color: var(--danger); color: white; transform: scale(1.05); }
    .undo-fab:active { transform: scale(0.92); }

    /* Loading pulse */
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .pulse { animation: pulse 1.5s ease-in-out infinite; }

    /* Login */
    .login-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 40px 24px;
      gap: 0;
    }
    .login-logo {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 42px;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .login-tagline { color: var(--text3); font-size: 14px; text-align: center; margin-bottom: 40px; }

    /* Divider */
    .divider {
      height: 1px;
      background: var(--border);
      margin: 16px 0;
    }

    /* Summary row */
    .summary-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid var(--border);
    }
    .summary-row:last-child { border-bottom: none; }
    .summary-label { color: var(--text2); font-size: 14px; }
    .summary-val { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; }

    /* Live indicator */
    .live-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--accent3);
      animation: live-pulse 1.5s ease-in-out infinite;
      display: inline-block;
      margin-right: 6px;
    }
    @keyframes live-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.5); }
      50% { box-shadow: 0 0 0 6px rgba(52,211,153,0); }
    }

    /* Tap ripple */
    @keyframes ripple {
      0% { transform: scale(0); opacity: 0.5; }
      100% { transform: scale(3); opacity: 0; }
    }
    .ripple-el {
      position: absolute;
      border-radius: 50%;
      width: 40px; height: 40px;
      background: var(--accent);
      pointer-events: none;
      animation: ripple 0.5s ease-out forwards;
    }

    /* Empty state */
    .empty {
      text-align: center;
      padding: 40px 20px;
      color: var(--text3);
    }
    .empty-icon { font-size: 48px; margin-bottom: 12px; }
    .empty-text { font-size: 14px; line-height: 1.5; }

    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-2 { gap: 8px; }
    .gap-3 { gap: 12px; }
    .mt-1 { margin-top: 4px; }
    .mt-2 { margin-top: 8px; }
    .mt-3 { margin-top: 12px; }
    .mb-3 { margin-bottom: 12px; }
    .text-sm { font-size: 13px; }
    .text-xs { font-size: 11px; }
    .text-muted { color: var(--text2); }
    .text-danger { color: var(--danger); }
    .font-bold { font-weight: 700; }
    .font-syne { font-family: 'Syne', sans-serif; }
    .w-full { width: 100%; }
    .color-accent3 { color: var(--accent3); }
    .color-accent2 { color: var(--accent2); }
    .color-accent { color: var(--accent); }
  `}</style>
);

// ─── Particles ────────────────────────────────────────────────────────────────
const Particles = () => {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${6 + Math.random() * 6}s`,
  }));
  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
        />
      ))}
    </>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg }) => (
  <div className={`toast ${msg ? "show" : ""}`}>{msg}</div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `$${(+n || 0).toFixed(2)}`;
const dateStr = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState(() => load(STORAGE_KEYS.theme) || "dark");
  const [user, setUser] = useState(() => load(STORAGE_KEYS.user));
  const [products, setProducts] = useState(() => load(STORAGE_KEYS.products) || []);
  const [events, setEvents] = useState(() => load(STORAGE_KEYS.events) || []);
  const [tab, setTab] = useState("home");
  const [toast, setToast] = useState("");
  const [activeEvent, setActiveEvent] = useState(null); // event being edited/live
  const [modal, setModal] = useState(null); // { type, data }

  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  useEffect(() => { save(STORAGE_KEYS.products, products); }, [products]);
  useEffect(() => { save(STORAGE_KEYS.events, events); }, [events]);
  useEffect(() => { save(STORAGE_KEYS.theme, theme); }, [theme]);
  useEffect(() => { save(STORAGE_KEYS.user, user); }, [user]);

  // Sync active event changes back to events list
  useEffect(() => {
    if (!activeEvent) return;
    setEvents(prev => prev.map(e => e.id === activeEvent.id ? activeEvent : e));
  }, [activeEvent]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  const upsertProduct = (p) => {
    setProducts(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = p; return next; }
      return [...prev, p];
    });
    showToast("Product saved ✓");
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast("Product deleted");
  };

  const createEvent = (ev) => {
    const newEv = { ...ev, id: uid(), lineItems: {}, squareTotal: "", cashAppTotal: "", vendorFee: "", otherExpenses: "", status: "draft" };
    setEvents(prev => [...prev, newEv]);
    setActiveEvent(newEv);
    setTab("live");
    showToast("Event created! Let's sell 🚀");
  };

  const tapProduct = (productId) => {
    if (!activeEvent) return;
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const prev = activeEvent.lineItems[productId] || { qty: 0, price: prod.price, name: prod.name };
    const updated = { ...activeEvent.lineItems, [productId]: { ...prev, qty: prev.qty + 1 } };
    setActiveEvent(ev => ({ ...ev, lineItems: updated, lastAction: { productId, qty: prev.qty } }));
  };

  const undoLast = () => {
    if (!activeEvent?.lastAction) return;
    const { productId, qty } = activeEvent.lastAction;
    const updated = { ...activeEvent.lineItems };
    if (qty === 0) delete updated[productId];
    else updated[productId] = { ...updated[productId], qty };
    setActiveEvent(ev => ({ ...ev, lineItems: updated, lastAction: null }));
    showToast("Undone ↩");
  };

  const setQty = (productId, qty) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const updated = { ...activeEvent.lineItems };
    if (qty <= 0) delete updated[productId];
    else updated[productId] = { ...(updated[productId] || { price: prod.price, name: prod.name }), qty };
    setActiveEvent(ev => ({ ...ev, lineItems: updated }));
  };

  const finalizeEvent = (data) => {
    const finalized = { ...activeEvent, ...data, status: "done" };
    setActiveEvent(finalized);
    setEvents(prev => prev.map(e => e.id === finalized.id ? finalized : e));
    showToast("Event saved! 🎉");
    setTab("history");
    setActiveEvent(null);
  };

  const computeRevenue = (ev) => {
    if (!ev) return { cash: 0, square: 0, cashApp: 0, gross: 0, expenses: 0, net: 0, items: 0 };
    const cash = Object.values(ev.lineItems || {}).reduce((s, li) => s + li.qty * li.price, 0);
    const square = parseFloat(ev.squareTotal) || 0;
    const cashApp = parseFloat(ev.cashAppTotal) || 0;
    const gross = ev.status === "done" ? square + cashApp + (parseFloat(ev.cashRevenue) || cash) : cash;
    const expenses = (parseFloat(ev.vendorFee) || 0) + (parseFloat(ev.otherExpenses) || 0);
    const items = Object.values(ev.lineItems || {}).reduce((s, li) => s + li.qty, 0);
    const net = gross - expenses;
    return { cash, square, cashApp, gross, expenses, net, items };
  };

  const exportCSV = (ev) => {
    const rows = [["Product", "Qty", "Unit Price", "Total"]];
    Object.entries(ev.lineItems || {}).forEach(([_, li]) => {
      rows.push([li.name, li.qty, li.price.toFixed(2), (li.qty * li.price).toFixed(2)]);
    });
    const r = computeRevenue(ev);
    rows.push([], ["Square", "", "", ev.squareTotal || "0"]);
    rows.push(["Cash App", "", "", ev.cashAppTotal || "0"]);
    rows.push(["Cash Sales", "", "", r.cash.toFixed(2)]);
    rows.push(["Vendor Fee", "", "", ev.vendorFee || "0"]);
    rows.push(["Other Expenses", "", "", ev.otherExpenses || "0"]);
    rows.push(["NET PROFIT", "", "", r.net.toFixed(2)]);
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${ev.location || "event"}-${ev.date}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (!user) return (
    <div className={`app ${theme === "light" ? "light" : ""}`}>
      <GlobalStyle />
      <div className="bg-layer">
        <div className="bg-gradient" />
        <div className="bg-orb bg-orb1" />
        <div className="bg-orb bg-orb2" />
        <div className="bg-orb bg-orb3" />
        <div className="bg-grid" />
        <Particles />
      </div>
      <LoginScreen onLogin={(name) => setUser({ name, createdAt: Date.now() })} />
    </div>
  );

  const screens = {
    home: <HomeScreen events={events} computeRevenue={computeRevenue} onOpenEvent={(ev) => { setActiveEvent(ev); setTab("live"); }} onCreateEvent={() => setModal({ type: "createEvent" })} />,
    live: activeEvent
      ? <LiveScreen event={activeEvent} products={products} onTap={tapProduct} onUndo={undoLast} onAdjust={(pid) => setModal({ type: "qty", productId: pid })} computeRevenue={computeRevenue} onEndDay={() => setModal({ type: "endDay" })} />
      : <div className="screen section"><div className="empty"><div className="empty-icon">🎪</div><div className="empty-text">No active event. Create one from the Home tab.</div></div></div>,
    products: <ProductsScreen products={products} onAdd={() => setModal({ type: "product", data: null })} onEdit={(p) => setModal({ type: "product", data: p })} onDelete={deleteProduct} />,
    history: <HistoryScreen events={events} computeRevenue={computeRevenue} onOpen={(ev) => setModal({ type: "eventDetail", data: ev })} onExport={exportCSV} />,
  };

  return (
    <div className={`app ${theme === "light" ? "light" : ""}`}>
      <GlobalStyle />
      <div className="bg-layer">
        <div className="bg-gradient" />
        <div className="bg-orb bg-orb1" />
        <div className="bg-orb bg-orb2" />
        <div className="bg-orb bg-orb3" />
        <div className="bg-grid" />
        <Particles />
      </div>

      <Header title={tab === "home" ? "VendorTrack" : tab === "live" ? "Live Sales" : tab === "products" ? "Products" : "History"} onTheme={toggleTheme} theme={theme} userName={user.name} />

      <div className="screen">
        {screens[tab]}
      </div>

      <nav className="bottom-nav">
        {[
          { key: "home", icon: "🏠", label: "Home" },
          { key: "live", icon: "⚡", label: "Live" },
          { key: "products", icon: "📦", label: "Products" },
          { key: "history", icon: "📊", label: "History" },
        ].map(n => (
          <button key={n.key} className={`nav-item ${tab === n.key ? "active" : ""}`} onClick={() => setTab(n.key)}>
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      {/* Undo FAB on live screen */}
      {tab === "live" && activeEvent && (
        <button className="undo-fab" onClick={undoLast} title="Undo last tap">↩</button>
      )}

      {/* Modals */}
      {modal?.type === "product" && (
        <ProductModal product={modal.data} onSave={upsertProduct} onClose={() => setModal(null)} />
      )}
      {modal?.type === "createEvent" && (
        <CreateEventModal products={products} onCreate={createEvent} onClose={() => setModal(null)} />
      )}
      {modal?.type === "qty" && activeEvent && (
        <QtyModal
          product={products.find(p => p.id === modal.productId)}
          current={(activeEvent.lineItems[modal.productId]?.qty) || 0}
          onSet={(q) => { setQty(modal.productId, q); setModal(null); }}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "endDay" && activeEvent && (
        <EndDayModal event={activeEvent} computeRevenue={computeRevenue} onSave={finalizeEvent} onClose={() => setModal(null)} />
      )}
      {modal?.type === "eventDetail" && (
        <EventDetailModal event={modal.data} computeRevenue={computeRevenue} onExport={exportCSV} onClose={() => setModal(null)} />
      )}

      <Toast msg={toast} />
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ title, onTheme, theme, userName }) {
  return (
    <div className="header">
      <div className="header-title">{title}</div>
      <div className="header-actions">
        <button className="icon-btn" onClick={onTheme} title="Toggle theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white" }}>
          {userName?.[0]?.toUpperCase() || "?"}
        </div>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  return (
    <div className="screen" style={{ position: "relative", zIndex: 1 }}>
      <div className="login-wrap">
        <div className="login-logo">VendorTrack</div>
        <div className="login-tagline">Real-time event sales tracker for market vendors</div>
        <div style={{ width: "100%", maxWidth: 340 }}>
          <div className="input-group">
            <label className="input-label">Your Name</label>
            <input className="input" placeholder="e.g. Sarah" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && name.trim() && onLogin(name.trim())} autoFocus />
          </div>
          <button className="btn btn-primary btn-full" style={{ height: 52 }} onClick={() => name.trim() && onLogin(name.trim())}>
            Get Started →
          </button>
        </div>
        <div style={{ marginTop: 32, fontSize: 12, color: "var(--text3)", textAlign: "center" }}>
          All data stored locally on your device
        </div>
      </div>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({ events, computeRevenue, onOpenEvent, onCreateEvent }) {
  const recent = [...events].reverse().slice(0, 10);
  const active = events.find(e => e.status === "draft");
  const totalRevenue = events.filter(e => e.status === "done").reduce((s, e) => s + computeRevenue(e).gross, 0);

  return (
    <div>
      {/* Hero */}
      <div className="hero-card">
        <div className="hero-label">All-Time Revenue</div>
        <div className="hero-amount">{fmt(totalRevenue)}</div>
        <div className="hero-meta">{events.filter(e => e.status === "done").length} completed events</div>
      </div>

      {/* Active event banner */}
      {active && (
        <div className="section">
          <div style={{ background: "linear-gradient(135deg, #064e3b, #065f46)", borderRadius: "var(--radius)", padding: 16, cursor: "pointer", border: "1px solid rgba(52,211,153,0.2)" }} onClick={() => onOpenEvent(active)}>
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>
                  <span className="live-dot" />ACTIVE EVENT
                </div>
                <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18, color: "white" }}>{active.location}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{dateStr(active.date)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 24, color: "#34d399" }}>{fmt(computeRevenue(active).cash)}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{computeRevenue(active).items} items</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {events.length > 0 && (
        <div className="stats-row">
          <div className="stat-card stat-orange">
            <div className="stat-value">{events.length}</div>
            <div className="stat-label">Events</div>
          </div>
          <div className="stat-card stat-green">
            <div className="stat-value">{fmt(events.filter(e => e.status === "done").reduce((s, e) => s + computeRevenue(e).net, 0))}</div>
            <div className="stat-label">Net Profit</div>
          </div>
          <div className="stat-card stat-purple">
            <div className="stat-value">{events.filter(e => e.status === "done").length > 0 ? fmt(totalRevenue / events.filter(e => e.status === "done").length) : "$0"}</div>
            <div className="stat-label">Avg/Event</div>
          </div>
        </div>
      )}

      {/* Create button */}
      <div className="section mb-3">
        <button className="btn btn-orange btn-full" style={{ height: 56 }} onClick={onCreateEvent}>
          + Create New Event
        </button>
      </div>

      {/* Recent */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">Recent Events</div>
        </div>
        {recent.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🛒</div>
            <div className="empty-text">No events yet. Create your first event to start tracking sales!</div>
          </div>
        ) : recent.map(ev => {
          const r = computeRevenue(ev);
          return (
            <div key={ev.id} className="event-item" onClick={() => ev.status === "draft" ? onOpenEvent(ev) : null}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="event-name">{ev.location}</div>
                  <div className="event-date">{dateStr(ev.date)}</div>
                </div>
                <span className={`badge ${ev.status === "done" ? "badge-green" : "badge-orange"}`}>
                  {ev.status === "done" ? "Done" : "Live"}
                </span>
              </div>
              <div className="event-totals">
                <span className="badge badge-purple">{fmt(r.gross)} gross</span>
                {ev.status === "done" && <span className="badge badge-green">{fmt(r.net)} net</span>}
                <span className="text-xs text-muted">{r.items} items</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Live Sales Screen ────────────────────────────────────────────────────────
function LiveScreen({ event, products, onTap, onUndo, onAdjust, computeRevenue, onEndDay }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const r = computeRevenue(event);

  const activeProducts = products.filter(p => p.active !== false);
  const filtered = activeProducts.filter(p => {
    const matchCat = cat === "All" || p.category === cat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleTap = (e, pid) => {
    // Ripple
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement("div");
    ripple.className = "ripple-el";
    ripple.style.left = (e.clientX - rect.left - 20) + "px";
    ripple.style.top = (e.clientY - rect.top - 20) + "px";
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
    onTap(pid);
  };

  return (
    <div>
      {/* Stats */}
      <div className="stats-row" style={{ paddingTop: 12 }}>
        <div className="stat-card stat-green">
          <div className="stat-value">{fmt(r.cash)}</div>
          <div className="stat-label">💵 Cash Total</div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-value">{r.items}</div>
          <div className="stat-label">Items Sold</div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-value">{Object.keys(event.lineItems || {}).length}</div>
          <div className="stat-label">Products</div>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input className="input search-input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Category pills */}
      <div className="cat-pills">
        {CATEGORIES.map(c => (
          <div key={c} className={`cat-pill ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</div>
        ))}
      </div>

      {/* Product grid */}
      <div className="section">
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📦</div>
            <div className="empty-text">No products match. Add products in the Products tab.</div>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map(p => {
              const qty = event.lineItems?.[p.id]?.qty || 0;
              return (
                <div key={p.id} className="product-card" onClick={(e) => handleTap(e, p.id)} onContextMenu={(e) => { e.preventDefault(); onAdjust(p.id); }}>
                  {qty > 0 && <div className="qty-badge">{qty}</div>}
                  <div className="name">{p.name}</div>
                  <div className="price">{fmt(p.price)}</div>
                  {p.category && <div className="cat">{p.category}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* End Day */}
      <div className="section" style={{ paddingTop: 20 }}>
        <button className="btn btn-primary btn-full" style={{ height: 54 }} onClick={onEndDay}>
          End of Day →
        </button>
        <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "center", marginTop: 8 }}>
          Long-press a product to edit quantity
        </div>
      </div>
    </div>
  );
}

// ─── Products Screen ──────────────────────────────────────────────────────────
function ProductsScreen({ products, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const active = products.filter(p => p.active !== false && p.name.toLowerCase().includes(search.toLowerCase()));
  const inactive = products.filter(p => p.active === false && p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="section" style={{ paddingBottom: 12 }}>
        <div className="search-wrap" style={{ margin: "12px 0 0" }}>
          <span className="search-icon">🔍</span>
          <input className="input search-input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <div className="section-title">Active ({active.length})</div>
          <button className="btn btn-orange" style={{ padding: "8px 16px", fontSize: 13 }} onClick={onAdd}>+ Add</button>
        </div>
        {active.length === 0 && (
          <div className="empty">
            <div className="empty-icon">🍰</div>
            <div className="empty-text">No products yet. Add your first product!</div>
          </div>
        )}
        {active.map(p => <ProductRow key={p.id} product={p} onEdit={onEdit} onDelete={onDelete} />)}

        {inactive.length > 0 && (
          <>
            <div className="section-title" style={{ marginTop: 20, marginBottom: 12 }}>Inactive ({inactive.length})</div>
            {inactive.map(p => <ProductRow key={p.id} product={p} onEdit={onEdit} onDelete={onDelete} />)}
          </>
        )}
      </div>
    </div>
  );
}

function ProductRow({ product: p, onEdit, onDelete }) {
  return (
    <div className="card" style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
          <span className="badge badge-orange">{fmt(p.price)}</span>
          {p.category && <span className="badge badge-purple">{p.category}</span>}
          {p.cost && <span className="text-xs text-muted">cost {fmt(p.cost)}</span>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="icon-btn" onClick={() => onEdit(p)}>✏️</button>
        <button className="icon-btn" style={{ color: "var(--danger)" }} onClick={() => { if (confirm(`Delete "${p.name}"?`)) onDelete(p.id); }}>🗑️</button>
      </div>
    </div>
  );
}

// ─── History Screen ───────────────────────────────────────────────────────────
function HistoryScreen({ events, computeRevenue, onOpen, onExport }) {
  const sorted = [...events].reverse();
  return (
    <div className="section">
      <div className="section-header" style={{ paddingTop: 12 }}>
        <div className="section-title">Event History</div>
        <span className="text-muted text-sm">{events.length} events</span>
      </div>
      {sorted.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📊</div>
          <div className="empty-text">No events yet. Complete your first event to see history.</div>
        </div>
      ) : sorted.map(ev => {
        const r = computeRevenue(ev);
        return (
          <div key={ev.id} className="event-item" onClick={() => onOpen(ev)}>
            <div className="flex items-center justify-between">
              <div>
                <div className="event-name">{ev.location}</div>
                <div className="event-date">{dateStr(ev.date)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="font-syne font-bold" style={{ fontSize: 18 }}>{fmt(r.gross)}</div>
                <div className="text-xs" style={{ color: r.net >= 0 ? "var(--accent3)" : "var(--danger)" }}>
                  {r.net >= 0 ? "+" : ""}{fmt(r.net)} net
                </div>
              </div>
            </div>
            <div className="event-totals">
              <span className="text-xs text-muted">💵 {fmt(r.cash)} cash</span>
              {parseFloat(ev.squareTotal) > 0 && <span className="text-xs text-muted">◼ {fmt(ev.squareTotal)} sq</span>}
              {parseFloat(ev.cashAppTotal) > 0 && <span className="text-xs text-muted">💰 {fmt(ev.cashAppTotal)} ca</span>}
              <span className="text-xs text-muted">{r.items} items</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────
function ProductModal({ product, onSave, onClose }) {
  const [form, setForm] = useState(product || { id: uid(), name: "", price: "", category: "", cost: "", active: true });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim() && parseFloat(form.price) > 0;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-title">{product ? "Edit Product" : "Add Product"}</div>
        <div className="input-group">
          <label className="input-label">Name *</label>
          <input className="input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Berry Cake" autoFocus />
        </div>
        <div className="input-group">
          <label className="input-label">Price *</label>
          <input className="input" type="number" min="0" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0.00" />
        </div>
        <div className="input-group">
          <label className="input-label">Category</label>
          <select className="input" value={form.category} onChange={e => set("category", e.target.value)}>
            <option value="">None</option>
            {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Cost Per Item (optional)</label>
          <input className="input" type="number" min="0" step="0.01" value={form.cost} onChange={e => set("cost", e.target.value)} placeholder="0.00" />
        </div>
        <div className="input-group">
          <label className="input-label">Status</label>
          <select className="input" value={form.active ? "active" : "inactive"} onChange={e => set("active", e.target.value === "active")}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2 }} disabled={!valid} onClick={() => { onSave({ ...form, price: parseFloat(form.price), cost: parseFloat(form.cost) || 0 }); onClose(); }}>
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateEventModal({ products, onCreate, onClose }) {
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], location: "", notes: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.date && form.location.trim();
  const active = products.filter(p => p.active !== false);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-title">New Event</div>
        <div className="input-group">
          <label className="input-label">Date *</label>
          <input className="input" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">Event / Location *</label>
          <input className="input" value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Eastside Farmers Market" autoFocus />
        </div>
        <div className="input-group">
          <label className="input-label">Notes</label>
          <input className="input" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional notes..." />
        </div>
        {active.length > 0 && (
          <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 16, padding: "10px 14px", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
            📦 {active.length} active product{active.length > 1 ? "s" : ""} will be loaded into this event
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-orange" style={{ flex: 2 }} disabled={!valid} onClick={() => { onCreate(form); onClose(); }}>
            Start Event 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

function QtyModal({ product, current, onSet, onClose }) {
  const [qty, setQty] = useState(current);
  if (!product) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-title">Adjust: {product.name}</div>
        <div style={{ textAlign: "center", color: "var(--text2)", fontSize: 14, marginTop: -8, marginBottom: 4 }}>{fmt(product.price)} each</div>
        <div className="qty-controls">
          <button className="qty-btn" onClick={() => setQty(q => Math.max(0, q - 1))}>−</button>
          <div className="qty-display">{qty}</div>
          <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
        </div>
        <div style={{ textAlign: "center", fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>
          Subtotal: {fmt(qty * product.price)}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => onSet(qty)}>Set Quantity</button>
        </div>
      </div>
    </div>
  );
}

function EndDayModal({ event, computeRevenue, onSave, onClose }) {
  const r = computeRevenue(event);
  const [form, setForm] = useState({
    squareTotal: event.squareTotal || "",
    cashAppTotal: event.cashAppTotal || "",
    vendorFee: event.vendorFee || "",
    otherExpenses: event.otherExpenses || "",
    cashRevenue: r.cash.toFixed(2),
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const gross = (parseFloat(form.squareTotal) || 0) + (parseFloat(form.cashAppTotal) || 0) + (parseFloat(form.cashRevenue) || 0);
  const expenses = (parseFloat(form.vendorFee) || 0) + (parseFloat(form.otherExpenses) || 0);
  const net = gross - expenses;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-title">End of Day</div>

        <div style={{ background: "var(--surface)", borderRadius: 14, padding: "14px", marginBottom: 20, border: "1px solid var(--border)" }}>
          <div className="summary-row">
            <span className="summary-label">Cash sales (auto)</span>
            <span className="summary-val color-accent3">{fmt(r.cash)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">{r.items} items sold</span>
            <span className="summary-val">{Object.keys(event.lineItems || {}).length} products</span>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Square Total ($)</label>
          <input className="input" type="number" min="0" step="0.01" value={form.squareTotal} onChange={e => set("squareTotal", e.target.value)} placeholder="0.00" />
        </div>
        <div className="input-group">
          <label className="input-label">Cash App Total ($)</label>
          <input className="input" type="number" min="0" step="0.01" value={form.cashAppTotal} onChange={e => set("cashAppTotal", e.target.value)} placeholder="0.00" />
        </div>
        <div className="input-group">
          <label className="input-label">Cash Revenue Override (optional)</label>
          <input className="input" type="number" min="0" step="0.01" value={form.cashRevenue} onChange={e => set("cashRevenue", e.target.value)} />
        </div>

        <div className="divider" />
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "var(--text2)" }}>Expenses</div>

        <div className="input-group">
          <label className="input-label">Vendor Fee ($)</label>
          <input className="input" type="number" min="0" step="0.01" value={form.vendorFee} onChange={e => set("vendorFee", e.target.value)} placeholder="0.00" />
        </div>
        <div className="input-group">
          <label className="input-label">Other (travel, supplies, etc.)</label>
          <input className="input" type="number" min="0" step="0.01" value={form.otherExpenses} onChange={e => set("otherExpenses", e.target.value)} placeholder="0.00" />
        </div>

        <div className="divider" />

        <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(249,115,22,0.1))", borderRadius: 14, padding: 16, marginBottom: 20, border: "1px solid rgba(192,132,252,0.2)" }}>
          <div className="summary-row">
            <span className="summary-label">Gross Revenue</span>
            <span className="summary-val color-accent2">{fmt(gross)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Total Expenses</span>
            <span className="summary-val text-danger">−{fmt(expenses)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label" style={{ fontWeight: 700 }}>Net Profit</span>
            <span className="summary-val" style={{ fontSize: 22, color: net >= 0 ? "var(--accent3)" : "var(--danger)" }}>{fmt(net)}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Back</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => onSave(form)}>Save Event ✓</button>
        </div>
      </div>
    </div>
  );
}

function EventDetailModal({ event, computeRevenue, onExport, onClose }) {
  const r = computeRevenue(event);
  const lineItems = Object.entries(event.lineItems || {});
  const sorted = [...lineItems].sort((a, b) => (b[1].qty * b[1].price) - (a[1].qty * a[1].price));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="flex items-center justify-between mb-3">
          <div className="modal-title" style={{ marginBottom: 0 }}>{event.location}</div>
          <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => onExport(event)}>📥 CSV</button>
        </div>
        <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 16 }}>{dateStr(event.date)}</div>

        {/* Summary */}
        <div style={{ background: "var(--surface)", borderRadius: 14, padding: 14, marginBottom: 16, border: "1px solid var(--border)" }}>
          <div className="summary-row">
            <span className="summary-label">💵 Cash Sales</span>
            <span className="summary-val">{fmt(r.cash)}</span>
          </div>
          {parseFloat(event.squareTotal) > 0 && (
            <div className="summary-row">
              <span className="summary-label">◼ Square</span>
              <span className="summary-val">{fmt(event.squareTotal)}</span>
            </div>
          )}
          {parseFloat(event.cashAppTotal) > 0 && (
            <div className="summary-row">
              <span className="summary-label">💰 Cash App</span>
              <span className="summary-val">{fmt(event.cashAppTotal)}</span>
            </div>
          )}
          <div className="summary-row">
            <span className="summary-label">Gross Revenue</span>
            <span className="summary-val color-accent2">{fmt(r.gross)}</span>
          </div>
          {r.expenses > 0 && (
            <div className="summary-row">
              <span className="summary-label">Expenses</span>
              <span className="summary-val text-danger">−{fmt(r.expenses)}</span>
            </div>
          )}
          <div className="summary-row">
            <span className="summary-label" style={{ fontWeight: 700 }}>Net Profit</span>
            <span className="summary-val" style={{ fontSize: 20, color: r.net >= 0 ? "var(--accent3)" : "var(--danger)" }}>{fmt(r.net)}</span>
          </div>
        </div>

        {/* Items breakdown */}
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Sales Breakdown</div>
        {sorted.length === 0 ? (
          <div className="text-muted text-sm">No items recorded.</div>
        ) : sorted.map(([id, li]) => (
          <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontWeight: 500 }}>{li.name}</div>
              <div className="text-xs text-muted">{li.qty} × {fmt(li.price)}</div>
            </div>
            <div className="font-syne font-bold">{fmt(li.qty * li.price)}</div>
          </div>
        ))}

        <button className="btn btn-ghost btn-full" style={{ marginTop: 20 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
