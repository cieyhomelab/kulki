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

Decyzja o sposobie publikacji i odrzucone alternatywy: [ADR 0002](../../docs/adr/0002-publikacja-na-github-pages.md). Stos produktu i narzędzi się nie zmienia ([ADR 0001](../../docs/adr/0001-stos-technologiczny.md)). Zasady pracy w repozytorium: [AGENTS.md](../../AGENTS.md).

### Architektura

Publikacja nie dodaje serwera ani kodu działającego u gracza. Składa się z czterech części: znacznika wersji wstawianego przy budowaniu, workflow GitHub Actions, małych narzędzi w `tools/` oraz testów sprawdzenia po publikacji.

**Komponenty**

| Komponent | Miejsce | Odpowiedzialność | Czego nie robi |
|---|---|---|---|
| Znacznik wersji | `tools/build.js`, `tools/inline.js`, `src/index.html` | wstawia `<meta name="kulki-version">` z wartością `KULKI_VERSION` albo `dev` | gra (`src/`) go nie czyta i nie pokazuje |
| Testy wspólne | `.github/workflows/tests.yml` | bramka walidacji; artefakt `index-html` i jego suma SHA-256 | niczego nie publikuje |
| CI dla PR | `.github/workflows/ci.yml` | woła `tests.yml` dla `pull_request` | nie ma uprawnień do Pages |
| Publikacja | `.github/workflows/publish.yml` | testy → bramka wersji → umieszczenie → sprawdzenie → wynik | nie buduje pliku drugi raz |
| Narzędzia publikacji | `tools/publish-gate.js`, `tools/pages-package.js`, `tools/publication-result.js` | decyzja „czy publikować”, paczka z jednym plikiem, wynik i kontrola historii | nie zawierają logiki w YAML-u |
| Sprawdzenie po publikacji | `tests/postdeploy/` (projekt Playwright `postdeploy`) | kryteria `[po publikacji]` z P1, P2 i P4 | niczego nie zmienia pod adresem |
| Testy konfiguracji | `tests/unit/workflows/` | kryteria `[konfiguracja]` z P2, P3 i P5 | nie uruchamiają workflow |
| Hosting | GitHub Pages, źródło „GitHub Actions”, środowisko `github-pages` | serwuje `index.html` pod adresem gry | |

**Przepływ publikacji** (`publish.yml`, zadania w tej kolejności)

```
push do main / ręczne uruchomienie
  └─ tests (tests.yml)
       ├─ checks: lint → unit → integration → build (KULKI_VERSION = commit) → artefakt index-html + sha256
       └─ e2e:    scripts/test-e2e.sh na pliku z tą samą wersją; projekt postdeploy w trybie atrapy
                  porównuje sumę pliku serwowanego przez `web` z sha256 artefaktu
  └─ gate:   gałąź to main i commit jest jej czubkiem? → publish=true|false, deadline = teraz + 15 min
  └─ deploy: (tylko gdy publish=true) artefakt → paczka z jednym index.html → GitHub Pages
  └─ verify: scripts/test-e2e.sh --project postdeploy na żywym adresie, ponawianie do deadline
  └─ result: (zawsze) wynik publikacji w podsumowaniu przebiegu + kontrola wpisu w historii
```

Każde zadanie zależy przez `needs` od poprzedniego, więc niepowodzenie dowolnego kroku testów zatrzymuje wszystko przed `deploy` (P3). `result` ma `if: always()` i jako jedyne działa po niepowodzeniu.

**Jeden plik od testów do graczy.** Plik powstaje raz, w zadaniu `checks`. Zadanie `deploy` pobiera ten artefakt i go nie przebudowuje. Testy E2E działają na pliku zbudowanym w obrazie Dockera z tych samych źródeł i z tym samym `KULKI_VERSION`; budowanie musi być powtarzalne, a pilnuje tego test w projekcie `postdeploy`, który porównuje sumę SHA-256 odpowiedzi serwera z `POSTDEPLOY_SHA256`. Ten sam test działa dwa razy w jednej publikacji: przed umieszczeniem na stosie Compose (plik testowany = artefakt) i po umieszczeniu pod adresem gry (plik opublikowany = artefakt).

Stan zastany do naprawienia w kroku 1.1: dziś oba pliki się różnią. `scripts/build.sh` daje plik z dyrektywą `"use strict";`, a obraz Dockera bez niej, bo esbuild czyta `tsconfig.json`, którego `Dockerfile` nie kopiuje. Budowanie ma przestać zależeć od obecności tego pliku (`tsconfigRaw` w `tools/build.js` z `alwaysStrict: true`), tak żeby obowiązującą postacią był plik z `"use strict";`, czyli ten, który dziś dostają testy integracyjne i artefakt CI.

**Kolejność i brak równoległości.** `publish.yml` ma na poziomie workflow `concurrency: { group: publikacja, cancel-in-progress: false }`. Działa jedna publikacja naraz; z oczekujących GitHub zostawia tylko najnowszą, a starsze oczekujące anuluje (wynik `pominięta`). Trwająca publikacja nigdy nie jest przerywana. Zadanie `gate` dodatkowo odmawia, gdy commit przebiegu nie jest już czubkiem `main` (ponowne uruchomienie starego przebiegu) albo przebieg dotyczy innej gałęzi (P5). Drugą, niezależną barierą jest reguła środowiska `github-pages`, która dopuszcza wdrożenia tylko z gałęzi domyślnej; GitHub ustawia ją sam przy przełączeniu źródła Pages i nie należy jej luzować.

**Sprawdzenie po publikacji** korzysta z istniejącego `scripts/test-e2e.sh` i tego samego obrazu Playwrighta. Projekt `postdeploy` ma dwa tryby wybierane zmienną `POSTDEPLOY_URL`: atrapa (usługa `web` w sieci Compose, część zwykłej bramki) i na żywo (adres gry). Kolejność w projekcie: najpierw test gotowości czeka z ponawianiem, aż znacznik wersji pod adresem będzie równy oczekiwanemu (najpóźniej do `POSTDEPLOY_DEADLINE`), potem biegną pozostałe testy. Zalecana realizacja: osobny projekt-zależność Playwrighta (`dependencies`) z jednym plikiem gotowości. Każde pobranie omija pamięć podręczną: unikalny parametr w adresie (np. `?nocache=<losowy>`) i nagłówek `Cache-Control: no-cache`.

**Granice.** `src/` nie zmienia się poza szablonem `src/index.html` (miejsce na znacznik). Gra nie czyta znacznika, nie wykonuje żadnych żądań i nadal działa z `file://`. Workflow nie zapisuje niczego do repozytorium.

### Model danych

Nie ma bazy danych ani nowych danych gracza. Specyfikacja nie oznacza żadnych danych jako osobowe; publikacja niczego o graczach nie zbiera.

**Znacznik wersji** (jedyna nowa dana w produkcie)

| Cecha | Wartość |
|---|---|
| Postać | `<meta name="kulki-version" content="{wersja}" />` w `<head>`, dokładnie jeden |
| `{wersja}` | wartość zmiennej `KULKI_VERSION` przy budowaniu; gdy zmienna jest pusta albo nieustawiona: `dev` |
| Walidacja przy budowaniu | `dev` albo dokładnie 40 znaków `0-9a-f`; inna wartość kończy budowanie błędem |
| Widoczność | nie występuje w tekście widocznym na ekranie ani w `<title>`; `src/` go nie czyta |

**Wpis historii publikacji** to przebieg workflow `publish.yml`; nic nie jest zapisywane w repozytorium.

| Pole wpisu | Skąd |
|---|---|
| wersja | `head_sha` przebiegu |
| czas | `run_started_at` przebiegu |
| wynik | reguła poniżej, liczona z wyników zadań `gate`, `deploy`, `verify` |

**Reguła wyniku** (czysta funkcja w `tools/publication-result.js`, sprawdzana w tej kolejności):

1. `pominięta`, gdy `gate` nie zakończyło się powodzeniem albo `deploy` ma wynik `skipped`, albo przebieg został anulowany, zanim powstały zadania;
2. `udana`, gdy `deploy` i `verify` zakończyły się powodzeniem;
3. `nieudana` w każdym innym przypadku (błąd albo przerwanie `deploy`, błąd, przerwanie albo przekroczenie czasu `verify`).

Przerwanie `deploy` po przejściu bramki daje `nieudana`, bo nie wiadomo, czy plik został podmieniony; właściciel ponawia publikację.

**Migracje.** Brak. Zapis gracza w `localStorage` nie zmienia kształtu ani kluczy. Jest przypisany do adresu `https://cieyhomelab.github.io`, więc gracz zaczyna pod adresem gry z pustym zapisem niezależnie od tego, co miał w grze otwieranej z dysku.

### Kontrakty API

Nie ma API sieciowego. Kontraktami są: znacznik wersji (wyżej), zmienne środowiskowe, kształt workflow, polecenia narzędzi i odpowiedzi HTTP spod adresu gry. Znacznik, nazwa pliku `publish.yml` i identyfikatory zadań są chronione ([BACKWARD_COMPATIBILITY.md](../../BACKWARD_COMPATIBILITY.md), punkt 6).

#### Zmienne środowiskowe

Żadna nie jest sekretem. Każda trafia do `.env.example` w kroku, który ją wprowadza.

| Zmienna | Kto czyta | Znaczenie | Domyślnie |
|---|---|---|---|
| `KULKI_VERSION` | `tools/build.js`; `Dockerfile` (argument budowania etapu `build`); `compose.e2e.yml` | identyfikator wersji wstawiany do pliku | `dev` |
| `POSTDEPLOY_URL` | `tests/postdeploy/helpers/target.js` (istnieje od szkieletu) | adres sprawdzanej gry; ustawiona oznacza tryb na żywo | pusta: usługa `web` |
| `POSTDEPLOY_VERSION` | projekt `postdeploy` | oczekiwana wartość znacznika wersji | `dev` |
| `POSTDEPLOY_SHA256` | projekt `postdeploy` | oczekiwana suma SHA-256 pliku gry (64 znaki szesnastkowe) | suma pliku `dist/index.html` w kontenerze testów |
| `POSTDEPLOY_DEADLINE` | projekt `postdeploy` | czas (sekundy epoki Unix), do którego wolno ponawiać czekanie na wersję i na kody 404 | 30 s od startu testów |

`compose.e2e.yml` przekazuje zmienne `POSTDEPLOY_*` do usługi `e2e` i `KULKI_VERSION` do budowania obu usług.

#### Workflow

**`tests.yml`** (`on: workflow_call`, wejście `version`: napis, wymagane; wyjście `sha256`)

| Zadanie | Kroki | Uwagi |
|---|---|---|
| `checks` | `scripts/lint.sh`, `scripts/test-unit.sh`, `scripts/test-integration.sh`, `scripts/build.sh`, wysłanie artefaktu `index-html` | `KULKI_VERSION` = wejście `version` dla całego zadania; wyjście `sha256` |
| `e2e` | `scripts/test-e2e.sh` | `needs: checks`; `KULKI_VERSION` i `POSTDEPLOY_VERSION` = `version`, `POSTDEPLOY_SHA256` = `needs.checks.outputs.sha256` |

Kroki `run` wołają wyłącznie skrypty ze `scripts/`, bez `continue-on-error`. `scripts/build.sh` dopisuje `sha256=<suma>` do pliku wskazanego przez `GITHUB_OUTPUT`, gdy ta zmienna jest ustawiona.

**`ci.yml`**: `on: pull_request`; jedno zadanie `tests` z `uses: ./.github/workflows/tests.yml` i `version: ${{ github.event.pull_request.head.sha }}`; `permissions: contents: read`; `concurrency` jak dziś (anulowanie starszych przebiegów tego samego PR).

**`publish.yml`** (`name: Publikacja`)

| Element | Wartość |
|---|---|
| `on` | etap 1: `push` z `branches: [main]`; etap 2 dodaje `workflow_dispatch` bez wejść. Nic więcej |
| `permissions` (workflow) | `contents: read` |
| `concurrency` | `group: publikacja`, `cancel-in-progress: false` |
| `env` | `POSTDEPLOY_URL: https://cieyhomelab.github.io/kulki/` |

| Zadanie | `needs` | Warunek | Uprawnienia | Co robi |
|---|---|---|---|---|
| `tests` | | | | `uses: ./.github/workflows/tests.yml`, `version: ${{ github.sha }}` |
| `gate` | `tests` | | | `node tools/publish-gate.js`; wyjścia `publish` (`true`\|`false`) i `deadline` (teraz + 900 s) |
| `deploy` | `tests`, `gate` | `needs.gate.outputs.publish == 'true'` | `pages: write`, `id-token: write` | `environment: github-pages`; pobiera artefakt `index-html`, `node tools/pages-package.js`, `actions/upload-pages-artifact`, `actions/deploy-pages` |
| `verify` | `tests`, `gate`, `deploy` | | | `scripts/test-e2e.sh --project postdeploy` z `POSTDEPLOY_VERSION` = commit, `POSTDEPLOY_SHA256`, `POSTDEPLOY_DEADLINE`; `timeout-minutes: 25`; przy błędzie wysyła `test-results/` |
| `result` | `tests`, `gate`, `deploy`, `verify` | `always()` | `actions: read` | `node tools/publication-result.js`: wynik do podsumowania przebiegu; kontrola wpisu w historii |

Zadania `gate`, `deploy`, `verify` i `result` nie mają pola `name`, żeby nazwa zadania w API była równa identyfikatorowi. Zadania `gate`, `deploy` i `verify` nie mają `always()`, `!cancelled()` ani `continue-on-error`. Kroki `run` w `publish.yml` wołają tylko `scripts/*.sh` albo `node tools/*.js`. Akcje wyłącznie z `actions/*`, przypięte do wersji głównej aktualnej w dniu implementacji (dziś: `checkout@v5`, `setup-node@v5`, `upload-artifact@v5`, `download-artifact@v8`, `upload-pages-artifact@v5`, `deploy-pages@v5`).

#### Narzędzia w `tools/`

Każde ma czystą funkcję z testem jednostkowym w `tests/unit/` i cienką część wykonywalną. Wypisują krótki wynik na stdout, błędy na stderr, a wyjścia zadań dopisują do pliku z `GITHUB_OUTPUT`.

| Polecenie | Wejście | Zachowanie | Kod wyjścia |
|---|---|---|---|
| `node tools/publish-gate.js` | `GITHUB_REF`, `GITHUB_SHA`; czubek `main` z `git ls-remote origin refs/heads/main` | `publish=true` tylko gdy `GITHUB_REF` to `refs/heads/main` i `GITHUB_SHA` jest równy czubkowi; zawsze wypisuje powód | `0` także przy `publish=false`; różny od zera tylko gdy czubka nie da się odczytać |
| `node tools/pages-package.js <plik> <katalog>` | plik gry, katalog docelowy (ma nie istnieć), `EXPECTED_SHA256` | tworzy katalog z kopią pliku jako `index.html`, wypisuje pełną zawartość katalogu | różny od zera, gdy katalog zawiera cokolwiek poza jednym `index.html` albo suma pliku jest inna niż `EXPECTED_SHA256` |
| `node tools/publication-result.js` | `GATE_RESULT`, `DEPLOY_RESULT`, `VERIFY_RESULT` (z `needs.*.result`), `GITHUB_REPOSITORY`, `GITHUB_RUN_ID`, `GITHUB_SHA`, `GITHUB_TOKEN` | liczy wynik regułą z „Modelu danych”, dopisuje do `GITHUB_STEP_SUMMARY` linię `Wynik publikacji: <wynik>` z wersją; odczytuje ten przebieg i jego zadania przez API i sprawdza zgodność | różny od zera, gdy `head_sha` wpisu jest inny niż `GITHUB_SHA` albo wynik policzony z API jest inny niż policzony z `needs` |

#### Odczyt historii publikacji

- W przeglądarce: repozytorium → Actions → „Publikacja”. Wynik jest w podsumowaniu przebiegu.
- Przez API: `GET /repos/cieyhomelab/kulki/actions/workflows/publish.yml/runs` (pola `head_sha`, `run_started_at`, `status`, `conclusion`), a dla wyniku `GET /repos/cieyhomelab/kulki/actions/runs/{id}/jobs` i reguła z „Modelu danych” na zadaniach o nazwach `gate`, `deploy`, `verify`. Przebieg z `conclusion: cancelled` bez zadania `deploy` ma wynik `pominięta`.
- „Najnowszy wpis” w kryterium P2 to najnowszy przebieg, który nie czeka w kolejce; w chwili kontroli jest nim przebieg wykonujący kontrolę.

#### Odpowiedzi spod adresu gry (sprawdzane przez `postdeploy`)

| Żądanie | Oczekiwana odpowiedź | Tryb atrapy |
|---|---|---|
| `GET {adres}` | 200, treść o sumie `POSTDEPLOY_SHA256`, znacznik wersji równy `POSTDEPLOY_VERSION` | tak |
| `GET {adres}index.html` | 200, treść identyczna jak wyżej | tak |
| `GET http://cieyhomelab.github.io/kulki/` bez podążania za przekierowaniem | 301, `Location` zaczyna się od `https://` | nie (`test.skip(!isLive, …)`) |
| `GET {adres}{ścieżka}` dla każdej ścieżki z listy w P4 | 404 | tak |

### Integracje

| Integracja | Dostawca | Tryb atrapy | Sekrety |
|---|---|---|---|
| Hosting gry | GitHub Pages (wymaganie właściciela), publikacja artefaktem przez `actions/deploy-pages` | usługa `web` (nginx) ze stosu Compose: serwuje tylko `index.html`, na resztę odpowiada 404. Włączana brakiem `POSTDEPLOY_URL`. Nie odtwarza przekierowania na HTTPS ani opóźnienia hostingu | brak; `GITHUB_TOKEN` z `pages: write` i `id-token: write` |
| Odczyt historii publikacji | REST API GitHuba (Actions) | czysta funkcja reguły wyniku testowana jednostkowo na przykładowych odpowiedziach; wywołanie API tylko w zadaniu `result` | brak; `GITHUB_TOKEN` z `actions: read` |

Samo umieszczenie pliku (`deploy`) nie ma atrapy: da się je wykonać tylko z gałęzi `main` prawdziwego repozytorium. Dlatego całe zachowanie, które da się sprawdzić wcześniej, jest poza nim: paczka w `tools/pages-package.js`, decyzja w `tools/publish-gate.js`, a kształt workflow w testach konfiguracji.

**Wymagane sekrety:** brak.

**Czynność właściciela (jednorazowa):** Settings → Pages → Build and deployment → Source: „GitHub Actions”. Po przełączeniu GitHub tworzy środowisko `github-pages` z regułą „tylko gałąź domyślna”. Najlepiej wykonać ją przed scaleniem kroku 1.4; do pierwszej udanej publikacji pod adresem zostaje wtedy ostatnia strona z README. Jeśli przełączenie nastąpi po scaleniu, pierwsza publikacja ma wynik `nieudana`, a właściciel ponawia ją przyciskiem „Re-run all jobs” w tym przebiegu (bramka wersji na to pozwala, dopóki commit jest czubkiem `main`).

### Plan implementacji

Każdy krok kończy się przechodzącą bramką walidacji i zostawia działającą grę. Gra się nie zmienia; scenariusze S1–S9 muszą przechodzić po każdym kroku bez zmian w testach.

**Zależności między etapami**

| Etap | Zależy od | Uwagi |
|---|---|---|
| 1. Gra pod adresem (P1–P4) | nic (tylko szkielet z tego PR) | |
| 2. Ręczne ponowienie (P5) | etap 1 | jeden mały krok; dotyka `publish.yml` i jego testów |

**Szkielet z tego PR:** zależność `yaml` i `tests/unit/workflows/helpers/load-workflow.js` z testem istniejącego `ci.yml`; projekt Playwrighta `postdeploy` z `tests/postdeploy/helpers/target.js` i testem `smoke.spec.js`; przekazanie `POSTDEPLOY_URL` w `compose.e2e.yml`.

#### Etap 1: gra pod adresem (P1, P2, P3, P4)

| Krok | Zależy od | Zakres | Testy |
|---|---|---|---|
| 1.1 Znacznik wersji i powtarzalne budowanie | | znacznik `<!-- inline:version -->` w szablonie i `tools/inline.js`; `KULKI_VERSION` z walidacją w `tools/build.js`; `tsconfigRaw`; argument `KULKI_VERSION` w `Dockerfile` i `compose.e2e.yml`; `sha256` w `scripts/build.sh`; `POSTDEPLOY_SHA256` i `POSTDEPLOY_VERSION` w `compose.e2e.yml` | jednostkowe: wstawianie znacznika, walidacja wartości. Integracyjne: dokładnie jeden znacznik, wartość `dev`, brak wartości w tekście widocznym. `postdeploy` (atrapa): suma odpowiedzi równa oczekiwanej, `index.html` identyczny z adresem głównym, znacznik równy `POSTDEPLOY_VERSION` |
| 1.2 Sprawdzenie po publikacji | 1.1 | `tests/postdeploy/p1-gra-pod-adresem.spec.js`, `p2-wersja.spec.js`, `p4-tylko-gra.spec.js`; projekt gotowości z ponawianiem do `POSTDEPLOY_DEADLINE`; pomijanie pamięci podręcznej | wszystkie kryteria `[po publikacji]` z P1, P2 (wersja, brak wersji w tekście) i P4 (lista 404, plansza zamiast README) przechodzą w trybie atrapy; przekierowanie na HTTPS pominięte poza trybem na żywo |
| 1.3 Narzędzia publikacji | | `tools/publish-gate.js`, `tools/pages-package.js`, `tools/publication-result.js` | jednostkowe: bramka (inna gałąź, commit nie jest czubkiem, zgodność), paczka (jeden plik, zła suma, katalog z dodatkowym plikiem), reguła wyniku dla każdej kombinacji wyników zadań i dla przykładowych odpowiedzi API |
| 1.4 Workflow | 1.1, 1.2, 1.3 | `tests.yml`, `ci.yml` jako wywołanie, `publish.yml` (wyzwalacz `push` do `main`); aktualizacja `AGENTS.md`, `SDLC.md`, `BACKWARD_COMPATIBILITY.md` (punkt 4), `README.md` (adres gry) | `[konfiguracja]`: wyzwalacze `publish.yml` i `ci.yml` (P2); `concurrency` i warunek `deploy` (P2); `needs` i brak `continue-on-error`, pięć skryptów w `tests.yml` (P3); uprawnienia. Test z `tests/unit/workflows/ci.test.js` przenosi się na `tests.yml` |
| 1.5 Pierwsza publikacja i odbiór | 1.4 scalone | czynność właściciela (wyżej); bez zmian w kodzie poza ewentualnymi poprawkami | pierwsze udane sprawdzenie po publikacji potwierdza P1, P2, P4 na żywo; próby `[ręcznie]` z P2 i P3 opisane w PR albo w issue odbioru |

Kroki 1.1 i 1.3 są od siebie niezależne i mogą powstawać równolegle. Krok 1.2 można zacząć równolegle z 1.3.

Uwagi do kroków:

- **1.1:** po tym kroku plik z obrazu Dockera i plik ze `scripts/build.sh` mają tę samą sumę dla tej samej wartości `KULKI_VERSION`. Kontrola ręczna przed PR: porównać `sha256sum dist/index.html` z sumą pliku z etapu `web` obrazu.
- **1.2:** kryterium „brak wersji w tekście widocznym” ma sens tylko dla wersji będącej identyfikatorem commita; dla `dev` test sprawdza sam znacznik. W CI wersja jest identyfikatorem commita także w trybie atrapy, więc kryterium jest sprawdzane w każdym PR.
- **1.2:** testy stanu gry (ruch, odświeżenie, najlepszy wynik po zamknięciu karty) używają `window.__kulki` tak jak testy S1–S9 i działają w jednym kontekście przeglądarki; „zamknięcie karty” to zamknięcie strony i otwarcie nowej w tym samym kontekście.
- **1.4:** `publish.yml` nie da się uruchomić przed scaleniem do `main`. PR sprawdza go testami konfiguracji, a `tests.yml` działa w nim naprawdę przez `ci.yml`. Pierwszy prawdziwy przebieg jest w kroku 1.5; poprawki idą kolejnym PR.
- **1.5, próby ręczne:** dwie szybkie zmiany w `main` (P2); wersja z czerwonym testem (P3, wynik `pominięta`, adres bez zmian); błąd umieszczenia i błąd sprawdzenia (P3) wystarczy udokumentować na przebiegu, który wystąpił naturalnie, np. pierwszym przed przełączeniem źródła Pages; nie psujemy `main` celowo tylko po to.

#### Etap 2: ręczne ponowienie (P5). Zależy od etapu 1

| Krok | Zależy od | Zakres | Testy |
|---|---|---|---|
| 2.1 Ręczne uruchomienie | 1.4 | `workflow_dispatch` w `publish.yml`; opis w `README.md`, jak ponowić publikację | `[konfiguracja]`: `on` to dokładnie `push` do `main` i `workflow_dispatch`; ręczne uruchomienie nie ma osobnej ścieżki zadań (te same `needs`); bramka odmawia dla gałęzi innej niż `main` (test jednostkowy z 1.3). Próby `[ręcznie]` z P5 opisane w PR |

#### Miejsca wspólne przy pracy równoległej

- `tools/build.js`, `tools/inline.js`, `Dockerfile`, `compose.e2e.yml`: tylko krok 1.1.
- `tests/e2e/playwright.config.js`: tylko krok 1.2 (projekt gotowości).
- `.github/workflows/`: tylko kroki 1.4 i 2.1, po kolei.
- `.env.example`: kroki 1.1 i 1.2 dopisują swoje zmienne; konflikt rozwiązuje się przez zachowanie obu wpisów.
