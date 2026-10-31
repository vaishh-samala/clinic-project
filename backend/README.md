# Clinic AI Agent System - Backend

A secure, high-performance, modular backend architecture for a modern clinic and healthcare practice. Built with **Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT Authentication, Zod, and Swagger/OpenAPI**.

---

## 1. Project Overview

The Clinic AI Agent System backend provides a robust clinical foundation that connects patients, healthcare staff, and an AI conversational agent.

### Key Capabilities:
- **Authentication & RBAC**: Patient registration, email/password login, bcrypt password hashing, and role-based permissions (`PATIENT`, `DOCTOR`, `ADMIN`).
- **Doctor Directory & Schedules**: Dynamic working hours, lunch breaks, and real-time slot generation.
- **Smart Appointment Scheduling**:
  - Validates requested time slots against doctor schedules and operating hours.
  - **Strict Double-Booking Prevention**: Prohibits overlapping bookings for the same doctor or patient.
  - Multi-role listing and cancellation with automatic calendar slot liberation.
- **AI Agent Engine & Guardrails**:
  - Multi-turn conversation sessions persisted in the database.
  - Safe backend tools (`findDoctors`, `checkAvailability`, `bookAppointmentSafe`, `getClinicInfo`).
  - **Clinical Safety Guardrails**: Detects acute red-flag symptoms (chest pain, stroke signs, respiratory distress) and triggers emergency protocols (911 / Emergency Room) with clear non-diagnostic disclaimers.
- **Interactive Documentation**: Swagger / OpenAPI 3.0 UI available at `/api/docs`.
- **Pre-configured Postman Collection**: Ready-to-import `postman_collection.json`.

---

## 2. Architecture & Directory Structure

```text
backend/
├── src/
│   ├── config/             # Environment validation (Zod) & OpenAPI 3.0 specification
│   ├── controllers/        # Request handlers (Auth, Doctors, Appointments, Agent)
│   ├── services/           # Core business logic & database operations
│   ├── routes/             # REST API route definitions
│   ├── middleware/         # JWT auth, role guard, Zod request validator, error handling
│   ├── validators/         # Zod schemas for input validation
│   ├── utils/              # JWT utilities, bcrypt helpers, custom AppError classes
│   ├── agent/              # AI Agent engine, safe backend tools, and triage logic
│   ├── app.ts              # Express application configuration
│   └── server.ts           # Server bootstrap and graceful shutdown
├── prisma/
│   ├── schema.prisma       # Prisma ORM PostgreSQL schema
│   └── seed.ts             # Database seeding script
├── tests/
│   └── runTests.ts         # Automated unit & integration test runner
├── .env.example            # Environment variables template
├── package.json            # Dependencies and npm scripts
├── postman_collection.json # Exported Postman collection
└── README.md               # Documentation
```

---

## 3. Database Schema & Models

The system is modeled in `prisma/schema.prisma` with PostgreSQL:

### `User`
- `id` (UUID, Primary Key)
- `name` (String)
- `email` (String, Unique Index)
- `passwordHash` (String, bcrypt)
- `role` (Enum: `PATIENT`, `DOCTOR`, `ADMIN`)
- `createdAt`, `updatedAt` (DateTime)

### `Patient`
- `id` (UUID, Primary Key)
- `userId` (Foreign Key -> User, Unique)
- `dateOfBirth` (DateTime)
- `phoneNumber` (String)
- `emergencyContact`, `medicalHistory`, `allergies`, `currentMedications` (Optional)

### `Doctor`
- `id` (UUID, Primary Key)
- `userId` (Foreign Key -> User, Optional)
- `name`, `email` (String, Unique)
- `specialization`, `qualifications`, `roomNumber` (String)
- `availability` (JSON: working days, start/end hours, slot duration, lunch breaks)
- `isActive` (Boolean)

### `Appointment`
- `id` (UUID, Primary Key)
- `patientId` (Foreign Key -> Patient)
- `doctorId` (Foreign Key -> Doctor)
- `date` (Date, YYYY-MM-DD)
- `timeSlot` (String, HH:mm format)
- `status` (Enum: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`)
- `reason`, `notes` (String)
- **Compound Index**: `[doctorId, date, timeSlot]` for rapid collision detection.

### `Conversation` & `Message`
- `Conversation`: `id`, `sessionId` (Unique), `patientId`, timestamps.
- `Message`: `id`, `conversationId`, `role` (`USER`, `ASSISTANT`, `SYSTEM`), `content`, `metadata` (JSON), timestamp.

---

## 4. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP server port | `5000` |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Secret key for signing access tokens | `clinic-agent-...` |
| `JWT_EXPIRES_IN` | Token duration | `7d` |
| `CORS_ORIGIN` | Allowed client origins (comma-separated) | `http://localhost:3000,http://localhost:5173` |

---

## 5. Setup & Running the Backend

### Installation
```bash
cd backend
npm install
```

### Database Migration & Seeding (PostgreSQL)
When connected to a PostgreSQL database instance:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run schema migrations
npm run prisma:migrate

# Seed database with sample doctors, admin, and patient
npm run seed
```

### Start Development Server
```bash
npm run dev
```
The server will start on port `5000`.

### Pre-Seeded Test Credentials
- **Admin**: `admin@clinicagent.com` / `AdminPass123!`
- **Cardiologist**: `sarah.jenkins@clinicagent.com` / `DoctorPass123!`
- **Patient**: `patient@clinicagent.com` / `PatientPass123!`

---

## 6. API Documentation & Interactive Testing

Open the interactive **Swagger / OpenAPI 3.0** documentation in your browser:
```text
http://localhost:5000/api/docs
```
OpenAPI JSON specification is also available at:
```text
http://localhost:5000/api/docs.json
```

### Postman
Import `backend/postman_collection.json` into Postman. The collection has pre-configured environment variables (`{{baseUrl}}`, `{{authToken}}`) and test scripts that automatically capture JWT tokens on login.

---

## 7. Running Automated Tests

Run the full automated test suite:
```bash
npm test
```
Or directly with tsx:
```bash
npx tsx backend/tests/runTests.ts
```

### Tests Covered:
1. Patient registration and password hashing
2. Duplicate email rejection (409 Conflict)
3. Login credential verification and JWT signing
4. Doctor listing and real-time availability slot calculations
5. Appointment booking and **double-booking prevention**
6. Cross-patient authorization isolation (403 Forbidden)
7. Appointment rescheduling and cancellation (slot liberation)
8. AI Agent conversational chat, emergency red-flag escalation, tool calling, and persistence
9. Zod input validation schemas

---

## 8. Connecting Frontend to the Backend

In your React frontend application:

1. Configure the API base URL in your frontend `.env`:
   ```bash
   VITE_API_BASE_URL="http://localhost:5000/api"
   ```

2. Store the JWT token returned by `POST /api/auth/login` or `POST /api/auth/register` in `localStorage` or React Context.

3. Include the Authorization header in all authenticated requests:
   ```ts
   const headers = {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`
   };
   ```

---

## 9. Connecting a Real LLM (e.g. Gemini 2.5 Flash)

The AI Agent Engine is located in `backend/src/agent/agentService.ts` and implements the `AgentEngine` interface. To connect a live LLM model:

1. Set your Gemini API key in `backend/.env`:
   ```bash
   GEMINI_API_KEY="your-api-key-here"
   ```

2. In `backend/src/agent/agentService.ts`, pass `clinicTools` as function declarations to the Google Gen AI SDK (`@google/genai`):

```ts
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI();

// In agentService.ts:
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: [
    { role: 'system', text: 'You are a Clinic AI Agent. Adhere to clinical safety guardrails...' },
    ...historyMessages,
    { role: 'user', text: userMessage }
  ],
  config: {
    tools: [{ functionDeclarations: Object.values(clinicTools) }]
  }
});
```

Because all business operations are handled through typed services (`appointmentService`, `doctorService`), the LLM can safely execute tools via function calls without direct SQL access or data corruption risks.
