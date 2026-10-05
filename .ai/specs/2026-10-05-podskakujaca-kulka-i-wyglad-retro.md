# Podskakująca kulka i wygląd retro arcade

## TLDR

Dwie zmiany w istniejącej grze „Kulki”. Po pierwsze zaznaczona kulka przestaje być nieruchoma: podskakuje w swoim polu tak jak w klasycznej Lines 98, aż gracz ją odznaczy albo wykona ruch. Po drugie cały interfejs dostaje wygląd automatu arcade z ekranem CRT: czcionka pikselowa, ostre krawędzie, twarde cienie 3D, ciemne tło z neonowymi akcentami i linie skanowania. Reguły gry, teksty, zapisywane dane i sposób dostarczenia (jeden plik działający offline) się nie zmieniają.

## Problem i cel

Dziś zaznaczoną kulkę wyróżnia tylko nieruchoma obwódka pola, a interfejs ma neutralny, „systemowy” wygląd. Właściciel chce, żeby gra wyglądała i zachowywała się jak klasyk, którym jest inspirowana.

Ten dokument rozszerza specyfikację gry ([2026-10-04-gra-w-kulki.md](2026-10-04-gra-w-kulki.md)). Wszystko, czego tu nie zmieniono wprost, obowiązuje dalej. Scenariusze mają numery S10–S16, żeby nie myliły się ze scenariuszami S1–S9 gry i P1–P5 publikacji.

Sukces poznamy po tym, że:

- zaznaczona kulka podskakuje i przestaje natychmiast po odznaczeniu, zgodnie z S10–S13,
- ekran gry wygląda jak automat arcade z ekranem CRT, zgodnie z S14 i S15, a właściciel akceptuje ten wygląd,
- wszystkie kryteria S1–S9 są nadal spełnione, a publikacja gry działa jak dotąd (S16).

## Użytkownicy i role

Bez zmian: jedna rola, **gracz**. Nie dochodzi żadne ustawienie ani uprawnienie.

## Pojęcia

- **Podskakiwanie:** powtarzany w pętli ruch kulki w górę i w dół wewnątrz jej pola, z lekkim spłaszczeniem kulki w dolnym położeniu. Dotyczy tylko wyglądu; kulka przez cały czas logicznie stoi na swoim polu. „Kulka podskakuje” znaczy w tym dokumencie zawsze, że kulka faktycznie się porusza: stan odczytywany przez testy mówi „podskakuje” tylko wtedy. Przy ograniczonym ruchu (S13) zaznaczona kulka nie podskakuje.
- **Stan domyślny kulki:** położenie, rozmiar i kształt, jakie ma każda niezaznaczona kulka stojąca na polu.
- **Animacja blokująca:** animacja ruchu, zbijania albo pojawiania się kulek ze specyfikacji gry, w trakcie której kliknięcia są ignorowane. Podskakiwanie **nie** jest animacją blokującą.
- **Ograniczony ruch:** ustawienie systemu albo przeglądarki, którym gracz prosi o ograniczenie animacji.
- **Czcionka gry:** jedna czcionka pikselowa w stylu automatów arcade, wbudowana w plik gry.
- **Elementy interfejsu:** plansza i jej pola, panel wyniku, panel najlepszego wyniku, panel podglądu, przyciski „Nowa gra” i dźwięku, pytanie o potwierdzenie, komunikat końca gry wraz z ich przyciskami.

## Scenariusze

### S10: Zaznaczona kulka podskakuje

1. Gracz klika kulkę.
2. Kulka zaczyna podskakiwać w swoim polu i podskakuje bez przerwy, dopóki jest zaznaczona.

Podskakiwanie jest jedynym wyróżnieniem zaznaczonej kulki; nieruchoma obwódka pola znika (wyjątek: S13).

**Kryteria akceptacji**

- Zakładając, że żadna kulka nie jest zaznaczona, gdy gracz kliknie kulkę, wtedy ta kulka podskakuje, co testy odczytują ze stanu pola; stan zmienia się w ramach obsługi kliknięcia, bez dodatkowego opóźnienia (limit 100 ms ze specyfikacji gry).
- Zakładając zaznaczoną kulkę, gdy bez żadnej akcji gracza licznik ukończonych cykli podskoku wzrośnie o co najmniej 3, wtedy kulka nadal podskakuje.
- Zakładając podskakującą kulkę, gdy test porówna jej widoczne położenie w kilku chwilach jednego cyklu, wtedy położenie w pionie się zmienia, a kulka w każdej chwili mieści się w całości w granicach swojego pola.
- Zakładając podskakującą kulkę, gdy test odczyta ustawiony czas jednego pełnego cyklu (góra–dół), wtedy wynosi on nie mniej niż 300 ms i nie więcej niż 1 sekundę.
- Zakładając zaznaczoną kulkę, gdy test odczyta stan wszystkich pól, wtedy podskakuje dokładnie jedna kulka, a pozostałe są w stanie domyślnym.
- Zakładając podskakującą kulkę, gdy test odczyta stan planszy, wtedy plansza nie zgłasza trwającej animacji blokującej (`data-animating="false"`), a pole kulki nadal ma `data-selected="true"`.
- [ręcznie] Zakładając zaznaczoną kulkę, gdy właściciel patrzy na planszę, wtedy ruch przypomina podskakiwanie kulki z Lines 98: kulka odbija się od dołu pola i lekko spłaszcza przy „lądowaniu”.

### S11: Odznaczenie zatrzymuje podskakiwanie

1. Gracz klika zaznaczoną kulkę ponownie albo klika inną kulkę.
2. Dotychczas zaznaczona kulka natychmiast nieruchomieje w stanie domyślnym. Jeśli gracz kliknął inną kulkę, podskakiwać zaczyna tamta.

„Natychmiast” oznacza: bez dokańczania cyklu i bez animacji powrotu, w ramach obsługi kliknięcia (limit 100 ms ze specyfikacji gry). „Takie samo położenie i rozmiar” oznacza zgodność z dokładnością do 1 piksela.

**Kryteria akceptacji**

- Zakładając podskakującą kulkę, gdy gracz kliknie ją ponownie, wtedy kulka nie podskakuje, a jej widoczne położenie i rozmiar są takie same jak przed zaznaczeniem.
- Zakładając podskakującą kulkę A, gdy gracz kliknie inną kulkę B, wtedy A jest w stanie domyślnym, a B podskakuje.
- Zakładając podskakującą kulkę, gdy gracz zatrzyma ją w dowolnej chwili cyklu (sprawdzane dla co najmniej dwóch różnych chwil), wtedy kulka wraca do tego samego stanu domyślnego.
- Zakładając kulkę odznaczoną przed chwilą, gdy gracz zaznaczy ją ponownie, wtedy znów podskakuje.
- Zakładając zaznaczoną kulkę, gdy gracz kliknie „Nowa gra” i potwierdzi, wtedy żadna kulka na nowej planszy nie podskakuje.
- Zakładając zaznaczoną kulkę, gdy gracz kliknie „Nowa gra” i widoczne jest pytanie o potwierdzenie, wtedy kulka nadal podskakuje; gdy gracz zrezygnuje, ta sama kulka jest nadal zaznaczona i podskakuje.
- Zakładając zaznaczoną kulkę, gdy gracz odświeży stronę, wtedy po wznowieniu żadna kulka nie podskakuje (zgodnie z S8: nic nie jest zaznaczone).
- Zakładając, że żadna kulka nie jest zaznaczona, gdy gracz kliknie puste pole, wtedy żadna kulka nie podskakuje.

### S12: Podskakiwanie a ruch i odmowa ruchu

1. Gracz ma zaznaczoną, podskakującą kulkę i klika puste pole.
2. Jeśli droga istnieje, kulka przestaje podskakiwać i rusza w drogę jak dotąd (S2). Po dotarciu stoi nieruchomo.
3. Jeśli drogi nie ma, gracz widzi sygnał odmowy (S3), a kulka podskakuje dalej, bo pozostaje zaznaczona.

**Kryteria akceptacji**

- Zakładając podskakującą kulkę i puste pole, do którego istnieje droga, gdy gracz kliknie to pole, wtedy od rozpoczęcia animacji ruchu żadna kulka nie podskakuje, a po zakończeniu animacji przesunięta kulka jest na polu docelowym w stanie domyślnym.
- Zakładając podskakującą kulkę i puste pole, do którego nie istnieje droga, gdy gracz kliknie to pole, wtedy widoczny jest sygnał odmowy, a kulka w trakcie sygnału i po nim nadal podskakuje na swoim polu.
- Zakładając ruch, po którym następuje zbicie linii, dolosowanie kulek albo koniec gry, gdy zakończą się wszystkie animacje, wtedy żadna kulka nie podskakuje.
- Zakładając włączone dźwięki, gdy licznik ukończonych cykli podskoku wzrośnie o co najmniej 3, wtedy rejestr odtworzonych dźwięków się nie wydłuża (podskakiwanie jest bezgłośne).

### S13: Ograniczony ruch

1. Gracz ma w systemie albo przeglądarce włączone ograniczenie animacji.
2. Zaznaczona kulka nie podskakuje. Zamiast tego jest wyróżniona nieruchomo, wyraźną obwódką pola.

**Kryteria akceptacji**

- Zakładając włączony ograniczony ruch, gdy gracz kliknie kulkę, wtedy pole ma `data-selected="true"`, kulka nie podskakuje (jej widoczne położenie nie zmienia się w czasie), a pole ma widoczne nieruchome wyróżnienie, którego nie mają pozostałe pola.
- Zakładając włączony ograniczony ruch i zaznaczoną kulkę, gdy gracz ją odznaczy, wtedy nieruchome wyróżnienie znika.
- Zakładając wyłączony ograniczony ruch, gdy gracz zaznaczy kulkę, wtedy kulka podskakuje, a jej pole nie ma nieruchomej obwódki.

### S14: Wygląd automatu arcade

1. Gracz otwiera grę.
2. Widzi ciemny ekran w stylu automatu arcade: napisy czcionką pikselową, panele i przyciski o ostrych krawędziach z twardym cieniem 3D, neonowe akcenty.

Zasady wyglądu:

- **Czcionka:** wszystkie napisy i liczby na ekranie są pisane czcionką gry. Właściciel wskazał jako wzór Press Start 2P. Czcionka jest wbudowana w plik gry i zawiera polskie znaki (ą, ć, ę, ł, ń, ó, ś, ź, ż oraz wielkie odpowiedniki).
- **Kształty:** elementy interfejsu mają proste, nieokrągłe narożniki. Kulki (na planszy i w podglądzie) pozostają okrągłe.
- **Cienie:** panele, przyciski i okna mają twardy cień bez rozmycia, przesunięty w dół i w prawo, dający wrażenie wypukłości. Wciśnięty przycisk wygląda na wciśnięty: przesuwa się w stronę cienia, a cień maleje albo znika.
- **Paleta:** jeden ciemny motyw, niezależny od jasnego albo ciemnego motywu systemu. Tło prawie czarne z granatowym odcieniem; napisy i ramki w neonowych kolorach (zieleń, cyjan, magenta, żółć). Kolory 7 kulek pozostają takie jak dziś.
- **Tablica wyników:** „Wynik” i „Najlepszy wynik” są osobnymi panelami w ramkach, z podpisem i liczbą wyraźnie większą od podpisu, jak licznik punktów na automacie.
- **Treść bez zmian:** wszystkie napisy mają dotychczasowe brzmienie i pozostają po polsku. Nie dochodzą nowe przyciski, panele ani napisy poza opisanymi w tym dokumencie.

**Kryteria akceptacji**

- Zakładając otwartą grę, gdy test sprawdzi tytuł gry, podpisy i liczby paneli wyniku, najlepszego wyniku i podglądu oraz oba przyciski, wtedy każdy z tych napisów jest wyświetlany czcionką gry, a nie czcionką zastępczą.
- Zakładając widoczne pytanie o potwierdzenie albo komunikat końca gry (także z informacją o nowym rekordzie), gdy test sprawdzi ich napisy i przyciski, wtedy są wyświetlane czcionką gry.
- Zakładając otwartą grę, gdy test sprawdzi każdy z 18 polskich znaków diakrytycznych (ą, ć, ę, ł, ń, ó, ś, ź, ż oraz ich wielkie odpowiedniki), wtedy każdy jest wyświetlany czcionką gry, a nie czcionką zastępczą.
- Zakładając grę otwartą bez połączenia z internetem, gdy strona się załaduje, wtedy napisy są wyświetlane czcionką gry, a strona nie wykonała żadnego żądania sieciowego poza pobraniem samego pliku gry.
- Zakładając otwartą grę, gdy test sprawdzi narożniki elementów interfejsu (w tym pól planszy, obu przycisków, trzech paneli, pytania o potwierdzenie i komunikatu końca gry), wtedy żaden nie jest zaokrąglony, a kulki na planszy i w podglądzie są okrągłe.
- Zakładając otwartą grę, gdy test sprawdzi panele, oba przyciski, pytanie o potwierdzenie i komunikat końca gry oraz ich przyciski, wtedy każdy ma cień bez rozmycia przesunięty w dół i w prawo.
- Zakładając dowolny przycisk gry (także w pytaniu o potwierdzenie i w komunikacie końca gry), gdy gracz trzyma na nim wciśnięty przycisk myszy, wtedy przycisk jest przesunięty w dół i w prawo względem położenia spoczynkowego, a jego cień jest mniejszy niż w spoczynku albo go nie ma; po puszczeniu przycisk i cień wracają do stanu spoczynkowego.
- Zakładając system w motywie jasnym i ten sam system w motywie ciemnym, gdy gracz otworzy grę, wtedy kolory tła, napisów i ramek są w obu przypadkach identyczne, a tło strony jest ciemne (jasność względna koloru tła nie większa niż 0,05).
- Zakładając otwartą grę, gdy test porówna kolor każdego napisu z jednolitym kolorem tła elementu, na którym napis leży (bez uwzględniania efektu CRT), wtedy kontrast wynosi co najmniej 4,5:1.
- Zakładając otwartą grę, gdy test porówna rozmiar liczby i podpisu w panelu wyniku oraz w panelu najlepszego wyniku, wtedy liczba jest większa od podpisu.
- Zakładając wynik 0 oraz wynik sześciocyfrowy ustawiony przez interfejs testowy, gdy test sprawdzi panele wyniku i najlepszego wyniku, wtedy liczba mieści się w całości w swoim panelu.
- Zakładając okno 1024×768, gdy gracz otworzy grę, wtedy cała gra (plansza, wynik, najlepszy wynik, podgląd, przyciski) jest widoczna bez przewijania w pionie i w poziomie, a żaden napis nie jest ucięty ani nie wychodzi poza swój element.
- Zakładając okno 1024×768 i widoczne pytanie o potwierdzenie albo komunikat końca gry z informacją o nowym rekordzie, gdy test je sprawdzi, wtedy mieszczą się w całości w oknie, a ich napisy nie są ucięte.
- Zakładając otwartą grę, gdy test odczyta bazowe kolory 7 kulek, wtedy są takie same jak przed zmianą wyglądu, kolejno dla kolorów 1–7: `#e53935`, `#fb8c00`, `#fdd835`, `#43a047`, `#00acc1`, `#1e53d6`, `#8e24aa`.
- [ręcznie] Zakładając otwartą grę, gdy właściciel patrzy na ekran, wtedy 7 kolorów kulek jest wyraźnie odróżnialnych od siebie i od nowego tła planszy, a całość wygląda spójnie jak automat arcade.

### S15: Efekt ekranu CRT

1. Gracz otwiera grę.
2. Na całym ekranie gry widzi subtelny, nieruchomy efekt starego monitora: poziome linie skanowania, lekką poświatę wokół jasnych napisów i ramek oraz przyciemnione rogi.

Efekt nie migocze, nie przesuwa się i nie zakrzywia obrazu. Nie da się go wyłączyć.

**Kryteria akceptacji**

- Zakładając otwartą grę, gdy test odnajdzie efekt CRT i odczyta jego obszar, wtedy efekt jest obecny i pokrywa cały obszar gry, łącznie z pytaniem o potwierdzenie i komunikatem końca gry, gdy są widoczne.
- Zakładając otwartą grę, gdy gracz klika kulkę, puste pole, przycisk „Nowa gra”, przycisk dźwięku oraz przyciski pytania o potwierdzenie i komunikatu końca gry, wtedy każde kliknięcie działa tak samo jak bez efektu (efekt nie przechwytuje kliknięć).
- Zakładając otwartą grę bez zaznaczonej kulki i bez trwającej animacji blokującej, gdy test sprawdzi stronę, wtedy nie działa na niej żadna animacja, a dwa kolejne zrzuty ekranu są identyczne (efekt jest nieruchomy).
- Zakładając otwartą grę, gdy test odczyta tekst widoczny na ekranie, wtedy efekt nie dodał żadnego napisu.
- Zakładając otwartą grę, gdy test odczyta drzewo dostępności strony, wtedy efekt CRT w nim nie występuje (czytnik ekranu go nie ogłasza).
- [ręcznie] Zakładając otwartą grę, gdy właściciel patrzy na ekran, wtedy widoczne są linie skanowania, poświata wokół jasnych napisów i ramek oraz przyciemnione rogi, ale efekt nie utrudnia czytania napisów ani rozróżniania kolorów kulek.

### S16: Gra działa jak dotąd

1. Gracz gra w nowej wersji.
2. Wszystko poza wyglądem i podskakiwaniem zaznaczonej kulki działa jak przed zmianą.

**Kryteria akceptacji**

- Zakładając nową wersję gry, gdy uruchomione zostaną istniejące testy scenariuszy S1–S9, wtedy wszystkie przechodzą bez zmiany ich asercji dotyczących zachowania gry, tekstów i odczytywanego stanu.
- Zakładając nową wersję gry, gdy test sprawdzi wynik budowania, wtedy produktem jest nadal jeden plik, który nie odwołuje się do żadnego zasobu zewnętrznego.
- Zakładając plik gry otwarty bezpośrednio z dysku, gdy gracz rozegra ruch ze zbiciem linii, wtedy gra działa bez błędów, napisy są wyświetlane czcionką gry, a efekt CRT jest widoczny.
- Zakładając rozgrywkę, najlepszy wynik i ustawienie dźwięku zapisane przez poprzednią wersję gry, gdy gracz otworzy nową wersję, wtedy wszystkie trzy są odczytane i pokazane bez zmian.
- Zakładając opublikowaną nową wersję, gdy uruchomione zostaną automatyczne sprawdzenia po publikacji (P1, P2 i P4 ze specyfikacji publikacji), wtedy przechodzą. Scenariusze P3 i P5 dotyczą samego procesu publikacji i ta zmiana ich nie dotyka.

## Dane

Bez zmian. Nie dochodzi żadna zapisywana dana ani ustawienie. To, która kulka jest zaznaczona i podskakuje, pozostaje stanem ekranu i nie jest zapisywane. Brak danych osobowych.

## Integracje zewnętrzne

Brak. Czcionka gry jest częścią pliku gry, nie jest pobierana z żadnej usługi.

## Wymagania niefunkcjonalne

- **Forma dostarczenia (wymaganie właściciela, bez zmian):** jeden plik, bez bibliotek i bez zasobów pobieranych z sieci. Czcionka gry jest wbudowana w ten plik.
- **Licencja czcionki:** czcionka gry musi mieć licencję pozwalającą na bezpłatne wbudowanie jej w publicznie dostępną grę i rozpowszechnianie razem z nią. Jeśli licencja wymaga dołączenia jej treści albo informacji o autorze, trafia ona do repozytorium.
- **Czcionka (wymaganie właściciela):** styl pikselowy; wzorem jest Press Start 2P. Dopuszczalna jest inna czcionka pikselowa tylko wtedy, gdy wzorcowa nie spełnia wymagań dotyczących polskich znaków albo licencji.
- **Wydajność:** bez zmian: od kliknięcia do zmiany stanu widocznej dla testu najwyżej 100 ms, także przy podskakującej kulce i włączonym efekcie CRT. Pojedynczy cykl podskoku trwa od 300 ms do 1 sekundy. Limit 1 sekundy na animację ze specyfikacji gry dotyczy animacji blokujących i jednego cyklu podskoku, nie łącznego czasu podskakiwania, które trwa, dopóki kulka jest zaznaczona.
- **Ekran i platforma:** bez zmian: komputer, mysz, aktualne Chrome, Firefox, Edge i Safari, okno od 1024×768 bez przewijania.
- **Dostępność:** przy ograniczonym ruchu kulka nie podskakuje (S13). Efekt CRT nie migocze. Kontrast napisów co najmniej 4,5:1. Efekt CRT jest niewidoczny dla czytników ekranu.
- **Język:** wyłącznie polski, napisy bez zmian.
- **Testowalność:** oprócz dotychczasowych wymagań testy muszą móc odczytać dla każdego pola, czy stojąca na nim kulka podskakuje, liczbę ukończonych cykli podskoku i ustawiony czas cyklu oraz widoczne położenie i rozmiar kulki. Testy muszą też móc odnaleźć efekt CRT i odczytać jego obszar. Dotychczasowe elementy kontraktu testowego (identyfikatory elementów, atrybuty stanu, interfejs testowy) nie zmieniają znaczenia; nowe informacje są wyłącznie dodawane.
- **RODO:** nie dotyczy.

## Przypadki brzegowe i błędy

- **Czcionka gry nie daje się wczytać w danej przeglądarce:** napisy są wyświetlane systemową czcionką o stałej szerokości znaków; gra działa normalnie i gracz nie widzi komunikatu o błędzie. To, że układ pozostaje wtedy czytelny, jest oceniane ręcznie.
- **Kliknięcie w trakcie animacji blokującej:** jest ignorowane jak dotąd; nie zaczyna ani nie zatrzymuje podskakiwania.
- **Szybkie przełączanie zaznaczenia między kulkami:** w każdej chwili podskakuje najwyżej jedna kulka, zawsze ta, której pole ma `data-selected="true"`.
- **Odmowa ruchu:** sygnał odmowy i podskakiwanie są widoczne jednocześnie (S12).
- **Koniec gry:** po końcu gry nic nie jest zaznaczone, więc żadna kulka nie podskakuje.
- **Ograniczony ruch włączony albo wyłączony w trakcie gry:** wygląd zaznaczonej kulki od razu dostosowuje się do nowego ustawienia: po włączeniu kulka nieruchomieje i dostaje obwódkę, po wyłączeniu zaczyna podskakiwać.
- **Długie liczby:** wynik do sześciu cyfr mieści się w panelu (S14).
- **Okno mniejsze niż 1024×768:** jak dotąd: gra pozostaje używalna z przewijaniem, dopasowanie nie jest wymagane.

## Poza zakresem

- Zmiana reguł gry, punktacji, tekstów, dźwięków i zapisywanych danych.
- Dźwięk podskakiwania kulki.
- Zmiana kształtu albo kolorów kulek (kulki pikselowe, nowa paleta kulek).
- Zmiana animacji ruchu, zbijania i pojawiania się kulek oraz sygnału odmowy, poza dopasowaniem ich kolorów do nowej palety.
- Migotanie, przesuwające się linie i zakrzywienie obrazu w efekcie CRT.
- Wyłącznik efektu CRT, przełącznik motywów, motyw jasny, wybór czcionki przez gracza.
- Ekran tytułowy, napisy typu „INSERT COIN”, obudowa automatu, joystick, nowe elementy dekoracyjne z treścią.
- Lista wielu najlepszych wyników (tablica „high scores”); pamiętany jest nadal jeden rekord.
- Telefony, tablety, dotyk, klawiatura, małe okna.
- Wybór narzędzia do projektowania i sposobu wykonania wyglądu; to decyzja architekta.

## Etapy dostarczenia

Etapy są od siebie niezależne i mogą powstać w dowolnej kolejności.

1. **Etap 1, podskakująca kulka:** zaznaczona kulka podskakuje i nieruchomieje po odznaczeniu, ruchu albo nowej grze; obsługa ograniczonego ruchu. Realizuje S10–S13. Działa w obecnym wyglądzie gry.
2. **Etap 2, wygląd retro arcade:** czcionka gry, kształty, cienie, paleta, tablica wyników i efekt CRT. Realizuje S14 i S15. Wyróżnienie zaznaczenia, które istnieje w chwili wdrożenia (dzisiejsza obwódka pola albo, po etapie 1, obwódka z S13), dostaje kolory nowej palety.

S16 obowiązuje w całości po każdym z etapów.

## Założenia

Właściciel przekazał opis obu zmian i polecił przyjąć rozsądne założenia bez dalszych pytań. Wszystkie poniższe decyzje podjął analityk, wybierając opcję najprostszą i najłatwiej odwracalną; są do potwierdzenia przy zatwierdzaniu specyfikacji.

- Jedna specyfikacja z dwoma niezależnymi etapami zamiast dwóch dokumentów, bo obie zmiany dotyczą wyglądu tej samej gry i zamówiono je razem.
- Kulka podskakuje (góra–dół ze spłaszczeniem), a nie pulsuje, bo tak wygląda to w Lines 98, na którą powołał się właściciel.
- Podskakiwanie zastępuje obwódkę pola jako wyróżnienie zaznaczenia, bo w klasycznej grze innego wyróżnienia nie ma.
- Zatrzymanie jest natychmiastowe, bez dokańczania cyklu, bo właściciel napisał „natychmiast”.
- Podskakiwanie nie blokuje kliknięć i nie liczy się jako „trwająca animacja”, bo inaczej nie dałoby się wykonać ruchu zaznaczoną kulką.
- Cykl podskoku trwa od 300 ms do 1 sekundy, bo to mieści się w dotychczasowym limicie animacji i odpowiada tempu klasycznej gry.
- Podskakiwanie jest bezgłośne, bo nowych dźwięków nie zamówiono.
- Przy ograniczonym ruchu kulka nie podskakuje i ma nieruchomą obwódkę, bo gra już dziś respektuje to ustawienie przy sygnale odmowy.
- Czcionka pikselowa jest wbudowana w plik gry, bo obowiązuje wymaganie właściciela o braku zasobów z sieci i pracy offline; wczytywanie jej z internetu łamałoby to wymaganie.
- Dopuszczono zamiennik Press Start 2P na wypadek braku polskich znaków albo nieodpowiedniej licencji, bo napisy muszą pozostać po polsku.
- Efekt CRT jest subtelny i nieruchomy, bez migotania i zakrzywienia, bo to najbezpieczniejsze dla wzroku i czytelności, a łatwo go później wzmocnić.
- Efektu CRT nie da się wyłączyć, bo wyłącznik oznaczałby nowe ustawienie i nową zapisywaną daną.
- Kulki zostają okrągłe i w dotychczasowych kolorach, bo właściciel wymienił do zmiany przyciski, tablicę wyników, ramki i czcionki, a rozróżnialność kolorów kulek była już zaakceptowana.
- Gra ma jeden ciemny motyw niezależny od systemu, bo wygląd automatu arcade nie ma wersji jasnej.
- „Tablica wyników” oznacza istniejące panele „Wynik” i „Najlepszy wynik”, a nie listę wielu wyników, bo lista jest poza zakresem specyfikacji gry.
- Wymagany kontrast napisów to co najmniej 4,5:1, bo to powszechnie przyjęty próg czytelności tekstu.
- Napisy zachowują dotychczasowe brzmienie, bo są częścią chronionego kontraktu testowego.
- Narzędzia do projektowania (v0.dev, Claude Artifacts, Pen.dev, CSS) nie wybrano w specyfikacji, bo sposób wykonania należy do architekta.
- Wynikiem tego zadania jest specyfikacja, a nie kod, bo kod powstaje po zatwierdzeniu specyfikacji.

## Sekcje techniczne

Decyzje i ich uzasadnienie: [ADR 0003](../../docs/adr/0003-podskakujaca-kulka-i-wyglad-retro.md). Stos się nie zmienia ([ADR 0001](../../docs/adr/0001-stos-technologiczny.md)). Zasady pracy w repozytorium: [AGENTS.md](../../AGENTS.md). Ten rozdział rozszerza sekcje techniczne [specyfikacji gry](2026-10-04-gra-w-kulki.md); wszystko, czego tu nie zmieniono, obowiązuje dalej.

### Architektura

Obie zmiany dotyczą wyłącznie warstwy interfejsu (`src/ui/`, `src/styles.css`, `src/index.html`) i kroku budowania (`tools/`). Logika gry (`src/game/`), zapis (`src/storage/`), dźwięk (`src/audio/`) i interfejs testowy (`src/test-api.js`) pozostają bez zmian.

**Komponenty**

| Komponent | Miejsce | Odpowiedzialność | Etap |
|---|---|---|---|
| Kulka jako element | `src/ui/app.js`, `src/styles.css` | każde pole planszy ma element kulki, którego położenie i rozmiar da się zmierzyć | krok W |
| Czas cyklu | `src/ui/timing.js` | stała `BOUNCE_CYCLE_MS` (wartość z przedziału 300–1000, proponowana 600) | 1 |
| Preferencja ruchu | `src/ui/motion.js` (nowy) | czy gracz prosi o ograniczony ruch; powiadomienie o zmianie | 1 |
| Podskakiwanie | `src/ui/bounce.js` (nowy), `src/styles.css` | które pole podskakuje, licznik cykli, atrybuty stanu | 1 |
| Czcionka gry | `src/fonts/`, `tools/embed-fonts.js` (nowy), `tools/build.js` | wklejenie pliku czcionki do CSS jako `data:` | 2 |
| Motyw arcade | `src/styles.css` | paleta, kształty, cienie, tablica wyników | 2 |
| Efekt CRT | `src/index.html`, `src/styles.css` | nieruchoma nakładka nad całą stroną | 2 |

**Kulka jako element (krok W).** Dziś kulka jest pseudoelementem `::after` pola, którego testy nie potrafią zmierzyć. Każde z 81 pól dostaje na stałe jedno dziecko: element kulki z `data-testid="ball-{wiersz}-{kolumna}"`. Element jest tworzony raz przy budowaniu planszy i nigdy nie jest usuwany; nie ma własnego `data-color`. O tym, czy go widać i w jakim jest kolorze, decyduje wyłącznie `data-color` pola: przy `data-color="0"` kulka ma `display: none`, w pozostałych przypadkach dziedziczy kolor przez zmienną `--ball`. Funkcje rysujące (`render`, `paint`, animacja ruchu) dalej zmieniają tylko `data-color` pól, więc ich kod się nie zmienia. Kulki podglądu (`preview-ball`) pozostają bez zmian.

**Podskakiwanie (etap 1).** Jedno źródło prawdy to czysta funkcja w `src/ui/bounce.js`: pole podskakuje wtedy i tylko wtedy, gdy jest zaznaczone i ruch nie jest ograniczony.

1. Interfejs po każdej zmianie zaznaczenia i po każdej zmianie preferencji ruchu ustawia na każdym polu `data-bouncing` (`"true"` na najwyżej jednym polu).
2. CSS uruchamia animację `@keyframes` na elemencie kulki tylko wewnątrz pola z `data-bouncing="true"`. Animacja zmienia wyłącznie `transform` (przesunięcie w pionie i spłaszczenie przy dolnym położeniu), ma `animation-iteration-count: infinite` i zwykły kierunek. **Jedna iteracja to pełny cykl góra–dół**; `animation-direction: alternate` jest zabronione, bo wtedy iteracja byłaby połową cyklu i licznik oraz czas cyklu by kłamały.
3. Czas cyklu pochodzi ze stałej `BOUNCE_CYCLE_MS`. Interfejs przy starcie ustawia ją na planszy jako zmienną CSS `--bounce-ms` (np. `600ms`), a reguła animacji używa `animation-duration: var(--bounce-ms)`. W CSS nie ma drugiej, wpisanej na sztywno wartości.
4. Zatrzymanie jest natychmiastowe, bo element kulki nie ma `transition`: gdy pole traci `data-bouncing="true"`, przeglądarka usuwa animację i kulka w tej samej klatce ma `transform: none`, czyli stan domyślny.
5. Licznik cykli: interfejs nasłuchuje na planszy zdarzenia `animationiteration` (zdarzenie bąbelkuje) i dla zdarzeń z elementu kulki podskakującego pola zwiększa `data-bounce-cycles` planszy o 1. Licznik wraca do `0` za każdym razem, gdy zmienia się pole podskakujące albo podskakiwanie się kończy. Przeglądarka wysyła to zdarzenie tylko wtedy, gdy animacja naprawdę działa, więc licznik nie rośnie przy nieruchomej kulce.
6. Kulka w każdej chwili mieści się w polu: amplituda i spłaszczenie są dobrane do marginesu kulki w polu (dziś 12% z każdej strony). `transform-origin` jest przy dolnej krawędzi kulki, żeby spłaszczenie wyglądało jak lądowanie.

Podskakiwanie nie dotyka `data-animating`, nie blokuje kliknięć i nie woła `src/audio/`. Sygnał odmowy (animacja całej planszy) i podskakiwanie (animacja kulki) działają na różnych elementach, więc są widoczne jednocześnie.

**Kiedy podskakiwanie się kończy.** Wszędzie tam, gdzie interfejs dziś zeruje zaznaczenie: ponowne kliknięcie kulki, kliknięcie innej kulki (podskakiwać zaczyna tamta), wykonany ruch (przed pierwszym krokiem animacji ruchu), nowa gra, `setState` z interfejsu testowego, start po odświeżeniu. Pytanie o potwierdzenie niczego nie zmienia: zaznaczenie i podskakiwanie trwają, a rezygnacja zostawia je bez zmian.

**Ograniczony ruch (etap 1).** `src/ui/motion.js` udostępnia funkcję tworzącą obiekt z metodami `isReduced()` i `onChange(listener)`, opartą na `window.matchMedia('(prefers-reduced-motion: reduce)')`. Gdy `matchMedia` nie istnieje albo rzuca wyjątek (np. jsdom), ruch jest traktowany jako nieograniczony. Przy zmianie ustawienia w trakcie gry interfejs od razu przelicza `data-bouncing`. O podskakiwaniu przy ograniczonym ruchu decyduje wyłącznie ten moduł; w CSS nie ma reguły `@media (prefers-reduced-motion)` dla kulki, żeby atrybut stanu nie rozminął się z ekranem. Istniejąca reguła `@media` dla sygnału odmowy zostaje.

**Wyróżnienie nieruchome.** Pole zaznaczone, które nie podskakuje (`data-selected="true"` i `data-bouncing="false"`), ma `outline` o szerokości co najmniej 2 px. Każde inne pole ma `outline-style: none`. Dzisiejsza reguła `.cell[data-selected='true']` zostaje zawężona do tego przypadku.

**Czcionka gry (etap 2).** W repozytorium jest oryginalny, niezmieniony plik `src/fonts/PressStart2P-Regular.ttf` z licencją `src/fonts/OFL.txt` (dodane w PR architektury; sumy SHA-256 pilnuje `tests/unit/fonts/press-start-2p.test.js`). Zawiera wszystkie 18 polskich znaków diakrytycznych, a każdy znak ma szerokość dokładnie 1 em.

- `src/styles.css` deklaruje jedną regułę `@font-face` z rodziną `'Press Start 2P'`, `src: url('./fonts/PressStart2P-Regular.ttf') format('truetype')` i `font-display: block`.
- `tools/embed-fonts.js` eksportuje czystą funkcję `embedFonts(css, fonts)`, gdzie `fonts` to mapa „nazwa pliku → zawartość”. Zamienia każdy adres `url('./fonts/<plik>')` na `url('data:font/ttf;base64,…')`. Adres wskazujący plik, którego nie ma w mapie, powoduje błąd z nazwą pliku. `tools/build.js` czyta pliki z `src/fonts/` i woła tę funkcję przed `inlineAssets`. `OFL.txt` nie trafia do pliku gry.
- Stos czcionek całej strony: `'Press Start 2P', ui-monospace, 'Courier New', monospace`. Przyciski dziedziczą czcionkę (`font: inherit`). Gdy czcionka gry się nie wczyta, napisy pokazuje systemowa czcionka o stałej szerokości; gra nie czeka na czcionkę i `data-ready` od niej nie zależy.
- Rozmiary czcionki są zmiennymi CSS w `:root`. Czcionka jest ostra w wielokrotnościach 8 px. Szerokość napisu to liczba znaków razy rozmiar czcionki, więc układ da się policzyć: najdłuższe napisy to pytanie o potwierdzenie (56 znaków, może się łamać na wiersze), „Dźwięk: wyciszony” (17 znaków) i „Najlepszy wynik” (15 znaków); sześciocyfrowy wynik przy 24 px ma 144 px.

**Motyw arcade (etap 2).** Jeden ciemny motyw: `color-scheme: dark` w `:root`, bez `prefers-color-scheme` i bez `light-dark()`. Wszystkie kolory interfejsu są zmiennymi CSS w `:root` (tło strony, tło paneli, tło pól, kolor napisów, cztery neonowe akcenty, kolor twardego cienia). Zmienne `--c1`…`--c7` zachowują dzisiejsze wartości. Zasady, od których zależą testy:

- Tło każdego elementu, na którym leży napis, jest jednolitym kolorem (`background-color`), nie gradientem ani obrazem.
- Elementy interfejsu mają `border-radius: 0`. Okrągłe są tylko kulki planszy i podglądu.
- Twardy cień to dokładnie jedna warstwa `box-shadow` z dodatnim przesunięciem w poziomie i w pionie, rozmyciem 0 i rozszerzeniem 0. Poświata ramek nie jest dodatkową warstwą `box-shadow` na tych elementach; robi ją pseudoelement albo `filter: drop-shadow`. Poświata napisów to `text-shadow`.
- Wciśnięty przycisk (`:active`) ma `transform: translate(x, y)` z dodatnimi wartościami i mniejszy cień albo `box-shadow: none`. Przyciski nie mają `transition`, żeby stan wciśnięcia był natychmiastowy i żeby nieruchomy ekran nie miał żadnej działającej animacji.
- Okna pytania i końca gry pozostają w układzie strony, pod planszą albo obok niej. Nie zasłaniają pól planszy ani pozostałych przycisków (istniejący test S1 klika pola przy widocznym pytaniu). Zmienna `--cell` uwzględnia miejsce na okno, tak żeby przy 1024×768 całość mieściła się także z komunikatem końca gry z informacją o rekordzie.
- Kolory sygnału odmowy i wyróżnienia nieruchomego pochodzą z palety.
- Kolejność napisów w DOM i ich brzmienie się nie zmieniają: tytuł, wynik, najlepszy wynik, podgląd, „Nowa gra”, przycisk dźwięku (istniejący test S1 porównuje cały widoczny tekst). Układ zmienia się przez CSS, nie przez przestawianie elementów. `text-transform` jest zabronione, bo zmienia tekst odczytywany przez testy; nie dochodzą też napisy z `content` w pseudoelementach.

**Efekt CRT (etap 2).** W szablonie `src/index.html`, jako rodzeństwo `<main id="app">` (interfejs podmienia zawartość `#app`, więc efekt nie może być w środku), jest pusty element `<div data-testid="crt" aria-hidden="true">`. CSS: `position: fixed; inset: 0; pointer-events: none`, `z-index` nad całą grą, tło z nieruchomych gradientów (linie skanowania: `repeating-linear-gradient`; przyciemnione rogi: `radial-gradient`). Element nie ma treści, animacji ani `transition`. Okna dialogowe leżą w układzie strony, więc nakładka na całe okno obejmuje je bez dodatkowej pracy.

**Budowanie i publikacja.** Plik gry rośnie do około 190 kB. Budowanie pozostaje powtarzalne (zależy tylko od `src/`, `tools/` i `KULKI_VERSION`). `Dockerfile` kopiuje cały katalog `src/`, więc czcionka trafia do obrazu bez zmian w Compose. Workflow, sprawdzenia po publikacji i znacznik wersji się nie zmieniają.

### Model danych

Bez zmian. Nie dochodzi żaden klucz `localStorage` ani pole w istniejących. Klucze `kulki.game.v1`, `kulki.best.v1` i `kulki.sound.v1` zachowują kształt i znaczenie, więc dane zapisane przez poprzednią wersję są czytane bez migracji (S16). Zaznaczenie, podskakiwanie, licznik cykli i preferencja ruchu to stan ekranu: nie są zapisywane. Specyfikacja nie oznacza żadnych danych jako osobowe.

### Kontrakty API

Gra nadal nie ma API sieciowego. **Interfejs testowy `window.__kulki` się nie zmienia:** te same cztery metody i te same pola `getState()`. Wszystkie nowe informacje dla testów są w DOM i w stylach obliczonych. Poniższe pozycje są dodatkami do kontraktu DOM ze specyfikacji gry i po wdrożeniu są chronione ([BACKWARD_COMPATIBILITY.md](../../BACKWARD_COMPATIBILITY.md)).

#### Kontrakt DOM: podskakiwanie (krok W i etap 1)

| Element | `data-testid` | Atrybuty stanu | Od |
|---|---|---|---|
| Kulka na polu | `ball-{wiersz}-{kolumna}` | brak własnych; dziecko pola `cell-{wiersz}-{kolumna}`, zawsze w DOM (81 elementów), niewidoczne, gdy pole ma `data-color="0"` | W |
| Pole | `cell-{wiersz}-{kolumna}` | dodatkowo `data-bouncing="true"\|"false"` | 1 |
| Plansza | `board` | dodatkowo `data-bounce-cycles="0"`, `"1"`, … | 1 |

| Co test odczytuje | Skąd |
|---|---|
| czy kulka na polu podskakuje | `data-bouncing` pola; `"true"` tylko wtedy, gdy animacja jest uruchomiona |
| liczba ukończonych cykli | `data-bounce-cycles` planszy: cykle ukończone przez obecnie podskakującą kulkę od chwili, gdy zaczęła; `"0"`, gdy nic nie podskakuje |
| ustawiony czas cyklu | obliczone `animation-duration` elementu kulki na polu z `data-bouncing="true"` (np. `0.6s`); równe `BOUNCE_CYCLE_MS` |
| widoczne położenie i rozmiar kulki | `getBoundingClientRect()` elementu `ball-…` (uwzględnia `transform`) |
| stan domyślny kulki | obliczone `transform` równe `none` i brak animacji na elemencie kulki |
| wyróżnienie nieruchome | obliczone `outline-style` pola różne od `none` i `outline-width` co najmniej 2 px; pole bez wyróżnienia ma `outline-style: none` |

Niezmienniki:

- Najwyżej jedno pole ma `data-bouncing="true"` i zawsze ma ono też `data-selected="true"` oraz `data-color` różne od `0`.
- Przy nieograniczonym ruchu `data-bouncing` jest równe `data-selected`. Przy ograniczonym ruchu `data-bouncing="false"` na wszystkich polach.
- `data-bouncing` i `data-bounce-cycles` zmieniają się synchronicznie w obsłudze kliknięcia; `data-animating` nie zależy od podskakiwania.
- Podskakiwanie jest animacją CSS widoczną w `element.getAnimations()` kulki, więc test może odczytać, w której chwili cyklu jest animacja (`currentTime`). Gdy nic nie jest zaznaczone i nie trwa animacja blokująca ani sygnał odmowy, `document.getAnimations()` jest puste.

#### Kontrakt DOM i stylów: wygląd (etap 2)

Nowe identyfikatory (istniejące zostają na swoich elementach):

| Element | `data-testid` | Uwagi |
|---|---|---|
| Tytuł gry | `title` | element `h1` |
| Panel wyniku | `score-panel` | ramka zawierająca `score-label` i `score` |
| Podpis wyniku | `score-label` | tekst „Wynik” |
| Panel najlepszego wyniku | `best-score-panel` | ramka zawierająca `best-score-label` i `best-score` |
| Podpis najlepszego wyniku | `best-score-label` | tekst „Najlepszy wynik” |
| Podpis podglądu | `preview-label` | tekst „Następne kulki”; panelem podglądu jest istniejący `preview` |
| Efekt CRT | `crt` | pusty, `aria-hidden="true"`, poza `app` |

Co testy odczytują ze stylów obliczonych:

| Kryterium | Odczyt |
|---|---|
| czcionka gry | po `document.fonts.ready`: w `document.fonts` jest wczytana czcionka o rodzinie `Press Start 2P`; pierwsza rodzina w `font-family` elementu to `Press Start 2P`; każdy znak napisu wyrenderowany czcionką elementu ma szerokość równą `font-size` (±0,5 px), co w czcionce zastępczej nie zachodzi |
| narożniki | `border-radius` równe `0px` na elementach interfejsu; `50%` na `ball-…` i `preview-ball` |
| twardy cień | `box-shadow` z jedną warstwą: przesunięcia dodatnie, rozmycie `0px`, rozszerzenie `0px` |
| wciśnięty przycisk | przy wciśniętym przycisku myszy `getBoundingClientRect()` przesunięte w prawo i w dół, a `box-shadow` mniejsze albo `none` |
| kolory kulek | zmienne `--c1`…`--c7` w `:root` |
| jeden motyw | kolory obliczone identyczne przy emulacji `prefers-color-scheme: light` i `dark` |
| kontrast | `color` napisu i `background-color` najbliższego przodka z nieprzezroczystym tłem; wzór WCAG na jasność względną |
| obszar efektu CRT | `getBoundingClientRect()` elementu `crt` obejmuje całe okno, a więc `app`, `confirm-dialog` i `game-over` |
| efekt nie przechwytuje kliknięć | `pointer-events: none`; kliknięcia testów trafiają w elementy gry |

Elementy interfejsu, których dotyczą narożniki i cień: `board` (narożniki), pola (narożniki), `score-panel`, `best-score-panel`, `preview`, `new-game`, `sound-toggle`, `confirm-dialog`, `confirm-yes`, `confirm-no`, `game-over`, `game-over-new-game`.

#### Narzędzie `tools/embed-fonts.js`

```js
/**
 * @param {string} css arkusz z adresami url('./fonts/<plik>')
 * @param {Record<string, Uint8Array>} fonts zawartość plików z src/fonts/ według nazwy
 * @returns {string} arkusz, w którym każdy taki adres jest adresem data:
 * @throws {Error} gdy arkusz wskazuje plik, którego nie ma w `fonts`
 */
export function embedFonts(css, fonts) {}
```

Funkcja nie czyta dysku i nie zmienia niczego poza adresami czcionek. Po jej zadziałaniu test integracyjny „jednego pliku” (CSS zawiera wyłącznie adresy `data:`) przechodzi bez zmian.

**Walidacja wejścia gracza.** Bez zmian: jedynym wejściem są kliknięcia i te same kliknięcia są ignorowane co dotąd. Podskakiwanie i efekt CRT nie dodają ani nie odbierają żadnego kliknięcia.

### Integracje

Brak. Czcionka jest plikiem w repozytorium wklejanym do produktu przy budowaniu; nie ma dostawcy, trybu atrapy ani sekretów. Jedyna nowa zależność od środowiska to API przeglądarki `matchMedia`, które może nie istnieć (wtedy ruch jest nieograniczony), oraz obsługa `@font-face` z adresem `data:` (gdy zawiedzie, działa czcionka zastępcza).

Licencja czcionki (SIL OFL 1.1, zastrzeżona nazwa „Press Start 2P”) wymaga, żeby plik pozostał niezmieniony i żeby `OFL.txt` leżał obok niego w repozytorium.

### Plan implementacji

Każdy krok kończy się przechodzącą bramką walidacji i zostawia działającą aplikację. Testy E2E trafiają do `tests/e2e/s<numer>-<nazwa>.spec.js`; tytuł testu zaczyna się od numeru scenariusza. Kryteria `[ręcznie]` nie mają testu i zostają do akceptacji właściciela; w PR opisuje się, jak je obejrzeć.

Istniejących asercji w testach S1–S9 nie wolno zmieniać (S16). Jeśli któryś krok wymaga zmiany takiej asercji, to znak, że złamał kontrakt.

**Zależności między etapami**

| Etap | Zależy od | Uwagi |
|---|---|---|
| Krok wspólny W | nic | mała zmiana bez widocznego skutku |
| 1. Podskakująca kulka | W | działa w obecnym wyglądzie |
| 2. Wygląd retro arcade | W | niezależny od etapu 1; kroki 2.1 i 2.5 nie zależą nawet od W |
| Krok R (S16) | W | testy regresji; można robić równolegle z etapami |

Etapy 1 i 2 nie zależą od siebie. Wspólny krok W istnieje po to, żeby żaden z nich nie musiał czekać na drugi: oba potrzebują kulki jako elementu (etap 1 do animacji i pomiaru, etap 2 do sprawdzenia, że kulki są okrągłe).

#### Krok wspólny W

| Krok | Zakres | Testy | Zależy od |
|---|---|---|---|
| W | Kulka planszy jako element `ball-{wiersz}-{kolumna}` w każdym polu zamiast pseudoelementu `::after`; widoczność i kolor z `data-color` pola; wygląd bez zmian | integracyjny: 81 elementów kulek, po jednym w polu; E2E: kulka widoczna tylko na polu z kolorem, ma ten sam rozmiar i położenie co dotąd (12% marginesu), komplet testów S1–S9 przechodzi bez zmian | |

#### Etap 1: podskakująca kulka (S10–S13). Zależy od W

| Krok | Zakres | Testy | Zależy od |
|---|---|---|---|
| 1.1 | `BOUNCE_CYCLE_MS` w `timing.js`; `src/ui/motion.js` (preferencja ruchu, brak `matchMedia`, zmiana w trakcie); czysta funkcja „które pole podskakuje” w `src/ui/bounce.js` | jednostkowe: stała w przedziale 300–1000; moduł ruchu z zastępczym `matchMedia`, bez niego i ze zdarzeniem zmiany; funkcja dla każdej kombinacji zaznaczenia i preferencji | |
| 1.2 | `data-bouncing` na polach, animacja CSS kulki, `--bounce-ms`, wyróżnienie nieruchome tylko dla pola zaznaczonego bez podskakiwania; zatrzymanie przy odznaczeniu, zmianie kulki, nowej grze, `setState`, odświeżeniu | integracyjny: atrybuty po kliknięciach; E2E S10 (podskakuje, jedna kulka, położenie się zmienia i mieści w polu, czas cyklu, `data-animating="false"`); E2E S11 (wszystkie kryteria) | W, 1.1 |
| 1.3 | Licznik `data-bounce-cycles`; podskakiwanie a ruch, odmowa, zbicie, dolosowanie, koniec gry | E2E S10 (licznik rośnie o 3 bez akcji gracza); E2E S12 (ruch, odmowa, koniec wszystkich animacji, rejestr dźwięków się nie wydłuża) | 1.2 |
| 1.4 | Ograniczony ruch: brak podskakiwania i obwódka; reakcja na zmianę ustawienia w trakcie gry | E2E S13 z `page.emulateMedia({ reducedMotion })`, także przełączenie przy zaznaczonej kulce | 1.2 |

Kroki 1.3 i 1.4 są od siebie niezależne. Krok 1.1 nie zależy od W i można go zacząć od razu.

#### Etap 2: wygląd retro arcade (S14, S15). Zależy od W

| Krok | Zakres | Testy | Zależy od |
|---|---|---|---|
| 2.1 | `tools/embed-fonts.js`, wywołanie w `tools/build.js`, `@font-face`, stos czcionek, rozmiary czcionki jako zmienne; układ nadal mieści się w 1024×768 | jednostkowe `embedFonts` (zamiana, brak pliku, powtarzalność); integracyjny: jedna reguła `@font-face` z adresem `data:`, brak `OFL` w pliku; E2E S14: czcionka gry na wszystkich napisach, w oknach, dla 18 znaków, bez sieci i z `file://` | |
| 2.2 | Paleta jako zmienne, jeden ciemny motyw, jednolite tła pod napisami, kolory sygnału odmowy i wyróżnienia z palety | E2E S14: motyw jasny i ciemny dają te same kolory, jasność tła ≤ 0,05, kontrast ≥ 4,5:1, kolory `--c1`…`--c7` | 2.1 |
| 2.3 | Identyfikatory `title`, `score-panel`, `score-label`, `best-score-panel`, `best-score-label`, `preview-label`; tablica wyników; miejsce na okna dialogowe przy 1024×768 | E2E S14: liczba większa od podpisu, wynik 0 i sześciocyfrowy w panelu, całość i oba okna bez przewijania i bez uciętych napisów | 2.2 |
| 2.4 | Proste narożniki, twardy cień, stan wciśnięcia przycisków | E2E S14: narożniki elementów interfejsu i okrągłe kulki, cień, wciśnięcie i puszczenie każdego przycisku | W, 2.3 |
| 2.5 | Element `crt` w szablonie, linie skanowania i winieta, poświata napisów | integracyjny: element `crt` pusty, z `aria-hidden`, poza `app`; E2E S15 (obszar, kliknięcia, brak animacji i identyczne zrzuty, brak tekstu, drzewo dostępności) | |

Kroki 2.1–2.4 zmieniają te same reguły w `src/styles.css`, więc wykonuje się je po kolei. Krok 2.5 dotyka tylko szablonu i własnego bloku CSS; można go robić równolegle z pozostałymi.

#### Krok R: gra działa jak dotąd (S16). Zależy od W

| Krok | Zakres | Testy | Zależy od |
|---|---|---|---|
| R | Testy regresji bez zmian w produkcie: dane zapisane przez poprzednią wersję, gra z `file://` | E2E S16: trzy klucze `localStorage` w formacie v1 wpisane przed startem są odczytane i pokazane; ruch ze zbiciem linii z `E2E_FILE_URL` bez błędów strony | W |

Pozostałe kryteria S16 mają już testy: jeden plik bez zasobów zewnętrznych (`tests/integration/single-file.test.js`), scenariusze S1–S9 (`tests/e2e/`), P1, P2 i P4 (`tests/postdeploy/`, w bramce w trybie atrapy). Czcionkę gry i efekt CRT przy `file://` sprawdzają kroki 2.1 i 2.5.

#### Wskazówki do testów

- Czas w testach: nie używać stałych opóźnień. Na cykle czekać asercją z ponawianiem na `data-bounce-cycles`; położenie kulki w kilku chwilach cyklu zbierać w `page.evaluate` pętlą `requestAnimationFrame`; chwilę cyklu odczytywać z `getAnimations()`.
- Ograniczony ruch i motyw systemu: `page.emulateMedia({ reducedMotion: 'reduce' })` i `page.emulateMedia({ colorScheme: 'light' | 'dark' })`; działają we wszystkich trzech silnikach.
- Przed pomiarem układu i czcionki: `await page.evaluate(() => document.fonts.ready)`.
- Brak żądań sieciowych: nasłuch `page.on('request')`; dozwolone jest tylko pobranie dokumentu, adresy `data:` nie są żądaniami sieciowymi.
- Wspólne pomocniki nowych scenariuszy (pomiar kulki, sprawdzenie czcionki, kontrast) trafiają do `tests/e2e/helpers/`, po jednym pliku na temat, żeby kroki nie edytowały tego samego pliku.
- Przebiegi równoległe: `scripts/test-e2e.sh --workers 2` z własnym `E2E_RUN_ID`; testy podskakiwania zależą od czasu tak jak S2 i S3.

#### Miejsca wspólne przy pracy równoległej

- `src/styles.css`: zmienia go każdy krok poza 1.1 i R. Etap 1 dopisuje własny blok (kulka, podskakiwanie, wyróżnienie nieruchome) i z istniejących reguł zmienia tylko `.cell[data-selected='true']` oraz regułę kulki. Etap 2 przepisuje wygląd pozostałych reguł. Gdy etapy idą równolegle, drugi w kolejności rozwiązuje konflikt w regule wyróżnienia, nadając jej kolor z palety.
- `src/ui/app.js`: krok W (budowanie pól), 1.2–1.4 (zaznaczenie) i 2.3 (panele i identyfikatory). Nowa logika trafia do nowych modułów (`bounce.js`, `motion.js`), a w `app.js` zostają tylko wywołania.
- `tools/build.js` i `src/index.html`: tylko kroki 2.1 i 2.5.
- `src/ui/texts.js`, `src/test-api.js`, `src/game/`, `src/storage/`, `src/audio/`: żaden krok ich nie zmienia.
