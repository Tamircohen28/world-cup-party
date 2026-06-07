# Troubleshooting

## Login / authentication

**"User not registered" error after login**

Your email authenticated successfully but your user profile hasn't been created in the app database yet. This can happen if you signed in before completing registration. Sign out, go to **Register**, and complete the registration form.

**Stuck on the loading spinner**

The app is waiting for your Base44 session to resolve. Check your network connection. If the spinner persists for more than 10 seconds, reload the page. If the problem continues, clear localStorage for the site (`Application → Local Storage → Clear All` in DevTools).

## Predictions

**The "Predict" button is greyed out**

The prediction window has closed — predictions lock at match kickoff. Check the match kickoff time; if it has passed, you can no longer submit or edit a prediction for that match.

**My prediction points look wrong**

Points are only calculated after the host enters the actual match result. If the match has finished but your points show 0, the result may not have been entered yet. Ask your party host to update the match score in the Host Dashboard.

## Watch parties

**I can't create a party for a match that already has one**

Only one watch party per match is supported. If a party already exists, join it or contact the host if you want to take over hosting.

**Google Calendar sync isn't working**

1. Go to **Profile → Integrations** and reconnect the Google Calendar connector
2. Make sure you granted calendar write permission during the OAuth flow
3. If events still don't appear, try disconnecting and reconnecting the integration

## Splitwise

**Expenses aren't being created**

1. Check that the Splitwise connector is connected under **Profile → Integrations**
2. Make sure you're a member of the Splitwise group selected during setup
3. Splitwise expense creation is triggered when the host marks a party as "settled" — confirm the host has done this

## Local development

**`npm run dev` fails with "Cannot find module '@base44/sdk'"**

Run `npm install` first. The SDK and all dependencies need to be installed before starting the dev server.

**App loads but shows no data**

Your `.env.local` is likely missing or has incorrect values. Ensure both `VITE_BASE44_APP_ID` and `VITE_BASE44_APP_BASE_URL` are set and match your Base44 app settings. Restart the dev server after editing `.env.local`.
