# Medical Clinic Management Frontend

A React and Vite frontend for managing clinic operations, including patient records, medical histories, prescriptions, medicines, and administrative users.

## Features

- Role-based login for doctors and administrators
- Patient search, registration, and deletion
- Medical record and prescription management
- Medicine search and administration
- Administrative user management
- Basic Authentication support for protected backend APIs

## Prerequisites

- Node.js 18 or later
- A running clinic management backend at `http://localhost:8088/api`

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run the linter:

```bash
npm run lint
```

## Project Structure

```text
src/
├── components/   Reusable doctor and clinic UI components
├── pages/        Login and dashboard screens
├── services/     Backend API client and authentication helpers
└── styles/       Feature-specific stylesheets
```

## Backend Integration

The API client is configured in [`src/services/api.js`](src/services/api.js). The frontend expects the backend to expose the clinic management endpoints under `/api` and uses session storage for the current Basic Authentication credentials and user session.
