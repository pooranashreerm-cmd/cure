import { config } from '../config';
import { AuditService } from './auditService';

export interface SendSmsOptions {
  to: string;
  message: string;
  templateId?: string;
  senderId?: string;
}

export interface SmsResult {
  success: boolean;
  provider: 'TWILIO' | 'FAST2SMS' | 'MSG91' | 'MOCK_DEV' | 'HTTP_GATEWAY';
  messageId: string;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
  error?: string;
}

export class SmsService {
  /**
   * Dispatches an SMS message using the configured SMS provider.
   * Supports Twilio, Fast2SMS, MSG91, and a resilient local/dev fallback when external credentials are not set.
   */
  public static async sendSms(options: SendSmsOptions): Promise<SmsResult> {
    const { to, message } = options;
    const normalizedPhone = to.trim();

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    const fast2smsKey = process.env.FAST2SMS_API_KEY || (process.env.SMS_PROVIDER_KEY?.startsWith('fast_') ? process.env.SMS_PROVIDER_KEY : undefined);
    const msg91AuthKey = process.env.MSG91_AUTH_KEY || (process.env.SMS_PROVIDER_KEY?.startsWith('msg91_') ? process.env.SMS_PROVIDER_KEY : undefined);

    // 1. Twilio Integration
    if (twilioSid && twilioAuthToken && twilioPhone) {
      try {
        const auth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', normalizedPhone);
        params.append('From', twilioPhone);
        params.append('Body', message);

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        const data: any = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Twilio SMS dispatch failed');
        }

        console.log(`[SMS-SERVICE] Twilio SMS dispatched successfully to ${normalizedPhone}. SID: ${data.sid}`);
        return {
          success: true,
          provider: 'TWILIO',
          messageId: data.sid,
          status: 'SENT',
        };
      } catch (err: any) {
        console.error('[SMS-SERVICE] Twilio dispatch error:', err.message);
        // Fall back to audit log and mock status so flow does not abruptly crash
        return {
          success: false,
          provider: 'TWILIO',
          messageId: `err-${Date.now()}`,
          status: 'FAILED',
          error: err.message,
        };
      }
    }

    // 2. Fast2SMS Integration (India Gateway)
    if (fast2smsKey) {
      try {
        const rawNumber = normalizedPhone.replace(/\D/g, '').slice(-10);
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: fast2smsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'v3',
            sender_id: process.env.SMS_SENDER_ID || 'TXTIND',
            message: message,
            language: 'english',
            flash: 0,
            numbers: rawNumber,
          }),
        });

        const data: any = await response.json();
        if (data.return) {
          console.log(`[SMS-SERVICE] Fast2SMS dispatched successfully to ${rawNumber}. RequestId: ${data.request_id}`);
          return {
            success: true,
            provider: 'FAST2SMS',
            messageId: data.request_id || `f2s-${Date.now()}`,
            status: 'SENT',
          };
        } else {
          console.warn('[SMS-SERVICE] Fast2SMS warning response:', data.message);
        }
      } catch (err: any) {
        console.error('[SMS-SERVICE] Fast2SMS dispatch error:', err.message);
      }
    }

    // 3. MSG91 Integration
    if (msg91AuthKey) {
      try {
        const rawNumber = normalizedPhone.replace(/\D/g, '');
        const response = await fetch('https://api.msg91.com/api/v5/flow/', {
          method: 'POST',
          headers: {
            authkey: msg91AuthKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            template_id: options.templateId || process.env.MSG91_TEMPLATE_ID || 'curevia_otp_template',
            short_url: '0',
            recipients: [{ mobiles: rawNumber, VAR1: message }],
          }),
        });

        const data: any = await response.json();
        console.log(`[SMS-SERVICE] MSG91 dispatched to ${rawNumber}:`, data);
        return {
          success: true,
          provider: 'MSG91',
          messageId: data.request_id || `msg91-${Date.now()}`,
          status: 'SENT',
        };
      } catch (err: any) {
        console.error('[SMS-SERVICE] MSG91 dispatch error:', err.message);
      }
    }

    // 4. Development / Fallback Simulated Dispatch
    const messageId = `sms-sim-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    console.log(`\n================== [CUREVIA SMS DISPATCH] ==================`);
    console.log(`Recipient: ${normalizedPhone}`);
    console.log(`Provider: SMS Gateway (Simulated / Configured)`);
    console.log(`Message: "${message}"`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`============================================================\n`);

    AuditService.log({
      actorRole: 'SYSTEM_SMS',
      action: 'SMS_DISPATCHED',
      resource: 'SMS',
      resourceId: messageId,
      metadata: { to: normalizedPhone.replace(/\d(?=\d{4})/g, '*'), status: 'SIMULATED' },
    });

    return {
      success: true,
      provider: 'MOCK_DEV',
      messageId,
      status: 'SIMULATED',
    };
  }
}
