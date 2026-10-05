import { createSounds } from '../audio/sounds.js';
import { boardToRows } from '../game/board.js';
import { gameFromSnapshot, newGame, playTurn } from '../game/game.js';
import { readGame, writeGame } from '../storage/game-save.js';
import { readBestScore, writeBestScore } from '../storage/best-score.js';
import { loadSoundOn, saveSoundOn } from '../storage/sound-setting.js';
import { bouncingCell } from './bounce.js';
import { buildCascade } from './cascade.js';
import { createMotion } from './motion.js';
import { TEXTS } from './texts.js';
import { BOUNCE_CYCLE_MS, CLEAR_MS, REJECT_MS, SPAWN_MS, moveStepMs } from './timing.js';

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
  const box = el(doc, 'div', { class: 'stat', 'data-testid': `${testId}-panel` });
  box.append(
    el(doc, 'span', { class: 'stat-label', 'data-testid': `${testId}-label` }, label),
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
    'data-bounce-cycles': '0',
    'data-rejected': 'false',
    role: 'grid',
    'aria-label': TEXTS.boardLabel,
  });
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const cell = el(doc, 'div', {
        class: 'cell',
        'data-testid': `cell-${row}-${col}`,
        'data-color': '0',
        'data-selected': 'false',
        'data-bouncing': 'false',
      });
      cell.append(el(doc, 'span', { class: 'ball', 'data-testid': `ball-${row}-${col}` }));
      board.append(cell);
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
  preview.append(
    el(doc, 'span', { class: 'stat-label', 'data-testid': 'preview-label' }, TEXTS.nextBalls),
    balls,
  );
  return preview;
}

/**
 * @param {Document} doc
 * @param {import('../audio/sounds.js').Sounds} sounds
 * @returns {HTMLElement}
 */
function buildSoundToggle(doc, sounds) {
  const button = el(doc, 'button', {
    type: 'button',
    class: 'button',
    'data-testid': 'sound-toggle',
  });
  const show = () => {
    const on = sounds.isOn();
    button.setAttribute('aria-pressed', String(on));
    button.textContent = on ? TEXTS.soundOn : TEXTS.soundOff;
  };
  show();
  button.addEventListener('click', () => {
    sounds.setOn(!sounds.isOn());
    saveSoundOn(sounds.isOn());
    show();
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

  const sounds = createSounds({ on: loadSoundOn() });
  // Browsers allow audio only after a player gesture; the first click creates the context.
  doc.addEventListener('click', () => sounds.unlock(), { capture: true });

  const hero = el(doc, 'div', { 'data-testid': 'hero', class: 'hero' });
  hero.append(el(doc, 'h1', { 'data-testid': 'title' }, TEXTS.title), buildCascade(doc));

  const sidebar = el(doc, 'div', { class: 'sidebar', 'data-testid': 'sidebar' });
  sidebar.append(
    statBox(doc, TEXTS.score, 'score'),
    statBox(doc, TEXTS.bestScore, 'best-score'),
    buildPreview(doc),
    el(
      doc,
      'button',
      { type: 'button', class: 'button', 'data-testid': 'new-game' },
      TEXTS.newGame,
    ),
    buildSoundToggle(doc, sounds),
  );

  root.replaceChildren(hero, buildBoard(doc), sidebar);

  /** @type {import('../game/game.js').GameState} */
  let game = readGame() ?? newGame(rng);
  let best = readBestScore();

  /** Raises the best score to at least `value` and remembers it. */
  function raiseBest(/** @type {number} */ value) {
    if (value <= best) return;
    best = value;
    writeBestScore(best);
  }

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

  /** @type {number | null} */
  let bouncingNow = null;
  boardEl.style.setProperty('--bounce-ms', `${BOUNCE_CYCLE_MS}ms`);
  const motion = createMotion(/** @type {Window} */ (doc.defaultView));

  /** Makes exactly the selected ball bounce, unless the player asked for reduced motion. */
  function syncBounce() {
    const bouncing = bouncingCell(selected, motion.isReduced());
    cells.forEach((cell, index) => {
      cell.dataset.bouncing = String(index === bouncing);
    });
    // The counter belongs to the ball that bounces now: any change of that ball restarts it.
    if (bouncing !== bouncingNow) {
      bouncingNow = bouncing;
      boardEl.dataset.bounceCycles = '0';
    }
  }
  motion.onChange(syncBounce);

  // The event bubbles; only the ball that currently bounces counts, so a stale event is ignored.
  boardEl.addEventListener('animationiteration', (event) => {
    if (bouncingNow === null || event.target !== cells[bouncingNow].firstElementChild) return;
    boardEl.dataset.bounceCycles = String(Number(boardEl.dataset.bounceCycles) + 1);
  });

  function render() {
    game.board.forEach((color, index) => {
      cells[index].dataset.color = String(color);
      cells[index].dataset.selected = String(index === selected);
    });
    syncBounce();
    byTestId('score').textContent = String(game.score);
    byTestId('best-score').textContent = String(Math.max(best, game.score));
    app.querySelectorAll('[data-testid="preview-ball"]').forEach((ball, i) => {
      /** @type {HTMLElement} */ (ball).dataset.color = String(game.preview[i]);
    });
    syncGameOver();
  }

  /** Removes the dialog with the given test id, if shown. */
  function closeDialog(/** @type {string} */ testId) {
    app.querySelector(`[data-testid="${testId}"]`)?.remove();
  }

  function startNewGame() {
    closeDialog('confirm-dialog');
    resetInterface();
    raiseBest(game.score);
    game = newGame(rng);
    writeGame(game);
    render();
  }

  /** Shows the end-of-game message once, and removes it when the game is no longer over. */
  function syncGameOver() {
    const shown = app.querySelector('[data-testid="game-over"]');
    if (!game.over) {
      shown?.remove();
      return;
    }
    if (shown) {
      byTestId('game-over-score').textContent = String(game.score);
      return;
    }
    const panel = el(doc, 'div', { class: 'dialog', role: 'alert', 'data-testid': 'game-over' });
    const newGameButton = el(
      doc,
      'button',
      { type: 'button', class: 'button', 'data-testid': 'game-over-new-game' },
      TEXTS.gameOverNewGame,
    );
    newGameButton.addEventListener('click', startNewGame);
    panel.append(
      el(doc, 'strong', {}, TEXTS.gameOverTitle),
      el(doc, 'span', {}, TEXTS.gameOverScore),
      el(doc, 'span', { 'data-testid': 'game-over-score' }, String(game.score)),
    );
    if (game.record) {
      panel.append(el(doc, 'span', { 'data-testid': 'game-over-record' }, TEXTS.gameOverRecord));
    }
    panel.append(newGameButton);
    sidebar.append(panel);
  }

  function showConfirm() {
    if (app.querySelector('[data-testid="confirm-dialog"]')) return;
    const panel = el(doc, 'div', {
      class: 'dialog',
      role: 'alertdialog',
      'data-testid': 'confirm-dialog',
    });
    const yes = el(
      doc,
      'button',
      { type: 'button', class: 'button', 'data-testid': 'confirm-yes' },
      TEXTS.confirmYes,
    );
    const no = el(
      doc,
      'button',
      { type: 'button', class: 'button', 'data-testid': 'confirm-no' },
      TEXTS.confirmNo,
    );
    yes.addEventListener('click', startNewGame);
    no.addEventListener('click', () => closeDialog('confirm-dialog'));
    panel.append(el(doc, 'span', {}, TEXTS.confirmQuestion), yes, no);
    sidebar.append(panel);
  }

  byTestId('new-game').addEventListener('click', () => {
    // A finished game has nothing left to lose.
    if (game.over) startNewGame();
    else showConfirm();
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
        if (event) sounds.play('gameover');
        finish();
      } else if (event.type === 'moved') {
        sounds.play('move');
        animateMove(event, shown, next);
      } else if (event.type === 'cleared') {
        sounds.play('clear');
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
    if (app.querySelector('[data-testid="confirm-dialog"]')) return;
    if (game.board[index] !== 0) {
      selected = selected === index ? null : index;
      render();
      return;
    }
    if (selected === null) return;
    const before = game;
    const bestBefore = Math.max(best, before.score);
    const turn = playTurn(game, selected, index, rng, bestBefore);
    if (turn === null) {
      sounds.play('reject');
      reject();
      return;
    }
    const start = selected;
    selected = null;
    clearRejection();
    // The turn is already computed; the screen catches up while the events play.
    game = turn.state;
    // Saved right after the turn is computed, before the animation, so a reload mid-animation
    // resumes the finished turn.
    writeGame(game);
    raiseBest(game.score);
    // Hold the ball on its start cell until the first step.
    cells[start].dataset.selected = 'false';
    syncBounce();
    playEvents(turn.events, before.board, before.score, bestBefore);
  }

  cells.forEach((cell, index) => cell.addEventListener('click', () => onCellClick(index)));

  writeGame(game);
  render();
  root.dataset.ready = 'true';

  return {
    /** @param {unknown} snapshot */
    setState(snapshot) {
      const parsed = gameFromSnapshot(snapshot, rng);
      closeDialog('confirm-dialog');
      resetInterface();
      game = parsed.game;
      if (parsed.best !== undefined) {
        best = parsed.best;
        writeBestScore(best);
      }
      writeGame(game);
      render();
    },
    getSoundLog: () => sounds.getLog(),
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
        soundOn: sounds.isOn(),
      };
    },
  };
}

/**
 * @typedef {object} AppController
 * @property {(snapshot: unknown) => void} setState replaces the game, see `window.__kulki`
 * @property {() => Record<string, unknown>} getState snapshot of what the screen shows
 * @property {() => Array<{ event: string }>} getSoundLog sounds requested since the page loaded
 */
