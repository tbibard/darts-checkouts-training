/* ══════════════════════════════════════════════════════
   FINISHS VALIDES
══════════════════════════════════════════════════════ */

function computeValidFinishes() {
    const all = new Set();
    for (let i = 1; i <= 20; i++) { all.add(i); all.add(i * 2); all.add(i * 3); }
    all.add(25); all.add(50);
    const scores = Array.from(all);

    const doubles = new Set();
    for (let i = 1; i <= 20; i++) doubles.add(i * 2);
    doubles.add(50);

    const valid = new Set();

    doubles.forEach(d => { if (d >= 2) valid.add(d); });

    scores.forEach(s => {
        doubles.forEach(d => {
            const t = s + d;
            if (t >= 2 && t <= 170) valid.add(t);
        });
    });

    scores.forEach(s1 => {
        scores.forEach(s2 => {
            doubles.forEach(d => {
                const t = s1 + s2 + d;
                if (t >= 2 && t <= 170) valid.add(t);
            });
        });
    });

    return Array.from(valid).sort((a, b) => a - b);
}

const VALID_FINISHES = computeValidFinishes();

/* ══════════════════════════════════════════════════════
   OPTIONS
══════════════════════════════════════════════════════ */

const options = {
    minFinish99:   false,
    hideRemaining: false,
    missedTriple:  false,
    wideRings:     false,
    voice:         true,
};


/* ══════════════════════════════════════════════════════
   ÉTAT DU JEU
══════════════════════════════════════════════════════ */

const game = {
    finish:         0,
    remaining:      0,
    darts:          [],
    startTime:      null,
    elapsed:        0,
    state:          'idle',   // idle | playing | won | lost | bust
    timerInterval:  null,
    thrownEls:      [],
};

const stats = { ok: 0, total: 0, bestTime: null, totalTime: 0 };

/* Vérifie qu'un score peut être terminé en double-out avec au plus dartsLeft fléchettes */
function canFinishIn(remaining, dartsLeft) {
    if (remaining <= 0 || dartsLeft <= 0) return false;
    const isDouble = remaining === 50 ||
                     (remaining % 2 === 0 && remaining / 2 >= 1 && remaining / 2 <= 20);
    if (dartsLeft === 1) return isDouble;
    if (isDouble) return true;
    return !!(CHECKOUTS[remaining] && CHECKOUTS[remaining].two.length > 0);
}

function startNewGame(customFinish = null) {
    if (customFinish !== null) {
        game.finish = customFinish;
    } else {
        const pool  = options.minFinish99 ? VALID_FINISHES.filter(f => f >= 99) : VALID_FINISHES;
        game.finish = pool[Math.floor(Math.random() * pool.length)];
    }
    game.remaining  = game.finish;
    game.darts      = [];
    game.startTime  = null;
    game.elapsed    = 0;
    game.state      = 'playing';

    clearInterval(game.timerInterval);
    game.thrownEls.forEach(el => el.classList.remove('thrown'));
    game.thrownEls = [];

    game.startTime = Date.now();
    game.timerInterval = setInterval(() => {
        game.elapsed = (Date.now() - game.startTime) / 1000;
        document.getElementById('timer').textContent = game.elapsed.toFixed(1) + 's';
    }, 100);

    renderUI();
}

function onDartClick(el) {
    if (game.state !== 'playing') return;
    if (game.darts.length >= 3) return;

    let score      = parseInt(el.dataset.score);
    let label      = el.dataset.label;
    let type       = el.dataset.type;
    const origLabel = label;
    let missed     = false;

    /* Triple manqué : s'applique uniquement au premier tir, aléatoirement */
    if (options.missedTriple && type === 'triple' && game.darts.length === 0 && Math.random() < 0.5) {
        const singleScore = score / 3;
        if (canFinishIn(game.remaining - singleScore, 2)) {
            score  = singleScore;
            label  = String(score);
            type   = 'single';
            missed = true;
            if (options.voice) {
                const utt = new SpeechSynthesisUtterance('Missed triple');
                utt.lang = 'en-US';
                speechSynthesis.speak(utt);
            }
        }
    }

    const isDouble = type === 'double' || type === 'bull';
    const newRem   = game.remaining - score;

    el.classList.add('thrown');
    game.thrownEls.push(el);
    game.darts.push({ score, label, type, isDouble, newRem, missed, origLabel });

    if (newRem < 0) {
        endGame('bust');
    } else if (newRem === 0) {
        game.remaining = 0;
        endGame(isDouble ? 'won' : 'bust');
    } else {
        game.remaining = newRem;
        if (game.darts.length >= 3) endGame('lost');
    }

    renderUI();
}

function endGame(state) {
    game.state   = state;
    clearInterval(game.timerInterval);
    game.elapsed = game.startTime ? (Date.now() - game.startTime) / 1000 : 0;

    stats.total++;
    if (state === 'won') {
        stats.ok++;
        if (stats.bestTime === null || game.elapsed < stats.bestTime) stats.bestTime = game.elapsed;
        stats.totalTime += game.elapsed;
        if (options.voice) {
            const utt = new SpeechSynthesisUtterance('Checkout');
            utt.lang = 'en-US';
            speechSynthesis.speak(utt);
        }
    } else if (state === 'bust' || state === 'lost') {
        if (options.voice) {
            const utt = new SpeechSynthesisUtterance('You missed');
            utt.lang = 'en-US';
            speechSynthesis.speak(utt);
        }
    }
    renderStats();
}

/* ══════════════════════════════════════════════════════
   RENDU UI
══════════════════════════════════════════════════════ */

function renderUI() {
    renderFinishPanel();
    renderDartSlots();
    renderResult();
    renderAlternatives();
    renderReleases();
}

function renderFinishPanel() {
    const fv = document.getElementById('finish-value');
    const rv = document.getElementById('remaining-value');

    if (game.state === 'idle') {
        fv.textContent = '—';
        rv.textContent = t('game.idle');
        rv.style.color = '#8b949e';
        return;
    }

    fv.textContent = game.finish;

    if (game.state === 'won') {
        rv.textContent = t('game.won');
        rv.style.color = '#28a745';
    } else if (game.state === 'bust') {
        const last = game.darts[game.darts.length - 1];
        rv.textContent = last.newRem < 0
            ? t('game.bust.over',    { remaining: game.remaining })
            : t('game.bust.double',  { remaining: game.remaining });
        rv.style.color = '#f0a500';
    } else if (game.state === 'lost') {
        rv.textContent = t('game.lost', { remaining: game.remaining });
        rv.style.color = '#dc3545';
    } else {
        rv.textContent = options.hideRemaining ? '' : t('game.remaining', { remaining: game.remaining });
        rv.style.color = '#8b949e';
    }
}

function renderDartSlots() {
    const container = document.getElementById('dart-slots');
    container.innerHTML = '';

    for (let i = 0; i < 3; i++) {
        const div  = document.createElement('div');
        div.className = 'dart-slot';
        const dart = game.darts[i];

        if (!dart) {
            div.innerHTML = `<span class="slot-num">${i + 1}</span>`;
        } else {
            const isLast = i === game.darts.length - 1;
            div.classList.add('filled');
            if (dart.missed)                     div.classList.add('miss-dart');
            if (isLast && game.state === 'bust') div.classList.add('bust-dart');
            if (isLast && game.state === 'won')  div.classList.add('won-dart');

            const ptsColor  = dart.isDouble ? '#58a6ff' : dart.type === 'triple' ? '#9f7aea' : '#aaa';
            const labelHtml = dart.missed
                ? `<span style="color:#f0a500">${dart.origLabel}</span> <small style="color:#666">→</small> ${dart.label}`
                : dart.label;
            div.innerHTML = `
                <span class="slot-num">${i + 1}</span>
                <span class="slot-label">${labelHtml}</span>
                <span class="slot-pts" style="color:${ptsColor}">${dart.score} pts</span>
            `;
        }
        container.appendChild(div);
    }
}

function renderResult() {
    const card   = document.getElementById('timer-card');
    const inline = document.getElementById('result-inline');

    if (game.state === 'idle' || game.state === 'playing') {
        card.style.borderColor = '';
        inline.innerHTML = '';
        return;
    }

    if (game.state === 'won') {
        card.style.borderColor = '#28a745';
        const n      = game.darts.length;
        const detail = t(n > 1 ? 'result.won.plural' : 'result.won.detail',
                         { time: game.elapsed.toFixed(1), n });
        inline.innerHTML = `<div class="result-inline-won">✓ <strong>${t('result.won.title')}</strong> — <small>${detail}</small></div>`;
    } else if (game.state === 'bust') {
        card.style.borderColor = '#f0a500';
        const last   = game.darts[game.darts.length - 1];
        const reason = last.newRem < 0
            ? t('result.bust.over',  { pts: Math.abs(last.newRem) })
            : t('result.bust.double');
        inline.innerHTML = `<div class="result-inline-bust">✗ <strong>${t('result.bust.title')}</strong> — <small>${reason}</small></div>`;
    } else if (game.state === 'lost') {
        card.style.borderColor = '#dc3545';
        inline.innerHTML = `<div class="result-inline-lost">✗ <strong>${t('result.lost.title')}</strong> — <small>${t('result.lost.detail', { remaining: game.remaining })}</small></div>`;
    }
}

function renderAltDarts(dartsArr) {
    return dartsArr.map((d, i) => {
        const isFirst = i === 0;
        const isLast  = i === dartsArr.length - 1;
        const cls = isFirst ? 'alt-dart first' : isLast ? 'alt-dart last' : 'alt-dart mid';
        return `<span class="${cls}">${d}</span>`;
    }).join('<span class="alt-sep">→</span>');
}

function renderAlternatives() {
    const col  = document.getElementById('alt-column');
    const list = document.getElementById('alt-list');

    if (game.state === 'idle' || game.state === 'playing') {
        col.classList.add('d-none');
        return;
    }

    const data = CHECKOUTS[game.finish];
    if (!data || (data.one.length === 0 && data.two.length === 0 && data.three.length === 0)) {
        col.classList.add('d-none');
        return;
    }

    col.classList.remove('d-none');

    let html = '';
    let hasPrev = false;

    /* ── Section 1 et 2 fléchettes ── */
    const twoSection = [];
    for (const l of data.one) {
        twoSection.push(`<div class="alt-combo"><span class="alt-dart last">${l}</span></div>`);
    }
    for (const combo of data.two) {
        twoSection.push(`<div class="alt-combo">${renderAltDarts(combo)}</div>`);
    }
    if (twoSection.length > 0) {
        html += `<div class="alt-section-title">${t('alt.two')}</div>`;
        html += twoSection.join('');
        hasPrev = true;
    }

    /* ── Section 3 fléchettes ── */
    if (data.three.length > 0) {
        if (hasPrev) html += `<div class="alt-section-divider"></div>`;
        html += `<div class="alt-section-title">${t('alt.three')}</div>`;

        for (const entry of data.three) {
            if (entry.recovery) {
                const missLabel = entry.darts[0];
                let recInfo = '';
                if (entry.recoveryPaths && entry.recoveryPaths.length > 0) {
                    const pathsHtml = entry.recoveryPaths
                        .map(p => `<div class="alt-recovery-path">${renderAltDarts(p)}</div>`)
                        .join('');
                    recInfo = `<div class="alt-recovery-info">${t('alt.ifMiss', { dart: missLabel, value: entry.recoveryValue })}:${pathsHtml}</div>`;
                }
                html += `<div class="alt-recovery-block">${renderAltDarts(entry.darts)}${recInfo}</div>`;
            } else {
                html += `<div class="alt-combo">${renderAltDarts(entry.darts)}</div>`;
            }
        }
    }

    list.innerHTML = html;
}

function renderStats() {
    document.getElementById('stat-ok').textContent    = stats.ok;
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-rate').textContent  = stats.total > 0
        ? Math.round((stats.ok / stats.total) * 100) + '%' : '—';
    document.getElementById('stat-best').textContent = stats.bestTime !== null
        ? stats.bestTime.toFixed(1) + 's' : '—';
    document.getElementById('stat-avg').textContent  = stats.ok > 0
        ? (stats.totalTime / stats.ok).toFixed(1) + 's' : '—';
}

/* ══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */

document.getElementById('btn-new').addEventListener('click', () => startNewGame());

document.getElementById('btn-custom').addEventListener('click', () => {
    const input  = document.getElementById('custom-checkout-input');
    const errEl  = document.getElementById('custom-error');
    const val    = parseInt(input.value, 10);
    if (!VALID_FINISHES.includes(val)) {
        errEl.textContent = t('btn.customError');
        errEl.classList.remove('d-none');
        return;
    }
    errEl.textContent = '';
    errEl.classList.add('d-none');
    startNewGame(val);
});

document.getElementById('custom-checkout-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-custom').click();
});
document.getElementById('opt-99').addEventListener('change',         e => { options.minFinish99   = e.target.checked; });
document.getElementById('opt-hide-rem').addEventListener('change',   e => { options.hideRemaining = e.target.checked; });
document.getElementById('opt-miss-triple').addEventListener('change', e => { options.missedTriple  = e.target.checked; });
document.getElementById('opt-wide-rings').addEventListener('change',  e => {
    options.wideRings  = e.target.checked;
    game.thrownEls     = [];
    buildDartboard(onDartClick, options.wideRings);
});
document.getElementById('opt-voice').addEventListener('change', e => { options.voice = e.target.checked; });

let releasesData = null;

function renderReleases() {
    if (!releasesData) return;
    const sorted = [...releasesData.releases].sort((a, b) => b.date.localeCompare(a.date));
    document.getElementById('releases-list').innerHTML = sorted.map(r => {
        const desc = typeof r.description === 'object'
            ? (r.description[currentLang] ?? r.description.fr ?? '')
            : r.description;
        return `<div class="mb-3">
                    <div class="fw-bold text-warning">${r.date}</div>
                    <div style="font-size:0.9rem">${desc}</div>
                </div>`;
    }).join('<hr class="border-secondary my-2">');
}

function loadReleases() {
    fetch('releases.json')
        .then(r => r.json())
        .then(data => {
            releasesData = data;
            document.getElementById('btn-version').textContent = 'v' + data.version;
            renderReleases();
        });
}

buildDartboard(onDartClick, options.wideRings);
applyTranslations();
renderUI();
loadReleases();
new bootstrap.Modal(document.getElementById('help-modal')).show();
