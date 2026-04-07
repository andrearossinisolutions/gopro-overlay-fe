# GoPro Frontend MVP

Frontend Next.js per il backend FastAPI MVP del progetto GoPro overlay.

## Funzionalità già presenti

- upload di un video verso il backend
- lista job recenti
- pagina dettaglio job
- player HTML5 con overlay preview lato frontend
- pannello configurazione overlay
- chiamata a `POST /api/jobs/{jobId}/render`
- anteprima dei sample telemetrici

## Prerequisiti

- Node.js 20+
- backend FastAPI avviato su `http://127.0.0.1:8000`

## Avvio

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Apri poi:

```text
http://127.0.0.1:3000
```

## Variabili ambiente

`.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_BACKEND_BASE_URL=http://127.0.0.1:8000
```

## Flusso consigliato

1. avvia il backend
2. avvia il frontend
3. carica un file MP4 dalla home
4. entra nel dettaglio job
5. fai play sul video e verifica l'overlay preview
6. usa il pannello a destra per inviare il render config

## Note importanti

- L'overlay mostrato nel player è una preview lato frontend.
- Il render finale dell'MP4 dovrà essere fatto dal backend.
- Il backend attuale restituisce telemetria mock: va bene per costruire la UI e la sincronizzazione iniziale.
- La mini mappa è per ora un placeholder testuale, già pronta per essere sostituita con un componente reale.

## Evoluzioni immediate suggerite

- aggiungere polling di `GET /api/jobs/{jobId}/status`
- aggiungere endpoint backend per artifacts di render
- sostituire la mini mappa placeholder con Leaflet
- collegare il parser GPS reale GoPro nel backend
- collegare il renderer ffmpeg reale nel backend
