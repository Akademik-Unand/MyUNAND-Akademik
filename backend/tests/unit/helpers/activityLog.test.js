'use strict';

const {
  shouldRecord,
  redactPayload,
  inferAction,
  inferSubject,
} = require('../../../src/helpers/activityLog');

describe('activityLog helper', () => {
  it('redacts password and token fields', () => {
    expect(redactPayload({
      email: 'admin@email.com',
      password: 'rahasia',
      token: 'abc',
      refresh_token: 'xyz',
    })).toEqual({
      email: 'admin@email.com',
      password: '[redacted]',
      token: '[redacted]',
      refresh_token: '[redacted]',
    });
  });

  it('does not record GET requests', () => {
    expect(shouldRecord('GET', '/api/v1/fakultas', 200)).toBe(false);
    expect(shouldRecord('GET', '/api/v1/activity-logs', 200)).toBe(false);
  });

  it('records successful DELETE and skips activity-logs writes', () => {
    expect(shouldRecord('DELETE', '/api/v1/fakultas/8514ab7d-9f32-4c8f-9dbe-fdf16e2e4fa1', 200)).toBe(true);
    expect(shouldRecord('POST', '/api/v1/activity-logs', 201)).toBe(false);
  });

  it('records login success and 401', () => {
    expect(shouldRecord('POST', '/api/v1/auth/login', 200)).toBe(true);
    expect(shouldRecord('POST', '/api/v1/auth/login', 401)).toBe(true);
    expect(shouldRecord('POST', '/api/v1/auth/login', 422)).toBe(false);
    expect(shouldRecord('POST', '/api/v1/auth/refresh', 200)).toBe(false);
  });

  it('infers action and subject from the path', () => {
    expect(inferAction('DELETE', '/api/v1/fakultas/8514ab7d-9f32-4c8f-9dbe-fdf16e2e4fa1')).toBe('delete');
    expect(inferAction('POST', '/api/v1/fakultas/8514ab7d-9f32-4c8f-9dbe-fdf16e2e4fa1/restore')).toBe('restore');
    expect(inferAction('PUT', '/api/v1/users/8514ab7d-9f32-4c8f-9dbe-fdf16e2e4fa1/roles')).toBe('assign-roles');
    expect(inferSubject('/api/v1/fakultas')).toBe('Fakultas');
    expect(inferSubject('/api/v1/auth/login')).toBe('User');
  });
});
