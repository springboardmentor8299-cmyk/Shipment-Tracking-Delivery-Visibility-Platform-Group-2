# ShipTrack Pro

A full-stack **Shipment Tracking & Delivery Visibility Platform** for managing shipments, real-time tracking, delivery operations, proof of delivery, authentication, and logistics analytics.

Built with **React 19, Spring Boot 3.5.3, Java 21, PostgreSQL, JWT, and Bootstrap 5**.

---

## Overview

ShipTrack Pro is a role-based shipment management platform designed to provide end-to-end visibility throughout the delivery lifecycle.

The system supports:

- User registration and authentication
- JWT-based authorization
- Role-based access control
- Shipment creation and management
- Shipment tracking using tracking numbers
- Shipment status updates
- Tracking event history
- Delivery operator management
- Proof of Delivery (POD)
- Recipient signature capture
- Delivered-item photo capture
- POD verification workflow
- Administrative analytics
- Customer shipment dashboards
- Support operations

### Shipment Lifecycle

```text
CREATED
   ↓
IN_TRANSIT
   ↓
OUT_FOR_DELIVERY
   ↓
DELIVERED
```

A shipment can also be:

```text
CANCELLED
```

`CANCELLED` can be reached from any shipment status according to the application's business rules.

---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 |
| Build Tool | Vite 8 |
| UI Framework | Bootstrap 5 |
| Data Visualization | Chart.js |
| HTTP Client | Axios |
| Backend | Spring Boot 3.5.3 |
| Language | Java 21 |
| Build Tool | Maven |
| Database | PostgreSQL |
| Authentication | JWT |
| JWT Library | JJWT 0.12.7 |
| API Style | REST |
| ORM | Spring Data JPA / Hibernate |

---

# Key Features

## Authentication & Authorization

- User registration
- User login
- JWT-based authentication
- Protected REST APIs
- Role-based authorization
- Secure password storage using password hashing
- Separate permissions for customers, administrators, support assistants, and delivery operators

### Supported Roles

| Role | Responsibilities |
|---|---|
| `USER` | Create shipments, view own shipments, track shipments |
| `ADMIN` | Full system administration, shipment management, analytics, POD verification, delivery operator management |
| `SUPPORT_ASSISTANT` | View shipments, assist with support operations, view proof of delivery |
| `DELIVERY_OPERATOR` | Manage delivery stages and capture proof of delivery |

---

# Shipment Management

ShipTrack Pro provides complete shipment lifecycle management.

### Core Shipment Operations

- Create shipments
- View shipment details
- View customer shipments
- Track shipments using tracking numbers
- Update shipment status
- Add tracking events
- View shipment history
- Delete shipments where authorized

### Shipment Progress

| Status | Progress |
|---|---:|
| `CREATED` | 10% |
| `IN_TRANSIT` | 55% |
| `OUT_FOR_DELIVERY` | 80% |
| `DELIVERED` | 100% |
| `CANCELLED` | 0% |

---

# Proof of Delivery

The platform includes a digital **Proof of Delivery (POD)** workflow.

The delivery process is:

```text
Shipment
   ↓
OUT_FOR_DELIVERY
   ↓
Delivery completed
   ↓
Recipient signature captured
   ↓
Delivered-item image captured
   ↓
Proof of Delivery submitted
   ↓
Shipment marked DELIVERED
   ↓
Admin reviews POD
   ↓
VERIFIED / REJECTED
```

### POD Capabilities

- Recipient signature capture
- Delivered-item photo capture
- Proof of delivery submission
- POD status management
- Admin verification
- POD rejection
- POD viewing for authorized users

### POD Status

```text
PENDING
   ↓
VERIFIED
```

or

```text
PENDING
   ↓
REJECTED
```

---

# Delivery Operations

Delivery operators are responsible for the final delivery stage.

They can:

- View shipments according to application permissions
- Mark shipments as `OUT_FOR_DELIVERY`
- Complete delivery
- Capture recipient signature
- Capture delivered-item photograph
- Submit proof of delivery

Administrators can create and manage delivery operator accounts.

---

# Analytics & Dashboard

The administration dashboard provides operational visibility into shipment performance.

Dashboard capabilities include:

- Shipment statistics
- Shipment status distribution
- Delivery performance information
- Operational summaries
- Shipment analytics
- Visual charts and KPIs

The frontend uses **Chart.js** for data visualization.

---

# API Overview

## Authentication API

Base path:

```text
/api/auth
```

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | Authenticate a user and return JWT |

---

## Shipment API

Base path:

```text
/api/shipments
```

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/` | Authenticated users | Create a shipment |
| `GET` | `/my` | `USER` | Get user's shipments |
| `GET` | `/` | `ADMIN` | Get all shipments |
| `GET` | `/stats` | `ADMIN` | Get dashboard statistics |
| `GET` | `/track/{trackingNumber}` | Authenticated users | Track a shipment |
| `GET` | `/{id}` | Owner / `ADMIN` | Get shipment details |
| `PATCH` | `/{id}/status` | `ADMIN` | Update shipment status |
| `DELETE` | `/{id}` | `ADMIN` | Delete shipment |
| `POST` | `/{id}/events` | `ADMIN` | Add tracking event |
| `GET` | `/{id}/events` | Authenticated users | Get tracking events |

---

## Delivery Operator API

Base path:

```text
/api/users
```

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/operators` | `ADMIN` | List delivery operators |
| `POST` | `/operators` | `ADMIN` | Create delivery operator |
| `DELETE` | `/operators/{id}` | `ADMIN` | Delete delivery operator |

---

## Proof of Delivery API

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/shipments/{id}/proof-of-delivery` | `DELIVERY_OPERATOR` | Submit signature, image and POD |
| `GET` | `/shipments/{id}/proof-of-delivery` | Staff / Owner | View shipment POD |
| `GET` | `/proof-of-delivery` | `ADMIN` / `SUPPORT_ASSISTANT` | List POD records |
| `PATCH` | `/proof-of-delivery/{id}/verify` | `ADMIN` | Verify or reject POD |

---

# Project Architecture

ShipTrack Pro follows a layered full-stack architecture.

```text
┌──────────────────────────────┐
│        React Frontend        │
│        React + Vite          │
└──────────────┬───────────────┘
               │
               │ REST API / JWT
               ▼
┌──────────────────────────────┐
│       Spring Boot API        │
│ Controllers / Services / DTOs│
└──────────────┬───────────────┘
               │
               │ JPA / Hibernate
               ▼
┌──────────────────────────────┐
│          PostgreSQL          │
│       Persistent Data        │
└──────────────────────────────┘
```

### Backend Layers

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL
```

Security is handled through:

```text
JWT Authentication
        ↓
JWT Filter
        ↓
Spring Security
        ↓
Role-Based Authorization
```

---

# Project Structure

```text
ShipTrack-Pro/
│
├── backend/
│   └── src/main/java/com/shiptrack/
│       ├── config/
│       │   └── Security, CORS, initialization
│       ├── controller/
│       │   └── REST API controllers
│       ├── dto/
│       │   └── Request / Response DTOs
│       ├── entity/
│       │   └── JPA entities
│       ├── exception/
│       │   └── Custom exceptions
│       ├── repository/
│       │   └── Spring Data repositories
│       ├── security/
│       │   └── JWT filter and user authentication
│       └── service/
│           └── Business logic
│
├── frontend/
│   └── src/
│       ├── api/
│       │   └── Axios client and API functions
│       ├── components/
│       │   ├── customer/
│       │   ├── dashboard/
│       │   └── shared/
│       ├── context/
│       │   └── Authentication context
│       ├── pages/
│       │   ├── admin/
│       │   ├── auth/
│       │   ├── customer/
│       │   └── home/
│       ├── services/
│       │   └── Service-layer wrappers
│       └── utils/
│           └── Status labels and UI utilities
│
└── docs/
    └── Architecture and workflow documentation
```

---

# Database

ShipTrack Pro uses **PostgreSQL** as its persistent database.

Create the database before starting the backend:

```sql
CREATE DATABASE shiptrack_db;
```

Configure the database connection through environment-specific application configuration.

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/shiptrack_db
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

> **Never commit database passwords, JWT secrets, API keys, or production credentials to the repository.**

For local development, Hibernate can automatically update the schema:

```properties
spring.jpa.hibernate.ddl-auto=update
```

For production, a migration-based approach such as **Flyway** or **Liquibase** is recommended.

---

# Environment Configuration

Sensitive configuration should be provided through environment variables or an external configuration mechanism.

Example variables:

```text
DB_USERNAME
DB_PASSWORD
JWT_SECRET
```

Do not store real values directly in `README.md`, source code, or committed configuration files.

A local `.env` or environment-specific configuration file should be excluded from Git using `.gitignore`.

---

# Prerequisites

Install the following before running the project:

- Java 21+
- Node.js 18+
- PostgreSQL
- Maven 3.9+
- Git

The backend also includes the Maven Wrapper, so Maven can be run through the project wrapper.

---

# Running the Backend

Navigate to the backend directory:

```bash
cd backend
```

### Windows

```bash
mvnw.cmd spring-boot:run
```

### Linux / macOS

```bash
./mvnw spring-boot:run
```

The backend starts on:

```text
http://localhost:8080
```

---

# Running the Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

API requests to `/api/*` are proxied to the Spring Boot backend.

---

# Authentication Flow

The authentication architecture follows a JWT-based stateless model.

```text
User
 ↓
Login
 ↓
Spring Boot Authentication
 ↓
JWT Token Generated
 ↓
Frontend Stores Authentication State
 ↓
JWT Included in API Requests
 ↓
JWT Filter Validates Token
 ↓
Spring Security Authorizes Request
 ↓
Protected Resource
```

---

# Role-Based Access Control

### USER

- Register and log in
- Create shipments
- View own shipments
- Track shipments
- View shipment information available to the owner

### ADMIN

- View all shipments
- Update shipment statuses
- Add tracking events
- Delete shipments
- View analytics
- Manage delivery operators
- View all POD records
- Verify or reject POD submissions

### SUPPORT_ASSISTANT

- View shipment information
- Assist with customer support
- View proof of delivery
- Access operational information permitted by the application

### DELIVERY_OPERATOR

- Manage delivery-stage operations
- Mark shipments `OUT_FOR_DELIVERY`
- Capture recipient signatures
- Capture delivered-item photographs
- Submit proof of delivery
- Complete delivery workflow

---

# Security

The application uses several security mechanisms:

- JWT authentication
- Password hashing
- Spring Security
- Role-based authorization
- Protected REST endpoints
- CORS configuration
- Environment-based secret management

### Security Best Practices

Do **not** commit:

```text
Passwords
JWT secrets
Database credentials
API keys
Private keys
Production configuration
```

Use the following for sensitive production values:

```text
Environment Variables
Secret Managers
Externalized Configuration
```

---

# Frontend Features

The React frontend is organized into reusable components and role-specific pages.

### Customer Interface

- Registration
- Login
- Shipment creation
- Shipment listing
- Shipment tracking
- Shipment details

### Admin Interface

- Shipment management
- Analytics dashboard
- Shipment status management
- Tracking event management
- POD verification
- Delivery operator management

### Support Interface

- Shipment visibility
- Customer support operations
- POD viewing

### Delivery Operator Interface

- Delivery workflow
- Status updates
- Signature capture
- Item image capture
- POD submission

---

# API Authentication

For protected endpoints, the frontend sends the JWT in the request header:

```http
Authorization: Bearer <JWT_TOKEN>
```

The backend validates the token before allowing access to protected resources.

---

# Development Notes

For local development:

```text
Frontend → http://localhost:5173
Backend  → http://localhost:8080
Database → PostgreSQL / shiptrack_db
```

Make sure PostgreSQL is running before starting the backend.

---

# Production Considerations

Before deploying ShipTrack Pro to production, consider:

- Use `ddl-auto=validate`
- Introduce Flyway or Liquibase migrations
- Store secrets in a secret manager
- Use HTTPS
- Configure production CORS
- Configure secure JWT expiration and rotation strategy
- Add refresh-token support where appropriate
- Enable structured application logging
- Add centralized error handling
- Add API rate limiting
- Add database backups
- Add monitoring and health checks
- Configure production environment variables
- Use secure object storage for POD images and signatures
- Implement audit logging for sensitive administrative actions

---

# Project Goals

ShipTrack Pro is designed to demonstrate practical implementation of:

- Full-stack web development
- REST API architecture
- Spring Boot backend development
- React frontend development
- PostgreSQL database integration
- JWT authentication
- Role-based access control
- Shipment lifecycle management
- Delivery workflow automation
- Proof of Delivery systems
- Analytics dashboards
- Secure API design

---

# Future Enhancements

Potential future improvements include:

- Real-time shipment location tracking
- GPS integration
- ETA prediction
- Route optimization
- Email/SMS/push notifications
- Advanced logistics analytics
- Shipment search and filtering
- Delivery operator assignment
- Map-based tracking
- Cloud deployment
- Object storage integration for POD files
- Automated delivery notifications
- Audit logs
- Refresh-token authentication
- Microservices-based architecture for large-scale deployment

---

# Purpose

This project is created by me (Raju Shaw) for Infosys Springboard Virtual Internship 7.0
