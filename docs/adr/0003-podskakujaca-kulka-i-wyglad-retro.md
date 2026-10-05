# ADR 0003: Podskakująca kulka i wygląd retro arcade

- **Status:** przyjęta
- **Data:** 2026-10-05
- **Specyfikacja:** [Podskakująca kulka i wygląd retro arcade](../../.ai/specs/2026-10-05-podskakujaca-kulka-i-wyglad-retro.md)
- **Uzupełnia:** [ADR 0001](0001-stos-technologiczny.md). Stos produktu i narzędzi się nie zmienia; nie dochodzi żadna zależność.

## Kontekst

Specyfikacja dodaje do gry dwie rzeczy: podskakiwanie zaznaczonej kulki (S10–S13) i wygląd automatu arcade z ekranem CRT (S14, S15), przy zachowaniu wszystkiego, co działa dziś (S16). Dla architektury liczą się następujące wymagania:

- Produkt zostaje jednym plikiem `index.html` bez bibliotek i bez zasobów z sieci. Czcionka gry musi więc być częścią tego pliku.
- Wzorem czcionki jest Press Start 2P. Musi mieć 18 polskich znaków diakrytycznych i licencję pozwalającą wbudować ją w publiczną grę.
- Testy muszą odczytać: czy kulka na polu podskakuje, liczbę ukończonych cykli, ustawiony czas cyklu, widoczne położenie i rozmiar kulki oraz obszar efektu CRT. Dotychczasowy kontrakt testowy nie może zmienić znaczenia; nowe informacje są tylko dodawane.
- Istniejące testy S1–S9 przechodzą bez zmiany asercji. Dwa z nich porównują cały wynik `window.__kulki.getState()` z oczekiwanym obiektem (`tests/e2e/test-api.spec.js`, `tests/e2e/s8-wznowienie-gry.spec.js`), a test S1 klika pola planszy przy widocznym pytaniu o potwierdzenie.
- Podskakiwanie nie blokuje kliknięć, zatrzymuje się natychmiast i nie działa przy ograniczonym ruchu, także gdy gracz zmieni to ustawienie w trakcie gry.
- Wybór narzędzia do projektowania i sposobu wykonania wyglądu specyfikacja zostawia architektowi.

Stan zastany, sprawdzony przy pisaniu tej decyzji:

- Kulka na planszy jest dziś pseudoelementem `::after` pola. Położenia i rozmiaru pseudoelementu nie da się odczytać z testu (`getBoundingClientRect` go nie obejmuje).
- `tools/build.js` wkleja `src/styles.css` do pliku gry bez żadnego przetwarzania; test integracyjny dopuszcza w CSS tylko adresy `data:`.
- Plik `PressStart2P-Regular.ttf` z repozytorium `google/fonts` (118 204 bajty, SHA-256 `034c77f1f05ec89421e4a63f0e3a4ca1ecf852cc6d2bf611f126f275728e017d`) ma 658 glifów. Tablica `cmap` zawiera wszystkie 18 polskich znaków diakrytycznych i każdy znak z `src/ui/texts.js`; każdy z tych glifów ma szerokość dokładnie 1 em (1000 jednostek przy 1000 jednostkach na em).
- Licencja czcionki to SIL Open Font License 1.1 z zastrzeżoną nazwą „Press Start 2P”. Pozwala bezpłatnie wbudowywać i rozpowszechniać czcionkę, wymaga dołączenia informacji o prawach autorskich i treści licencji do kopii czcionki, a wersji zmienionej nie wolno nazywać zastrzeżoną nazwą.

## Decyzja

**1. Czcionka: Press Start 2P, cały oryginalny plik TTF, bez zmian.** Wzorcowa czcionka spełnia oba warunki specyfikacji (polskie znaki, licencja), więc zamiennik nie jest potrzebny. Plik leży w `src/fonts/PressStart2P-Regular.ttf`, obok niego treść licencji `src/fonts/OFL.txt`. Test jednostkowy pilnuje sumy SHA-256 pliku i obecności licencji. Czcionki nie przycinamy do używanych znaków i nie przepakowujemy do innego formatu: plik niezmieniony co do bajta jest oryginałem w rozumieniu licencji, więc może zachować zastrzeżoną nazwę i nie wymaga żadnej interpretacji prawnej.

**2. Wbudowanie przy budowaniu jako `data:` w `@font-face`.** `src/styles.css` odwołuje się do czcionki adresem względnym (`url('./fonts/PressStart2P-Regular.ttf')`), a nowa czysta funkcja w `tools/` zamienia przy budowaniu każdy taki adres na `data:font/ttf;base64,…`. Adres względny bez pliku w `src/fonts/` przerywa budowanie błędem. Budowanie pozostaje powtarzalne: wynik zależy tylko od plików w `src/` i `tools/`. Plik gry rośnie o około 158 kB.

**3. Wygląd w czystym, ręcznie pisanym CSS.** Bez narzędzi do generowania interfejsu, bez frameworków i preprocesorów. Paleta, rozmiary czcionki i wymiary cieni są zmiennymi CSS w `:root`. Jeden ciemny motyw (`color-scheme: dark`), bez `prefers-color-scheme`. Tło pod każdym napisem jest jednolitym kolorem, żeby kontrast dało się policzyć.

**4. Podskakiwanie to animacja CSS włączana atrybutem ustawianym przez JavaScript.** Kulka na planszy staje się prawdziwym elementem DOM wewnątrz pola. Interfejs ustawia na polu `data-bouncing="true"` wtedy i tylko wtedy, gdy pole jest zaznaczone i ruch nie jest ograniczony; animacja `@keyframes` (wyłącznie `transform`, nieskończona, jedna iteracja to pełny cykl góra–dół) działa tylko pod tym atrybutem. Usunięcie atrybutu zatrzymuje ją natychmiast, bo kulka nie ma żadnego `transition`. Czas cyklu jest jedną stałą w `src/ui/timing.js`, przekazywaną do CSS jako zmienna.

**5. Ograniczony ruch rozstrzyga JavaScript, nie CSS.** Nowy mały moduł w `src/ui/` czyta `matchMedia('(prefers-reduced-motion: reduce)')` i nasłuchuje zmian. Dzięki temu stan czytany przez testy („podskakuje”) i to, co widać, mają jedno źródło prawdy, a zmiana ustawienia w trakcie gry działa od razu. Przy ograniczonym ruchu zaznaczone pole dostaje nieruchomy `outline`.

**6. Nowe informacje dla testów wyłącznie w DOM.** Dochodzą atrybuty `data-bouncing` (pole) i `data-bounce-cycles` (plansza, licznik zdarzeń `animationiteration`) oraz nowe wartości `data-testid`. `window.__kulki` się nie zmienia: ani metody, ani pola `getState()`.

**7. Efekt CRT to jeden pusty element nad całą stroną.** `<div data-testid="crt" aria-hidden="true">` w szablonie `src/index.html`, poza `#app`: `position: fixed`, cały obszar okna, `pointer-events: none`, linie skanowania i przyciemnione rogi jako nieruchome gradienty CSS. Poświata napisów to `text-shadow`. Żadnej animacji.

**8. Okna pytania i końca gry zostają w układzie strony.** Nie stają się nakładką na planszę. Układ rezerwuje na nie miejsce tak, żeby całość mieściła się w 1024×768.

Szczegóły kontraktów: sekcje techniczne specyfikacji.

## Rozważone alternatywy

**Narzędzia do projektowania (v0.dev, Claude Artifacts, Pen.dev).** Generują komponenty React z Tailwindem albo własny format projektu. Produkt nie ma frameworka ani kroku przetwarzania CSS, więc wynik trzeba by przepisać ręcznie, a kryteria S14 i S15 są na tyle konkretne (narożniki, cień bez rozmycia, kontrast, czcionka), że sprawdzają je testy, nie makieta. Przegrały z zasadą „mało ruchomych części”. Ocena „wygląda jak automat arcade” i tak jest ręczna i należy do właściciela.

**Przycięcie czcionki do używanych znaków.** Dałoby kilka kilobajtów zamiast 158. Przegrało, bo przycięty plik jest wersją zmienioną i nie może nosić zastrzeżonej nazwy; trzeba by zmieniać nazwę w tablicach czcionki i dodać narzędzie do przycinania. Każdy nowy napis w grze wymagałby też pamiętania o ponownym przycięciu. 158 kB w pliku otwieranym z dysku albo z hostingu z kompresją jest nieodczuwalne.

**WOFF2 zamiast TTF.** Mniejszy plik (kompresja). Przegrał, bo wymaga nowej zależności deweloperskiej albo binarnego pliku wytworzonego poza repozytorium, którego zgodności z oryginałem nie da się sprawdzić sumą kontrolną z upstreamu. TTF w `data:` obsługują wszystkie wymagane przeglądarki, także z `file://`.

**Pakiet npm z czcionką (np. `@fontsource/press-start-2p`).** Wersja przypięta w `package-lock.json`, ale pakiet dostarcza pliki pocięte na podzbiory znaków, czyli wersje zmienione, i wymagałby kilku reguł `@font-face` z `unicode-range`. Jeden plik w repozytorium jest prostszy i nie zależy od rejestru npm.

**Inna czcionka pikselowa.** Specyfikacja dopuszcza ją tylko, gdy wzorcowa nie spełnia wymagań. Spełnia.

**Wbudowanie zasobów przez esbuild (`loader: dataurl`).** esbuild potrafi wkleić plik do CSS, ale wtedy przepisuje cały arkusz (zmienia formatowanie i obniża składnię do celu budowania). Dziś CSS trafia do produktu dokładnie taki, jak w `src/`; funkcja zamieniająca sam adres na `data:` zachowuje tę własność.

**Podskakiwanie sterowane z JavaScriptu (`requestAnimationFrame` albo Web Animations API).** Daje pełną kontrolę nad licznikiem cykli. Przegrało, bo pozostałe animacje gry są w CSS, animacja `transform` w CSS działa poza głównym wątkiem, a licznik cykli daje zdarzenie `animationiteration`, które przeglądarka wysyła tylko wtedy, gdy animacja naprawdę działa. Stan „podskakuje” nie może więc rozminąć się z ekranem.

**Wyłączenie podskakiwania samą regułą `@media (prefers-reduced-motion)`.** Krótsze, ale wtedy atrybut stanu mówiłby „podskakuje” przy nieruchomej kulce, czego specyfikacja zabrania wprost.

**Pozostawienie kulki jako pseudoelementu.** Bez zmian w DOM, ale test nie odczyta jej położenia ani rozmiaru, a zdarzenia animacji pseudoelementu nie wskazują, o który element chodzi. Przegrało z wymaganiem testowalności.

**Nowe pola w `getState()` albo nowa metoda `window.__kulki`.** Dodawanie jest formalnie bezpieczne, ale dwa istniejące testy E2E porównują cały obiekt stanu, więc nowe pole wymusiłoby zmianę ich asercji, czego zabrania S16. Atrybuty DOM niczego nie psują.

**Okna dialogowe jako nakładka na planszę.** Bardziej „automatowe”, ale istniejący test S1 klika pola przy widocznym pytaniu; zasłonięte pole nie da się kliknąć i test musiałby się zmienić.

**Efekt CRT filtrem SVG albo `<canvas>`.** Pozwalałby na zakrzywienie obrazu i szum, które są poza zakresem. Gradienty CSS dają linie i winietę bez dodatkowych elementów i bez kosztu przerysowania.

## Konsekwencje

- Plik gry ma około 190 kB zamiast około 30 kB. Sprawdzenia po publikacji porównują sumę SHA-256 i znacznik wersji, więc nie wymagają zmian.
- W `src/` pojawia się pierwszy plik binarny. `src/fonts/` to jedyne miejsce na zasoby wklejane do produktu; pliku czcionki nie wolno zmieniać, przycinać ani zastępować bez nowego ADR, a `OFL.txt` musi pozostać obok niego.
- Czcionka ma stałą szerokość 1 em na znak. Szerokość napisu to liczba znaków razy rozmiar czcionki, więc układ da się policzyć z góry, a test „czcionka gry, a nie zastępcza” może mierzyć szerokość znaku: w czcionce gry wynosi dokładnie rozmiar czcionki, w zastępczej nie.
- Kontrakt DOM rośnie o nowe identyfikatory i atrybuty (lista w sekcjach technicznych specyfikacji i w `BACKWARD_COMPATIBILITY.md`). `window.__kulki` zostaje bez zmian.
- Testy, które mierzą układ albo czcionkę, muszą najpierw poczekać na `document.fonts.ready`. `data-ready` nie czeka na czcionkę: gra ma działać także wtedy, gdy czcionka się nie wczyta.
- W jsdom nie ma animacji CSS ani `matchMedia`, więc testy integracyjne sprawdzają tylko atrybuty stanu; ruch, licznik cykli i ograniczony ruch sprawdza E2E. Moduł preferencji ruchu musi działać bez `matchMedia`.
- Poświaty ramek nie wolno robić dodatkową warstwą `box-shadow` na elementach, których twardy cień sprawdzają testy; służy do tego pseudoelement albo `filter: drop-shadow`.
- Kryteria wyglądu oznaczone `[ręcznie]` (podobieństwo do Lines 98, spójność automatu, czytelność przez efekt CRT) zostają do akceptacji właściciela.
