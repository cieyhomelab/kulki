# Gra w kulki

## TLDR

Przeglądarkowa gra logiczna dla jednego gracza, inspirowana klasycznymi Color Lines / Kulki 98. Gracz przesuwa kolorowe kulki po planszy 9×9 i układa linie z co najmniej 5 kulek tego samego koloru, które znikają i dają punkty. Gra działa na komputerze, ma interfejs po polsku i mieści się w jednym pliku `index.html`.

## Problem i cel

Właściciel chce mieć kompletną, w pełni grywalną wersję klasycznej gry w kulki, którą da się uruchomić przez otwarcie jednego pliku w przeglądarce, bez instalacji i bez zależności.

Sukces poznamy po tym, że:

- da się rozegrać całą partię od startu do końca gry zgodnie z zasadami opisanymi w scenariuszach,
- wszystkie kryteria akceptacji poniżej są spełnione,
- całość jest jednym plikiem `index.html`, który działa bez połączenia z internetem.

## Użytkownicy i role

Jedna rola: **gracz**. Nie ma kont, logowania ani uprawnień. Gracz może wszystko, co opisują scenariusze. Nie ma roli administratora.

## Zasady gry (wspólne dla scenariuszy)

- Plansza ma 9×9 pól. Na polu leży najwyżej jedna kulka.
- Kulki występują w 7 kolorach. Kolor każdej losowanej kulki jest wybierany losowo, każdy z jednakowym prawdopodobieństwem.
- **Linia** to co najmniej 5 kulek tego samego koloru leżących obok siebie bez przerwy w jednym kierunku: poziomo, pionowo albo po skosie.
- **Droga** to ciąg pustych pól łączący pole kulki z polem docelowym, w którym każde kolejne pole sąsiaduje z poprzednim bokiem (góra, dół, lewo, prawo). Przejście po skosie nie jest drogą.
- **Punktacja jednego zbicia:** 2 punkty za każdą zbitą kulkę oraz dodatkowe 2 punkty za każdą kulkę ponad piątą.
- Gdy jeden ruch albo jedno dolosowanie tworzy kilka linii naraz, znikają wszystkie kulki tych linii i liczy się je razem jako jedno zbicie. Kulka należąca do dwóch linii jest liczona raz. Dotyczy to także linii w różnych kolorach (np. dwie piątki naraz to 10 kulek, czyli 30 punktów).
- **Tura** to ruch gracza razem ze wszystkim, co z niego wynika: zbiciem albo dolosowaniem kulek i ewentualnym zbiciem po dolosowaniu.
- **Trwająca rozgrywka** to każda rozgrywka, która się nie zakończyła, także taka, w której gracz nie wykonał jeszcze żadnego ruchu.
- Jeśli po jakimkolwiek zbiciu plansza jest całkowicie pusta, od razu następuje dolosowanie kulek z podglądu, tak jak po ruchu bez zbicia.

  | Zbite kulki | 5 | 6 | 7 | 8 | 9 | 10 |
  |---|---|---|---|---|---|---|
  | Punkty | 10 | 14 | 18 | 22 | 26 | 30 |

  Dla większej liczby kulek analogicznie: każda kolejna kulka to 4 punkty więcej.

## Scenariusze

### S1: Rozpoczęcie nowej gry

1. Gracz otwiera grę po raz pierwszy albo klika „Nowa gra”.
2. Widzi planszę z 5 kulkami, wynik 0, najlepszy wynik i podgląd 3 następnych kulek.

**Kryteria akceptacji**

- Zakładając, że nie ma zapisanej rozgrywki, gdy gracz otwiera grę, wtedy widzi planszę 9×9 z dokładnie 5 kulkami na różnych polach, wynik 0 oraz podgląd z dokładnie 3 kulkami.
- Zakładając trwającą rozgrywkę, gdy gracz kliknie „Nowa gra”, wtedy widzi pytanie o potwierdzenie, a plansza i wynik pozostają bez zmian do czasu odpowiedzi.
- Zakładając widoczne pytanie o potwierdzenie, gdy gracz potwierdzi, wtedy plansza zawiera dokładnie 5 kulek, wynik wynosi 0, a najlepszy wynik pozostaje bez zmian.
- Zakładając widoczne pytanie o potwierdzenie, gdy gracz zrezygnuje, wtedy pytanie znika, a plansza, wynik i podgląd są takie same jak przed kliknięciem „Nowa gra”.
- Zakładając zakończoną rozgrywkę, gdy gracz kliknie „Nowa gra”, wtedy nowa gra zaczyna się od razu, bez pytania o potwierdzenie.
- Zakładając nową grę, gdy plansza zostanie wyświetlona, wtedy żadne 5 startowych kulek nie tworzy linii, która zniknęłaby bez ruchu gracza (jeśli startowe kulki ułożą linię, losowanie jest powtarzane).
- Zakładając dowolny stan gry, gdy gracz patrzy na ekran, wtedy widzi podpisy „Wynik”, „Najlepszy wynik” i „Następne kulki”, przycisk „Nowa gra” oraz przycisk dźwięku z polskim opisem stanu, a żaden widoczny napis nie jest w innym języku niż polski.

### S2: Przesunięcie kulki

1. Gracz klika kulkę. Kulka zostaje wyraźnie zaznaczona.
2. Gracz klika puste pole, do którego prowadzi droga.
3. Kulka przemieszcza się na to pole pole po polu, najkrótszą drogą (sam wygląd animacji jest oceniany ręcznie).

**Kryteria akceptacji**

- Zakładając, że żadna kulka nie jest zaznaczona, gdy gracz kliknie kulkę, wtedy ta kulka jest wizualnie wyróżniona jako zaznaczona.
- Zakładając zaznaczoną kulkę, gdy gracz kliknie inną kulkę, wtedy zaznaczenie przechodzi na klikniętą kulkę i żadna kulka nie zmienia pola.
- Zakładając zaznaczoną kulkę, gdy gracz kliknie ją ponownie, wtedy zaznaczenie znika.
- Zakładając, że żadna kulka nie jest zaznaczona, gdy gracz kliknie puste pole, wtedy nic się nie zmienia.
- Zakładając zaznaczoną kulkę i puste pole, do którego istnieje droga, oraz że ruch nie tworzy linii, gdy gracz kliknie to pole, wtedy kulka znajduje się na polu docelowym, pole początkowe jest puste, a zaznaczenie znika.
- Zakładając, że trwa animacja ruchu, zbijania albo pojawiania się kulek, gdy gracz klika planszę, wtedy kliknięcia nie zmieniają stanu gry do końca animacji.
- Zakładając wykonany ruch, gdy trwa animacja przemieszczenia, wtedy trwa ona nie dłużej niż 1 sekundę.

### S3: Ruch niemożliwy

1. Gracz zaznacza kulkę i klika puste pole, do którego nie prowadzi żadna droga.
2. Kulka zostaje na miejscu, gracz dostaje sygnał, że ruch jest niemożliwy.

**Kryteria akceptacji**

- Zakładając zaznaczoną kulkę i puste pole, do którego nie istnieje droga, gdy gracz kliknie to pole, wtedy kulka pozostaje na swoim polu, pozostaje zaznaczona, wynik się nie zmienia i nie pojawiają się nowe kulki.
- Zakładając tę samą sytuację, gdy gracz kliknie niedostępne pole, wtedy widzi sygnał wizualny odmowy ruchu, który znika sam najpóźniej po 1 sekundzie.
- Zakładając, że jedynym połączeniem między polem kulki a polem docelowym jest przejście po skosie, gdy gracz kliknie pole docelowe, wtedy ruch jest traktowany jako niemożliwy.

### S4: Zbicie linii i punktacja

1. Gracz przesuwa kulkę tak, że powstaje linia co najmniej 5 kulek jednego koloru.
2. Kulki z linii znikają, wynik rośnie.
3. Po ruchu ze zbiciem nie pojawiają się nowe kulki i gracz wykonuje kolejny ruch.

**Kryteria akceptacji**

- Zakładając 4 kulki jednego koloru w linii poziomej, gdy gracz dostawi piątą tego samego koloru, wtedy wszystkie 5 kulek znika, a wynik rośnie o 10.
- Zakładając analogiczny układ w pionie oraz na każdym z dwóch skosów, gdy gracz dostawi piątą kulkę, wtedy linia znika, a wynik rośnie o 10.
- Zakładając układ, w którym ruch tworzy linię 6, 7, 8 albo 9 kulek, gdy gracz wykona ten ruch, wtedy znikają wszystkie kulki linii, a wynik rośnie odpowiednio o 14, 18, 22 albo 26.
- Zakładając układ, w którym jeden ruch domyka jednocześnie linię poziomą i pionową po 5 kulek ze wspólną kulką (krzyż, razem 9 kulek), gdy gracz wykona ten ruch, wtedy znika wszystkie 9 kulek, a wynik rośnie o 26.
- Zakładając ruch, który tworzy linię tylko 4 kulek, gdy gracz go wykona, wtedy żadna kulka nie znika i wynik się nie zmienia.
- Zakładając ruch zakończony zbiciem, gdy zbicie się zakończy, i na planszy zostaje co najmniej jedna kulka, wtedy nie pojawia się żadna nowa kulka, a podgląd następnych kulek pozostaje taki sam jak przed ruchem.
- Zakładając, że po zbiciu (po ruchu gracza albo po dolosowaniu) plansza jest całkowicie pusta, gdy zbicie się zakończy, wtedy na planszy pojawiają się 3 kulki w kolorach z podglądu, a podgląd pokazuje 3 nowe kulki.

### S5: Dolosowanie kulek i podgląd następnych

1. Gracz wykonuje ruch, który niczego nie zbija.
2. Na losowych pustych polach pojawiają się jednocześnie 3 kulki w kolorach, które pokazywał podgląd. Linie sprawdza się raz, po położeniu wszystkich kulek.
3. Podgląd pokazuje 3 nowe kolory na następną turę.

**Kryteria akceptacji**

- Zakładając co najmniej 3 puste pola po ruchu bez zbicia, gdy ruch się zakończy, wtedy liczba kulek na planszy rośnie dokładnie o 3, a nowe kulki leżą na polach, które były puste.
- Zakładając podgląd pokazujący trzy konkretne kolory, gdy po ruchu bez zbicia pojawią się nowe kulki, wtedy mają dokładnie te kolory.
- Zakładając, że nowe kulki zostały położone, gdy tura się zakończy, wtedy podgląd pokazuje 3 kulki wylosowane na następną turę.
- Zakładając, że dolosowana kulka uzupełnia linię co najmniej 5 kulek jednego koloru, gdy kulki zostaną położone, wtedy linia znika, a wynik rośnie według tej samej punktacji co w S4.
- Zakładając mniej niż 3 puste pola po ruchu bez zbicia, gdy ruch się zakończy, wtedy pojawia się tyle kulek, ile jest pustych pól, w kolejności z podglądu; kulki, które się nie zmieściły, przepadają, a jeśli gra trwa dalej, podgląd pokazuje 3 nowe kulki.
- Zakładając, że dolosowane kulki tworzą jednocześnie dwie linie po 5 kulek w różnych kolorach, gdy kulki zostaną położone, wtedy znika 10 kulek, a wynik rośnie o 30.

### S6: Koniec gry

1. Po dolosowaniu kulek na planszy nie zostaje żadne puste pole.
2. Gracz widzi komunikat o końcu gry ze swoim wynikiem i może zacząć nową grę.

**Kryteria akceptacji**

- Zakładając, że po dolosowaniu kulek i ewentualnym zbiciu linii nie ma żadnego pustego pola, gdy tura się zakończy, wtedy gracz widzi komunikat o końcu gry z wynikiem końcowym.
- Zakładając, że dolosowane kulki zapełniły planszę, ale jednocześnie ułożyły linię, gdy linia zniknie, wtedy gra trwa dalej.
- Zakładając zakończoną grę, gdy gracz klika planszę, wtedy stan planszy i wynik się nie zmieniają.
- Zakładając zakończoną grę, gdy gracz wybierze nową grę z komunikatu końca gry, wtedy rozpoczyna się nowa gra zgodnie z S1.

### S7: Najlepszy wynik

1. Gracz widzi najlepszy wynik obok bieżącego.
2. Gdy bieżący wynik przekroczy najlepszy, najlepszy wynik od razu się aktualizuje.
3. Najlepszy wynik jest pamiętany w tej przeglądarce na tym urządzeniu.

**Kryteria akceptacji**

- Zakładając pierwsze uruchomienie gry w danej przeglądarce, gdy gracz otwiera grę, wtedy najlepszy wynik wynosi 0.
- Zakładając najlepszy wynik 20 i bieżący wynik 14, gdy gracz zbije linię za 10 punktów, wtedy bieżący wynik i najlepszy wynik wynoszą 24.
- Zakładając najlepszy wynik 50 i bieżący wynik 10, gdy gracz zbije linię za 10 punktów, wtedy najlepszy wynik nadal wynosi 50.
- Zakładając najlepszy wynik większy od 0, gdy gracz zamknie i ponownie otworzy grę w tej samej przeglądarce, wtedy najlepszy wynik jest taki sam jak przed zamknięciem.
- Zakładając zakończoną grę, w której gracz pobił najlepszy wynik, gdy pojawia się komunikat o końcu gry, wtedy zawiera on informację o nowym rekordzie; gdy rekord nie został pobity, komunikat takiej informacji nie zawiera.

### S8: Wznowienie gry po odświeżeniu

1. Gracz w trakcie rozgrywki odświeża stronę albo zamyka ją i otwiera ponownie.
2. Gra wraca w tym samym stanie.

**Kryteria akceptacji**

- Zakładając nową grę bez żadnego ruchu, gdy gracz odświeży stronę, wtedy widzi ten sam układ 5 kulek startowych i ten sam podgląd.
- Zakładając trwającą rozgrywkę po co najmniej jednym ruchu, gdy gracz odświeży stronę, wtedy układ kulek na planszy, bieżący wynik i kulki w podglądzie są identyczne jak przed odświeżeniem.
- Zakładając zaznaczoną kulkę, gdy gracz odświeży stronę, wtedy po wznowieniu żadna kulka nie jest zaznaczona.
- Zakładając zakończoną grę, gdy gracz odświeży stronę, wtedy widzi końcowy układ planszy i komunikat o końcu gry z tym samym wynikiem i tą samą informacją o nowym rekordzie (albo jej brakiem).
- Zakładając, że gracz odświeży stronę w trakcie animacji, gdy gra się wznowi, wtedy stan odpowiada zakończonej turze, której dotyczyła animacja.
- Zakładając uszkodzony zapis rozgrywki i poprawny zapis najlepszego wyniku, gdy gracz otworzy grę, wtedy zaczyna się nowa gra zgodnie z S1, najlepszy wynik jest zachowany i nie pojawia się komunikat o błędzie.
- Zakładając wznowioną rozgrywkę, gdy gracz uruchomi i potwierdzi nową grę, wtedy zaczyna się nowa gra zgodnie z S1, a po kolejnym odświeżeniu wraca ta nowa gra, nie poprzednia.

### S9: Dźwięki i wyciszenie

1. Gra odtwarza krótkie dźwięki przy czterech zdarzeniach: przesunięcie kulki, zbicie, odmowa ruchu, koniec gry. Każde zdarzenie odtwarza swój dźwięk w chwili, gdy następuje, więc ruch zakończony zbiciem daje dźwięk przesunięcia, a potem dźwięk zbicia; zbicie po dolosowaniu daje dźwięk zbicia.
2. Gracz może wyciszyć i ponownie włączyć dźwięki przyciskiem.

**Kryteria akceptacji**

- Zakładając pierwsze uruchomienie gry w danej przeglądarce, gdy gracz otwiera grę, wtedy przycisk dźwięku pokazuje stan „włączone”.
- Zakładając włączone dźwięki, gdy nastąpi przesunięcie kulki, zbicie linii, odmowa ruchu albo koniec gry, wtedy gra odtwarza dźwięk przypisany do tego zdarzenia, co widać w rejestrze odtworzonych dźwięków dostępnym dla testów (to, że cztery dźwięki brzmią różnie, jest oceniane ręcznie).
- Zakładając włączone dźwięki, gdy gracz kliknie przycisk wyciszenia, wtedy przycisk pokazuje stan „wyciszone” i kolejne zdarzenia nie odtwarzają żadnego dźwięku (rejestr odtworzonych dźwięków się nie wydłuża).
- Zakładając wyciszone dźwięki, gdy gracz kliknie przycisk ponownie, wtedy przycisk pokazuje stan „włączone” i dźwięki znów są odtwarzane.
- Zakładając zmienione ustawienie dźwięku, gdy gracz odświeży stronę, wtedy ustawienie jest takie samo jak przed odświeżeniem.

## Dane

Gra nie przetwarza danych osobowych. Wszystkie dane są przechowywane wyłącznie w przeglądarce gracza, na jego urządzeniu.

- **Rozgrywka:** układ planszy (dla każdego z 81 pól: puste albo kolor kulki), bieżący wynik, 3 kolory w podglądzie, informacja, czy gra jest zakończona, informacja, czy w tej rozgrywce pobito najlepszy wynik.
- **Najlepszy wynik:** jedna liczba.
- **Ustawienie dźwięku:** włączone albo wyciszone.

## Integracje zewnętrzne

Brak. Gra nie łączy się z żadnym serwerem ani usługą.

## Wymagania niefunkcjonalne

- **Forma dostarczenia (wymaganie właściciela):** jeden plik `index.html` zawierający HTML, nowoczesny CSS i czysty JavaScript. Bez zewnętrznych bibliotek i bez zasobów pobieranych z sieci (czcionki, obrazy i dźwięki też nie mogą być pobierane z zewnątrz).
- **Uruchamianie:** gra działa po otwarciu pliku bezpośrednio z dysku oraz po umieszczeniu na dowolnym hostingu plików statycznych, bez połączenia z internetem. Przy otwarciu z dysku wymagana jest pełna rozgrywka bez błędów; pamiętanie danych między uruchomieniami (S7, S8, ustawienie dźwięku) zależy wtedy od przeglądarki i jest sprawdzane dla gry serwowanej z hostingu.
- **Platforma:** komputer, sterowanie wyłącznie myszą. Aktualne wersje przeglądarek Chrome, Firefox, Edge i Safari.
- **Ekran:** przy oknie 1024×768 i większym cała gra (plansza, wynik, najlepszy wynik, podgląd, przyciski) jest widoczna bez przewijania.
- **Język:** wyłącznie polski.
- **Wydajność:** od kliknięcia do zmiany stanu gry widocznej dla testu (np. zaznaczenia kulki albo rozpoczęcia ruchu) mija najwyżej 100 ms; pojedyncza animacja trwa najwyżej 1 sekundę.
- **Czytelność:** 7 kolorów kulek jest wyraźnie odróżnialnych od siebie i od tła planszy (akceptacja ręczna przez właściciela).
- **Testowalność:** musi istnieć sposób uruchomienia gry w testach z zadanym układem planszy, wynikiem i podglądem oraz z przewidywalnym losowaniem. Testy muszą też móc odczytać: zawartość każdego pola, zaznaczoną kulkę, wynik i najlepszy wynik, podgląd, to, czy trwa animacja, to, czy widoczny jest sygnał odmowy ruchu, oraz rejestr odtworzonych dźwięków z nazwą zdarzenia.
- **RODO:** nie dotyczy, brak danych osobowych i brak przesyłania danych.

## Przypadki brzegowe i błędy

- **Brak drogi do pola:** ruch się nie wykonuje, gracz widzi sygnał odmowy (S3).
- **Mniej niż 3 puste pola przy dolosowaniu:** pojawia się tyle kulek, ile jest miejsca (S5); jeśli potem nie ma pustych pól, gra się kończy (S6).
- **Plansza pusta po zbiciu (po ruchu albo po dolosowaniu):** kulki z podglądu pojawiają się od razu, żeby gracz miał czym grać (S4).
- **Kilka linii naraz:** wszystkie kulki znikają i są liczone razem jako jedno zbicie (S4).
- **Kliknięcia w trakcie animacji:** są ignorowane (S2).
- **Zapis w przeglądarce niedostępny albo uszkodzony:** gra działa normalnie i gracz nie widzi komunikatu o błędzie. Każda z trzech zapisanych danych jest sprawdzana osobno, a niepoprawna albo brakująca przyjmuje wartość domyślną: nowa gra, najlepszy wynik 0, dźwięk włączony. Gdy zapis jest niedostępny, postęp nie jest pamiętany między uruchomieniami.
- **Przeglądarka blokuje dźwięk do pierwszej interakcji:** dźwięki zaczynają działać od pierwszego kliknięcia gracza; gra nie pokazuje błędu.
- **Okno mniejsze niż 1024×768:** gra pozostaje używalna z przewijaniem; dopasowanie do małych ekranów nie jest wymagane.

## Poza zakresem

- Telefony i tablety, sterowanie dotykiem.
- Sterowanie klawiaturą.
- Cofanie ruchu.
- Poziomy trudności, zmiana rozmiaru planszy albo liczby kolorów.
- Inne języki niż polski.
- Konta, logowanie, ranking online, tryb dla wielu graczy.
- Lista wielu najlepszych wyników (pamiętany jest tylko jeden rekord).
- Muzyka w tle.
- Podpowiedzi ruchów i podgląd pól, na których pojawią się następne kulki.

## Etapy dostarczenia

1. **Etap 1, grywalna rozgrywka:** plansza, start gry, przesuwanie kulek, odmowa ruchu, zbijanie linii z punktacją, dolosowanie z podglądem, koniec gry i nowa gra. Realizuje S1–S6. Pole „Najlepszy wynik” jest już widoczne i aktualizuje się w ramach jednego uruchomienia gry, ale nie jest pamiętane po odświeżeniu. Po tym etapie da się rozegrać pełną partię.
2. **Etap 2, pamięć między uruchomieniami:** pamiętanie najlepszego wyniku, informacja o nowym rekordzie i wznawianie rozgrywki po odświeżeniu. Realizuje S7 i S8. Wymaga etapu 1.
3. **Etap 3, dźwięki:** dźwięki zdarzeń i przycisk wyciszenia z zapamiętaniem ustawienia. Realizuje S9. Wymaga etapu 1, nie zależy od etapu 2: pamiętanie ustawienia dźwięku powstaje w tym etapie.

## Założenia

Właściciel na żadne pytanie nie odpowiedział „wybierz ty”. Poniższe szczegóły nie padły w wywiadzie wprost; analityk przyjął je jako najprostsze i zgodne z klasyczną wersją gry, do potwierdzenia przy zatwierdzaniu specyfikacji.

- Droga kulki prowadzi tylko przez pola sąsiadujące bokiem, nie po skosie, bo tak działa klasyczna gra.
- Ponowne kliknięcie zaznaczonej kulki ją odznacza, a kliknięcie innej kulki przenosi zaznaczenie, bo to najmniej zaskakujące zachowanie.
- Po odmowie ruchu kulka pozostaje zaznaczona, żeby gracz mógł od razu wskazać inne pole.
- Startowe kulki nigdy nie tworzą gotowej linii, żeby gra nie zaczynała się od zbicia bez udziału gracza.
- Dźwięk towarzyszy czterem zdarzeniom: przesunięciu, zbiciu, odmowie ruchu i końcowi gry, bo to minimum dające czytelną informację zwrotną.
- Obsługiwane są aktualne wersje Chrome, Firefox, Edge i Safari oraz okno od 1024×768, bo to typowe minimum dla komputera.
- Gra ma działać po otwarciu pliku prosto z dysku, bo wynika to z wymagania jednego samodzielnego pliku.
- Dolosowane kulki są kładzione jednocześnie, a linie sprawdza się raz po ich położeniu, bo to najprostsza i jednoznaczna reguła.
- Kulki z podglądu, które nie zmieściły się na planszy, przepadają, bo taka sytuacja prawie zawsze kończy grę.
- Odświeżenie przed pierwszym ruchem przywraca ten sam układ startowy, bo wynika to z wznawiania gry „w tym samym miejscu”.
- „Nowa gra” pyta o potwierdzenie w każdej niezakończonej rozgrywce, także przed pierwszym ruchem, bo jedna reguła jest prostsza niż wyjątek.
- Gdy plansza opustoszeje po zbiciu, kulki z podglądu pojawiają się od razu, bo inaczej gracz nie miałby ruchu.
- Ruch zakończony zbiciem odtwarza dźwięk przesunięcia, a potem dźwięk zbicia, bo każde zdarzenie ma własny dźwięk.
- Przy niedostępnym zapisie w przeglądarce gra działa bez komunikatu o błędzie, bo zapis jest dodatkiem, a nie warunkiem rozgrywki.

## Sekcje techniczne

Stos i jego uzasadnienie: [ADR 0001](../../docs/adr/0001-stos-technologiczny.md). Zasady pracy w repozytorium: [AGENTS.md](../../AGENTS.md).

### Architektura

Gra jest aplikacją w całości po stronie przeglądarki. Nie ma serwera, bazy danych ani żadnych żądań sieciowych. Źródła w `src/` (moduły ES, czysty JavaScript, CSS, szablon HTML) są sklejane przez `scripts/build.sh` w jeden plik `dist/index.html`, który jest produktem.

**Komponenty**

| Komponent | Katalog | Odpowiedzialność | Czego nie robi |
|---|---|---|---|
| Logika gry | `src/game/` | plansza, droga, wykrywanie linii, punktacja, przebieg tury, losowanie | nie dotyka DOM, `localStorage`, dźwięku ani czasu |
| Zapis | `src/storage/` | odczyt, walidacja i zapis trzech danych w `localStorage` | nie zna reguł gry |
| Dźwięk | `src/audio/` | synteza czterech dźwięków przez Web Audio, wyciszenie, rejestr odtworzonych dźwięków | nie używa plików dźwiękowych |
| Interfejs | `src/ui/` | rysowanie planszy i panelu w DOM, obsługa kliknięć, animacje, okna potwierdzenia i końca gry, polskie teksty | nie liczy reguł gry |
| Interfejs testowy | `src/test-api.js` | `window.__kulki`: zadany stan, przewidywalne losowanie, odczyt stanu | nie jest używany przez samą grę |
| Start | `src/main.js` | składa powyższe i uruchamia aplikację | |

Proponowany podział `src/game/` (jeden plik, jedna odpowiedzialność, żeby zadania dało się robić równolegle): `constants.js` (rozmiar planszy 9, liczba kolorów 7, minimalna linia 5, kulki startowe 5, dolosowanie 3), `board.js` (reprezentacja i operacje na planszy), `rng.js`, `path.js`, `lines.js`, `score.js`, `game.js` (przebieg tury).

**Stan gry.** Jeden niemutowalny obiekt: plansza (81 pól, indeks `wiersz × 9 + kolumna`, wartość `0` dla pustego pola albo `1`–`7` dla koloru), wynik, podgląd (3 kolory), flaga końca gry, flaga pobicia rekordu w tej rozgrywce. Zaznaczenie kulki, trwająca animacja i sygnał odmowy należą do stanu interfejsu, nie do stanu gry, więc nie są zapisywane (S8: po odświeżeniu nic nie jest zaznaczone).

**Przepływ tury**

1. Kliknięcie trafia do `src/ui/`. Jeśli trwa animacja albo gra jest zakończona, jest ignorowane. Kliknięcie kulki zmienia tylko zaznaczenie.
2. Kliknięcie pustego pola przy zaznaczonej kulce wywołuje `src/game/`: szukanie najkrótszej drogi (BFS po sąsiadach bokiem). Brak drogi: interfejs pokazuje sygnał odmowy, stan gry się nie zmienia.
3. Jest droga: logika oblicza **całą turę synchronicznie** i zwraca nowy stan oraz uporządkowaną listę zdarzeń: `moved` (droga), `cleared` (pola, punkty), `spawned` (pola, kolory), `gameOver`. Kolejność obliczeń: przesunięcie → sprawdzenie linii → jeśli było zbicie i plansza nie jest pusta, koniec tury → w przeciwnym razie dolosowanie z podglądu, nowy podgląd, jedno sprawdzenie linii → jeśli po tym zbiciu plansza jest pusta, kolejne dolosowanie → jeśli nie ma pustych pól, koniec gry.
4. Nowy stan jest od razu zapisywany (`src/storage/`) i od razu aktualizowany jest najlepszy wynik. Dzięki temu odświeżenie w trakcie animacji przywraca stan zakończonej tury (S8).
5. Interfejs odtwarza zdarzenia po kolei jako animacje i przy każdym zdarzeniu prosi `src/audio/` o dźwięk. Na czas odtwarzania plansza ma `data-animating="true"` i ignoruje kliknięcia. Wynik na ekranie zmienia się przy zdarzeniu `cleared`.

**Losowość.** Cała gra korzysta z jednej funkcji `rng()` zwracającej liczbę z przedziału [0, 1), tworzonej w `src/game/rng.js` i przekazywanej do logiki jako parametr. Domyślnie opiera się na `Math.random`. Interfejs testowy może ją zastąpić kolejką zadanych wartości, po której wyczerpaniu działa generator z ziarnem (mulberry32). Kolejność zużycia wartości jest częścią kontraktu (patrz „Kontrakty API”).

**Czasy.** Przesunięcie kulki: krok co najwyżej 60 ms, cała animacja nie dłużej niż 800 ms niezależnie od długości drogi. Zbicie: 300 ms. Pojawienie się kulek: 300 ms. Sygnał odmowy: 500 ms. Każda wartość mieści się w limicie 1 s ze specyfikacji; wszystkie są stałymi w jednym module `src/ui/`.

**Dźwięk.** Cztery krótkie dźwięki generowane oscylatorami Web Audio, różniące się wysokością i obwiednią, bez plików. `AudioContext` powstaje leniwie przy pierwszym kliknięciu gracza; jeśli nie istnieje albo jest zawieszony, moduł nic nie odtwarza i nie zgłasza błędu. Rejestr odtworzonych dźwięków dostaje wpis w chwili zlecenia dźwięku przy włączonym dźwięku, niezależnie od tego, czy przeglądarka faktycznie go wyemitowała; przy wyciszeniu wpis nie powstaje.

**Rysowanie.** Plansza to siatka CSS z 81 elementami DOM, kulki to elementy stylowane CSS (gradienty), animacje to przejścia i animacje CSS sterowane klasami. Nie ma `<canvas>` ani obrazów. Okna potwierdzenia i końca gry to elementy HTML w obrębie strony, nie `confirm()`.

**Granice i uruchamianie.** Plik musi działać z `file://`, więc nie ma modułów ładowanych w czasie działania, Service Workera ani założenia, że `localStorage` jest dostępny. Docker Compose (`compose.yml`) serwuje `dist/index.html` przez nginx i służy jako „hosting statyczny” do uruchamiania oraz do testów E2E.

**Identyfikator wersji.** Zbudowany plik ma w `<head>` dokładnie jeden znacznik `<meta name="kulki-version" content="…">`. Wartość pochodzi ze zmiennej `KULKI_VERSION` przy budowaniu (pełny identyfikator commita w procesie publikacji); bez niej jest to stałe `dev`. Gra tego znacznika nie czyta i nie pokazuje go na ekranie; służy wyłącznie do sprawdzenia, która wersja jest opublikowana. Szczegóły i kontrakt: [specyfikacja publikacji](2026-10-04-publikacja-na-github-pages.md), sekcje techniczne. Budowanie jest powtarzalne: te same źródła i ta sama wartość `KULKI_VERSION` dają plik identyczny co do bajta w każdym środowisku.

### Model danych

Nie ma bazy danych. Dane żyją w `localStorage` przeglądarki pod trzema niezależnymi kluczami. Specyfikacja nie oznacza żadnych danych jako osobowe i żadne dane nie opuszczają urządzenia, więc nie ma szczególnej obsługi danych osobowych.

| Klucz | Wartość | Poprawna, gdy | Wartość domyślna |
|---|---|---|---|
| `kulki.game.v1` | JSON, obiekt `Rozgrywka` | spełnia wszystkie reguły poniżej | nowa gra (S1) |
| `kulki.best.v1` | liczba całkowita zapisana dziesiętnie, np. `"124"` | pasuje do `^\d+$` i mieści się w bezpiecznym zakresie liczb całkowitych | `0` |
| `kulki.sound.v1` | `"on"` albo `"off"` | jest jedną z tych dwóch wartości | `"on"` |

**`Rozgrywka`**

```json
{
  "board": [".........", "..3......", ".........", ".....7...", ".........", ".1.......", ".........", "....2....", "......5.."],
  "score": 0,
  "preview": [4, 1, 6],
  "over": false,
  "record": false
}
```

| Pole | Typ | Reguły walidacji |
|---|---|---|
| `board` | tablica 9 napisów | dokładnie 9 napisów po dokładnie 9 znaków; znak `.` to puste pole, cyfra `1`–`7` to kolor; wiersze od góry, znaki od lewej |
| `score` | liczba | całkowita, ≥ 0 |
| `preview` | tablica 3 liczb | dokładnie 3 liczby całkowite z zakresu 1–7 |
| `over` | boolean | jeśli `false`, plansza ma co najmniej jedno puste pole |
| `record` | boolean | czy w tej rozgrywce pobito najlepszy wynik |

Ten sam format planszy (9 napisów) jest używany w interfejsie testowym, więc istnieje jedna zewnętrzna reprezentacja planszy. Wewnętrznie logika używa tablicy 81 liczb.

**Zasady odczytu i zapisu**

- Każdy klucz jest czytany i walidowany osobno. Brak klucza, błąd parsowania, niepoprawny kształt albo wyjątek z `localStorage` dają wartość domyślną tylko dla tego klucza (S8: uszkodzona rozgrywka nie kasuje najlepszego wyniku).
- Każdy zapis jest w `try/catch`. Błąd zapisu jest ignorowany, gra działa dalej w pamięci.
- Rozgrywka jest zapisywana po każdej obliczonej turze, po rozpoczęciu nowej gry i po `setState` z interfejsu testowego. Najlepszy wynik jest zapisywany, gdy rośnie. Ustawienie dźwięku jest zapisywane przy każdej zmianie.
- Zakończona gra pozostaje zapisana z `over: true`, żeby po odświeżeniu wrócił komunikat końca gry z tym samym wynikiem i informacją o rekordzie.
- Najlepszy wynik pokazywany na ekranie to większa z wartości: zapisany najlepszy wynik i wynik bieżącej rozgrywki.

**Migracje.** Wersja formatu jest w nazwie klucza. Zmiana kształtu którejkolwiek danej to nowy klucz (`…v2`) i jawna decyzja o starym: najlepszy wynik musi być przeniesiony, rozgrywkę i ustawienie dźwięku wolno porzucić. Zasady w [BACKWARD_COMPATIBILITY.md](../../BACKWARD_COMPATIBILITY.md).

**Etapy a zapis.** W etapie 1 nic nie jest zapisywane (najlepszy wynik żyje w pamięci do odświeżenia). Etap 2 wprowadza `kulki.game.v1` i `kulki.best.v1`. Etap 3 wprowadza `kulki.sound.v1`.

### Kontrakty API

Gra nie ma API sieciowego. Kontraktami są: interfejs testowy w JavaScripcie, kontrakt DOM oraz format zapisu opisany wyżej. Wszystkie trzy są chronione ([BACKWARD_COMPATIBILITY.md](../../BACKWARD_COMPATIBILITY.md)).

#### Interfejs testowy `window.__kulki`

Obiekt jest zawsze obecny w pliku produkcyjnym, bo testy E2E działają na tym samym `index.html`, który dostaje gracz. Jest dostępny, gdy element `[data-testid="app"]` ma `data-ready="true"`.

**`setState(stan)`** zastępuje bieżącą rozgrywkę, przerywa trwające animacje, usuwa zaznaczenie, rysuje ekran od nowa i zapisuje stan tak jak po turze.

| Pole | Wymagane | Domyślnie | Walidacja |
|---|---|---|---|
| `board` | tak | | jak `board` w `Rozgrywka` |
| `score` | nie | `0` | całkowita, ≥ 0 |
| `preview` | nie | 3 kolory z `rng` | 3 liczby 1–7 |
| `best` | nie | bez zmiany | całkowita, ≥ 0; ustawia najlepszy wynik (także zapisany) |
| `over` | nie | `false` | boolean; `true` pokazuje komunikat końca gry |
| `record` | nie | `false` | boolean |

Niepoprawny argument powoduje `TypeError` z opisem pola i nie zmienia stanu. `setState` nie sprawdza, czy na planszy leżą gotowe linie; test odpowiada za sensowny układ.

**`setRandom({ queue, seed })`** zastępuje źródło losowości. `queue` (opcjonalna tablica liczb z przedziału [0, 1)) jest zużywana po kolei; po jej wyczerpaniu wartości daje generator z ziarnem `seed` (opcjonalna liczba całkowita, domyślnie `1`). Ustawienie nie przetrwa odświeżenia strony; po odświeżeniu gra wraca do prawdziwej losowości, dopóki test nie wywoła `setRandom` ponownie.

**Kolejność zużycia wartości losowych** (część kontraktu):

- Wybór koloru: `1 + floor(rng() × 7)`.
- Wybór pola: puste pola uporządkowane rosnąco według indeksu `wiersz × 9 + kolumna`; wybierane jest pole o numerze `floor(rng() × liczba pustych pól)` na tej liście.
- Nowa gra: dla każdej z 5 kulek po kolei najpierw pole, potem kolor (10 wartości), następnie 3 kolory podglądu (3 wartości). Jeśli 5 kulek tworzy linię, całe losowanie kulek startowych jest powtarzane przed losowaniem podglądu.
- Dolosowanie: dla każdej kulki z podglądu po kolei jedno pole, wybierane z pól pustych po położeniu poprzednich kulek (do 3 wartości; mniej, gdy brakuje miejsca), następnie 3 kolory nowego podglądu (3 wartości). Nowy podgląd nie jest losowany, gdy dolosowanie kończy grę.
- Ruch gracza, odmowa ruchu i zbicie nie zużywają wartości losowych.

Przykład: przy `queue: [0, 0, 0, 0, 0, 0]` dolosowanie kładzie kulki na trzech pierwszych pustych polach, a nowy podgląd to `[1, 1, 1]`.

**`getState()`** zwraca migawkę:

```json
{
  "board": [".........", "..3......", "(razem 9 napisów, jak w Rozgrywka)"],
  "score": 14,
  "best": 20,
  "preview": [4, 1, 6],
  "selected": { "row": 2, "col": 5 },
  "over": false,
  "record": false,
  "animating": false,
  "rejected": false,
  "soundOn": true
}
```

`board` ma format jak w `Rozgrywka` i pokazuje stan po obliczonej turze, także w trakcie animacji. `selected` to `null`, gdy nic nie jest zaznaczone. `rejected` jest `true`, dopóki widoczny jest sygnał odmowy.

**`getSoundLog()`** zwraca kopię rejestru odtworzonych dźwięków od załadowania strony: tablicę obiektów `{ "event": "move" | "clear" | "reject" | "gameover" }` w kolejności odtwarzania.

#### Kontrakt DOM

Testy wybierają elementy wyłącznie po `data-testid` i rolach; klasy CSS nie są kontraktem. Wiersze i kolumny liczone od 0, od lewego górnego rogu.

| Element | `data-testid` | Atrybuty stanu i treść |
|---|---|---|
| Korzeń aplikacji | `app` | `data-ready="true"` po starcie |
| Plansza | `board` | `data-animating="true"\|"false"`; `data-rejected="true"\|"false"` |
| Pole | `cell-{wiersz}-{kolumna}` | `data-color="0"`–`"7"` (0 to puste); `data-selected="true"\|"false"` |
| Wynik | `score` | treść: liczba; obok podpis „Wynik” |
| Najlepszy wynik | `best-score` | treść: liczba; obok podpis „Najlepszy wynik” |
| Podgląd | `preview` | podpis „Następne kulki”; dokładnie 3 elementy `preview-ball` z `data-color="1"`–`"7"`, w kolejności dolosowania |
| Przycisk nowej gry | `new-game` | tekst „Nowa gra” |
| Przycisk dźwięku | `sound-toggle` | `aria-pressed="true"` i tekst „Dźwięk: włączony” albo `aria-pressed="false"` i tekst „Dźwięk: wyciszony” |
| Pytanie o potwierdzenie | `confirm-dialog` | obecne w DOM tylko, gdy widoczne; przyciski `confirm-yes` i `confirm-no` |
| Komunikat końca gry | `game-over` | obecny tylko po końcu gry; `game-over-score` z wynikiem; `game-over-record` obecny tylko przy nowym rekordzie; przycisk `game-over-new-game` |

`data-color` pola odzwierciedla stan logiczny po obliczonej turze; to, co gracz widzi w trakcie animacji, może się chwilowo różnić. Testy porównujące planszę czekają na `data-animating="false"`.

**Walidacja wejścia gracza.** Jedynym wejściem są kliknięcia. Kliknięcie jest ignorowane, gdy trwa animacja, gra jest zakończona albo widoczne jest pytanie o potwierdzenie (wtedy działają tylko jego przyciski). Pozostałe przypadki rozstrzygają scenariusze S2 i S3.

### Integracje

Brak. Gra nie łączy się z żadnym serwerem ani usługą, więc nie ma dostawców, trybu atrapy ani sekretów. Jedyne zależności od środowiska to API przeglądarki: `localStorage` i Web Audio. Oba mogą być niedostępne i w obu przypadkach gra działa dalej (patrz „Model danych” i „Architektura”). W testach jednostkowych zastępuje się je prostymi obiektami zastępczymi przekazywanymi do modułów `src/storage/` i `src/audio/`.

### Plan implementacji

Każdy krok kończy się przechodzącą bramką walidacji i zostawia działającą aplikację. Testy E2E trafiają do `tests/e2e/s<numer>-<nazwa>.spec.js`. Kryteria oceniane ręcznie (wygląd animacji, brzmienie dźwięków, rozróżnialność kolorów) nie mają testów automatycznych i zostają do akceptacji właściciela.

**Zależności między etapami**

| Etap | Zależy od | Uwagi |
|---|---|---|
| 1. Grywalna rozgrywka | nic (tylko szkielet z tego PR) | |
| 2. Pamięć między uruchomieniami | etap 1 | |
| 3. Dźwięki | etap 1 | niezależny od etapu 2; można robić równolegle z nim |

Etapy 2 i 3 mają jeden wspólny element: mały moduł bezpiecznego dostępu do `localStorage`. Jest wydzielony jako krok W poniżej, żeby żaden z tych etapów nie zależał od drugiego.

#### Etap 1: grywalna rozgrywka (S1–S6)

Kroki 1.1–1.5 to czysta logika z testami jednostkowymi, bez zmian na ekranie. Po 1.1 kroki 1.2, 1.3 i 1.4 są od siebie niezależne. Krok 1.6 nie zależy od 1.2–1.5.

| Krok | Zakres | Testy | Zależy od |
|---|---|---|---|
| 1.1 | `constants.js`, `board.js`: reprezentacja planszy, konwersja z i do formatu 9 napisów z walidacją, lista pustych pól | jednostkowe | |
| 1.2 | `rng.js`: generator domyślny, generator z ziarnem, kolejka zadanych wartości; wybór koloru i pustego pola według kontraktu | jednostkowe | 1.1 |
| 1.3 | `path.js`: najkrótsza droga BFS po sąsiadach bokiem; brak drogi, także gdy jedyne połączenie jest po skosie | jednostkowe | 1.1 |
| 1.4 | `lines.js`, `score.js`: linie w czterech kierunkach, kilka linii naraz, wspólna kulka liczona raz, punktacja z tabeli | jednostkowe | 1.1 |
| 1.5 | `game.js`: nowa gra (5 kulek bez gotowej linii, podgląd), przebieg tury z listą zdarzeń, dolosowanie przy mniej niż 3 pustych polach, pusta plansza po zbiciu, koniec gry | jednostkowe dla każdej gałęzi tury | 1.2, 1.3, 1.4 |
| 1.6 | Ekran statyczny: plansza 9×9, wynik, najlepszy wynik, podgląd, przyciski „Nowa gra” i dźwięku, teksty w `texts.js`, układ bez przewijania przy 1024×768, wygląd 7 kolorów | integracyjny (struktura i kontrakt DOM), E2E: napisy po polsku i brak przewijania | |
| 1.7 | Połączenie logiki z ekranem: start nowej gry przy otwarciu, rysowanie stanu, `window.__kulki` (`setState`, `setRandom`, `getState`; `getSoundLog` zwraca pustą tablicę) | E2E S1: 5 kulek, wynik 0, podgląd 3 kulek; E2E interfejsu testowego | 1.5, 1.6 |
| 1.8 | Zaznaczanie kulek i ruch bez zbicia z animacją po drodze; blokada kliknięć na czas animacji (S2) | E2E S2 | 1.7 |
| 1.9 | Odmowa ruchu z sygnałem wizualnym, kulka zostaje zaznaczona (S3) | E2E S3 | 1.8 |
| 1.10 | Zbicie linii po ruchu: animacja, wynik, najlepszy wynik aktualizowany w pamięci, brak dolosowania po zbiciu (S4, część S7 w ramach jednego uruchomienia) | E2E S4 | 1.8 |
| 1.11 | Dolosowanie po ruchu bez zbicia, nowy podgląd, zbicie po dolosowaniu, pusta plansza po zbiciu (S5, reszta S4) | E2E S5 | 1.10 |
| 1.12 | Koniec gry: komunikat z wynikiem, blokada planszy, nowa gra z komunikatu (S6) | E2E S6 | 1.11 |
| 1.13 | „Nowa gra” z pytaniem o potwierdzenie w trwającej rozgrywce i bez pytania po końcu gry (reszta S1) | E2E S1 | 1.12 |

W etapie 1 przycisk dźwięku jest widoczny i przełącza swój opis i `aria-pressed` w pamięci (wymaga tego ostatnie kryterium S1), ale gra nie odtwarza dźwięków i nie zapamiętuje ustawienia.

#### Krok wspólny W (przed 2.1 i przed 3.3)

| Krok | Zakres | Testy | Zależy od |
|---|---|---|---|
| W | `src/storage/safe-storage.js`: odczyt i zapis pojedynczego klucza, które nigdy nie rzucają wyjątku (niedostępny `localStorage`, przekroczony limit, tryb prywatny) | jednostkowe z zastępczym magazynem, w tym rzucającym wyjątki | |

#### Etap 2: pamięć między uruchomieniami (S7, S8). Zależy od etapu 1 i kroku W

| Krok | Zakres | Testy | Zależy od |
|---|---|---|---|
| 2.1 | `src/storage/best-score.js`: odczyt z walidacją i zapis; gra czyta najlepszy wynik przy starcie i zapisuje go, gdy rośnie (S7) | jednostkowe walidacji; E2E S7: rekord po odświeżeniu | W |
| 2.2 | Flaga `record` w stanie gry i informacja o nowym rekordzie w komunikacie końca gry (S7) | jednostkowe; E2E S7: komunikat z informacją i bez niej | 2.1 |
| 2.3 | `src/storage/game-save.js`: walidacja i zapis `Rozgrywka`; zapis po każdej turze, po nowej grze i po `setState` | jednostkowe: każdy rodzaj uszkodzonego zapisu daje „brak zapisu” | W |
| 2.4 | Wznowienie przy starcie: trwająca gra, gra przed pierwszym ruchem, gra zakończona z komunikatem; brak zaznaczenia po wznowieniu; odświeżenie w trakcie animacji (S8) | E2E S8 | 2.2, 2.3 |
| 2.5 | Uszkodzony zapis rozgrywki przy poprawnym najlepszym wyniku; nowa gra po wznowieniu zastępuje zapis; niedostępny `localStorage` (S8, przypadki brzegowe) | E2E S8; integracyjny z wyłączonym `localStorage` | 2.4 |

Kroki 2.1 i 2.3 są od siebie niezależne.

#### Etap 3: dźwięki (S9). Zależy od etapu 1 i kroku W

| Krok | Zakres | Testy | Zależy od |
|---|---|---|---|
| 3.1 | `src/audio/sounds.js`: cztery dźwięki syntezowane, leniwy `AudioContext`, odporność na jego brak i zawieszenie, rejestr odtworzonych dźwięków, stan wyciszenia w pamięci | jednostkowe z zastępczym `AudioContext` | |
| 3.2 | Podpięcie dźwięków do zdarzeń tury: przesunięcie, zbicie (także po dolosowaniu), odmowa, koniec gry, we właściwej kolejności; `getSoundLog` zwraca rejestr | E2E S9: rejestr dla każdego zdarzenia i dla ruchu ze zbiciem | 3.1 |
| 3.3 | Przycisk wyciszenia steruje dźwiękiem; `src/storage/sound-setting.js` zapamiętuje ustawienie; stan po odświeżeniu (S9) | jednostkowe walidacji; E2E S9: wyciszenie, ponowne włączenie, odświeżenie | 3.2, W |

Krok 3.1 nie zależy od etapu 1 i można go zacząć od razu.

#### Miejsca wspólne przy pracy równoległej

Pliki, które zmienia wiele kroków i w których trzeba spodziewać się konfliktów: `src/main.js` (składanie modułów), `src/ui/texts.js`, `src/styles.css`, `src/test-api.js`. Zmiany w nich powinny być małe i dopisywane, a kroki dotykające tego samego pliku lepiej wykonywać po kolei niż równolegle.
