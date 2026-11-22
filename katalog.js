/* Katalog over alle fag og moduler i Leksehjelp.
   Ny modul: legg HTML-fila i <fag>/<trinn>/ og legg til én linje i «moduler» under.
   fil  = sti fra rotmappa. id = lagringsnøkkelen modulen bruker i V.practice (eller hele nøkkelen hvis den har -v1).
   mal  = kompetansemål modulen dekker (matematikk: nummer som på udir.no; naturfag: tema i stikkord).
   kommer:true = vises som «Kommer», uten lenke. */
window.KATALOG = {
  fag: [
    { id:"matematikk", navn:"Matematikk", tekst:"Geometri, måling, statistikk og sannsynlighet.", laereplan:"MAT01-06", farge:"#3350c4", ikon:"∑", trinn:[9] },
    { id:"naturfag", navn:"Naturfag", tekst:"Forsøk, kropp, energi, stoffer, jorda og livet på jorda.", laereplan:"NAT01-05", farge:"#2f8f46", ikon:'<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/></svg>', trinn:[10,7,4,2] }
  ],
  moduler: [
    // Matematikk 9. trinn (sorteres etter laveste mål)
    { fag:"matematikk", trinn:9, fil:"matematikk/9/volum-prisme-sylinder.html", id:"volumverkstedet-v1", tittel:"Volumverkstedet", tekst:"Volum av prisme og sylinder, og omregning mellom cm³, dm³ og liter.", tema:"Geometri og måling", mal:[6] },
    { fag:"matematikk", trinn:9, fil:"matematikk/9/pytagoras.html", id:"pytagoras", tittel:"Pytagoras og trekanter", tekst:"a² + b² = c², finne ukjente sider og avgjøre om en trekant er rettvinklet.", tema:"Geometri og måling", mal:[3,4] },
    { fag:"matematikk", trinn:9, fil:"matematikk/9/pyramide-kjegle-kule.html", id:"pyramide-kjegle-kule", tittel:"Pyramide, kjegle og kule", tekst:"Volum og overflate av spisse og runde former, med Pytagoras for å finne høyden.", tema:"Geometri og måling", mal:[6,3] },
    { fag:"matematikk", trinn:9, fil:"matematikk/9/formlikhet.html", id:"formlikhet", tittel:"Formlikhet og kongruens", tekst:"Målestokk, like vinkler og å måle høye ting med skygger.", tema:"Geometri og måling", mal:[2,3] },
    { fag:"matematikk", trinn:9, fil:"matematikk/9/hva-skjer-hvis.html", id:"hva-skjer-hvis", tittel:"Hva skjer hvis …?", tekst:"Dobler du sidene, blir arealet ×4 og volumet ×8. Utforsk hvorfor.", tema:"Geometri og måling", mal:[5] },
    { fag:"matematikk", trinn:9, fil:"matematikk/9/sammensatte-enheter.html", id:"sammensatte-enheter", tittel:"Sammensatte enheter", tekst:"Fart, km/h og m/s, pris per kilo og tetthet.", tema:"Geometri og måling", mal:[1] },
    { fag:"matematikk", trinn:9, fil:"matematikk/9/statistikk.html", id:"statistikk", tittel:"Statistikk", tekst:"Gjennomsnitt, median, typetall og spredning, også i dine egne data.", tema:"Statistikk og sannsynlighet", mal:[8] },
    { fag:"matematikk", trinn:9, fil:"matematikk/9/sannsynlighet.html", id:"sannsynlighet", tittel:"Sannsynlighet og simulering", tekst:"Kuler, terninger og spill, og simulering med egen kode.", tema:"Statistikk og sannsynlighet", mal:[10,11] },
    { fag:"matematikk", trinn:9, fil:"matematikk/9/grafdetektiven.html", id:"grafdetektiven", tittel:"Grafdetektiven", tekst:"Finn ut hvordan grafer i media kan lure deg, og lag dem selv.", tema:"Statistikk og sannsynlighet", mal:[7,9] },

    // Naturfag 10. trinn (i anbefalt rekkefølge)
    { fag:"naturfag", trinn:10, fil:"naturfag/10/forskerskolen.html", id:"nat10-forskerskolen", tittel:"Forskerskolen", tekst:"Planlegg et forsøk, finn variablene, vurder risiko og feilkilder.", tema:"Naturvitenskapelige praksiser", mal:["hypoteser og variabler","analyse av data","risikovurdering"] },
    { fag:"naturfag", trinn:10, fil:"naturfag/10/atomer.html", id:"nat10-atomer", tittel:"Atomer og periodesystemet", tekst:"Bygg atomer med protoner, nøytroner og elektroner, og finn mønstrene i periodesystemet.", tema:"Energi og materie", mal:["atommodeller","periodesystemet"] },
    { fag:"naturfag", trinn:10, fil:"naturfag/10/reaksjoner.html", id:"nat10-reaksjoner", tittel:"Kjemiske reaksjoner", tekst:"Se atomene bytte partner, og vis at massen aldri forsvinner.", tema:"Energi og materie", mal:["kjemiske reaksjoner","massebevaring"] },
    { fag:"naturfag", trinn:10, fil:"naturfag/10/energi.html", id:"nat10-energi", tittel:"Energi", tekst:"Energi forsvinner aldri, men kvaliteten synker. Bygg ditt eget kraftverk.", tema:"Energi og materie", mal:["energibevaring","energikvalitet","energiproduksjon og miljø"] },
    { fag:"naturfag", trinn:10, fil:"naturfag/10/klima.html", kommer:true, id:"nat10-klima", tittel:"Drivhuseffekt og klima", tekst:"Skru CO₂ opp og ned og se hva som skjer med temperaturen.", tema:"Jorda og livet på jorda", mal:["drivhuseffekten","klimaendringer"] },
    { fag:"naturfag", trinn:10, fil:"naturfag/10/fotosyntese.html", id:"nat10-fotosyntese", tittel:"Celler, fotosyntese og celleånding", tekst:"Tell oksygenbobler, test lys, CO₂ og temperatur, og sammenlign plante- og dyreceller.", tema:"Jorda og livet på jorda", mal:["celler","fotosyntese","celleånding"] },
    { fag:"naturfag", trinn:10, fil:"naturfag/10/evolusjon.html", kommer:true, id:"nat10-evolusjon", tittel:"Evolusjon", tekst:"Spill mange generasjoner og se naturlig utvalg skje.", tema:"Jorda og livet på jorda", mal:["evolusjon","arv og variasjon"] },
    { fag:"naturfag", trinn:10, fil:"naturfag/10/okosystemer.html", kommer:true, id:"nat10-okosystemer", tittel:"Økosystemer og stoffkretsløp", tekst:"Næringsnett, karbonets kretsløp, ressursdilemmaer og samisk tradisjonskunnskap.", tema:"Jorda og livet på jorda", mal:["økosystemer","stoffkretsløp","ressursdilemma","samisk tradisjonskunnskap"] },
    { fag:"naturfag", trinn:10, fil:"naturfag/10/platetektonikk.html", kommer:true, id:"nat10-platetektonikk", tittel:"Platetektonikk", tekst:"Dra i tiden og se kontinentene flytte seg, fjell vokse og vulkaner få utbrudd.", tema:"Jorda og livet på jorda", mal:["platetektonikk"] },
    { fag:"naturfag", trinn:10, fil:"naturfag/10/kroppens-styring.html", kommer:true, id:"nat10-kroppens-styring", tittel:"Kroppens styring", tekst:"Nerver og hormoner, rus og doping, og seksuell helse.", tema:"Kropp og helse", mal:["nervesystem og hormoner","rusmidler og doping","seksuell og reproduktiv helse"] },
    { fag:"naturfag", trinn:10, fil:"naturfag/10/immunforsvar.html", kommer:true, id:"nat10-immunforsvar", tittel:"Immunforsvar og vaksiner", tekst:"Følg kroppens forsvar mot et virus, og se hvordan vaksiner stopper smitte.", tema:"Kropp og helse", mal:["immunforsvar","vaksiner"] },
    { fag:"naturfag", trinn:10, fil:"naturfag/10/sender-mottaker.html", kommer:true, id:"nat10-sender-mottaker", tittel:"Sender og mottaker", tekst:"Kod meldinger til lys og lyd, og programmer en sender.", tema:"Teknologi", mal:["teknologiske systemer","programmering"] },

    // Naturfag på andre trinn: kommer
    { fag:"naturfag", trinn:7, kommer:true, tittel:"Naturfag 7. trinn", tekst:"10 moduler: partikkelmodellen, elektrisitet, næringsnett, jorda i rommet og mer.", tema:"Kommer" },
    { fag:"naturfag", trinn:4, kommer:true, tittel:"Naturfag 4. trinn", tekst:"8 moduler: bland og se, energikjeden, vannets kretsløp, kroppen min og mer.", tema:"Kommer" },
    { fag:"naturfag", trinn:2, kommer:true, tittel:"Naturfag 2. trinn", tekst:"4 moduler: sansene, vær og årstider, sorter og bygg, frisk og miljøvennlig.", tema:"Kommer" }
  ]
};
