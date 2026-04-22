# Wassali Backend API Integration Guide

## Base URL

- Local: `http://localhost:5000`
- API prefix by module:
  - Auth: `/api/auth`
  - Client: `/api/client`
  - Deliverer: `/api/deliverer`
  - Admin: `/api/admin`

## Standard Response Format

### Success

```json
{
  "success": true,
  "message": "Human readable message",
  "...": "endpoint-specific data"
}
```

### Error

```json
{
  "success": false,
  "message": "What failed",
  "code": "OPTIONAL_MACHINE_CODE",
  "errors": {
    "field": ["validation details"]
  }
}
```

## Authentication & Session Flow (JWT)

1. `POST /api/auth/login/` with username/password
2. Store:
   - `access_token` (short-lived)
   - `refresh_token` (long-lived)
3. Send access token in all protected calls:
   - `Authorization: Bearer <access_token>`
4. If access token expires:
   - `POST /api/auth/refresh/` with refresh token
5. On logout:
   - `POST /api/auth/logout/` with refresh token

## Protected Routes

Protected endpoints require `Authorization: Bearer <access_token>`.

- Client-only routes require client role.
- Deliverer-only routes require deliverer role.
- Admin-only routes require admin role.

---

## Auth Endpoints

### Register
- `POST /api/auth/register/`
- Body:
```json
{
  "username": "mohamed",
  "email": "mohamed@wassali.dz",
  "password": "Strong123!",
  "role": "client"
}
```

### Login
- `POST /api/auth/login/`
- Body:
```json
{
  "username": "mohamed",
  "password": "Strong123!"
}
```
- Returns tokens + user meta.

### Refresh Access Token
- `POST /api/auth/refresh/`
- Body:
```json
{
  "refresh_token": "<refresh-token>"
}
```

### Logout (revoke refresh session)
- `POST /api/auth/logout/`
- Body:
```json
{
  "refresh_token": "<refresh-token>"
}
```

### Current User
- `GET /api/auth/me/`

### Complete Deliverer Onboarding
- `POST /api/auth/onboarding/<user_id>/`
- Protected (deliverer only, same user)

### Get User Status
- `GET /api/auth/status/<user_id>/`
- Protected (self or admin)

### Change Username
- `POST /api/auth/change/username/<old_username>`
- Protected (self or admin)
- Body:
```json
{
  "new_username": "new_name"
}
```

### Change Password
- `POST /api/auth/change/password/<username>`
- Protected (self or admin)
- Body:
```json
{
  "old_password": "Old123!",
  "new_password": "NewStrong123!"
}
```

---

## Client Endpoints

### Create Delivery
- `POST /api/client/deliveries`
- Protected (client only, `client_id` must match token user)
- Body:
```json
{
  "client_id": "uuid",
  "pickup_address": "Algiers",
  "dropoff_address": "Oran",
  "description_of_order": "Medicine package",
  "price": 1500
}
```

### List Client Deliveries
- `GET /api/client/deliveries/<client_id>`
- Protected (same client)

### Track Delivery
- `GET /api/client/deliveries/track/<delivery_id>`
- Protected (client role)

### Cancel Delivery
- `DELETE /api/client/client/cancel`
- Protected (same client)
- Body:
```json
{
  "delivery_id": "uuid",
  "client_id": "uuid"
}
```

---

## Deliverer Endpoints

### Get Available Deliveries
- `GET /api/deliverer/deliveries/available`
- Protected (deliverer role)

### Accept Delivery
- `POST /api/deliverer/deliveries/accept/<delivery_id>`
- Protected (same deliverer)
- Body:
```json
{
  "deliverer_id": "uuid"
}
```

### Mark Delivered
- `POST /api/deliverer/deliveries/mark_delivered/<delivery_id>`
- Protected (deliverer role)

### Drop Delivery
- `DELETE /api/deliverer/deliverer/drop`
- Protected (same deliverer)
- Body:
```json
{
  "delivery_id": "uuid",
  "deliverer_id": "uuid"
}
```

### Matching Flow (Deliverer Schedule → Navigation)
- **Incoming requests**: `GET /api/deliverer/incoming-requests`
- **Accept a request**: `POST /api/deliverer/requests/<request_id>/accept`
- **Awaiting client approval**: `GET /api/deliverer/requests/awaiting-client-approval`
- **Active task**: `GET /api/deliverer/active-task`
- **Navigation details**: `GET /api/deliverer/orders/<order_id>/navigation-details`

### Deliverer Dashboard / Profile / Status
- **Me**: `GET /api/deliverer/me`
- **Stats**: `GET /api/deliverer/stats`
- **Recent deliveries**: `GET /api/deliverer/deliveries/recent`
- **Notifications**: `GET /api/deliverer/notifications`
- **Set online status**: `POST /api/deliverer/status` body: `{ "online": true }`

### Deliverer Earnings (minimal)
- **Stats**: `GET /api/deliverer/earnings/stats`
- **Balance**: `GET /api/deliverer/earnings/balance`

### Deliverer Support
- **System status**: `GET /api/deliverer/support/system-status`
- **Tickets list**: `GET /api/deliverer/support/tickets?page=1&limit=5`
- **Create ticket**: `POST /api/deliverer/support/tickets`
- **FAQs**: `GET /api/deliverer/support/faqs`
- **Safety categories**: `GET /api/deliverer/support/safety-categories`
- **Submit safety report**: `POST /api/deliverer/support/safety-report`

### Deliverer Settings
- **Get settings**: `GET /api/deliverer/settings`
- **Update credentials**: `PATCH /api/deliverer/settings/credentials`
- **Toggle 2FA**: `PATCH /api/deliverer/settings/2fa` body: `{ "enabled": true }`
- **Delete session**: `DELETE /api/deliverer/settings/sessions/<session_id>`
- **Update permissions**: `PATCH /api/deliverer/settings/permissions` body: partial `{ "locationSharing": true }`
- **Regenerate key**: `POST /api/deliverer/settings/access-key/regenerate`

---

## Admin Endpoints

### Get Users
- `GET /api/admin/users`
- Protected (admin role)

### Get User by ID
- `GET /api/admin/users/<id>`
- Protected (admin role)

### User Stats (Admin)
- `GET /api/admin/users/stats`
- Protected (admin role)

### Create User (Admin)
- `POST /api/admin/users`
- Protected (admin role)

### Update User (Admin)
- `PATCH /api/admin/users/<id>`
- Protected (admin role)
- Body can include: `{ "status": "active|inactive|banned", "role": "client|deliverer|admin" }`

### Delete User (Admin)
- `DELETE /api/admin/users/<id>`
- Protected (admin role)

### Delete User
- `DELETE /api/admin/delete/<username>`
- Protected (admin role)
- Body:
```json
{
  "password": "AdminPassword123!",
  "role": "admin"
}
```

### Reject Delivery
- `DELETE /api/admin/reject/<delivery_id>`
- Protected (admin role)
- Body:
```json
{
  "admin_id": "uuid",
  "reason": "Policy violation"
}
```

---

## Environment Variables

Set in `.env` (backend root):

```env
MONGODB_URI=mongodb://127.0.0.1:27017
DATABASE_NAME=wassali_db
JWT_SECRET_KEY=super-secret-key
JWT_ACCESS_EXPIRES_MINUTES=30
JWT_REFRESH_EXPIRES_DAYS=7
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### SMTP (real email for verification + password reset)

If SMTP is **not** configured, the backend will **not** send real emails and will return `dev_notice` + `dev_verification_code` (signup) or `dev_reset_link` (password reset).

Add these variables to your backend `.env`:

```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_DEFAULT_SENDER="Wassali <your_email@gmail.com>"
FRONTEND_BASE_URL=http://localhost:5173
```

Gmail notes:

- You must use an **App Password** (enable 2FA on the Gmail account → create an App Password).
- If you use normal Gmail password, Google will block SMTP login.

## Frontend Integration Checklist

- Add Axios/FETCH interceptor to attach access token.
- On `401`, call refresh endpoint once and retry original request.
- If refresh fails, clear auth state and redirect to login.
- Keep `refresh_token` in secure storage strategy.
- Use endpoint `message` + `errors` for user-friendly UI feedback.
