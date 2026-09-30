import { db } from '../db';
import { NotificationType } from '../types';
import { I18nService } from './i18nService';
import { socketService } from './socketService';

export class NotificationService {
  public static async send(params: {
    userId: string;
    type: NotificationType;
    translationKey: string;
    translationParams?: Record<string, any>;
    customTitle?: string;
    metadata?: any;
  }) {
    const user = db.users.find((u) => u.id === params.userId);
    const lang = user?.preferredLanguage || 'en';

    const message = I18nService.format(params.translationKey, lang, params.translationParams || {});
    const title = params.customTitle || this.getDefaultTitle(params.type, lang);

    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: params.userId,
      type: params.type,
      title,
      message,
      language: lang,
      metadata: params.metadata || {},
      isRead: false,
      sentViaSMS: true,
      sentViaPush: true,
      sentViaVoice: params.type === 'MEDICINE_DUE' || params.type === 'AI_CALL',
      createdAt: new Date().toISOString(),
    };

    db.notifications.unshift(notification);

    // Real-time Push via WebSocket
    socketService.emitToUser(params.userId, 'new_notification', notification);

    console.log(`[NOTIFICATION] Sent to user ${params.userId}: [${params.type}] "${message}"`);
    return notification;
  }

  private static getDefaultTitle(type: NotificationType, lang: string): string {
    const titles: Record<NotificationType, string> = {
      MEDICINE_5_MIN: 'Medicine Reminder (5 min)',
      MEDICINE_2_MIN: 'Medicine Reminder (2 min)',
      MEDICINE_DUE: 'Medicine Due Now',
      MEDICINE_MISSED: 'Missed Medication Alert',
      APPOINTMENT_10_DAYS: 'Appointment in 10 Days',
      APPOINTMENT_5_DAYS: 'Appointment in 5 Days',
      APPOINTMENT_1_DAY: 'Appointment Tomorrow',
      APPOINTMENT_TODAY: 'Appointment Today',
      AI_CALL: 'AI Voice Health Call',
      NEW_PRESCRIPTION: 'New Digital Prescription',
      FAMILY_ACCESS_REQUEST: 'Family Circle Invitation',
      FAMILY_ACCESS_ACCEPTED: 'Family Access Approved',
      MEDICINE_REFILL: 'Medicine Refill Needed',
      OP_QUEUE_UPDATE: 'Live OP Queue Alert',
      SYSTEM_NOTIFICATION: 'System Notice',
    };
    return titles[type] || 'Healthcare Alert';
  }
}
