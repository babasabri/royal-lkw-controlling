# Royal Logistik – Controlling-Anwendung

Internes Frontend für Touren-Erfassung, Tank-/Mautdaten-Import und das
Controlling-Dashboard. Baut auf Next.js und Supabase auf.

## Inbetriebnahme (einmalig)

### 1. Code auf GitHub hochladen
1. Erstellen Sie ein neues, privates Repository auf https://github.com (z. B. "royal-logistik").
2. Laden Sie den Inhalt dieses Ordners in das Repository hoch (per GitHub Desktop
   oder über "Upload files" im Browser).

### 2. Mit Vercel verbinden
1. Gehen Sie auf https://vercel.com und melden Sie sich mit Ihrem GitHub-Konto an.
2. "Add New Project" -> das soeben erstellte Repository auswählen.
3. Unter "Environment Variables" folgende zwei Werte eintragen (siehe .env.local):
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Auf "Deploy" klicken. Nach ca. 1-2 Minuten erhalten Sie eine Live-URL.

### 3. Admin-Zugang anlegen
Da das Frontend bewusst keine Registrierungsseite hat (nur ein Admin-Zugang),
legen Sie Ihren Benutzer direkt in Supabase an:
1. Supabase-Projekt öffnen -> Authentication -> Users -> "Add user".
2. E-Mail und Passwort vergeben, "Auto Confirm User" aktivieren.
3. Mit diesen Daten können Sie sich danach in der App anmelden.

## Lokale Entwicklung (optional, nur falls gewünscht)
```
npm install
npm run dev
```
Die App läuft dann unter http://localhost:3000

## Status der Module
- Login & Navigation: fertig
- Touren-Modul: in Planung (Schritt 2)
- Import-Modul: in Planung (Schritt 3)
- Dashboard-Modul: in Planung (Schritt 4)
