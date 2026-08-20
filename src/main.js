(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const saveKey = 'poptart-punk-save-v2';
  const outfits = ['Mustard Hoodie', 'Laser Pajamas', 'Business Wizard Cape', 'Dial-Up Denim'];
  const panels = [
    'Mayor Hamster says: The Wi-Fi gremlins stole every bagel in Cybertown. Jump like rent is due!',
    'A suspicious pop-up whispers: collect bagels to buy objectively worse fashion. This is economy.',
    'Your rival, Todd.exe, installed legs on a toaster. Prove snacks have superior airtime.'
  ];
  const save = { highScore: 0, bagels: 0, speed: 1, magnet: 1, outfit: 0, cutscene: 0, ...JSON.parse(localStorage.getItem(saveKey) || '{}') };
  const state = { x: 170, y: 360, vx: 0, vy: 0, score: 0, runBagels: 0, alive: true, keys: {}, platforms: [], items: [], hazards: [], stars: [] };
  const $ = (id) => document.getElementById(id);
  const persist = () => localStorage.setItem(saveKey, JSON.stringify(save));
  const beep = (freq = 440, duration = 0.045) => { const AudioContext = window.AudioContext || window.webkitAudioContext; if (!AudioContext) return; const audio = new AudioContext(); const osc = audio.createOscillator(); const gain = audio.createGain(); osc.frequency.value = freq; gain.gain.value = 0.035; osc.connect(gain); gain.connect(audio.destination); osc.start(); osc.stop(audio.currentTime + duration); };
  const reset = () => { Object.assign(state, { x: 170, y: 360, vx: 0, vy: 0, score: 0, runBagels: 0, alive: true, platforms: [], items: [], hazards: [] }); for (let i = 0; i < 9; i++) spawnPlatform(70 + Math.random() * 720, 635 - i * 82); $('status').textContent = 'INSERT BAGEL'; };
  const spawnPlatform = (x, y) => { state.platforms.push({ x, y, w: 78, h: 24 }); if (Math.random() > 0.38) state.items.push({ x: x + 22, y: y - 35, r: 14 }); if (Math.random() > 0.8) state.hazards.push({ x: x - 18, y: y - 74, w: 54, h: 72 }); };
  const jump = (boost = 1) => { if (!state.alive) return reset(); state.vy = -13.5 * boost * (1 + save.speed * 0.035); beep(260); };
  const gameOver = () => { if (!state.alive) return; state.alive = false; save.bagels += state.runBagels; save.highScore = Math.max(save.highScore, Math.floor(state.score)); persist(); $('status').textContent = 'CLICK GAME TO REBOOT'; beep(90, 0.18); };
  const rectsTouch = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const update = () => {
    if (state.alive) {
      state.score += 0.2; state.vy += 0.48; state.vx = ((state.keys.ArrowRight || state.keys.KeyD ? 1 : 0) - (state.keys.ArrowLeft || state.keys.KeyA ? 1 : 0)) * 6.8; state.x += state.vx; state.y += state.vy; state.x = Math.max(0, Math.min(842, state.x));
      const hero = { x: state.x + 5, y: state.y + 5, w: 48, h: 30 };
      state.platforms.forEach((p) => { if (state.vy > 0 && rectsTouch(hero, p) && hero.y + hero.h - state.vy <= p.y + 8) { state.y = p.y - 38; jump(1.03); } });
      if (state.y < 250) { const push = (250 - state.y) * 0.09; state.y += push; [...state.platforms, ...state.items, ...state.hazards].forEach((o) => o.y += push); }
      state.platforms = state.platforms.filter((p) => { if (p.y > 720) { spawnPlatform(45 + Math.random() * 790, -30); return false; } return true; });
      state.items = state.items.filter((item) => { const dx = state.x + 29 - item.x, dy = state.y + 19 - item.y, dist = Math.hypot(dx, dy); if (dist < 85 + save.magnet * 18) { item.x += dx / dist * 3.2; item.y += dy / dist * 3.2; } if (dist < 34) { state.runBagels++; beep(720); return false; } return item.y < 730; });
      state.hazards = state.hazards.filter((h) => { if (rectsTouch(hero, h)) gameOver(); return h.y < 760; });
      if (state.y > 700) gameOver();
    }
    draw(); requestAnimationFrame(update);
  };
  const drawHero = () => { const colors = ['#fff06a', '#22d3ee', '#8b5cf6', '#38bdf8']; ctx.fillStyle = colors[save.outfit]; ctx.strokeStyle = '#111'; ctx.lineWidth = 4; roundRect(state.x, state.y, 58, 38, 13, true); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(state.x + 18, state.y + 14, 7, 0, 7); ctx.arc(state.x + 41, state.y + 14, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#111'; ctx.fillRect(state.x + 18, state.y + 14, 4, 4); ctx.fillRect(state.x + 41, state.y + 14, 4, 4); ctx.fillStyle = '#ef4444'; ctx.fillRect(state.x + 23, state.y + 28, 16, 5); };
  const roundRect = (x, y, w, h, r, fill) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); fill ? ctx.fill() : ctx.stroke(); ctx.stroke(); };
  const draw = () => { ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, 900, 680); state.stars.forEach((s) => { ctx.fillStyle = s.c; ctx.font = `${s.size}px monospace`; ctx.fillText(s.t, s.x, (s.y + state.score * s.v) % 700); }); state.platforms.forEach((p) => { ctx.fillStyle = '#16a34a'; roundRect(p.x, p.y, p.w, p.h, 8, true); ctx.fillStyle = '#bbf7d0'; ctx.fillRect(p.x + 8, p.y + 5, p.w - 16, 4); }); state.items.forEach((b) => { ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill(); ctx.fillStyle = '#7c2d12'; ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, 7); ctx.fill(); }); state.hazards.forEach((h) => { ctx.fillStyle = '#7c3aed'; roundRect(h.x, h.y, h.w, h.h, 10, true); ctx.fillStyle = '#fde047'; ctx.font = '18px Impact'; ctx.fillText('AD!', h.x + 12, h.y + 42); }); drawHero(); ctx.fillStyle = '#fff'; ctx.font = '24px Impact'; ctx.strokeStyle = '#000'; ctx.lineWidth = 5; ctx.strokeText(`Score ${Math.floor(state.score)}  Bagels ${state.runBagels}`, 18, 32); ctx.fillText(`Score ${Math.floor(state.score)}  Bagels ${state.runBagels}`, 18, 32); if (!state.alive) { ctx.textAlign = 'center'; ctx.font = '44px Impact'; ctx.fillStyle = '#fde047'; ctx.strokeText('YE OLDE GAME OVER', 450, 310); ctx.fillText('YE OLDE GAME OVER', 450, 310); ctx.font = '23px Comic Sans MS'; ctx.fillText('click or space to reboot your knees', 450, 350); ctx.textAlign = 'left'; } syncUi(); };
  const syncUi = () => { $('high').textContent = save.highScore; $('score').textContent = Math.floor(state.score); $('wallet').textContent = save.bagels; $('fresh').textContent = state.runBagels; $('outfit').textContent = outfits[save.outfit]; $('speedBtn').textContent = `Upgrade jump springs (${20 + save.speed * 15})`; $('magnetBtn').textContent = `Upgrade crumb magnet (${18 + save.magnet * 12})`; };
  const buy = (kind) => { const costs = { speed: 20 + save.speed * 15, magnet: 18 + save.magnet * 12, outfit: 35 }; if (save.bagels < costs[kind]) { beep(120); return; } save.bagels -= costs[kind]; if (kind === 'outfit') save.outfit = (save.outfit + 1) % outfits.length; else save[kind] += 1; persist(); syncUi(); beep(880); };
  window.addEventListener('keydown', (e) => { state.keys[e.code] = true; if (e.code === 'Space') { e.preventDefault(); jump(); } }); window.addEventListener('keyup', (e) => { state.keys[e.code] = false; }); canvas.addEventListener('pointerdown', jump); $('nextStory').onclick = () => { save.cutscene = (save.cutscene + 1) % panels.length; $('story').textContent = panels[save.cutscene]; persist(); beep(520); }; $('speedBtn').onclick = () => buy('speed'); $('magnetBtn').onclick = () => buy('magnet'); $('outfitBtn').onclick = () => buy('outfit');
  for (let i = 0; i < 55; i++) state.stars.push({ x: Math.random() * 875, y: Math.random() * 680, v: 0.05 + Math.random() * 0.3, size: 10 + Math.random() * 22, t: ['★', '@', 'LOL', 'ZAP', 'BBS'][i % 5], c: ['#22d3ee', '#f0abfc', '#fde047', '#fb7185'][i % 4] });
  $('story').textContent = panels[save.cutscene]; reset(); update();
})();
