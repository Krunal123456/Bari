# Matrimony Module — Implementation Summary

This document summarizes the Free & Paid Membership Matrimony module implemented in the Bari Samaj application and outlines production hardening steps.

## What I implemented (scaffold + production-ready patterns)

- Types & models
  - `src/lib/matrimony-types.ts` — central types: `MatrimonyProfile`, `Subscription`, `Interest`, `MatchSummary`.

- Services
  - `src/services/matrimonyService.ts` — profile CRUD, search, photo upload helpers.
  - `src/services/subscriptionService.ts` — subscription record helpers (architecture-ready; server-side creation recommended).
  - `src/services/authService.ts` — email/password sign up/sign in helpers.
  - `src/services/interestService.ts` — send interest, count interests for daily limits.
  - `src/services/notificationService.ts` — FCM helpers and `createNotification` for in-app notifications.
  - `src/services/userService.ts` — onboarding completion helper.

- Hooks
  - `src/hooks/useMatrimony.ts` — `useUserMatrimonyProfile`, `useMatrimonySearch` with pagination-ready APIs.

- Pages & Components
  - `src/app/onboarding/page.tsx` — lightweight onboarding flow (redirects to matrimony profile creation).
  - `src/app/matrimony/create/page.tsx` — multi-step profile creation wizard with photo upload and draft saving.
  - `src/app/matrimony/page.tsx` — matrimony listing; free vs paid preview limits and filter basics.
  - `src/app/matrimony/[id]/page.tsx` — profile detail with masked contact for Free users, send interest modal (limits enforced client-side), and "Compare with my profile" using server-side Kundli API.
  - `src/app/matrimony/plans/page.tsx` — membership comparison and Upgrade flow (creates subscription record for demo; production should integrate a payment gateway + server webhooks).
  - `src/app/admin/matrimony/page.tsx` — admin approvals UI with audit logging and notifications.
  - `src/components/matrimony/RequireOnboarding.tsx` — route guard that redirects users to `/onboarding` until they finish onboarding.

- API & Kundli
  - `src/app/api/kundli/generate/route.ts` — server-side API endpoint (stub) that calls a local generator. Replace with a Cloud Function or external Kundli API for production.
  - `src/lib/kundli.ts` — placeholder Kundli generator with structured result (`gunaScore`, `manglik`, `verdict`, `details`).

- Security
  - `firestore.rules` — opinionated Firestore rules locking down accesses; subscriptions and sensitive writes should be handled server-side.

- Notifications & UX
  - In-app notification writes are used (`notifications` collection) and FCM integration exists via `notificationService.ts`.
  - Smooth animations (Framer Motion) used in admin flows; pages are responsive and Tailwind-based.

## Production hardening & next steps (high priority)

1. Server-side subscription workflow
   - Integrate a payment gateway (Stripe/PayPal) and create subscriptions only from verified server-side payment webhooks.
   - Mark subscription records immutable from the client (already covered in rules).

2. Kundli generation and PDF
   - Implement a Cloud Function (NodeJS) using a verified Kundli API and the Firebase Admin SDK to store generated PDFs to Firebase Storage, returning signed URLs.

3. Enforce paid/free limits server-side
   - Implement Cloud Functions to validate interest sending, shortlists, and daily limits to prevent client-side bypass.

4. Security & Audit
   - Ensure admin actions are performed via admin-only endpoints and audit logs are enabled (already in `adminService.logActivity`).
   - Add tests and CI checks for Firestore rules.

5. E2E & Integration tests
   - Add Playwright/Cypress tests for key flows: onboarding → create profile → submit → admin approve → browse → compare → interest.

6. Monitoring & Alerts
   - Integrate error reporting (Sentry) and performance monitoring.

## Where to look in code (quick pointers)
- Types: `src/lib/matrimony-types.ts`
- Services: `src/services/*` (matrimonyService, subscriptionService, interestService, notificationService)
- Pages: `src/app/matrimony/*` and `src/app/onboarding/page.tsx`
- API stub: `src/app/api/kundli/generate/route.ts`
- Firestore rules: `firestore.rules`

---
If you'd like, I can continue next with one of these priorities:
1) Implement Cloud Function + real Kundli API + PDF generation (recommended next),
2) Implement server-side subscription webhook (Stripe integration & secure subscription creation), or
3) Add automated tests and Firestore rules unit tests.

Tell me which priority to proceed with and I’ll implement the next set of changes. 🔧