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

