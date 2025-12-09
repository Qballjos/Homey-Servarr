# Installatie Instructies

## Vereisten

- Homey Pro Mini met firmware versie 5.0.0 of hoger
- Servarr-applicaties (Radarr, Sonarr, Lidarr) draaiend op elk platform (Docker, native installatie, Unraid, etc.)
- API-sleutels van je Servarr-applicaties
- Netwerktoegang vanaf Homey naar je Servarr-servers

## Stap 1: API-sleutels ophalen

Voor elke Servarr-applicatie die je wilt gebruiken:

1. Open de applicatie in je browser
2. Ga naar **Settings** → **General**
3. Kopieer de **API Key**

## Stap 2: App installeren

### Optie A: Via Homey Developer Console

1. Open de Homey Developer Console (via `homey developer` CLI of web interface)
2. Upload de app map naar Homey
3. Installeer de app via de Developer Console

### Optie B: Via CLI

```bash
cd "/Users/qballjos/Documents/GitHub/Homey Servarr"
homey app install
```

## Stap 3: Device toevoegen

1. Open de Homey app op je telefoon
2. Ga naar **Apps** → **Servarr Flow Control**
3. Klik op **Device toevoegen**
4. Selecteer **Servarr Control Hub**
5. Vul de configuratie in:

Voor elke Servarr-applicatie die je wilt gebruiken:
- **Schakel de app in** met de toggle switch bovenaan de sectie
- **Base URL**: Bijv. `http://192.168.1.100` of `https://radarr.example.com` (zonder trailing slash)
- **Port**: Standaard poorten zijn 7878 (Radarr), 8989 (Sonarr), 8686 (Lidarr)
- **API Key**: Je Servarr API-sleutel (te vinden in Settings → General)

### Radarr
- Standaard poort: `7878`
- Schakel in/uit met de toggle switch

### Sonarr
- Standaard poort: `8989`
- Schakel in/uit met de toggle switch

### Lidarr
- Standaard poort: `8686`
- Schakel in/uit met de toggle switch

**Let op**: 
- Je hoeft niet alle apps te configureren - schakel alleen de apps in die je gebruikt
- De app werkt met Servarr op elk platform (Docker, native, Unraid, etc.)
- Je kunt later apps in- of uitschakelen via de device-instellingen

## Stap 4: Widgets toevoegen

1. Ga naar het Homey Dashboard
2. Klik op **Widget toevoegen**
3. Selecteer je **Servarr Control Hub** device
4. Kies een van de beschikbare widgets:
   - **Release Agenda Today** - Toont geplande releases voor vandaag
   - **Downloads & Action Panel** - Toont wachtrijstatus met pauze/hervat knoppen

## Stap 5: Flow Cards gebruiken

### IF... Triggers

#### Download Finished
- Getriggerd wanneer een download succesvol is voltooid
- Biedt media titel en app naam als tags

#### Queue Empty
- Getriggerd wanneer de wachtrij leeg wordt

### THEN... Actions

#### Pause All Downloads
- Pauzeert downloads in alle geconfigureerde Servarr-apps

#### Resume All Downloads
- Hervat downloads in alle geconfigureerde Servarr-apps

#### Pause App Downloads
- Pauzeert downloads voor een specifieke app (Radarr/Sonarr/Lidarr)

## Troubleshooting

### App kan niet verbinden met Servarr

1. Controleer of de Base URL correct is (zonder trailing slash)
2. Controleer of de poort correct is
3. Controleer of de API-sleutel correct is gekopieerd
4. Controleer of je Servarr-applicatie bereikbaar is vanaf je Homey

### Widgets tonen geen data

1. Wacht enkele minuten (polling interval is 5 minuten)
2. Controleer of de device correct is geconfigureerd
3. Controleer de Homey logs voor foutmeldingen

### Flow Cards werken niet

1. Controleer of de device correct is toegevoegd
2. Controleer of de API-instellingen correct zijn
3. Controleer de Homey logs voor foutmeldingen

## Performance

De app is geoptimaliseerd voor lage resource-usage:
- Polling interval: 5 minuten
- Minimale API calls
- Efficiënte data caching

Voor vragen of problemen, raadpleeg de README.md of de Homey Developer documentatie.

