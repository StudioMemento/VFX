# Memento Ready to Start — Cinematic V1

## Deploy

1. Estrai lo ZIP. La root da caricare è quella che contiene `vercel.json`, `dist` e `scripts`.
2. Importa questa cartella nel repository collegato a Vercel, oppure esegui `vercel` dalla cartella estratta se usi già la CLI.
3. Il progetto usa il preset **Other** e pubblica `dist`. La configurazione inclusa esegue solo una verifica dei file statici. Non servono dipendenze runtime, variabili ambiente o chiavi.
4. Dopo il deploy apri l'URL HTTPS sul device reale. La CTA mantiene il link `https://mementostudio.it/start`.

Non aprire `index.html` con `file://`: la scena usa moduli ES. Per una verifica locale puoi servire `dist` con un server HTTP statico.

Configurazione di riferimento: https://vercel.com/docs/project-configuration/vercel-json

## Direzione visiva

Sparkle derivato dall'asset di navigazione originale, usato soltanto come volume di campionamento. Superficie composta da frammenti mobili, mesh guida invisibile. Carbone con riflessi neutri contenuti e luce ambra in alto a destra.

Ambiente composto da un piano ondulato (44%), una superficie orbitale (36%) e una wave ascendente (20%). La parte frontale e quella posteriore dell'orbita hanno profondità reali. I frammenti più grandi sono istanze di geometrie sfaccettate e appartengono alle stesse superfici; lo sfocato deriva dal buffer di profondità. Il velo vicino alla sorgente è un'approssimazione leggera dello scattering atmosferico.

Typo HTML Inter 300 / 600, senza particelle: bianco, bagliore ambrato interno e riflesso stretto orientato dal cursore. Restano i comportamenti touch, tastiera, reduced motion, pausa fuori schermo e ritorno morbido dopo l'interazione.

## Budget

| Profilo | Sparkle | Ambiente | DPR massimo |
|---|---:|---:|---:|
| Desktop | 24.000 | 8.000 | 1,25 |
| Mobile / stretto | 12.000 | 3.500 | 1 |

La qualità si adatta sotto carico. Questi numeri non sono una promessa di 60 FPS: la misura definitiva va eseguita su hardware reale. Leggi `PERFORMANCE.md` per la procedura.
