# Kulki

Przeglądarkowa gra logiczna dla jednego gracza, inspirowana Color Lines / Kulki 98. Produktem jest jeden samodzielny plik `index.html`, który działa bez internetu.

- Specyfikacja: [.ai/specs/2026-10-04-gra-w-kulki.md](.ai/specs/2026-10-04-gra-w-kulki.md)
- Specyfikacja podskakującej kulki i wyglądu retro arcade: [.ai/specs/2026-10-05-podskakujaca-kulka-i-wyglad-retro.md](.ai/specs/2026-10-05-podskakujaca-kulka-i-wyglad-retro.md)
- Stos technologiczny: [docs/adr/0001-stos-technologiczny.md](docs/adr/0001-stos-technologiczny.md)
- Zasady pracy w repozytorium: [AGENTS.md](AGENTS.md)

## Jak zagrać

Gra jest dostępna pod adresem https://cieyhomelab.github.io/kulki/. Po każdej zmianie w `main` z zielonymi testami nowa wersja trafia tam automatycznie (workflow „Publikacja”).

### Ponowienie publikacji

Właściciel może powtórzyć publikację ręcznie: w repozytorium na GitHubie otwórz **Actions**, wybierz workflow „Publikacja”, kliknij **Run workflow** i zostaw gałąź `main`. Przebiega cały proces jak po zmianie w `main`: testy, umieszczenie gry pod adresem, sprawdzenie po publikacji; pod adresem trafia aktualna wersja z `main`. Uruchomienie dla innej gałęzi uruchamia testy, ale niczego nie publikuje.

Albo zbuduj ją sam:

```bash
scripts/build.sh          # tworzy dist/index.html
```

Otwórz `dist/index.html` w przeglądarce albo uruchom hosting statyczny:

```bash
docker compose up --build # http://localhost:8080 (port zmienisz przez WEB_PORT)
```

## Praca nad kodem

Wymagania: Node.js ≥ 20.19, npm, Docker z Compose (tylko do testów E2E i uruchamiania przez Compose).

```bash
scripts/lint.sh              # ESLint, Prettier, sprawdzanie typów
scripts/test-unit.sh         # testy jednostkowe
scripts/test-integration.sh  # testy integracyjne na zbudowanym pliku
scripts/test-e2e.sh          # Playwright w Docker Compose
scripts/build.sh             # dist/index.html
```

## Licencje

Kod gry: MIT ([LICENSE](LICENSE)). Czcionka Press Start 2P (© 2012 The Press Start 2P Project Authors) jest rozpowszechniana na licencji SIL Open Font License 1.1; jej treść: [src/fonts/OFL.txt](src/fonts/OFL.txt).
