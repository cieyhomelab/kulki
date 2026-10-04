import { boardToRows } from '../game/board.js';
import { gameFromSnapshot, newGame } from '../game/game.js';
import { TEXTS } from './texts.js';

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

  /** @param {string} testId */
  const byTestId = (testId) =>
    /** @type {HTMLElement} */ (root.querySelector(`[data-testid="${testId}"]`));

  function render() {
    game.board.forEach((color, index) => {
      const cell = byTestId(`cell-${Math.floor(index / BOARD_SIZE)}-${index % BOARD_SIZE}`);
      cell.dataset.color = String(color);
      cell.dataset.selected = 'false';
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
    game = newGame(rng);
    render();
  });

  render();
  root.dataset.ready = 'true';

  return {
    /** @param {unknown} snapshot */
    setState(snapshot) {
      const parsed = gameFromSnapshot(snapshot, rng);
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
        selected: null,
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
