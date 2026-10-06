# Kulki

A single-player browser puzzle game inspired by Color Lines / Kulki 98. The product is one
self-contained `index.html` file that works offline.

**[▶ Play it](https://cieyhomelab.github.io/kulki/)**

## How this was built

This game is the test project for my autonomous software house,
[cieyhomelab/sh-skills](https://github.com/cieyhomelab/sh-skills): a pipeline of Claude Code
skills running on [Cezar](https://github.com/open-mercato/cezar). I described the idea and
answered the analyst agent's questions; the agents wrote the specs and architecture decision
records, cut them into issues, and implemented, tested and reviewed each one. My role was
merging PRs.

- Built in two days (4–5 October 2026) through **42 merged PRs**.
- Every PR went through an engineer agent, a tester agent that runs the full suite and adds
  missing E2E tests, and a reviewer agent on a different model than the engineer.
- The history is all here: specs in [`.ai/specs/`](.ai/specs/), architecture decisions in
  [`docs/adr/`](docs/adr/), and the PR and issue threads with the agents' comments (marked 🤖).

The purpose was not the game itself but to find and fix weak spots in each stage of the
pipeline.

## Documents

The specs and ADRs are in Polish, the language I work in with the agents.

- Spec: [.ai/specs/2026-10-04-gra-w-kulki.md](.ai/specs/2026-10-04-gra-w-kulki.md)
- Spec for the bouncing ball and retro arcade look: [.ai/specs/2026-10-05-podskakujaca-kulka-i-wyglad-retro.md](.ai/specs/2026-10-05-podskakujaca-kulka-i-wyglad-retro.md)
- Tech stack: [docs/adr/0001-stos-technologiczny.md](docs/adr/0001-stos-technologiczny.md)
- Rules for working in this repository: [AGENTS.md](AGENTS.md)

## How to play

The game is available at https://cieyhomelab.github.io/kulki/. After every change to `main`
with green tests, the new version is deployed there automatically (the "Publikacja" workflow).

### Re-running the deployment

The owner can repeat the deployment manually: on GitHub open **Actions**, choose the
"Publikacja" workflow, click **Run workflow** and keep the `main` branch. The whole process runs
as after a change to `main`: tests, deployment, post-deployment check; the current version from
`main` is published. Running it for another branch runs the tests but publishes nothing.

Or build it yourself:

```bash
scripts/build.sh          # creates dist/index.html
```

Open `dist/index.html` in a browser or start a static host:

```bash
docker compose up --build # http://localhost:8080 (change the port with WEB_PORT)
```

## Working on the code

Requirements: Node.js ≥ 20.19, npm, Docker with Compose (only for E2E tests and running via
Compose).

```bash
scripts/lint.sh              # ESLint, Prettier, type checking
scripts/test-unit.sh         # unit tests
scripts/test-integration.sh  # integration tests on the built file
scripts/test-e2e.sh          # Playwright in Docker Compose
scripts/build.sh             # dist/index.html
```

## Licences

Game code: MIT ([LICENSE](LICENSE)). The Press Start 2P font (© 2012 The Press Start 2P Project
Authors) is distributed under the SIL Open Font License 1.1; see
[src/fonts/OFL.txt](src/fonts/OFL.txt).
