# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Projekt

Conway's Game of Life — eine statische Web-App (reines HTML/CSS/JS, **kein Build-Step**, kein Framework, keine Dependencies im Repo). Wird über GitHub (`Nachtkormoran/life`) auf **Vercel** deployt: Push auf `main` → automatisches Deploy. Supabase liefert die Authentifizierung.

## Struktur

```
Life/
├── index.html   # Auth-Overlay (Login/Signup), User-Bar, Toolbar, Canvas, Stats
├── style.css    # Design-Tokens (:root), Glassmorphism-UI, Auth-Styles
├── game.js      # Game-of-Life Logik & Rendering (klassisches Script)
├── auth.js      # Supabase-Client + Auth-Flow (ES-Modul)
├── Life.md      # Ursprünglicher Projektplan
└── CLAUDE.md    # Diese Datei
```

`index.html` bindet die Skripte so ein:
- `<script type="module" src="auth.js">` — braucht `type="module"` wegen des ESM-Imports von Supabase-JS.
- `<script src="game.js">` — klassisches Script, keine Änderung nötig.

## Auth (Supabase)

- **Projekt-Ref:** `komysokkazmmfklflqso` · URL `https://komysokkazmmfklflqso.supabase.co`
- **Publishable Key** steht bewusst im Frontend (`auth.js`) — ist öffentlich/ungefährlich; Sicherheit kommt über RLS.
- **Flow:** Registrieren mit E-Mail + Name + Passwort → Login mit E-Mail + Passwort. Der **Name** geht als `options.data.name` in die User-Metadaten.
- **DB:** Tabelle `public.profiles` (`id` → `auth.users(id)`, `name`, `email`, `created_at`). Ein `SECURITY DEFINER`-Trigger `on_auth_user_created` (Funktion `handle_new_user`) spiegelt den Namen aus den Metadaten automatisch in `profiles`. RLS aktiv: jeder sieht/ändert nur sein eigenes Profil. Die Trigger-Funktion hat kein `EXECUTE`-Recht für `anon`/`authenticated` (Security-Advisor-konform).
- **UI-Toggle:** `auth.js` reagiert auf `onAuthStateChange`/`getSession` und blendet je nach Session das Auth-Overlay bzw. die `.app` ein/aus (Klasse `.hidden`).

### ⚠️ Manueller Schritt (nicht per MCP schaltbar)
Für Sofort-Login muss im Dashboard **Authentication → Providers → Email → „Confirm email" ausgeschaltet** sein. Sonst schlägt der Login mit `email_not_confirmed` fehl — gilt lokal **und** auf Vercel.

## Entwicklung

Lokaler Server (statisch):
```
python3 -m http.server 8080 --directory .
```
→ http://localhost:8080

## Deploy

Commit auf `main` + `git push origin main` → Vercel deployt automatisch. Keine `vercel.json` nötig (statische Seite). CORS ist unkritisch: Supabase antwortet mit `access-control-allow-origin: *`, Login funktioniert von jeder Domain.

## Konventionen / Hinweise

- Deutschsprachige UI und Commits/Kommentare gemischt DE/EN wie im Bestand.
- `.mcp.json` ist gitignored (lokale MCP-Config) — nicht committen.
- Design-Farben/Abstände über die CSS-Variablen in `:root` (style.css) wiederverwenden, nicht hart kodieren.
- Für Supabase-Schemaänderungen die MCP-Tools nutzen (`apply_migration` für DDL) und danach `get_advisors('security')` prüfen.
