/* ══════════════════════════════════════════════════════
   INTERNATIONALISATION
   Expose : t(key, vars), setLang(lang), applyTranslations()
══════════════════════════════════════════════════════ */

const TRANSLATIONS = {
    fr: {
        /* Modale releases */
        'releases.title':         'Historique des versions',

        /* Libellés de section */
        'label.finish':           'Checkout à réaliser',
        'label.darts':            'Fléchettes',
        'label.time':             'Temps',
        'label.options':          'Options',
        'label.session':          'Session',
        'label.alternatives':     'Checkouts alternatifs',
        'alt.two':                '≤ 2 fléchettes',
        'alt.three':              '3 fléchettes',
        'alt.ifMiss':             'Si {dart} manqué pour {value}',

        /* Options */
        'opt.finish99':           'Checkout ≥ 99 uniquement',
        'opt.hideRemaining':      'Masquer le restant',
        'opt.missedTriple':       'Triple manqué',
        'opt.missedTriple.note':  '(aléatoire)',
        'opt.wideRings':          'Triples et doubles élargis',
        'opt.voice':              'Voix (son)',

        /* Bouton */
        'btn.newFinish':          'Nouveau Checkout',
        'btn.customFinish':       'Checkout personnalisé',
        'btn.customError':        'Checkout invalide (2–170)',

        /* Stats */
        'stat.success':           'Réussis',
        'stat.total':             'Total',
        'stat.rate':              'Taux',
        'stat.best':              'Meilleur :',
        'stat.avg':               'Moy. :',

        /* État du jeu — sous le score */
        'game.idle':              'Appuyez sur "Nouveau Checkout"',
        'game.won':               '✓ Checkout réalisé !',
        'game.bust.over':         'Dépassement — restait {remaining}',
        'game.bust.double':       'Doit finir sur une double — restait {remaining}',
        'game.lost':              'Raté — restait {remaining}',
        'game.remaining':         'Restant : {remaining}',

        /* Panneau résultat */
        'result.won.title':       'Bravo !',
        'result.won.detail':      '{time}s — {n} fléchette',
        'result.won.plural':      '{time}s — {n} fléchettes',
        'result.bust.title':      'Raté',
        'result.bust.over':       'Dépassement de {pts} pts',
        'result.bust.double':     'Doit finir sur une Double / Bull',
        'result.lost.title':      'Raté',
        'result.lost.detail':     'Il restait {remaining} pts',
    },

    en: {
        /* Modale releases */
        'releases.title':         'Version history',

        'label.finish':           'Checkout to complete',
        'label.darts':            'Darts',
        'label.time':             'Time',
        'label.options':          'Options',
        'label.session':          'Session',
        'label.alternatives':     'Alternative checkouts',
        'alt.two':                '≤ 2 darts',
        'alt.three':              '3 darts',
        'alt.ifMiss':             'If {dart} missed for {value}',

        'opt.finish99':           'Checkout ≥ 99 only',
        'opt.hideRemaining':      'Hide remaining',
        'opt.missedTriple':       'Missed triple',
        'opt.missedTriple.note':  '(random)',
        'opt.wideRings':          'Wide triples & doubles',
        'opt.voice':              'Voice (sound)',

        'btn.newFinish':          'New Checkout',
        'btn.customFinish':       'Custom Checkout',
        'btn.customError':        'Invalid checkout (2–170)',

        'stat.success':           'Success',
        'stat.total':             'Total',
        'stat.rate':              'Rate',
        'stat.best':              'Best:',
        'stat.avg':               'Avg:',

        'game.idle':              'Press "New Checkout" to start',
        'game.won':               '✓ Checkout completed!',
        'game.bust.over':         'Bust — {remaining} remaining',
        'game.bust.double':       'Must finish on a double — {remaining} remaining',
        'game.lost':              'Missed — {remaining} remaining',
        'game.remaining':         'Remaining: {remaining}',

        'result.won.title':       'Well done!',
        'result.won.detail':      '{time}s — {n} dart',
        'result.won.plural':      '{time}s — {n} darts',
        'result.bust.title':      'Missed',
        'result.bust.over':       'Bust by {pts} pts',
        'result.bust.double':     'Must finish on a Double / Bull',
        'result.lost.title':      'Missed',
        'result.lost.detail':     '{remaining} pts remaining',
    },
};

let currentLang = 'fr';

/**
 * Traduit une clé avec interpolation des variables {varName}.
 * @param {string} key
 * @param {Object} vars
 * @returns {string}
 */
function t(key, vars = {}) {
    const dict = TRANSLATIONS[currentLang] ?? TRANSLATIONS.fr;
    let str = dict[key] ?? TRANSLATIONS.fr[key] ?? key;
    for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, v);
    }
    return str;
}

/**
 * Applique les traductions à tous les éléments [data-i18n]
 * et met à jour l'état actif des boutons de langue.
 */
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-lang]:not(.lang-btn)').forEach(el => {
        el.style.display = el.dataset.lang === currentLang ? '' : 'none';
    });
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
}

/**
 * Change la langue active, met à jour le DOM statique et
 * déclenche un re-rendu des parties dynamiques si app.js est chargé.
 * @param {string} lang  Code langue ('fr' | 'en')
 */
function setLang(lang) {
    if (!TRANSLATIONS[lang] || lang === currentLang) return;
    currentLang = lang;
    applyTranslations();
    if (typeof renderUI === 'function') renderUI();
}

/* ── Boutons de sélection de langue ── */
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
});
