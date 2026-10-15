# Movie App

A React + TypeScript movie browser, built as a course assignment with AI as a development assistant (Antigravity CLI with Gemini 3.8 Flash). It uses the OMDB API for movie data and Firebase for login and per-user favorites.

## Features

- **Home:** a grid of movies loaded from five seed keywords (fetched in parallel, merged, de-duplicated by `imdbID`, shuffled, up to 20 shown).
- **Search:** the header search box navigates to `/?q=<term>`. A search needs at least 2 characters.
- **Favorites:** a heart button on each card and a Favorites page.
- **Login and sign up:** Firebase email and password.
- **Per-user favorites:** when logged in, favorites are stored in Firestore under `users/{uid}`. When logged out, they stay in `localStorage`.
- **Sync errors:** a failed load or save of favorites shows an error message.

## Tech

React, TypeScript, Vite, React Router, standard CSS (no UI library), Firebase Authentication and Firestore, OMDB API.

The code follows MVVM per screen: models are plain TypeScript, view-model hooks hold state and actions, and views only render.

## Setup

You need Node.js, an [OMDB API key](https://www.omdbapi.com/apikey.aspx) and a Firebase project.

1. Clone the repo and install:

   ```
   git clone https://github.com/BeeSniper/movie-app.git
   cd movie-app
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values. `.env` is git-ignored and must never be committed.

   ```
   VITE_OMDB_BASE_URL=https://www.omdbapi.com
   VITE_OMDB_API_KEY=
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   ```

   The six Firebase values come from your Firebase project's web app settings.

3. In the Firebase console:
   - **Authentication:** enable the Email/Password sign-in method.
   - **Firestore Database:** create a database, then publish the rules below (Rules tab).

4. Run it:

   ```
   npm run dev
   npm run build
   ```

   The app is served at `http://localhost:5173/`.

## Firestore security rules

The rules live in the Firebase console, not in the app code. They are reproduced here so they can be reviewed. Anything not matched is denied.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Tested in the Rules Playground before publishing (simulation type `get`):

| # | Authenticated | UID | Path | Result |
| --- | --- | --- | --- | --- |
| 1 | No | none | `users/abc` | Denied |
| 2 | Yes | `abc` | `users/abc` | Allowed |
| 3 | Yes | `abc` | `users/xyz` | Denied |
| 4 | Yes | `abc` | `anything/else` | Denied |

I also checked in the browser, with two accounts, that one user cannot see the other's favorites.

## Project structure

```
src/
  components/   Header, MovieCard, MovieGrid
  context/      AuthContext, FavoritesContext
  models/       AuthModel, FavoritesModel, UserDataModel
  screens/      home, favorites, login
  services/     firebase, omdbClient
  types/        movie
```

## Assignment deliverables

| Deliverable | Where |
| --- | --- |
| The completed application | This repository |
| The prompts used during development | [PROMPTS.md](PROMPTS.md) (Prompts 1 to 16, each with what the AI produced and what I checked or changed) |
| How AI assisted, and manual improvements | [docs/Movie-App-How-AI-Assisted-and-Manual-Improvements.pdf](docs/Movie-App-How-AI-Assisted-and-Manual-Improvements.pdf) |

## Known limitations

These are logged as candidate improvements and were not fixed:

- Merging a visitor's local favorites into an account on first login is not implemented.
- The failed-save and failed-logout messages could not be tested safely on a live project.
- The favorites effect depends on the `user` object instead of `user.uid`.
- Both the login form and an effect navigate to `/` after a successful login.
- The production bundle is about 809 kB, with no code-splitting.
- The login screen's CSS colours are hardcoded.
