# Reguły przeglądu kodu

Reguły specyficzne dla tego repozytorium. Uzupełniają wbudowaną checklistę `om-code-review`; nie zastępują jej. Kontekst: [AGENTS.md](AGENTS.md), [specyfikacja gry](.ai/specs/2026-10-04-gra-w-kulki.md), [specyfikacja publikacji](.ai/specs/2026-10-04-publikacja-na-github-pages.md), [ADR 0001](docs/adr/0001-stos-technologiczny.md), [ADR 0002](docs/adr/0002-publikacja-na-github-pages.md), [specyfikacja podskakującej kulki i wyglądu retro](.ai/specs/2026-10-05-podskakujaca-kulka-i-wyglad-retro.md), [ADR 0003](docs/adr/0003-podskakujaca-kulka-i-wyglad-retro.md), [specyfikacja ekranu kineskopu, neonowego tytułu i nowego układu](.ai/specs/2026-10-05-ekran-kineskopu-neonowy-tytul-i-nowy-uklad.md), [ADR 0004](docs/adr/0004-ekran-kineskopu-neonowy-tytul-i-nowy-uklad.md), [specyfikacja kulek bez linii skanowania](.ai/specs/2026-10-05-kulki-bez-linii-skanowania.md), [ADR 0005](docs/adr/0005-kulki-bez-linii-skanowania.md).

## Priorytety

1. **Zgodność ze specyfikacją.** Zachowanie odpowiada kryteriom akceptacji scenariusza, którego dotyczy zmiana, łącznie z przypadkami brzegowymi. Nic z sekcji „Poza zakresem” nie zostało dodane.
2. **Jeden samodzielny plik.** Produkt pozostaje jednym `index.html` bez zależności i bez sieci.
3. **Kontrakty.** Zmiana nie łamie powierzchni z [BACKWARD_COMPATIBILITY.md](BACKWARD_COMPATIBILITY.md).
4. **Testy.** Zmiana zachowania ma test na właściwym poziomie.
5. Czytelność i prostota.

## Kontrole specyficzne dla repozytorium

### Produkt

- [ ] `package.json` nie ma sekcji `dependencies`; nowe `devDependencies` są uzasadnione w opisie PR i przypięte do dokładnej wersji.
- [ ] W `src/` nie ma odwołań do zasobów zewnętrznych: `http(s)://` w `src`, `href`, `url()`, `@import`, `fetch`, `XMLHttpRequest`, `import()` z adresu. Obrazy i dźwięki są generowane w kodzie albo wklejone jako `data:`.
- [ ] `dist/` nie jest w diffie.
- [ ] Nie ma plików `.ts`, frameworków ani `<canvas>` dla planszy.
- [ ] Kod działa bez kroku transpilacji w aktualnych Chrome, Firefox, Edge i Safari: bez składni i API dostępnych tylko w jednym silniku.
- [ ] Gra działa z `file://`: żadnych modułów ładowanych w czasie działania, żadnych Service Workerów, żadnego założenia, że `localStorage` jest dostępny.

### Granice modułów

- [ ] `src/game/` nie używa `document`, `window`, `localStorage`, `Date`, `setTimeout` ani `Math.random`; losowość przychodzi przez `rng`.
- [ ] `src/ui/` nie liczy reguł gry (drogi, linii, punktów); tylko pokazuje wynik z `src/game/`.
- [ ] `localStorage` jest używany wyłącznie w `src/storage/`, `AudioContext` wyłącznie w `src/audio/`.
- [ ] Funkcje logiki nie mutują przekazanego stanu, jeśli ich kontrakt mówi o zwracaniu nowego.

### Poprawność reguł gry

- [ ] Droga liczy tylko sąsiedztwo bokiem; skos nie jest drogą.
- [ ] Linie sprawdzane w czterech kierunkach; kulka wspólna dla kilku linii liczona raz; kilka linii naraz to jedno zbicie.
- [ ] Punktacja zgodna z tabelą: `4 × liczba kulek − 10` dla co najmniej 5 kulek.
- [ ] Po ruchu ze zbiciem nie ma dolosowania, chyba że plansza jest pusta. Po dolosowaniu linie sprawdzane raz, po położeniu wszystkich kulek.
- [ ] Koniec gry tylko wtedy, gdy po dolosowaniu i ewentualnym zbiciu nie ma pustego pola.
- [ ] Stan zapisywany jest po obliczeniu tury, a nie po zakończeniu animacji (wymaganie S8 o odświeżeniu w trakcie animacji).

### Interfejs

- [ ] Wszystkie teksty po polsku i w `src/ui/texts.js`; żadnych napisów wpisanych w widoki.
- [ ] Elementy mają `data-testid` i atrybuty `data-*` zgodne z kontraktem DOM ze specyfikacji; testy nie wybierają elementów po klasach CSS.
- [ ] Kliknięcia w trakcie animacji i po końcu gry nie zmieniają stanu.
- [ ] Każda animacja i sygnał odmowy trwa najwyżej 1 s; reakcja na kliknięcie jest synchroniczna (≤ 100 ms).
- [ ] Przy 1024×768 nic nie wymaga przewijania.
- [ ] Brak `alert`, `confirm`, `prompt`; potwierdzenia to elementy HTML.

### Podskakiwanie (S10–S13)

- [ ] `data-bouncing="true"` ma najwyżej jedno pole i tylko wtedy, gdy jest zaznaczone, ma kulkę i ruch nie jest ograniczony; atrybut zmienia się synchronicznie w obsłudze kliknięcia.
- [ ] Animacja kulki zmienia wyłącznie `transform`, jest nieskończona, bez `animation-direction: alternate`; element kulki nie ma `transition`.
- [ ] Czas cyklu pochodzi z `BOUNCE_CYCLE_MS` (300–1000 ms) i trafia do CSS jako zmienna; nie ma drugiej wartości wpisanej w arkusz.
- [ ] `data-bounce-cycles` rośnie tylko ze zdarzenia `animationiteration` i wraca do `0`, gdy zmienia się albo znika podskakujące pole.
- [ ] Podskakiwanie nie ustawia `data-animating`, nie blokuje kliknięć i nie odtwarza dźwięku.
- [ ] O ograniczonym ruchu decyduje `src/ui/motion.js` (z obsługą braku `matchMedia` i zmiany w trakcie gry); dla kulki nie ma reguły `@media (prefers-reduced-motion)`.
- [ ] `outline` ma tylko pole zaznaczone bez podskakiwania.

### Wygląd i czcionka (S14, S15)

- [ ] Plik `src/fonts/PressStart2P-Regular.ttf` nie jest w diffie; `OFL.txt` leży obok niego. Czcionka trafia do produktu wyłącznie przez `tools/embed-fonts.js` jako `data:`.
- [ ] Kolory i rozmiary są zmiennymi CSS; `--c1`…`--c7` mają niezmienione wartości; nie ma `prefers-color-scheme` ani `light-dark()`.
- [ ] Tło pod napisami to jednolity `background-color`; kontrast napisu do tła co najmniej 4,5:1.
- [ ] Elementy interfejsu mają `border-radius: 0` i jedną warstwę `box-shadow` (przesunięcia dodatnie, rozmycie 0); poświata nie jest dodatkową warstwą `box-shadow`.
- [ ] Przyciski w stanie `:active` przesuwają się w stronę cienia; nie mają `transition`.
- [ ] Element `crt` jest pusty, ma `aria-hidden="true"`, `pointer-events: none`, leży poza `#app` i nie ma animacji.
- [ ] Brzmienie i kolejność napisów w DOM bez zmian; brak `text-transform` i napisów w `content`.
- [ ] Okna pytania i końca gry nie zasłaniają pól planszy ani przycisków; całość mieści się w 1024×768 także z komunikatem o rekordzie.
- [ ] `window.__kulki` i `src/ui/texts.js` nie są zmienione; żadna asercja w testach S1–S9 nie jest zmieniona. Wyjątek: krok 2.1 specyfikacji S17–S21 (patrz niżej).

### Układ, tytuł, kaskada i ekran kineskopu (S17–S21)

- [ ] Panele, oba przyciski i okna są w elemencie `sidebar`, w kolejności wynik, najlepszy wynik, podgląd, „Nowa gra”, dźwięk, okno; okno jest ostatnim dzieckiem i jego pojawienie się nie przesuwa żadnego elementu.
- [ ] Kolejność napisów w DOM bez zmian; układ robi siatka CSS, nie `order` ani pozycjonowanie bezwzględne paneli.
- [ ] Całość mieści się bez przewijania przy 1024×768 i 1920×1080, także z komunikatem o rekordzie; elementy nie wpadają w zaokrąglone rogi ekranu.
- [ ] Tytuł to jeden `h1` z jednym węzłem tekstu `KULKI` (z `src/ui/texts.js`); `<title>` strony to nadal `Kulki`. Brak `text-transform`, powielonych napisów i pseudoelementów z treścią.
- [ ] Obrys tytułu to `-webkit-text-stroke` z `paint-order: stroke fill`; głębia to warstwy `text-shadow` bez rozmycia w dół i w prawo; poświata to warstwa z rozmyciem ≥ 16 px. Wartości są zmiennymi `--title-*` bez `color-mix`.
- [ ] Zmianę brzmienia tytułu zawiera tylko PR kroku 2.1; zmienia on wyłącznie oczekiwane brzmienie tytułu w istniejących asercjach, nic więcej.
- [ ] Zmieniona asercja S14–S16 jest wymieniona w opisie PR z wierszem tabeli „Zmiany względem wcześniejszych specyfikacji”, z którego wynika.
- [ ] Kule kaskady pochodzą z zamrożonej tablicy w `src/ui/cascade.js`; moduł nie używa `rng`, `Math.random` ani czasu; liczba losowań w turze się nie zmieniła.
- [ ] Kula kaskady ma `data-testid="cascade-ball"` i `data-color`; wypełnienie pochodzi z tej samej reguły CSS co kulki gry (bez drugiej kopii gradientu); kontener `cascade` ma `aria-hidden="true"`.
- [ ] Tytuł, kule i tło nie mają obsługi kliknięć; kliknięcie poza planszą nie odznacza kulki.
- [ ] Krawędź ekranu i czerń poza nią są na elemencie `crt` (`border-radius` w `vmin`, zewnętrzny `box-shadow` bez rozmycia); `crt` pozostaje pusty.
- [ ] `crt-glare` jest pusty, ma `aria-hidden="true"`, `position: fixed`, `pointer-events: none`, leży w `body` obok `crt`.
- [ ] `--crt-scanline-alpha` jest w przedziale 0,2–0,4 i faktycznie wyznacza kolor linii; `--crt-glow-blur` ≥ 4 px.
- [ ] Brak `transform`, `filter`, `perspective` i `backdrop-filter` na `#app`, planszy i ich przodkach; brak animacji i `transition` na tytule, kulach, `crt` i `crt-glare`.
- [ ] Nie ma obrazów, SVG ani `<canvas>` w produkcie; kulki planszy i podglądu nie dostały cienia ani poświaty.

### Kulki bez linii skanowania (S22–S24)

- [ ] Kolejność warstw pochodzi ze zmiennych `--z-*` i spełnia `--z-scanlines` < `--z-ball` < `--z-vignette` < `--z-glare`; w regułach nie ma `z-index` wpisanego liczbą.
- [ ] `z-index` z `--z-ball` mają tylko kulki planszy i podglądu, w osobnej regule; wspólna reguła wypełnienia kulek go nie zawiera, więc kule kaskady zostają pod liniami.
- [ ] Żaden przodek kulki gry nie tworzy kontekstu stosu: brak `transform`, `opacity` poniżej 1, `filter`, `z-index`, `isolation`, `mix-blend-mode`, `will-change` i `contain` na `#app`, planszy, polu, kolumnie bocznej i panelu podglądu, także w animacjach i w stanie `data-rejected="true"`.
- [ ] Sygnał odmowy ruchu przesuwa planszę właściwością `left`, o te same wartości i w tym samym czasie co dotąd; `REJECT_MS` bez zmian.
- [ ] Gradient linii jest w tle `crt`, a jego kolor powstaje wyłącznie z `--crt-scanline-alpha`; nadpisanie tej zmiennej na `0` usuwa wszystkie linie z ekranu.
- [ ] Przyciemnienie brzegów rysuje tylko `crt-vignette` (kolor `--crt-vignette-color`); `radial-gradient` w tle `crt` jest w pełni przezroczysty i ma komentarz z powodem.
- [ ] `crt-vignette` jest pusty, ma `aria-hidden="true"`, `position: fixed`, `pointer-events: none`, leży w `body` po `crt-glare` i ma ten sam `border-radius` i zewnętrzny `box-shadow` co `crt`; nie ma animacji ani `transition`.
- [ ] Kulka nie dostała cienia, poświaty, obrysu ani innego wypełnienia; kształt, odstęp 12% i kolory `--c1`…`--c7` bez zmian.
- [ ] Nie doszedł kod JavaScript śledzący położenie kulek; `src/ui/`, `src/test-api.js` i `window.__kulki` nie są zmienione.
- [ ] Żadna asercja w testach S1–S21 nie jest zmieniona.
- [ ] Testy porównują zrzut z obrazem odniesienia wykonanym w tym samym teście (`--crt-scanline-alpha: 0`, potem usunięcie nadpisania), ze zrzutami w skali `css`; progi (3 na składową, 10% sumy, pas 2 px) są stałymi pomocnika, nie liczbami rozsianymi po testach.

### Zapis i błędy

- [ ] Każdy odczyt z `localStorage` jest w `try/catch` i przechodzi walidację kształtu i zakresów; niepoprawna dana daje wartość domyślną, a pozostałe dwie dane nie są ruszane.
- [ ] Zapis też jest w `try/catch`; błąd zapisu nie przerywa gry.
- [ ] Gracz nie widzi żadnego komunikatu o błędzie; w `src/` nie ma `console.*`.
- [ ] Zmiana kształtu zapisanej danej wprowadza nowy klucz z wyższą wersją.

### Dźwięk

- [ ] Brak wyjątku, gdy `AudioContext` nie istnieje albo jest zawieszony do pierwszej interakcji.
- [ ] Rejestr dźwięków rośnie tylko przy włączonym dźwięku i dokładnie o jedno zdarzenie na dźwięk, w kolejności zdarzeń.

### Testy

- [ ] Nowa reguła gry ma test jednostkowy; nowe albo zmienione kryterium akceptacji ma test E2E w pliku swojego scenariusza.
- [ ] Testy są deterministyczne: stan i losowanie ustawione przez `window.__kulki`, bez prawdziwej losowości.
- [ ] Brak stałych opóźnień (`waitForTimeout`, `sleep`); brak `.only` i `.skip` bez warunku środowiskowego.
- [ ] Test sprawdza zachowanie widoczne dla gracza albo wynik funkcji, a nie szczegóły implementacji.
- [ ] Testy E2E przechodzą we wszystkich trzech projektach (Chromium, Firefox, WebKit).

### Skrypty, Compose, CI

- [ ] `scripts/*.sh` zaczynają się od `set -euo pipefail` i zwracają kod błędu narzędzia.
- [ ] `compose.e2e.yml` nie publikuje portów; `scripts/test-e2e.sh` zachowuje nazwę projektu `e2e-${E2E_RUN_ID}` i sprzątanie w `trap`.
- [ ] CI woła wyłącznie skrypty ze `scripts/`; lista w `.ai/agentic.config.json` (`validation.commands`) zgadza się z `SDLC.md` i `AGENTS.md`.
- [ ] Wersja `@playwright/test` jest dokładna (bez `^`), bo wyznacza tag obrazu.
- [ ] Żadnych sekretów, tokenów ani plików `.env` w diffie.

### Publikacja (workflow, wersja, sprawdzenie po publikacji)

- [ ] Publikację wyzwala wyłącznie `push` do `main` i `workflow_dispatch`; `ci.yml` (PR) nie ma zadań ani uprawnień związanych z Pages.
- [ ] `permissions` na poziomie workflow to `contents: read`; `pages: write` i `id-token: write` ma tylko zadanie `deploy`. Żadnego `contents: write`, tokenów osobistych ani sekretów repozytorium.
- [ ] Zadanie `deploy` zależy przez `needs` od testów i bramki wersji i nie ma `if: always()`, `!cancelled()` ani `continue-on-error`; żaden krok testów nie ma `continue-on-error`.
- [ ] `concurrency` workflow „Publikacja” ma stałą grupę i `cancel-in-progress: false`; bramka wersji sprawdza gałąź `main` i to, że commit jest jej czubkiem.
- [ ] Publikowana paczka powstaje z artefaktu zbudowanego w tym samym przebiegu i zawiera dokładnie `index.html`; nie jest budowana drugi raz w zadaniu `deploy`.
- [ ] Akcje spoza `actions/*` nie są używane; każda akcja jest przypięta co najmniej do wersji głównej.
- [ ] Logika dłuższa niż jedno polecenie jest w `tools/` albo `scripts/` i ma test jednostkowy, a nie siedzi w `run:` jako skrypt wpisany w YAML.
- [ ] Każda zmieniona reguła konfiguracji ma test w `tests/unit/workflows/`; identyfikatory zadań `checks`, `e2e`, `gate`, `deploy`, `verify`, `result` się nie zmieniły (kontrakt historii publikacji).
- [ ] Budowanie jest powtarzalne: nie zależy od czasu, ścieżki bezwzględnej, plików spoza `src/` i `tools/` ani od środowiska poza `KULKI_VERSION`.
- [ ] Identyfikator wersji jest tylko w `<meta name="kulki-version">`; nie ma go w tekście widocznym na ekranie, a `src/` go nie czyta.
- [ ] Testy w `tests/postdeploy/` przechodzą w trybie atrapy, używają adresów względnych, pomijają pamięć podręczną i niczego nie zapisują poza `localStorage` przeglądarki; test tylko dla żywego adresu jest pominięty warunkiem `isLive`, nie usunięty.
- [ ] Ponawianie ma górną granicę czasu wziętą ze zmiennej (15 minut od końca testów), a nie stałe `sleep`.

## Ważność uwag

- **Blocker:** złamane kryterium akceptacji; produkt przestaje być jednym plikiem albo sięga do sieci; publikacja możliwa bez zielonych testów, spoza `main` albo z plikiem innym niż `index.html`; uprawnienia do zapisu szersze niż opisane wyżej; utrata albo błędna interpretacja zapisanych danych gracza; czerwona bramka walidacji; sekret w repozytorium; wyłączony test.
- **Major:** zmieniona asercja w istniejącym teście S1–S9 przy pracy nad S10–S16; zmieniona asercja S1–S21 przy pracy nad S22–S24; kontekst stosu na przodku kulki gry; zmieniona asercja S1–S13 inna niż brzmienie tytułu w kroku 2.1 specyfikacji S17–S21 albo zmieniona asercja S14–S16 bez wskazanego wiersza tabeli zmian; kaskada kul zużywająca losowania gry; zmieniony albo przycięty plik czcionki; brak testu dla zmienionego zachowania; złamana granica modułów; zmiana chronionego kontraktu bez opisanej ścieżki; test niedeterministyczny albo ze stałym opóźnieniem; tekst nie po polsku.
- **Minor:** nazewnictwo, brak JSDoc, powtórzenia, czytelność.

Blocker i major oznaczają `changes-requested`. Same minory nie blokują.
