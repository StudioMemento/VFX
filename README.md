# Memento Ready to Start — Orbital FX V6

## Deploy

1. Estrai lo ZIP. La root del progetto contiene `vercel.json`, `dist` e `scripts`.
2. Usa questa cartella nel repository collegato a Vercel, oppure esegui `vercel` dalla root estratta se usi già la CLI.
3. La configurazione inclusa pubblica `dist` e verifica i riferimenti statici. Nessuna dipendenza runtime, variabile ambiente o chiave.
4. Apri l'URL HTTPS sul device reale. La CTA mantiene `https://mementostudio.it/start`.

La scena usa moduli ES: `file://` non è un'anteprima supportata.

## Interazione

- Mouse: hover, rotazione, dispersione e calore ambra locale a ogni passaggio.
- Touch: tocco e trascinamento sulla scena, in **ogni direzione**. La scena cattura il singolo dito; sollevandolo, le particelle rientrano dolcemente. Il secondo dito interrompe le forze e lascia disponibile il pinch del browser.
- Tap su titolo: apre la CTA. Lo scorrimento iniziato sul footer rimane nativo. Questa separazione evita che un gesto sullo sparkle apra accidentalmente il link.
- Tastiera: Tab / Enter sul link. Reduced motion e fallback statico mantengono la navigazione nativa e lo scroll.

## Direzione visiva

La mesh originale di navigazione è una guida invisibile. Le particelle dello sparkle conservano il materiale di ciascun triangolo campionato: carbone e zone ambra originali. I frammenti continuano a muoversi al suo interno.

Un'unica point light illumina icona e ambiente, seguendo moderatamente il puntatore smussato. Il bagliore sovrapposto nell'angolo è stato rimosso.

L’ambiente riprende la versione di riferimento su visualfx: piano basso (44%), orbita stretta attorno allo sparkle (36%) e scia diagonale ascendente (20%). I grani hanno distribuzione organica; i nastri elicoidali superiori e la griglia fitta della V5 sono rimossi. Il flusso continua oltre il frame senza dissolversi ai suoi bordi.

Vicino al cursore affiora una micro-mesh triangolare aderente alle tre superfici, con profondità reale e rare facce illuminate. Lo stesso campo accende typo e bordo: non viene disegnata una rete nello spazio vuoto. Lo sparkle conserva asset, simulazione, composizione, materiale e input della V5.

L'apertura più contenuta mantiene leggibili le superfici lontane. L'icona usa il 25% di particelle in più rispetto a V2 e una copertura più uniforme; le zone ambra derivano sempre dai materiali originali.

Typo vettoriale uniforme Inter 400, tracking positivo: READY TO START? su una riga quando la larghezza è almeno 640 px e il rapporto del frame è ≥1,12; due righe nei viewport stretti o portrait. Le righe riempiono la distanza fra i due padding. Un unico gradiente bianco→ambra a 135°, dall’alto a sinistra verso l’ambra in basso a destra, condiviso fra tutte le righe; all’hover, una trama triangolare e un rimlight locali seguono il cursore e raggiungono i caratteri vicini. Nessuna deformazione o simulazione particellare del testo. Nessun chevron. La luce locale aggiunge una trama sottile anche lungo il bordo reale della tab, mantenendo i tagli diagonali. La mesh viene costruita soltanto al resize. I preset sono in `dist/cursor-field.js`.

## Budget e sfocatura

| Profilo iniziale | Sparkle | Ancore ambiente | DPR max | DOF automatico |
|---|---:|---:|---:|---|
| Desktop | 30.000 | 14.000 | 1,25 | Leggero, se depth texture disponibile |
| Mobile / stretto | 15.000 | 6.000 | 1 | OFF |

L’ambiente torna a un grano per ancora. Il materiale triangolare usa una draw call aggiuntiva soltanto mentre il cursore è presente o la luce sta dissolvendo; la geometria inviata è limitata al suo raggio.

L'adattamento al carico può ridurre DPR/densità e disattivare il DOF automatico. La prospettiva e le dimensioni fisiche restano attive con DOF spento.

`?fx=off` disattiva il nuovo materiale su typo, bordo e ambiente, lasciando invariata la simulazione dello sparkle. `?perf=1` include il toggle «Materiale cursore» per un confronto senza ricaricare.

`?dof=on` forza il filtro; `?dof=off` lo salta completamente. `?perf=1` aggiunge un pannello locale con confronto ON/OFF e registrazioni di 30 s. Vedi `PERFORMANCE.md`.

I test di layout nel browser non certificano touch, FPS o temperatura di un telefono reale. Il progetto è predisposto per questa verifica dopo il deploy; il report non invia dati a servizi esterni.
