# ShipTrack Pro - Enterprise Shipment & Logistics Management Platform

ShipTrack Pro is an enterprise-grade shipment tracking, live fleet monitoring, proof-of-delivery (POD), and logistics management system.

## 🛠️ Technology Stack & Architecture Specification

### 1. Programming Languages
- **Backend Core**: Java 17+
- **Frontend Core**: JavaScript (ES6+) / TypeScript

### 2. Backend Architecture & Frameworks
- **Framework**: Spring Boot 3.x
- **Security & Access Control**: Spring Security
- **Data Access & Persistence**: Spring Data JPA with Hibernate ORM
- **Build System**: Apache Maven
- **Real-Time Streaming**: Spring WebSocket (STOMP protocol)

### 3. Frontend Architecture & Libraries
- **Framework**: React.js 18+
- **Routing**: React Router
- **HTTP Client**: Axios
- **Styling & UI Engine**: Tailwind CSS
- **Data Visualization**: Chart.js & Recharts
- **State Management**: React Context API

### 4. Database & Caching Layer
- **Primary Database**: PostgreSQL (Relational ACID database)
- **In-Memory Caching**: Redis (High-speed session & location telemetry cache)

### 5. Authentication & Identity
- **Security**: Spring Security
- **Token Mechanism**: Stateless JWT Authentication
- **Federation**: OAuth2 Login (Google Identity)

### 6. Maps & Location Services
- **Primary Mapping SDK**: Official Google Maps API (JavaScript SDK)
- **Secondary Geocoding**: OpenStreetMap API (Fallback reverse geocoding)

### 7. Push Notifications
- **Messaging Service**: Firebase Cloud Messaging (FCM) for real-time driver & delay alerts

---

## 🚀 Key Features

1. **Live Shipment Tracking**: Track packages with real-time GPS coordinates, route polylines, and status step progressions.
2. **Global Fleet GPS Map**: Admin Control Tower displaying active fleet locations on Google Maps with interactive info windows and filterable markers.
3. **Driver Dispatch & Mobile Telemetry**: Dedicated Logistics Operator view with route stops, pickup/drop-off execution, and issue reporting.
4. **Digital Proof of Delivery (POD)**: Signature capture, doorstep photo uploads, and multi-format PDF generation.
5. **Executive Audit Center & Multi-Format Reports**: Export official operational logs to PDF, formatted Excel (`.xlsx`), and raw CSV logs.
6. **Support Console**: Direct agent ticket management, customer inquiry escalations, and automated AI assistance.
