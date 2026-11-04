# Memento — Orbital FX V6

## Composizione

La V6 riprende le equazioni delle tre superfici della versione indicata dall’utente su https://visualfx.vercel.app/ (consultata il 4 novembre 2026): terreno basso 44%, orbita stretta 36%, scia diagonale 20%. La zona alta sinistra conserva spazio nero. Restano l’overscan continuo della V5 e i miglioramenti alle collisioni; scompaiono spirali superiori, file regolari e sottocampionamento GPU.

I file dello sparkle (`geometry.js`, `physics.js`, `preset.js`, `camera.js`, `assets/navigation-start.js` e `assets/sparkle-idle.svg`) sono byte-identici alla V5. Il ramo del suo shader e il controllo di rotazione/drag restano invariati.

## Materiale condiviso

Il cursore smussato alimenta un campo con raggio 260 px desktop / 130 px touch o compatto. Tre contributi sulla typo: nucleo luminoso lungo i contorni reali, alone ambra, wireframe e facce interne. Una mesh sottile accompagna i bordi del frame. Gradiente base unico 135°, silhouette, font, peso e layout sono preservati.

Nell’ambiente la mesh aderisce alle tre superfici reali e segue la loro oscillazione. I triangoli sono irregolari, stabili, ritagliati dal campo locale e testati in profondità; nessuna rete è presente nello spazio vuoto. I bordi sono definiti in CSS pixel con interpolazione indipendente dalla prospettiva. Non viene deformato lo sparkle. Il movimento dei grani mantiene la dinamica precedente, con un campo luminoso leggibile anche a cursore fermo.

Configurazione: `cursor-field.js` per raggi e dissolvenza; `type-light.js` per il materiale typo; `environment-light.js` per topologia e shader ambiente. `?fx=off` oppure il pannello `?perf=1` permettono il confronto.

## Risorse e fallback

Un unico contesto WebGL. La mesh ambiente aggiunge una draw call quando attiva, nessuna quando spenta. Buffer riutilizzati e culling locale; i grani ambiente sono un punto per ancora. In fallback il piano statico è rigenerato dalle stesse superfici; lo sparkle statico resta invariato. Nessuna dipendenza runtime.
