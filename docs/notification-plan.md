# CycleKind Notification Plan

CycleKind should not pretend that scheduled local notifications are reliable in iOS PWAs. The MVP uses honest fallback controls and keeps the app local-first.

## Current MVP

1. Save a reminder preference locally:
   - off
   - on predicted day
   - 1 day before
   - 3 days before
2. Offer a notification permission test when the browser exposes the Notification API.
3. Export a calendar `.ics` reminder for the current predicted date and selected reminder timing.
4. Explain that the Calendar app handles the actual alert and that calendar events may sync through the user's calendar account.

The `.ics` export uses a generic title, `CycleKind reminder`, to avoid putting explicit menstrual details in the calendar title. Its description still says the date is an estimated period start, so users should choose a private calendar if they import it.

## Why Not Local Scheduling

Browser notifications are event-driven. A PWA can test permission and show immediate notifications, but reliable future delivery needs a push event or an operating-system calendar/reminder system. iOS Home Screen web apps can support Web Push, but that is not the same as a guaranteed local alarm scheduler.

## Future Web Push Architecture

Keep the backend minimal and avoid sending cycle history to the server.

### Client

1. Require the app to be installed or running in a supported browser context.
2. Ask for notification permission only after a user action.
3. Register the service worker.
4. Subscribe with `PushManager.subscribe()` using a VAPID public key.
5. Send only this data to the backend:
   - push subscription endpoint and keys
   - reminder preference
   - next reminder date/time
   - timezone
6. Do not send period records or notes.

### Backend or Serverless Worker

1. Store push subscriptions and next reminder timestamps.
2. Run a scheduled job, such as a cron trigger, hourly or daily.
3. Send Web Push messages for due reminders.
4. Store only the minimum data needed to send reminders.
5. Delete expired subscriptions when push delivery returns `410 Gone` or similar invalid-subscription responses.
6. Provide endpoints to update preference, update next reminder, and delete subscription.

### Privacy Boundary

The server should not compute cycles from full history. The client can compute the next reminder locally and send only the next reminder timestamp. That leaks less information than storing all period records in a backend.

### Suggested Endpoints

- `POST /api/push/subscribe`
- `POST /api/push/reminder`
- `DELETE /api/push/subscription`

### Open Questions Before Building

- Which deployment target: Cloudflare Worker, Vercel Cron, Netlify Scheduled Function, or a small Node service.
- Whether reminders should be device-specific or shared across multiple installed devices.
- Whether the user accepts sending next reminder timing to a server.
- How to rotate VAPID keys without losing subscriptions.
