# Kulki

Przeglądarkowa gra logiczna dla jednego gracza, inspirowana Color Lines / Kulki 98. Produktem jest jeden samodzielny plik `index.html`, który działa bez internetu.

- Specyfikacja: [.ai/specs/2026-10-04-gra-w-kulki.md](.ai/specs/2026-10-04-gra-w-kulki.md)
- Stos technologiczny: [docs/adr/0001-stos-technologiczny.md](docs/adr/0001-stos-technologiczny.md)
- Zasady pracy w repozytorium: [AGENTS.md](AGENTS.md)

## Jak zagrać

Gra jest dostępna pod adresem https://cieyhomelab.github.io/kulki/. Po każdej zmianie w `main` z zielonymi testami nowa wersja trafia tam automatycznie (workflow „Publikacja”).

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
