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

> Uzupełnia architekt po zatwierdzeniu specyfikacji: architektura, model danych, kontrakty API, plan implementacji.
