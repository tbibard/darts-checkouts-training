/* ══════════════════════════════════════════════════════
   CIBLE SVG — génération du dartboard
   Dépendance : aucune. Expose buildDartboard(clickHandler).
══════════════════════════════════════════════════════ */

const NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

/* Rayons en unités SVG (viewBox 680×680, centre 0,0) */
const R_DEFAULT = {
    bull:        12,
    outerBull:   28,
    tripleInner: 174,
    tripleOuter: 188,
    doubleInner: 285,
    doubleOuter: 300,
    label:       323,
};

/* Rayons élargis : bull ×2.5, outerBull ×2.5, triple ×3 (174→146), double ×3 (285→255) */
const R_WIDE = {
    bull:        30,
    outerBull:   70,
    tripleInner: 146,
    tripleOuter: 188,
    doubleInner: 255,
    doubleOuter: 300,
    label:       323,
};

const COLOR = {
    board: '#2c1a08',
    wire:  '#c8a040',
    light: '#e8dcc5',
    dark:  '#181818',
    red:   '#c0392b',
    green: '#1e8449',
    label: '#ffffff',
};

/* Références aux éléments SVG des secteurs (pour reset visuel) */
const sectorEls = [];

/* Coordonnées polaires → cartésiennes SVG (0° = haut, sens horaire) */
function pt(r, deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: r * Math.cos(rad), y: r * Math.sin(rad) };
}

/* Chemin SVG d'un secteur annulaire entre r1 et r2, de a1° à a2° */
function annulusSector(r1, r2, a1, a2) {
    const s1 = pt(r1, a1), s2 = pt(r2, a1),
          e2 = pt(r2, a2), e1 = pt(r1, a2);
    const lg = (a2 - a1 > 180) ? 1 : 0;
    return `M${s1.x},${s1.y} L${s2.x},${s2.y} A${r2},${r2} 0 ${lg} 1 ${e2.x},${e2.y} L${e1.x},${e1.y} A${r1},${r1} 0 ${lg} 0 ${s1.x},${s1.y} Z`;
}

/* Crée un élément SVG avec attributs */
function ns(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
}

/**
 * Construit le dartboard SVG dans #dartboard.
 * @param {function} clickHandler  Appelé avec l'élément SVG cliqué.
 * @param {boolean}  wideRings     Si true, triples et doubles ont une épaisseur doublée.
 */
function buildDartboard(clickHandler, wideRings = false) {
    const R   = wideRings ? R_WIDE : R_DEFAULT;
    const svg = document.getElementById('dartboard');
    svg.innerHTML  = '';
    sectorEls.length = 0;

    /* Fond bois + anneau métallique */
    svg.appendChild(ns('circle', { cx: 0, cy: 0, r: R.doubleOuter + 34, fill: COLOR.board }));
    svg.appendChild(ns('circle', { cx: 0, cy: 0, r: R.doubleOuter + 4,  fill: '#111', stroke: COLOR.wire, 'stroke-width': 2.5 }));

    NUMBERS.forEach((num, i) => {
        const a1   = i * 18 - 9, a2 = a1 + 18;
        const even = i % 2 === 0;
        const sc   = even ? COLOR.light : COLOR.dark;
        const rc   = even ? COLOR.red   : COLOR.green;

        const sectors = [
            { d: annulusSector(R.doubleInner, R.doubleOuter, a1, a2), fill: rc, score: num * 2, label: `D${num}`, type: 'double' },
            { d: annulusSector(R.tripleOuter, R.doubleInner, a1, a2), fill: sc, score: num,     label: `${num}`,  type: 'single' },
            { d: annulusSector(R.tripleInner, R.tripleOuter, a1, a2), fill: rc, score: num * 3, label: `T${num}`, type: 'triple' },
            { d: annulusSector(R.outerBull,   R.tripleInner, a1, a2), fill: sc, score: num,     label: `${num}`,  type: 'single' },
        ];

        sectors.forEach(({ d, fill, score, label, type }) => {
            const el = ns('path', {
                d, fill, stroke: COLOR.wire, 'stroke-width': 0.8,
                'stroke-linejoin': 'round', class: 'dart-sector',
            });
            el.dataset.score = score;
            el.dataset.label = label;
            el.dataset.type  = type;
            el.addEventListener('click', () => clickHandler(el));
            svg.appendChild(el);
            sectorEls.push(el);
        });

        /* Numéro */
        const lp  = pt(R.label, i * 18);
        const txt = ns('text', {
            x: lp.x, y: lp.y,
            'text-anchor': 'middle', 'dominant-baseline': 'middle',
            fill: COLOR.label, 'font-size': 22, 'font-weight': 'bold',
            'font-family': 'Arial, sans-serif', 'pointer-events': 'none',
        });
        txt.textContent = num;
        svg.appendChild(txt);
    });

    /* Outer Bull (25 pts) */
    const ob = ns('circle', { cx: 0, cy: 0, r: R.outerBull, fill: COLOR.green, stroke: COLOR.wire, 'stroke-width': 1, class: 'dart-sector' });
    ob.dataset.score = 25; ob.dataset.label = 'OB'; ob.dataset.type = 'outerBull';
    ob.addEventListener('click', () => clickHandler(ob));
    svg.appendChild(ob);
    sectorEls.push(ob);

    /* Bull (50 pts) */
    const bull = ns('circle', { cx: 0, cy: 0, r: R.bull, fill: COLOR.red, stroke: COLOR.wire, 'stroke-width': 1, class: 'dart-sector' });
    bull.dataset.score = 50; bull.dataset.label = 'Bull'; bull.dataset.type = 'bull';
    bull.addEventListener('click', () => clickHandler(bull));
    svg.appendChild(bull);
    sectorEls.push(bull);
}
