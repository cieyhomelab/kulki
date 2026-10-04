# Chronione kontrakty

Powierzchnie, od których zależą gracze, testy albo inni agenci. Zmiana którejkolwiek wymaga ścieżki opisanej przy niej. Pełne definicje są w sekcjach technicznych [specyfikacji gry](.ai/specs/2026-10-04-gra-w-kulki.md) i [specyfikacji publikacji](.ai/specs/2026-10-04-publikacja-na-github-pages.md); tu jest lista i zasady zmian.

Projekt nie ma API sieciowego, bazy danych, CLI ani publikowanego pakietu.

## 1. Dane gracza w `localStorage`

Klucze `kulki.game.v1`, `kulki.best.v1`, `kulki.sound.v1` i kształt ich wartości.

- **Zmiana łamiąca:** zmiana nazwy klucza, kształtu wartości, zakresu albo znaczenia pola; zaostrzenie walidacji tak, że poprawny dotąd zapis jest odrzucany.
- **Ścieżka:** nowy klucz z wyższą wersją (`…v2`). Najlepszy wynik musi zostać przeniesiony ze starego klucza. Zapis rozgrywki i ustawienie dźwięku wolno porzucić (gracz dostaje wartości domyślne), ale trzeba to napisać w opisie PR. Test jednostkowy pokrywa odczyt starego formatu.

## 2. Interfejs testowy `window.__kulki`

Metody `setState`, `setRandom`, `getState`, `getSoundLog` oraz kolejność, w jakiej gra zużywa wartości losowe.

- **Zmiana łamiąca:** usunięcie albo zmiana nazwy metody lub pola, zmiana formatu planszy, zmiana kolejności albo liczby losowań w turze.
- **Ścieżka:** dodawanie pól i metod jest bezpieczne. Zmiana łamiąca wymaga aktualizacji sekcji technicznej specyfikacji i wszystkich testów w tym samym PR.

## 3. Kontrakt DOM dla testów

Wartości `data-testid` oraz atrybuty stanu (`data-color`, `data-selected`, `data-animating`, `data-rejected`, `aria-pressed` przycisku dźwięku).

- **Zmiana łamiąca:** zmiana nazwy albo usunięcie identyfikatora lub atrybutu, zmiana zbioru jego wartości.
- **Ścieżka:** jak w punkcie 2. Klasy CSS i struktura zagnieżdżenia nie są kontraktem.

## 4. Skrypty i bramka walidacji

Nazwy i zachowanie `scripts/lint.sh`, `test-unit.sh`, `test-integration.sh`, `test-e2e.sh`, `build.sh`; kontrakt E2E z `AGENTS.md` (projekt `e2e-${E2E_RUN_ID}`, brak portów na hoście, sprzątanie, plik sekretów).

- **Zmiana łamiąca:** zmiana nazwy skryptu, kodu wyjścia, nazwy projektu Compose, publikacja portu, rezygnacja ze sprzątania.
- **Ścieżka:** zmiana w jednym PR razem z `.ai/agentic.config.json`, `SDLC.md`, `AGENTS.md` i plikami w `.github/workflows/`.

## 5. Postać produktu

Jeden plik `dist/index.html`, działający z `file://` i z hostingu statycznego, bez sieci.

- **Zmiana łamiąca:** drugi plik, zależność uruchomieniowa, zasób z sieci, wymaganie serwera.
- **Ścieżka:** brak. To wymaganie właściciela; zmiana wymaga nowej specyfikacji.

## 6. Publikacja

Adres gry `https://cieyhomelab.github.io/kulki/`; znacznik `<meta name="kulki-version" content="…">` w pliku gry (pełny identyfikator commita albo `dev`); historia publikacji: przebiegi workflow `publish.yml` („Publikacja”) i identyfikatory jego zadań `checks`, `e2e`, `gate`, `deploy`, `verify`, `result`, z których wyznaczany jest wynik `udana`, `nieudana` albo `pominięta`.

- **Zmiana łamiąca:** zmiana nazwy albo położenia znacznika wersji lub formatu jego wartości; zmiana nazwy pliku workflow albo identyfikatora zadania; zmiana reguły wyznaczania wyniku; zmiana adresu gry.
- **Ścieżka:** znacznik, workflow i reguła wyniku: zmiana w jednym PR razem z sekcjami technicznymi specyfikacji publikacji, testami w `tests/unit/workflows/` i `tests/postdeploy/`. Adres gry: brak ścieżki, to wymaganie właściciela; zmiana wymaga nowej specyfikacji. Uwaga: zapis gracza w `localStorage` jest przypisany do adresu, więc zmiana adresu oznacza dla graczy utratę rozgrywki i najlepszego wyniku.
