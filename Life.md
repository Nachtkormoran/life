# Projektplan: Conway's Game of Life

## Technologie
JavaScript + HTML/CSS

## Projektstruktur
```
Life/
├── index.html      # Hauptseite mit Canvas-Element
├── style.css       # Styling für Grid und Controls
├── game.js         # Game-Of-Life Logik und Rendering
└── Life.md         # Dieser Projektplan
```

## 1. HTML-Grundgerüst (index.html)
- `<canvas>` Element für das Raster
- Controls: Start/Pause, Step, Clear, Randomize
- Optionales Feld für Speed/Geschwindigkeit

## 2. CSS Styling (style.css)
- Layout für Canvas zentriert darstellen
- Button-Styling für Controls
- Hintergrund/Farben für lebendige/tote Zellen

## 3. Game-Logik (game.js)
- **Grid-Datenstruktur**: 2D-Array mit `true`/`false` (lebendig/tot)
- **Nachbarberechnung**: Für jede Zelle 8 Nachbarn prüfen (Torus/Kante)
- **Regeln anwenden**:
  1. Lebendige Zelle mit 2-3 Nachbarn → lebt weiter
  2. Tote Zelle mit genau 3 Nachbarn → wird lebendig
  3. Alles andere → stirbt
- **Raster zeichnen**: Canvas mit Rectangles zeichnen

## 4. Interaktion
- **Mausklick**: Zelle toggeln (lebendig/tot)
- **Maus-Drag**: Mehrere Zellen zeichnen
- **Play/Pause**: Animation starten/stoppen
- **Step**: Einzelnen Generationsschritt ausführen
- **Randomize**: Zufällige Startkonfiguration
- **Clear**: Alle Zellen löschen

## 5. Game Loop
- `requestAnimationFrame` oder `setInterval` für Timer
- Variable Geschwindigkeit (Generationen pro Sekunde)
