# Mattelekse – Matematikk 9. trinn

Interaktive lekse-moduler etter LK20 (kompetansemål etter 9. trinn, MAT01-06). Forsiden (`index.html`) lister alle modulene og viser fremgang og hva som er klart for repetisjon.

## Struktur

```
index.html                 forside (lista «moduler» nederst)
felles/verksted.css        felles stil (farger, lys/mørk modus, layout)
felles/verksted.js         felles verktøy: V.predict, V.walk, V.check, V.practice
felles/film.js + film.css  filmspiller for animerte filmsnutter (Film.mount)
moduler/filmer/*.js        filmsnuttene til hver modul
moduler/filmer/lyd/        innspilt opplesing (mp3), lages automatisk av GitHub Actions
verktoy/lyd/               samle.js (finner tekstene) og lag_lyd.py (lager mp3)
moduler/*.html             én fil per modul
```

## Legge til en ny modul

1. Kopier en eksisterende modul i `moduler/` (for eksempel `pytagoras.html`) som mal.
2. Behold oppbyggingen: utforsk med figur → «gjett først» → gjennomgått eksempel → delvis utfylt eksempel → blandet øving.
3. Øvingen lages med `V.practice(el, {id, title, skills})`. Hver ferdighet har en liste med oppgavegeneratorer.
4. Legg til én linje i `moduler`-lista i `index.html`, med samme `id` som i `V.practice`.

## Pedagogiske prinsipper

- **Gjennomgåtte eksempler** og **delvis utfylte eksempler** før selvstendig øving.
- **Hentepraksis**: «gjett først»-kort og øving før teori når eleven kommer tilbake.
- **Umiddelbar, feilsøkende tilbakemelding**: vanlige feil (glemt π, brukt diameter, glemt å dele på 3 …) får egen forklaring.
- **Blandet øving** (interleaving): ferdighetene veksles.
- **Spredt repetisjon**: Leitner-bokser per ferdighet, og det eleven kan, kommer tilbake etter 1, 2, 4 og 8 dager.

Fremgang lagres i `localStorage` under `verksted:<id>`, bare i elevens egen nettleser. Ingen personopplysninger sendes noe sted.

## Filmsnutter

Korte animasjoner fra virkelige situasjoner (akvarium, regntønne, melkekartong) bygget med SVG, uten videofiler. Spilleren har play/pause, scener eleven kan hoppe mellom, tekst, valgfri opplesing med nettleserens norske stemme og «Hva tror du?»-stopp der filmen venter på svar. Lag en ny film med `Film.mount(element, {title, scenes:[{dur, text, draw(p), ask?}]})`, se `moduler/filmer/volum.js`.

### Opplesing

Filmene bruker ferdig innspilte mp3-filer når de finnes, og ellers nettleserens talesyntese. Når en filmtekst endres og pushes, lager GitHub Actions (`.github/workflows/lyd.yml`) nye lydfiler automatisk. Uten nøkkel brukes Piper (åpen kildekode). Legger du inn hemmelighetene `AZURE_SPEECH_KEY` og `AZURE_SPEECH_REGION` i repoet, brukes Azure sin naturlige norske stemme Pernille, og alle filene lages på nytt.
