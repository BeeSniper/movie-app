# Prompt Log

## Prompt 1: planning

**Prompt:**

```
I'm building a React movie app for a university assignment. I must be able
to explain every part of the code, so keep it simple and beginner-friendly.
Don't write any code yet.

Stack: React + TypeScript (Vite), functional components only, React Router,
no UI library.

Data: OMDB API (omdbapi.com). The API key and base URL come from a .env file
(VITE_ prefix) and are never hardcoded. OMDB only supports search by keyword,
so the home screen should load movies from a list of seed keywords.

Architecture: MVVM per screen. A model file (data and logic, no hooks), a
view-model hook (state and actions), and a view (rendering only).

Features, in build phases:
1. Header with Home and Favorites links and a search box; home screen shows a
grid of movie cards (poster, title, year, type)
2. Search by title (minimum 2 characters) with loading and error states
3. Favorites screen with a favorite button on each card
4. Stretch: Firebase email/password login, favorites saved per user

Propose:
1. Folder structure
2. Files per screen and what each does
3. A build order in small steps I can test one at a time (one step = one prompt)
Ask me before deciding anything these requirements don't cover.
```

**What AI produced:** A folder structure, files per screen, and a 9-step build order (1 setup, 2 client + home model, 3 view-model + home screen, 4 router + header, 5 search, 6 favorites, 7 CSS polish, 8-9 Firebase stretch). It asked questions before deciding.

**What I checked/changed:** Answered its questions and changed parts of the plan in Prompt 2.

## Prompt 2: answers, plan changes, Step 1

**Prompt:**

```
My answers:
1. Search: the header search box navigates to /?q=<term>. The home
view-model reads q from the URL (useSearchParams) and shows results on
the Home screen. Clicking Home goes to / and clears the search. No
separate /search route.
2. Seed keywords: fetch several in parallel, merge, dedupe by imdbID,
shuffle, show up to 20.
3. Styling: standard CSS.
4. Yes, initialize Vite React TypeScript in this folder, keeping PROMPTS.md.

Changes to your plan:
- Put the 2-character query validation in HomeModel, not Header.
- Env variables are VITE_OMDB_API_KEY and VITE_OMDB_BASE_URL.
- Add .env to .gitignore. Never log or print the API key.
- Any temporary test code must be removed after I confirm it works.

Do Step 1 only, then stop and wait for me.
```

**What AI produced:** Vite + React + TS scaffold, .gitignore rules, .env.example, src/types/movie.ts, src/vite-env.d.ts, react-router-dom installed early. Commit 0bab9ca.

**What I checked/changed:** Reviewed every file diff before accepting. Confirmed the real key was never written by the AI and .env is git-ignored.

## Prompt 3: Step 2, OMDB client and home model

**Prompt:**

```
Do Step 2 only: omdbClient.ts and HomeModel.ts. Pure TypeScript, no React hooks.

omdbClient.ts:
- Read VITE_OMDB_BASE_URL and VITE_OMDB_API_KEY from import.meta.env.
- Export searchMovies(keyword). Build the URL safely (no double slash,
encodeURIComponent on the keyword) and fetch it.
- Throw a readable Error if the HTTP request fails or OMDB returns
Response 'False'. Use the OmdbSearchResponse union and check Response
before reading Search.
- Never log or print the API key or the full URL.

HomeModel.ts:
- Seed keywords array.
- fetchSeedMovies(): search several keywords in parallel, merge, dedupe by
imdbID, convert OmdbMovieItem to Movie, shuffle, return up to 20. If one
keyword fails, the others should still work.
- searchByQuery(query): trim, reject under 2 characters with a readable
error, then call searchMovies and convert the results.

For the test: add a temporary check that logs only movie titles (not the
key) to the console. Wait for me to confirm it works, then remove it.
Stop after Step 2.
```

**What AI produced:** omdbClient.ts and HomeModel.ts (Promise.allSettled, Map dedupe, Fisher-Yates shuffle, cap of 20). Commit 68118a5.

**What I checked/changed:** All five requests returned 401 when .env held a wrong key. allSettled absorbed them and the readable error appeared, which confirmed the failure path. After fixing .env, 20 titles loaded.

## Manual changes (Step 2)

1. HomeModel.ts: toMovie passed OMDB's "N/A" through as a poster URL. Now maps to an empty string. The AI missed this. Commit 52738fa.
2. HomeModel.ts: corrected the shuffle comment ("in place" vs the copy the code makes). Commit 52738fa.
3. main.tsx: restored to its Step 1 version to remove the temporary test. Commit aac8622.

**Process note:** My first edit used line numbers in Notepad and merged lines. git diff caught it before commit, git restore recovered the file, and I redid the edits with find-and-replace.

## Prompt 4: Step 3, view-model, card, grid, screen

**Prompt:**

```
Do Step 3 only: useHomeViewModel.ts, MovieCard.tsx, MovieGrid.tsx and
HomeScreen.tsx. Functional components, standard CSS, no UI library.

- useHomeViewModel: state for movies, isLoading, errorMessage. On mount,
call fetchSeedMovies from HomeModel. Catch errors and store err.message.
No fetch calls and no OMDB imports in this file.
- MovieCard: presentational only. Props: one Movie. Show poster, title,
year, type. If poster is an empty string, show a simple placeholder box
with the text "No poster". No favorite button yet.
- MovieGrid: receives a Movie[] and renders MovieCards with .map, keyed by
imdbID.
- HomeScreen: calls useHomeViewModel. Show a loading message while loading,
an error box if errorMessage exists, otherwise MovieGrid.
- App.tsx: remove all Vite demo content and render only HomeScreen. Delete
the unused Vite assets and demo CSS. Do not add the router or header yet.

Stop after Step 3.

Context update: Step 2 is verified and complete. I already removed the
temporary test from main.tsx myself, and I made two manual edits to
HomeModel.ts (N/A poster handling in toMovie, and a corrected shuffle
comment). Re-read the current files before editing, and do not modify
main.tsx or HomeModel.ts unless Step 3 requires it.
```

**What AI produced:** useHomeViewModel.ts, MovieCard.tsx, MovieGrid.tsx, HomeScreen.tsx, App.tsx, App.css and index.css, and deleted the Vite demo assets. Commit b9c26a0.

**What I checked/changed:** Read every file from disk. The dependency array is [], the view model imports HomeModel only, and key={movie.imdbID} is used. git status confirmed main.tsx and HomeModel.ts were untouched. The build passed. In the browser I verified the grid, the error state (wrong key) and the restored key. The AI edited MovieCard.tsx, App.css and App.tsx after I had approved them, and ran an unrequested tsc check.

## Manual changes (Step 3)

1. MovieCard.tsx: some poster URLs are valid but dead (e.g. Ultimate Avengers II), so the card showed a broken image icon. Added imageFailed state and an onError handler so the card shows the "No poster" placeholder. Commit 8239b33. Found by looking at the live grid, not by code review.

**Finding:** the browser console shows full request URLs, including the API key, on failed requests, even though omdbClient.ts never logs it.

## Prompt 5: Step 4, router and header

**Prompt:**

```
Do Step 4 only: React Router and the Header. Standard CSS, no UI library.

Context update: Step 3 is verified, tested in the browser and committed
(b9c26a0). I then made a manual edit to MovieCard.tsx (added imageFailed
state and an onError handler, commit 8239b33). Do not modify main.tsx,
HomeModel.ts, omdbClient.ts, useHomeViewModel.ts, MovieCard.tsx,
MovieGrid.tsx or HomeScreen.tsx. Re-read the current files before editing.

- src/components/Header.tsx: links to "/" (Home) and "/favorites"
  (Favorites), and a search box with a submit button. On submit, navigate
  to /?q=<term> using useNavigate and encodeURIComponent. Keep the input
  text in local state. Clicking Home clears the input. No validation, no
  fetch, no OMDB imports; validation stays in HomeModel for Step 5.
- src/screens/favorites/FavoritesScreen.tsx: a placeholder that renders a
  heading "Favorites" and the text "Coming in Step 6".
- App.tsx: wrap everything in BrowserRouter from react-router-dom. Render
  Header, then Routes with "/" -> HomeScreen and "/favorites" ->
  FavoritesScreen. Keep the app-container wrapper and the App.css import.
- App.css: append header styles only. Do not rewrite or reorder existing
  rules.

Rules for this session:
- Propose each file edit and wait for my approval.
- Do not edit any file after I approve it. If a change is needed, propose
  it again.
- Do not run any command I did not ask for.

Stop after Step 4.
```

**What AI produced:** Header.tsx, FavoritesScreen.tsx, App.tsx (BrowserRouter and two routes), appended header styles in App.css. Commit 8d11678.

**What I checked/changed:** Read all four files from disk. App.css diff showed 84 insertions and 0 deletions. git status confirmed main.tsx, HomeModel.ts and MovieCard.tsx were untouched. Build passed. Router, Favorites placeholder, Home link and URL change (/?q=batman) verified in the browser. Nothing was edited after approval.

## Prompt 6: Step 5, search by URL

**Prompt:**

```
Do Step 5 only: search by reading q from the URL. Standard CSS, no UI library.

Context update: Step 4 is verified, tested in the browser and committed
(8d11678). Earlier manual edits: HomeModel.ts (N/A posters, commit
52738fa) and MovieCard.tsx (imageFailed state and onError handler, commit
8239b33). Re-read the current files before editing, including HomeModel.ts
so you use the real searchByQuery signature.

Change useHomeViewModel.ts only:
- Read q with useSearchParams from react-router-dom. Use searchParams.get('q').
- If q is null (no q in the URL), load seed movies with fetchSeedMovies.
- If q is not null, call searchByQuery(q). That includes an empty q, so
  an empty submit shows the validation error from HomeModel. Do not
  duplicate validation in this file.
- The useEffect dependency array must contain the q string, not the
  searchParams object.
- At the start of each load, set isLoading to true and clear errorMessage.
- Add a cleanup flag in the effect (for example let cancelled = false, set
  to true in the cleanup) so a slow earlier response cannot overwrite a
  newer one. Do not set state if cancelled.
- Keep the same returned values: movies, isLoading, errorMessage. Set
  isLoading to false on both success and failure. Store err.message on
  failure.
- No fetch calls and no OMDB imports in this file. Import from HomeModel
  only.

Do not modify any other file. If you think HomeModel.ts, HomeScreen.tsx or
Header.tsx needs a change, tell me and wait. Do not edit it.

Rules for this session:
- Propose the file edit and wait for my approval.
- Do not edit any file after I approve it. If a change is needed, propose
  it again.
- Do not run any command I did not ask for.

Stop after Step 5.
```

**What AI produced:** useHomeViewModel.ts only: useSearchParams, q === null chooses seed or search, cleanup flag, dependency array [q]. Commit 137ce72.

**What I checked/changed:** Read the full diff from disk. Confirmed [q], q === null, the cancelled flag in both then and catch, and no fetch or omdbClient import. git status showed only useHomeViewModel.ts modified. Build passed. Browser results: all 6 tests matched expectations (batman search, "a" and empty submit showed the validation error, zzzzqq showed a not-found error, Home restored the seed grid, Back restored previous results). Nothing was edited after approval.

## Prompt 7: Step 6a (favorites model and context)
```
Do Step 6a only: the favorites model and shared state. No UI changes yet.
Standard CSS, no UI library.

Context update: Step 5 is verified, tested in the browser and committed
(137ce72). Earlier manual edits: HomeModel.ts (N/A posters, commit 52738fa)
and MovieCard.tsx (imageFailed state and onError handler, commit 8239b33).
Re-read the current files before editing, including movie.ts so you use the
real Movie type name and fields.

Create:
- src/models/FavoritesModel.ts (put it next to HomeModel.ts): pure TypeScript,
  no React, no hooks. Storage key "movie-app:favorites". Functions:
  loadFavorites(): Movie[], saveFavorites(movies: Movie[]): void,
  toggleFavorite(current: Movie[], movie: Movie): Movie[] (adds if the
  imdbID is absent, removes if present, returns a new array),
  isFavorite(current: Movie[], imdbID: string): boolean.
  loadFavorites must never throw: invalid JSON, a non-array value, or
  localStorage being unavailable returns []. Drop any stored entry that is
  not an object with a string imdbID. saveFavorites must catch storage
  errors and not throw. No console logging of stored data.
- src/context/FavoritesContext.tsx: a FavoritesProvider and a useFavorites
  hook. State is initialised from loadFavorites once. The hook returns
  favorites, isFavorite(imdbID) and toggle(movie). Every toggle calls
  saveFavorites with the new list. useFavorites must throw a clear error if
  used outside the provider.

Change App.tsx only to wrap the existing BrowserRouter content in
FavoritesProvider. Do not change routes, Header, or the app-container
wrapper.

Do not modify any other file. Do not modify main.tsx, HomeModel.ts,
omdbClient.ts, useHomeViewModel.ts, MovieCard.tsx, MovieGrid.tsx,
HomeScreen.tsx, Header.tsx, FavoritesScreen.tsx or the CSS. If you think one
of them needs a change, tell me and wait.

Rules for this session:
- Propose each file edit and wait for my approval.
- Do not edit any file after I approve it. If a change is needed, propose
  it again.
- Do not run any command I did not ask for.

Stop after Step 6a.
```

**What AI produced:** FavoritesModel.ts, FavoritesContext.tsx, App.tsx wrapped in FavoritesProvider. Commit 596fb89.

**What I checked/changed:** The AI asked where to put FavoritesModel.ts because my prompt contradicted itself (src/models/ vs next to HomeModel.ts); I chose src/models/. Read all three proposals, approved unchanged. git show -w on App.tsx showed only the import and the two provider tags. Movie type confirmed to have exactly the five fields the model rebuilds. Build passed. Nothing edited after approval.


## Prompt 8: Step 6b (favorite button and Favorites screen)
```
Do Step 6b only: the favorite button and the Favorites screen.
Standard CSS, no UI library.

Context update: Step 6a is verified, tested and committed (596fb89). It added
src/models/FavoritesModel.ts and src/context/FavoritesContext.tsx
(FavoritesProvider, useFavorites returning favorites, isFavorite(imdbID) and
toggle(movie)), and wrapped App.tsx in FavoritesProvider. Earlier manual edits:
HomeModel.ts (N/A posters, commit 52738fa) and MovieCard.tsx (imageFailed
state and onError handler, commit 8239b33). Re-read the current files before
editing, including MovieCard.tsx so the imageFailed fallback is kept exactly
as it is.

Change these files only:
- src/components/MovieCard.tsx: add two props, isFavorite: boolean and
  onToggleFavorite: (movie: Movie) => void. Add a button with type="button",
  aria-pressed={isFavorite} and an aria-label of "Add to favorites" or
  "Remove from favorites" depending on isFavorite. Show a filled heart when
  favorited and an outline heart when not (text characters, no icon library).
  Keep the imageFailed state and onError behaviour unchanged.
- src/components/MovieGrid.tsx: accept isFavorite: (imdbID: string) => boolean
  and onToggleFavorite: (movie: Movie) => void, and pass the right values
  to each card. Keep key={movie.imdbID}.
- src/screens/home/HomeScreen.tsx: call useFavorites and pass isFavorite and
  toggle to MovieGrid. Keep all existing loading and error behaviour.
- src/screens/favorites/FavoritesScreen.tsx: replace the placeholder. Heading
  "Favorites". Use useFavorites. If favorites is empty, show the text
  "No favorites yet. Add some from the Home page." Otherwise render MovieGrid
  with the favorites list. Unfavoriting from this screen removes the card
  immediately.
- src/App.css: append styles for the favorite button and the empty state
  only. Do not rewrite or reorder existing rules. The button must be keyboard
  focusable with a visible focus style.

No fetch calls and no OMDB imports in any of these files. No localStorage
access outside FavoritesModel.ts. Do not add validation or storage logic to
the components.

Do not modify any other file. Do not modify main.tsx, App.tsx, HomeModel.ts,
FavoritesModel.ts, FavoritesContext.tsx, omdbClient.ts, useHomeViewModel.ts,
Header.tsx or index.css. If you think one of them needs a change, tell me and
wait.

Rules for this session:
- Propose each file edit and wait for my approval.
- Do not edit any file after I approve it. If a change is needed, propose
  it again.
- Do not run any command I did not ask for.

Stop after Step 6b.
```


**What AI produced:** MovieCard.tsx, MovieGrid.tsx, HomeScreen.tsx, FavoritesScreen.tsx, App.css (append). Commit 5e8d250.

**What I checked/changed:** App.css diff was 49 insertions and 0 deletions even though the AI labelled the action Create. The 7 deletions were the lines the new code replaced. Build passed. Six browser tests passed: favorite, persists on reload, appears on Favorites, unfavorite shows the empty message, favorited search result shows the filled heart, corrupt storage gives an empty list and recovers on the next save. Keyboard check passed: Tab reaches each heart, Enter toggles it, focus ring visible. Nothing edited after approval.
## Prompt 9: Step 7a (card polish, CSS only)

```
Do Step 7a only: CSS polish for the movie cards. CSS only, standard CSS,
no UI library.
Context update: Step 6 is verified, tested and committed (6a 596fb89,
6b 5e8d250, log f597099). Earlier manual edits: HomeModel.ts (N/A posters,
52738fa) and MovieCard.tsx (imageFailed state and onError handler, 8239b33).
Re-read src/App.css before editing, so you use the real class names:
movie-grid, movie-card, movie-poster-wrapper, movie-poster,
movie-poster-placeholder, movie-details, movie-title, movie-meta,
favorite-button.
Change src/App.css only, by APPENDING a new block at the end under the
comment /* Step 7a: card polish */. Do not edit, delete or reorder any
existing rule. Where a later rule must override an existing one, use the
same selector so the later rule wins by order.
Goals:
1. Equal-height cards in each grid row. Cards stretch to the row height.
 Make movie-card a flex column. The details block fills the remaining
 space, and movie-meta sits at the bottom (margin-top: auto).
2. Consistent poster size. movie-poster-wrapper gets aspect-ratio: 2 / 3,
 with the image and the "No poster" placeholder filling it
 (width and height 100%, object-fit: cover for the image). Cards with a
 one-line title, a Series badge or a failed poster must look the same
 height as their neighbours.
3. Heart contrast on light posters. Make the favorite-button background
 more opaque (at least 0.9), add a subtle box-shadow, and keep the
 existing focus-visible outline and the aria-pressed colours unchanged.
4. Long titles must not break the layout: clamp movie-title to 2 lines
 with an ellipsis.
Do not modify any .tsx or .ts file. Do not modify index.css.
If you think a TSX change is needed, tell me and wait.
Rules for this session:
- Propose the edit and wait for my approval.
- Do not edit any file after I approve it. If a change is needed, propose
 it again.
- Do not run any command I did not ask for.
Stop after Step 7a.
```

**What AI produced:** App.css append only (46 insertions, 0 deletions): flex column on movie-card, flex 1
 on movie-details, margin-top auto on movie-meta, 2-line title clamp, favorite-button background 0.92
 plus box-shadow. Commit 58dfb9c.
**What I checked/changed:** The AI repeated aspect-ratio 2/3 and width 100% on .movie-poster-wrapper,
 which already existed at line 56, so goal 2 added nothing even though I told it to re-read App.css.
 Build passed. Six browser checks passed, including narrowing via zoom (header wraps, no overflow).
 Nothing edited after approval.

## Prompt 10: Step 7b (save outside the state updater)

```
Do Step 7b only: a small refactor in FavoritesContext.tsx.
Context update: Step 7a is verified, tested and committed (58dfb9c).
Earlier: 6a 596fb89 (FavoritesModel.ts and FavoritesContext.tsx),
6b 5e8d250. Re-read src/context/FavoritesContext.tsx and
src/models/FavoritesModel.ts before editing.
Problem: in FavoritesProvider, toggle calls saveFavorites inside the
setFavorites updater function. React expects updater functions to be pure,
and StrictMode runs them twice. Move the side effect out.
Change src/context/FavoritesContext.tsx only:
- toggle(movie) computes the new list from the current favorites using
 toggleFavorite, calls saveFavorites(newList) once, then calls
 setFavorites(newList). No saveFavorites call inside any updater.
- Keep the public API exactly as it is: the hook still returns favorites,
 isFavorite(imdbID) and toggle(movie). Keep the error thrown when
 useFavorites is used outside the provider.
- Rapid clicks: two toggles before a re-render must not lose the first one.
 Keep the latest list in a useRef that is updated whenever the list
 changes, and have toggle read from that ref instead of the closed-over
 favorites value. Explain in a short code comment why the ref is used.
- No new dependencies, no console logging.
Do not modify any other file. Do not modify FavoritesModel.ts, App.tsx,
any component, any screen or any CSS. If you think another file needs a
change, tell me and wait.
Rules for this session:
- Propose the edit and wait for my approval.
- Do not edit any file after I approve it. If a change is needed, propose
 it again.
- Do not run any command I did not ask for.
Stop after Step 7b.
```
**What AI produced:** FavoritesContext.tsx only: saveFavorites moved out of the setFavorites updater,
 toggle computes the new list from a useRef, updates the ref, saves once, then sets state. Commit
 4138b06.
**What I checked/changed:** Checked that toggle updates the ref itself, so two quick clicks cannot lose
 one. The AI writes favoritesRef.current = favorites during render; it works, but React guidance prefers
 syncing refs in an effect, so a lint rule could flag it. Build passed. Five browser tests passed:
 persists on reload, two quick favorites both kept, both on Favorites, unfavorite from Favorites,
 corrupt storage gives an empty list and heals on the next save. Nothing edited after approval.
## Prompt 11: Step 8a (Firebase init and auth model)

```
Do Step 8a only: Firebase initialisation and the auth model. No UI changes.
Standard TypeScript, no UI library.

Context update: Step 7 is verified, tested and committed (7a 58dfb9c,
7b 4138b06, log 87d8c7d). The firebase npm package is already installed
(commit a77f8ba). The six Firebase values are already in .env, which is
git-ignored, and their names are in .env.example (commit 8a5a275). Do not
install anything and do not read or print .env. Re-read the current files
before editing, including src/vite-env.d.ts, src/models/FavoritesModel.ts
and src/services/omdbClient.ts, so you follow the existing style.

Create:
- src/services/firebase.ts: initialise the Firebase app and export `auth`
  (getAuth). Read these env variables from import.meta.env:
  VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID. If any is
  missing or empty, throw an Error that names the missing variable but
  never includes any value. No hard-coded config values. No console
  logging. Do not initialise Firestore in this step.
- src/models/AuthModel.ts: no React, no hooks. Import auth from
  src/services/firebase.ts only. Export:
  type AuthUser = { uid: string; email: string | null }
  type AuthResult = { ok: true; user: AuthUser } | { ok: false; message: string }
  signUp(email: string, password: string): Promise<AuthResult>
  logIn(email: string, password: string): Promise<AuthResult>
  logOut(): Promise<void>
  subscribeToAuth(callback: (user: AuthUser | null) => void): () => void
  (wraps onAuthStateChanged and returns the unsubscribe function).
  Validation lives in this file only: trim the email; reject an empty
  email or one without "@"; reject a password shorter than 6 characters.
  Return { ok: false, message } instead of throwing. Catch Firebase
  errors and map error.code to short readable messages:
  auth/email-already-in-use, auth/weak-password, auth/invalid-email and
  auth/network-request-failed each get their own message. For
  auth/invalid-credential, auth/user-not-found and auth/wrong-password
  use one shared message ("Incorrect email or password.") so the app does
  not reveal whether an email is registered. Any other code gets a
  generic message. Never log or return the password, the raw error object
  or the config. No console logging.

Change src/vite-env.d.ts only to add the six VITE_FIREBASE_* names to the
existing ImportMetaEnv interface as readonly string fields. Do not change
the existing OMDB entries.

Do not modify any other file. Do not modify package.json,
package-lock.json, .env, .env.example, main.tsx, App.tsx, any component,
any screen, FavoritesModel.ts, FavoritesContext.tsx, HomeModel.ts,
omdbClient.ts, useHomeViewModel.ts or any CSS. If you think another file
needs a change, tell me and wait.

Rules for this session:
- Propose each file edit and wait for my approval.
- Do not edit any file after I approve it. If a change is needed, propose
  it again.
- Do not run any command I did not ask for.
Stop after Step 8a.
```
**What AI produced:** firebase.ts (reads six VITE_FIREBASE_* values from import.meta.env, throws an error naming only the missing variable, exports auth), AuthModel.ts (signUp, logIn, logOut, subscribeToAuth, validation, error-code mapping with one shared message for invalid-credential, user-not-found and wrong-password) and six readonly string lines in vite-env.d.ts. 3 files, 165 insertions. Commit a0a1f41.
**What I checked/changed:** The AI searched the web (unrelated repos in its Sources list) and read files outside the re-read list (package.json, both tsconfigs, App.tsx), though the prompt asked for neither. The first attempt hit the Individual quota (about 97 hours), with no file written and the tree clean at a77f8ba, so I re-ran Prompt 11 unchanged. Reviewed all proposals before approving. Read both new files back from disk. Scan for AIza and console. found nothing, and no config value appears in src. Build passed. logOut has no try/catch, which follows the spec, so I noted it as a candidate improvement. No browser test yet because nothing imports firebase.ts until Step 8b. Nothing edited after approval.

## Prompt 12: Step 8b-i (Auth context)

```
Do Step 8b-i only: the auth context and its provider. No UI screens, no
Header change, no CSS. Standard TypeScript, no UI library.

Context update: Step 8a is verified, tested and committed (a0a1f41, log
f6fb308). It added src/services/firebase.ts, src/models/AuthModel.ts
(AuthUser, AuthResult, signUp, logIn, logOut, subscribeToAuth) and the six
VITE_FIREBASE_* types in src/vite-env.d.ts. Do not install anything and do
not read or print .env. Re-read the current files before editing, including
src/models/AuthModel.ts, src/context/FavoritesContext.tsx and src/App.tsx,
so you follow the existing style and the real names.

Create:
- src/context/AuthContext.tsx: an AuthProvider and a useAuth hook. Import
  from src/models/AuthModel.ts only; do not import firebase or
  firebase/auth directly. State: user (AuthUser | null) and isLoading
  (boolean, true until the first subscribeToAuth callback fires). Subscribe
  once in a useEffect with an empty dependency array and return the
  unsubscribe function from the effect. The hook returns user, isLoading,
  signUp, logIn and logOut, which are the AuthModel functions passed
  through unchanged. useAuth must throw a clear error if used outside the
  provider. No console logging. Do not store the password anywhere.

Change src/App.tsx only to wrap the existing content in AuthProvider,
inside BrowserRouter and outside FavoritesProvider. Do not change routes,
Header, or the app-container wrapper.

Do not modify any other file. Do not modify AuthModel.ts, firebase.ts,
vite-env.d.ts, FavoritesModel.ts, FavoritesContext.tsx, main.tsx, any
component, any screen, HomeModel.ts, omdbClient.ts, useHomeViewModel.ts,
package.json, .env, .env.example or any CSS. If you think another file
needs a change, tell me and wait.

Rules for this session:
- Propose each file edit and wait for my approval.
- Do not edit any file after I approve it. If a change is needed, propose
  it again.
- Do not run any command I did not ask for.
- Do not search the web.
Stop after Step 8b-i.
```
**What AI produced:** AuthContext.tsx (new, AuthProvider and a useAuth hook that exposes user, isLoading, and the signUp, logIn and logOut functions from AuthModel.ts) and App.tsx with the existing FavoritesProvider block re-indented inside AuthProvider. 2 files, 59 insertions, 9 deletions. Commit 03b0a13.
**What I checked/changed:** The AI did not search the web and showed no Sources list, and it read no file I had not named, so the added "Do not search the web" line fixed the Prompt 11 miss. Both routes (/ and /favorites) are still in App.tsx. Scan for AIza and console. found nothing. Build passed (modules 35 to 49, bundle 265 kB to 373 kB, expected because Firebase Auth is now imported). Browser test: the movie grid loads, hearts work, and firebase.ts initialised with no missing-variable error. The 9 deleted lines in App.tsx are the old provider block re-indented. Candidate improvements: the context value object is rebuilt on every render, and logOut has no try/catch (follows the Prompt 11 spec).

## Prompt 13: Step 8b-ii (Login screen and header auth)

```
Do Step 8b-ii only: the login and signup screen, the /login route, the
Header logged-in state, and the CSS. Standard TypeScript, no UI library.

Context update: Step 8b-i is verified, tested and committed (03b0a13, log
848a357). It added src/context/AuthContext.tsx (AuthProvider and useAuth,
which returns user, isLoading, signUp, logIn and logOut) and wrapped the
app in AuthProvider in src/App.tsx. Do not install anything and do not
read or print .env. Re-read the current files before editing, including
src/context/AuthContext.tsx, src/models/AuthModel.ts, src/App.tsx,
src/App.css, src/components/Header.tsx and
src/screens/favorites/FavoritesScreen.tsx, so you follow the existing
style, folder layout and real names.

Create:
- src/screens/login/LoginScreen.tsx: the login and signup screen, in its
  own folder like the existing screens. Use useAuth only; do not import
  firebase, firebase/auth or AuthModel directly. One form with email and
  password fields and a submit button, plus a control that switches
  between "Log in" and "Sign up" modes. Use labelled inputs,
  type="email" and type="password", with noValidate on the form so the
  validation messages from AuthModel are the ones shown. Do not duplicate
  validation in the screen. On submit, call logIn or signUp and show the
  returned message when ok is false. On success, navigate to "/". Disable
  the submit button while a request is pending. Clear the password field
  after every submit. Keep the password only in the input's own state;
  never store it elsewhere. If a user is already logged in, redirect to
  "/". While isLoading is true, render nothing for the form. No console
  logging.

Change src/App.tsx only to add a path="/login" route for LoginScreen. Do
not change the existing routes, providers or the app-container wrapper.

Change src/components/Header.tsx only to add the auth state: while
isLoading, show nothing auth-related; when logged out, show a "Log in"
link to /login; when logged in, show the user's email and a "Log out"
button that calls logOut. Do not change the existing header links or
layout.

Change src/App.css only by appending new rules for the screen and the
header auth area. Do not edit or delete any existing rule.

Do not modify any other file. Do not modify AuthModel.ts,
AuthContext.tsx, firebase.ts, vite-env.d.ts, FavoritesModel.ts,
FavoritesContext.tsx, main.tsx, index.css, HomeScreen.tsx,
FavoritesScreen.tsx, HomeModel.ts, omdbClient.ts, useHomeViewModel.ts,
package.json, .env or .env.example. If you think another file needs a
change, tell me and wait.

Rules for this session:
- Propose each file edit and wait for my approval.
- Do not edit any file after I approve it. If a change is needed, propose
  it again.
- Do not run any command I did not ask for.
- Do not search the web.
Stop after Step 8b-ii.
```
**What AI produced:** LoginScreen.tsx (new, in src/screens/login/), a /login route in App.tsx, the auth state in Header.tsx (a Log in link when logged out, or the user's email and a Log out button when logged in, nothing while isLoading) and appended rules in App.css. 4 files, 285 insertions, 0 deletions. Commit 96112ec.
**What I checked/changed:** The AI proposed all four files and stopped. It ran no web search, showed no Sources list and read no file I had not named. Reviewed all proposals before approving and accepted them unchanged. Its last action was labelled "Create" on App.css, but git diff --numstat showed 145 additions and 0 deletions, so it was a pure append and the label was only misleading wording. Scan for AIza and console. found nothing, LoginScreen.tsx has no firebase or AuthModel import, and App.css has no variables for the new hardcoded colours to clash with. Read the new files back from disk. Build passed (50 modules, JS bundle 373 kB to 375 kB). All seven browser tests passed: sign-up (the user appeared in Firebase Authentication), log out then log in, wrong password gives the shared message, bad email and short password show validation with no network request, the session survives a refresh, /login redirects when logged in, and the narrow window is fine with the email truncated and the nav intact. Back after login went to the earlier screen. Nothing edited after approval. Candidate improvements: void logOut() has no handling for a rejected promise, both handleSubmit and the effect navigate to "/" on success, and the new CSS colours are hardcoded. The test user stays in Firebase for Prompt 14.

## Prompt 14: Step 9b-i (Firestore init and user data model)

```
Do Step 9b-i only: initialise Firestore and add a user-data model. No UI
changes, no context changes. Standard TypeScript, no UI library.

Context update: Step 9a is done. The published Firestore rules allow read
and write on users/{uid} only when request.auth.uid == uid, and deny
everything else. Step 8b-ii is verified, tested and committed (96112ec,
log 61897f0). Do not install anything (the firebase package already
includes Firestore) and do not read or print .env. Re-read the current
files before editing, including src/services/firebase.ts,
src/models/AuthModel.ts, src/models/FavoritesModel.ts and
src/types/movie.ts, so you follow the existing style, the real names and
the existing favorite type.

Change src/services/firebase.ts only to initialise Firestore from the
existing app and export it as `db` (getFirestore). Keep the existing
environment checks and the `auth` export exactly as they are. No
hard-coded config values. No console logging.

Create:
- src/models/UserDataModel.ts: no React, no hooks. Import db from
  src/services/firebase.ts and the Firestore functions from
  firebase/firestore. Use the existing favorite type from
  FavoritesModel.ts or src/types/movie.ts; do not invent a new one.
  Export:
  type LoadResult = { ok: true; favorites: <favorite type>[] } | { ok: false; message: string }
  type SaveResult = { ok: true } | { ok: false; message: string }
  loadFavorites(uid: string): Promise<LoadResult>
  saveFavorites(uid: string, favorites: <favorite type>[]): Promise<SaveResult>
  Data location: the `favorites` field of the document users/{uid}. Do
  not use a subcollection. loadFavorites returns an empty list when the
  document or the field does not exist, and also when the field is not an
  array. saveFavorites writes only the `favorites` field and must not
  overwrite other fields in the document (use merge). Reject an empty or
  non-string uid by returning { ok: false, message }. Firestore rejects
  undefined values, so make sure saveFavorites never writes one, and tell
  me in your proposal how you handled it. Return { ok: false, message }
  instead of throwing. Catch Firestore errors and map error.code to short
  readable messages: permission-denied and unavailable each get their
  own message; any other code gets a generic message. Never log or return
  the raw error object, the uid or the config. No console logging.

Do not modify any other file. Do not modify AuthModel.ts,
AuthContext.tsx, FavoritesModel.ts, FavoritesContext.tsx, App.tsx,
Header.tsx, LoginScreen.tsx, main.tsx, vite-env.d.ts, any other screen,
HomeModel.ts, omdbClient.ts, useHomeViewModel.ts, package.json, .env,
.env.example or any CSS. If you think another file needs a change, tell
me and wait.

Rules for this session:
- Propose each file edit and wait for my approval.
- Do not edit any file after I approve it. If a change is needed, propose
  it again.
- Do not run any command I did not ask for.
- Do not search the web.
Stop after Step 9b-i.
```
**What AI produced:** firebase.ts (a getFirestore import and an exported db, 2 additions) and UserDataModel.ts (new; LoadResult and SaveResult types, loadFavorites and saveFavorites on the favorites field of users/{uid}, written with merge, every movie field coerced to a string so no undefined is written, error codes mapped to short messages). 2 files, 107 insertions, 0 deletions. Commit 6e50532.
**What I checked/changed:** The AI explained in its proposal how it handled undefined, as the prompt required. This time its output ended with a Sources list of seven github.com entries from unrelated repos, so "Do not search the web" held for Prompts 12 and 13 and missed on Prompt 14. Its closing summary said no web searches were performed, which the Sources list contradicts. It read only the four files I had named (firebase.ts, AuthModel.ts, FavoritesModel.ts, movie.ts). I read both proposals before approving, but I approved with the single word "approve" instead of the full wording, so the approval did not restrict further edits or commands. The result still matched the proposals: git status showed only the two expected files and firebase.ts changed by 2 additions and 0 deletions. Scan for AIza and console. found nothing, UserDataModel.ts has no React import and uses merge, and Movie has exactly the five fields the model writes. Build passed (56 modules, JS bundle 375 kB to 744 kB because Firestore is now included, with a new warning about chunks over 500 kB). The app still loads, hearts work, login works, the Network tab shows no Firestore request because nothing calls the model yet, and the console has no errors. Candidate improvements: saveFavorites writes an empty-ID entry for malformed input that loadFavorites then drops, and code-splitting for the larger bundle.

## Prompt 15: Step 9b-ii (Favorites context synced to Firestore)

```
Do not search the web or cite any sources.

Do Step 9b-ii only: connect the favorites context to the user data
model. No UI changes. Standard TypeScript, no UI library.

Context update: Step 9b-i is verified, tested and committed (6e50532).
It added db in src/services/firebase.ts and src/models/UserDataModel.ts
(loadFavorites and saveFavorites, which return { ok } results and never
throw). Step 9a rules are published: only the signed-in owner can read
or write users/{uid}. AuthProvider already wraps FavoritesProvider, so
useAuth is available inside the favorites context. Do not install
anything and do not read or print .env. Re-read the current files
before editing, including src/context/FavoritesContext.tsx,
src/models/FavoritesModel.ts, src/models/UserDataModel.ts and
src/context/AuthContext.tsx, so you follow the existing style and the
real names.

Change src/context/FavoritesContext.tsx only. Keep the existing public
value (favorites, toggle and anything else it exposes) and keep the
useRef approach, so two quick clicks cannot lose a favorite. Add:
- Read user and isLoading from useAuth. While isLoading is true, do not
  load or save anything.
- Logged out: behave exactly as today, using the localStorage functions
  from FavoritesModel.ts. When a user logs out, replace the in-memory
  list with the localStorage list. The signed-in user's favorites must
  not remain in memory or be written to localStorage.
- Logged in: load the user's list with loadFavorites(user.uid) and
  replace both the state and the ref with it. Do not merge it with the
  localStorage list, and do not write anything to localStorage while
  logged in.
- Save only after a successful load for that user. If the load returns
  { ok: false }, keep the list empty and do not save for that user, so a
  failed load can never overwrite stored data. A toggle before the load
  finishes must not trigger a save.
- On toggle while logged in: compute the new list from the ref, update
  the ref, call saveFavorites(user.uid, newList) once, then set state.
  Do not roll back state if a save fails; ignore the result for now.
- Ignore a load result that arrives after the user changed or logged
  out (use a cancelled flag in the effect cleanup).
- No console logging. Never store the uid anywhere except as the
  argument to the model functions.

Do not modify any other file. Do not modify UserDataModel.ts,
FavoritesModel.ts, firebase.ts, AuthModel.ts, AuthContext.tsx,
App.tsx, Header.tsx, LoginScreen.tsx, FavoritesScreen.tsx,
HomeScreen.tsx, main.tsx, vite-env.d.ts, package.json, .env,
.env.example or any CSS. If you think another file needs a change,
tell me and wait.

Rules for this session:
- Propose the file edit and wait for my approval.
- Do not edit any file after I approve it. If a change is needed,
  propose it again.
- Do not run any command I did not ask for.
- Do not search the web or cite any sources.
Stop after Step 9b-ii.
```
**What AI produced:** FavoritesContext.tsx only. It reads user and isLoading from useAuth, does nothing while isLoading is true, keeps the localStorage behaviour when logged out (and reloads the localStorage list on logout), loads the user's list with loadFavorites(user.uid) when logged in, ignores late results with a cancelled flag, saves with saveFavorites only after a successful load, never writes localStorage while logged in, and keeps the useRef toggle. The public value (favorites, isFavorite, toggle) is unchanged. 1 file, 75 insertions, 5 deletions. Commit c80b470.
**What I checked/changed:** The prompt now opens with "Do not search the web or cite any sources", and no Sources list appeared this time, so the first-line wording held on its first try (one prompt is too little to call it fixed). agy read only files named in the prompt. I read the proposal before approving and approved with the full wording (exactly as shown, no other changes, no commands), and the result matched the proposal. Read the new file back from disk. Scan for AIza and console. found nothing, the file has no localStorage call of its own (storage goes through the model), and uid appears only in the load and save calls. Build passed (57 modules, JS bundle 744 kB to 809 kB, with the same chunk-size warning). All ten browser tests passed: logged-out favorites persist; a login starts with an empty list; two favorites appear in users/{uid} in Firestore and survive a reload; logging out shows the logged-out list, not the account's; a second account starts empty and gets its own document; logging back in as user 1 shows only user 1's favorites; two quick clicks are both kept in the app and in Firebase; an unfavorite from the Favorites page survives a reload; and the localStorage favorites key does not change while logged in. Tests 5, 7 and 10 are the isolation proofs, and test 6 also confirms the Step 9a rules work for a second account. Nothing edited after approval. Candidate improvements: a toggle made before the load finishes is lost when the load lands; a failed load is silent, so later toggles never save; a failed save is silent and state is not rolled back; there is a one-render gap at login and logout before the effect runs; the effect depends on the user object, not user.uid; synchronous setState inside the effect may trip newer lint rules; merging local favorites on first login is deferred; and code-splitting for the large bundle.

## Prompt 16: Step 10 (Sync errors, early-toggle guard and logout handling)

```
Do not search the web or cite any sources.

Do Step 10 only: make favorites sync failures visible, stop early
toggles from being lost, and handle a failed logout. Standard
TypeScript, no UI library.

Context update: Step 9b-ii is verified, tested and committed (c80b470,
log bd52ebf). FavoritesContext.tsx loads and saves the signed-in user's
favorites through UserDataModel.ts, which returns { ok } results and
never throws. Today a failed load or save is silent, a toggle made
before the load finishes is lost when the load lands, and Header.tsx
calls logOut with void and no handling. Do not install anything and do
not read or print .env. Re-read the current files before editing,
including src/context/FavoritesContext.tsx, src/components/Header.tsx,
src/models/UserDataModel.ts, src/models/AuthModel.ts and
src/context/AuthContext.tsx, so you follow the existing style and the
real names.

Change src/context/FavoritesContext.tsx only to add:
- A syncError state (string | null), added to the context value next to
  favorites, isFavorite and toggle. Keep the existing three unchanged.
- Logged in, load not yet successful: toggle changes nothing and saves
  nothing. A toggle before the load finishes is ignored, not queued.
- Failed load: set syncError to "Could not load your favorites. " plus
  the message from the result, keep the list empty, and keep ignoring
  toggles for that user. Clear syncError when a load starts.
- Failed save: set syncError to "Could not save your last change. " plus
  the message from the result. Do not roll back the list. A later
  successful save clears syncError.
- Ignore a save result that arrives after the user changed or logged
  out. Use a plain number in a ref that the effect increments each time
  it runs; the toggle captures it and compares when the result lands.
  Do not store the uid in any ref or state.
- Clear syncError when the user logs out or changes, and keep it null
  when logged out.
- Keep the useRef list, the cancelled flag, the no-save-before-load rule
  and the rule that nothing is written to localStorage while logged in.
  Logged-out behaviour stays exactly as it is. No console logging.

Change src/components/Header.tsx only to add:
- Read syncError from useFavorites.
- Replace the void logOut() call with a handler that clears a local
  logoutError, awaits logOut in a try/catch, and on failure sets
  logoutError to "Could not log out. Please try again." Never log or
  show the raw error.
- Render one message element with role="alert" and
  className="sync-error", placed after the existing header element (use
  a fragment), showing syncError or logoutError when either is set and
  nothing otherwise. Do not change the existing header markup, links,
  search form or auth area.

Change src/App.css only by appending a .sync-error rule (a short
message bar that matches the existing error-message look). Do not edit
or delete any existing rule.

Do not modify any other file. Do not modify UserDataModel.ts,
FavoritesModel.ts, firebase.ts, AuthModel.ts, AuthContext.tsx, App.tsx,
LoginScreen.tsx, FavoritesScreen.tsx, HomeScreen.tsx, MovieCard.tsx,
MovieGrid.tsx, main.tsx, vite-env.d.ts, index.css, package.json, .env
or .env.example. If you think another file needs a change, tell me and
wait.

Rules for this session:
- Propose each file edit and wait for my approval.
- Do not edit any file after I approve it. If a change is needed,
  propose it again.
- Do not run any command I did not ask for.
- Do not search the web or cite any sources.
Stop after Step 10.
```
**What AI produced:** FavoritesContext.tsx (a syncError value, toggles ignored while logged in until a load has succeeded, failed load and failed save messages, no rollback on a failed save, and a run-number ref so a late save result from a previous user or session is ignored), Header.tsx (reads syncError, a handleLogOut with try/catch replacing void logOut(), and a role="alert" message bar after the header inside a fragment) and App.css (a .sync-error rule appended). 3 files, 108 insertions, 47 deletions. Commit 300e982.
**What I checked/changed:** No Sources list appeared and agy read no file I had not named, so the first-line "Do not search the web or cite any sources" held for a second prompt in a row. I read the proposal before approving and approved with the full wording (exactly as shown, no other changes, no commands), and the result matched. Its closing summary labelled the App.css action "Create" again, but git diff --numstat showed 14 additions and 0 deletions, so it was a pure append. Header.tsx shows 61 additions and 40 deletions only because wrapping the header in a fragment re-indents it; its links, search form and auth area are unchanged. Read the new files back from disk, including the end of the FavoritesContext.tsx diff: the early-toggle return comes before anything is computed or saved, a failed save only sets the error, and the save result is compared with the run number. Scan for AIza and console. found nothing, the context has no localStorage call, and uid appears only in the load and save calls. Build passed (57 modules, JS bundle 808.72 kB to 809.26 kB, CSS 5.75 kB to 5.93 kB, same chunk-size warning). All eight browser tests passed: a saved favorite appears in Firestore with no error bar; a click right after login does nothing; a reload keeps the favorites; an offline reload shows "Could not load your favorites." with an empty list and inert hearts; going back online clears the error and restores the favorites; switching to a second user carries no error over; logged-out favorites work as before; and Log out works normally. The failed-save and failed-logout messages are untested, because they cannot be triggered safely on a live project. Nothing edited after approval. Candidate improvements: out-of-order saves can show a stale error or clear a real one, hearts give no feedback while the load runs, and the effect still depends on the user object, not user.uid.