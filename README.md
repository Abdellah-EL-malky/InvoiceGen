# 🧾 InvoiceGen — Full-Stack Invoice Management App

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)
![Deployed](https://img.shields.io/badge/Deployed-Render%20%2B%20Vercel-00C7B7)

A clean, production-ready invoice management system built with **Spring Boot 3** and **React 18**. Create clients, generate invoices, track payment status, and export professional PDFs — all in a dark minimal UI.


---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register/login flow
- 👥 **Client Management** — Full CRUD with company info
- 🧾 **Invoice Generator** — Line items, tax, auto-numbering
- 📄 **PDF Export** — Professional styled PDF using OpenPDF
- 📊 **Dashboard** — Stats: total, paid, pending, revenue
- 🔄 **Status Tracking** — DRAFT → SENT → PAID workflow
- 🏢 **Business Profile** — Your info printed on every invoice

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Spring Boot 3.2, Spring Security, JPA/Hibernate |
| Auth | JWT (jjwt 0.11.5) |
| PDF | OpenPDF (LibrePDF) |
| Frontend | React 18, Vite, Tailwind CSS |
| Database | PostgreSQL (Supabase in prod, H2 in dev) |
| Deployment | Render (backend) + Vercel (frontend) |

---

## 🚀 Getting Started

### Backend

```bash
cd backend
# Local dev uses H2 in-memory DB automatically
./mvnw spring-boot:run
```

API runs on `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8080
npm run dev
```

App runs on `http://localhost:5173`

---

## 📡 API Endpoints

```
POST /api/auth/register
POST /api/auth/login

GET  /api/clients
POST /api/clients
PUT  /api/clients/{id}
DELETE /api/clients/{id}

GET  /api/invoices
GET  /api/invoices/stats
POST /api/invoices
PUT  /api/invoices/{id}
PATCH /api/invoices/{id}/status
DELETE /api/invoices/{id}
GET  /api/invoices/{id}/pdf

GET  /api/profile
PUT  /api/profile
```

---

## 🌐 Deployment

### Backend (Render)

Environment variables needed:
```
DATABASE_URL=jdbc:postgresql://your-supabase-url/postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
DATABASE_DRIVER=org.postgresql.Driver
HIBERNATE_DIALECT=org.hibernate.dialect.PostgreSQLDialect
JWT_SECRET=your-super-secret-key
```

### Frontend (Vercel)

```
VITE_API_URL=https://your-backend.onrender.com
```

---

## 📁 Project Structure

```
invoicegen/
├── backend/
│   ├── src/main/java/com/abdellah/invoicegen/
│   │   ├── controller/     # REST controllers
│   │   ├── service/        # Business logic + PDF generation
│   │   ├── entity/         # JPA entities
│   │   ├── dto/            # Request/Response DTOs
│   │   ├── repository/     # Spring Data repositories
│   │   ├── security/       # JWT filter & util
│   │   └── config/         # Security & UserDetails config
│   └── Dockerfile
└── frontend/
    └── src/
        ├── pages/          # Route-level components
        ├── components/     # Shared components (Layout)
        ├── services/       # Axios API calls
        └── context/        # Auth context
```

---

## 👤 Author

**Abdellah El Malky** — Full-Stack Developer (Java/Spring Boot + React)  
📧 abdel.elmalky@gmail.com  
🐙 [github.com/Abdellah-EL-malky](https://github.com/Abdellah-EL-malky)
