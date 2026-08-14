<img width="1835" height="924" alt="Screenshot 2026-08-15 011016" src="https://github.com/user-attachments/assets/4d29026f-6e3f-44b8-8c17-6c194d52cb1d" />

<img width="1838" height="918" alt="Screenshot 2026-08-15 011105" src="https://github.com/user-attachments/assets/2ebfa7c4-4644-4007-b816-5a3d46caeec7" />

<img width="1841" height="923" alt="Screenshot 2026-08-15 011158" src="https://github.com/user-attachments/assets/ade28af6-6c57-4793-9fec-b627ded0c108" />

<img width="1840" height="918" alt="Screenshot 2026-08-15 011226" src="https://github.com/user-attachments/assets/20ff029c-53a3-47fd-9a42-35eebe0d6b19" />

<img width="1836" height="920" alt="Screenshot 2026-08-15 011312" src="https://github.com/user-attachments/assets/1ad97b93-6cdd-4d09-9a2e-181959699bf9" />

<img width="1834" height="923" alt="Screenshot 2026-08-15 011410" src="https://github.com/user-attachments/assets/7bc8b340-230a-43f8-9439-df01d3b3ed49" />

# Shipment Tracking & Delivery Visibility Platform

A full-stack shipment tracking platform that provides real-time delivery visibility for customers, drivers, operators, and support teams. The system manages shipments end-to-end — from order creation and route tracking to proof of delivery — with role-based dashboards and secure authentication.

## Features

- **Role-based access** — dedicated dashboards for Admin, Customer, Driver, Operator, and Support roles.
- **Secure authentication** — JWT-based login with email/password and Google OAuth 2.0 sign-in.
- **Live shipment tracking** — real-time location updates and route history on an interactive map (Leaflet / OpenStreetMap).
- **Shipment lifecycle management** — create, assign, and update shipments across statuses.
- **Proof of delivery (POD)** — capture delivery confirmation with signatures and upload POD documents (PDF).
- **Notifications** — in-app notifications for shipment and support events.
- **Driver management** — admin tools to onboard, assign, and monitor drivers and their performance.
- **Support & escalation** — ticket-based support system with priority, categorization, and escalation workflows.
- **Reporting & analytics** — dashboards with shipment trends, key metrics, and exportable reports (PDF/CSV).
- **Live delivery monitoring** — monitor active deliveries and driver locations in near real time.

## Tech Stack

### Backend
| Layer | Technology |
| --- | --- |
| Language | Java 17 |
| Framework | Spring Boot 3.5 |
| Security | Spring Security, OAuth2 Resource Server, JJWT |
| Persistence | Spring Data JPA (Hibernate) |
| Database | PostgreSQL |
| Reporting | OpenPDF |
| Build | Maven |

### Frontend
| Layer | Technology |
| --- | --- |
| Framework | React 19 + Vite |
| Routing | React Router |
| HTTP Client | Axios |
| UI | Bootstrap 5, Bootstrap Icons, React-Toastify, AOS |
| Charts | Chart.js, Recharts, React-ChartJS-2 |
| Maps | Leaflet (OpenStreetMap / Nominatim) |
| Reports | jsPDF, jsPDF-AutoTable |

## Architecture

```
shipment-tracking-platform/
├── SHIPTRACK_JAVA/
│   ├── shiptrack-backend/          # Spring Boot REST API (port 8081)
│   │   └── shiptrack-backend/
│   │       ├── src/main/java/com/shiptrack/
│   │       │   ├── config/         # Security & data initializers
│   │       │   ├── controller/     # REST controllers
│   │       │   ├── service/        # Business logic
│   │       │   ├── repository/     # JPA repositories
│   │       │   ├── entity/         # JPA entities
│   │       │   ├── dto/            # Request/response objects
│   │       │   ├── security/       # JWT filter
│   │       │   └── util/           # Helpers (e.g., map utilities)
│   │       └── src/main/resources/
│   │           └── application.properties
│   └── shiptrack-frontend/         # React SPA (Vite dev server, port 5173)
│       └── src/
│           ├── api/                # Axios API clients
│           ├── auth/               # OAuth helpers
│           ├── components/         # Reusable UI components
│           ├── pages/              # Route/page components
│           └── styles/             # CSS modules
└── README.md
```

The frontend communicates with the backend through a REST API at `http://localhost:8081/api`.

## Prerequisites

- **Java 17+**
- **Maven 3.8+**
- **Node.js 18+** and **npm**
- **PostgreSQL** (running locally)
- A **Google OAuth 2.0 Client ID** (optional, for Google sign-in)

## Getting Started

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE shiptrack;
```

### 2. Backend Setup

```bash
cd SHIPTRACK_JAVA/shiptrack-backend/shiptrack-backend
```

The backend defaults to the `local` profile (see [Environment Variables](#environment-variables)). Run:

```bash
mvn spring-boot:run
```

The API server starts at `http://localhost:8081`.

### 3. Frontend Setup

```bash
cd SHIPTRACK_JAVA/shiptrack-frontend
npm install
```

Create a `.env` file in the frontend directory with your Google Client ID (see below), then start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Environment Variables

Credentials are never committed to the repository. Configure them via environment variables / local config files.

### Backend — `application.properties`

| Variable | Description |
| --- | --- |
| `DB_PASSWORD` | PostgreSQL password for the `shiptrack` database |
| `JWT_SECRET` | Secret key used to sign JWT tokens (use a long, random string) |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID (for Google sign-in) |

For local development the backend defaults to the `local` profile, which loads
values from `src/main/resources/application-local.properties`. Create this file
(the repo's `.gitignore` keeps it out of version control) and add your real values:

```properties
spring.datasource.password=your-db-password
jwt.secret=your-long-random-jwt-secret
google.client-id=your-client-id.apps.googleusercontent.com
```

Alternatively, set the variables above as environment variables and leave the
`${...}` placeholders to resolve them.

### Frontend — `.env`

| Variable | Description |
| --- | --- |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID (used by the Google sign-in flow) |

Example frontend `.env`:

```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## Available Scripts

### Backend

```bash
mvn spring-boot:run      # Start the API server
mvn test                 # Run backend tests
mvn package              # Build the application JAR
```

### Frontend

```bash
npm run dev              # Start the Vite dev server
npm run build            # Build for production
npm run preview          # Preview the production build
npm run lint             # Run ESLint
```
