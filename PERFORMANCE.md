# Performance e costo del bokeh — V6

La profondità geometrica è reale: prospettiva, piani a Z differenti e dimensioni fisiche. La sfocatura è un'approssimazione da buffer di profondità, non una simulazione ottica completa.

## Costo implementato

| Modalità | Rendering geometria | Postprocess | Target intermedi |
|---|---:|---:|---|
| DOF OFF | 1 passaggio | Nessuno | Nessuno |
| DOF ON, depth texture disponibile | 1 passaggio | 2 passaggi da 7 campioni | Colore/profondità full-res + colore half-res |
| DOF ON forzato senza depth texture | 2 passaggi | 2 passaggi da 7 campioni | Colore/profondità full-res + colore half-res |

Il primo filtro usa metà larghezza e metà altezza, quindi un quarto dei pixel; il secondo compone alla risoluzione del canvas. Ogni campione legge colore e profondità. La versione precedente usava 11 campioni per passaggio: **7 invece di 11 riduce il numero di campioni del filtro del 36,4%**, non significa −36,4% del tempo totale o +36,4% FPS.

L'apertura è più contenuta, il raggio massimo è sceso da 17 a 8 pixel CSS e il bagliore artificiale nell'angolo è stato eliminato. La riduzione del raggio modifica l'aspetto, non riduce da sola il numero fisso di campioni.

Su mobile/viewport stretta il default è OFF: si eliminano i due passaggi del filtro e i target intermedi. La scena conserva la prospettiva. Si può riattivare per il confronto. Desktop disattiva il filtro se la qualità automatica scende; se forzato manualmente resta nella modalità scelta.

Non c'è una percentuale universale di costo GPU: dipende da risoluzione, DPR, fill rate, shader, driver e temperatura. Il timer CPU del report **non misura** il lavoro asincrono della GPU.

## Confronto sullo stesso device

1. Apri il deploy con `?perf=1`; attendi circa 10 s per stabilizzare caricamento e qualità.
2. Imposta **Sfocatura: OFF**, registra 30 s in idle e salva il JSON.
3. Imposta **Sfocatura: ON**, ripeti gli stessi 30 s e salva il secondo JSON.
4. Ripeti OFF/ON trascinando sulla scena in verticale, orizzontale e diagonale. Evita il pannello e il footer durante i gesti.
5. Ripeti invertendo l'ordine dopo una pausa; poi dopo circa 3 minuti di uso, per osservare il throttling termico.

Mantieni browser, orientamento, luminosità, zoom e risparmio energetico uguali. Confronta soprattutto mediana/p95 del frame time e frame oltre 33/50 ms. Verifica che densità, DPR e qualità siano uguali: un cambio automatico rende i campioni non direttamente confrontabili. La UI blocca il cambio DOF durante una registrazione.

Il JSON include versione, modalità DOF, numero di passaggi, viewport, user agent, FPS medi, frame time mediano/p95, tempo CPU e transizioni di qualità. Le pause con pagina nascosta sono escluse; gli stalli a pagina visibile sono inclusi. I dati rimangono sul device.

Prova iPhone/Safari, Android/Chrome e desktop. L'emulazione di dimensioni mobile verifica il padding; non equivale a una prova touch o a un benchmark su hardware mobile.

## Ambiente V6

Ancore immutate: 30.000 / 15.000 per lo sparkle, 14.000 / 6.000 per l’ambiente (desktop / compatto). L’ambiente passa dai sei sottocampioni della V5 a un punto per ancora, con distribuzione organica. La luce ambra dei grani ambiente riprende visualfx. Il renderer dello sparkle conserva la propria risposta luminosa.

Il materiale di prossimità usa la topologia UV stabile di tre superfici. Aggiorna i vertici quando cambia il tempo, scarta le facce fuori dal raggio e invia un buffer riutilizzato in un’unica draw call. Nessun contesto WebGL aggiuntivo, nessuna triangolazione per frame. Il costo si azzera a effetto dissolto; la scena particellare mantiene il proprio loop idle.

Una misurazione isolata di aggiornamento/culling CPU in Node ha rilevato circa 0,36 ms mediani / 0,55 ms p95 a 1424×884 e 0,16 / 0,27 ms a 374×828, dopo 120 frame di riscaldamento e su 600 campioni. Sono misure del processo di sviluppo: escludono upload, GPU, compositing, typo SVG e hardware mobile. Non sono un benchmark FPS della pagina.

## Typo e bordo

La typo usa un unico gradiente globale a 135°, facce triangolari fini costruite al resize, edge glow locale di 3,2 px e nucleo di 0,95 px. La sagoma e le metriche del testo restano identiche. Frame e ambiente usano lo stesso puntatore già smussato e raggio di 260 px desktop / 130 px compatto o touch.

Per confrontare lo stesso viewport, apri `?perf=1` e usa «Materiale cursore: OFF/ON». Il toggle comprende typo, bordo ed ambiente; lo sparkle continua a comportarsi allo stesso modo. Il valore `environmentFxCpuMs` nei diagnostici è solo la preparazione CPU del materiale ambiente. La qualità automatica, DPR e conteggi devono essere uguali fra le registrazioni. La configurazione viene bloccata durante la registrazione.

Reduced motion mantiene feedback immediato senza modulazione continua; in assenza di WebGL restano testo, glow e frame con fallback SVG della scena. I limiti delle prove effettive sono in QA_V6.md nel repository.
