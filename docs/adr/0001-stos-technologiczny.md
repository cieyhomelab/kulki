# ADR 0001: Stos technologiczny

- **Status:** przyjęta
- **Data:** 2026-10-04
- **Specyfikacja:** [Gra w kulki](../../.ai/specs/2026-10-04-gra-w-kulki.md)

## Kontekst

Specyfikacja opisuje grę logiczną dla jednego gracza, działającą wyłącznie w przeglądarce. Z punktu widzenia wyboru stosu liczą się następujące wymagania:

- **Forma dostarczenia (wymaganie właściciela):** jeden plik `index.html` z HTML, nowoczesnym CSS i czystym JavaScriptem, bez zewnętrznych bibliotek i bez zasobów pobieranych z sieci.
- Gra działa po otwarciu pliku z dysku (`file://`) oraz z dowolnego hostingu plików statycznych, bez połączenia z internetem.
- Brak backendu, brak integracji zewnętrznych, brak danych osobowych. Dane (rozgrywka, najlepszy wynik, ustawienie dźwięku) żyją tylko w przeglądarce.
- Przeglądarki: aktualne Chrome, Firefox, Edge i Safari; komputer, sterowanie myszą.
- Testowalność: gra musi dać się uruchomić w testach z zadanym stanem i przewidywalnym losowaniem oraz udostępnić testom swój stan.
- Nad kodem pracuje równolegle kilku agentów, więc kod musi być podzielony na małe pliki, a logika gry (droga, linie, punktacja, dolosowanie) musi dać się testować bez przeglądarki.

Napięcie do rozstrzygnięcia: produktem ma być **jeden plik**, ale jeden ręcznie pisany plik z całą grą źle się testuje jednostkowo i powoduje konflikty przy pracy równoległej.

## Decyzja

**Produkt:** czysty JavaScript (moduły ES), HTML i CSS w katalogu `src/`, bez żadnych zależności uruchomieniowych. Krok budowania skleja je w jeden samodzielny plik `dist/index.html`.

**Narzędzia (wyłącznie deweloperskie, nie trafiają do produktu):**

| Obszar | Wybór |
|---|---|
| Język produktu | JavaScript (ES2022, moduły ES), typy w komentarzach JSDoc |
| Sprawdzanie typów | TypeScript w trybie `checkJs` (`tsc --noEmit`), bez kompilacji |
| Budowanie | esbuild (bundel IIFE, bez minifikacji) + `tools/build.js` wklejający CSS i JS do szablonu HTML |
| Lint i format | ESLint (flat config) i Prettier |
| Testy jednostkowe | Vitest, środowisko Node |
| Testy integracyjne | Vitest + jsdom, uruchamiane na zbudowanym `dist/index.html` |
| Testy E2E | Playwright (Chromium, Firefox, WebKit) w kontenerze, w sieci Docker Compose |
| Uruchamianie | Docker Compose: nginx serwujący `dist/index.html` jako hosting statyczny |
| Środowisko narzędzi | Node.js (≥ 20.19 lokalnie, 24 LTS w CI i w obrazach) i npm |
| CI | GitHub Actions |

**Baza danych, cache, backend:** brak, bo specyfikacja ich nie wymaga. Jedynym magazynem danych jest `localStorage` przeglądarki.

**Artefakt:** `dist/index.html` nie jest commitowany. Powstaje z `scripts/build.sh`, a CI publikuje go jako artefakt przebiegu. Dzięki temu równoległe zadania nie konfliktują się na wygenerowanym pliku, a plik nigdy nie rozjeżdża się ze źródłami.

**Zgodność z „jednym plikiem”:** pilnują jej testy integracyjne, które czytają zbudowany plik i sprawdzają, że nie odwołuje się do żadnego zewnętrznego zasobu, oraz test E2E otwierający ten sam plik przez `file://`.

## Rozważone alternatywy

**Jeden ręcznie pisany `index.html` bez kroku budowania.** Najbliżej litery wymagania i zero narzędzi. Przegrał, bo logiki zaszytej w `<script>` nie da się importować w testach jednostkowych bez sztuczek, a wszyscy agenci edytowaliby ten sam duży plik, co przy pracy równoległej oznacza ciągłe konflikty. Krok budowania daje ten sam produkt (jeden plik, czysty JS), a usuwa oba problemy.

**TypeScript jako język źródeł.** Agenci znają go bardzo dobrze i typy są wygodniejsze niż JSDoc. Przegrał, bo właściciel wprost zażądał czystego JavaScriptu; źródła w JS z `checkJs` spełniają to wymaganie także na poziomie kodu, a kontrolę typów i tak zachowujemy. Wynikowy plik jest praktycznie tym, co napisano w `src/`.

**Framework UI (React, Vue, Svelte) albo biblioteka do gier (Phaser, PixiJS).** Przegrały, bo specyfikacja zakazuje zewnętrznych bibliotek w produkcie, a plansza 9×9 z kilkoma animacjami CSS ich nie potrzebuje.

**Vite zamiast samego esbuild.** Vite daje serwer deweloperski z HMR, ale wymaga wtyczki do wklejania zasobów w jeden plik i dokłada warstwę konfiguracji. Przegrał z zasadą „mało ruchomych części”: skrypt budujący ma kilkadziesiąt linii i robi dokładnie jedną rzecz.

**Canvas zamiast DOM do rysowania planszy.** To decyzja wewnątrz produktu, ale wpływa na testowalność: specyfikacja wymaga, żeby testy odczytywały zawartość każdego pola, zaznaczenie i stan animacji. Elementy DOM z atrybutami `data-*` dają to bezpośrednio, canvas wymagałby osobnego kanału. Przegrał.

**Cypress albo WebdriverIO do E2E.** Playwright wygrał, bo jednym narzędziem obsługuje silniki wszystkich czterech wymaganych przeglądarek (Chromium pokrywa Chrome i Edge, WebKit pokrywa Safari), ma oficjalny obraz Dockera z przeglądarkami i dobrze działa z `file://`.

**Jest zamiast Vitest.** Oba dojrzałe; Vitest obsługuje moduły ES bez konfiguracji transformacji, więc przy źródłach w ESM jest mniej do ustawiania.

## Konsekwencje

- Produkt powstaje dopiero po `scripts/build.sh`; samego `src/index.html` nie da się otworzyć jako gry. `AGENTS.md` mówi o tym wprost.
- Wersja `@playwright/test` w `package.json` musi być identyczna z tagiem obrazu Playwrighta. `scripts/test-e2e.sh` odczytuje ją z `package.json` i przekazuje do budowania obrazu, więc podbija się ją w jednym miejscu.
- Edge i Safari nie są testowane jako prawdziwe przeglądarki, tylko przez swoje silniki (Chromium, WebKit) na Linuksie. Różnice specyficzne dla markowych wydań zostają do akceptacji ręcznej.
- Typy w JSDoc są bardziej rozwlekłe niż w TypeScripcie. Akceptujemy to w zamian za zgodność z wymaganiem właściciela.
- Interfejs testowy wymagany przez specyfikację (zadany stan, przewidywalne losowanie, rejestr dźwięków) jest częścią pliku produkcyjnego, bo testy E2E działają na tym samym `index.html`, który dostaje gracz. Jego kontrakt opisują sekcje techniczne specyfikacji.
- Brak sekretów: projekt nie ma żadnej integracji, więc CI uruchamia komplet testów, łącznie z E2E.
