#!/usr/bin/env node
import assert from 'node:assert/strict';
import { AxiosError } from 'axios';
import {
  classifyPortfolioError,
  classifyPortfolioPayload,
  createRequestGuard,
  isPortfolioResultCurrent,
} from '../src/lib/portfolioError.js';

const axios404 = new AxiosError('not found', 'ERR_BAD_REQUEST', undefined, undefined, { status: 404 });
assert.equal(classifyPortfolioError(axios404), 'not-found');
assert.equal(classifyPortfolioError({ response: { status: 404 } }), 'unavailable');
assert.equal(classifyPortfolioError({ response: { status: 500 } }), 'unavailable');
assert.equal(classifyPortfolioError({ code: 'ECONNABORTED' }), 'unavailable');
assert.equal(classifyPortfolioError(new Error('network failed')), 'unavailable');

const validPayload = { slug: 'contoh', title: 'Contoh', images: [] };
assert.equal(classifyPortfolioPayload(validPayload), 'ready');
assert.equal(classifyPortfolioPayload(null), 'unavailable');
assert.equal(classifyPortfolioPayload({}), 'unavailable');
assert.equal(classifyPortfolioPayload({ ...validPayload, title: {} }), 'unavailable');
assert.equal(classifyPortfolioPayload({ ...validPayload, images: '{}' }), 'unavailable');
assert.equal(classifyPortfolioPayload({ ...validPayload, needText: {} }), 'unavailable');

assert.equal(isPortfolioResultCurrent('slug-a', 'slug-a'), true);
assert.equal(isPortfolioResultCurrent('slug-a', 'slug-b'), false);
assert.equal(isPortfolioResultCurrent(null, 'slug-a'), false);

const guard = createRequestGuard();
assert.equal(guard.isActive(), true);
guard.cancel();
assert.equal(guard.isActive(), false);

console.log('OK: portfolio error/payload classification dan stale-request guard valid.');
