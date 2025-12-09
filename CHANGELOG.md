# Changelog

## Versie 1.1.0 - Universele App met Toggle Switches

### Nieuwe Features

- **Toggle Switches**: Elke Servarr-applicatie kan nu individueel worden in- of uitgeschakeld via een toggle switch in de configuratie
- **Universele Compatibiliteit**: App werkt nu met Servarr op elk platform (Docker, native installatie, Unraid, etc.)
- **Flexibele Configuratie**: Gebruikers kunnen kiezen welke apps ze willen gebruiken zonder alle apps te configureren

### Wijzigingen

#### Configuratie Interface
- Toegevoegd: Toggle switches voor Radarr, Sonarr en Lidarr
- Toegevoegd: Visuele feedback wanneer een app is uitgeschakeld (grijze sectie)
- Verbeterd: Placeholder tekst voor Base URL ondersteunt nu zowel IP-adressen als domeinnamen
- Verbeterd: Configuratievelden worden automatisch verborgen wanneer een app wordt uitgeschakeld

#### Device Logica
- Wijziging: Alleen ingeschakelde apps worden geïnitialiseerd en gebruikt
- Toegevoegd: Device status wordt automatisch bijgewerkt wanneer geen apps zijn ingeschakeld
- Verbeterd: Betere error handling bij het initialiseren van clients

#### Documentatie
- Bijgewerkt: README verwijderd Unraid-specifieke referenties
- Bijgewerkt: INSTALLATION.md met instructies voor toggle switches
- Bijgewerkt: App beschrijving in app.json voor universele compatibiliteit

### Technische Details

#### Nieuwe Settings
- `radarr_enabled` (boolean) - Schakelt Radarr in/uit
- `sonarr_enabled` (boolean) - Schakelt Sonarr in/uit
- `lidarr_enabled` (boolean) - Schakelt Lidarr in/uit

#### Gedrag
- Wanneer een app wordt uitgeschakeld, wordt de client niet geïnitialiseerd
- Alleen ingeschakelde apps worden gebruikt voor:
  - Polling (releases, queue count)
  - Flow triggers (download finished, queue empty)
  - Flow actions (pause/resume)
- Device wordt "unavailable" wanneer geen apps zijn ingeschakeld

### Gebruik

1. Open device-instellingen tijdens pairing of via device-instellingen
2. Gebruik de toggle switch bovenaan elke app-sectie om apps in/uit te schakelen
3. Configureer alleen de ingeschakelde apps
4. Apps kunnen op elk moment worden in- of uitgeschakeld zonder device te verwijderen

### Compatibiliteit

- Werkt met Servarr op:
  - Docker containers
  - Native installaties (Windows, Linux, macOS)
  - Unraid
  - Synology NAS
  - QNAP NAS
  - Elke andere platform waar Servarr draait

### Migratie

Bestaande devices blijven werken. Bij het bewerken van instellingen kunnen gebruikers nu toggle switches gebruiken om apps in/uit te schakelen.

