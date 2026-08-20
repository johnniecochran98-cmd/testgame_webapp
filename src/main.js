(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const saveKey = 'poptart-punk-save-v3';
  const defaultSave = { highScore: 0, bagels: 0, speed: 1, magnet: 1, outfit: 0, cutscene: 0, runs: 0 };
  const outfits = [
    { name: 'Mustard Hoodie', color: '#fff06a', trim: '#fb923c' },
    { name: 'Laser Pajamas', color: '#22d3ee', trim: '#0ea5e9' },
    { name: 'Business Wizard Cape', color: '#8b5cf6', trim: '#f0abfc' },
    { name: 'Dial-Up Denim', color: '#38bdf8', trim: '#1e3a8a' },
    { name: 'Pickle Formalwear', color: '#84cc16', trim: '#365314' }
  ];
  const panels = [
    'Mayor Hamster says: The Wi-Fi gremlins stole every bagel in Cybertown. Jump like rent is due!',
    'A suspicious pop-up whispers: collect bagels to buy objectively worse fashion. This is economy.',
    'Your rival, Todd.exe, installed legs on a toaster. Prove snacks have superior airtime.',
    'A raccoon angel offers you a coupon for one emotionally supportive crumb magnet.',
    'The sewer oracle predicts: you will say “one more run” approximately eleven more times.'
  ];
  const biomes = [
    { name: 'Mall Sewer', sky: '#111827', floor: '#16a34a', glow: '#22d3ee', hazard: '#7c3aed', speed: 1 },
    { name: 'Pizza Nebula', sky: '#3b0764', floor: '#f97316', glow: '#fde047', hazard: '#be123c', speed: 1.12 },
    { name: 'Dial-Up Jungle', sky: '#052e16', floor: '#65a30d', glow: '#86efac', hazard: '#a16207', speed: 1.22 },
    { name: 'Corporate Clown Cloud', sky: '#172554', floor: '#06b6d4', glow: '#f0abfc', hazard: '#db2777', speed: 1.35 }
  ];
  let save = { ...defaultSave, ...JSON.parse(localStorage.getItem(saveKey) || '{}') };
  const state = {
    x: 170,
    y: 360,
    vx: 0,
    vy: 0,
    score: 0,
    runBagels: 0,
    combo: 1,
    alive: true,
    shield: 0,
    keys: {},
    platforms: [],
    items: [],
    hazards: [],
    powerups: [],
    confetti: [],
    stars: [],
    biome: 0,
    nextSpawnY: 635
  };
  const $ = (id) => document.getElementById(id);
  const persist = () => localStorage.setItem(saveKey, JSON.stringify(save));
  const rand = (min, max) => min + Math.random() * (max - min);
  const roundRect = (x, y, w, h, r, fill = true) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (fill) ctx.fill();
    ctx.stroke();
  };
  const beep = (freq = 440, duration = 0.045) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audio = new AudioContext();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.035;
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + duration);
  };
  const currentBiome = () => biomes[state.biome % biomes.length];
  const reset = () => {
    Object.assign(state, {
      x: 170,
      y: 360,
      vx: 0,
      vy: 0,
      score: 0,
      runBagels: 0,
      combo: 1,
      shield: 0,
      alive: true,
      platforms: [],
      items: [],
      hazards: [],
      powerups: [],
      confetti: [],
      biome: save.runs % biomes.length,
      nextSpawnY: 635
    });
    for (let i = 0; i < 12; i += 1) spawnChunk(635 - i * rand(58, 88));
    $('status').textContent = 'INSERT BAGEL';
    syncUi();
  };
  const spawnChunk = (y = state.nextSpawnY) => {
    const difficulty = Math.min(2.5, 1 + state.score / 900);
    const biome = currentBiome();
    const width = rand(70, 120) / difficulty;
    const x = rand(35, 860 - width);
    const drift = rand(-0.55, 0.55) * difficulty;
    state.platforms.push({ x, y, w: width, h: 24, drift, phase: rand(0, 7), color: biome.floor });
    if (Math.random() > 0.28) state.items.push({ x: x + width / 2 + rand(-25, 25), y: y - rand(32, 58), r: 14, wobble: rand(0, 7) });
    if (Math.random() > 0.86 - state.score / 5000) state.powerups.push({ x: rand(70, 830), y: y - rand(70, 115), r: 18, kind: Math.random() > 0.5 ? 'shield' : 'bonus' });
    if (Math.random() > 0.76 - state.score / 4200) state.hazards.push({ x: rand(40, 820), y: y - rand(88, 140), w: 54, h: 70, pulse: rand(0, 7) });
    state.nextSpawnY = y - rand(58, 96);
  };
  const jump = (boost = 1) => {
    if (!state.alive) return reset();
    state.vy = -13.2 * boost * (1 + save.speed * 0.04);
    state.combo = Math.min(9, state.combo + 0.06);
    beep(260 + state.combo * 18);
  };
  const depositBagels = () => {
    if (state.runBagels <= 0) return;
    save.bagels += state.runBagels;
    state.runBagels = 0;
    persist();
    syncUi();
  };
  const gameOver = () => {
    if (!state.alive) return;
    if (state.shield > 0) {
      state.shield = 0;
      state.vy = -15;
      for (let i = 0; i < 18; i += 1) state.confetti.push({ x: state.x + 29, y: state.y + 20, vx: rand(-5, 5), vy: rand(-7, 2), life: 40, color: currentBiome().glow });
      beep(980, 0.08);
      return;
    }
    state.alive = false;
    save.runs += 1;
    save.highScore = Math.max(save.highScore, Math.floor(state.score));
    depositBagels();
    persist();
    $('status').textContent = 'CLICK GAME TO REBOOT';
    beep(90, 0.18);
  };
  const rectsTouch = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const update = () => {
    if (state.alive) {
      state.score += 0.2 * currentBiome().speed;
      if (Math.floor(state.score) > 0 && Math.floor(state.score) % 450 === 0) state.biome = Math.floor(state.score / 450) % biomes.length;
      state.vy += 0.47;
      state.vx = ((state.keys.ArrowRight || state.keys.KeyD ? 1 : 0) - (state.keys.ArrowLeft || state.keys.KeyA ? 1 : 0)) * 7.1;
      state.x = Math.max(0, Math.min(842, state.x + state.vx));
      state.y += state.vy;
      const hero = { x: state.x + 5, y: state.y + 5, w: 48, h: 30 };
      state.platforms.forEach((p) => {
        p.x += Math.sin(state.score / 28 + p.phase) * p.drift;
        if (state.vy > 0 && rectsTouch(hero, p) && hero.y + hero.h - state.vy <= p.y + 8) {
          state.y = p.y - 38;
          jump(1.03);
        }
      });
      if (state.y < 250) {
        const push = (250 - state.y) * 0.09;
        state.y += push;
        [...state.platforms, ...state.items, ...state.hazards, ...state.powerups].forEach((o) => { o.y += push; });
        state.nextSpawnY += push;
      }
      while (state.nextSpawnY > -80) spawnChunk();
      state.platforms = state.platforms.filter((p) => p.y < 740);
      state.items = state.items.filter((item) => {
        item.wobble += 0.12;
        const dx = state.x + 29 - item.x;
        const dy = state.y + 19 - item.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        if (dist < 90 + save.magnet * 20) {
          item.x += (dx / dist) * 3.4;
          item.y += (dy / dist) * 3.4;
        }
        if (dist < 35) {
          state.runBagels += Math.ceil(state.combo);
          state.combo = Math.min(9, state.combo + 0.35);
          if (state.runBagels % 10 === 0) depositBagels();
          beep(720 + state.combo * 25);
          return false;
        }
        return item.y < 730;
      });
      state.powerups = state.powerups.filter((p) => {
        const dist = Math.hypot(state.x + 29 - p.x, state.y + 19 - p.y);
        if (dist < 38) {
          if (p.kind === 'shield') state.shield = 1;
          else state.runBagels += 8;
          beep(1040, 0.1);
          return false;
        }
        return p.y < 730;
      });
      state.hazards = state.hazards.filter((h) => {
        h.pulse += 0.13;
        if (rectsTouch(hero, h)) {
          const hadShield = state.shield > 0;
          gameOver();
          return !hadShield && h.y < 760;
        }
        return h.y < 760;
      });
      state.confetti = state.confetti.filter((c) => {
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.22;
        c.life -= 1;
        return c.life > 0;
      });
      if (state.y > 700) gameOver();
    }
    draw();
    requestAnimationFrame(update);
  };
  const drawBackground = () => {
    const biome = currentBiome();
    const grd = ctx.createLinearGradient(0, 0, 900, 680);
    grd.addColorStop(0, biome.sky);
    grd.addColorStop(0.55, '#12002f');
    grd.addColorStop(1, '#050016');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 900, 680);
    state.stars.forEach((s) => {
      ctx.fillStyle = s.c;
      ctx.font = `${s.size}px monospace`;
      ctx.fillText(s.t, s.x, (s.y + state.score * s.v) % 710);
    });
    ctx.strokeStyle = `${biome.glow}55`;
    ctx.lineWidth = 2;
    for (let y = 80; y < 690; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y + Math.sin(state.score / 35 + y) * 9);
      ctx.bezierCurveTo(260, y - 44, 560, y + 52, 900, y - 18);
      ctx.stroke();
    }
  };
  const drawHero = () => {
    const outfit = outfits[save.outfit % outfits.length];
    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.fillStyle = state.shield ? '#ffffff' : outfit.color;
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 4;
    roundRect(0, 0, 58, 38, 13, true);
    ctx.fillStyle = outfit.trim;
    ctx.fillRect(4, 28, 50, 7);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(18, 14, 7, 0, 7);
    ctx.arc(41, 14, 7, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(18, 14, 4, 4);
    ctx.fillRect(41, 14, 4, 4);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(23, 26, 16, 5);
    if (state.shield) {
      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(29, 19, 38 + Math.sin(state.score / 10) * 4, 0, 7);
      ctx.stroke();
    }
    ctx.restore();
  };
  const draw = () => {
    const biome = currentBiome();
    drawBackground();
    state.platforms.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 4;
      roundRect(p.x, p.y, p.w, p.h, 8, true);
      ctx.fillStyle = '#ecfccb';
      ctx.fillRect(p.x + 8, p.y + 5, Math.max(8, p.w - 16), 4);
    });
    state.items.forEach((b) => {
      ctx.save();
      ctx.translate(b.x, b.y + Math.sin(b.wobble) * 3);
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, 7);
      ctx.fill();
      ctx.restore();
    });
    state.powerups.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(state.score / 24);
      ctx.fillStyle = p.kind === 'shield' ? '#67e8f9' : '#f0abfc';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.fillRect(-15, -15, 30, 30);
      ctx.strokeRect(-15, -15, 30, 30);
      ctx.fillStyle = '#111';
      ctx.font = '16px Impact';
      ctx.fillText(p.kind === 'shield' ? 'OK' : '+8', -10, 6);
      ctx.restore();
    });
    state.hazards.forEach((h) => {
      ctx.fillStyle = biome.hazard;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3 + Math.sin(h.pulse);
      roundRect(h.x, h.y, h.w, h.h, 10, true);
      ctx.fillStyle = '#fde047';
      ctx.font = '18px Impact';
      ctx.fillText('AD!', h.x + 12, h.y + 42);
      ctx.fillStyle = '#111';
      ctx.fillRect(h.x + 10, h.y + 52, 34, 5);
    });
    state.confetti.forEach((c) => {
      ctx.fillStyle = c.color;
      ctx.fillRect(c.x, c.y, 5, 8);
    });
    drawHero();
    ctx.fillStyle = '#fff';
    ctx.font = '24px Impact';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    const hud = `Score ${Math.floor(state.score)}  Fresh 🥯 ${state.runBagels}  Combo x${state.combo.toFixed(1)}${state.shield ? '  SHIELD!' : ''}`;
    ctx.strokeText(hud, 18, 34);
    ctx.fillText(hud, 18, 34);
    if (!state.alive) {
      ctx.textAlign = 'center';
      ctx.font = '48px Impact';
      ctx.fillStyle = '#fde047';
      ctx.strokeText('YE OLDE GAME OVER', 450, 300);
      ctx.fillText('YE OLDE GAME OVER', 450, 300);
      ctx.font = '24px Comic Sans MS';
      ctx.fillText('bagels saved — click or space for another randomized run', 450, 345);
      ctx.textAlign = 'left';
    }
    syncUi();
  };
  const syncUi = () => {
    $('high').textContent = save.highScore;
    $('score').textContent = Math.floor(state.score);
    $('wallet').textContent = save.bagels;
    $('fresh').textContent = state.runBagels;
    $('outfit').textContent = outfits[save.outfit % outfits.length].name;
    $('speedBtn').textContent = `Upgrade jump springs (${20 + save.speed * 15} 🥯)`;
    $('magnetBtn').textContent = `Upgrade crumb magnet (${18 + save.magnet * 12} 🥯)`;
    $('speedMeter').style.width = `${Math.min(100, save.speed * 14)}%`;
    $('magnetMeter').style.width = `${Math.min(100, save.magnet * 14)}%`;
    $('biomeName').textContent = currentBiome().name;
  };
  const buy = (kind) => {
    depositBagels();
    const costs = { speed: 20 + save.speed * 15, magnet: 18 + save.magnet * 12, outfit: 35 };
    if (save.bagels < costs[kind]) {
      $('status').textContent = `NEED ${costs[kind] - save.bagels} MORE BAGELS`;
      beep(120);
      return;
    }
    save.bagels -= costs[kind];
    if (kind === 'outfit') save.outfit = (save.outfit + 1) % outfits.length;
    else save[kind] += 1;
    persist();
    syncUi();
    $('status').textContent = 'PURCHASE REMEMBERED';
    beep(880);
  };
  window.addEventListener('keydown', (e) => {
    state.keys[e.code] = true;
    if (e.code === 'Space') {
      e.preventDefault();
      jump();
    }
  });
  window.addEventListener('keyup', (e) => { state.keys[e.code] = false; });
  canvas.addEventListener('pointerdown', () => jump());
  $('nextStory').onclick = () => {
    save.cutscene = (save.cutscene + 1) % panels.length;
    $('story').textContent = panels[save.cutscene];
    persist();
    beep(520);
  };
  $('speedBtn').onclick = () => buy('speed');
  $('magnetBtn').onclick = () => buy('magnet');
  $('outfitBtn').onclick = () => buy('outfit');
  $('saveBtn').onclick = () => {
    depositBagels();
    $('status').textContent = 'BAGEL WALLET SAVED';
    beep(760);
  };
  $('resetSaveBtn').onclick = () => {
    save = { ...defaultSave };
    persist();
    reset();
    $('status').textContent = 'SAVE RESET, CAPITALISM RESTORED';
  };
  for (let i = 0; i < 75; i += 1) {
    state.stars.push({
      x: rand(0, 875),
      y: rand(0, 680),
      v: rand(0.05, 0.35),
      size: rand(10, 26),
      t: ['★', '@', 'LOL', 'ZAP', 'BBS', '404'][i % 6],
      c: ['#22d3ee', '#f0abfc', '#fde047', '#fb7185', '#86efac'][i % 5]
    });
  }
  $('story').textContent = panels[save.cutscene];
  reset();
  update();
})();
