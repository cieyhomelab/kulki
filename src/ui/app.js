import { boardToRows } from '../game/board.js';
import { gameFromSnapshot, newGame, playTurn } from '../game/game.js';
import { TEXTS } from './texts.js';
import { CLEAR_MS, REJECT_MS, SPAWN_MS, moveStepMs } from './timing.js';

const BOARD_SIZE = 9;
const PREVIEW_SIZE = 3;

/**
 * Creates an element with optional attributes and text.
 *
 * @param {Document} doc
 * @param {string} tag
 * @param {Record<string, string>} [attrs]
 * @param {string} [text]
 * @returns {HTMLElement}
 */
function el(doc, tag, attrs = {}, text) {
  const node = doc.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    node.setAttribute(name, value);
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

/**
 * Builds a labelled value box (score, best score).
 *
 * @param {Document} doc
 * @param {string} label
 * @param {string} testId
 * @returns {HTMLElement}
 */
function statBox(doc, label, testId) {
  const box = el(doc, 'div', { class: 'stat' });
  box.append(
    el(doc, 'span', { class: 'stat-label' }, label),
    el(doc, 'span', { class: 'stat-value', 'data-testid': testId }, '0'),
  );
  return box;
}

/**
 * @param {Document} doc
 * @returns {HTMLElement}
 */
function buildBoard(doc) {
  const board = el(doc, 'div', {
    class: 'board',
    'data-testid': 'board',
    'data-animating': 'false',
    'data-rejected': 'false',
    role: 'grid',
    'aria-label': TEXTS.boardLabel,
  });
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      board.append(
        el(doc, 'div', {
          class: 'cell',
          'data-testid': `cell-${row}-${col}`,
          'data-color': '0',
          'data-selected': 'false',
        }),
      );
    }
  }
  return board;
}

/**
 * @param {Document} doc
 * @returns {HTMLElement}
 */
function buildPreview(doc) {
  const preview = el(doc, 'div', { class: 'preview', 'data-testid': 'preview' });
  const balls = el(doc, 'div', { class: 'preview-balls' });
  for (let i = 0; i < PREVIEW_SIZE; i += 1) {
    balls.append(
      el(doc, 'span', {
        class: 'preview-ball',
        'data-testid': 'preview-ball',
        'data-color': '1',
      }),
    );
  }
  preview.append(el(doc, 'span', { class: 'stat-label' }, TEXTS.nextBalls), balls);
  return preview;
}

/**
 * @param {Document} doc
 * @returns {HTMLElement}
 */
function buildSoundToggle(doc) {
  const button = el(
    doc,
    'button',
    {
      type: 'button',
      class: 'button',
      'data-testid': 'sound-toggle',
      'aria-pressed': 'true',
    },
    TEXTS.soundOn,
  );
  button.addEventListener('click', () => {
    const on = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(on));
    button.textContent = on ? TEXTS.soundOn : TEXTS.soundOff;
  });
  return button;
}

/**
 * Boots the application inside the given document, starts a new game and draws it.
 *
 * Sets `data-ready="true"` on the root element once the UI is usable, so tests can wait for the
 * app instead of guessing with timeouts.
 *
 * @param {Document} doc
 * @param {import('../game/rng.js').Rng} rng randomness source for new games
 * @returns {AppController}
 */
export function startApp(doc, rng) {
  const root = doc.getElementById('app');
  if (!root) {
    throw new Error('Application root element #app not found');
  }
  const app = root;

  const header = el(doc, 'header', { class: 'topbar' });
  header.append(
    el(doc, 'h1', {}, TEXTS.title),
    statBox(doc, TEXTS.score, 'score'),
    statBox(doc, TEXTS.bestScore, 'best-score'),
  );

  const side = el(doc, 'div', { class: 'controls' });
  side.append(
    buildPreview(doc),
    el(
      doc,
      'button',
      { type: 'button', class: 'button', 'data-testid': 'new-game' },
      TEXTS.newGame,
    ),
    buildSoundToggle(doc),
  );

  const main = el(doc, 'div', { class: 'layout' });
  main.append(buildBoard(doc), side);

  root.replaceChildren(header, main);

  /** @type {import('../game/game.js').GameState} */
  let game = newGame(rng);
  // The best score lives in memory only until stage 2 adds persistence.
  let best = 0;

  // Selection, animation and the rejection signal are interface state, not game state.
  /** @type {number | null} */
  let selected = null;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let moveTimer;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let rejectTimer;

  /** @param {string} testId */
  const byTestId = (testId) =>
    /** @type {HTMLElement} */ (root.querySelector(`[data-testid="${testId}"]`));

  const boardEl = byTestId('board');
  const cells = /** @type {HTMLElement[]} */ (
    Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) =>
      byTestId(`cell-${Math.floor(index / BOARD_SIZE)}-${index % BOARD_SIZE}`),
    )
  );

  function clearRejection() {
    clearTimeout(rejectTimer);
    boardEl.dataset.rejected = 'false';
  }

  /** Drops selection, animation and rejection when the game is replaced. */
  function resetInterface() {
    clearTimeout(moveTimer);
    boardEl.dataset.animating = 'false';
    clearRejection();
    selected = null;
  }

  function render() {
    game.board.forEach((color, index) => {
      cells[index].dataset.color = String(color);
      cells[index].dataset.selected = String(index === selected);
    });
    byTestId('score').textContent = String(game.score);
    byTestId('best-score').textContent = String(Math.max(best, game.score));
    app.querySelectorAll('[data-testid="preview-ball"]').forEach((ball, i) => {
      /** @type {HTMLElement} */ (ball).dataset.color = String(game.preview[i]);
    });
  }

  // The confirmation dialog for a game in progress arrives with a later step; for now the button
  // simply starts a new game.
  byTestId('new-game').addEventListener('click', () => {
    resetInterface();
    best = Math.max(best, game.score);
    game = newGame(rng);
    render();
  });

  function reject() {
    clearTimeout(rejectTimer);
    // Re-arming the attribute restarts the CSS animation when the signal is already showing.
    boardEl.removeAttribute('data-rejected');
    void boardEl.offsetWidth;
    boardEl.dataset.rejected = 'true';
    rejectTimer = setTimeout(clearRejection, REJECT_MS);
  }

  /**
   * @param {number} score value to show in the score box
   * @param {number} bestBefore best score before the turn; the best box shows the larger of both
   */
  function showScores(score, bestBefore) {
    byTestId('score').textContent = String(score);
    byTestId('best-score').textContent = String(Math.max(bestBefore, score));
  }

  /**
   * Plays the events of an already computed turn one after another on a copy of the board the
   * player saw. The score on screen changes at each `cleared` event; the final render shows the
   * logical state.
   */
  function playEvents(
    /** @type {import('../game/game.js').TurnEvent[]} */ events,
    /** @type {readonly number[]} */ before,
    /** @type {number} */ scoreBefore,
    /** @type {number} */ bestBefore,
  ) {
    const shown = before.slice();
    let shownScore = scoreBefore;
    let index = 0;
    boardEl.dataset.animating = 'true';

    const finish = () => {
      boardEl.dataset.animating = 'false';
      render();
    };

    const next = () => {
      const event = events[index];
      index += 1;
      if (event === undefined || event.type === 'gameOver') {
        finish();
      } else if (event.type === 'moved') {
        animateMove(event, shown, next);
      } else if (event.type === 'cleared') {
        for (const cell of event.cells) shown[cell] = 0;
        shownScore += event.points;
        showScores(shownScore, bestBefore);
        paint(shown);
        moveTimer = setTimeout(next, CLEAR_MS);
      } else {
        event.cells.forEach((cell, i) => {
          shown[cell] = event.colors[i];
        });
        paint(shown);
        moveTimer = setTimeout(next, SPAWN_MS);
      }
    };
    next();
  }

  /** @param {readonly number[]} board */
  function paint(board) {
    board.forEach((color, i) => {
      cells[i].dataset.color = String(color);
    });
  }

  /** Shows the ball walking along the path, then hands over to `done`. */
  function animateMove(
    /** @type {{ path: number[] }} */ { path },
    /** @type {number[]} */ shown,
    /** @type {() => void} */ done,
  ) {
    const color = shown[path[0]];
    const stepMs = moveStepMs(path.length - 1);
    let step = 0;
    const tick = () => {
      step += 1;
      shown[path[step - 1]] = 0;
      shown[path[step]] = color;
      paint(shown);
      // The last step hands over in the same tick, so the move takes steps x stepMs.
      if (step >= path.length - 1) {
        done();
        return;
      }
      moveTimer = setTimeout(tick, stepMs);
    };
    moveTimer = setTimeout(tick, stepMs);
  }

  function onCellClick(/** @type {number} */ index) {
    if (boardEl.dataset.animating === 'true' || game.over) return;
    if (game.board[index] !== 0) {
      selected = selected === index ? null : index;
      render();
      return;
    }
    if (selected === null) return;
    const before = game;
    const turn = playTurn(game, selected, index, rng);
    if (turn === null) {
      reject();
      return;
    }
    const start = selected;
    const bestBefore = Math.max(best, before.score);
    selected = null;
    clearRejection();
    // The turn is already computed; the screen catches up while the events play.
    game = turn.state;
    best = Math.max(best, game.score);
    // Hold the ball on its start cell until the first step.
    cells[start].dataset.selected = 'false';
    playEvents(turn.events, before.board, before.score, bestBefore);
  }

  cells.forEach((cell, index) => cell.addEventListener('click', () => onCellClick(index)));

  render();
  root.dataset.ready = 'true';

  return {
    /** @param {unknown} snapshot */
    setState(snapshot) {
      const parsed = gameFromSnapshot(snapshot, rng);
      resetInterface();
      game = parsed.game;
      if (parsed.best !== undefined) best = parsed.best;
      render();
    },
    getState() {
      return {
        board: boardToRows(game.board),
        score: game.score,
        best: Math.max(best, game.score),
        preview: [...game.preview],
        selected:
          selected === null
            ? null
            : { row: Math.floor(selected / BOARD_SIZE), col: selected % BOARD_SIZE },
        over: game.over,
        record: game.record,
        animating: byTestId('board').dataset.animating === 'true',
        rejected: byTestId('board').dataset.rejected === 'true',
        soundOn: byTestId('sound-toggle').getAttribute('aria-pressed') === 'true',
      };
    },
  };
}

/**
 * @typedef {object} AppController
 * @property {(snapshot: unknown) => void} setState replaces the game, see `window.__kulki`
 * @property {() => Record<string, unknown>} getState snapshot of what the screen shows
 */
