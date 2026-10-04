# Publikacja gry na GitHub Pages

## TLDR

Gra „Kulki” ma być dostępna dla każdego pod publicznym adresem https://cieyhomelab.github.io/kulki/. Pod tym adresem jest wyłącznie gra, a nie dokumenty repozytorium. Nowa wersja trafia tam automatycznie po każdej zmianie w gałęzi `main`, ale tylko wtedy, gdy przeszły wszystkie testy.

## Problem i cel

Dziś w grę da się zagrać tylko po samodzielnym zbudowaniu pliku albo uruchomieniu Docker Compose. GitHub Pages jest w repozytorium włączone, ale pod adresem https://cieyhomelab.github.io/kulki/ widać stronę z treścią README zamiast gry. Dodatkowo publikowana jest cała gałąź `main`, więc dokumenty prywatnego repozytorium (README, specyfikacje, instrukcje dla agentów) są publicznie dostępne.

Cel: gracz wpisuje adres i od razu gra, właściciel niczego nie publikuje ręcznie, a dokumenty repozytorium nie są dostępne publicznie.

Sukces poznamy po tym, że:

- pod adresem otwiera się gra i da się rozegrać pełną partię,
- po zmianie w `main` z zielonymi testami nowa wersja jest pod adresem bez udziału człowieka,
- zmiana z czerwonymi testami nie trafia do graczy,
- adresy dokumentów repozytorium pod `https://cieyhomelab.github.io/kulki/` odpowiadają „nie znaleziono”.

## Użytkownicy i role

- **Gracz:** każda osoba znająca adres. Nie loguje się. Może grać; nie może niczego publikować.
- **Właściciel:** osoba z uprawnieniami do zapisu w repozytorium (dziś jedna). Scala zmiany do `main`, może sprawdzić, która wersja jest opublikowana, i ręcznie ponowić publikację. Po jednorazowym przełączeniu ustawień hostingu (patrz „Etapy dostarczenia”) nie wykonuje żadnej czynności, żeby publikacja się odbyła. To rola w procesie publikacji, nie w grze: gra nadal nie ma ról ani administratora.

Pojęcia używane dalej:

- **Adres gry:** `https://cieyhomelab.github.io/kulki/`.
- **Wersja:** konkretny commit gałęzi `main`, rozpoznawany po pełnym identyfikatorze commita.
- **Testy:** pełna bramka walidacji projektu (lint, testy jednostkowe, integracyjne, E2E i budowanie).
- **Publikacja:** jedno uruchomienie procesu „testy → umieszczenie gry pod adresem → sprawdzenie po publikacji” dla jednej wersji.
- **Sprawdzenie po publikacji:** automatyczny test, który po umieszczeniu gry otwiera adres gry z pominięciem pamięci podręcznej i potwierdza, że działa tam właściwa wersja (kryteria w P2).
- **Historia publikacji:** jedna lista publikacji w repozytorium na GitHubie, odczytywalna także przez API GitHuba. Każdy wpis ma: wersję, czas i wynik: `udana`, `nieudana` albo `pominięta` (testy nie przeszły albo publikację zastąpiła nowsza).

## Scenariusze

Scenariusze mają numery P1–P5, żeby nie myliły się ze scenariuszami S1–S9 ze specyfikacji gry ([2026-10-04-gra-w-kulki.md](2026-10-04-gra-w-kulki.md)).

Przy każdym kryterium podany jest sposób sprawdzenia:

- **[po publikacji]** test automatyczny uruchamiany pod adresem gry po każdej publikacji, jako część sprawdzenia po publikacji, w jednej przeglądarce. Pozostałe przeglądarki pokrywają testy S1–S9 na tym samym pliku przed publikacją.
- **[konfiguracja]** test automatyczny sprawdzający ustawienia procesu publikacji, bez wykonywania publikacji.
- **[ręcznie]** jednorazowa próba wykonana przy odbiorze etapu i opisana w PR; nie ma testu automatycznego, bo wymagałaby celowego zepsucia `main` albo awarii hostingu.

### P1: Gracz otwiera grę pod publicznym adresem

1. Gracz wpisuje adres gry w przeglądarce.
2. Widzi ekran gry, bez żadnej strony pośredniej: nową rozgrywkę albo, jeśli grał wcześniej w tej przeglądarce, wznowioną.
3. Gra w ten sam plik, który przeszedł testy.

**Kryteria akceptacji**

- [po publikacji] Zakładając opublikowaną grę, gdy ktokolwiek bez logowania otworzy adres gry, wtedy serwer odpowiada kodem 200 i widoczny jest ekran gry: plansza 9×9, wynik, najlepszy wynik, podgląd następnych kulek i przyciski.
- [po publikacji] Zakładając opublikowaną grę, gdy pobierze się `https://cieyhomelab.github.io/kulki/index.html`, wtedy odpowiedź ma kod 200 i treść identyczną z odpowiedzią spod adresu gry.
- [po publikacji] Zakładając opublikowaną grę, gdy porówna się treść odpowiedzi spod adresu gry z plikiem gry zbudowanym w tej publikacji, wtedy są identyczne co do bajta (ta sama suma SHA-256).
- [po publikacji] Zakładając opublikowaną grę, gdy wyśle się żądanie na `http://cieyhomelab.github.io/kulki/`, wtedy odpowiedzią jest przekierowanie (kod 301) na adres zaczynający się od `https://`.
- [po publikacji] Zakładając otwartą grę pod adresem gry, gdy strona się załaduje, wtedy przeglądarka nie wykonała żadnego żądania sieciowego poza pobraniem samej strony gry. Jedyny wyjątek to automatyczne żądanie przeglądarki o `favicon.ico`.
- [po publikacji] Zakładając otwartą grę pod adresem gry, gdy gracz zaznaczy kulkę i wskaże osiągalne puste pole, wtedy kulka przesuwa się na to pole, a w konsoli przeglądarki nie ma błędów. Jedyny wyjątek to wpis o braku `favicon.ico`.
- [po publikacji] Zakładając grę pod adresem gry z wykonanym co najmniej jednym ruchem, gdy gracz odświeży stronę, wtedy plansza, wynik i podgląd są takie same jak przed odświeżeniem (S8 działa pod adresem gry).
- [po publikacji] Zakładając grę pod adresem gry z najlepszym wynikiem większym od 0, gdy gracz zamknie kartę i otworzy adres ponownie w tej samej przeglądarce, wtedy najlepszy wynik jest zachowany (S7 działa pod adresem gry).

### P2: Automatyczna publikacja po zmianie w `main`

1. Właściciel scala zmianę do `main`.
2. Uruchamiają się testy.
3. Po zielonych testach gra zbudowana z tej wersji trafia pod adres gry.
4. Sprawdzenie po publikacji potwierdza, że pod adresem działa ta wersja. Nikt niczego nie klika.

**Kryteria akceptacji**

- [po publikacji] Zakładając nową wersję w `main`, dla której testy przeszły, gdy sprawdzenie po publikacji pobierze stronę spod adresu gry, wtedy identyfikator wersji odczytany z kodu HTML strony (bez uruchamiania gry) jest równy pełnemu identyfikatorowi commita, który wywołał tę publikację.
- [po publikacji] Zakładając umieszczenie gry pod adresem, gdy sprawdzenie po publikacji nie zobaczy właściwego identyfikatora wersji od razu, wtedy ponawia próbę; jeśli właściwa wersja pojawi się w ciągu 15 minut od zakończenia testów, publikacja ma wynik `udana`, a jeśli nie, `nieudana`.
- [po publikacji] Zakładając opublikowaną grę, gdy odczyta się tekst widoczny na ekranie gry, wtedy nie zawiera on pełnego identyfikatora commita ani jego pierwszych 7 znaków.
- [po publikacji] Zakładając zakończoną publikację, gdy odczyta się historię publikacji, wtedy najnowszy wpis ma wersję równą commitowi, który wywołał publikację, i wynik zgodny z wynikiem sprawdzenia po publikacji.
- [konfiguracja] Zakładając ustawienia procesu publikacji, gdy test je odczyta, wtedy publikację wywołuje wyłącznie zmiana w gałęzi `main` albo ręczne uruchomienie (P5); zmiany w PR i na innych gałęziach uruchamiają same testy.
- [konfiguracja] Zakładając ustawienia procesu publikacji, gdy test je odczyta, wtedy publikacje nie działają równolegle, a starsza wersja nigdy nie jest umieszczana pod adresem po nowszej.
- [ręcznie] Zakładając dwie wersje scalone do `main` w odstępie krótszym niż czas trwania testów, obie z zielonymi testami, gdy zakończą się wszystkie publikacje, wtedy pod adresem gry jest nowsza z nich; starsza może mieć w historii wynik `pominięta`.

### P3: Zepsuta wersja nie trafia do graczy

1. Do `main` trafia wersja, dla której testy nie przechodzą, albo umieszczenie gry pod adresem kończy się błędem.
2. Gra pod adresem się nie zmienia.
3. Gracze nadal grają w poprzednią wersję, a właściciel widzi w historii, co się stało.

**Kryteria akceptacji**

- [konfiguracja] Zakładając ustawienia procesu publikacji, gdy test je odczyta, wtedy umieszczenie gry pod adresem wymaga wcześniejszego powodzenia każdego kroku testów: lint, testy jednostkowe, integracyjne, E2E i budowanie.
- [ręcznie] Zakładając opublikowaną wersję A i nowszą wersję B w `main`, dla której co najmniej jeden test nie przeszedł, gdy testy się zakończą, wtedy identyfikator wersji pod adresem gry nadal wskazuje A, a wpis wersji B w historii publikacji ma wynik `pominięta`.
- [ręcznie] Zakładając opublikowaną wersję A i wersję B, dla której testy przeszły, ale umieszczenie gry pod adresem zakończyło się błędem, gdy właściciel otworzy adres gry, wtedy nadal działa wersja A, a wpis wersji B w historii publikacji ma wynik `nieudana`.
- [ręcznie] Zakładając wersję B umieszczoną pod adresem, dla której sprawdzenie po publikacji nie powiodło się, gdy właściciel odczyta historię publikacji, wtedy wpis wersji B ma wynik `nieudana`. Wersja B pozostaje pod adresem do następnej udanej publikacji; automatycznego powrotu do wersji A nie ma.

### P4: Dokumenty repozytorium nie są publiczne

1. Ktoś próbuje otworzyć pod adresem gry plik repozytorium inny niż gra.
2. Dostaje odpowiedź „nie znaleziono”.

**Kryteria akceptacji**

- [po publikacji] Zakładając udaną publikację, gdy pobierze się z pominięciem pamięci podręcznej każdy z adresów pod `https://cieyhomelab.github.io/kulki/`: `README.md`, `README.html`, `AGENTS.md`, `AGENTS.html`, `SDLC.html`, `CODE_REVIEW.html`, `BACKWARD_COMPATIBILITY.html`, `LICENSE`, `package.json`, `src/main.js`, `src/index.html`, `dist/index.html`, `docs/adr/0001-stos-technologiczny.html`, `.ai/specs/2026-10-04-gra-w-kulki.md`, `.ai/specs/2026-10-04-publikacja-na-github-pages.md`, wtedy każda odpowiedź ma kod 404. Przy pierwszej publikacji sprawdzenie ponawia próby do 15 minut, zanim uzna wynik za negatywny.
- [po publikacji] Zakładając udaną publikację, gdy pobierze się stronę spod adresu gry, wtedy zawiera ona planszę gry (element z `data-testid` planszy z kontraktu DOM), a nie zawiera tekstów „Jak zagrać” ani „Praca nad kodem” z README.
- [po publikacji] Zakładając paczkę plików przygotowaną do umieszczenia pod adresem, gdy test wypisze jej zawartość przed umieszczeniem, wtedy zawiera ona dokładnie jeden plik: `index.html`.

### P5: Ręczne ponowienie publikacji

1. Publikacja się nie udała z powodu awarii hostingu albo właściciel chce ją powtórzyć.
2. Właściciel uruchamia publikację ręcznie w repozytorium na GitHubie.
3. Przebiega cały proces jak w P2: testy, umieszczenie gry pod adresem, sprawdzenie po publikacji. Pod adres trafia aktualna wersja z `main`.

**Kryteria akceptacji**

- [ręcznie] Zakładając, że ostatnia wersja w `main` przechodzi testy, gdy właściciel uruchomi publikację ręcznie, wtedy testy są wykonywane ponownie, najpóźniej 15 minut po ich zakończeniu pod adresem gry jest ta wersja, a w historii publikacji jest nowy wpis z wynikiem `udana`.
- [konfiguracja] Zakładając ustawienia procesu publikacji, gdy test je odczyta, wtedy ręczne uruchomienie przechodzi przez te same kroki co publikacja automatyczna (P3, pierwsze kryterium) i umieszcza grę pod adresem tylko wtedy, gdy zostało uruchomione dla gałęzi `main`.
- [ręcznie] Zakładając ręczne uruchomienie wskazujące gałąź inną niż `main`, gdy proces się zakończy, wtedy gra pod adresem gry się nie zmieniła.

## Dane

Publikacja nie wprowadza nowych danych biznesowych.

- **Identyfikator wersji w pliku gry:** pełny identyfikator commita, z którego zbudowano plik. Zapisany w kodzie HTML strony tak, że da się go odczytać bez uruchamiania gry; niewidoczny na ekranie. Plik zbudowany poza procesem publikacji (lokalnie) ma w tym miejscu stałą wartość `dev`. To nowy, dodatkowy element produktu: rozszerza opis techniczny w specyfikacji gry, nie zmienia żadnego istniejącego kontraktu ani zachowania gry.
- **Historia publikacji:** dla każdej publikacji: wersja, czas, wynik (`udana`, `nieudana`, `pominięta`). Widoczna dla właściciela.
- **Dane gracza:** bez zmian względem specyfikacji gry: rozgrywka, najlepszy wynik i ustawienie dźwięku są zapisywane wyłącznie w przeglądarce gracza. Nic nie jest wysyłane na serwer.

Brak danych osobowych.

## Integracje zewnętrzne

- **GitHub Pages (wymaganie właściciela):** hosting gry pod adresem `https://cieyhomelab.github.io/kulki/`. Służy wyłącznie do serwowania pliku gry.

Sama gra nadal nie łączy się z żadnym serwerem ani usługą.

## Wymagania niefunkcjonalne

- **Adres (wymaganie właściciela):** `https://cieyhomelab.github.io/kulki/`, wyłącznie przez HTTPS (P1).
- **Dostęp:** publiczny, bez logowania. Repozytorium z kodem pozostaje prywatne.
- **Ten sam produkt:** opublikowana gra to dokładnie ten sam jeden plik, który przeszedł testy w danej publikacji (P1). Nie ma osobnej „wersji internetowej” gry. Wszystkie wymagania specyfikacji gry (jeden plik, brak zasobów z sieci, działanie po otwarciu z dysku) pozostają w mocy.
- **Czas publikacji:** właściwa wersja jest widoczna pod adresem gry dla żądania pomijającego pamięć podręczną najwyżej 15 minut po zakończeniu testów. Przekroczenie nie jest gwarancją do dotrzymania, tylko progiem: po nim publikacja dostaje wynik `nieudana` (P2).
- **Dostępność:** taka, jaką zapewnia GitHub Pages; projekt nie daje własnej gwarancji. Niepowodzenie testów albo umieszczenia gry pod adresem nigdy nie usuwa ani nie zmienia poprzednio opublikowanej wersji (P3).
- **Bezpieczeństwo:** publikacja odbywa się wyłącznie z gałęzi `main`, automatycznie albo na ręczne polecenie. Publikacja nie zawiera sekretów ani plików repozytorium poza grą (P4).
- **Język:** bez zmian, interfejs gry wyłącznie po polsku.
- **RODO:** nie dotyczy, brak danych osobowych. Hosting może we własnym zakresie zapisywać adresy IP odwiedzających; projekt tych danych nie zbiera i nie przetwarza.

## Przypadki brzegowe i błędy

- **Testy nie przeszły:** nic nie trafia pod adres, gracze widzą poprzednią wersję, wpis w historii ma wynik `pominięta` (P3).
- **Umieszczenie gry pod adresem zakończyło się błędem:** gracze widzą poprzednią wersję; wpis ma wynik `nieudana`; właściciel może ponowić publikację (P3, P5).
- **Sprawdzenie po publikacji nie powiodło się:** nowa wersja jest już pod adresem i tam zostaje; wpis ma wynik `nieudana`; właściciel naprawia przez kolejną zmianę w `main` albo ponowienie (P3, P5).
- **Dwie zmiany w `main` jedna po drugiej:** ostatecznie opublikowana jest nowsza; starsza nigdy nie nadpisuje nowszej i może zostać pominięta (P2).
- **Pierwsza publikacja:** zastępuje obecną stronę z treścią README; od tej chwili dokumenty repozytorium nie są dostępne pod adresem gry (P4).
- **Gracz ma otwartą grę w chwili publikacji:** gra dalej bez zakłóceń w starej wersji; nową dostaje po odświeżeniu strony. Zapisana rozgrywka, najlepszy wynik i ustawienie dźwięku są zachowane na zasadach specyfikacji gry.
- **Przeglądarka pokazuje starą wersję z pamięci podręcznej:** informacyjnie, nie jako kryterium: hosting pozwala przeglądarce trzymać stronę przez około 10 minut, więc gracz, który był na stronie tuż przed publikacją, może przez ten czas widzieć starą wersję. Projekt tego nie skraca.
- **Nieistniejący adres pod `/kulki/`:** odpowiedź 404 ze standardową stroną błędu hostingu; własna strona błędu nie jest wymagana.
- **Awaria GitHub Pages:** gra jest niedostępna pod adresem gry; nadal działa z pliku na dysku. Projekt nie zapewnia zapasowego hostingu.

## Poza zakresem

- Własna domena (inny adres niż `cieyhomelab.github.io/kulki`).
- Ograniczanie dostępu do gry (hasło, lista osób).
- Numer wersji albo data publikacji widoczne dla gracza.
- Osobne środowisko podglądowe dla zmian przed scaleniem do `main`.
- Wydania oznaczone numerami wersji i lista zmian dla graczy.
- Automatyczny powrót do poprzedniej wersji i cofanie publikacji jednym kliknięciem (cofnięcie odbywa się przez zmianę w `main`).
- Statystyki odwiedzin, analityka, powiadomienia o publikacji (e-mail, komunikator).
- Własna strona błędu 404, ikona strony, podgląd linku w mediach społecznościowych.
- Działanie gry bez internetu po wcześniejszym odwiedzeniu adresu (instalacja jako aplikacja).
- Zmiana widoczności repozytorium na publiczne.
- Jakiekolwiek zmiany w zasadach i wyglądzie gry.

## Etapy dostarczenia

1. **Etap 1, gra pod adresem:** po zmianie w `main` z zielonymi testami gra jest automatycznie publikowana pod adresem gry i zastępuje stronę z README; pod adresem jest wyłącznie gra; zepsuta wersja nie trafia do graczy; sprawdzenie po publikacji potwierdza wynik. Realizuje P1, P2, P3 i P4. Te cztery scenariusze opisują jeden proces i nie da się ich sensownie dostarczyć osobno: sprawdzenie po publikacji jest jedynym sposobem potwierdzenia P1 i P2, a blokada przy czerwonych testach wynika wprost z kolejności kroków. Etap obejmuje **jednorazową czynność właściciela**: przełączenie w ustawieniach repozytorium źródła GitHub Pages z „cała gałąź `main`” na publikację przez proces z tej specyfikacji. Wymaga ona uprawnień administratora i nie da się jej wykonać samym PR; inżynier opisuje ją krok po kroku w PR, a jej wykonanie potwierdza pierwsze udane sprawdzenie po publikacji (P4).
2. **Etap 2, ręczne ponowienie:** właściciel może uruchomić publikację ręcznie. Realizuje P5. Wymaga etapu 1.

## Założenia

Analityk zadał właścicielowi pięć pytań (poniżej). Właściciel nie wybrał odpowiedzi i polecił przyjąć rozsądne założenia bez dalszych pytań, więc we wszystkich przyjęto rekomendację analityka. **Do potwierdzenia przy zatwierdzaniu specyfikacji**, w szczególności pierwsze i ósme.

1. **Co ma być pod adresem? Przyjęto: tylko gra; dokumenty repozytorium przestają być publiczne.** Repozytorium jest prywatne, a obecna publiczna dostępność dokumentów wygląda na skutek uboczny, nie na decyzję.
2. **Kiedy publikujemy? Przyjęto: automatycznie po każdej zmianie w `main`.** To najprostsze dla właściciela i zgodne z tym, że `main` jest zawsze wersją gotową.
3. **Co przy czerwonych testach? Przyjęto: nie publikujemy, zostaje poprzednia wersja.** Gracz nie powinien dostać wersji, o której wiadomo, że jest zepsuta.
4. **Czy gracz widzi wersję? Przyjęto: nie.** Ekran gry się nie zmienia, a numer łatwo dodać później.
5. **Kto może grać? Przyjęto: każdy, kto zna adres.** Tak działa strona dziś i gra nie zawiera danych do ochrony.

Dalsze decyzje analityka, które nie padły w pytaniach:

6. **Identyfikator commita jest zapisany w pliku gry, niewidoczny na ekranie,** bo bez niego test nie odróżni nowej wersji od starej. Skutek: identyfikator commita prywatnego repozytorium jest publicznie odczytywalny z kodu strony; sam identyfikator nie ujawnia kodu ani nie daje dostępu.
7. **Próg 15 minut i ponawianie sprawdzenia,** bo hosting potrzebuje chwili na udostępnienie nowej wersji; wartość łatwo zmienić.
8. **Publikowany plik zawiera interfejs testowy `window.__kulki`,** bo specyfikacja gry przewiduje jeden produkt, a ten interfejs pozwala graczowi zmienić wyłącznie własną rozgrywkę w jego przeglądarce.
9. **Po nieudanym sprawdzeniu po publikacji nowa wersja zostaje pod adresem,** bo automatyczny powrót do starej wersji to osobna, większa funkcja; testy przed publikacją są główną ochroną.
10. **Ręczne ponowienie powtarza testy,** bo jedna ścieżka publikacji jest prostsza i bezpieczniejsza niż dwie.
11. **Historia publikacji jest prowadzona w repozytorium na GitHubie, a ręczne uruchomienie odbywa się tam samo,** bo właściciel już tam pracuje i nie potrzeba dodatkowego narzędzia.
12. **Publikację może uruchomić tylko osoba z uprawnieniami do zapisu w repozytorium.** To własność GitHuba, przyjęta bez osobnego testu.
13. **Publiczna strona z prywatnego repozytorium nadal będzie możliwa,** bo działa tak dziś na koncie właściciela; zależy to od planu konta na GitHubie.
14. **Pod adresem `cieyhomelab.github.io` nie ma innej strony, która używałaby zapisu w przeglądarce pod kluczami `kulki.*`.** Zapis w przeglądarce jest wspólny dla wszystkich stron tego konta; ryzyko kolizji przyjęto jako pomijalne.
15. **Nie ma własnej domeny, strony 404 ani powiadomień o publikacji,** bo nie są potrzebne, żeby gra działała pod wskazanym adresem.
16. **Specyfikacja gry nie zmienia się w części funkcjonalnej;** GitHub Pages jest jednym z „hostingów plików statycznych”, które już dopuszcza. Architekt dopisze identyfikator wersji do jej sekcji technicznych.

## Sekcje techniczne

> Uzupełnia architekt po zatwierdzeniu specyfikacji: architektura, model danych, kontrakty API, plan implementacji.
