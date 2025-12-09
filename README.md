# Servarr Flow Control - Homey App

Een extreem lichtgewicht Homey App voor de Homey Pro Mini die fungeert als een read-only monitoring interface en Flow-brug om de Servarr-suite (Radarr, Sonarr, Lidarr) te bedienen. Werkt met Servarr-applicaties op elk platform (Unraid, Docker, native installaties, etc.).

## 🎯 Doel

Deze applicatie is geoptimaliseerd voor minimale CPU/geheugenbelasting en levert de vereiste widgets en Flow Cards voor monitoring en controle van Servarr-applicaties.

## ✨ Functionaliteit

### Dashboard Widgets

1. **Release Agenda Vandaag** - Toont het totaal aantal geplande releases (films, series, albums) voor vandaag
2. **Downloads & Actiepaneel** - Toont de wachtrijstatus met knoppen voor pauzeren/hervatten

### Flow Cards

#### IF... Triggers (Status Rapportering)
- **A download has finished** - Getriggerd wanneer een download succesvol is voltooid (met media titel als tag)
- **The queue is empty** - Getriggerd wanneer de totale wachtrij van alle apps naar nul zakt

#### THEN... Actions (Actie Controle)
- **Pause all Servarr Downloads** - Pauzeert downloads in alle geconfigureerde Servarr-applicaties
- **Resume all Servarr Downloads** - Hervat downloads in alle geconfigureerde Servarr-applicaties
- **Pause [APP] Downloads** - Pauzeert downloads voor een specifieke app (Radarr/Sonarr/Lidarr)

## 🚀 Installatie

1. Kopieer deze app naar je Homey App directory
2. Installeer via de Homey Developer Console of via `homey app install`
3. Voeg een "Servarr Control Hub" device toe via de Homey app
4. Configureer de API-instellingen voor Radarr, Sonarr en/of Lidarr

## ⚙️ Configuratie

Bij het toevoegen van het device configureer je:

- **Radarr**: Base URL, poort (standaard 7878), API-sleutel
- **Sonarr**: Base URL, poort (standaard 8989), API-sleutel
- **Lidarr**: Base URL, poort (standaard 8686), API-sleutel

Je hoeft niet alle apps te configureren - alleen de apps die je gebruikt.

## 🔧 Technische Details

### Performance Optimalisaties

- **Polling Interval**: 5 minuten voor de meeste data (zoals vereist)
- **Efficiënte API Calls**: Minimale data transfer, alleen benodigde informatie
- **Caching**: Resultaten worden gecached waar mogelijk
- **Lichtgewicht**: Geoptimaliseerd voor Homey Pro Mini

### API Communicatie

De app communiceert rechtstreeks met de Servarr API's via HTTP/HTTPS:
- Radarr API v3
- Sonarr API v3
- Lidarr API v3

### Capabilities

Het device heeft de volgende capabilities:
- `text_today_releases` - Tekstweergave van het aantal releases vandaag
- `measure_queue_count` - Meting van het aantal items in de wachtrij

## 📝 Ontwikkeling

### Project Structuur

```
Homey Servarr/
├── app.json                 # App manifest
├── drivers/
│   └── servarr_hub/
│       ├── driver.js        # Driver implementatie
│       ├── device.js        # Device implementatie
│       ├── pair/
│       │   └── setup.html   # Setup interface
│       └── widgets/         # Dashboard widgets
├── lib/
│   ├── ServarrAPI.js        # API client library
│   └── flow/                # Flow card implementaties
├── locales/                 # Vertalingen (NL/EN)
└── assets/                  # App iconen
```

### Code Documentatie

De code bevat uitgebreide commentaar over efficiëntie-keuzes en implementatie details.

## 📄 Licentie

Deze app is ontwikkeld voor gebruik met Homey en Servarr-applicaties.

## 🤝 Ondersteuning

Voor vragen of problemen, raadpleeg de Homey Developer documentatie of de Servarr API documentatie.

