'use strict';

const { SUBJECT_BY_KEY } = require('../constants/permissions');

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const SENSITIVE_KEYS = [
  'password',
  'token',
  'remember_token',
  'access_token',
  'refresh_token',
  'currentPassword',
  'newPassword',
  'confirmPassword',
];

const PATH_ALIASES = {
  auth: 'user',
  users: 'user',
  roles: 'role',
  permissions: 'permission',
  'activity-logs': 'activity-log',
};

const normalizePath = (path) => String(path || '').split('?')[0].replace(/^\/api\/v1/, '') || '/';

const shouldRecord = (method, path, status) => {
  const clean = normalizePath(path);
  if (clean === '/up' || clean === '/activity-logs' || clean.startsWith('/activity-logs/')) {
    return false;
  }
  if (method === 'POST' && clean === '/auth/refresh') {
    return false;
  }
  if (method === 'POST' && clean === '/auth/login') {
    return status < 300 || status === 401;
  }
  if (!WRITE_METHODS.has(method)) return false;
  return status >= 200 && status < 300;
};

const redactValue = (value) => {
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === 'object') {
    const next = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = SENSITIVE_KEYS.includes(key) ? '[redacted]' : redactValue(item);
    }
    return next;
  }
  return value;
};

const redactPayload = (body) => {
  if (!body || typeof body !== 'object') return null;
  return redactValue(body);
};

const inferAction = (method, path) => {
  const clean = normalizePath(path);
  if (clean === '/auth/login') return 'login';
  if (clean.endsWith('/restore')) return 'restore';
  if (clean.endsWith('/approve')) return 'approve';
  if (clean.endsWith('/upload')) return 'upload';
  if (method === 'PUT' && /\/users\/[^/]+\/roles$/.test(clean)) return 'assign-roles';
  if (method === 'PUT' && /\/roles\/[^/]+\/permissions$/.test(clean)) return 'sync-permissions';
  if (method === 'DELETE') return 'delete';
  if (method === 'PUT' || method === 'PATCH') return 'update';
  if (method === 'POST') return 'create';
  return String(method || '').toLowerCase();
};

const inferSubjectKey = (path) => {
  const clean = normalizePath(path);
  const segment = clean.split('/').filter(Boolean)[0];
  return PATH_ALIASES[segment] || segment || null;
};

const inferSubject = (path) => SUBJECT_BY_KEY[inferSubjectKey(path)] || null;

const inferResourceId = (path) => {
  const match = normalizePath(path).match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  return match ? match[0] : null;
};

const clientIp = (req) => {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || null;
};

const buildRecord = (req, res) => {
  const path = req.originalUrl || req.url;
  const action = inferAction(req.method, path);
  const subject = inferSubject(path);
  const resourceId = inferResourceId(path) || req.params?.id || null;
  const payload = redactPayload(req.body);
  const user = req.user || {};

  return {
    user_id: user.id || null,
    user_email: user.email || req.body?.email || null,
    user_name: user.name || null,
    action,
    subject,
    resource_id: resourceId,
    method: req.method,
    path: normalizePath(path),
    status_code: res.statusCode,
    ip: clientIp(req),
    user_agent: req.headers?.['user-agent'] || null,
    summary: [action, subject, resourceId].filter(Boolean).join(' '),
    payload,
  };
};

module.exports = {
  WRITE_METHODS,
  normalizePath,
  shouldRecord,
  redactPayload,
  inferAction,
  inferSubject,
  inferResourceId,
  clientIp,
  buildRecord,
};
