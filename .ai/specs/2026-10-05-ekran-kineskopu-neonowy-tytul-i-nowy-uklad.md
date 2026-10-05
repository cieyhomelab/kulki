# Ekran kineskopu, neonowy tytuł i nowy układ

## TLDR

Trzecia zmiana wyglądu gry „Kulki”. Ekran gry ma wyglądać jak wypukły, szklany ekran starego monitora CRT w ciemnym pokoju: zaokrąglone krawędzie, odblask szkła, wyraźniejsze linie skanowania i mocniejsza poświata. W lewym górnym rogu gry pojawia się duży, neonowy, trójwymiarowy tytuł otoczony kaskadą kolorowych kul, plansza leży pod nim, a wynik, najlepszy wynik, podgląd i przyciski tworzą jedną kolumnę po prawej. Jedyna zmiana treści to brzmienie tytułu na ekranie: „KULKI” zamiast „Kulki”. Reguły gry, plansza 9×9, kulki, zapisywane dane i sposób dostarczenia (jeden plik działający offline) się nie zmieniają.

## Problem i cel

Po wdrożeniu wyglądu retro arcade (S14, S15) gra ma pikselową czcionkę, twarde cienie i subtelne linie skanowania, ale nadal wygląda jak płaska strona w przeglądarce. Tytuł jest zwykłym napisem, a wynik i najlepszy wynik stoją w pasku nad planszą. Właściciel opisał docelowy obraz: stary, wypukły monitor w ciemnym pomieszczeniu, efektowny neonowy tytuł z kulami i panele ułożone w kolumnie obok planszy.

Ten dokument rozszerza specyfikację gry ([2026-10-04-gra-w-kulki.md](2026-10-04-gra-w-kulki.md)) i specyfikację wyglądu retro ([2026-10-05-podskakujaca-kulka-i-wyglad-retro.md](2026-10-05-podskakujaca-kulka-i-wyglad-retro.md)). Wszystko, czego tu nie zmieniono wprost, obowiązuje dalej. Scenariusze mają numery S17–S21.

Opis właściciela jest wzorem nastroju i układu, a nie makietą co do piksela. Liczby i układ kulek z opisu (wynik 20, najlepszy wynik 188, konkretne kolory w podglądzie) są przykładem stanu gry, nie wymaganiem.

Sukces poznamy po tym, że:

- układ ekranu odpowiada S17, tytuł i kaskada kul odpowiadają S18 i S19, a ekran wygląda jak wypukły kineskop zgodnie z S20,
- właściciel, patrząc na grę, uznaje ją za zgodną z opisanym obrazem,
- gra działa jak dotąd (S21).

## Użytkownicy i role

Bez zmian: jedna rola, **gracz**. Nie dochodzi żadne ustawienie ani uprawnienie.

## Pojęcia

- **Ekran:** obszar, na którym rysowana jest cała gra; wygląda jak szklana powierzchnia kineskopu.
- **Krawędź ekranu:** zaokrąglony brzeg ekranu. Poza krawędzią jest tylko czerń (ciemny pokój); nie ma obudowy telewizora.
- **Złudzenie wypukłości:** wrażenie wypukłego szkła uzyskane krawędzią ekranu, odblaskiem i przyciemnieniem brzegów. Treść gry (plansza, napisy, panele) nie jest zniekształcona.
- **Odblask szkła:** nieruchoma, półprzezroczysta jasna plama na ekranie, jak odbicie światła w szybie kineskopu.
- **Gra:** tytuł, kaskada kul, plansza i kolumna boczna razem. Gra leży pośrodku ekranu.
- **Tytuł:** napis „KULKI” w lewym górnym rogu gry, nad planszą. Nazwa karty przeglądarki to osobny napis i pozostaje „Kulki”.
- **Kaskada kul:** nieruchoma dekoracja z kolorowych kul wokół tytułu. Nie jest częścią rozgrywki.
- **Kolumna boczna:** pionowy pasek po prawej stronie planszy z panelami i przyciskami.
- **Okna:** pytanie o potwierdzenie nowej gry i komunikat końca gry.
- **Elementy interfejsu:** jak w specyfikacji wyglądu retro: plansza i jej pola, trzy panele, przyciski, okna i ich przyciski.

## Scenariusze

### S17: Nowy układ ekranu

1. Gracz otwiera grę.
2. W lewym górnym rogu gry widzi tytuł, pod nim planszę 9×9. Po prawej stronie planszy widzi kolumnę boczną, w kolejności od góry: panel „Wynik”, panel „Najlepszy wynik”, panel „Następne kulki”, przycisk „Nowa gra”, przycisk dźwięku.
3. Gdy pojawia się okno (pytanie o potwierdzenie albo komunikat końca gry), jest ono w kolumnie bocznej, pod przyciskiem dźwięku.

Plansza ma jasnoniebieską siatkę na ciemnogranatowym tle. Liczby wyniku i najlepszego wyniku pozostają żółte.

**Kryteria akceptacji**

- Zakładając okno 1024×768, gdy gracz otworzy grę, wtedy element tytułu leży w całości nad planszą, a jego lewa krawędź leży nie dalej niż szerokość jednego pola od lewej krawędzi planszy (w lewo albo w prawo).
- Zakładając okno 1024×768, gdy test odczyta położenie panelu wyniku, panelu najlepszego wyniku, panelu podglądu, przycisku „Nowa gra” i przycisku dźwięku, wtedy każdy z nich leży w całości na prawo od prawej krawędzi planszy, są ułożone w tej kolejności od góry do dołu i żadne dwa na siebie nie zachodzą.
- Zakładając okno 1024×768, gdy test odczyta położenie panelu wyniku, wtedy jego górna krawędź nie leży wyżej niż górna krawędź tytułu i nie leży niżej niż jedno pole poniżej górnej krawędzi planszy.
- Zakładając okno 1024×768 i widoczne najwyższe okno (komunikat końca gry z informacją o nowym rekordzie), gdy test odczyta dolną krawędź ostatniego elementu kolumny bocznej, wtedy leży ona w granicach okna przeglądarki.
- Zakładając okno 1024×768, gdy gracz kliknie „Nowa gra” w trakcie rozgrywki, wtedy pytanie o potwierdzenie pojawia się w kolumnie bocznej pod przyciskiem dźwięku, mieści się w całości w oknie i nie zasłania żadnego pola planszy, panelu ani przycisku.
- Zakładając okno 1024×768 i koniec gry z nowym rekordem, gdy pojawi się komunikat końca gry, wtedy leży on w kolumnie bocznej pod przyciskiem dźwięku, mieści się w całości w oknie, jego napisy nie są ucięte i nie zasłania żadnego pola planszy, panelu ani przycisku.
- Zakładając okna 1024×768 oraz 1920×1080, gdy gracz otworzy grę, wtedy cała gra (tytuł, plansza, trzy panele, oba przyciski) jest widoczna bez przewijania w pionie i w poziomie, a żaden napis nie jest ucięty ani nie wychodzi poza swój element.
- Zakładając otwartą grę, gdy test policzy pola planszy, wtedy jest ich 81 w układzie 9 wierszy na 9 kolumn.
- Zakładając otwartą grę, gdy test odczyta kolor linii siatki (każdy kolor widoczny między wnętrzami dwóch sąsiednich pól) i kolor tła wnętrza pól, wtedy linie są niebieskie (składowa niebieska koloru jest największa) i jaśniejsze od tła pól, kontrast między nimi wynosi co najmniej 3:1, a tło pól jest ciemne (jasność względna nie większa niż 0,05) i także ma największą składową niebieską.
- Zakładając okno 1920×1080, gdy test odczyta położenie gry, wtedy odstęp od lewej krawędzi okna do lewej krawędzi planszy i odstęp od prawej krawędzi kolumny bocznej do prawej krawędzi okna różnią się o nie więcej niż szerokość jednego pola (gra leży pośrodku).
- Zakładając otwartą grę, gdy test odczyta kolejność napisów widocznych na ekranie, wtedy jest taka jak dotąd: tytuł, „Wynik” z liczbą, „Najlepszy wynik” z liczbą, „Następne kulki”, „Nowa gra”, napis przycisku dźwięku.
- [ręcznie] Zakładając otwartą grę, gdy właściciel patrzy na ekran, wtedy układ odpowiada opisanemu obrazowi: tytuł u góry po lewej, plansza pod nim, kolumna paneli i przycisków po prawej.

### S18: Neonowy tytuł 3D

1. Gracz otwiera grę.
2. W lewym górnym rogu gry widzi duży tytuł „KULKI” pisany czcionką gry: niebieskie litery z jaskrawożółtym obrysem, żółtą poświatą jak od neonu i głębią 3D (litery wyglądają na wypukłe bryły).

Tytuł jest nieruchomy. Pozostaje zwykłym nagłówkiem strony: czytnik ekranu odczytuje go raz, jako nazwę gry. Tytuł jest zapisany wielkimi literami w samej treści strony, a nie tylko tak wyświetlany.

**Kryteria akceptacji**

- Zakładając otwartą grę, gdy test odczyta tekst tytułu, wtedy brzmi on dokładnie „KULKI” (wielkie litery), a nazwa karty przeglądarki brzmi „Kulki”.
- Zakładając otwartą grę, gdy test sprawdzi tytuł, wtedy jest on wyświetlany czcionką gry, a nie czcionką zastępczą.
- Zakładając otwartą grę, gdy test porówna rozmiar liter tytułu z rozmiarem liczby w panelu wyniku, wtedy litery tytułu są co najmniej 2 razy większe.
- Zakładając otwartą grę, gdy test odczyta kolor wypełnienia liter tytułu i kolor ich obrysu, wtedy wypełnienie jest niebieskie (składowa niebieska koloru jest największa), a obrys żółty (składowe czerwona i zielona są obie większe od niebieskiej).
- Zakładając otwartą grę, gdy test porówna kolor wypełnienia liter tytułu z kolorem tła, na którym tytuł leży, wtedy kontrast wynosi co najmniej 4,5:1.
- Zakładając otwartą grę, gdy test odczyta poświatę tytułu, wtedy tytuł ma rozmytą poświatę w kolorze żółtym, o promieniu co najmniej 2 razy większym niż promień poświaty podpisu „Wynik”.
- Zakładając otwartą grę, gdy test odczyta głębię tytułu, wtedy pod literami jest co najmniej jedna warstwa bez rozmycia, przesunięta w dół i w prawo, w kolorze ciemniejszym od wypełnienia liter.
- Zakładając otwartą grę, gdy test odczyta tekst widoczny na ekranie i drzewo dostępności, wtedy napis „KULKI” występuje w nich dokładnie raz, jako nagłówek pierwszego poziomu (obrys, poświata i głębia nie powielają napisu).
- Zakładając okno 1024×768, gdy test odczyta zasięg tytułu (prostokąt liter powiększony o grubość obrysu, przesunięcie głębi i promień poświaty), wtedy mieści się on w całości w oknie, a prostokąt liter powiększony o obrys i głębię nie zachodzi na planszę ani na żaden panel, przycisk lub okno.
- Zakładając otwartą grę bez zaznaczonej kulki, gdy test sprawdzi tytuł, wtedy nie działa na nim żadna animacja.
- [ręcznie] Zakładając otwartą grę, gdy właściciel patrzy na tytuł, wtedy wygląda on jak świecący neon z trójwymiarowymi literami i pozostaje czytelny.

### S19: Kaskada kul wokół tytułu

1. Gracz otwiera grę.
2. Wokół tytułu widzi nieruchomą kaskadę kul w różnych rozmiarach. Kule wyglądają tak samo jak kulki w grze i mają te same 7 kolorów.

Kaskada jest wyłącznie dekoracją. Nie reaguje na kliknięcia, nie jest częścią planszy i nie zmienia się w trakcie gry. Przy każdym otwarciu gry wygląda identycznie.

**Kryteria akceptacji**

- Zakładając otwartą grę, gdy test policzy kule kaskady, wtedy jest ich co najmniej 7 i nie więcej niż 30, a każdy z 7 kolorów kulek gry występuje co najmniej raz.
- Zakładając otwartą grę i planszę z kulkami wszystkich 7 kolorów ustawioną przez interfejs testowy, gdy test porówna każdą kulę kaskady z kulką planszy w tym samym kolorze, wtedy obie są okrągłe i mają identyczne wypełnienie (ten sam kolor bazowy i to samo cieniowanie).
- Zakładając otwartą grę, gdy test porówna rozmiary kul kaskady, wtedy występują co najmniej 3 różne rozmiary.
- Zakładając okno 1024×768, gdy test odczyta położenie kul kaskady, wtedy każda mieści się w całości w oknie i żadna nie zachodzi na planszę ani na żaden panel, przycisk lub okno (sprawdzane także przy widocznym pytaniu o potwierdzenie i komunikacie końca gry).
- Zakładając otwartą grę, gdy test porówna położenie kul kaskady z prostokątem liter tytułu, wtedy żadna kula na ten prostokąt nie zachodzi (kule otaczają napis, nie leżą pod literami ani na nich).
- Zakładając otwartą grę bez zaznaczonej kulki, gdy gracz kliknie kulę kaskady, wtedy stan gry się nie zmienia: żadna kulka nie jest zaznaczona, plansza, wynik i podgląd są takie jak przed kliknięciem, a rejestr odtworzonych dźwięków się nie wydłuża.
- Zakładając zaznaczoną, podskakującą kulkę, gdy gracz kliknie kolejno kulę kaskady, tytuł i puste miejsce ekranu poza grą, wtedy po każdym kliknięciu ta sama kulka jest nadal zaznaczona i podskakuje, a plansza, wynik i podgląd się nie zmieniają.
- Zakładając otwartą grę, gdy test odczyta tekst widoczny na ekranie i drzewo dostępności, wtedy kaskada nie dodała żadnego napisu i w drzewie dostępności nie występuje.
- Zakładając grę otwartą dwa razy z tym samym stanem rozgrywki, gdy test porówna liczbę, kolory, rozmiary i położenie kul kaskady, wtedy są identyczne.
- Zakładając przewidywalne losowanie ustawione przez interfejs testowy, gdy gracz rozegra ruch bez zbicia linii, wtedy dolosowane kulki i nowy podgląd są dokładnie tymi, które wynikają z zadanej sekwencji według reguł specyfikacji gry (kaskada nie zużywa losowań gry).
- Zakładając rozgrywkę, w której zmienia się plansza, wynik i podgląd, gdy test porówna kaskadę przed ruchem i po nim, wtedy jest identyczna.
- Zakładając otwartą grę, także z zaznaczoną, podskakującą kulką, gdy test sprawdzi kule kaskady, wtedy na żadnej nie działa animacja.
- [ręcznie] Zakładając otwartą grę, gdy właściciel patrzy na tytuł, wtedy kule wyglądają jak kaskada otaczająca napis i nie da się ich pomylić z kulkami na planszy.

### S20: Wypukły ekran kineskopu

1. Gracz otwiera grę w ciemnym motywie.
2. Cała gra jest na ekranie, który wygląda jak wypukłe szkło starego monitora: zaokrąglone krawędzie, czerń poza nimi, przyciemnione brzegi, nieruchomy odblask szkła, wyraźne poziome linie skanowania i poświata wokół jasnych napisów i ramek.

Ekran wypełnia całe okno przeglądarki. Wypukłość jest złudzeniem: plansza, napisy i panele pozostają proste i niezniekształcone. Efekt jest nieruchomy, nie migocze i nie da się go wyłączyć. Zastępuje i wzmacnia efekt z S15; kryteria S15 obowiązują dalej.

**Kryteria akceptacji**

- Zakładając okna 1024×768 oraz 1920×1080, gdy test odczyta obszar efektu ekranu, wtedy pokrywa on całe okno, łącznie z oknami gry, gdy są widoczne.
- Zakładając okna 1024×768 oraz 1920×1080, gdy test odczyta kształt krawędzi ekranu, wtedy każdy z czterech narożników ekranu jest zaokrąglony promieniem nie mniejszym niż 2% krótszego boku okna, a na zrzucie ekranu piksel w każdym z czterech rogów okna ma jasność względną nie większą niż 0,01 (czerń poza ekranem).
- Zakładając okno 1024×768, gdy test porówna położenie elementów interfejsu i tytułu, a także kul kaskady, jeśli są już wdrożone, z krawędzią ekranu, wtedy każdy z nich leży w całości wewnątrz krawędzi ekranu (żaden narożnik elementu nie wypada w zaokrąglony róg ani w czerń poza nim); dotyczy to także okien gry, gdy są widoczne.
- Zakładając otwartą grę, gdy test zmierzy wszystkie 81 pól planszy, wtedy każde jest kwadratem, wszystkie mają ten sam rozmiar z dokładnością do 1 piksela, a pola jednego wiersza i jednej kolumny leżą w jednej linii (obraz nie jest zniekształcony).
- Zakładając otwartą grę, gdy test odnajdzie odblask szkła, wtedy jest on obecny, leży w granicach ekranu, nie zawiera napisu i nie występuje w drzewie dostępności.
- Zakładając otwartą grę, gdy gracz klika pola w czterech rogach planszy, każde pole, na które zachodzi odblask szkła (jeśli zachodzi na planszę), przycisk „Nowa gra”, przycisk dźwięku oraz przyciski okien, wtedy każde kliknięcie działa tak samo jak bez efektu (krawędź ekranu, odblask i linie nie przechwytują kliknięć).
- Zakładając otwartą grę bez zaznaczonej kulki i bez trwającej animacji blokującej, gdy test sprawdzi stronę, wtedy nie działa na niej żadna animacja, a dwa kolejne zrzuty ekranu są identyczne.
- Zakładając otwartą grę, gdy test odczyta siłę linii skanowania, wtedy ciemna linia przyciemnia obraz pod sobą o co najmniej 20% i nie więcej niż 40% (dotychczas 12%), a przerwa między liniami nie przyciemnia go wcale.
- Zakładając otwartą grę, gdy test odczyta promień poświaty podpisów paneli i napisów przycisków, wtedy wynosi on co najmniej 4 piksele (dotychczas 3 piksele).
- Zakładając otwartą grę, gdy test porówna kolor każdego napisu z jednolitym kolorem tła elementu, na którym napis leży (bez uwzględniania efektu ekranu), wtedy kontrast wynosi co najmniej 4,5:1.
- Zakładając system w motywie jasnym i ten sam system w motywie ciemnym, gdy gracz otworzy grę, wtedy ekran wygląda identycznie.
- Zakładając włączony ograniczony ruch, gdy gracz otworzy grę, wtedy efekt ekranu wygląda tak samo jak bez tego ustawienia (jest nieruchomy, więc niczego nie trzeba wyłączać).
- Zakładając plik gry otwarty bezpośrednio z dysku i bez połączenia z internetem, gdy strona się załaduje, wtedy efekt ekranu (krawędź, odblask, linie) jest obecny, a strona nie wykonała żadnego żądania sieciowego poza pobraniem samego pliku gry.
- [ręcznie] Zakładając otwartą grę, gdy właściciel patrzy na ekran, wtedy wygląda on jak wypukły, szklany ekran starego monitora w ciemnym pokoju, z widocznymi liniami skanowania i poświatą, a efekt nie utrudnia czytania napisów, rozróżniania 7 kolorów kulek ani trafiania w pola.

### S21: Gra działa jak dotąd

1. Gracz gra w nowej wersji.
2. Wszystko poza układem, tytułem, kaskadą kul i efektem ekranu działa jak przed zmianą.

**Kryteria akceptacji**

- Zakładając nową wersję gry, gdy uruchomione zostaną istniejące testy scenariuszy S1–S13, wtedy wszystkie przechodzą; jedyną dozwoloną zmianą ich asercji jest oczekiwane brzmienie tytułu na ekranie („KULKI” zamiast „Kulki”). To samo dotyczy pozostałych istniejących testów, które sprawdzają tekst tytułu (testy integracyjne, test ekranu startowego).
- Zakładając nową wersję gry, gdy uruchomione zostaną istniejące testy scenariuszy S14–S16, wtedy przechodzą; zmienić wolno wyłącznie asercje sprzeczne ze zmianami wymienionymi w sekcji „Zmiany względem wcześniejszych specyfikacji”.
- Zakładając otwartą grę, gdy test odczyta wszystkie napisy poza tytułem (podpisy paneli, napisy przycisków, pytanie o potwierdzenie, komunikat końca gry, nazwę karty przeglądarki), wtedy mają dotychczasowe brzmienie.
- Zakładając otwartą grę, gdy test sprawdzi kulki na planszy i w podglądzie, wtedy są okrągłe, mają kolory bazowe kolejno `#e53935`, `#fb8c00`, `#fdd835`, `#43a047`, `#00acc1`, `#1e53d6`, `#8e24aa`, kulka planszy zachowuje dotychczasowy odstęp od krawędzi pola (12% boku pola z każdej strony, z dokładnością do 1 piksela) i nie ma własnej poświaty ani cienia dodanego przez tę zmianę.
- Zakładając zaznaczoną kulkę, gdy gracz gra w nowym układzie, wtedy podskakiwanie, odznaczanie, ruch i odmowa ruchu działają zgodnie z S10–S13.
- Zakładając rozgrywkę, najlepszy wynik i ustawienie dźwięku zapisane przez poprzednią wersję gry, gdy gracz otworzy nową wersję, wtedy wszystkie trzy są odczytane i pokazane bez zmian.
- Zakładając nową wersję gry, gdy test sprawdzi wynik budowania, wtedy produktem jest nadal jeden plik, który nie odwołuje się do żadnego zasobu zewnętrznego.
- Zakładając otwartą grę, gdy gracz kliknie kulkę, wtedy stan widoczny dla testu zmienia się w najwyżej 100 ms, tak jak przed zmianą.
- Zakładając etap 1 albo etap 3 wdrożony przed etapem 2, gdy test odczyta tytuł, wtedy brzmi on jeszcze „Kulki”; brzmienie „KULKI” wprowadza wyłącznie etap 2.
- Zakładając opublikowaną nową wersję, gdy uruchomione zostaną automatyczne sprawdzenia po publikacji (P1, P2 i P4), wtedy przechodzą.

## Zmiany względem wcześniejszych specyfikacji

Ten dokument zmienia następujące ustalenia specyfikacji wyglądu retro (S10–S16). Pozostałe obowiązują.

| Dotychczas | Teraz |
|---|---|
| S15: efekt „nie zakrzywia obrazu”; zakrzywienie obrazu poza zakresem | Ekran ma zaokrąglone krawędzie i wygląda na wypukły (S20). Treść gry nadal nie jest zniekształcona; prawdziwe zniekształcenie obrazu pozostaje poza zakresem. |
| S15: subtelne linie skanowania i lekka poświata | Wyraźniejsze linie i mocniejsza poświata (S20), dochodzi odblask szkła. |
| S14: żaden element interfejsu nie ma zaokrąglonych narożników | Bez zmian dla elementów interfejsu. Zaokrąglona jest wyłącznie krawędź ekranu, która nie jest elementem interfejsu. |
| Poza zakresem: „nowe elementy dekoracyjne z treścią”; S14: nie dochodzą nowe elementy poza opisanymi | Dochodzą dwie dekoracje bez treści: kaskada kul (S19) i odblask szkła (S20). Obudowa automatu, joystick i napisy dekoracyjne pozostają poza zakresem. |
| Układ: tytuł, wynik i najlepszy wynik w pasku nad planszą; podgląd i przyciski obok planszy | Tytuł nad planszą po lewej; wynik, najlepszy wynik, podgląd i przyciski w kolumnie bocznej (S17). |
| Okna leżą w układzie strony, pod planszą albo obok niej | Okna leżą w kolumnie bocznej pod przyciskiem dźwięku (S17). Nadal niczego nie zasłaniają. |
| Tytuł: zwykły napis czcionką gry w neonowej zieleni | Tytuł niebieski z żółtym obrysem, poświatą i głębią 3D (S18). |
| S14, S16: wszystkie napisy mają dotychczasowe brzmienie; tytuł na ekranie brzmi „Kulki” | Tytuł na ekranie brzmi „KULKI”. To jedyna zmiana brzmienia; nazwa karty przeglądarki zostaje „Kulki”. Brzmienie tytułu jest chronionym kontraktem, więc zmienia się razem z testami, które je sprawdzają, oraz z opisem chronionych kontraktów i zasad pracy w repozytorium (`BACKWARD_COMPATIBILITY.md`, `AGENTS.md`), które dziś zabraniają zmiany asercji S1–S9. |

## Dane

Bez zmian. Nie dochodzi żadna zapisywana dana ani ustawienie. Kaskada kul jest stałą dekoracją i nie jest zapisywana. Brak danych osobowych.

## Integracje zewnętrzne

Brak. Tytuł, kaskada kul i efekt ekranu są częścią pliku gry; nic nie jest pobierane z sieci.

## Wymagania niefunkcjonalne

- **Forma dostarczenia (wymaganie właściciela, bez zmian):** jeden plik, bez bibliotek i bez zasobów pobieranych z sieci. Wszystko, czego potrzebuje nowy wygląd, jest wbudowane w ten plik.
- **Wydajność:** bez zmian: od kliknięcia do zmiany stanu widocznej dla testu najwyżej 100 ms, także z nowym efektem ekranu.
- **Ekran i platforma:** bez zmian: komputer, mysz, aktualne Chrome, Firefox, Edge i Safari, okno od 1024×768 bez przewijania. Wygląd jest sprawdzany także przy 1920×1080.
- **Dostępność:** efekt ekranu i kaskada kul są nieruchome i niewidoczne dla czytników ekranu. Kontrast napisów co najmniej 4,5:1 względem jednolitego tła. Tytuł pozostaje nagłówkiem odczytywanym raz.
- **Język:** wyłącznie polski. Kolejność napisów bez zmian; brzmienie bez zmian poza tytułem („KULKI”).
- **Testowalność:** testy muszą móc odnaleźć tytuł, każdą kulę kaskady z osobna, krawędź ekranu i odblask szkła oraz odczytać ich położenie, rozmiar i kolory. Dla tytułu muszą móc odczytać prostokąt liter, kolor wypełnienia, kolor i grubość obrysu, przesunięcie i kolor głębi oraz kolor i promień poświaty. Dla kuli kaskady: kolor (który z 7), rozmiar, położenie i wypełnienie. Dla efektu ekranu: promień zaokrąglenia krawędzi, siłę linii skanowania i promień poświaty napisów. Kule kaskady muszą być dla testów odróżnialne od kulek planszy i podglądu. Dotychczasowe elementy kontraktu testowego nie zmieniają znaczenia; interfejs testowy `window.__kulki` się nie zmienia.
- **RODO:** nie dotyczy.

## Przypadki brzegowe i błędy

- **Okno mniejsze niż 1024×768:** jak dotąd: gra pozostaje używalna z przewijaniem, dopasowanie nie jest wymagane. Efekt ekranu nadal pokrywa widoczne okno.
- **Okno bardzo duże albo o nietypowych proporcjach:** ekran wypełnia całe okno; gra leży pośrodku i nie jest przycięta krawędzią ekranu.
- **Długie liczby:** wynik do sześciu cyfr mieści się w panelu także w kolumnie bocznej (kryterium S14 obowiązuje).
- **Najdłuższe okno:** komunikat końca gry z informacją o nowym rekordzie mieści się w kolumnie bocznej przy 1024×768 (S17).
- **Kliknięcie w dekorację:** kliknięcie kuli kaskady, tytułu albo pustego miejsca ekranu poza grą niczego nie zmienia i nie odznacza zaznaczonej kulki (S19). Odblask szkła i krawędź ekranu nie przechwytują kliknięć, więc kliknięcie trafia w to, co leży pod nimi (S20).
- **Kliknięcie w trakcie animacji blokującej:** ignorowane jak dotąd.
- **Czcionka gry nie daje się wczytać:** tytuł jest wyświetlany czcionką zastępczą jak pozostałe napisy; gra działa normalnie i gracz nie widzi komunikatu o błędzie.
- **Przeglądarka nie obsługuje któregoś z efektów wizualnych:** efekt jest pomijany, gra działa normalnie, napisy pozostają czytelne i gracz nie widzi komunikatu o błędzie. Wszystkie wspierane przeglądarki obsługują potrzebne efekty, więc ten przypadek jest oceniany ręcznie.

## Poza zakresem

- Zmiana reguł gry, rozmiaru planszy (zostaje 9×9), punktacji, dźwięków i zapisywanych danych.
- Zmiana wyglądu, kształtu albo kolorów kulek na planszy i w podglądzie (błyszczące kule 3D, nowa paleta).
- Prawdziwe zniekształcenie obrazu (wygięcie planszy i napisów).
- Obudowa telewizora albo automatu, widok pokoju, joystick, napisy typu „INSERT COIN”.
- Animacja tytułu, kaskady kul i efektu ekranu: migotanie, przesuwające się linie, spadające kule.
- Wyłącznik efektu ekranu, przełącznik motywów, motyw jasny.
- Nowe przyciski, panele i napisy; zmiana brzmienia napisów innych niż tytuł.
- Ekran o stałych proporcjach 4:3 z czernią po bokach szerokiego okna.
- Lista wielu najlepszych wyników.
- Telefony, tablety, dotyk, klawiatura, małe okna.
- Osobna grafika promocyjna albo makieta; wynikiem jest wygląd samej gry.
- Własna poświata albo cień kulek planszy i podglądu.
- Wybór sposobu wykonania efektów; to decyzja architekta, o ile spełnione są wymagania testowalności.

## Etapy dostarczenia

Etapy mogą powstać w dowolnej kolejności; każdy daje widoczną zmianę i działa bez pozostałych. S21 obowiązuje w całości po każdym z nich. Kryteria, które odwołują się do wyniku innego etapu, sprawdza się w stanie istniejącym w chwili wdrożenia; komplet kryteriów S17–S20 musi być spełniony po wdrożeniu wszystkich trzech etapów.

1. **Etap 1, nowy układ:** tytuł nad planszą po lewej, kolumna boczna, okna w kolumnie bocznej, kolory siatki planszy. Realizuje S17. Działa z dotychczasowym tytułem (wygląd i brzmienie „Kulki”) i dotychczasowym efektem CRT.
2. **Etap 2, neonowy tytuł i kaskada kul:** brzmienie „KULKI”, wygląd tytułu i dekoracja z kul. Realizuje S18 i S19. Tylko ten etap zmienia brzmienie tytułu i związane z nim testy. Działa w układzie, który istnieje w chwili wdrożenia: kryteria o niezachodzeniu na planszę, panele, przyciski i okna sprawdza się w tym układzie.
3. **Etap 3, wypukły ekran kineskopu:** krawędź ekranu, odblask szkła, wyraźniejsze linie i mocniejsza poświata. Realizuje S20. Kryterium o kulach kaskady wewnątrz krawędzi ekranu dotyczy kul tylko wtedy, gdy etap 2 jest już wdrożony; jeśli etap 3 powstaje pierwszy, to kryterium sprawdza etap 2.

## Założenia

Decyzje właściciela z wywiadu (nie są założeniami): opis to docelowy wygląd gry; plansza zostaje 9×9; zmieniamy sam ekran, bez obudowy i pokoju; wypukłość jest złudzeniem; kulki gry zostają jak dziś; tytuł czcionką gry, nieruchomy; kule kaskady wyglądają jak kulki gry; okna w kolumnie bocznej; tytuł na ekranie brzmi „KULKI”, a nazwa karty przeglądarki zostaje „Kulki”; ekran wypełnia całe okno przeglądarki.

Poniższe decyzje podjął analityk, wybierając opcję najprostszą i najłatwiej odwracalną; są do potwierdzenia przy zatwierdzaniu specyfikacji.

- Opis jest wzorem nastroju i układu, a nie makietą co do piksela, bo powstał jako opis obrazu, a nie projekt ekranu; zgodność z nim ocenia właściciel w kryteriach [ręcznie].
- Wynik 20, najlepszy wynik 188, układ kulek i kolory w podglądzie z opisu są przykładowym stanem gry, bo zależą od rozgrywki.
- Opis wymienia 6 kolorów kulek na planszy; gra zachowuje 7 dotychczasowych, bo właściciel zdecydował, że kulki zostają jak dziś.
- Kaskada ma od 7 do 30 kul, co najmniej 3 rozmiary i każdy z 7 kolorów, bo to najmniejsze liczby, przy których dekoracja jest „kaskadą kolorowych kul”, a górna granica chroni czytelność tytułu.
- Kaskada jest zawsze taka sama i nie korzysta z losowania gry, bo kolejność losowań gry jest chronionym kontraktem testowym.
- Kule kaskady nie zachodzą na prostokąt liter tytułu, bo tytuł musi pozostać czytelny, a jego kontrast liczony jest względem jednolitego tła.
- Linie skanowania przyciemniają obraz o 20–40%, a poświata napisów ma co najmniej 4 piksele, bo to wyraźnie więcej niż dziś (12% i 3 piksele), a górna granica chroni czytelność; ostateczną siłę efektu ocenia właściciel.
- Narożniki ekranu mają promień co najmniej 2% krótszego boku okna, bo mniejsze zaokrąglenie byłoby niewidoczne.
- Poświata tytułu jest co najmniej 2 razy większa od poświaty zwykłych napisów, bo tytuł ma wyglądać jak neon i wyróżniać się na tle reszty.
- Kulki planszy i podglądu nie dostają własnej poświaty, bo właściciel zdecydował, że kulki zostają jak dziś.
- Brzmienie „KULKI” wprowadza etap 2 razem z nowym wyglądem tytułu, bo dzięki temu pozostałe etapy nie dotykają chronionych tekstów.
- Linie siatki planszy mają kontrast co najmniej 3:1 względem tła pól, bo to powszechnie przyjęty próg widoczności elementów graficznych.
- Litery tytułu są co najmniej 2 razy większe od liczby wyniku, bo opis mówi o „dużym, efektownym” tytule, a dziś oba napisy mają ten sam rozmiar.
- Poza krawędzią ekranu jest jednolita czerń, bo właściciel zrezygnował z obudowy telewizora i widoku pokoju.
- Efektu ekranu nie da się wyłączyć, bo tak ustalono dla efektu CRT, a wyłącznik oznaczałby nowe ustawienie i nową zapisywaną daną.
- Wygląd jest sprawdzany przy 1024×768 i 1920×1080, bo pierwsze to najmniejsze wspierane okno, a drugie najpopularniejszy rozmiar ekranu komputera.
- Jedna specyfikacja z trzema niezależnymi etapami, bo wszystkie zmiany składają się na jeden obraz opisany przez właściciela.

## Sekcje techniczne

> Uzupełnia architekt po zatwierdzeniu specyfikacji: architektura, model danych, kontrakty API, plan implementacji.
