# AGENTS.md

Instrukcja dla agentów i ludzi pracujących w tym repozytorium. Przeczytaj ją przed każdą zmianą.

## Projekt

**Kulki** to przeglądarkowa gra logiczna dla jednego gracza (Color Lines / Kulki 98). Produktem jest **jeden samodzielny plik `dist/index.html`**: HTML, CSS i czysty JavaScript, bez bibliotek, bez backendu i bez żadnych zasobów z sieci. Interfejs jest wyłącznie po polsku.

- Specyfikacja gry (źródło prawdy o zachowaniu): [.ai/specs/2026-10-04-gra-w-kulki.md](.ai/specs/2026-10-04-gra-w-kulki.md)
- Specyfikacja publikacji pod `https://cieyhomelab.github.io/kulki/`: [.ai/specs/2026-10-04-publikacja-na-github-pages.md](.ai/specs/2026-10-04-publikacja-na-github-pages.md)
- Specyfikacja podskakującej kulki i wyglądu retro arcade (scenariusze S10–S16, rozszerza specyfikację gry): [.ai/specs/2026-10-05-podskakujaca-kulka-i-wyglad-retro.md](.ai/specs/2026-10-05-podskakujaca-kulka-i-wyglad-retro.md)
- Specyfikacja ekranu kineskopu, neonowego tytułu i nowego układu (scenariusze S17–S21, rozszerza obie powyższe): [.ai/specs/2026-10-05-ekran-kineskopu-neonowy-tytul-i-nowy-uklad.md](.ai/specs/2026-10-05-ekran-kineskopu-neonowy-tytul-i-nowy-uklad.md)
- Stos i uzasadnienie: [docs/adr/0001-stos-technologiczny.md](docs/adr/0001-stos-technologiczny.md); sposób publikacji: [docs/adr/0002-publikacja-na-github-pages.md](docs/adr/0002-publikacja-na-github-pages.md); czcionka, podskakiwanie i wygląd: [docs/adr/0003-podskakujaca-kulka-i-wyglad-retro.md](docs/adr/0003-podskakujaca-kulka-i-wyglad-retro.md); układ, tytuł, kaskada kul i ekran kineskopu: [docs/adr/0004-ekran-kineskopu-neonowy-tytul-i-nowy-uklad.md](docs/adr/0004-ekran-kineskopu-neonowy-tytul-i-nowy-uklad.md)
- Proces i etykiety: [SDLC.md](SDLC.md); reguły przeglądu: [CODE_REVIEW.md](CODE_REVIEW.md); chronione kontrakty: [BACKWARD_COMPATIBILITY.md](BACKWARD_COMPATIBILITY.md); konfiguracja pipeline'u: `.ai/agentic.config.json`

## Stos

| Obszar | Narzędzie |
|---|---|
| Produkt | JavaScript ES2022 (moduły ES) + HTML + CSS, zero zależności uruchomieniowych |
| Wygląd | ręcznie pisany CSS ze zmiennymi w `:root`, bez obrazów i SVG; czcionka Press Start 2P wklejana do pliku gry przy budowaniu, patrz ADR 0003 i ADR 0004 |
| Typy | JSDoc sprawdzany przez `tsc --noEmit` (`checkJs`); nie ma plików `.ts` |
| Budowanie | esbuild + `tools/build.js` → `dist/index.html` |
| Lint i format | ESLint (flat config), Prettier |
| Testy jednostkowe i integracyjne | Vitest; integracyjne używają jsdom na zbudowanym pliku |
| Testy E2E | Playwright (Chromium, Firefox, WebKit) w Docker Compose |
| Uruchamianie | `docker compose up --build` (nginx z `dist/index.html`) |
| Publikacja | GitHub Pages przez GitHub Actions (artefakt z jednym `index.html`), patrz ADR 0002 |
| Testy konfiguracji CI | Vitest + parser `yaml` na plikach `.github/workflows/` |
| Narzędzia | Node.js ≥ 20.19 (CI i obrazy: 24), npm |

## Struktura katalogów i gdzie co dodawać

```
src/
  index.html        szablon strony; znaczniki <!-- inline:css --> i <!-- inline:js --> zostają
  styles.css        cały CSS gry
  fonts/            czcionka gry (oryginalny plik TTF) i jej licencja OFL.txt; wklejana do CSS przy budowaniu
  main.js           punkt wejścia: tylko składa moduły i startuje aplikację
  game/             czysta logika gry: plansza, droga, linie, punktacja, tura, rng
  storage/          zapis i odczyt z localStorage, osobny moduł na każdą zapisywaną daną
  audio/            dźwięki syntezowane przez Web Audio i rejestr odtworzonych dźwięków
  ui/               wszystko, co dotyka DOM: widoki, animacje, okna dialogowe, teksty
  test-api.js       interfejs testowy window.__kulki
tools/              skrypty budujące (Node), nie trafiają do produktu
tests/
  unit/             testy jednostkowe, układ katalogów jak w src/ i tools/
    workflows/      testy konfiguracji plików .github/workflows; helpers/load-workflow.js
  integration/      testy na zbudowanym dist/index.html w jsdom; helpers/load-game.js
  e2e/              testy Playwright; jeden plik na scenariusz specyfikacji gry
  postdeploy/       sprawdzenie po publikacji (projekt Playwright `postdeploy`); helpers/target.js
scripts/            jednolity punkt wejścia dla agentów i CI
docs/adr/           decyzje architektoniczne, kolejne numery
.ai/specs/          specyfikacje
```

Przeznaczenie i kontrakty modułów opisują sekcje techniczne specyfikacji. Moduły `src/ui/bounce.js`, `src/ui/motion.js` i `tools/embed-fonts.js` pochodzą ze specyfikacji S10–S16. Moduł `src/ui/cascade.js` (stała tablica kul kaskady i budowanie jej elementów) powstaje przy implementacji specyfikacji S17–S21.

Granice modułów:

- `src/game/` nie dotyka `document`, `window`, `localStorage` ani czasu. Losowość dostaje jako parametr (`rng`). Dzięki temu całą logikę testuje się jednostkowo.
- `src/ui/` nie zawiera reguł gry. Pyta `src/game/` o wynik tury i go pokazuje.
- `src/storage/` i `src/audio/` to jedyne miejsca, które używają odpowiednio `localStorage` i `AudioContext`.

## Routing zadań

| Gdy zadanie dotyczy… | Najpierw przeczytaj | Kluczowe zasady |
|---|---|---|
| reguł gry (droga, linie, punkty, dolosowanie, koniec gry) | „Zasady gry” i sekcje techniczne specyfikacji, `src/game/` | czyste funkcje, bez DOM; `rng` wstrzykiwany; test jednostkowy do każdej reguły |
| ekranu, kliknięć, animacji, okien dialogowych | scenariusz w specyfikacji, „Kontrakty API” (kontrakt DOM), `src/ui/` | atrybuty `data-testid` i `data-*` z kontraktu; teksty tylko po polsku w `src/ui/texts.js`; animacja ≤ 1 s |
| zapisu wyniku, rozgrywki, ustawień | „Model danych” w specyfikacji, `src/storage/` | każda dana walidowana osobno; błąd odczytu lub zapisu = wartość domyślna, bez komunikatu |
| podskakiwania zaznaczonej kulki, ograniczonego ruchu | S10–S13, „Architektura” i „Kontrakt DOM: podskakiwanie” w specyfikacji S10–S16, `src/ui/bounce.js`, `src/ui/motion.js` | `data-bouncing` tylko gdy animacja działa; animacja CSS wyłącznie na `transform`, bez `alternate` i bez `transition`; czas cyklu tylko w `BOUNCE_CYCLE_MS`; o ograniczonym ruchu decyduje `motion.js`, nie `@media` |
| wyglądu, palety, czcionki, efektu CRT | S14, S15, „Kontrakt DOM i stylów: wygląd” w specyfikacji S10–S16, ADR 0003, `src/styles.css`, `src/fonts/` | kolory i rozmiary jako zmienne CSS; jednolite tło pod napisami; jedna warstwa `box-shadow` bez rozmycia; kolejność i brzmienie napisów bez zmian; `window.__kulki` bez zmian |
| układu ekranu, kolumny bocznej, położenia okien, kolorów siatki planszy | S17, „Architektura” i „Co testy odczytują: układ” w specyfikacji S17–S21, ADR 0004, `src/ui/app.js`, `src/styles.css` | siatka CSS na `#app`; panele, przyciski i okna w `sidebar` o stałej szerokości; okno jest ostatnim dzieckiem `sidebar` i niczego nie przesuwa; kolejność napisów w DOM bez zmian; `--cell` odlicza blok tytułu i margines od krawędzi okna |
| tytułu „KULKI” i kaskady kul | S18, S19, „Co testy odczytują: tytuł” i „kaskada” w specyfikacji S17–S21, ADR 0004, `src/ui/cascade.js`, `src/styles.css` | jeden `h1` z jednym napisem; obrys przez `-webkit-text-stroke`, głębia i poświata przez `text-shadow`, wartości w zmiennych `--title-*` bez `color-mix`; kule z zamrożonej tablicy, bez `rng`; wypełnienie kul z tej samej reguły co kulki gry; brzmienie tytułu zmienia tylko krok 2.1 |
| ekranu kineskopu: krawędzi, odblasku, linii skanowania, poświaty | S20, „Co testy odczytują: ekran” w specyfikacji S17–S21, ADR 0004, `src/index.html`, blok „efekt CRT” w `src/styles.css` | krawędź i czerń poza nią na elemencie `crt`, który pozostaje pusty; odblask to osobny `crt-glare` obok niego; oba `position: fixed` i `pointer-events: none`; siła efektu w zmiennych `--crt-*`; bez animacji; treść gry bez `transform` i `filter` |
| dźwięków | S9, „Architektura” w specyfikacji, `src/audio/` | dźwięk syntezowany, żadnych plików; wpis do rejestru tylko przy faktycznym odtworzeniu |
| interfejsu testowego | „Kontrakty API” w specyfikacji, `src/test-api.js` | kontrakt chroniony, patrz `BACKWARD_COMPATIBILITY.md` |
| budowania i jednego pliku | `tools/build.js`, `tools/inline.js`, `tools/embed-fonts.js`, `tests/integration/single-file.test.js` | wynik to jeden plik bez odwołań na zewnątrz; zasoby z `src/fonts/` trafiają do CSS jako `data:` |
| testów E2E i Compose | `scripts/test-e2e.sh`, `compose.e2e.yml`, `Dockerfile`, `tests/e2e/playwright.config.js` | kontrakt E2E poniżej; bez stałych portów |
| CI | `.github/workflows/tests.yml` (wspólne testy), `ci.yml` (PR) | testy żyją w `tests.yml`; `ci.yml` tylko je woła; kroki wołają tylko skrypty ze `scripts/` |
| publikacji, workflow „Publikacja”, historii publikacji | specyfikacja publikacji (sekcje techniczne), ADR 0002, `.github/workflows/` | każda reguła konfiguracji ma test w `tests/unit/workflows/`; uprawnienia do Pages tylko w zadaniu `deploy`; logika w `tools/` albo `scripts/`, nie w YAML-u |
| sprawdzenia po publikacji | scenariusze P1–P4, `tests/postdeploy/`, `tests/postdeploy/helpers/target.js` | test przechodzi w trybie atrapy; adresy względne (`./`); test tylko dla żywego adresu ma `test.skip(!isLive, …)` |
| identyfikatora wersji w pliku gry | „Dane” w specyfikacji publikacji, `tools/build.js`, `tools/inline.js` | `KULKI_VERSION` albo `dev`; niewidoczny na ekranie; budowanie daje ten sam plik w każdym środowisku |

## Komendy

Wszyscy (agenci, ludzie, CI) używają tych samych skryptów. Każdy kończy się kodem różnym od zera przy błędzie i sam instaluje zależności (`npm ci`), gdy ich brakuje.

| Komenda | Co robi |
|---|---|
| `scripts/lint.sh` | ESLint, Prettier (`--check`), sprawdzanie typów |
| `scripts/test-unit.sh` | testy jednostkowe (`tests/unit`) |
| `scripts/test-integration.sh` | buduje `dist/index.html` i testuje go w jsdom (`tests/integration`) |
| `scripts/test-e2e.sh` | Playwright w tymczasowym stosie Docker Compose |
| `scripts/build.sh` | buduje `dist/index.html` |

Bramka walidacji to te pięć skryptów w tej kolejności. Dodatkowe argumenty trafiają do narzędzia, np. `scripts/test-unit.sh tests/unit/inline.test.js` albo `scripts/test-e2e.sh --project chromium start-screen`. Formatowanie poprawia `npm run format`.

`scripts/test-e2e.sh` uruchamia cztery projekty Playwrighta: `chromium`, `firefox` i `webkit` na `tests/e2e/` oraz `postdeploy` (Chromium) na `tests/postdeploy/`.

### Kontrakt `scripts/test-e2e.sh`

- Stawia własny stos Compose o nazwie projektu `e2e-${E2E_RUN_ID}`. Bez tej zmiennej identyfikator jest losowy. Kilka przebiegów może działać jednocześnie; przy pracy równoległej ustaw `E2E_RUN_ID` na identyfikator zadania i ogranicz liczbę procesów testów: `scripts/test-e2e.sh --workers 2`. Domyślnie każdy przebieg bierze połowę rdzeni maszyny, więc dwa pełne przebiegi naraz ją przeciążają i testy zależne od czasu animacji (S2, S3) zaczynają losowo padać.
- Nie publikuje portów na hoście. Testy działają w kontenerze `e2e` w sieci Compose i łączą się z grą pod `http://web` (`E2E_BASE_URL`). Ten sam plik jest też dostępny z dysku pod `E2E_FILE_URL` (`file://`).
- Zawsze sprząta: `docker compose down -v` w `trap`, także przy błędzie i przerwaniu. Po przebiegu nie zostaje kontener, sieć, wolumen ani obraz z prefiksem `e2e-`.
- Przy niepowodzeniu kopiuje ślady i zrzuty ekranu Playwrighta do `test-results/e2e-<id>/`.
- Wczytuje `${SH_SECRETS_DIR:-$HOME/.sh-secrets}/kulki.env`, jeśli plik istnieje. Projekt nie ma dziś żadnych sekretów i komplet testów działa bez nich.
- Projekt `postdeploy` ma dwa tryby. **Atrapa** (domyślny, `POSTDEPLOY_URL` puste): sprawdza usługę `web` ze stosu Compose i jest częścią bramki. **Na żywo**: `POSTDEPLOY_URL=https://cieyhomelab.github.io/kulki/ scripts/test-e2e.sh --project postdeploy` sprawdza opublikowaną grę; tak woła go workflow „Publikacja” po umieszczeniu gry. Tryb na żywo potrzebuje internetu, niczego nie publikuje i niczego nie zmienia pod adresem. Pozostałe zmienne `POSTDEPLOY_*` opisuje specyfikacja publikacji i `.env.example`.
- Wersja Playwrighta jest czytana z `package.json` (`@playwright/test`, wersja dokładna) i musi mieć odpowiadający obraz `mcr.microsoft.com/playwright`. Podbijaj ją tylko w `package.json`.

## Zasady testowania

- **Każda zmiana zachowania ma test.** Poprawka błędu zaczyna się od testu, który ten błąd odtwarza.
- **Każdy scenariusz ze specyfikacji ma test E2E**, a każde kryterium akceptacji ma co najmniej jeden test. Plik: `tests/e2e/s<numer>-<nazwa>.spec.js`, np. `s4-zbicie-linii.spec.js`; tytuł testu zaczyna się od numeru scenariusza (`S4: ...`).
- **Scenariusze publikacji (P1–P5)** mają test tam, gdzie wskazuje oznaczenie kryterium: `[po publikacji]` w `tests/postdeploy/p<numer>-<nazwa>.spec.js` (tytuł `P1: ...`), `[konfiguracja]` w `tests/unit/workflows/` (tytuł także zaczyna się od numeru scenariusza). Kryteria `[ręcznie]` nie mają testu; próbę opisuje się w PR.
- Testy w `tests/postdeploy/` muszą przechodzić w trybie atrapy. Nie zmieniają niczego poza `localStorage` własnej przeglądarki, pobierają strony z pominięciem pamięci podręcznej i używają adresów względnych (`./`, `./index.html`), bo gra jest opublikowana pod ścieżką `/kulki/`. Na pojawienie się wersji czekają asercją z ponawianiem (`expect(...).toPass`), nie pętlą ze stałym opóźnieniem.
- Testy konfiguracji czytają workflow przez `tests/unit/workflows/helpers/load-workflow.js` i sprawdzają sparsowaną strukturę, nie tekst pliku.
- **Scenariusze S10–S16** mają testy w `tests/e2e/s10-…` do `s16-…`. Istniejących asercji w testach S1–S9 nie zmieniaj: wymaga tego S16. Jedyny wyjątek opisuje następny punkt. Nowe informacje czytaj z DOM i stylów obliczonych (kontrakt w specyfikacji S10–S16), nie z nowych pól `getState()`.
- **Scenariusze S17–S21** mają testy w `tests/e2e/s17-…` do `s21-…`. Asercji S1–S13 nie zmieniaj, poza oczekiwanym brzmieniem tytułu na ekranie („KULKI” zamiast „Kulki”), które zmienia wyłącznie krok 2.1 specyfikacji S17–S21, razem z `src/ui/texts.js`. Asercje S14–S16 wolno zmienić tylko wtedy, gdy są sprzeczne z tabelą „Zmiany względem wcześniejszych specyfikacji”; każdą taką zmianę wymień w opisie PR.
- Wygląd przy 1920×1080 sprawdzaj przez `page.setViewportSize` w teście. Zrzuty ekranu porównuj tylko w obrębie jednego testu; repozytorium nie przechowuje zrzutów wzorcowych. Piksele zrzutu dekoduj w przeglądarce (`<canvas>` utworzony w teście), bez nowej zależności.
- Przed pomiarem układu albo czcionki poczekaj na `document.fonts.ready`. Na cykle podskoku czekaj asercją z ponawianiem na `data-bounce-cycles`. Ograniczony ruch i motyw systemu ustawiaj przez `page.emulateMedia`.
- Reguły gry sprawdzaj przede wszystkim jednostkowo w `tests/unit/game/`; E2E potwierdza, że gracz widzi ich skutek.
- Testy E2E ustawiają stan przez `window.__kulki` (zadana plansza, wynik, podgląd, przewidywalne losowanie) i czytają go z DOM. Nie polegaj na prawdziwej losowości.
- Nie używaj stałych opóźnień (`waitForTimeout`, `setTimeout` w teście). Czekaj na stan: `data-animating="false"`, widoczność elementu, asercje z automatycznym ponawianiem.
- Kryteria oznaczone w specyfikacji jako oceniane ręcznie (wygląd animacji, brzmienie dźwięków, rozróżnialność kolorów) nie mają testu automatycznego; nie udawaj ich testem.
- Testy integracyjne ładują zbudowany plik przez `tests/integration/helpers/load-game.js`.

## Konwencje

**Nazewnictwo.** Pliki w `kebab-case.js`. Funkcje i zmienne w `camelCase`, stałe modułu w `UPPER_SNAKE_CASE`. Kod, komentarze, nazwy testów i commity po angielsku; teksty widoczne dla gracza po polsku i tylko w `src/ui/texts.js`. Dokumenty (`docs/`, specyfikacje, ten plik) po polsku. Commity w stylu Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `ci:`).

**Typy.** Każda eksportowana funkcja ma JSDoc z typami parametrów i wyniku. Wspólne kształty danych opisuj przez `@typedef`. `// @ts-ignore` i `any` wymagają komentarza z powodem.

**Obsługa błędów.** Funkcje w `src/game/` rzucają `Error` przy błędzie programisty (zły indeks pola, ruch z pustego pola); nie zwracają cichych wartości domyślnych. Błędy środowiska (niedostępny albo uszkodzony `localStorage`, zablokowany dźwięk) są łapane w `src/storage/` i `src/audio/` i zamieniane na wartość domyślną. Gracz nigdy nie widzi komunikatu o błędzie. Pusty `catch` jest dopuszczalny tylko tam i z komentarzem, co jest ignorowane.

**Logowanie.** Produkt niczego nie loguje: `console.*` w `src/` jest zabronione przez ESLint. Skrypty w `tools/` i `scripts/` wypisują krótki wynik na stdout, a błędy na stderr.

**Dane i „migracje”.** Nie ma bazy danych. Trwałe dane to trzy klucze `localStorage` z wersją w nazwie (`kulki.game.v1`, `kulki.best.v1`, `kulki.sound.v1`). Zmiana kształtu zapisanej danej oznacza nowy klucz (`…v2`) i jawną decyzję, co zrobić ze starym: przeczytać i przepisać albo zignorować. Nigdy nie zmieniaj znaczenia istniejącego klucza. Szczegóły: „Model danych” w specyfikacji.

**Wygląd.** Kolory, rozmiary czcionki i wymiary cieni są zmiennymi CSS w `:root`; reguły nie zawierają kolorów wpisanych na sztywno poza definicjami zmiennych. Gra ma jeden ciemny motyw. Okna pytania i końca gry leżą w układzie strony i nie zasłaniają planszy ani przycisków; od specyfikacji S17–S21 są ostatnim dzieckiem kolumny bocznej. Każdy etap wyglądu pracuje we własnym bloku `src/styles.css` i na własnych zmiennych (`--title-*`, `--crt-*`). Dekoracje (kaskada kul, odblask szkła) są puste, mają `aria-hidden="true"` i nie mają obsługi kliknięć.

**Czas i losowość.** Czasy animacji są stałymi w jednym module `src/ui/` (`timing.js`); do CSS trafiają jako zmienne ustawiane z JavaScriptu, nie jako druga kopia wartości. Losowość pochodzi wyłącznie z `rng` tworzonego w `src/game/rng.js`.

## Sekrety

Projekt nie ma sekretów. Publikacja używa wyłącznie automatycznego `GITHUB_TOKEN` z GitHub Actions; nie twórz tokenów osobistych ani sekretów repozytorium. Gdyby sekrety się pojawiły: nigdy w repozytorium, tylko w `${SH_SECRETS_DIR:-$HOME/.sh-secrets}/kulki.env`, a każda nowa zmienna trafia do `.env.example` z opisem i informacją, czy jest wymagana. Plik `.env` jest ignorowany przez git.

## Czego nie robić

- Nie dodawaj zależności uruchomieniowych (`dependencies` w `package.json` ma pozostać puste) ani żadnych zasobów z sieci: czcionek, obrazów, dźwięków, skryptów. Produkt nie wykonuje żadnych żądań sieciowych.
- Nie edytuj ani nie commituj `dist/`. To wynik budowania.
- Nie otwieraj `src/index.html` jako gry; gra to `dist/index.html` po `scripts/build.sh`.
- Nie dodawaj plików TypeScript ani frameworków UI. Zmiana stosu wymaga nowego ADR.
- Nie używaj `Math.random` poza `src/game/rng.js`, `alert`/`confirm`/`prompt`, ani `console.*` w `src/`.
- Nie rysuj planszy na `<canvas>`: testy czytają stan pól z DOM. Tytułu, kul kaskady ani efektu ekranu nie rób obrazem, SVG ani `<canvas>`: testy czytają ich style obliczone.
- Nie zmieniaj, nie przycinaj i nie przepakowuj pliku czcionki w `src/fonts/` i nie usuwaj `OFL.txt`: licencja pozwala używać nazwy czcionki tylko dla pliku niezmienionego. Inna czcionka wymaga nowego ADR.
- Nie dodawaj pól ani metod do `window.__kulki` dla podskakiwania i wyglądu; istniejące testy porównują cały wynik `getState()`.
- Nie używaj `text-transform`, napisów w `content` pseudoelementów ani przestawiania napisów w DOM: testy porównują widoczny tekst. Nie powielaj napisu tytułu, żeby uzyskać obrys albo głębię.
- Nie zniekształcaj treści gry: żadnego `transform`, `filter`, `perspective` ani `backdrop-filter` na `#app`, planszy i ich przodkach. Wypukłość ekranu jest złudzeniem.
- Nie wkładaj niczego do elementu `crt` i nie używaj `rng` ani `Math.random` do kaskady kul: kolejność losowań gry jest chronionym kontraktem.
- Nie dodawaj obsługi kliknięć do tytułu, kul kaskady ani tła i nie odznaczaj kulki po kliknięciu poza planszą.
- Nie dodawaj animacji ani `transition` do efektu CRT, odblasku szkła, tytułu, kul kaskady, przycisków i elementu kulki; nieruchomy ekran nie ma żadnej działającej animacji.
- Nie wkładaj reguł gry do `src/ui/` ani dostępu do DOM do `src/game/`.
- Nie publikuj stałych portów w testach E2E i nie omijaj `scripts/test-e2e.sh` własnym `docker compose up`.
- Nie wyłączaj ani nie pomijaj testów (`.skip`, `.only`), nie używaj `--no-verify`, nie rób force-push.
- Nie zmieniaj kontraktów z `BACKWARD_COMPATIBILITY.md` bez opisanej tam ścieżki.
- Nie publikuj gry inną drogą niż workflow „Publikacja”: żadnej gałęzi `gh-pages`, żadnego ręcznego wgrywania, żadnej publikacji z PR albo z gałęzi innej niż `main`.
- Nie dodawaj do publikowanej paczki niczego poza `index.html` (także strony 404, ikony, `robots.txt`).
- Nie pokazuj identyfikatora wersji na ekranie gry i nie uzależniaj od niego zachowania gry.
- Nie zmieniaj ustawień repozytorium (Pages, środowiska, ochrona gałęzi) z kodu ani z workflow; to czynności właściciela opisywane w PR.
- Nie implementuj rzeczy z sekcji „Poza zakresem” specyfikacji.
