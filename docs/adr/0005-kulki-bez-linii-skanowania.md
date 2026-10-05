# ADR 0005: Kulki bez linii skanowania

- **Status:** przyjęta
- **Data:** 2026-10-05
- **Specyfikacja:** [Kulki bez linii skanowania](../../.ai/specs/2026-10-05-kulki-bez-linii-skanowania.md)
- **Uzupełnia:** [ADR 0001](0001-stos-technologiczny.md) i [ADR 0004](0004-ekran-kineskopu-neonowy-tytul-i-nowy-uklad.md). Stos produktu i narzędzi się nie zmienia; nie dochodzi żadna zależność, usługa ani krok budowania.

## Kontekst

Specyfikacja (S22–S24) zdejmuje linie skanowania z kulek planszy i podglądu, także w ruchu, i zostawia resztę ekranu bez zmian. Sposób wykonania zostawia architektowi. Dla architektury liczą się następujące wymagania:

- Wolny od linii jest sam krążek kulki, także spłaszczony i uniesiony w podskoku; tło pola wokół kulki ma linie. Miejsce wolne od linii nie może się rozjechać z kulką przy animacji, przewinięciu strony ani zmianie rozmiaru okna.
- Z kulek znikają tylko linie. Przyciemnienie brzegów ekranu i odblask szkła nadal na nie padają.
- Kule kaskady, tło pól, siatka, panele, napisy i tytuł zachowują linie.
- Testy scenariuszy S1–S21 przechodzą bez zmiany asercji. `window.__kulki` się nie zmienia.
- Test sam wykonuje obraz odniesienia: wyłącza linie na czas zrzutu bez zmiany stanu gry.
- Nieruchomy ekran nie ma żadnej działającej animacji. Produkt zostaje jednym plikiem bez `<canvas>`, obrazów i SVG.

Stan zastany, sprawdzony przy pisaniu tej decyzji:

- Linie skanowania i przyciemnienie brzegów to dwa gradienty w tle jednego elementu `crt` (`position: fixed`, `z-index: 1000`), który leży nad całą grą. Odblask to element `crt-glare` nad nim.
- Istniejące testy czytają z elementu `crt`: gradient linii z przezroczystością równą `--crt-scanline-alpha` (S20), obecność `repeating-linear-gradient` i `radial-gradient` w tle (S15), promień krawędzi i prostokąt równy oknu (S15, S20). Test integracyjny wymaga, żeby `crt` był pusty, a `crt-glare` był jego następnym rodzeństwem.
- Kulka planszy to element `ball-{wiersz}-{kolumna}` z `position: absolute` w polu; podskok jest animacją `transform` na tym elemencie. Kulka podglądu to element `preview-ball` we flexie. Wypełnienie kulki jest w całości nieprzezroczyste.
- Przesuwanie, pojawianie się i zbijanie kulek to zmiany atrybutu `data-color` w odstępach czasu; nie ma dla nich animacji CSS.
- Sygnał odmowy ruchu potrząsa planszą animacją `transform` na elemencie planszy. Animowany `transform` tworzy na czas animacji kontekst stosu.
- Żaden inny przodek kulki nie tworzy kontekstu stosu: `#app`, plansza, pole, kolumna boczna i panel podglądu nie mają `z-index`, `transform`, `opacity`, `filter` ani `isolation`.

## Decyzja

**1. Kulki gry leżą nad warstwą linii, a pod warstwą przyciemnienia brzegów.** Efekt ekranu zostaje rozdzielony na warstwy ułożone przez `z-index` w głównym kontekście stosu strony:

| Kolejność | Element | Co rysuje |
|---|---|---|
| 1 (najniżej) | treść gry | tło, plansza, panele, napisy, tytuł, kule kaskady |
| 2 | `crt` | linie skanowania |
| 3 | kulki planszy i podglądu | krążki kulek |
| 4 | `crt-vignette` (nowy) | przyciemnienie brzegów, krawędź ekranu i czerń poza nią |
| 5 (najwyżej) | `crt-glare` | odblask szkła |

Kulka dostaje `z-index` wyższy niż `crt`, więc jest malowana nad liniami. Ponieważ `z-index` ma sam element kulki, miejsce wolne od linii jest zawsze dokładnie krążkiem kulki: podąża za podskokiem, spłaszczeniem, przewinięciem strony i zmianą rozmiaru okna bez żadnego kodu JavaScript. Kolejność warstw to zmienne `--z-scanlines`, `--z-ball`, `--z-vignette`, `--z-glare` w `:root`.

**2. Przyciemnienie brzegów przenosi się na nowy element `crt-vignette`.** Jest to pusty element w szablonie, dziecko `body`, `position: fixed`, `pointer-events: none`, `aria-hidden="true"`. Leży nad kulkami, więc przyciemnienie pada na nie jak dotąd. Ma ten sam `border-radius` i ten sam zewnętrzny `box-shadow` co `crt`, żeby kulka przy rogu okna nie wystawała poza krawędź ekranu. W szablonie stoi po `crt-glare`, bo istniejący test wymaga, żeby `crt-glare` był następnym rodzeństwem `crt`; o kolejności malowania decyduje `z-index`, nie kolejność w DOM.

**3. Element `crt` zachowuje wszystko, co czytają istniejące testy.** Zostają na nim: gradient linii, promień krawędzi, zewnętrzny cień i prostokąt równy oknu. W jego tle zostaje też `radial-gradient`, ale w pełni przezroczysty: test S15 wymaga obecności tego gradientu w tle `crt`, a specyfikacja nie pozwala zmienić asercji S1–S21. Gradient niczego nie rysuje i jest opisany komentarzem w arkuszu. Faktyczne przyciemnienie rysuje wyłącznie `crt-vignette`, kolorem z istniejącej zmiennej `--crt-vignette-color`.

**4. Potrząśnięcie planszą przy odmowie ruchu przestaje używać `transform`.** Animacja `reject-flash` przesuwa planszę właściwością `left` (plansza dostaje `position: relative`) o te same wartości i w tym samym czasie. Dzięki temu plansza nie tworzy kontekstu stosu i kulki zostają nad liniami przez cały sygnał odmowy. Wygląd i czas sygnału się nie zmieniają.

**5. Żaden przodek kulki gry nie tworzy kontekstu stosu.** To warunek działania punktu 1 i nowa reguła projektu: na `#app`, planszy, polu, kolumnie bocznej, panelu podglądu i ich przodkach nie ma `transform`, `opacity` poniżej 1, `filter`, `z-index`, `isolation`, `mix-blend-mode`, `will-change`, `contain` ani animacji tych właściwości. Pilnują jej testy na zrzucie ekranu, `AGENTS.md` i `CODE_REVIEW.md`.

**6. Obraz odniesienia powstaje przez zmienną `--crt-scanline-alpha`.** Test ustawia ją na `0` w stylu elementu `html`, robi zrzut i usuwa nadpisanie. Jest to możliwe, bo kolor linii pochodzi wyłącznie z tej zmiennej. Stan gry, DOM i `window.__kulki` pozostają nietknięte.

**7. Kule kaskady nie dostają `z-index`.** Reguła podnosząca kulki nad linie jest osobną regułą z selektorami kulek planszy i podglądu. Nie jest częścią wspólnej reguły wypełnienia, z której korzystają kule kaskady.

Rozwiązanie zostało sprawdzone próbą w Chromium, Firefoksie i WebKicie przy 1024×768 i 1920×1080: przed zmianą połowa pikseli wnętrza krążków różniła się od obrazu odniesienia, po zmianie żaden; otoczenie krążków zachowało linie; kulka zatrzymana w najwyższym i najniższym położeniu podskoku była bez linii; przyciemnienie brzegów nadal padało na kulkę w narożnym polu. Ta sama próba pokazała, że potrząśnięcie planszą przez `transform` przywraca linie na kulkach, a przez `left` nie.

## Rozważone alternatywy

| Alternatywa | Dlaczego przegrała |
|---|---|
| Maska na warstwie linii z otworami w miejscach kulek | Położenia kulek musiałby śledzić JavaScript w każdej klatce podskoku, przy przewijaniu i zmianie rozmiaru okna. To nowa działająca pętla, ryzyko rozjechania się otworu z kulką i koszt przy 81 kulkach. |
| Linie rysowane na `<canvas>` z pominięciem kulek | `<canvas>` w produkcie jest zabroniony; test nie odczyta siły linii ze stylu obliczonego. |
| Rozjaśnienie kulki, które znosi przyciemnienie linii | Jasne piksele (biały odblask kulki) nie dają się rozjaśnić powyżej bieli, więc paski zostają widoczne. |
| Linie rysowane osobno na tle pól, paneli i strony zamiast jednej warstwy | Linie musiałyby leżeć także na napisach, siatce, tytule i kulach kaskady; każda taka powierzchnia potrzebowałaby własnej warstwy wyrównanej do okna co do piksela. |
| Kulka nad całym efektem ekranu (bez nowej warstwy) | Zdejmuje z kulek także przyciemnienie brzegów i odblask, co jest poza zakresem. Test na zrzucie ekranu by tego nie wykrył, bo obraz odniesienia miałby tę samą wadę. |
| Przyciemnienie brzegów rysowane na każdej kulce z osobna (`background-attachment: fixed`) | Tło przytwierdzone do okna przestaje działać na elemencie z `transform`, czyli na kulce podskakującej. |
| Linie na nowym elemencie pod kulkami, a `crt` jako warstwa górna | Test S20 czyta siłę linii z tła `crt`; linie musiałyby zostać w tle `crt` jako atrapa albo trzeba by zmienić asercję. Zostawienie linii na `crt` wymaga atrapy tylko dla jednego słowa w jednej asercji S15. |
| Zmiana asercji S15 o `radial-gradient` zamiast przezroczystego gradientu | Kryterium S24 wymaga, żeby testy S1–S21 przechodziły bez zmiany asercji. |
| Potrząśnięcie planszą zostaje na `transform`, a plansza dostaje na ten czas `z-index` nad liniami | Na pół sekundy linie znikałyby z całej planszy: widoczne mignięcie tła pól i siatki. |

## Konsekwencje

- Nowy element kontraktu DOM: `crt-vignette`. Nowe zmienne CSS: `--z-scanlines`, `--z-ball`, `--z-vignette`, `--z-glare`. Po wdrożeniu są chronione ([BACKWARD_COMPATIBILITY.md](../../BACKWARD_COMPATIBILITY.md)), tak jak to, że kolor linii pochodzi wyłącznie z `--crt-scanline-alpha`.
- Zmieniają się tylko `src/index.html` i `src/styles.css`. `src/ui/`, `src/game/`, `src/storage/`, `src/audio/`, `src/test-api.js`, `tools/`, Compose, skrypty i workflow pozostają bez zmian.
- W tle `crt` zostaje przezroczysty `radial-gradient`, który istnieje wyłącznie dla asercji S15. Gdy właściciel pozwoli zmienić tę asercję, gradient można usunąć bez innych zmian.
- Zakaz kontekstu stosu na przodkach kulki ogranicza przyszłe efekty: animacji całej planszy albo pola nie wolno robić przez `transform`, `opacity` ani `filter`. Efekty na samej kulce (jak podskok) są dozwolone.
- Część wyróżnienia zaznaczonej kulki przy ograniczonym ruchu (obrys pola) leży pod liniami, co specyfikacja dopuszcza.
- Kulki są malowane nad wszystkim, co leży w treści gry. Dziś nic na nie nie zachodzi (okna są w kolumnie bocznej, poświata tytułu nie sięga planszy). Element, który miałby zasłonić kulkę, musi dostać `z-index` powyżej `--z-ball`.
- Podniesienie kulek nie tworzy nowych warstw kompozytora i nie dodaje animacji; czas reakcji na kliknięcie przy 80 kulkach sprawdza test S24.
- Testy potrzebują nowego pomocnika do porównywania zrzutu z obrazem odniesienia (`tests/e2e/helpers/scanlines.js`).
