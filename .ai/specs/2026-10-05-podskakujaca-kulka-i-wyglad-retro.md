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

> Uzupełnia architekt po zatwierdzeniu specyfikacji: architektura, model danych, kontrakty API, plan implementacji.
