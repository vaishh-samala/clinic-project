export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Clinic AI Agent System API',
    version: '1.0.0',
    description:
      'Production-grade RESTful API for modern Clinic AI Agent system. Handles patient registration, authentication, doctor schedules, appointment booking with double-booking prevention, and conversational AI triage with clinical safety guardrails.',
    contact: {
      name: 'Clinic Health IT Engineering',
      email: 'engineering@clinicagent.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Patient registration, credentials login, and current session' },
    { name: 'Doctors', description: 'Specialist listings and real-time appointment availability calculations' },
    { name: 'Appointments', description: 'Appointment scheduling, status updates, collision prevention, and cancellations' },
    { name: 'AI Agent', description: 'Triage conversation, session memory, clinical escalation, and agent tools' },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new patient account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'dateOfBirth', 'phoneNumber'],
                properties: {
                  name: { type: 'string', example: 'Sarah Connor' },
                  email: { type: 'string', format: 'email', example: 'sarah.connor@example.com' },
                  password: { type: 'string', format: 'password', example: 'Secret123!' },
                  dateOfBirth: { type: 'string', format: 'date', example: '1990-05-14' },
                  phoneNumber: { type: 'string', example: '+1 (555) 234-5678' },
                  emergencyContact: { type: 'string', example: 'John Connor (+1 555-876-5432)' },
                  medicalHistory: { type: 'string', example: 'Mild asthma, seasonal allergies' },
                  allergies: { type: 'string', example: 'Penicillin' },
                  currentMedications: { type: 'string', example: 'Albuterol inhaler PRN' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Patient created successfully with JWT token',
          },
          400: { description: 'Validation failed' },
          409: { description: 'Email address already in use' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in with email and password credentials',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'patient@clinicagent.com' },
                  password: { type: 'string', example: 'PatientPass123!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authenticated successfully with JWT bearer token' },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get authenticated user profile and roles',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current profile details' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/doctors': {
      get: {
        tags: ['Doctors'],
        summary: 'List clinic doctors with optional specialization or text search filter',
        parameters: [
          { name: 'specialization', in: 'query', schema: { type: 'string' }, example: 'Cardiology' },
          { name: 'search', in: 'query', schema: { type: 'string' }, example: 'Jenkins' },
          { name: 'activeOnly', in: 'query', schema: { type: 'boolean', default: true } },
        ],
        responses: {
          200: { description: 'List of matching doctors' },
        },
      },
    },
    '/api/doctors/{id}': {
      get: {
        tags: ['Doctors'],
        summary: 'Get details of a specific doctor by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Doctor details' },
          404: { description: 'Doctor not found' },
        },
      },
    },
    '/api/doctors/{id}/availability': {
      get: {
        tags: ['Doctors'],
        summary: 'Get exact bookable time slots for a doctor on a specific date',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'date', in: 'query', required: true, schema: { type: 'string', format: 'date' }, example: '2026-11-12' },
        ],
        responses: {
          200: { description: 'Available and reserved time slots for date' },
          404: { description: 'Doctor not found' },
        },
      },
    },
    '/api/appointments': {
      post: {
        tags: ['Appointments'],
        summary: 'Book a new appointment with double-booking prevention',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['doctorId', 'date', 'timeSlot', 'reason'],
                properties: {
                  doctorId: { type: 'string', example: 'doc-jenkins-01' },
                  date: { type: 'string', format: 'date', example: '2026-11-12' },
                  timeSlot: { type: 'string', example: '10:00' },
                  reason: { type: 'string', example: 'Follow-up consultation regarding blood pressure readings' },
                  notes: { type: 'string', example: 'Patient brings previous lab records' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Appointment booked successfully' },
          400: { description: 'Date in past or outside doctor schedule' },
          409: { description: 'Time slot conflict (double booking prevented)' },
        },
      },
      get: {
        tags: ['Appointments'],
        summary: 'List appointments (filtered automatically by caller role: Patient, Doctor, or Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] } },
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          200: { description: 'List of authorized appointments' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/appointments/{id}': {
      get: {
        tags: ['Appointments'],
        summary: 'Get details of a specific appointment by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Appointment details' },
          403: { description: 'Forbidden: Access to another patient record denied' },
          404: { description: 'Appointment not found' },
        },
      },
      patch: {
        tags: ['Appointments'],
        summary: 'Reschedule or update appointment status/notes',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  date: { type: 'string', format: 'date' },
                  timeSlot: { type: 'string' },
                  status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] },
                  reason: { type: 'string' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Appointment updated successfully' },
          409: { description: 'Rescheduled time slot is already booked' },
        },
      },
      delete: {
        tags: ['Appointments'],
        summary: 'Cancel an appointment and release doctor time slot',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Appointment cancelled successfully' },
        },
      },
    },
    '/api/agent/chat': {
      post: {
        tags: ['AI Agent'],
        summary: 'Send a message to the AI Clinic Assistant with session memory and triage',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sessionId', 'message'],
                properties: {
                  sessionId: { type: 'string', example: 'sess-patient-7890' },
                  message: { type: 'string', example: 'I have had mild headaches for 2 days. Who can I see?' },
                  patientId: { type: 'string', example: 'pat-connor-01' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'AI Assistant response with triage urgency and recommended actions' },
        },
      },
    },
    '/api/agent/conversations/{sessionId}': {
      get: {
        tags: ['AI Agent'],
        summary: 'Retrieve conversation history by sessionId',
        parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Conversation session with message timeline' },
          404: { description: 'Session not found' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};
