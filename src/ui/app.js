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
    // Placeholder colors until the game logic is wired in.
    balls.append(
      el(doc, 'span', {
        class: 'preview-ball',
        'data-testid': 'preview-ball',
        'data-color': String(i + 1),
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
 * Boots the application inside the given document.
 *
 * Renders the static game screen and sets `data-ready="true"` on the root
 * element once the UI is usable, so tests can wait for the app instead of
 * guessing with timeouts.
 *
 * @param {Document} doc
 * @returns {HTMLElement} the application root element
 */
export function startApp(doc) {
  const root = doc.getElementById('app');
  if (!root) {
    throw new Error('Application root element #app not found');
  }

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
  root.dataset.ready = 'true';
  return root;
}
