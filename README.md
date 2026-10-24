# Block Blast Solo Unlimited

Game puzzle web 8×8 tanpa batas waktu dengan kesulitan adaptif (Normal → Dipermudah → Tekanan),
efek suara, dan tekstur blok bertahap (fase1.png, fase2.png, ...).

- Murni HTML + CSS + JavaScript (tanpa framework, tanpa build).
- Main: buka `index.html`, atau `python3 -m http.server 8000` lalu buka http://localhost:8000
- Tes: `npm run test:unit` (tanpa dependensi) dan `npm install && npx playwright install chromium && npm run test:browser`
- Tutorial lengkap langkah demi langkah: [TUTORIAL.md](TUTORIAL.md)

## Struktur
```
index.html
css/style.css
js/  config shapes board difficulty generator audio textures ui game main
assets/audio/  place.mp3 clear.mp3 allclear.mp3
assets/img/    fase1.png fase2.png ...
tests/  helpers/  unit/  browser/
```
