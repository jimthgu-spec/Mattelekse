# Mattelekse – Matematikk 9. trinn

Interaktive lekse-moduler etter LK20 (kompetansemål etter 9. trinn, MAT01-06). Forsiden (`index.html`) lister alle modulene og viser fremgang og hva som er klart for repetisjon.

## Struktur

```
index.html                 forside (lista «moduler» nederst)
felles/verksted.css        felles stil (farger, lys/mørk modus, layout)
felles/verksted.js         felles verktøy: V.predict, V.walk, V.check, V.practice
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
