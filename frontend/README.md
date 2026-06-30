# Frontend Structure

This document describes the folder organization of the frontend and the responsibility of each directory and file.

```text
frontend/
│
├── pages/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   └── profile.html
│
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── variables.css
│   │   ├── navbar.css
│   │   ├── forms.css
│   │   ├── dashboard.css
│   │   └── login.css
│   │
│   ├── js/
│   │   ├── main.js
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── validation.js
│   │   └── utils.js
│   │
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── components/
│   ├── navbar.html
│   ├── sidebar.html
│   ├── footer.html
│   └── modal.html
│
├── config/
│   └── config.js
│
└── README.md
```

---

# Folder Responsibilities

## `pages/`

Contains all HTML pages of the website.

Each file represents a complete page that can be accessed by the user.

### Files

| File | Responsibility |
|------|----------------|
| `index.html` | Landing or home page. |
| `login.html` | User authentication page. |
| `dashboard.html` | Main application dashboard after login. |
| `profile.html` | User profile page. |

---

## `assets/`

Contains all static resources used throughout the website.

---

### `assets/css/`

Contains all stylesheets.

| File | Responsibility |
|------|----------------|
| `main.css` | Global styles shared by every page. |
| `variables.css` | CSS variables such as colors, spacing, fonts, and theme values. |
| `navbar.css` | Styling for the navigation bar. |
| `forms.css` | Shared styling for forms, inputs, buttons, and validation messages. |
| `dashboard.css` | Styles specific to the dashboard page. |
| `login.css` | Styles specific to the login page. |

---

### `assets/js/`

Contains all JavaScript files.

Business logic should be separated by responsibility instead of placing everything inside one file.

| File | Responsibility |
|------|----------------|
| `main.js` | Initializes the application and contains common startup logic. |
| `api.js` | Handles all communication with the backend (Fetch API or AJAX requests). |
| `auth.js` | Login, logout, authentication, and session management. |
| `dashboard.js` | Dashboard-specific functionality. |
| `validation.js` | Form validation and input verification. |
| `utils.js` | Shared helper functions used across multiple pages. |

---

### `assets/images/`

Contains all images used by the website.

Examples:

- Logos
- Backgrounds
- Banners
- User placeholders

---

### `assets/icons/`

Contains SVGs, icon sets, and custom icons.

---

### `assets/fonts/`

Contains custom fonts used throughout the project.

---

# Components

```
components/
```

Contains reusable HTML components shared between multiple pages.

Examples:

- Navigation bar
- Sidebar
- Footer
- Modal dialogs

These components should be reused whenever possible instead of rewriting the same HTML.

| File | Responsibility |
|------|----------------|
| `navbar.html` | Top navigation bar. |
| `sidebar.html` | Left or right navigation menu. |
| `footer.html` | Common footer displayed across pages. |
| `modal.html` | Reusable popup dialogs. |

---

# Config

```
config/
```

Contains project configuration files.

### Files

| File | Responsibility |
|------|----------------|
| `config.js` | Stores application configuration such as API URL, environment settings, and application constants. |

Example:

```javascript
const CONFIG = {
    API_URL: "http://localhost:8000/api"
};
```

---

# README.md

Contains documentation for the frontend project, including:

- Project overview
- Installation instructions
- Folder structure
- Development guidelines
- Coding standards

---

# Development Guidelines

## HTML

- Keep HTML semantic.
- Use meaningful IDs and class names.
- Avoid inline styles.
- Avoid inline JavaScript.

---

## CSS

- Reuse existing classes whenever possible.
- Keep styles modular.
- Store colors and spacing inside `variables.css`.
- Avoid duplicated styles.

---

## JavaScript

- One responsibility per file.
- Keep functions small and reusable.
- Do not place API requests directly inside HTML pages.
- Use `api.js` for all backend communication.
- Use `utils.js` for shared helper functions.

---

# Naming Convention

## Files

Use lowercase with hyphens.

Examples

```
login.html
dashboard.css
user-profile.js
```

---

## CSS Classes

Use kebab-case.

Example

```css
.user-card
.login-form
.dashboard-container
```

---

## JavaScript

Use camelCase for variables and functions.

Example

```javascript
loadDashboard();

getUserData();

submitLogin();
```

---

# General Principles

- Keep files focused on a single responsibility.
- Avoid duplicating code.
- Reuse components whenever possible.
- Separate presentation (HTML/CSS) from behavior (JavaScript).
- Keep backend communication isolated in `api.js`.
- Write readable, maintainable, and modular code.
- Document major changes when adding new pages or modules.