# Homey SDK Compliance

Deze app is gebouwd volgens de Homey Apps SDK v3 richtlijnen. Hieronder staat een overzicht van de SDK-conformiteit.

## SDK Versie

- **SDK**: v3 (zoals aanbevolen voor nieuwe apps)
- **Compatibility**: Homey firmware >= 5.0.0

## App Structuur

### app.json
- ✅ App manifest met alle vereiste velden
- ✅ Driver definitie met capabilities
- ✅ Flow cards definitie (triggers en actions)
- ✅ Widget definitie in driver sectie
- ✅ Localisatie support (NL/EN)

### app.js
- ✅ Flow cards worden geregistreerd met `new Homey.FlowCardTrigger()` en `new Homey.FlowCardAction()`
- ✅ Flow cards worden geregistreerd in `onInit()` methode

### Driver Structuur
- ✅ Driver extends `Homey.Driver`
- ✅ Device extends `Homey.Device`
- ✅ Pairing via `onPair()` methode met custom view
- ✅ Capabilities worden correct geïnitialiseerd

### Flow Cards
- ✅ Triggers: `Homey.FlowCardTrigger`
- ✅ Actions: `Homey.FlowCardAction`
- ✅ Flow cards worden geregistreerd in app.js
- ✅ Action handlers worden geregistreerd in driver.js

### Widgets
- ✅ Widgets gedefinieerd in app.json onder driver sectie
- ✅ Widget HTML bestanden in `drivers/servarr_hub/widgets/`
- ✅ Widgets gebruiken Homey widget API

### Pairing
- ✅ Custom pairing view (`setup.html`)
- ✅ Settings worden doorgegeven via `onPair()` handler
- ✅ Pair view gebruikt Homey.js library

## Conformiteit Checklist

- [x] App manifest (app.json) correct gestructureerd
- [x] Flow cards geregistreerd volgens SDK pattern
- [x] Driver en Device classes correct geïmplementeerd
- [x] Capabilities correct geïnitialiseerd
- [x] Widgets correct geconfigureerd
- [x] Pairing proces correct geïmplementeerd
- [x] Localisatie bestanden aanwezig
- [x] Error handling geïmplementeerd
- [x] Logging gebruikt voor debugging

## Referenties

- [Homey Apps SDK v2 Documentation](https://apps-sdk-v2.developer.athom.com/)
- [Homey Apps SDK v3 (aanbevolen voor nieuwe apps)](https://apps-sdk-v3.developer.athom.com/)

## Opmerkingen

De app gebruikt SDK v3 omdat dit wordt aanbevolen voor nieuwe apps. De structuur is compatibel met Homey firmware 5.0.0 en hoger.

