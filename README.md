# BeanMap

Developer: Kristian Colville

![1773603802803](image/README/1773603802803.png)

visit:
https://node-full-stack-11.onrender.com

## Table of Contents

* [Project Goals](#project-goals)
  * [Personal Goals](#personal-goals)
* [User Experience (UX)](#user-experience-ux)
  * [Target Audience](#target-audience)
* [Design](#design)
  * [Color Scheme](#color-scheme)
  * [Typography](#typography)
  * [Layout](#layout)
  * [Icons](#icons)
  * [Leveraging Bulma](#leveraging-bulma)
* [Technologies &amp; Tools](#technologies--tools)
  * [Tech stack](#tech-stack)
  * [Back end &amp; server](#back-end--server)
  * [Code quality &amp; formatting](#code-quality--formatting)
  * [Front end &amp; docs](#front-end--docs)
* [Features](#features)
  * [Release 1](#release-1)
  * [Release 2](#release-2)
* [Data](#data)
* [Testing](#testing)
  * [Actual Testing](#actual-testing)
* [Bugs](#bugs)
  * [Bug Details](#bug-details)
* [Releases](#releases)
  * [Overview](#overview)
  * [Git Workflow](#git-workflow)
  * [Development Strategy](#development-strategy)
    * [Timeline](#timeline)
    * [Git Scope & Branching](#git-scope--branching)
  * [Release Results](#release-results)
    * [Release 1](#release-1-1)
    * [Release 2](#release-2-1)
* [Development &amp; Deployment](#development--deployment)
  * [Version Control](#version-control)
  * [Cloning the Repository](#cloning-the-repository)
  * [Render](#render)
* [Credits](#credits)


---

## Project Goals

Beanmap is building a cafe-focused points-of-interest (POI) web application that lets users discover, add, and manage specialty cafes. The project follows an incremental implementation approach, with each level adding more features and complexity. The application will:

- **Deliver a modern, responsive UI** that works well on any device, using Bulma CSS for layout and components, with a branded colour palette (Coolors), custom nav with hamburger menu, and card-based cafe listings.
- **Support full CRUD for cafés (POIs)** with name, category, description, and latitude/longitude, including validation via Joi on both form submission and API, and owner-only delete so only the user who created a café can remove it.
- **Provide a REST API** for café and user operations (list, get by id, create, update, delete, get by category), with JSON responses and optional JWT for API auth, alongside the controller-based web flows that handle redirects and server-rendered views.
- **Use a strong backend tooling stack** centred on Hapi (routes, cookie auth, Vision for Handlebars, Inert for static assets, Joi for validation, optional Swagger and JWT), TypeScript across the backend, and a clear separation between controllers (web) and API handlers.
- **Prioritise maintainability and code quality** with a structured codebase (controllers, routes, stores, schemas), ESLint (Airbnb base) and Prettier for formatting, and a test suite (Mocha/Chai) including controller tests with fixtures and an endpoint counter so new controller endpoints require corresponding tests.
- **Enable secure, personalised user experiences** through sign-up, login, logout, account view and update, and session-based auth (cookie) for the web app, with credentials validated against a user store.
- **Use a storage facade** (in-memory and optional JSON file stores) so the same interface can later be swapped for a real database like mongodb and firebase, supporting iterative development and future migration.
- **Support deployment and iteration** by deployment to Render, environment-based config, and a clear Git workflow, building on skills from other modules on the course to provide the full stack experience.

By combining incremental levels, robust backend tooling, and a clean separation between web and API flows, the project aims to deliver a solid POI platform that is easy to extend and ready for future database and deployment integration.

### Personal Goals

As the developer, my goals for this project include:

- **Building a POI application incrementally** following the assignment levels, adding complexity step by step (accounts, CRUD, categories, API, validation, ownership, tests) without skipping ahead in ways that break redirects or mix API and controller responsibilities.
- **Applying strong backend practices** with Hapi as the core framework, using its plugin ecosystem (Vision, Inert, cookie auth, Joi, etc.) and TypeScript for type safety and maintainability across routes, controllers, and stores.
- **Implementing secure authentication and session handling** for the web app (cookie-based sessions, credential validation) and understanding where API-style auth (e.g. JWT) fits for future API-only usage.
- **Keeping frontend and backend integration clear** by avoiding duplicate registration or double invocation in `server.ts`, and by using controllers for web flows (views, redirects) and dedicated API handlers for JSON, so each request is handled in the right place.
- **Writing tests that stay in sync with the codebase** using Mocha/Chai, `server.inject()` for controller tests, fixtures for payloads, and a counter test so new controller endpoints require new tests and updates to the expected endpoint count.
- **Leveraging skills from other modules** including web development (HTML, CSS, Bulma, Handlebars), database (store interfaces and persistence patterns), and DevOps (deployment, env config, Git workflow) to deliver a complete, deployable application.
- **Documenting decisions and setup** in the README (goals, tech stack, bugs, testing, deployment) so the project is understandable and reproducible for grading and future iteration.

These goals guide a backend-focused, incremental approach that meets the POI assignment spec while keeping the codebase testable, deployable, and ready for further releases.


---

## User Experience (UX)

Beanmap is built for people who want to discover, save, and organise cafes as points of interest. The experience centres on simple listing and management of cafes, with a responsive layout and clear navigation so it works on phones and desktops.

### Target Audience

Beanmap is aimed at users who care about finding and tracking cafes. The main audiences include:

- **Coffee enthusiasts:** People who seek out specialty or local cafes and want a single place to record and revisit their favourites.
- **Travellers and explorers:** Visitors or locals who build a personal map of cafes by area and want to add notes (category, description) and coordinates for later reference.
- **Remote workers and students:** Anyone looking for spots to work or study who wants to keep a list of cafes with basic details and location.
- **Community and hobby groups:** Clubs or groups that share cafe recommendations and want to maintain a shared or personal POI list with categories.
- **Users on the go:** People who prefer to browse and add cafes from a phone or tablet, with a layout that stays usable on small screens (e.g. hamburger menu, card layout).

The app is designed to be straightforward for casual use while still supporting structured data like categories, coordinates and a personalised experience, so both occasional browsers and more organised users can get value from it.


---

## Design

Code formatting follows **Airbnb style** via [ESLint](https://eslint.org/) with [eslint-config-airbnb-base](https://www.npmjs.com/package/eslint-config-airbnb-base), and [Prettier](https://prettier.io/) for consistent formatting (see [.prettierrc.json](.prettierrc.json) and [.eslintrc.json](.eslintrc.json)). Prettier is extended with `eslint-config-prettier` so it works with ESLint; TypeScript is supported via `@typescript-eslint/parser` and `plugin:@typescript-eslint/recommended`.

### Color Scheme

The palette was created with [Coolors](https://coolors.co/) and applied in [public/css/app.css](public/css/app.css) as CSS variables:

![Beanmap colour palette](docs/assets/images/Beanmap-colors.png)

Branding colours (variables in `app.css`):

| Variable | Hex / value | Usage |
|----------|-------------|--------|
| `--ink-black` | #001524 | Primary text, nav |
| `--ink-black-light` | #003052 | — |
| `--ash-grey` | #9db5b2 | Secondary |
| `--light-cyan` | #daf0ee | Highlights, active states |
| `--walnut` | #6d3d14 | Accents, icons |
| `--espresso` | #551b14 | — |
| `--body-background` | rgb(246, 246, 246) | Page background |

**Logos and icons** (in `public/images/`):

- [Beanmap logo](public/images/beanmap.webp) (dark)
- [Beanmap logo light](public/images/beanmap-light.webp) (light)
- Favicon and app icons: `favicon.ico`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `favicon-16x16.png`, `favicon-32x32.png`

![Beanmap logo](public/images/beanmap.webp)  
![Beanmap logo light](public/images/beanmap-light.webp)


### Typography

We use [Google Fonts](https://fonts.googleapis.com/css2?family=Niconne&display=swap) — **Niconne** — for headings (`h1`–`h6`) and nav items to give the app a distinct, script-style look. Body text and the rest of the UI rely on Bulma’s default typography so content stays readable and consistent with the framework.

### Layout

Every Beanmap page sits on **Bulma’s column and container grid**. The framework lets us:

- Slot cafe cards, the add-cafe form, and nav content neatly into place
- Reflow the layout from widescreen dashboards to pocket-sized views without fuss
- Use spacing helpers for breathing room and avoid one-off CSS tweaks

The result is a layout that feels natural whether you’re browsing cafes on a laptop or adding a new spot from your phone.

### Icons

css hamburger animation:
https://jonsuh.com/hamburgers/


### Leveraging Bulma

Our UI/UX approach aimed to **minimise custom CSS** from the start. By leaning on Bulma’s spacing, alignment, and component helpers (navbar, cards, columns, forms, buttons), we managed to:

- **Trim development time** (by our estimate, on the order of ~20%) while still achieving a branded look
- **Keep visual patterns consistent** across the dashboard, café list, add-cafe form, and account views
- **Simplify upkeep and future tweaks** so layout and responsiveness stay in one place instead of scattered over custom rules

We only added bespoke styles where Bulma couldn’t cover a specific need, keeping the stylesheet lean. The result is a responsive, polished interface that works well for users and stays straightforward for developers to extend.

---

## Technologies &amp; Tools

### Tech stack

- **Back end:** Node.js, Hapi
- **Data:** In-memory store (facade for future DB levels)
- **Front end:** Handlebars, Bulma
- **API:** REST (basic)

### Back end & server

- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript; used for the whole backend and build output.
- [Hapi](https://hapi.dev/) ([@hapi/hapi](https://www.npmjs.com/package/@hapi/hapi)) - Node.js web framework for routes, auth, and plugins.
- [@hapi/boom](https://www.npmjs.com/package/@hapi/boom) - HTTP-friendly error objects for Hapi.
- [@hapi/cookie](https://www.npmjs.com/package/@hapi/cookie) - Cookie authentication plugin for Hapi (session).
- [@hapi/inert](https://www.npmjs.com/package/@hapi/inert) - Static file and directory handlers for Hapi (e.g. `/assets`).
- [@hapi/vision](https://www.npmjs.com/package/@hapi/vision) - Templating (Handlebars) support for Hapi.
- [hapi-auth-jwt2](https://www.npmjs.com/package/hapi-auth-jwt2) - JWT authentication strategy for Hapi (API).
- [hapi-swagger](https://www.npmjs.com/package/hapi-swagger) - OpenAPI/Swagger documentation for Hapi routes.
- [Joi](https://joi.dev/) - Schema validation for payloads and config (used with Hapi validation).
- [dotenv](https://www.npmjs.com/package/dotenv) - Loads environment variables from `.env`.

### Code quality & formatting

- [ESLint](https://eslint.org/) - Linting; [Airbnb base config](https://www.npmjs.com/package/eslint-config-airbnb-base) for style, [Prettier](https://www.npmjs.com/package/eslint-config-prettier) to avoid conflicts, [@typescript-eslint](https://typescript-eslint.io/) for TypeScript.
- [Prettier](https://prettier.io/) - Code formatter. Options in [.prettierrc.json](.prettierrc.json): `trailingComma: "es5"`, `tabWidth: 2`, `semi: true`, `singleQuote: false`, `printWidth: 180`.

### Front end & docs

- [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML) - The standard markup language used to structure the web pages and content of the application.
- [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS) - Used for styling the application, enhancing layout, colors, and responsiveness.
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - The primary programming language powering the web app's interactivity.
- [Bulma CSS Framework](https://bulma.io/) - A modern, responsive CSS framework used for layout, typography, and UI components to minimize custom styling.
- [Google Fonts](https://fonts.google.com/) - Used to serve the Niconne font for headings and nav items (see Design → Typography).
- [Handlebars](https://handlebarsjs.com/) - View templates rendered by Hapi Vision.
- [Flaticon](https://www.flaticon.com/) - Source for the icons used in the project.
- [Coolors](https://coolors.co/) - Used to generate the Beanmap colour palette (see Design → Color Scheme).
- [Favicon](https://favicon.io/) - A favicon generator for the web app.
- [GeeksForGeeks](https://www.geeksforgeeks.org/node-js/node-js-crypto-pbkdf2-method/) - Referenced for working with NodeJs and building a salt & hashing password system.
- [Photopea](https://www.photopea.com/) - An online photo editing tool used to customize the logo for the project.
- [Render](https://render.com/) - For deploying my project and using compute resources.


---

## Features


### Release 1

| Area        | Delivered |
|------------|-----------|
| **Accounts** | Sign up / Log in |
| **Placemark** | Name, category; CRUD; categories |
| **API** | Basic REST API |
| **Models** | Memory store |
| **Deployment** | Localhost |
| **Git** | Commit history |


### Release 2

Release 2 aligns with **Level 2** of the assignment: it adds validation, ownership, API auth, account management, optional persistence, and deployment.

| Area | Delivered |
|------|-----------|
| **Accounts** | Account view and update (Joi-validated); session (cookie) auth retained |
| **Placemark** | Full CRUD with description and lat/long; Joi validation on forms and API; **owner-only delete** (only the user who created a café can delete it; `userId` on each café, `canDelete` on list/detail) |
| **API** | REST API with list, get by id, create, update, delete, and **get by category**; JSON responses; optional **JWT** auth for API access |
| **Validation** | Joi schemas for users (sign-up, credentials, update) and cafes. used in controllers and API handlers |
| **Models** | Storage facade: in-memory and **JSON file** stores; `STORAGE` env var to switch; same interface for future MongoDB/Firebase |
| **Config** | Centralised env module (`core/config/env.ts`); required vars validated at startup; works without `.env` in production (e.g. Render) |
| **Deployment** | Deploy to **Render**; build outputs JS to `dist/`; env vars set in Render dashboard |
| **Testing** | Mocha/Chai; controller tests with `server.inject()` and fixtures; endpoint counter so new controller endpoints require new tests; API and server tests |

---

## Data


---

## Testing


### Actual Testing

Tests are run with **Mocha** (TDD style) and **Chai** (`assert`). The suite lives under `test/` and is executed with:

```bash
npm test
```

- **Controller tests** – One test per endpoint for accounts, cafe, dashboard, and about controllers using `server.inject()`. Fixtures live in `test/fixtures/` (e.g. `accounts.ts`, `cafes.ts`). Each controller suite includes a **counter test** that fails if the number of endpoint configs in the controller changes without updating `EXPECTED_ENDPOINT_COUNT` and the corresponding tests (see `test/helpers/controller-count.ts`).
- **Other tests** – Route registration, API routes, server config, public assets, db/store init (see `test/server.test.ts`, `test/app/routes/routes.test.ts`, `test/api/api-routes.test.ts`, `test/public/assets.test.ts`, `test/core/data/db.test.ts`).

Scripts: `npm test` (all), `npm run testapi` (API tests only).


---

## Bugs

### Bug Details

1. **Backend and frontend working together**  
   The server and frontend weren’t cooperating correctly. The cause was in `server.ts`: some server registrations were called twice between start and setup. Once the duplicates were removed, the backend and frontend worked together as expected.

2. **Routing to JSON instead of views/redirects**  
   While following the playlist tutorial, the project had been taken too far into API-style implementation. Requests were returning raw JSON instead of rendering views or redirecting. The fix was to step back and use the controllers properly instead of relying on the API for those flows. That restored the correct redirects and HTML responses.

3. **Test setup and failing tests**  
   `server.ts` was correct, but the test suite kept failing. The tests were written in a linear way and were calling server-related code (e.g. `initStores`, server start, or route handlers) multiple times in the same run. That led to duplicate registration, shared state, or ordering issues and broke the tests. Fixing the test setup so that server code is only initialised once per suite (e.g. in a `before` hook) and tests don’t re-invoke it unnecessarily resolved the failures.

---

## Releases

### Overview

The project is delivered in staged **releases** that map to the assignment levels. Each release adds a defined set of features (accounts, CRUD, validation, API, ownership, tests, deployment) so the app grows incrementally without mixing API and controller responsibilities or breaking redirects and session behaviour. Release 1 established the core structure and basic flows; Release 2 added Level 2 features (validation, owner-only delete, JWT API, account management, JSON store, Render deployment, and expanded tests). Later releases (e.g. Release 3–4) can introduce further levels (e.g. database, categories, or UI polish) as per the timeline and branching strategy below.

### Git Workflow


Typical commands for managing branches:

```bash
git checkout -b branch_name
git push --set-upstream origin branch_name
git checkout main
git pull origin branch_name
git push origin main
```

### Development Strategy

The assignment is delivered in multiple iterations:

- **Release 1**
- **Release 2** → **Release 4**
- **Release 5** and beyond (if time permits)


#### Timeline


| Milestone                 | Date                 |
| ------------------------- | -------------------- |
| Project Start             | February 23rd, 2026  |
| Expected Final Submission | March 15th, 2026     |
| Approximate Duration      | 3 weeks              |



#### Git Scope & Branching


### Release Results

#### Release 1

Release 1 established the core structure of the application. It delivered sign-up and log-in, basic café CRUD (name, category) with listing and detail views, and a simple REST API. Data lived in an in-memory store behind a facade, and the app ran on localhost. The codebase was organised with controllers for web flows (views, redirects), routes, and a clear separation from API handlers. This provided the foundation for validation, ownership, and deployment in Release 2.

#### Release 2

Release 2 implemented the Level 2 feature set. 

**Validation:** Joi schemas were added for user sign-up, credentials, and profile updates, and for café create/update (including description and latitude/longitude); validation is applied in both controller and API paths. 

**Ownership:** Each café stores a `userId`; the UI shows a delete option only when the current user is the owner, and the server rejects delete requests from non-owners. **API:** The REST API was extended with get-by-category and optional JWT auth; Swagger was integrated for API documentation. 

**Accounts:** Account view and update (with Joi) were added alongside existing session auth. 

**Storage:** A JSON file store was implemented behind the same store interface, selectable via the `STORAGE` env var. 

**Config and deployment:** A centralised env module validates required variables at startup and supports production hosts (e.g. Render) that inject env without a `.env` file; the app builds to JavaScript in `dist/` and deploys to Render. 

**Testing:** The test suite was expanded with controller tests using `server.inject()` and fixtures, an endpoint counter to keep tests in sync with controller endpoints, and API and server tests. Release 2 leaves the codebase ready for further levels (e.g. database, extra API or UI features) in later releases.

---

## Development &amp; Deployment

### Version Control

I used [Visual Studio Code](https://code.visualstudio.com/) as a local repository and IDE & [GitHub](https://github.com/) as a remote repository.

1. Firstly, I needed to create a new repository on Github [node-full-stack-1](https://github.com/KristianColville1/node-full-stack-1).
2. I opened that repository on my local machine by copying the URL from that repository and cloning it from my IDE for use.
3. Visual Studio Code opened a new workspace for me.
4. I created files and folders to use.
5. To push my newly created files to GitHub I used the terminal by pressing Ctrl + shift + `.
6. A new terminal opened and then I used the below steps.

   - `git add (name of the file)` *This selects the file for the commit*
   - `git commit -m "Commit message: (i.e. Initial commit)"` *Allows the developer to assign a specific concise statement to the commit*
   - `git push` *The final command sends the code to GitHub*

### Cloning the Repository

If you would like to clone this repository please follow the bellow steps.

Instructions:

1. Log into GitHub.
2. Go to the repository you wish to clone.
3. Click the green "Code" button.
4. Copy the URL provided under the HTTPS option.
5. Open your preferred IDE with Git installed.
6. Open a new terminal window in your IDE.
7. Enter the following command exactly: `git clone the-URL-you-copied-from-GitHub`.
8. Press Enter.

### Render

I used [Render](https://render.com/) for deploying my project.

1. First, I created an account on [Render](https://render.com/).
2. I connected my GitHub repository to Render by clicking the "New Web Service" button on the Render dashboard.
3. I selected "Web Service" and authorized Render to access my GitHub account.
4. I chose the repository I wanted to deploy from the list of available options.
5. I specified the start command (e.g. `node app.js` or your main server file).
6. I set the appropriate environment variables if required (such as `PORT`).
7. After confirming the settings, I clicked "Create Web Service."
8. Render then started building and deploying the project, and once finished, it provided a URL for accessing the live site.

Render also automatically sets up continuous deployment. Any new changes pushed to the main repository will trigger a new deployment on Render.

### Usage

```bash
npm install
npm run dev
```

Open http://localhost:3000 (or the port shown). Sign up or log in, then use the dashboard to add and manage cafés.


---

## Credits

- [Hamburgers](https://jonsuh.com/hamburgers/) — CSS hamburger menu animation used in the navbar ([GitHub](https://github.com/jonsuh/hamburgers)).
- [SETU](https://www.setu.ie/) - Course access, material, setting up hapi and basic structure.
