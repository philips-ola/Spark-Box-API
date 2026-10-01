import test from 'node:test';
import assert from 'node:assert/strict';

import User from '../models/User.js';
import Idea from '../models/Idea.js';
import { errorHandler } from '../middleware/errorHandler.js';

test('User schema keeps createdAt/updatedAt timestamps enabled', () => {
  assert.equal(User.schema.options.timestamps, true);
});

test('Idea schema does not require a user field when auth is not yet attached to the route', () => {
  assert.equal(Idea.schema.obj.user.required, false);
});

test('Error handler hides stack traces in production based on NODE_ENV', () => {
  process.env.NODE_ENV = 'production';

  const req = {};
  const res = {
    statusCode: 400,
    json(payload) {
      assert.equal(payload.status, 400);
      assert.equal(payload.stack, null);
    },
  };

  errorHandler(new Error('Something went wrong'), req, res, () => {});
});
