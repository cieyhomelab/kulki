# Kulki bez linii skanowania

## TLDR

Po wdrożeniu ekranu kineskopu (S20) ciemne linie skanowania leżą także na kulkach i ich kolory stały się nieczytelne. Ta zmiana zdejmuje linie skanowania z kulek na planszy i w podglądzie „Następne kulki”: krążek kulki jest rysowany bez pasków, także wtedy, gdy kulka podskakuje albo się przesuwa. Reszta ekranu (tło pól, siatka, panele, napisy, tytuł, kule kaskady) zachowuje efekt bez zmian. Zmiana jest dla gracza, który musi szybko rozróżniać 7 kolorów kulek.

## Problem i cel

Efekt ekranu z S20 przyciemnia co drugą parę wierszy pikseli o 30%. Na jednolitym tle daje to zamierzony wygląd starego monitora, ale na kulkach miesza kolor bazowy z czernią w paski: kolory wyglądają na brudne i trudniej je odróżnić. Kryterium S20 oceniane ręcznie („efekt nie utrudnia rozróżniania 7 kolorów kulek”) nie jest dziś spełnione.

Ten dokument rozszerza specyfikację ekranu kineskopu ([2026-10-05-ekran-kineskopu-neonowy-tytul-i-nowy-uklad.md](2026-10-05-ekran-kineskopu-neonowy-tytul-i-nowy-uklad.md)) oraz wcześniejsze specyfikacje gry i wyglądu retro. Wszystko, czego tu nie zmieniono wprost, obowiązuje dalej. Scenariusze mają numery S22–S24.

Sukces poznamy po tym, że:

- na krążkach kulek planszy i podglądu nie ma linii skanowania (S22, S23), co potwierdza automatyczny test na zrzucie ekranu,
- właściciel, patrząc na grę, bez trudu rozróżnia 7 kolorów kulek,
- reszta ekranu i gra działają jak dotąd (S24).

## Użytkownicy i role

Bez zmian: jedna rola, **gracz**. Nie dochodzi żadne ustawienie ani uprawnienie; gracz nie może włączyć ani wyłączyć tej zmiany.

## Pojęcia

- **Linie skanowania:** poziome ciemne paski efektu ekranu z S20. Ciemna linia przyciemnia obraz pod sobą o 20–40%.
- **Przyciemnienie brzegów** i **odblask szkła:** pozostałe dwie warstwy efektu ekranu z S20. Ta zmiana ich nie dotyczy.
- **Kulka gry:** kulka na polu planszy albo kulka w podglądzie „Następne kulki”. Kule kaskady przy tytule nie są kulkami gry.
- **Krążek kulki:** kształt, który kulka gry zajmuje na ekranie w danej chwili: koło, a przy spłaszczeniu w dolnym położeniu podskoku elipsa.
- **Wnętrze krążka:** krążek kulki pomniejszony o pas szerokości 2 pikseli przy jego krawędzi.
- **Otoczenie krążka:** punkty tego samego pola planszy albo panelu podglądu, które leżą co najmniej 2 piksele poza krążkiem każdej kulki gry.
- **Obraz odniesienia:** zrzut ekranu tego samego stanu gry, w tym samym oknie i w tej samej przeglądarce, wykonany przez test przy wyłączonych liniach skanowania. Przyciemnienie brzegów i odblask szkła są na nim obecne.
- **Piksel:** piksel zrzutu ekranu wykonanego w skali 1 (jeden piksel zrzutu na jeden piksel strony).
- **Zgodność koloru:** dwa piksele mają zgodny kolor, gdy każda składowa (czerwona, zielona, niebieska) różni się o nie więcej niż 3 w skali 0–255.
- **Piksel przyciemniony linią:** piksel, którego suma trzech składowych jest na zrzucie ekranu mniejsza niż w tym samym pikselu obrazu odniesienia o co najmniej 10%. Sama siła linii (20–40%) pozostaje wymaganiem S20 i tej miary nie dotyczy.
- **Wiersz linii:** wiersz pikseli zrzutu, w którym leży ciemna linia skanowania. Test rozpoznaje go po tym, że piksel tła pustego pola w tym wierszu jest przyciemniony linią. Pozostałe wiersze to **wiersze przerwy**.
- **Kulka bez linii:** każdy piksel wnętrza krążka ma kolor zgodny z tym samym pikselem obrazu odniesienia.
- **Tło z liniami:** w danym obszarze każdy piksel leżący w wierszu linii jest przyciemniony linią, a każdy piksel leżący w wierszu przerwy ma kolor zgodny z obrazem odniesienia.

## Scenariusze

### S22: Kulki stojące nie mają linii skanowania

1. Gracz otwiera grę. Na planszy są kulki, w podglądzie widać trzy następne.
2. Na każdej kulce planszy i podglądu kolor jest czysty: nie przecinają jej ciemne paski.
3. Tło pola wokół kulki, siatka planszy, panele, napisy, tytuł i kule kaskady mają linie skanowania jak dotąd.

Z kulek znikają wyłącznie linie skanowania. Przyciemnienie brzegów ekranu i odblask szkła nadal mogą padać na kulki, które leżą w ich zasięgu.

**Kryteria akceptacji**

- Zakładając planszę z kulkami wszystkich 7 kolorów ustawioną przez interfejs testowy oraz okna 1024×768 i 1920×1080, gdy test porówna zrzut ekranu z obrazem odniesienia, wtedy każda kulka planszy jest bez linii.
- Zakładając podgląd z trzema kulkami ustawiony przez interfejs testowy oraz okna 1024×768 i 1920×1080, gdy test porówna zrzut ekranu z obrazem odniesienia, wtedy każda kulka podglądu jest bez linii, a otoczenie krążka każdej z nich jest tłem z liniami.
- Zakładając planszę z kulkami w czterech narożnych polach i w polu środkowym oraz okna 1024×768 i 1920×1080, gdy test porówna zrzut ekranu z obrazem odniesienia, wtedy każda z tych pięciu kulek jest bez linii (wynik nie zależy od położenia kulki na ekranie; przyciemnienie brzegów i odblask szkła są obecne na obrazie odniesienia, więc zgodność z nim oznacza także, że nie zostały zdjęte z kulki).
- Zakładając planszę z kulkami w czterech narożnych polach i w polu środkowym, gdy test porówna otoczenie krążka każdej z nich na zrzucie ekranu i na obrazie odniesienia, wtedy otoczenie jest tłem z liniami (wolny od linii jest sam krążek, a nie całe pole).
- Zakładając planszę z pustym polem, gdy test porówna to pole na zrzucie ekranu i na obrazie odniesienia, wtedy całe wnętrze pola jest tłem z liniami (w pustym polu nie ma miejsca wolnego od linii).
- Zakładając otwartą grę z wdrożoną kaskadą kul, gdy test porówna kule kaskady na zrzucie ekranu i na obrazie odniesienia, wtedy na każdej kuli kaskady każdy piksel leżący w wierszu linii jest przyciemniony linią (kule kaskady zachowują linie skanowania).
- Zakładając planszę z 81 kulkami ustawioną przez interfejs testowy, gdy test porówna zrzut ekranu z obrazem odniesienia, wtedy każda z 81 kulek jest bez linii.
- Zakładając okno 1024×768 i planszę z kulkami, gdy test zmieni rozmiar okna na 1920×1080 bez ponownego otwierania gry i porówna zrzut ekranu z obrazem odniesienia, wtedy każda kulka planszy i podglądu jest bez linii, a otoczenie krążków jest tłem z liniami.
- Zakładając okno 800×600 i stronę przewiniętą do końca w pionie i w poziomie, gdy test porówna zrzut ekranu z obrazem odniesienia wykonanym przy tym samym przewinięciu, wtedy każda kulka gry widoczna w całości jest bez linii, a otoczenie jej krążka jest tłem z liniami.
- Zakładając widoczne pytanie o potwierdzenie nowej gry, a osobno widoczny komunikat końca gry, gdy test porówna zrzut ekranu z obrazem odniesienia, wtedy każda kulka planszy i podglądu jest bez linii.
- Zakładając otwartą grę bez zaznaczonej kulki i bez trwającej animacji, gdy test wykona dwa kolejne zrzuty ekranu, wtedy są identyczne i na stronie nie działa żadna animacja.
- Zakładając kryteria powyżej, gdy testy zostaną uruchomione w Chromium, Firefoksie i WebKicie, wtedy przechodzą w każdej z tych przeglądarek.
- [ręcznie] Zakładając planszę z kulkami wszystkich 7 kolorów, gdy właściciel patrzy na ekran, wtedy kolory kulek są czyste i łatwe do rozróżnienia, a ekran nadal wygląda jak stary monitor z liniami skanowania.

### S23: Kulka w ruchu nie ma linii skanowania

1. Gracz klika kulkę. Kulka zaczyna podskakiwać.
2. Przez cały czas podskakiwania kulka nie ma linii skanowania, a miejsce w polu, z którego kulka się uniosła, ma linie jak zwykłe tło pola.
3. Gracz klika puste pole. Kulka przesuwa się po drodze, po ruchu pojawiają się nowe kulki, a ułożona linia znika. W każdej z tych animacji widoczne kulki są bez linii skanowania.
4. Pole, z którego kulka odeszła albo została zbita, ma linie skanowania na całej powierzchni.

Kryteria tego scenariusza sprawdza się przy oknie 1024×768.

**Kryteria akceptacji**

- Zakładając zaznaczoną, podskakującą kulkę zatrzymaną przez test w najwyższym położeniu podskoku (chwila największego uniesienia), gdy test porówna zrzut ekranu z obrazem odniesienia wykonanym w tym samym położeniu, wtedy kulka jest bez linii, a otoczenie jej krążka, łącznie z częścią pola pod kulką, z której kulka się uniosła, jest tłem z liniami (miejsce wolne od linii podąża za kulką).
- Zakładając zaznaczoną, podskakującą kulkę zatrzymaną przez test w najniższym położeniu podskoku (chwila największego spłaszczenia), gdy test porówna zrzut ekranu z obrazem odniesienia wykonanym w tym samym położeniu, wtedy kulka jest bez linii, a otoczenie jej spłaszczonego krążka jest tłem z liniami.
- Zakładając włączony ograniczony ruch i zaznaczoną kulkę (wyróżnioną nieruchomo zgodnie z S13), gdy test porówna zrzut ekranu z obrazem odniesienia, wtedy kulka jest bez linii.
- Zakładając ruch kulki na puste pole zakończony bez zbicia linii, gdy animacja się skończy i test porówna zrzut ekranu z obrazem odniesienia, wtedy kulka w polu docelowym i każda kulka dolosowana są bez linii, a całe wnętrze pola, z którego kulka odeszła, jest tłem z liniami.
- Zakładając ruch kulki, który układa linię, gdy animacja zbicia się skończy i test porówna zrzut ekranu z obrazem odniesienia, wtedy całe wnętrze każdego pola po zbitej kulce jest tłem z liniami.
- Zakładając kliknięcie pola, do którego nie ma drogi (odmowa ruchu z S3), gdy sygnał odmowy się skończy i test porówna zrzut ekranu z obrazem odniesienia, wtedy zaznaczona kulka jest nadal bez linii.
- Zakładając kulkę przeniesioną przez gracza i nowy podgląd po dolosowaniu, gdy test porówna zrzut ekranu z obrazem odniesienia, wtedy każda kulka nowego podglądu jest bez linii.
- [ręcznie] Zakładając rozgrywkę, gdy właściciel obserwuje podskakiwanie, przesuwanie, pojawianie się i zbijanie kulek, wtedy na żadnej kulce w żadnej chwili nie widać ciemnych pasków ani ich migotania, a po kulce, która odeszła, nie zostaje ślad bez linii.

### S24: Reszta ekranu i gra działają jak dotąd

1. Gracz gra w nowej wersji.
2. Poza brakiem linii skanowania na kulkach gry nic się nie zmienia.

**Kryteria akceptacji**

- Zakładając nową wersję gry, gdy uruchomione zostaną testy scenariuszy S1–S21 istniejące w chwili wdrożenia, wtedy wszystkie przechodzą bez zmiany ich asercji.
- Zakładając otwartą grę, gdy test odczyta siłę linii skanowania, promień krawędzi ekranu, obecność odblasku szkła i promień poświaty napisów, wtedy mają wartości wymagane przez S20.
- Zakładając otwartą grę, gdy test sprawdzi kulki na planszy i w podglądzie, wtedy są okrągłe, mają kolory bazowe kolejno `#e53935`, `#fb8c00`, `#fdd835`, `#43a047`, `#00acc1`, `#1e53d6`, `#8e24aa`, kulka planszy zachowuje odstęp 12% boku pola od każdej krawędzi pola (z dokładnością do 1 piksela) i nie ma własnej poświaty ani cienia dodanego przez tę zmianę.
- Zakładając otwartą grę z wdrożoną kaskadą kul, gdy test porówna kulę kaskady z kulką planszy w tym samym kolorze, wtedy obie mają identyczne wypełnienie (kryterium S19 obowiązuje).
- Zakładając planszę z 80 kulkami i jednym pustym polem ustawioną przez interfejs testowy, gdy gracz kliknie kulkę, wtedy stan widoczny dla testu zmienia się w najwyżej 100 ms.
- Zakładając otwartą grę, gdy gracz klika kulkę, puste pole, pola w czterech rogach planszy, przycisk „Nowa gra”, przycisk dźwięku i przyciski okien, wtedy każde kliknięcie działa tak samo jak przed zmianą, a stan widoczny dla testu zmienia się w najwyżej 100 ms.
- Zakładając zaznaczoną kulkę, gdy gracz gra w nowej wersji, wtedy podskakiwanie, odznaczanie, ruch i odmowa ruchu działają zgodnie z S10–S13.
- Zakładając otwartą grę, gdy test odczyta tekst widoczny na ekranie i drzewo dostępności, wtedy zmiana nie dodała żadnego napisu ani żadnego elementu ogłaszanego przez czytnik ekranu.
- Zakładając system w motywie jasnym i ten sam system w motywie ciemnym, gdy gracz otworzy grę, wtedy ekran wygląda identycznie.
- Zakładając rozgrywkę, najlepszy wynik i ustawienie dźwięku zapisane przez poprzednią wersję gry, gdy gracz otworzy nową wersję, wtedy wszystkie trzy są odczytane i pokazane bez zmian.
- Zakładając plik gry otwarty bezpośrednio z dysku i bez połączenia z internetem, gdy strona się załaduje, wtedy kulki są bez linii skanowania tak jak w S22, a strona nie wykonała żadnego żądania sieciowego poza pobraniem samego pliku gry.
- Zakładając nową wersję gry, gdy test sprawdzi wynik budowania, wtedy produktem jest nadal jeden plik, który nie odwołuje się do żadnego zasobu zewnętrznego.
- Zakładając opublikowaną nową wersję, gdy uruchomione zostaną automatyczne sprawdzenia po publikacji (P1, P2 i P4), wtedy przechodzą.

## Zmiany względem wcześniejszych specyfikacji

Ten dokument zmienia następujące ustalenia. Pozostałe obowiązują.

| Dotychczas | Teraz |
|---|---|
| S15, S20: efekt ekranu (w tym linie skanowania) pokrywa cały obszar gry | Obszar efektu się nie zmienia, ale linie skanowania nie są rysowane na krążkach kulek gry (S22, S23). Przyciemnienie brzegów i odblask szkła nadal obejmują cały ekran. |
| S15, S20: efekt jest nieruchomy i się nie przesuwa; animacja efektu ekranu poza zakresem | Linie, przyciemnienie brzegów, krawędź i odblask pozostają nieruchome. Miejsce wolne od linii leży zawsze na kulce, więc przesuwa się razem z kulką, która podskakuje albo jest w trakcie animacji. Nieruchomy ekran nadal nie ma żadnej działającej animacji. |
| S20: ciemna linia przyciemnia obraz pod sobą o 20–40% | Bez zmian wszędzie poza krążkami kulek gry; na krążkach kulek gry linia nie przyciemnia obrazu wcale. |
| S20 [ręcznie]: efekt nie utrudnia rozróżniania 7 kolorów kulek | Dochodzi automatyczne sprawdzenie na zrzucie ekranu (S22, S23); ocena właściciela pozostaje. |
| Poza zakresem S17–S21: zmiana wyglądu kulek planszy i podglądu | Kulka sama się nie zmienia (kształt, kolor bazowy, cieniowanie). Zmienia się tylko to, że efekt ekranu nie rysuje na niej linii. |

## Dane

Bez zmian. Nie dochodzi żadna zapisywana dana ani ustawienie. Brak danych osobowych.

## Integracje zewnętrzne

Brak.

## Wymagania niefunkcjonalne

- **Forma dostarczenia (wymaganie właściciela, bez zmian):** jeden plik, bez bibliotek i bez zasobów pobieranych z sieci.
- **Wydajność:** bez zmian: od kliknięcia do zmiany stanu widocznej dla testu najwyżej 100 ms. Nowe jest to, że limit jest sprawdzany także przy prawie pełnej planszy (80 kulek, S24). Podskakiwanie i pozostałe animacje zachowują dotychczasowe czasy.
- **Ekran i platforma:** bez zmian: komputer, mysz, aktualne Chrome, Firefox, Edge i Safari, okno od 1024×768. Zmiana jest sprawdzana przy 1024×768 i 1920×1080.
- **Dostępność:** zmiana jest czysto wizualna; nie dodaje napisów ani elementów widocznych dla czytników ekranu. Nieruchomy ekran nadal nie ma żadnej działającej animacji.
- **Język:** wyłącznie polski; żaden napis się nie zmienia.
- **Testowalność:** test musi móc sam wykonać obraz odniesienia, czyli wyłączyć linie skanowania na czas zrzutu bez zmiany stanu gry. Test musi móc odczytać położenie i rozmiar krążka każdej kulki gry, także kulki zatrzymanej w wybranym położeniu podskoku. Interfejs testowy `window.__kulki` się nie zmienia. Zrzuty są porównywane tylko w obrębie jednego testu; repozytorium nie przechowuje zrzutów wzorcowych.
- **RODO:** nie dotyczy.

## Przypadki brzegowe i błędy

- **Krawędź krążka:** w pasie 2 pikseli po obu stronach krawędzi krążka (wygładzanie krawędzi) kolor nie jest sprawdzany; może tam być widoczne przejście między obszarem z liniami i bez linii.
- **Wyróżnienie zaznaczonej kulki przy ograniczonym ruchu (S13):** krążek kulki jest bez linii; część wyróżnienia leżąca poza krążkiem może mieć linie jak tło pola.
- **Kulka pod odblaskiem szkła albo w przyciemnionym brzegu ekranu:** odblask i przyciemnienie padają na kulkę jak dotąd; znikają tylko linie.
- **Pełna plansza (81 kulek):** wszystkie kulki są bez linii (S22). Przy 80 kulkach gra reaguje na kliknięcie w dotychczasowym czasie (S24).
- **Koniec gry i okna:** okna leżą w kolumnie bocznej i nie zasłaniają kulek; kulki pozostają bez linii także przy widocznym oknie.
- **Okno mniejsze niż 1024×768 albo strona przewinięta:** kulki pozostają bez linii; miejsce wolne od linii nie rozjeżdża się z kulką po przewinięciu strony.
- **Zmiana rozmiaru okna w trakcie gry:** po zmianie rozmiaru kulki są bez linii, a miejsca wolne od linii leżą dokładnie na kulkach.
- **Przeglądarka nie obsługuje potrzebnego efektu wizualnego:** gra działa normalnie, a kulki wyglądają co najmniej tak jak dziś (z liniami); gracz nie widzi komunikatu o błędzie. Wszystkie wspierane przeglądarki obsługują potrzebne efekty, więc ten przypadek jest oceniany ręcznie.

## Poza zakresem

- Zdjęcie z kulek przyciemnienia brzegów ekranu i odblasku szkła.
- Zdjęcie linii skanowania z kul kaskady, tła pól, siatki planszy, paneli, napisów i tytułu.
- Zmiana siły, gęstości albo wyglądu linii skanowania na reszcie ekranu.
- Zmiana kształtu, kolorów bazowych, cieniowania albo rozmiaru kulek; własna poświata albo cień kulek.
- Wyłącznik efektu ekranu albo jakiekolwiek nowe ustawienie.
- Zmiana reguł gry, animacji, dźwięków, napisów i zapisywanych danych.
- Wybór sposobu wykonania; to decyzja architekta, o ile spełnione są wymagania testowalności.

## Etapy dostarczenia

Zmiana jest jednym pionowym wycinkiem.

1. **Etap 1, kulki bez linii skanowania:** kulki planszy i podglądu są rysowane bez linii, także w ruchu; reszta ekranu bez zmian. Realizuje S22, S23 i S24. Kryteria o kulach kaskady (S22: kule kaskady zachowują linie; S24: identyczne wypełnienie kuli kaskady i kulki planszy) dotyczą kul tylko wtedy, gdy kaskada z S19 jest już wdrożona; jeśli ta zmiana powstaje pierwsza, sprawdza je wdrożenie kaskady.

## Założenia

Decyzje właściciela z wywiadu (nie są założeniami): zmiana dotyczy kulek planszy i podglądu, bez kul kaskady; z kulek znikają tylko linie skanowania, a przyciemnienie brzegów i odblask szkła zostają; wolny od linii jest sam krążek kulki, a tło pola i siatka mają linie jak dziś; kulka jest bez linii także w trakcie każdej animacji; sukces potwierdza automatyczny test koloru na zrzucie ekranu i ocena właściciela.

Poniższe decyzje podjął analityk, wybierając opcję najprostszą i najłatwiej odwracalną; są do potwierdzenia przy zatwierdzaniu specyfikacji.

- Kolor kulki jest porównywany z obrazem odniesienia (ten sam stan bez linii skanowania), a nie wprost z kolorem bazowym, bo kulka ma cieniowanie i nadal mogą na nią padać przyciemnienie brzegów i odblask szkła.
- Dopuszczalna różnica koloru to 3 na 255 w każdej składowej, bo linia skanowania zmienia składową nawet o kilkadziesiąt, a mała tolerancja chroni test przed różnicami zaokrągleń między przeglądarkami.
- Linia jest uznana za widoczną, gdy przyciemnia piksel o co najmniej 10% sumy składowych, bo próg musi działać także na bardzo ciemnym tle pola i pod odblaskiem szkła, gdzie zaokrąglenia i rozjaśnienie zmniejszają zmierzoną różnicę; siłę linii (20–40%) nadal określa S20.
- Przewinięta strona jest sprawdzana przy oknie 800×600, bo to typowe okno mniejsze od najmniejszego wspieranego, w którym gra wymaga przewijania.
- Pas 2 pikseli przy krawędzi krążka nie jest sprawdzany, bo krawędź kulki jest wygładzana i jej piksele mieszają kolor kulki z tłem pola.
- Podskakiwanie jest sprawdzane automatycznie w najwyższym i najniższym położeniu, a krótkie animacje przesuwania, pojawiania się i zbijania (do 450 ms) automatycznie po zakończeniu i ręcznie w trakcie, bo tylko podskok trwa dowolnie długo i ma położenia, w których test może go zatrzymać.
- Przy ograniczonym ruchu część wyróżnienia zaznaczonej kulki poza jej krążkiem może mieć linie, bo właściciel wskazał jako obszar bez linii sam krążek kulki.
- Zmiana jest osobną specyfikacją z numerami S22–S24, a nie poprawką S20, bo specyfikacja S17–S21 jest już zatwierdzona i wdrożona.
- Zmiany nie da się wyłączyć, bo wyłącznik oznaczałby nowe ustawienie i nową zapisywaną daną.

## Sekcje techniczne

Decyzje i ich uzasadnienie: [ADR 0005](../../docs/adr/0005-kulki-bez-linii-skanowania.md). Stos się nie zmienia ([ADR 0001](../../docs/adr/0001-stos-technologiczny.md)); nie dochodzi zależność, usługa ani krok budowania. Zasady pracy w repozytorium: [AGENTS.md](../../AGENTS.md). Ten rozdział rozszerza sekcje techniczne [specyfikacji ekranu kineskopu](2026-10-05-ekran-kineskopu-neonowy-tytul-i-nowy-uklad.md), [specyfikacji wyglądu retro](2026-10-05-podskakujaca-kulka-i-wyglad-retro.md) i [specyfikacji gry](2026-10-04-gra-w-kulki.md); wszystko, czego tu nie zmieniono, obowiązuje dalej.

### Architektura

Zmiana dotyczy wyłącznie szablonu i arkusza stylów: `src/index.html` (jeden nowy element) i `src/styles.css` (blok „efekt CRT”, reguła kulek, animacja odmowy ruchu, cztery nowe zmienne). Nie dochodzi kod JavaScript. `src/ui/`, `src/game/`, `src/storage/`, `src/audio/`, `src/test-api.js`, `tools/`, Compose, skrypty i workflow pozostają bez zmian.

**Zasada.** Efekt ekranu jest dziś jedną warstwą nad całą grą. Po zmianie ma warstwy ułożone przez `z-index`, a kulki gry leżą między liniami skanowania a przyciemnieniem brzegów. Kulka jest malowana nad liniami, więc linie jej nie przyciemniają; przyciemnienie brzegów i odblask są malowane nad kulką, więc padają na nią jak dotąd.

**Warstwy (od najniższej)**

| Warstwa | Element | `z-index` | Co rysuje |
|---|---|---|---|
| treść gry | `#app` i wszystko w nim poza kulkami gry | brak (`auto`) | tło, plansza, panele, napisy, tytuł, kule kaskady |
| linie skanowania | `crt` | `--z-scanlines` | gradient linii; krawędź ekranu i czerń poza nią (jak dotąd) |
| kulki gry | `ball-{wiersz}-{kolumna}`, `preview-ball` | `--z-ball` | krążki kulek |
| przyciemnienie brzegów | `crt-vignette` (nowy) | `--z-vignette` | gradient przyciemnienia; krawędź ekranu i czerń poza nią |
| odblask szkła | `crt-glare` | `--z-glare` | odblask (jak dotąd) |

**Struktura DOM po wdrożeniu**

```
body
├── main#app [data-testid="app"]          bez zmian
├── div [data-testid="crt"]               pusty, linie skanowania
├── div [data-testid="crt-glare"]         pusty, odblask szkła
└── div [data-testid="crt-vignette"]      nowy, pusty, przyciemnienie brzegów
```

Nowy element stoi po `crt-glare`, bo istniejący test integracyjny wymaga, żeby `crt-glare` był następnym rodzeństwem `crt`. O kolejności malowania decyduje `z-index`, nie kolejność w DOM.

**Reguły wykonania**

1. Zmienne kolejności w `:root`: `--z-scanlines: 1000`, `--z-ball: 1001`, `--z-vignette: 1002`, `--z-glare: 1003`. Reguły używają zmiennych; żadna nie ma `z-index` wpisanego liczbą.
2. Kulki gry dostają `z-index: var(--z-ball)` w osobnej regule z selektorami kulki planszy (`.cell > .ball`) i kulki podglądu (`.preview-ball`). Kulka podglądu dostaje w niej `position: relative` (dziś jest `static`; położenie w układzie się nie zmienia). Wspólna reguła wypełnienia (`border-radius`, `radial-gradient`) pozostaje bez `z-index`, bo korzystają z niej także kule kaskady, które mają zachować linie.
3. Element `crt` zachowuje `position: fixed`, `inset: 0`, `pointer-events: none`, `border-radius`, zewnętrzny `box-shadow` i gradient linii w tle. Jego `z-index` to `--z-scanlines`. Pierwszy gradient tła (`radial-gradient`) zostaje, ale z oboma przystankami w pełni przezroczystymi: niczego nie rysuje i istnieje tylko dlatego, że test S15 sprawdza jego obecność w tle `crt`. W arkuszu ma komentarz z tym powodem.
4. Element `crt-vignette`: `position: fixed`, `inset: 0`, `pointer-events: none`, `z-index: var(--z-vignette)`, ten sam `border-radius: var(--crt-edge-radius)` i ten sam zewnętrzny `box-shadow` co `crt` (najprościej przez wspólną regułę z dwoma selektorami), tło `radial-gradient(ellipse at center, transparent 60%, var(--crt-vignette-color) 100%)`, czyli dokładnie dotychczasowe przyciemnienie. Bez animacji i `transition`. W szablonie: `<div data-testid="crt-vignette" aria-hidden="true"></div>`.
5. Element `crt-glare` zmienia tylko `z-index` na `var(--z-glare)`.
6. Kolor linii powstaje wyłącznie z `--crt-scanline-alpha` (`rgb(0 0 0 / var(--crt-scanline-alpha))`), jak dziś. Żadna inna reguła nie rysuje linii. Dzięki temu nadpisanie zmiennej na `0` daje obraz odniesienia.
7. Sygnał odmowy ruchu: animacja `reject-flash` zmienia `left` zamiast `transform` (te same klatki: 0, −5 px, 5 px, −5 px, 5 px, 0; ten sam czas i funkcja czasu), a plansza dostaje `position: relative`. Animowany `transform` tworzy kontekst stosu, w którym kulki wpadłyby pod linie na czas sygnału. Reguła `@media (prefers-reduced-motion: reduce)` dla planszy zostaje.
8. Żaden przodek kulki gry nie tworzy kontekstu stosu. Na `#app`, planszy, polu, kolumnie bocznej, panelu podglądu, `body` i `html` nie ma `transform`, `opacity` poniżej 1, `filter`, `z-index`, `isolation`, `mix-blend-mode`, `will-change` ani `contain`, także w animacjach. Pole zachowuje `position: relative` bez `z-index`. Animacja `transform` na samej kulce (podskok) jest w porządku: `z-index` ma ten sam element.
9. Kulka się nie zmienia: ten sam kształt, wypełnienie, odstęp 12% i kolory. Nie dostaje cienia, poświaty ani obrysu.

**Dlaczego miejsce bez linii nie rozjeżdża się z kulką.** Nie ma osobnego „otworu” w liniach. Bez linii jest dokładnie to, co maluje element kulki, więc podskok, spłaszczenie, przewinięcie strony i zmiana rozmiaru okna nie wymagają żadnej synchronizacji. Pole, z którego kulka odeszła albo została zbita, nie ma widocznego elementu kulki (`display: none` przy `data-color="0"`), więc ma linie na całej powierzchni.

**Przypadki brzegowe**

- **Wyróżnienie przy ograniczonym ruchu:** obrys jest na polu, czyli pod liniami; krążek kulki jest bez linii. Specyfikacja to dopuszcza.
- **Kulka przy rogu okna (okno 800×600, strona przewinięta):** `crt-vignette` ma tę samą krawędź i czerń poza nią co `crt`, więc kulka nie wystaje poza zaokrąglony róg ekranu.
- **Przeglądarka bez potrzebnego efektu:** `z-index` działa w każdej przeglądarce; przypadek nie występuje.
- **Wydajność:** `z-index` na 81 elementach nie tworzy warstw kompozytora ani nie dodaje pracy przy kliknięciu. Limit 100 ms przy 80 kulkach sprawdza test S24.

**Budowanie i publikacja.** Bez zmian. Plik gry rośnie o kilkaset bajtów. Sprawdzenia po publikacji (P1, P2, P4) nie czytają efektu ekranu.

### Model danych

Bez zmian. Nie dochodzi żaden klucz `localStorage` ani pole w istniejących; `kulki.game.v1`, `kulki.best.v1` i `kulki.sound.v1` zachowują kształt i znaczenie, więc dane zapisane przez poprzednią wersję są czytane bez migracji (S24). Specyfikacja nie oznacza żadnych danych jako osobowe.

### Kontrakty API

Gra nadal nie ma API sieciowego. **Interfejs testowy `window.__kulki` się nie zmienia.** Wszystkie informacje dla testów są w DOM, w stylach obliczonych i na zrzucie ekranu. Poniższe pozycje są dodatkami do kontraktu DOM i po wdrożeniu są chronione ([BACKWARD_COMPATIBILITY.md](../../BACKWARD_COMPATIBILITY.md)).

#### Nowy identyfikator

| Element | `data-testid` | Uwagi |
|---|---|---|
| Przyciemnienie brzegów | `crt-vignette` | pusty, `aria-hidden="true"`, dziecko `body`, po `crt-glare` |

#### Zmienne CSS w `:root`

| Zmienna | Znaczenie | Wymaganie |
|---|---|---|
| `--z-scanlines` | `z-index` elementu `crt` | liczba całkowita |
| `--z-ball` | `z-index` kulek planszy i podglądu | większa od `--z-scanlines` |
| `--z-vignette` | `z-index` elementu `crt-vignette` | większa od `--z-ball` |
| `--z-glare` | `z-index` elementu `crt-glare` | większa od `--z-vignette` |
| `--crt-scanline-alpha` (istniejąca) | przezroczystość ciemnej linii | 0,2–0,4; jedyne źródło koloru linii |
| `--crt-vignette-color` (istniejąca) | kolor przyciemnienia brzegów | używana tylko przez `crt-vignette` |

#### Co testy odczytują

| Potrzeba | Odczyt |
|---|---|
| zrzut ekranu | `page.screenshot({ scale: 'css' })`: jeden piksel zrzutu na jeden piksel strony, także w WebKicie, który domyślnie robi zrzut w podwójnej gęstości |
| obraz odniesienia | `document.documentElement.style.setProperty('--crt-scanline-alpha', '0')`, zrzut, potem `removeProperty`; stan gry i DOM bez zmian |
| krążek kulki | `getBoundingClientRect()` elementu `ball-{wiersz}-{kolumna}` albo kolejnego `preview-ball`: krążek to elipsa wpisana w ten prostokąt (prostokąt uwzględnia `transform` podskoku) |
| wnętrze i otoczenie krążka | elipsa o półosiach mniejszych o 2 px; punkty pola albo panelu `preview` poza elipsą o półosiach większych o 2 px, z pominięciem ramki pola |
| wiersz linii albo przerwy | piksel tła pustego pola (albo tła pola obok kulki, co najmniej 2 px poza krążkiem) w tym wierszu: przyciemniony linią względem obrazu odniesienia albo nie |
| kulka zatrzymana w podskoku | `freezeAt(page, wiersz, kolumna, ułamek)` z `tests/e2e/helpers/ball.js`: `0.5` to najwyższe położenie, `0` to największe spłaszczenie; oba zrzuty przy tym samym zatrzymaniu |
| kolejność warstw | `z-index` ze stylu obliczonego: `crt` < kulka planszy = kulka podglądu < `crt-vignette` < `crt-glare`; kula kaskady ma `auto` |
| przyciemnienie pada na kulki | `background-image` elementu `crt-vignette` zawiera `radial-gradient`; prostokąt równy oknu; promień krawędzi równy promieniowi `crt`; `pointer-events: none`; `textContent` pusty; `aria-hidden="true"` |
| brak kontekstu stosu przy odmowie | w jednym `page.evaluate`: kliknięcie pola bez drogi, potem `transform` planszy ze stylu obliczonego równe `none` przy `data-rejected="true"` |
| wartości S20 | jak w tabeli „Co testy odczytują: ekran” specyfikacji S17–S21 (siła linii i promień krawędzi z `crt`, odblask z `crt-glare`, poświata napisów) |

### Integracje

Brak. Nie ma dostawcy, trybu atrapy ani sekretów. Zmiana używa wyłącznie `z-index` i `position`, obecnych w każdej przeglądarce.

### Plan implementacji

Specyfikacja ma jeden etap. Każdy krok kończy się przechodzącą bramką walidacji i zostawia działającą aplikację. Testy E2E trafiają do `tests/e2e/s22-…`, `s23-…` i `s24-…`; tytuł testu zaczyna się od numeru scenariusza. Kryteria `[ręcznie]` nie mają testu; w PR opisuje się, jak je obejrzeć (zrzuty ekranu przy 1024×768 i 1920×1080 z kulkami 7 kolorów).

Asercji w testach S1–S21 nie wolno zmieniać. Przy pisaniu tego planu przejrzano testy S3, S12, S15 i S20 oraz `tests/integration/crt.test.js`: żadna asercja nie zależy od `z-index`, od tego, że przyciemnienie rysuje `crt`, ani od tego, że plansza przy odmowie ma `transform`. Oczekiwany wynik: żadna istniejąca asercja się nie zmienia.

**Zależności**

| Etap | Zależy od | Uwagi |
|---|---|---|
| 1. Kulki bez linii skanowania (S22–S24) | nic | działa z kaskadą kul (S19) i bez niej |

#### Etap 1: kulki bez linii skanowania (S22, S23, S24). Bez zależności

| Krok | Zakres | Testy | Zależy od |
|---|---|---|---|
| 1.1 | Warstwy ekranu bez widocznej zmiany: zmienne `--z-*`; element `crt-vignette` w szablonie i jego reguła; przyciemnienie przeniesione z `crt` (w tle `crt` zostaje przezroczysty `radial-gradient` z komentarzem); `z-index` elementów `crt` i `crt-glare` ze zmiennych; `reject-flash` przez `left` i `position: relative` planszy | integracyjny (`tests/integration/crt.test.js`, nowe przypadki): `crt-vignette` istnieje raz, jest pusty, ma `aria-hidden`, jest dzieckiem `body` poza `#app`; E2E S24: kolejność `z-index` warstw ekranu, `crt-vignette` równy oknu z promieniem `crt`, bez przechwytywania kliknięć, bez napisu i poza drzewem dostępności, wartości wymagane przez S20, `transform` planszy równe `none` przy odmowie, dwa kolejne zrzuty identyczne i brak animacji, ten sam wygląd w motywie jasnym i ciemnym; komplet istniejących testów przechodzi bez zmian | |
| 1.2 | Kulki nad liniami: osobna reguła z `z-index: var(--z-ball)` dla kulek planszy i podglądu. Pomocnik `tests/e2e/helpers/scanlines.js` (obraz odniesienia, dekodowanie zrzutów, krążek, wiersze linii, progi) | E2E S22: 7 kolorów, podgląd, narożniki i środek, otoczenie krążków, puste pole, 81 kulek, zmiana rozmiaru okna bez ponownego otwierania, okno 800×600 po przewinięciu, pytanie o nową grę i koniec gry, brak animacji; wszystko przy 1024×768 i 1920×1080 tam, gdzie wymaga tego kryterium. Jeśli kaskada kul (S19) jest już wdrożona: kule kaskady zachowują linie | 1.1 |
| 1.3 | Testy kulki w ruchu, bez zmian w produkcie | E2E S23: najwyższe i najniższe położenie podskoku z otoczeniem krążka, ograniczony ruch, ruch bez zbicia (pole docelowe, kulki dolosowane, pole opuszczone), ruch ze zbiciem (pola po zbitych kulkach), odmowa ruchu, nowy podgląd | 1.2 |
| 1.4 | Testy regresji, bez zmian w produkcie | E2E S24: kulki okrągłe, kolory bazowe, odstęp 12% (±1 px), brak `box-shadow` i `filter` na kulkach; kliknięcie kulki przy 80 kulkach i kliknięcia pól, pól narożnych i przycisków zmieniają stan w najwyżej 100 ms; tekst strony i drzewo dostępności bez nowych pozycji; kulki bez linii przy `file://` bez żądań sieciowych. Jeśli kaskada kul jest już wdrożona: wypełnienie kuli kaskady identyczne z kulką planszy | 1.2 |

Kroki 1.1 i 1.2 zmieniają ten sam blok arkusza i mogą trafić do jednego PR. Kroki 1.3 i 1.4 są od siebie niezależne. Pozostałe kryteria S24 mają już testy i nie wymagają nowych: scenariusze S1–S21 (`tests/e2e/`), podskakiwanie i odmowa ruchu zgodne z S10–S13 (`s10-…` do `s13-…`), dane zapisane przez poprzednią wersję (`s16-gra-dziala-jak-dotad`), jeden plik bez zasobów zewnętrznych (`tests/integration/single-file.test.js`), P1, P2 i P4 (`tests/postdeploy/`, w bramce w trybie atrapy).

**Kaskada kul (S19).** W chwili pisania tego planu kaskada nie jest wdrożona. Kryteria o kulach kaskady (S22: zachowują linie; S24: wypełnienie identyczne z kulką planszy) sprawdza ta zmiana, jeśli kaskada już jest; w przeciwnym razie test dopisuje wdrożenie kaskady. W obu kolejnościach obowiązuje to samo: selektor kuli kaskady trafia do wspólnej reguły wypełnienia, a nie do reguły z `--z-ball`.

#### Wskazówki do testów

- Zrzuty dekoduje się w przeglądarce, jak w `tests/e2e/helpers/screen.js`: obraz z adresu `data:` narysowany na `<canvas>` utworzonym w teście i odczytany przez `getImageData`. Oba zrzuty (zwykły i odniesienia) dekoduje się w jednym `page.evaluate` i tam porównuje; do Node wraca tylko wynik (liczba niezgodnych pikseli i pierwszy z nich), nie tablice pikseli.
- Progi ze specyfikacji są stałymi pomocnika: zgodność koloru to różnica najwyżej 3 w każdej składowej; piksel przyciemniony linią ma sumę składowych mniejszą o co najmniej 10%; pas 2 px po obu stronach krawędzi krążka jest pomijany.
- Po ustawieniu albo usunięciu nadpisania `--crt-scanline-alpha` nie trzeba na nic czekać: `page.screenshot()` maluje aktualny styl.
- Przed zrzutem: `await page.evaluate(() => document.fonts.ready)` i `data-animating="false"` na planszy. Przy zaznaczonej kulce oba zrzuty robi się po `freezeAt`, bo podskok zmienia obraz między zrzutami.
- Ograniczony ruch: `page.emulateMedia({ reducedMotion: 'reduce' })` przed otwarciem gry.
- Odmowa ruchu „po zakończeniu sygnału”: czekać na `data-rejected="false"`, potem zatrzymać podskok i zrobić zrzuty.
- Przewinięcie przy 800×600: `window.scrollTo(document.documentElement.scrollWidth, document.documentElement.scrollHeight)`; krążki bierze się z `getBoundingClientRect()` po przewinięciu, a kulkę „widoczną w całości” rozpoznaje po prostokącie mieszczącym się w oknie.
- Plansza z 81 kulkami i z 80 kulkami: `setState` z planszą bez gotowych linii (wzór `(3 × wiersz + kolumna) mod 7`, jak w istniejących testach S15 i S20).
- Zrzuty porównuje się tylko w obrębie jednego testu i jednego silnika; nie ma zrzutów wzorcowych w repozytorium.
- Sposób odczytu został sprawdzony próbą w Chromium, Firefoksie i WebKicie przy 1024×768 i 1920×1080: przed zmianą 14 680 z 29 360 pikseli wnętrza 20 krążków różniło się od obrazu odniesienia, po zmianie 0; w otoczeniu krążków 0 z 26 160 pikseli odbiegało od „tła z liniami”; kulka zatrzymana przez `freezeAt` w położeniach `0.5` i `0` dała 0 niezgodnych pikseli; kulka w lewym dolnym polu przy 1024×768 była pod `crt-vignette` wyraźnie ciemniejsza niż bez przyciemnienia. Przy planszy z `transform` w animacji linie wracały na kulki; przy animacji `left` nie.
- Bez stałych opóźnień; przebiegi równoległe z `--workers 2` i własnym `E2E_RUN_ID`.

#### Miejsca wspólne przy pracy równoległej

- `src/styles.css`: krok 1.1 zmienia blok „efekt CRT”, animację `reject-flash`, regułę planszy i dopisuje zmienne `--z-*`; krok 1.2 dopisuje jedną regułę kulek. Wdrożenie kaskady kul (S19) dopisuje selektor do wspólnej reguły wypełnienia kulek, której ta zmiana nie rusza.
- `src/index.html`: krok 1.1 dopisuje jeden wiersz po `crt-glare`.
- `tests/integration/crt.test.js`: krok 1.1 dopisuje przypadki; istniejących nie zmienia.
- `tests/e2e/helpers/`: nowy plik `scanlines.js`; istniejących pomocników się nie przerabia.
- `src/ui/`, `src/test-api.js`, `src/game/`, `src/storage/`, `src/audio/`, `tools/`, `scripts/`, Compose i workflow: żaden krok ich nie zmienia.
