# API

Prefix: `/api/v1`

Kontrak list: `page`, `limit`, `search`, `sortBy`, `sortOrder`, `filter[field]`.
Response list: `data` (array) + `pagination` `{ page, limit, total, totalPages }`.

Auth publik: `POST /api/v1/auth/login`. Endpoint lain memakai JWT + CASL.
Health: `GET /up`.
