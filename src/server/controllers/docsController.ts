import { Request, Response } from 'express';

export class DocsController {
  public static getOpenApiSpec(req: Request, res: Response): void {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Curevia Backend API',
        version: '1.0.0',
        description:
          'Production-ready Healthcare Backend for Smart Medicine Reminder & EHR Companion with RBAC, Reminders, Voice Calls, and Digital Prescriptions.',
      },
      servers: [{ url: '/api', description: 'Curevia API Gateway' }],
      paths: {
        '/auth/send-otp': {
          post: {
            summary: 'Send mobile OTP',
            description: 'Generates secure 6-digit OTP code to registered mobile number with rate limiting.',
            requestBody: { content: { 'application/json': { schema: { properties: { mobileNumber: { type: 'string' } } } } } },
          },
        },
        '/auth/verify-otp': {
          post: {
            summary: 'Verify OTP & Issue JWT',
            description: 'Verifies OTP against bcrypt hash, provisions user profile, and returns JWT access + refresh token.',
          },
        },
        '/patient/dashboard': {
          get: { summary: 'Patient Clinical Dashboard', description: 'Returns today alarms, prescriptions, next appointment, and adherence.' },
        },
        '/patient/reminders/:id/taken': {
          post: { summary: 'Mark reminder dose taken', description: 'Records intake timestamp, decrements remaining doses, updates adherence.' },
        },
        '/patient/reminders/:id/snooze': {
          post: { summary: 'Snooze alarm', description: 'Snoozes medicine alarm for 5, 10, 15, or 30 minutes.' },
        },
        '/doctor/prescriptions': {
          post: { summary: 'Issue Digital Prescription', description: 'Creates prescription, auto-schedules alarms, updates EHR, notifies pharmacy.' },
        },
        '/doctor/queue': {
          get: { summary: 'Doctor OP Queue', description: 'Returns real-time token list and waiting patient metrics.' },
        },
        '/doctor/queue/call-next': {
          post: { summary: 'Call Next Token', description: 'Marks current consultation finished, advances queue, notifies patient.' },
        },
        '/ehr/records/:patientId': {
          get: { summary: 'Get Patient EHR Records', description: 'Returns medical records, lab tests, and encrypted attachments.' },
        },
        '/community/dashboard': {
          get: { summary: 'CHW Field Dashboard', description: 'Returns village patient roster, adherence risk levels, and visit logs.' },
        },
        '/pharmacy/dashboard': {
          get: { summary: 'Dispensary Queue', description: 'Returns orders, preparation status, and refill requests.' },
        },
        '/ai/chat': {
          post: { summary: 'AI Health Companion', description: 'Medical assistant with strict guardrails explaining schedules and instructions.' },
        },
      },
    };

    res.status(200).json(spec);
  }
}
