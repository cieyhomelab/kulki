# Chronione kontrakty

Powierzchnie, od których zależą gracze, testy albo inni agenci. Zmiana którejkolwiek wymaga ścieżki opisanej przy niej. Pełne definicje są w sekcjach technicznych [specyfikacji gry](.ai/specs/2026-10-04-gra-w-kulki.md), [specyfikacji publikacji](.ai/specs/2026-10-04-publikacja-na-github-pages.md), [specyfikacji podskakującej kulki i wyglądu retro](.ai/specs/2026-10-05-podskakujaca-kulka-i-wyglad-retro.md) i [specyfikacji ekranu kineskopu, neonowego tytułu i nowego układu](.ai/specs/2026-10-05-ekran-kineskopu-neonowy-tytul-i-nowy-uklad.md); tu jest lista i zasady zmian.

Projekt nie ma API sieciowego, bazy danych, CLI ani publikowanego pakietu.

## 1. Dane gracza w `localStorage`

Klucze `kulki.game.v1`, `kulki.best.v1`, `kulki.sound.v1` i kształt ich wartości.

- **Zmiana łamiąca:** zmiana nazwy klucza, kształtu wartości, zakresu albo znaczenia pola; zaostrzenie walidacji tak, że poprawny dotąd zapis jest odrzucany.
- **Ścieżka:** nowy klucz z wyższą wersją (`…v2`). Najlepszy wynik musi zostać przeniesiony ze starego klucza. Zapis rozgrywki i ustawienie dźwięku wolno porzucić (gracz dostaje wartości domyślne), ale trzeba to napisać w opisie PR. Test jednostkowy pokrywa odczyt starego formatu.

## 2. Interfejs testowy `window.__kulki`

Metody `setState`, `setRandom`, `getState`, `getSoundLog` oraz kolejność, w jakiej gra zużywa wartości losowe.

- **Zmiana łamiąca:** usunięcie albo zmiana nazwy metody lub pola, zmiana formatu planszy, zmiana kolejności albo liczby losowań w turze.
- **Ścieżka:** dodawanie metod jest bezpieczne. Nowe pole w `getState()` nie łamie kontraktu, ale istniejące testy porównują cały zwracany obiekt, więc wymaga zmiany tych testów w tym samym PR; informacje dla testów dodawaj raczej jako atrybuty DOM. Zmiana łamiąca wymaga aktualizacji sekcji technicznej specyfikacji i wszystkich testów w tym samym PR.

## 3. Kontrakt DOM dla testów

Wartości `data-testid` oraz atrybuty stanu (`data-color`, `data-selected`, `data-animating`, `data-rejected`, `aria-pressed` przycisku dźwięku).

Od specyfikacji S10–S16, po wdrożeniu odpowiednich kroków, także: element kulki `ball-{wiersz}-{kolumna}` w każdym polu, atrybuty `data-bouncing` (pole) i `data-bounce-cycles` (plansza), identyfikatory `title`, `score-panel`, `score-label`, `best-score-panel`, `best-score-label`, `preview-label`, `crt`, zmienne CSS `--c1`…`--c7` z kolorami kulek, nazwa rodziny czcionki `Press Start 2P` oraz brzmienie i kolejność napisów widocznych na ekranie.

Od specyfikacji S17–S21, po wdrożeniu odpowiednich kroków, także: identyfikatory `hero`, `sidebar`, `cascade`, `cascade-ball` (z atrybutem `data-color`) i `crt-glare`; położenie okien jako ostatniego dziecka `sidebar`; zmienne CSS `--title-fill`, `--title-stroke-color`, `--title-stroke-width`, `--title-depth-color`, `--title-depth-offset`, `--title-glow-color`, `--title-glow-blur`, `--crt-edge-radius`, `--crt-scanline-alpha` i `--crt-glow-blur`; sposób zapisu wyglądu tytułu (obrys w `-webkit-text-stroke`, głębia i poświata w `text-shadow`) i krawędzi ekranu (`border-radius` elementu `crt`), bo z nich czytają testy.

**Brzmienie tytułu.** Tytuł na ekranie brzmi „KULKI” (krok 2.1 specyfikacji S17–S21 wdrożony; wcześniej „Kulki”). To jedyna zaplanowana zmiana brzmienia napisu: krok 2.1 zmienia `src/ui/texts.js`, napis zastępczy w szablonie i oczekiwane brzmienie tytułu w istniejących testach w jednym PR. Nazwa karty przeglądarki (`<title>`) pozostaje „Kulki”.

- **Zmiana łamiąca:** zmiana nazwy albo usunięcie identyfikatora lub atrybutu, zmiana zbioru jego wartości albo znaczenia (np. `data-bouncing="true"` przy nieruchomej kulce).
- **Ścieżka:** jak w punkcie 2. Klasy CSS i struktura zagnieżdżenia nie są kontraktem.

## 4. Skrypty i bramka walidacji

Nazwy i zachowanie `scripts/lint.sh`, `test-unit.sh`, `test-integration.sh`, `test-e2e.sh`, `build.sh`; kontrakt E2E z `AGENTS.md` (projekt `e2e-${E2E_RUN_ID}`, brak portów na hoście, sprzątanie, plik sekretów). Bramkę w CI wykonuje wielokrotnego użytku `.github/workflows/tests.yml` (pięć skryptów, wejście `version`, wyjście `sha256`), wołany przez `ci.yml` i `publish.yml`.

- **Zmiana łamiąca:** zmiana nazwy skryptu, kodu wyjścia, nazwy projektu Compose, publikacja portu, rezygnacja ze sprzątania.
- **Ścieżka:** zmiana w jednym PR razem z `.ai/agentic.config.json`, `SDLC.md`, `AGENTS.md` i plikami w `.github/workflows/`.

## 5. Postać produktu

Jeden plik `dist/index.html`, działający z `file://` i z hostingu statycznego, bez sieci.

Czcionka gry jest częścią tego pliku (adres `data:`); jej plik źródłowy `src/fonts/PressStart2P-Regular.ttf` jest niezmienionym oryginałem, a obok niego leży licencja `OFL.txt`.

- **Zmiana łamiąca:** drugi plik, zależność uruchomieniowa, zasób z sieci, wymaganie serwera; zmiana, przycięcie albo przepakowanie pliku czcionki, usunięcie licencji.
- **Ścieżka:** brak. To wymaganie właściciela; zmiana wymaga nowej specyfikacji.

## 6. Publikacja

Adres gry `https://cieyhomelab.github.io/kulki/`; znacznik `<meta name="kulki-version" content="…">` w pliku gry (pełny identyfikator commita albo `dev`); historia publikacji: przebiegi workflow `publish.yml` („Publikacja”) i identyfikatory jego zadań `checks`, `e2e`, `gate`, `deploy`, `verify`, `result`, z których wyznaczany jest wynik `udana`, `nieudana` albo `pominięta`.

- **Zmiana łamiąca:** zmiana nazwy albo położenia znacznika wersji lub formatu jego wartości; zmiana nazwy pliku workflow albo identyfikatora zadania; zmiana reguły wyznaczania wyniku; zmiana adresu gry.
- **Ścieżka:** znacznik, workflow i reguła wyniku: zmiana w jednym PR razem z sekcjami technicznymi specyfikacji publikacji, testami w `tests/unit/workflows/` i `tests/postdeploy/`. Adres gry: brak ścieżki, to wymaganie właściciela; zmiana wymaga nowej specyfikacji. Uwaga: zapis gracza w `localStorage` jest przypisany do adresu, więc zmiana adresu oznacza dla graczy utratę rozgrywki i najlepszego wyniku.
