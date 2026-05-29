# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Ce projet a pour ambition de réaliser une interface permettant de s'entrainer à calculer et retenir les combinaisons permettant de finaliser une partie de X01 (501, 301, ...) aux fléchettes en mode double-out.
L'interface se voudra ludique, le moteur du jeu décidera quel finnish le joueur devra terminer et le joueur devra sélectionner les secteurs sur une cible virtuelle permettant de réaliser le bon finnish.
Lorsque le joueur à finaliser ses trois touches de la cible virtuelle, le score est comptabilisé et affiché. 
Le jeu permet de vérifier les finish du joueur, comptabilisé les taux d'erreur ou de réussite et comptabilisé le temps de réalisation lorsque réussi pour chaque finish.

## Sources sur les jeux de fléchettes et de X01 : 
- https://fr.wikipedia.org/wiki/Fl%C3%A9chettes
- https://www.la-flechette.com/content/7-les-regles-du-jeu-de-flechettes?srsltid=AfmBOoosyLI4e7xDJtUZS2-Zjqg37YO0QiKQTbQz4OUxPPBJgXYrka9e
- https://www.darts-nerd.com/fr/guides/games/301-et-501

## Technique
Le jeu doit être réalisé en html / javascript / svg.
L'interface du jeu est réalisé en html et javascript, la cible est réalisé en svg et permet de facilement gérer des interactions avec les secteurs de cibles.

Framework frontend : bootstrap
Pas de framework javascript sauf si gain réel significatif. l'utilisateur 
