# Misura sui device reali

Apri l'URL del deploy aggiungendo `?perf=1`. Il pannello è assente dalla pagina normale. Nessun dato viene inviato: il report JSON è scaricato sul device.

1. Aspetta 10 secondi per il caricamento e l'assestamento della qualità.
2. Premi **Registra 30 s**, lascia la scena in idle e salva il JSON. Rinominalo con device e browser.
3. Ripeti la registrazione muovendo il cursore o trascinando orizzontalmente sul touch. Il pannello deve rimanere fuori dal gesto.
4. Ripeti dopo 3 minuti per individuare eventuali rallentamenti termici. Mantieni orientamento, zoom e modalità risparmio energetico uguali per confronti utili.

Il report include FPS medi basati sull'intervallo reale tra frame, mediana/p95 del frame time, tempo CPU, frame oltre 33 e 50 ms, densità attiva, DPR e cambi di qualità. Il tempo CPU non comprende il lavoro asincrono della GPU. Le pause quando la pagina non è visibile sono escluse; gli stalli durante una pagina visibile sono inclusi. La durata è 30 secondi di frame misurati visibili.

Per il target 60 FPS, controlla soprattutto che il frame time resti vicino a 16,7 ms e che il p95 non si allontani troppo: una media alta può nascondere scatti. Su schermi a 90/120 Hz registra anche la frequenza selezionata nel device. Con reduced motion o senza WebGL il pannello segnala che non c'è animazione da misurare.

Prova almeno iPhone/Safari, Android/Chrome e desktop. La simulazione di una viewport mobile sul computer verifica il layout, non le prestazioni di un telefono.
