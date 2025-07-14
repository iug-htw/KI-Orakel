# Ollama Chat Interface

Eine moderne HTML-Webseite zur Kommunikation mit einem Ollama-Server über eine benutzerfreundliche Chat-Oberfläche.

## Features

- **Chat-Interface**: Interaktive Unterhaltung mit Ollama-Modellen
- **Text-Vervollständigung**: Generierung von Textfortsetzungen
- **Modell-Auswahl**: Anzeige und Auswahl verfügbarer Modelle
- **Chat-Speicherung**: Automatisches Speichern und Laden von Chats
- **Export/Import**: Speicherung als JSON- und TXT-Dateien
- **Zeitstempel**: Anzeige der Nachrichtenzeiten
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Moderne UI**: Glasmorphismus-Design mit sanften Animationen

## API-Endpunkte

Die Anwendung nutzt folgende Ollama-API-Endpunkte:

- `POST /api/chat` - Chat-Vervollständigung
- `POST /api/generate` - Text-Vervollständigung  
- `GET /api/tags` - Verfügbare Modelle auflisten

## Server-Konfiguration

Standard-Server: `https://f2ki-h100-1.f2.htw-berlin.de:11435`

## Verwendung

1. **Modelle laden**: Klicken Sie auf "Modelle laden" um verfügbare Modelle anzuzeigen
2. **Modell auswählen**: Wählen Sie ein Modell aus der Dropdown-Liste oder klicken Sie auf einen Modell-Tag
3. **Nachricht senden**: 
   - Geben Sie Ihre Frage ein
   - Klicken Sie auf "Chat senden" für eine Unterhaltung
   - Klicken Sie auf "Text vervollständigen" für Textgenerierung
4. **Chat verwalten**: 
   - Nutzen Sie "Chat leeren" um die Unterhaltung zu löschen
   - Klicken Sie auf "Chat speichern" um den Chat als JSON/TXT zu exportieren
   - Klicken Sie auf "Chat laden" um einen gespeicherten Chat zu importieren

## Technische Details

### Dateien

- `index.html` - Hauptseite mit Chat-Interface
- `style.css` - Styling und responsive Design
- `script.js` - Haupt-JavaScript für UI und API-Kommunikation
- `chatStorage.js` - Storage-Manager für Chat-Speicherung
- `README.md` - Diese Dokumentation
- `chats/` - Ordner für Chat-Dateien

### Funktionalitäten

- **Asynchrone API-Calls**: Alle Server-Anfragen sind asynchron
- **Fehlerbehandlung**: Umfassende Fehlerbehandlung und Benutzer-Feedback
- **Responsive Design**: Optimiert für verschiedene Bildschirmgrößen
- **Accessibility**: Tastaturnavigation und semantisches HTML
- **Lokale Speicherung**: Automatisches Speichern im Browser-LocalStorage
- **Export/Import**: JSON- und TXT-Export für Chat-Archivierung
- **Zeitstempel**: Anzeige der Nachrichtenzeiten für bessere Übersicht

### Browser-Unterstützung

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+

## Entwicklung

### Lokaler Server

Für die Entwicklung können Sie einen lokalen HTTP-Server verwenden:

```bash
# Python 3
python -m http.server 8000

# Node.js (mit http-server)
npx http-server

# PHP
php -S localhost:8000
```

### CORS-Konfiguration

Falls CORS-Probleme auftreten, stellen Sie sicher, dass der Ollama-Server entsprechend konfiguriert ist oder verwenden Sie einen lokalen Proxy.

## Fehlerbehebung

### Häufige Probleme

1. **Modelle laden nicht**: Überprüfen Sie die Serververbindung
2. **CORS-Fehler**: Möglicherweise ist ein Proxy erforderlich
3. **Keine Antwort**: Überprüfen Sie die Modell-Verfügbarkeit
4. **Chat-Import fehlgeschlagen**: Überprüfen Sie das JSON-Format
5. **Speicherung funktioniert nicht**: Überprüfen Sie die Browser-Einstellungen für LocalStorage

### Chat-Dateiformate

**JSON-Export** (empfohlen):
- Vollständige Metadaten (Zeitstempel, Session-ID)
- Einfacher Re-Import möglich
- Strukturierte Daten für weitere Verarbeitung

**TXT-Export**:
- Menschenlesbare Formatierung
- Einfache Archivierung
- Kein Re-Import möglich

### Debugging

Öffnen Sie die Browser-Entwicklertools (F12) um detaillierte Fehlerinformationen zu erhalten.

## Lizenz

MIT License - Freie Verwendung für persönliche und kommerzielle Zwecke.

### Code-Architektur

- **Modularer Aufbau**: Storage-Funktionalität in separater Datei
- **ChatStorageManager**: Eigenständige Klasse für alle Speicheroperationen
- **Callback-System**: Flexible Kommunikation zwischen Modulen
- **Error Handling**: Umfassende Fehlerbehandlung in allen Modulen

### ChatStorageManager Features

- **localStorage Integration**: Automatische Browser-Speicherung
- **Auto-Save**: Intelligente Datei-Speicherung
- **Export/Import**: JSON und TXT Unterstützung
- **Session Management**: Eindeutige Session-IDs
- **Callback Support**: Flexible UI-Updates
