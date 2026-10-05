# ADR 0004: Ekran kineskopu, neonowy tytuł i nowy układ

- **Status:** przyjęta
- **Data:** 2026-10-05
- **Specyfikacja:** [Ekran kineskopu, neonowy tytuł i nowy układ](../../.ai/specs/2026-10-05-ekran-kineskopu-neonowy-tytul-i-nowy-uklad.md)
- **Uzupełnia:** [ADR 0001](0001-stos-technologiczny.md) i [ADR 0003](0003-podskakujaca-kulka-i-wyglad-retro.md). Stos produktu i narzędzi się nie zmienia; nie dochodzi żadna zależność, usługa ani krok budowania.

## Kontekst

Specyfikacja (S17–S21) zmienia wyłącznie wygląd: układ ekranu (S17), tytuł (S18), dekorację z kul (S19) i efekt ekranu (S20), przy zachowaniu działania gry (S21). Sposób wykonania efektów zostawia architektowi. Dla architektury liczą się następujące wymagania:

- Produkt zostaje jednym plikiem bez bibliotek i bez zasobów z sieci; plansza nie jest rysowana na `<canvas>`.
- Trzy etapy mogą powstać w dowolnej kolejności i każdy działa bez pozostałych.
- Testy muszą odczytać z DOM i stylów obliczonych: prostokąt liter tytułu, kolor wypełnienia, kolor i grubość obrysu, przesunięcie i kolor głębi, kolor i promień poświaty; każdą kulę kaskady z osobna (kolor, rozmiar, położenie, wypełnienie); promień krawędzi ekranu, siłę linii skanowania, promień poświaty napisów; położenie odblasku szkła.
- Napis „KULKI” występuje w tekście strony i w drzewie dostępności dokładnie raz. Kolejność napisów się nie zmienia.
- Efekt ekranu jest nieruchomy, nie przechwytuje kliknięć, pokrywa widoczne okno także wtedy, gdy strona się przewija, i nie zniekształca treści.
- Kaskada jest przy każdym otwarciu identyczna i nie zużywa losowań gry (kolejność losowań jest chronionym kontraktem).
- `window.__kulki` się nie zmienia. Istniejące testy przechodzą; zmienić wolno tylko oczekiwane brzmienie tytułu i asercje S14–S16 sprzeczne ze zmianami wymienionymi w specyfikacji.

Stan zastany, sprawdzony przy pisaniu tej decyzji:

- `#app` zawiera dziś pasek (`h1`, panel wyniku, panel najlepszego wyniku), pod nim wiersz (plansza, kolumna z podglądem i przyciskami). Okna są wstawiane pod tym wierszem, czyli pod planszą.
- Klasy CSS i zagnieżdżenie elementów nie są chronionym kontraktem; chronione są wartości `data-testid`, atrybuty stanu oraz brzmienie i kolejność napisów.
- Element `crt` leży w szablonie obok `#app`, jest pusty, ma `position: fixed; inset: 0` i tło z dwóch gradientów. Test integracyjny wymaga, żeby nie miał dzieci, a test S15 wymaga, żeby jego prostokąt był równy oknu.
- Poświatę napisów daje jedna reguła `text-shadow` na `body`, sterowana zmienną `--crt-glow-blur` (dziś 3 px). Siła linii jest zapisana jako kolor `rgb(0 0 0 / 0.12)`.
- Wypełnienie kulki to jedna reguła CSS wspólna dla kulek planszy i podglądu; kolor przychodzi przez zmienną `--ball` ustawianą atrybutem `data-color`.
- Brzmienie tytułu sprawdza osiem asercji w sześciu plikach testów (`s1-ekran-gry`, `s14-czcionka`, `s14-tablica-wynikow`, `s15-efekt-crt`, `start-screen`, `single-file`).
- Czcionka gry ma znaki szerokości 1 em, więc napis „KULKI” przy 48 px ma dokładnie 240 × 48 px.

## Decyzja

**1. Wszystko w CSS i DOM; bez obrazów, SVG, `<canvas>` i bez nowych narzędzi.** Układ, tytuł, kule i efekt ekranu to zwykłe elementy HTML ostylowane ręcznie pisanym CSS. Dzięki temu każdą wymaganą wartość test odczytuje ze stylu obliczonego albo z prostokąta elementu, a plik gry rośnie o pojedyncze kilobajty.

**2. Układ: siatka CSS z trzema obszarami.** `#app` jest siatką o dwóch kolumnach: w pierwszym wierszu blok tytułu (tytuł z kaskadą), w drugim plansza i kolumna boczna. Kolumna boczna ma stałą szerokość, zaczyna się na wysokości górnej krawędzi planszy i jest wyrównana do góry. Panele wyniku przenoszą się w DOM z paska do kolumny bocznej; kolejność napisów w DOM zostaje ta sama (tytuł, wynik, najlepszy wynik, podgląd, „Nowa gra”, dźwięk). Okna są wstawiane na końcu kolumny bocznej. Wysokość wiersza wyznacza plansza, a szerokość kolumny jest stała, więc pojawienie się okna nie przesuwa żadnego elementu. Kolumna boczna dostaje identyfikator `sidebar`.

Kolumna zaczyna się przy planszy, a nie przy tytule, bo kryterium S17 wymaga, żeby panel wyniku nie leżał wyżej niż tytuł: przy wspólnej górnej krawędzi wynik zależałby od ułamków piksela. Miejsce nad kolumną zostaje puste.

**3. Tytuł: jeden `h1`, obrys przez `-webkit-text-stroke`, głębia i poświata przez `text-shadow`.** Napis jest w DOM raz. Wypełnienie to `color`, obrys to `-webkit-text-stroke` z `paint-order: stroke fill` (obrys rysowany pod wypełnieniem, więc nie zwęża liter), głębia to warstwy `text-shadow` bez rozmycia przesunięte w dół i w prawo, poświata to warstwa `text-shadow` z rozmyciem. Wszystkie wartości są zmiennymi `--title-*` w `:root`, podanymi jako zwykłe kolory i długości (bez `color-mix`), żeby styl obliczony był czytelny we wszystkich trzech silnikach. Element `h1` ściśle obejmuje litery (`width: fit-content`, `line-height: 1`, bez dopełnienia i ramki), więc jego prostokąt jest prostokątem liter.

**4. Blok tytułu o stałych wymiarach, kule jako elementy DOM z danymi w stałej tablicy.** Tytuł i kaskada leżą w jednym bloku (`hero`) o stałej szerokości i wysokości, najwyżej 352 × 104 px. Taki blok mieści się zarówno w dotychczasowym pasku obok paneli wyniku, jak i nad planszą w nowym układzie, więc etap 2 nie zależy od etapu 1. Kule to elementy `cascade-ball` w kontenerze `cascade` z `aria-hidden="true"`. Ich kolor, rozmiar i położenie (w pikselach względem bloku) to zamrożona tablica w nowym module `src/ui/cascade.js`; moduł nie używa `rng` ani `Math.random`. Kula ma atrybut `data-color` i korzysta z tej samej reguły wypełnienia co kulki gry, więc identyczność wypełnienia wynika z konstrukcji, a nie z pilnowania dwóch kopii gradientu.

**5. Krawędź ekranu na istniejącym elemencie `crt`, odblask jako osobny element.** `crt` dostaje `border-radius` (zmienna `--crt-edge-radius`, w jednostkach `vmin`) i zewnętrzny `box-shadow` bez rozmycia o bardzo dużym rozszerzeniu w kolorze czarnym, który zamalowuje rogi okna poza zaokrągleniem. Krawędź ekranu to więc krawędź elementu `crt`; ponieważ ma `position: fixed`, pokrywa widoczne okno także przy przewijaniu. Odblask szkła to nowy pusty element `crt-glare` w szablonie, obok `crt` (nie w środku, bo `crt` ma pozostać pusty), także `position: fixed`, `pointer-events: none`, `aria-hidden="true"`.

**6. Siła efektu jako zmienne CSS.** Przezroczystość ciemnej linii skanowania to nowa zmienna liczbowa `--crt-scanline-alpha` (0,2–0,4), z której powstaje kolor linii. Promień poświaty napisów to istniejąca `--crt-glow-blur`, podniesiona do co najmniej 4 px. Promień poświaty tytułu to osobna zmienna `--title-glow-blur`, co najmniej 16 px, czyli z zapasem ponad dwukrotność poświaty napisów niezależnie od kolejności etapów.

**7. Brzmienie tytułu zmienia jeden krok.** `TEXTS.title` i napis zastępczy w szablonie zmieniają się na „KULKI” w tym samym PR co osiem asercji z listy powyżej. `<title>` strony zostaje „Kulki”. `AGENTS.md`, `CODE_REVIEW.md` i `BACKWARD_COMPATIBILITY.md` opisują ten wyjątek od zakazu zmiany asercji S1–S9 już w PR architektury.

## Rozważone alternatywy

| Alternatywa | Dlaczego przegrała |
|---|---|
| Tytuł i kule jako wbudowany SVG albo obraz `data:` | Napis w SVG trzeba by powielić w `h1` (albo ukryć jeden z nich), co łamie „dokładnie raz”; czcionka gry w obrazie SVG się nie wczyta; test nie odczyta koloru obrysu ani promienia poświaty ze stylu obliczonego; wypełnienie kul byłoby drugą kopią gradientu. |
| Obrys tytułu z ośmiu warstw `text-shadow` | Test nie odróżni warstw obrysu od warstw głębi; grubość obrysu nie jest jedną wartością. |
| Obrys i głębia przez powielone napisy albo pseudoelementy z `content` | Powielają napis w tekście strony albo w drzewie dostępności; napisy w `content` są w projekcie zabronione. |
| Prawdziwa wypukłość: filtr SVG (`feDisplacementMap`), `transform: perspective`, `backdrop-filter` | Zniekształca treść, co jest poza zakresem; psuje pomiar pól i trafianie w nie; filtr na całej stronie kosztuje przy każdej klatce podskakiwania. |
| Krawędź ekranu jako zaokrąglone `body` na czarnym `html` | Przy oknie mniejszym niż gra strona się przewija i zaokrąglone rogi odjeżdżają z widoku; specyfikacja wymaga, żeby efekt pokrywał widoczne okno. |
| Osobny element na krawędź ekranu | Trzeci nieruchomy element na całe okno bez korzyści: `crt` już jest ekranem, jego prostokąt jest równy oknu i jest objęty testami S15. |
| Odblask jako dziecko `crt` albo kolejny gradient w tle `crt` | Dziecko łamie istniejący test (`crt` jest pusty). Gradientu w tle test nie odnajdzie jako elementu ani nie zmierzy jego położenia. |
| Położenie kul w regułach CSS (`:nth-child`) | Liczby, kolorów i rozmiarów nie da się sprawdzić jednostkowo; dane dekoracji rozlane po arkuszu. |
| Kule rozmieszczane generatorem ze stałym ziarnem | Deterministyczne, ale wygląd trudno poprawiać ręcznie, a każde użycie generatora obok `rng` gry kusi, żeby je połączyć. Stała tablica jest prostsza. |
| Kolumna boczna od wysokości tytułu | Spełnia kryterium tylko przy równości krawędzi co do ułamka piksela; każda kula nad tytułem by je łamała. |
| Okna jako nakładka (`position: absolute` albo `<dialog>`) | Specyfikacja wymaga okien w kolumnie bocznej, które niczego nie zasłaniają; istniejące testy klikają planszę przy widocznym pytaniu. |

## Konsekwencje

- Nowe elementy kontraktu DOM: `sidebar`, `hero`, `cascade`, `cascade-ball`, `crt-glare`; nowe zmienne CSS `--title-*`, `--crt-edge-radius`, `--crt-scanline-alpha`. Po wdrożeniu są chronione ([BACKWARD_COMPATIBILITY.md](../../BACKWARD_COMPATIBILITY.md)).
- Dochodzi jeden moduł produktu (`src/ui/cascade.js`). `src/game/`, `src/storage/`, `src/audio/`, `src/test-api.js`, `tools/`, Compose, skrypty i workflow się nie zmieniają.
- `-webkit-text-stroke` i `paint-order` na tekście HTML działają w aktualnych Chrome, Firefox, Edge i Safari. W przeglądarce bez `paint-order` obrys zachodzi na litery do połowy swojej grubości; napis pozostaje czytelny.
- Zewnętrzny `box-shadow` elementu `crt` jest wyjątkiem od zasady „jedna warstwa cienia”: zasada dotyczy elementów interfejsu, a `crt` nim nie jest.
- Zmienna `--cell` musi odliczać wysokość bloku tytułu i margines bezpieczeństwa od krawędzi okna. Przy 1024×768 pole pozostaje bliskie 64 px.
- Blok tytułu ma stałe wymiary w pikselach, więc w oknie mniejszym niż wspierane nie skaluje się razem z planszą. To przypadek poza wsparciem; gra pozostaje używalna z przewijaniem.
- Etapy są niezależne, ale wszystkie zmieniają `src/styles.css`. Każdy pracuje we własnym bloku arkusza i na własnych zmiennych; miejsca wspólne wymienia plan implementacji w specyfikacji.
- Testy wyglądu potrzebują nowych pomocników (warstwy `text-shadow`, geometria zaokrąglonego ekranu). Trafiają do `tests/e2e/helpers/`, po jednym pliku na temat.
