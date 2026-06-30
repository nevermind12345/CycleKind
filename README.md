# CycleKind

CycleKind is a private, local-first menstrual cycle tracking Progressive Web App built with React, TypeScript, Vite, Tailwind CSS, Dexie.js, and IndexedDB.

It is designed for mobile use and can be added to an iPhone Home Screen without App Store publishing. The MVP has no backend, no login, no analytics, no third-party tracking, and no cloud database.

## Required Tools

- Node.js: available in this workspace as `v24.16.0`
- npm: available in this workspace as `11.13.0`
- pnpm: available as `11.7.0`, but this project uses npm by default
- Yarn: not required

## Install Dependencies

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Vite will print a local URL, usually `http://localhost:5173/`.

## Build

```bash
npm run build
```

## Test

```bash
npm run test
```

## Preview the Production PWA Locally

```bash
npm run build
npm run preview
```

Open the preview URL on the same device or network when testing install behavior. Service workers are most accurate in a production build or preview, not during regular Vite dev mode.

## Add to iPhone Home Screen

1. Build and serve the app from a secure origin. For real iPhone testing, use HTTPS or a trusted local network setup.
2. Open the app in Safari on the iPhone.
3. Tap the Share button.
4. Tap **Add to Home Screen**.
5. Launch CycleKind from the Home Screen icon.

Localhost works only on the computer itself. To test from an iPhone, the phone must be able to reach the dev/preview server, and iOS install behavior is best verified over HTTPS.

## Privacy Notes

- Period records are stored locally in IndexedDB on the device/browser.
- Expected cycle length and notification preference are stored locally.
- Predicted dates are computed virtually and are not stored as real period records.
- Export and import are user-controlled JSON file actions.
- CycleKind does not send menstrual data to a server.
- CycleKind does not include analytics, tracking SDKs, advertising SDKs, login, or account creation.

## Current MVP Features

- Record period start dates.
- View, edit, and delete records.
- Estimate the next period from the latest actual recorded start date.
- Configure expected cycle length, defaulting to 28 days.
- Calendar view with actual recorded starts and the next estimated start.
- Records view with calculated cycle lengths between records.
- Settings for notification preference UI, calendar reminder export, export/import, and delete all data.
- Offline support after first production load via the generated PWA service worker.

## iOS PWA Notification Limitations

CycleKind does not pretend that scheduled local notifications are reliable in iOS PWAs. The notification controls are preferences for the MVP, not a local alarm scheduler.

The **Test notification permission** button only checks whether the browser exposes the Notification API and can show an immediate test notification. It is not a guarantee that future scheduled reminders will work.

The best MVP fallback is **Export calendar reminder**. It creates an `.ics` file for the currently predicted next period date and your selected reminder timing. Your Calendar app handles the actual alert. Depending on your calendar account, that event may sync outside this device.

For a future Web Push implementation, see [docs/notification-plan.md](docs/notification-plan.md). The recommended future design uses a minimal backend or serverless worker, stores only push subscription details and the next reminder timestamp, and does not upload period records or notes.

## Medical Disclaimer

CycleKind is for personal tracking only and is not medical advice. Predictions are estimates based on the selected cycle length, not guarantees.
