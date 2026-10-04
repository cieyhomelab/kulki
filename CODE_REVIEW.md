# Reguły przeglądu kodu

Reguły specyficzne dla tego repozytorium. Uzupełniają wbudowaną checklistę `om-code-review`; nie zastępują jej. Kontekst: [AGENTS.md](AGENTS.md), [specyfikacja](.ai/specs/2026-10-04-gra-w-kulki.md), [ADR 0001](docs/adr/0001-stos-technologiczny.md).

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

## Ważność uwag

- **Blocker:** złamane kryterium akceptacji; produkt przestaje być jednym plikiem albo sięga do sieci; utrata albo błędna interpretacja zapisanych danych gracza; czerwona bramka walidacji; sekret w repozytorium; wyłączony test.
- **Major:** brak testu dla zmienionego zachowania; złamana granica modułów; zmiana chronionego kontraktu bez opisanej ścieżki; test niedeterministyczny albo ze stałym opóźnieniem; tekst nie po polsku.
- **Minor:** nazewnictwo, brak JSDoc, powtórzenia, czytelność.

Blocker i major oznaczają `changes-requested`. Same minory nie blokują.
