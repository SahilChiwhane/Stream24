# Stream24 Production Readiness Guide 🚀

This guide outlines the steps to move from local development to a live production environment.

## 1. Environment Checklist (.env)

Ensure your `backend/.env` contains production-grade secrets:

- [ ] `NODE_ENV=production`
- [ ] `PORT=5051` (or your chosen cloud port)
- [ ] `TMDB_API_KEY`: Industrial TMDB key.
- [ ] `FIREBASE_SERVICE_ACCOUNT`: Full JSON string from Firebase Console.
- [ ] `RAZORPAY_KEY_ID`: Live Razorpay key (switch from test mode when ready).
- [ ] `RAZORPAY_KEY_SECRET`: Live secret.
- [ ] `ALLOWED_ORIGINS`: Comma-separated list of your production domains.

## 2. Frontend Build

Before deploying the backend, you must generate the static optimized build:

1. Navigate to `frontend/`
2. Run `npm run build`
3. This creates a `frontend/build` folder.
4. The backend is configured to serve this folder automatically in production.

## 3. Security Tuning

- **CORS**: Ensure `ALLOWED_ORIGINS` in your environment matches your actual domain.
- **CSP**: The current Content Security Policy (in `app.js`) allows YouTube and Razorpay. If you add more external services, update the `helmet` configuration.
- **SSL**: Always run production apps behind a reverse proxy (like Nginx) or a Load Balancer with SSL (HTTPS) enabled.

## 4. Database & Auth

- **Firebase Rules**: Ensure your Firestore and Storage security rules are locked down. Profiles should only be editable by the owner.
- **Indices**: If "Continue Watching" or "Search" slows down with thousands of users, create composite indices in the Firebase Console.

## 5. Deployment command

To start the server in production mode:

```bash
cd backend
npm start
```

## 6. Known "Portfolio" Settings

- **Payment Mode**: The button text is statically set to "(Test Mode)" in `PaymentPage.jsx` to reflect portfolio status. Remove this text for a real business.
- **Pili Policy**: Content containing "Pili" is blacklisted industrial-wide in `content.service.js`.

---

_Built for industrial-level portfolio demonstration._
