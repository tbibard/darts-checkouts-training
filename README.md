# Darts Checkouts

**Version 0.1.1**

A mental trainer for X01 darts (501, 301…) in double-out format. The goal: memorise and instantly recall the dart combinations that close a leg — before you even aim.

Each session exposes you to varied finishes. With repetition, sequences become reflexes: 121, 170 or 36 are recognised without conscious calculation.

---

## Key Concepts

**Checkout / Finish**
A dart combination that reaches exactly 0, ending on a double.

**Double out**
The last dart must land on a double (D1–D20) or the Bull (50).

**Bust**
Exceeding 0 or finishing without a double voids the turn. The score reverts to before the throw.

**Board sectors**
20 numbered sectors, each with three scoring zones: single, triple (inner ring ×3) and double (outer ring ×2). The Bull scores 50 (double bull), the outer bull scores 25.

---

## Training Modes

- **Random** — "New Checkout" draws a finish between 2 and 170.
- **≥ 99 only** — Focus on high finishes, the ones memory automates least.
- **Custom Checkout** — Drill a specific combination by entering a score.
- **Missed triple** — Hard mode: a targeted triple can randomly miss, forcing an on-the-fly recalculation.
- **Hide remaining** — Hides the intermediate score to train pure mental arithmetic.
- **Wide triples & doubles** — Enlarged click zones, useful on small screens.

---

## Technical Stack

- HTML, JavaScript, SVG
- CSS framework: [Bootstrap 5](https://getbootstrap.com) (MIT Licence)
- Dartboard: programmatically generated SVG drawing
- Voice / speech synthesis: Web Speech API (browser-native)
- No server-side code — runs entirely in the browser

---

## Changelog

**2026-05-30** — Added version button with release history in a modal.

**2025-05-29** — Initial version: game interface with SVG dartboard, stats panel, game options (missed triple, wide doubles, voice), FR/EN i18n and alternative checkouts.

---

## Legal Notices

**Publisher:** Thomas Bibard — Individual

In accordance with Article 6-III of French Law n° 2004-575 of 21 June 2004 on Trust in the Digital Economy (LCEN), this website is published by an individual.

Contact and reporting via the project's GitHub page:
[github.com/tbibard/darts-checkouts-training](https://github.com/tbibard/darts-checkouts-training)

The GitHub page is the preferred channel to report bugs, submit feature requests, or share suggestions.

**Hosting provider:** OVH SAS — 2 rue Kellermann, 59100 Roubaix, France — [ovhcloud.com](https://ovhcloud.com)

### Personal Data & Cookies

This website does not collect any personal data. No third-party cookies are placed on your browser.

Game preferences (language, options) are stored locally in your browser via `localStorage`. This data stays on your device and is never transmitted to any third-party server.

In accordance with the General Data Protection Regulation (GDPR) and applicable data-protection law, you have the right to access, correct, and delete this local data through your browser settings.

### Intellectual Property

The source code of this project is published as open source on GitHub. Content (code, interface, text) is protected by copyright. This project is licensed under the [MIT License](LICENSE).
