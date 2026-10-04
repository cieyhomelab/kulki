import { createRandomSource } from './game/rng.js';
import { installTestApi } from './test-api.js';
import { startApp } from './ui/app.js';

const randomSource = createRandomSource();
// The test API is installed in the same synchronous run that sets `data-ready`.
installTestApi(window, startApp(document, randomSource.rng), randomSource);
