# Leksehjelp

Interaktive lekse-moduler etter LK20, delt opp i fag. Forsiden (`index.html`) er et fagvalg, og hvert fag har sin egen side med modulene per trinn. Alle sidene viser fremgang og hva som er klart for repetisjon.

- **Matematikk 9. trinn** (MAT01-06): 9 moduler i `matematikk/9/`
- **Naturfag 10. trinn** (NAT01-05): 12 moduler i `naturfag/10/`.
- **Naturfag 7. trinn**: 10 moduler i `naturfag/7/`, med opplesing (🔊 Les opp). 2. og 4. trinn kommer.
- **Samfunnsfag 7. og 10. trinn** (SAF01-05): 10 + 10 moduler i `samfunnsfag/7/` og `samfunnsfag/10/`, med filmsnutter, opplesing og simuleringer.

## Struktur

```
index.html                 forside med fagvalg
katalog.js                 alle fag og moduler (fag, trinn, fil, id, tittel, mål)
felles/forside.js + .css   forside og fagsider (leser katalog.js)
felles/verksted.css/.js    felles stil og verktøy: V.predict, V.walk, V.check, V.practice
felles/natur.js + .css     naturfag: N.sorter (dra og slipp), N.fill, N.graph, N.slider, N.mc, N.lesOpp (opplesing)
felles/film.js + film.css  filmspiller for animerte filmsnutter (Film.mount)
matematikk/index.html      fagside
matematikk/9/*.html        mattemodulene (+ filmer/)
naturfag/index.html        fagside med trinnvalg
naturfag/10/*.html         naturfagmodulene for 10. trinn
naturfag/7/*.html          naturfagmodulene for 7. trinn
felles/samfunn.js + .css   samfunnsfag: S.scenario (dilemma med valg), S.order (tidslinje), S.flip (kort), bakgrunner til filmer
samfunnsfag/index.html     fagside med trinnvalg
samfunnsfag/7/, 10/        samfunnsfagmodulene, gruppert etter kjerneelement
moduler/*.html             gamle adresser som sender videre til matematikk/9/
```

## Legge til en ny modul

1. Kopier en eksisterende modul i samme fag og trinn som mal.
2. Behold oppbyggingen: gjett først → utforsk (virtuelt forsøk eller figur) → eksempel eller dra og slipp → blandet øving.
3. Øvingen lages med `V.practice(el, {id, title, skills})`. Hver ferdighet har en liste med oppgavegeneratorer.
4. Legg til én linje i `katalog.js` med samme `id` som i `V.practice`. Fjern `kommer:true` når modulen er ferdig.

## Pedagogiske prinsipper

- **Gjennomgåtte eksempler** og **delvis utfylte eksempler** før selvstendig øving.
- **Hentepraksis**: «gjett først»-kort og øving før teori når eleven kommer tilbake.
- **Umiddelbar, feilsøkende tilbakemelding**: vanlige feil (glemt π, brukt diameter, glemt å dele på 3 …) får egen forklaring.
- **Blandet øving** (interleaving): ferdighetene veksles.
- **Spredt repetisjon**: Leitner-bokser per ferdighet, og det eleven kan, kommer tilbake etter 1, 2, 4 og 8 dager.

Fremgang lagres i `localStorage` under `verksted:<id>`, bare i elevens egen nettleser. Ingen personopplysninger sendes noe sted.

## Filmsnutter

Korte animasjoner fra virkelige situasjoner (akvarium, regntønne, melkekartong) bygget med SVG, uten videofiler. Spilleren har play/pause, scener eleven kan hoppe mellom, tekst, valgfri opplesing med nettleserens norske stemme og «Hva tror du?»-stopp der filmen venter på svar. Lag en ny film med `Film.mount(element, {title, scenes:[{dur, text, draw(p), ask?}]})`, se `moduler/filmer/volum.js`.
