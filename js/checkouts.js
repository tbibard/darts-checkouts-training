/* ══════════════════════════════════════════════════════
   CHECKOUTS — Table précalculée au chargement de la page
   CHECKOUTS[score] = {
     one:   string[]           – label des doubles directs (1 fléchette)
     two:   string[][]         – combos en 2 fléchettes
     three: CheckoutEntry[]    – combos en 3 fléchettes
   }
   CheckoutEntry = { darts: string[], recovery: bool, recoveryPaths: string[][]|null }
══════════════════════════════════════════════════════ */

const CHECKOUTS = (() => {

    /* ── Toutes les fléchettes physiques ── */
    const ALL = [];
    for (let i = 1; i <= 20; i++) {
        ALL.push({ s: i,    l: String(i), d: false, t: false, n: i });
        ALL.push({ s: i*2,  l: `D${i}`,  d: true,  t: false, n: i });
        ALL.push({ s: i*3,  l: `T${i}`,  d: false, t: true,  n: i });
    }
    ALL.push({ s: 25, l: 'OB',   d: false, t: false, n: null });
    ALL.push({ s: 50, l: 'Bull', d: true,  t: false, n: null });

    const DOUBLES = ALL.filter(d => d.d);

    /* ── Index score → fléchettes pour lookup O(1) ── */
    const byScore = {};
    for (const dart of ALL) {
        if (!byScore[dart.s]) byScore[dart.s] = [];
        byScore[dart.s].push(dart);
    }

    /* ── Priorité 1er tir ──
       T20>T19>T18>T17>T16>T15 > autres triples↓ > OB > simples↓ > doubles↓ > Bull */
    const FP = {};
    ['T20','T19','T18','T17','T16','T15'].forEach((l, i) => { FP[l] = i; });
    for (let i = 14; i >= 1; i--) FP[`T${i}`] = 6 + (14 - i);
    FP['OB'] = 21;
    for (let i = 20; i >= 1; i--) FP[String(i)] = 22 + (20 - i);
    for (let i = 20; i >= 1; i--) FP[`D${i}`] = 43 + (20 - i);
    FP['Bull'] = 64;
    const fpri = l => FP[l] ?? 999;

    /* ── Priorité dernier tir ──
       D20 > D10 > D16 > D8 > D12 > D6 > Bull > autres doubles */
    const LP = {};
    const L_STD = ['D20', 'D10', 'D16', 'D8', 'D12', 'D6', 'Bull'];
    L_STD.forEach((l, i) => { LP[l] = i; });
    let lIdx = L_STD.length;
    for (let i = 20; i >= 1; i--) { const k = `D${i}`; if (!(k in LP)) LP[k] = lIdx++; }
    const lpri = l => LP[l] ?? 999;

    /* ── Checkouts en 2 fléchettes ── */
    function buildTwo(score) {
        const res = [], seen = new Set();
        for (const last of DOUBLES) {
            const r1 = score - last.s;
            if (r1 <= 0) continue;
            for (const first of (byScore[r1] || [])) {
                const k = `${first.l}|${last.l}`;
                if (!seen.has(k)) { seen.add(k); res.push([first.l, last.l]); }
            }
        }
        return res.sort((a, b) => {
            const f = fpri(a[0]) - fpri(b[0]);
            return f !== 0 ? f : lpri(a[1]) - lpri(b[1]);
        }).slice(0, 8);
    }

    /* ── Checkouts en 3 fléchettes ── */
    function buildThree(score, twoMap) {
        const res = [], seen = new Set();

        for (const last of DOUBLES) {
            const r2 = score - last.s;
            if (r2 <= 0) continue;

            for (const mid of ALL) {
                /* Règle : 2e tir ne peut pas être une double,
                   sauf si c'est la même double que le dernier tir */
                if (mid.d && mid.l !== last.l) continue;

                /* Règle : 2e tir ne peut pas être un triple si un simple
                   atteint le même score (T1–T6 : score ≤ 20) */
                if (mid.t && mid.s <= 20) continue;

                const r1 = r2 - mid.s;
                if (r1 <= 0) continue;

                for (const first of (byScore[r1] || [])) {
                    const k = `${first.l}|${mid.l}|${last.l}`;
                    if (seen.has(k)) continue;
                    seen.add(k);

                    /* Détection recovery : 1er tir = triple Tx,
                       si raté (simple x), reste score-x finissable en 2 fléchettes */
                    let recovery = false, recoveryPaths = null;
                    if (first.t && first.n !== null) {
                        const rs = score - first.n;
                        const paths = rs > 0 ? twoMap[rs] : null;
                        if (paths && paths.length > 0) {
                            recovery = true;
                            recoveryPaths = paths;
                        }
                    }

                    res.push({ darts: [first.l, mid.l, last.l], recovery, recoveryValue: first.n, recoveryPaths });
                }
            }
        }

        /* Tri : recovery en tête, puis priorité 1er tir, puis priorité dernier tir */
        res.sort((a, b) => {
            if (a.recovery !== b.recovery) return a.recovery ? -1 : 1;
            const f = fpri(a.darts[0]) - fpri(b.darts[0]);
            if (f !== 0) return f;
            return lpri(a.darts[2]) - lpri(b.darts[2]);
        });

        return res.slice(0, 8);
    }

    /* ── Précalcul en 2 passes ── */
    const twoMap = {};
    for (let s = 2; s <= 170; s++) twoMap[s] = buildTwo(s);

    const out = {};
    for (let s = 2; s <= 170; s++) {
        out[s] = {
            one:   DOUBLES.filter(d => d.s === s).map(d => d.l),
            two:   twoMap[s],
            three: buildThree(s, twoMap),
        };
    }

    return out;
})();
