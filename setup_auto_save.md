# Auto-Speicherung Setup

## Wie die automatische Speicherung funktioniert

Da Webanwendungen aus Sicherheitsgründen nicht direkt auf das Dateisystem zugreifen können, werden die Chats automatisch in Ihren **Download-Ordner** gespeichert.

### Automatische Speicherung

- **Auslöser**: Nach jeder Antwort vom Assistant oder alle 2 Nachrichten
- **Dateiname**: `chats/chat_[SessionID]_[Timestamp].json`
- **Ordner**: Die Dateien werden mit dem Pfad `chats/` vorgeschlagen

### Dateien organisieren

1. **Erstellen Sie einen Chats-Ordner** in Ihrem Projektverzeichnis:
   ```
   C:\Users\katha\Dropbox\06 Programmieren\Ollama_test2\chats\
   ```

2. **Verschieben Sie die Dateien** aus dem Download-Ordner in den Chats-Ordner

3. **Automatisierung mit Batch-Datei** (optional):
   ```batch
   @echo off
   move "%USERPROFILE%\Downloads\chats\*.json" "C:\Users\katha\Dropbox\06 Programmieren\Ollama_test2\chats\"
   ```

### Dateistruktur

```
Ollama_test2/
├── index.html
├── style.css
├── script.js
├── README.md
├── chats/
│   ├── chat_session_xxx_2025-01-15T10-30-00.json
│   ├── chat_session_xxx_2025-01-15T10-35-00.json
│   └── manual_export_session_xxx_2025-01-15.json
└── setup_auto_save.md (diese Datei)
```

### Einstellungen

- **Auto-Speicherung**: Kann über die Checkbox in der Weboberfläche aktiviert/deaktiviert werden
- **Manueller Export**: Zusätzlich über "Chat speichern" Button verfügbar
- **Speicher-Frequenz**: Automatisch nach Assistant-Antworten

### Tipps

1. **Regelmäßig organisieren**: Verschieben Sie Dateien regelmäßig aus dem Download-Ordner
2. **Backup**: Die JSON-Dateien können in die Anwendung re-importiert werden
3. **Platzsparend**: Löschen Sie alte Auto-Save-Dateien, behalten Sie nur wichtige Chats
