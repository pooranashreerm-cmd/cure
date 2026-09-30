import cron from 'node-cron';
import { ReminderEngine } from '../services/reminderEngine';
import { RefillService } from '../services/refillService';

export class BackgroundJobScheduler {
  private static isRunning = false;

  public static start() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('[Background Jobs] Starting Curevia cron scheduler...');

    // Run every minute: check reminders and alarms
    cron.schedule('* * * * *', async () => {
      try {
        await ReminderEngine.checkUpcomingReminders();
        await RefillService.checkLowSupplies();
      } catch (err) {
        console.error('[Background Jobs Error]:', err);
      }
    });

    console.log('[Background Jobs] Scheduled medicine alarms and low supply checks.');
  }
}
