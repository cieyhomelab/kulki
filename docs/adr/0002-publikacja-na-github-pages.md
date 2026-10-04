# ADR 0002: Publikacja gry na GitHub Pages

- **Status:** przyjęta
- **Data:** 2026-10-04
- **Specyfikacja:** [Publikacja gry na GitHub Pages](../../.ai/specs/2026-10-04-publikacja-na-github-pages.md)
- **Uzupełnia:** [ADR 0001](0001-stos-technologiczny.md). Stos produktu i narzędzi się nie zmienia.

## Kontekst

Gra ma być dostępna pod `https://cieyhomelab.github.io/kulki/`. Hosting (GitHub Pages) jest wymaganiem właściciela, więc do rozstrzygnięcia zostaje sposób publikowania i sprawdzania. Liczą się następujące wymagania specyfikacji:

- Pod adresem jest wyłącznie plik gry. Repozytorium jest prywatne, a dziś Pages publikuje całą gałąź `main` (tryb `legacy`), więc dokumenty są publiczne.
- Publikacja następuje automatycznie po zmianie w `main` i tylko po przejściu całej bramki walidacji; ręczne ponowienie przechodzi tę samą ścieżkę.
- Publikacje nie działają równolegle, a starsza wersja nigdy nie trafia pod adres po nowszej.
- Opublikowany plik jest co do bajta tym plikiem, który przeszedł testy, i zawiera identyfikator commita odczytywalny bez uruchamiania gry.
- Po publikacji automatyczny test sprawdza grę pod adresem, z ponawianiem do 15 minut.
- Historia publikacji jest jedną listą w repozytorium na GitHubie, odczytywalną przez API, z wersją, czasem i wynikiem `udana`, `nieudana` albo `pominięta`.

Stan zastany, sprawdzony przy pisaniu tej decyzji:

- CI (`.github/workflows/ci.yml`) działa dla PR i dla `main` i woła wyłącznie skrypty ze `scripts/`.
- Budowanie **nie jest dziś powtarzalne między środowiskami**: plik zbudowany przez `scripts/build.sh` zawiera dyrektywę `"use strict";`, a plik zbudowany w obrazie Dockera (ten, na którym działają testy E2E) jej nie zawiera. Przyczyna: esbuild czyta `tsconfig.json` (`strict: true`), a `Dockerfile` tego pliku nie kopiuje. Testy E2E i artefakt CI dotyczą więc dziś dwóch różnych plików.

## Decyzja

**1. Publikacja przez GitHub Actions i artefakt Pages.** Źródło Pages zostaje przełączone z „gałąź `main`” na „GitHub Actions”. Workflow przekazuje hostingowi paczkę z jednym plikiem `index.html` oficjalnymi akcjami `actions/upload-pages-artifact` i `actions/deploy-pages`, w zadaniu przypisanym do środowiska `github-pages`. Żaden plik repozytorium poza grą nie ma jak trafić pod adres, bo paczka powstaje z jednego pliku, a nie z gałęzi.

**2. Dwa workflow i wspólne testy.**

| Plik | Wyzwalacz | Co robi |
|---|---|---|
| `.github/workflows/tests.yml` | `workflow_call` | bramka walidacji: pięć skryptów ze `scripts/`; wystawia artefakt `index-html` i jego sumę SHA-256 |
| `.github/workflows/ci.yml` | `pull_request` | woła `tests.yml`; nie ma uprawnień do Pages |
| `.github/workflows/publish.yml` (nazwa „Publikacja”) | `push` do `main`, `workflow_dispatch` | woła `tests.yml`, potem bramka wersji, umieszczenie, sprawdzenie po publikacji i wynik |

**3. Kolejność i brak równoległości.** `publish.yml` ma na poziomie całego workflow `concurrency` ze stałą grupą i `cancel-in-progress: false`: naraz działa jedna publikacja, a z oczekujących zostaje tylko najnowsza. Przed umieszczeniem zadanie `gate` sprawdza, że przebieg dotyczy gałęzi `main` i że jego commit jest nadal jej czubkiem. Zabezpiecza to przypadki, których sama kolejka nie obejmuje: ponowne uruchomienie starego przebiegu i ręczne uruchomienie dla innej gałęzi.

**4. Jeden plik od testów do graczy.** Plik buduje się raz w zadaniu `checks` z `KULKI_VERSION` równym identyfikatorowi commita i ten artefakt jest publikowany. Budowanie staje się powtarzalne (nie zależy od obecności `tsconfig.json`), a zgodność pilnuje jedna asercja: suma SHA-256 odpowiedzi serwera musi być równa sumie artefaktu. Ta sama asercja działa przed publikacją na stosie Compose (dowód, że testy E2E dotyczyły publikowanego pliku) i po publikacji pod adresem gry.

**5. Identyfikator wersji** to znacznik `<meta name="kulki-version" content="…">` w `<head>`, wstawiany przy budowaniu ze zmiennej `KULKI_VERSION`; bez niej wartość to `dev`.

**6. Sprawdzenie po publikacji to projekt `postdeploy` w istniejącej konfiguracji Playwrighta** (`tests/postdeploy/`, jedna przeglądarka: Chromium), uruchamiany przez `scripts/test-e2e.sh`. GitHub Pages jest integracją zewnętrzną, więc ma tryb atrapy: bez zmiennej `POSTDEPLOY_URL` projekt sprawdza usługę `web` z tymczasowego stosu Compose, a ze zmienną sprawdza prawdziwy adres. W trybie atrapy projekt jest częścią zwykłej bramki, więc testy sprawdzenia po publikacji są weryfikowane w każdym PR, zanim kiedykolwiek pobiegną na żywym adresie. Kryteria, których nginx nie umie odtworzyć (przekierowanie z HTTP na HTTPS), są pomijane warunkiem środowiskowym.

**7. Historia publikacji to lista przebiegów workflow „Publikacja”** (zakładka Actions, API `GET /repos/{owner}/{repo}/actions/workflows/publish.yml/runs`). Wersja to `head_sha` przebiegu, czas to `run_started_at`. Wynik wyznacza jedna reguła, zaimplementowana jako czysta funkcja z testem jednostkowym i wypisywana przez ostatnie zadanie w podsumowaniu przebiegu:

| Wynik | Kiedy |
|---|---|
| `udana` | zadania `deploy` i `verify` zakończone powodzeniem |
| `nieudana` | zadanie `deploy` się rozpoczęło i `deploy` albo `verify` nie zakończyło się powodzeniem |
| `pominięta` | zadanie `deploy` się nie rozpoczęło: testy nie przeszły, bramka wersji odmówiła albo przebieg został anulowany przez nowszy |

**8. Testy konfiguracji** czytają pliki workflow parserem `yaml` (nowa zależność deweloperska) w testach jednostkowych Vitest (`tests/unit/workflows/`).

**9. Bez sekretów.** Publikacja używa wyłącznie automatycznego `GITHUB_TOKEN` z uprawnieniami `pages: write` i `id-token: write` nadanymi tylko zadaniu `deploy`.

## Rozważone alternatywy

**Gałąź `gh-pages` z samym `index.html`.** Dobrze znana i nie wymaga środowiska `github-pages`. Przegrała, bo wymaga zapisu do repozytorium z workflow (`contents: write`), tworzy drugą gałąź z historią plików binarnie identycznych z artefaktem i zostawia tryb `legacy`, w którym Pages przepuszcza pliki przez Jekylla. Publikacja artefaktem daje te same gwarancje bez żadnego z tych kosztów.

**Katalog `/docs` w `main` jako źródło Pages.** Przegrał, bo wymagałby commitowania zbudowanego pliku (zakazane przez ADR 0001) i publikowałby też `docs/adr/`.

**Jeden workflow dla PR i publikacji.** Mniej plików. Przegrał, bo lista przebiegów mieszałaby testy PR z publikacjami, a historia publikacji ma być jedną listą. Uprawnienia do Pages byłyby też zadeklarowane w pliku, który uruchamia się dla PR.

**Publikacja wyzwalana zdarzeniem `workflow_run` po zakończeniu CI.** Dawałaby proste odwzorowanie wyniku przebiegu na wynik publikacji (testy czerwone to przebieg „skipped”). Przegrała, bo taki przebieg ma `head_sha` równy czubkowi gałęzi domyślnej z chwili wyzwolenia, a nie commitowi, który przeszedł testy, więc wpis w historii mógłby wskazywać złą wersję; ręczne ponowienie wymagałoby osobnej ścieżki testów.

**Historia w GitHub Deployments (własne wpisy przez API) albo w statusach commitów.** Wynik byłby jednym polem. Przegrały, bo środowisko `github-pages` i tak tworzy własne wpisy tylko dla przebiegów, które doszły do umieszczenia, więc powstałyby dwie listy; GitHub sam oznacza starsze wdrożenia jako nieaktywne, co mieszałoby się z wynikiem `pominięta`; a przebieg anulowany w kolejce nie wykonuje żadnego zadania, więc nie mógłby zapisać swojego wpisu. Lista przebiegów ma wpis dla każdej publikacji bez dodatkowego kodu.

**Osobny skrypt i osobna konfiguracja Playwrighta dla sprawdzenia po publikacji, uruchamiane tylko na żywym adresie.** Przegrały, bo testów nie dałoby się uruchomić przed scaleniem: pierwszy prawdziwy przebieg byłby jednocześnie pierwszym testem testów. Projekt w istniejącej konfiguracji nie dodaje skryptu, obrazu ani kontraktu.

**Sprawdzenie po publikacji przez `curl` w kroku workflow.** Wystarczyłoby dla kodów odpowiedzi i sumy pliku. Przegrało, bo kryteria P1 wymagają przeglądarki (ruch kulki, brak błędów w konsoli, brak dodatkowych żądań, odświeżenie), a Playwright ma też klienta HTTP, więc jedno narzędzie pokrywa wszystko.

**Testy E2E na pliku z artefaktu zamiast powtarzalnego budowania.** Obraz dostawałby gotowy `dist/index.html`. Przegrały, bo `docker compose up --build` i `scripts/test-e2e.sh` przestałyby działać na czystym klonie bez wcześniejszego budowania. Powtarzalne budowanie plus porównanie sum daje tę samą gwarancję i zachowuje kontrakt skryptów.

**`actionlint` albo własne wyrażenia regularne zamiast parsera YAML.** `actionlint` sprawdza poprawność workflow, a nie reguły tego projektu; wyrażenia regularne na YAML-u są kruche. Pakiet `yaml` jest dojrzały i bez zależności.

## Konsekwencje

- **Jednorazowa czynność właściciela:** Settings → Pages → Source: „GitHub Actions”. Bez niej zadanie `deploy` kończy się błędem. Najlepiej wykonać ją przed scaleniem PR z etapem 1; do pierwszej udanej publikacji pod adresem zostaje wtedy ostatnia strona z README.
- Publiczna strona z prywatnego repozytorium zależy od planu konta GitHub (założenie 13 specyfikacji). Dziś działa.
- Testy dla `main` uruchamia `publish.yml`, a nie `ci.yml`. Czerwone testy na `main` dają czerwony przebieg „Publikacja” z wynikiem `pominięta`.
- Wynik `nieudana` i `pominięta` po testach różnią się w liście przebiegów tylko po otwarciu przebiegu (podsumowanie) albo po odczycie zadań przez API. Identyfikatory zadań `deploy` i `verify` stają się kontraktem.
- Sprawdzenie po publikacji może trwać do 15 minut i w tym czasie blokuje kolejną publikację. Przy częstych zmianach w `main` część wersji dostanie wynik `pominięta`; pod adresem zawsze kończy najnowsza.
- Zmienia się bajtowa postać budowanego pliku w obrazie Dockera (dochodzi `"use strict";`, które lokalny i CI-owy plik już mają). Od tej chwili każda różnica między plikiem testowanym a publikowanym zatrzymuje publikację.
- Identyfikator commita prywatnego repozytorium jest publicznie odczytywalny z kodu strony (założenie 6 specyfikacji).
- Testy E2E w trybie na żywo potrzebują wyjścia do internetu z kontenera `e2e`; w trybie atrapy nadal nie potrzebują sieci.
- Projekt nadal nie ma sekretów.
