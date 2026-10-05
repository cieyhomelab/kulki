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

Decyzje i ich uzasadnienie: [ADR 0004](../../docs/adr/0004-ekran-kineskopu-neonowy-tytul-i-nowy-uklad.md). Stos się nie zmienia ([ADR 0001](../../docs/adr/0001-stos-technologiczny.md)); nie dochodzi zależność, usługa ani krok budowania. Zasady pracy w repozytorium: [AGENTS.md](../../AGENTS.md). Ten rozdział rozszerza sekcje techniczne [specyfikacji gry](2026-10-04-gra-w-kulki.md) i [specyfikacji wyglądu retro](2026-10-05-podskakujaca-kulka-i-wyglad-retro.md); wszystko, czego tu nie zmieniono, obowiązuje dalej.

### Architektura

Zmiany dotyczą wyłącznie warstwy interfejsu: `src/ui/app.js`, nowy `src/ui/cascade.js`, `src/ui/texts.js` (jeden napis), `src/styles.css` i `src/index.html`. Logika gry (`src/game/`), zapis (`src/storage/`), dźwięk (`src/audio/`), interfejs testowy (`src/test-api.js`), budowanie (`tools/`), Compose, skrypty i workflow pozostają bez zmian. Wszystko jest zrobione w CSS i DOM: bez obrazów, SVG i `<canvas>`.

**Komponenty**

| Komponent | Miejsce | Odpowiedzialność | Etap |
|---|---|---|---|
| Blok tytułu | `src/ui/app.js`, `src/styles.css` | element `hero` obejmujący tytuł; miejsce na kaskadę | krok W |
| Układ | `src/ui/app.js`, `src/styles.css` | siatka: blok tytułu, plansza, kolumna boczna `sidebar`; okna w kolumnie; kolory siatki planszy | 1 |
| Tytuł | `src/ui/texts.js`, `src/index.html`, `src/styles.css` | brzmienie „KULKI”, wypełnienie, obrys, głębia, poświata | 2 |
| Kaskada kul | `src/ui/cascade.js` (nowy), `src/styles.css` | stała tablica kul i zbudowanie z niej elementów | 2 |
| Ekran kineskopu | `src/index.html`, `src/styles.css` | krawędź ekranu i czerń poza nią na `crt`, odblask `crt-glare`, mocniejsze linie i poświata | 3 |

**Struktura DOM po wdrożeniu wszystkich etapów**

```
body
├─ main#app [app]                       siatka: 2 kolumny, 2 wiersze
│  ├─ [hero]                            wiersz 1; stałe wymiary
│  │  ├─ h1 [title]                     „KULKI”
│  │  └─ [cascade] aria-hidden          kule [cascade-ball] × N
│  ├─ [board]                           wiersz 2, kolumna 1
│  └─ [sidebar]                         wiersz 2, kolumna 2; stała szerokość, wyrównana do góry
│     ├─ [score-panel]
│     ├─ [best-score-panel]
│     ├─ [preview]
│     ├─ [new-game]
│     ├─ [sound-toggle]
│     └─ [confirm-dialog] / [game-over] gdy widoczne
├─ [crt] aria-hidden                    ekran: linie, winieta, krawędź, czerń poza nią
└─ [crt-glare] aria-hidden              odblask szkła
```

W nawiasach kwadratowych są wartości `data-testid`. Klasy CSS i zagnieżdżenie pomocniczych elementów nie są kontraktem. Kolejność elementów z napisami w DOM daje tę samą kolejność widocznego tekstu co dotąd (plansza i kaskada nie mają tekstu).

**Blok tytułu (krok W).** `h1` dostaje opakowanie: element z `data-testid="hero"`. W kroku W blok niczego nie zmienia na ekranie (przejmuje od `h1` rolę elementu paska, tytuł wygląda i leży jak dotąd). Krok istnieje po to, żeby etap 1 mógł ustawić blok w siatce, a etap 2 wypełnić go kaskadą, bez czekania na siebie nawzajem.

**Układ (etap 1).** `#app` staje się siatką CSS o dwóch kolumnach i dwóch wierszach.

1. Wiersz 1 zajmuje blok tytułu, wyrównany do lewej krawędzi planszy. Wiersz 2: plansza w kolumnie 1, kolumna boczna w kolumnie 2.
2. Kolumna boczna to nowy element `sidebar`: kolumna flex o stałej szerokości (zmienna `--sidebar-width`), wyrównana do górnej krawędzi planszy (`align-self: start`). Zawiera kolejno: panel wyniku, panel najlepszego wyniku, panel podglądu, „Nowa gra”, przycisk dźwięku. Panele wyniku przenoszą się w DOM z paska do kolumny; dotychczasowy pasek i dotychczasowa kolumna przycisków znikają jako elementy pomocnicze.
3. Okna (`confirm-dialog`, `game-over`) są wstawiane jako ostatnie dziecko `sidebar`, czyli pod przyciskiem dźwięku. Układają swoją treść w pionie i łamią napisy do szerokości kolumny; żaden napis nie jest ucinany.
4. Wysokość wiersza 2 wyznacza plansza, a szerokość kolumny bocznej jest stała. Dlatego pojawienie się i zniknięcie okna nie przesuwa ani nie zmienia rozmiaru żadnego innego elementu. Kolumna z najwyższym oknem (koniec gry z rekordem) jest niższa od planszy przy 1024×768.
5. Gra leży pośrodku okna (`body` nadal centruje `#app`). Zmienna `--cell` odlicza od wysokości okna wysokość bloku tytułu, odstęp i margines bezpieczeństwa od krawędzi okna (co najmniej 24 px z każdej strony, żeby elementy nie wpadały w zaokrąglone rogi ekranu), a od szerokości okna szerokość kolumny bocznej i odstęp. Górna granica 64 px zostaje.
6. Kolory planszy: linie siatki to tło planszy widoczne w odstępach między polami oraz ramka pól. Zmienne `--board-bg` i `--cell-border` dostają jasny niebieski, `--cell-bg` ciemny granat. Wymagane: składowa niebieska największa w obu, jasność względna tła pól ≤ 0,05, kontrast linii do tła pól ≥ 3:1. Liczby wyniku zostają w `--neon-yellow`.

Budżet miejsca przy 1024×768 (czcionka gry ma znaki szerokości 1 em, więc da się to policzyć): plansza 9 × 64 + 20 = 596 px; kolumna boczna około 230 px (najdłuższy napis przycisku „Dźwięk: wyciszony” to 136 px, sześciocyfrowy wynik 144 px); odstęp 24 px; razem około 850 px szerokości. Wysokość: blok tytułu do 104 px, odstęp 12 px, plansza 596 px, razem około 712 px. Kolumna boczna z komunikatem o rekordzie ma około 470 px.

**Tytuł (etap 2).** Jeden element `h1` z jednym węzłem tekstu.

1. Brzmienie: `TEXTS.title` zmienia się na `KULKI`; napis zastępczy `<h1>` w `src/index.html` także. `<title>` strony zostaje `Kulki`. `text-transform` pozostaje zabronione.
2. Prostokąt liter: `h1` ściśle obejmuje napis (`width: fit-content`, `line-height: 1`, `margin`, `padding` i `border` równe 0 po stronie, od której mierzą testy). Rozmiar czcionki: zmienna `--font-title`, wielokrotność 8 px, co najmniej 2 × `--font-large`; proponowane 48 px (napis 240 × 48 px).
3. Wypełnienie: `color: var(--title-fill)`, jasny niebieski o kontraście co najmniej 4,5:1 do `--page-bg` (np. `#3d8bff`, kontrast około 5,9:1).
4. Obrys: `-webkit-text-stroke: var(--title-stroke-width) var(--title-stroke-color)` oraz `paint-order: stroke fill`. Kolor żółty, grubość 2–4 px.
5. Głębia i poświata: jedna deklaracja `text-shadow`. Warstwy głębi mają rozmycie 0 i dodatnie przesunięcia w poziomie i w pionie (kilka warstw co 1–2 px aż do `--title-depth-offset`), kolor `--title-depth-color` ciemniejszy od wypełnienia. Warstwa poświaty ma przesunięcie 0, rozmycie `--title-glow-blur` (co najmniej 16 px) i kolor `--title-glow-color` (żółty). Deklaracja zastępuje poświatę dziedziczoną z `body`.
6. Wartości `--title-*` są w `:root` zwykłymi kolorami i długościami, bez `color-mix`, żeby styl obliczony zwracał `rgb(…)` i piksele w każdym silniku.
7. Tytuł nie ma animacji ani `transition`, nie ma pseudoelementów z treścią i nie ma powielonych napisów.

**Kaskada kul (etap 2).** Nowy moduł `src/ui/cascade.js` zawiera zamrożoną tablicę `CASCADE_BALLS` i funkcję `buildCascade(doc)`.

1. Blok `hero` ma `position: relative` i stałe wymiary ze zmiennych `--hero-width` i `--hero-height`: najwyżej 352 × 104 px. Taki blok mieści się nad planszą w nowym układzie i w dotychczasowym pasku obok paneli wyniku, więc etap 2 działa w każdym z nich. Tytuł ma w bloku stałe położenie.
2. `buildCascade` tworzy kontener `cascade` (`aria-hidden="true"`, bez tekstu) i po jednym elemencie `cascade-ball` na wpis tablicy, w kolejności tablicy. Każda kula ma `data-color` (1–7) oraz zmienne `--x`, `--y`, `--size` ustawione w atrybucie `style`; CSS ustawia z nich `left`, `top`, `width`, `height` przy `position: absolute` względem bloku.
3. Wypełnienie: selektor kuli kaskady zostaje dopisany do istniejącej reguły wypełnienia kulek (`border-radius: 50%` i `radial-gradient` ze zmienną `--ball`). Nie powstaje druga kopia gradientu. Kula kaskady nie ma klasy `ball`, więc reguła podskakiwania jej nie dotyczy.
4. Kule leżą w całości w bloku `hero` i poza prostokątem liter powiększonym o obrys i głębię. Mogą zachodzić na siebie nawzajem.
5. Moduł nie importuje `rng` i nie używa `Math.random`, czasu ani `localStorage`. Kaskada powstaje raz przy starcie i żadna funkcja rysująca (`render`, animacje, `setState`) jej nie dotyka.
6. Kule i tytuł nie mają obsługi kliknięć. Kaskada zachowuje domyślne `pointer-events`, żeby test mógł kliknąć kulę; kliknięcie niczego nie zmienia, bo gra reaguje tylko na pola i przyciski. Kursor nad kulą pozostaje domyślny.

**Ekran kineskopu (etap 3).** Ekranem jest istniejący element `crt`.

1. Krawędź ekranu: `border-radius: var(--crt-edge-radius)` na `crt`, jedna wartość dla czterech narożników, w jednostkach `vmin` (proponowane `4vmin`; wymagane co najmniej 2% krótszego boku okna). Narożniki są kołowe, nie eliptyczne, żeby styl obliczony zwracał jedną długość.
2. Czerń poza ekranem: zewnętrzny `box-shadow` elementu `crt` z rozmyciem 0, rozszerzeniem `100vmax` i kolorem `--crt-outside-color` (`#000`). Zamalowuje rogi okna poza zaokrągleniem. Dodatkowa warstwa `inset` może przyciemniać brzegi szkła.
3. Linie skanowania: nowa zmienna `--crt-scanline-alpha` (liczba z przedziału 0,2–0,4; proponowane 0,3). Kolor linii to `rgb(0 0 0 / var(--crt-scanline-alpha))`, przerwa to `transparent`. Gradient linii pozostaje pierwszym z `repeating-linear-gradient` w tle `crt`.
4. Poświata napisów: `--crt-glow-blur` rośnie do co najmniej 4 px. Reguła `text-shadow` na `body` zostaje jedynym źródłem poświaty podpisów i napisów przycisków.
5. Odblask szkła: nowy pusty element `<div data-testid="crt-glare" aria-hidden="true">` w szablonie, bezpośrednio po `crt`, jako dziecko `body` (nie `crt`, który pozostaje pusty, i nie `#app`, którego zawartość interfejs podmienia). CSS: `position: fixed`, położenie i rozmiar w procentach okna tak, żeby cały prostokąt leżał wewnątrz krawędzi ekranu, `pointer-events: none`, `z-index` nad grą, tło z nieruchomego gradientu przechodzącego w przezroczystość.
6. Winieta zostaje (`radial-gradient` w tle `crt`); może być mocniejsza.
7. `crt` i `crt-glare` nie mają animacji ani `transition`. Na `#app`, planszy i ich przodkach nie ma `transform`, `filter`, `perspective` ani `backdrop-filter`: treść gry nie jest zniekształcana ani przerysowywana przez efekt.

**Budowanie i publikacja.** Bez zmian. Plik gry rośnie o kilka kilobajtów. Budowanie pozostaje powtarzalne. Sprawdzenia po publikacji (P1, P2, P4) nie czytają tytułu ani układu.

### Model danych

Bez zmian. Nie dochodzi żaden klucz `localStorage` ani pole w istniejących; klucze `kulki.game.v1`, `kulki.best.v1` i `kulki.sound.v1` zachowują kształt i znaczenie, więc dane zapisane przez poprzednią wersję są czytane bez migracji (S21). Kaskada jest stałą w kodzie, nie daną. Specyfikacja nie oznacza żadnych danych jako osobowe.

### Kontrakty API

Gra nadal nie ma API sieciowego. **Interfejs testowy `window.__kulki` się nie zmienia:** te same cztery metody, te same pola `getState()`, ta sama kolejność losowań. Wszystkie nowe informacje dla testów są w DOM i w stylach obliczonych. Poniższe pozycje są dodatkami do kontraktu DOM z wcześniejszych specyfikacji i po wdrożeniu są chronione ([BACKWARD_COMPATIBILITY.md](../../BACKWARD_COMPATIBILITY.md)). Istniejące identyfikatory zostają na swoich elementach i nie zmieniają znaczenia.

#### Nowe identyfikatory

| Element | `data-testid` | Uwagi | Od |
|---|---|---|---|
| Blok tytułu | `hero` | zawiera `title`, od etapu 2 także `cascade`; dziecko `app` | W |
| Kolumna boczna | `sidebar` | zawiera `score-panel`, `best-score-panel`, `preview`, `new-game`, `sound-toggle` i widoczne okno, w tej kolejności | 1 |
| Kaskada | `cascade` | `aria-hidden="true"`, bez tekstu; dziecko `hero` | 2 |
| Kula kaskady | `cascade-ball` | wiele elementów (7–30); `data-color="1"`…`"7"`; dziecko `cascade` | 2 |
| Odblask szkła | `crt-glare` | pusty, `aria-hidden="true"`, dziecko `body` | 3 |

Kule kaskady są odróżnialne od kulek gry po identyfikatorze: kulki planszy to `ball-{wiersz}-{kolumna}`, kulki podglądu to `preview-ball`. Atrybut `data-color` kuli kaskady ma to samo znaczenie co na polu, ale nigdy nie ma wartości `0` i nigdy się nie zmienia.

#### Co testy odczytują: układ (S17)

| Kryterium | Odczyt |
|---|---|
| położenie tytułu, planszy, paneli, przycisków, okien | `getBoundingClientRect()` elementów `title`, `board`, `score-panel`, `best-score-panel`, `preview`, `new-game`, `sound-toggle`, `confirm-dialog`, `game-over` |
| szerokość pola | `getBoundingClientRect()` elementu `cell-0-0` |
| okno w kolumnie bocznej | okno jest ostatnim dzieckiem `sidebar`; jego prostokąt leży pod `sound-toggle` i w poziomie w granicach `sidebar` |
| ostatni element kolumny w oknie | dolna krawędź ostatniego dziecka `sidebar` ≤ wysokość okna |
| okno niczego nie przesuwa | prostokąty pozostałych elementów identyczne przed pojawieniem się okna i po nim |
| brak przewijania i uciętych napisów | jak w testach S14: `scrollWidth`/`scrollHeight` dokumentu i elementów z napisami |
| kolor linii siatki | `background-color` elementu `board` oraz `border-color` pól; oba muszą spełniać kryterium |
| kolor tła pól | `background-color` pola |
| gra pośrodku | lewa krawędź `board` i prawa krawędź `sidebar` względem szerokości okna |
| kolejność napisów | `innerText` elementu `body`, jak w istniejącym teście S1 |

#### Co testy odczytują: tytuł (S18)

| Kryterium | Odczyt ze stylu obliczonego albo DOM elementu `title` |
|---|---|
| tekst | `textContent` równe `KULKI`; `document.title` równe `Kulki` |
| czcionka gry | jak w S14 (pomocnik `tests/e2e/helpers/font.js`) |
| rozmiar liter | `font-size` tytułu ≥ 2 × `font-size` elementu `score` |
| prostokąt liter | `getBoundingClientRect()` |
| wypełnienie | `color` |
| obrys | `-webkit-text-stroke-color` i `-webkit-text-stroke-width` (przez `getPropertyValue`); grubość > 0 |
| głębia | warstwy `text-shadow` z rozmyciem `0px` i obydwoma przesunięciami dodatnimi; ich kolor ciemniejszy (mniejsza jasność względna) od `color` |
| poświata | warstwy `text-shadow` z rozmyciem > 0; kolor żółty; rozmycie ≥ 2 × rozmycie `text-shadow` elementu `score-label` |
| tło pod tytułem | `background-color` najbliższego przodka z nieprzezroczystym tłem (pomocnik `tests/e2e/helpers/contrast.js`) |
| zasięg tytułu | prostokąt liter powiększony z każdej strony o grubość obrysu i promień poświaty, a w prawo i w dół dodatkowo o największe przesunięcie głębi |
| jeden nagłówek | `innerText` strony zawiera `KULKI` raz; w drzewie dostępności jest jeden nagłówek poziomu 1 o tej nazwie; `title` ma jeden węzeł tekstu i nie ma pseudoelementów z treścią |
| brak animacji | `getAnimations()` tytułu puste; `transition-duration` równe `0s` |

#### Co testy odczytują: kaskada (S19)

| Kryterium | Odczyt |
|---|---|
| liczba i kolory | liczba elementów `cascade-ball`; zbiór wartości `data-color` |
| rozmiar i położenie | `getBoundingClientRect()` każdej kuli; szerokość równa wysokości |
| okrągłość | `border-radius` równe `50%` |
| identyczne wypełnienie | `background-image` kuli równe `background-image` elementu `ball-{w}-{k}` na polu z tym samym `data-color` |
| nie zachodzi na inne elementy | prostokąt kuli rozłączny z prostokątami `title`, `board`, paneli, przycisków i okien; w całości w oknie |
| identyczność między otwarciami i ruchami | lista (`data-color`, prostokąt) wszystkich kul, porównywana w całości |
| brak napisu i dostępności | `cascade` ma `aria-hidden="true"` i pusty `textContent`; drzewo dostępności nie zawiera kul |
| brak animacji | `getAnimations()` każdej kuli puste, także gdy podskakuje kulka planszy |
| kliknięcie nic nie zmienia | `getState()`, `getSoundLog()` oraz `data-selected` i `data-bouncing` pól przed kliknięciem i po nim |

#### Co testy odczytują: ekran (S20)

| Kryterium | Odczyt |
|---|---|
| obszar efektu | `getBoundingClientRect()` elementu `crt` równe oknu (jak w S15) |
| promień krawędzi | `border-top-left-radius` i trzy pozostałe elementu `crt`, w pikselach, każdy ≥ 2% krótszego boku okna |
| czerń poza ekranem | piksel w każdym z czterech rogów zrzutu ekranu; jasność względna ≤ 0,01 |
| element wewnątrz krawędzi | każdy z czterech narożników prostokąta elementu leży wewnątrz zaokrąglonego prostokąta `crt` (dla narożnika w kwadracie o boku równym promieniowi przy rogu okna: odległość od środka łuku ≤ promień) |
| odblask | element `crt-glare` istnieje, jego prostokąt ma dodatnie wymiary i wszystkie narożniki wewnątrz krawędzi ekranu; `textContent` pusty; `aria-hidden="true"`; `background-image` różne od `none` |
| brak przechwytywania kliknięć | `pointer-events: none` na `crt` i `crt-glare`; kliknięcia testów działają |
| siła linii skanowania | `--crt-scanline-alpha` z `:root` w przedziale 0,2–0,4; `background-image` elementu `crt` zawiera `repeating-linear-gradient` z kolorem czarnym o tej przezroczystości i z kolorem w pełni przezroczystym |
| poświata napisów | rozmycie `text-shadow` elementów `score-label`, `best-score-label`, `preview-label`, `new-game`, `sound-toggle` ≥ 4 px |
| pola niezniekształcone | prostokąty 81 pól: kwadraty tego samego rozmiaru (±1 px), wspólne krawędzie w wierszach i kolumnach |
| brak animacji | `document.getAnimations()` puste; dwa kolejne zrzuty ekranu identyczne (jak w S15) |
| motyw i ograniczony ruch | zrzuty ekranu identyczne przy `colorScheme: 'light'` i `'dark'` oraz przy `reducedMotion: 'reduce'` i `'no-preference'` |

#### Zmienne CSS w `:root`

| Zmienna | Znaczenie | Wymaganie | Etap |
|---|---|---|---|
| `--sidebar-width` | szerokość kolumny bocznej | stała długość w px | 1 |
| `--hero-width`, `--hero-height` | wymiary bloku tytułu | najwyżej 352 × 104 px | 2 |
| `--font-title` | rozmiar liter tytułu | wielokrotność 8 px, ≥ 2 × `--font-large` | 2 |
| `--title-fill` | wypełnienie liter | niebieski; kontrast ≥ 4,5:1 do `--page-bg` | 2 |
| `--title-stroke-color`, `--title-stroke-width` | obrys | żółty; > 0 px | 2 |
| `--title-depth-color`, `--title-depth-offset` | głębia | ciemniejszy od wypełnienia; > 0 px | 2 |
| `--title-glow-color`, `--title-glow-blur` | poświata tytułu | żółty; ≥ 16 px | 2 |
| `--crt-edge-radius` | promień krawędzi ekranu | w `vmin`, ≥ `2vmin` | 3 |
| `--crt-outside-color` | kolor poza ekranem | `#000` | 3 |
| `--crt-scanline-alpha` | przezroczystość ciemnej linii | liczba 0,2–0,4 | 3 |
| `--crt-glow-blur` (istniejąca) | promień poświaty napisów | ≥ 4 px | 3 |

„Niebieski” znaczy: składowa niebieska koloru jest największa. „Żółty”: składowe czerwona i zielona są obie większe od niebieskiej. Zmienne `--c1`…`--c7` zachowują wartości.

#### Moduł `src/ui/cascade.js`

```js
/**
 * @typedef {object} CascadeBall
 * @property {1|2|3|4|5|6|7} color numer koloru kulki gry
 * @property {number} size średnica w pikselach
 * @property {number} x lewa krawędź w pikselach względem bloku tytułu
 * @property {number} y górna krawędź w pikselach względem bloku tytułu
 */

/** @type {ReadonlyArray<Readonly<CascadeBall>>} zamrożona, zawsze ta sama */
export const CASCADE_BALLS = Object.freeze([]);

/**
 * @param {Document} doc
 * @returns {HTMLElement} kontener `cascade` z jednym elementem `cascade-ball` na wpis tablicy
 */
export function buildCascade(doc) {}
```

Niezmienniki tablicy, sprawdzane jednostkowo: od 7 do 30 wpisów; każdy kolor od 1 do `COLOR_COUNT` co najmniej raz; co najmniej 3 różne wartości `size`; `size`, `x`, `y` to nieujemne liczby całkowite; tablica i wpisy są zamrożone. `buildCascade` nie czyta niczego poza tablicą.

**Walidacja wejścia gracza.** Bez zmian: jedynym wejściem są kliknięcia pól i przycisków. Kliknięcie tytułu, kuli kaskady, pustego miejsca, odblasku albo krawędzi ekranu nie ma obsługi i niczego nie zmienia.

### Integracje

Brak. Nie ma dostawcy, trybu atrapy ani sekretów. Zależności od środowiska to wyłącznie funkcje CSS obecne we wszystkich wspieranych przeglądarkach: siatka CSS, `-webkit-text-stroke`, `paint-order` dla tekstu, jednostki `vmin` i `vmax`. Gdy przeglądarka którejś nie obsługuje, pomija deklarację: tytuł zostaje bez obrysu albo ekran bez zaokrąglenia, a gra działa normalnie.

### Plan implementacji

Każdy krok kończy się przechodzącą bramką walidacji i zostawia działającą aplikację. Testy E2E trafiają do `tests/e2e/s<numer>-<nazwa>.spec.js`; tytuł testu zaczyna się od numeru scenariusza. Kryteria `[ręcznie]` nie mają testu i zostają do akceptacji właściciela; w PR opisuje się, jak je obejrzeć (zrzut ekranu przy 1024×768 i 1920×1080).

Istniejące testy: asercji S1–S13 nie wolno zmieniać, poza oczekiwanym brzmieniem tytułu w kroku 2.1. Asercje S14–S16 wolno zmienić tylko wtedy, gdy są sprzeczne ze zmianami z sekcji „Zmiany względem wcześniejszych specyfikacji”; każdą taką zmianę wymienia się w opisie PR z numerem wiersza tabeli, z którego wynika. Przy pisaniu tego planu istniejące testy S1, S14 i S15 zostały przejrzane pod kątem układu, kolorów i siły efektu: żadna asercja nie zależy od położenia paneli w pasku, od położenia okien pod planszą, od koloru tytułu ani od dotychczasowych wartości 12% i 3 px. Testy S14 o mieszczeniu się w oknie i niezasłanianiu planszy przez okna pozostają prawdziwe w nowym układzie. Oczekiwany wynik: poza krokiem 2.1 żadna istniejąca asercja się nie zmienia.

**Zależności między etapami**

| Etap | Zależy od | Uwagi |
|---|---|---|
| Krok wspólny W | nic | mała zmiana bez widocznego skutku |
| 1. Nowy układ (S17) | W | działa z dotychczasowym tytułem i efektem CRT |
| 2. Neonowy tytuł i kaskada (S18, S19) | W | działa w dotychczasowym i w nowym układzie |
| 3. Wypukły ekran (S20) | nic | dotyka tylko szablonu, bloku CRT w arkuszu i zmiennych `--crt-*` |
| Krok R (S21) | nic | testy regresji; równolegle z etapami |

Etapy 1, 2 i 3 nie zależą od siebie. Kryteria odwołujące się do wyniku innego etapu sprawdza etap wdrażany później, zgodnie z sekcją „Etapy dostarczenia”; wskazują to kroki 1.3, 2.4 i 3.3.

#### Krok wspólny W

| Krok | Zakres | Testy | Zależy od |
|---|---|---|---|
| W | Element `hero` jako opakowanie `h1` w `src/ui/app.js`; w CSS przejmuje położenie tytułu w pasku; wygląd bez zmian | integracyjny: `hero` jest dzieckiem `app` i zawiera `title`; komplet istniejących testów przechodzi bez zmian | |

#### Etap 1: nowy układ (S17). Zależy od W

| Krok | Zakres | Testy | Zależy od |
|---|---|---|---|
| 1.1 | Siatka `#app`; element `sidebar`; panele wyniku w kolumnie bocznej; `--sidebar-width`; nowe wyliczenie `--cell`; gra pośrodku | integracyjny: `sidebar` zawiera pięć elementów w wymaganej kolejności; E2E S17: tytuł nad planszą i przy jej lewej krawędzi, pięć elementów na prawo od planszy w kolejności i bez zachodzenia, górna krawędź panelu wyniku, 81 pól 9×9, brak przewijania i uciętych napisów przy 1024×768 i 1920×1080, gra pośrodku przy 1920×1080, kolejność napisów | W |
| 1.2 | Okna jako ostatnie dziecko `sidebar`; układ pionowy treści okien; pojawienie się okna niczego nie przesuwa | integracyjny: okno jest ostatnim dzieckiem `sidebar`; E2E S17: pytanie i komunikat o rekordzie pod przyciskiem dźwięku, w oknie przeglądarki, bez uciętych napisów, bez zasłaniania pól, paneli i przycisków; prostokąty pozostałych elementów bez zmian po pojawieniu się okna; sześciocyfrowy wynik mieści się w panelu | 1.1 |
| 1.3 | Kolory siatki planszy i tła pól. Jeśli etap 2 jest już wdrożony: kryteria S18 i S19 o niezachodzeniu tytułu i kul na planszę, panele, przyciski i okna w nowym układzie | E2E S17: linie niebieskie i jaśniejsze od tła pól, kontrast ≥ 3:1, tło pól ciemne i niebieskie; liczby wyniku żółte | |

Krok 1.3 nie zależy od 1.1 i 1.2 (zmienia tylko trzy zmienne kolorów) i można go zacząć od razu.

#### Etap 2: neonowy tytuł i kaskada kul (S18, S19). Zależy od W

| Krok | Zakres | Testy | Zależy od |
|---|---|---|---|
| 2.1 | Brzmienie „KULKI”: `TEXTS.title`, napis zastępczy w szablonie; osiem asercji brzmienia tytułu w `s1-ekran-gry`, `s14-czcionka`, `s14-tablica-wynikow` (2), `s15-efekt-crt`, `start-screen` (2), `tests/integration/single-file.test.js` | E2E S18: tekst tytułu `KULKI`, nazwa karty `Kulki`, napis raz w tekście strony i raz jako nagłówek poziomu 1; E2E S21: pozostałe napisy w dotychczasowym brzmieniu | |
| 2.2 | Wygląd tytułu: zmienne `--font-title` i `--title-*`, wypełnienie, obrys, głębia, poświata; stałe wymiary `hero` i położenie tytułu w nim; `--cell` uwzględnia wysokość bloku w układzie istniejącym w chwili wdrożenia | E2E S18: czcionka gry, rozmiar ≥ 2 × liczba wyniku, kolory wypełnienia i obrysu, kontrast do tła, poświata żółta i ≥ 2 × poświata podpisu, warstwa głębi, zasięg w oknie i bez zachodzenia na inne elementy przy 1024×768, brak animacji; testy S14 o mieszczeniu się w oknie nadal przechodzą | W, 2.1 |
| 2.3 | `src/ui/cascade.js` (tablica i `buildCascade`), wstawienie do `hero`, CSS kul, wspólna reguła wypełnienia | jednostkowe: niezmienniki tablicy, `buildCascade` w jsdom daje te same elementy przy każdym wywołaniu; integracyjny: `cascade` w `hero`, `aria-hidden`, bez tekstu; E2E S19: liczba, kolory, rozmiary, okrągłość, wypełnienie identyczne z kulką planszy, położenie względem tytułu i innych elementów (także przy obu oknach), brak napisu i dostępności, identyczność między otwarciami i po ruchu, brak animacji | W |
| 2.4 | Zachowanie wobec kliknięć i losowania. Jeśli etap 3 jest już wdrożony: kule kaskady wewnątrz krawędzi ekranu (kryterium S20) | E2E S19: kliknięcie kuli bez zaznaczenia; kliknięcie kuli, tytułu i pustego miejsca przy podskakującej kulce; dolosowanie zgodne z zadaną sekwencją po ruchu bez zbicia | 2.3 |

Kroki 2.2 i 2.3 są od siebie niezależne w kodzie (2.2: reguły tytułu, 2.3: nowy moduł i reguły kul), ale oba ustalają geometrię bloku `hero`. Wykonuje się je po kolei: 2.2 ustala wymiary bloku i położenie tytułu, 2.3 rozmieszcza kule wokół niego. Gdy etap 2 powstaje przed etapem 1, blok `hero` leży w dotychczasowym pasku, w którym przy 1024×768 ma do dyspozycji około 354 px szerokości; wyższy blok oznacza mniejsze `--cell`, bo okna leżą wtedy jeszcze pod planszą.

#### Etap 3: wypukły ekran kineskopu (S20). Bez zależności

| Krok | Zakres | Testy | Zależy od |
|---|---|---|---|
| 3.1 | Krawędź ekranu i czerń poza nią na `crt`: `--crt-edge-radius`, `--crt-outside-color`; opcjonalne przyciemnienie brzegów | E2E S20: obszar równy oknu przy 1024×768 i 1920×1080, promień narożników, czarne piksele w rogach zrzutu, elementy interfejsu, tytuł i okna wewnątrz krawędzi, 81 pól niezniekształconych, kliknięcia pól w rogach planszy i wszystkich przycisków; istniejące testy S15 przechodzą | |
| 3.2 | Element `crt-glare` w szablonie i jego CSS | integracyjny: `crt-glare` pusty, z `aria-hidden`, dziecko `body`, `crt` nadal pusty; E2E S20: odblask obecny i w granicach ekranu, bez napisu i poza drzewem dostępności, kliknięcia pól pod odblaskiem działają, widoczny przy `file://` bez żądań sieciowych | |
| 3.3 | Siła efektu: `--crt-scanline-alpha`, `--crt-glow-blur` ≥ 4 px. Jeśli etap 2 jest już wdrożony: kule kaskady wewnątrz krawędzi ekranu i poświata tytułu ≥ 2 × poświata podpisu | E2E S20: siła linii, poświata napisów, kontrast napisów ≥ 4,5:1, brak animacji i identyczne zrzuty, ten sam wygląd w motywie jasnym i ciemnym oraz przy ograniczonym ruchu | |

Kroki 3.1–3.3 zmieniają ten sam blok arkusza, więc wykonuje się je po kolei albo w jednym PR.

#### Krok R: gra działa jak dotąd (S21). Bez zależności

| Krok | Zakres | Testy | Zależy od |
|---|---|---|---|
| R | Testy regresji bez zmian w produkcie | E2E S21: kulki planszy i podglądu okrągłe, kolory bazowe `--c1`…`--c7`, odstęp kulki planszy 12% boku pola (±1 px), brak `box-shadow` i `filter` na kulkach; od kliknięcia kulki do zmiany `data-selected` najwyżej 100 ms | |

Pozostałe kryteria S21 mają już testy i nie wymagają nowych: scenariusze S1–S16 (`tests/e2e/`), dane zapisane przez poprzednią wersję (`s16-gra-dziala-jak-dotad`), jeden plik bez zasobów zewnętrznych (`tests/integration/single-file.test.js`), P1, P2 i P4 (`tests/postdeploy/`, w bramce w trybie atrapy). Kryterium o brzmieniu „Kulki” przed etapem 2 spełniają istniejące asercje, dopóki krok 2.1 ich nie zmieni.

#### Wskazówki do testów

- Rozmiar okna: `page.setViewportSize({ width: 1920, height: 1080 })` w teście; konfiguracja Playwrighta zostaje przy 1024×768.
- Przed pomiarem układu, tytułu i kul: `await page.evaluate(() => document.fonts.ready)`.
- Warstwy `text-shadow`: nowy pomocnik `tests/e2e/helpers/shadow.js` rozbija styl obliczony na warstwy (kolor, dwa przesunięcia, rozmycie). Kolor bywa na początku albo na końcu warstwy i może mieć postać `rgb(…)`, `rgba(…)` albo `color(srgb …)` (poświata z `body` używa `color-mix`); przecinki wewnątrz nawiasów nie rozdzielają warstw.
- Geometria ekranu: nowy pomocnik `tests/e2e/helpers/screen.js` sprawdza, czy punkt leży wewnątrz zaokrąglonego prostokąta `crt`.
- Piksele zrzutu ekranu: bez nowej zależności. Zrzut z `page.screenshot()` dekoduje się w przeglądarce: obraz z adresu `data:` narysowany na `<canvas>` utworzonym w teście i odczytany przez `getImageData`. Zakaz `<canvas>` dotyczy produktu, nie testów. Rogi bierze się z wymiarów zdekodowanego obrazu, nie okna: projekt `webkit` robi zrzut w podwójnej gęstości (2048×1536 dla okna 1024×768).
- Gradient linii skanowania: wartości przezroczystości porównywać liczbowo po wyjęciu z `rgba(…)`, nie przez porównanie całego napisu; silniki różnie zapisują pozycje przystanków.
- Kliknięcie pustego miejsca poza grą: `page.mouse.click(x, y)` w punkcie wyliczonym z prostokątów, nie w stałych współrzędnych.
- Brak żądań sieciowych i `file://`: jak w testach S14 i S15 (`page.on('request')`, `E2E_FILE_URL`).
- Motyw i ograniczony ruch: `page.emulateMedia`. Zrzuty ekranu porównuje się tylko w obrębie jednego testu i jednego silnika; nie ma zrzutów wzorcowych w repozytorium.
- Sposób odczytu z tabel „Co testy odczytują” został sprawdzony próbą w Chromium, Firefoksie i WebKicie przy pisaniu tego planu: wszystkie trzy zwracają kolor i grubość obrysu, warstwy `text-shadow` w tej samej kolejności i postaci, promień krawędzi w pikselach (około 30,72 px dla `4vmin` przy 1024×768), przezroczystość linii jako `rgba(0, 0, 0, 0.3)`, identyczne `background-image` dla kul różnej wielkości i czarne piksele w rogach zrzutu; zewnętrzny cień elementu `crt` nie powoduje przewijania.
- Bez stałych opóźnień; przebiegi równoległe z `--workers 2` i własnym `E2E_RUN_ID`.

#### Miejsca wspólne przy pracy równoległej

- `src/styles.css`: zmienia go każdy krok poza R. Etap 1 zmienia reguły układu (`#app`, pasek, kolumna, okna) i trzy zmienne kolorów planszy. Etap 2 zmienia regułę `h1`, dopisuje blok „tytuł i kaskada” oraz jeden selektor do reguły wypełnienia kulek. Etap 3 zmienia wyłącznie blok „efekt CRT” i zmienne `--crt-*`. Wspólna dla etapów 1 i 2 jest tylko zmienna `--cell`: drugi w kolejności uwzględnia w niej wynik pierwszego.
- `src/ui/app.js`: krok W (opakowanie tytułu), 1.1 i 1.2 (budowanie układu, miejsce wstawiania okien), 2.3 (jedno wywołanie `buildCascade`). Dane i budowanie kaskady są w `cascade.js`, żeby w `app.js` została jedna linia.
- `src/index.html`: krok 2.1 (napis zastępczy) i 3.2 (`crt-glare`); różne wiersze.
- `src/ui/texts.js` i asercje brzmienia tytułu: tylko krok 2.1.
- `tests/e2e/helpers/`: nowe pomocniki w nowych plikach (`shadow.js`, `screen.js`), po jednym na temat; istniejących się nie przerabia.
- `src/test-api.js`, `src/game/`, `src/storage/`, `src/audio/`, `tools/`, `scripts/`, Compose i workflow: żaden krok ich nie zmienia.
