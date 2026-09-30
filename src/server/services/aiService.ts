import { GoogleGenAI } from '@google/genai';
import { config } from '../config';
import { db } from '../db';

export class AIService {
  private static aiClient: GoogleGenAI | null = null;

  private static getClient(): GoogleGenAI | null {
    if (!this.aiClient && config.geminiApiKey) {
      try {
        this.aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
      } catch (err) {
        console.warn('[AIService] Failed to initialize GoogleGenAI client, falling back to smart heuristic engine.');
      }
    }
    return this.aiClient;
  }

  public static async queryHealthCompanion(patientUserId: string, userMessage: string, language: string = 'en') {
    const patient = db.patients.find((p) => p.userId === patientUserId || p.id === patientUserId);
    const activePrescription = patient
      ? db.prescriptions.find((p) => p.patientId === patient.id && p.status === 'ACTIVE')
      : null;
    const activeSchedules = patient
      ? db.medicineSchedules.filter((s) => s.patientId === patient.id && s.isActive)
      : [];

    const medicinesList = activeSchedules
      .map((s) => `${s.medicineName} (${s.dosage}, at ${s.scheduledTime}, ${s.mealTiming})`)
      .join('; ');

    const systemPrompt = `You are Curevia AI - an intelligent, empathetic medical assistant for community health and medicine adherence.
Strict Guardrails & Rules:
1. You may explain medicine schedules, explain why adherence is vital, translate doctor instructions into simple terms in the user's language (${language}), and assist with app navigation.
2. YOU ARE STRICTLY PROHIBITED FROM:
   - Diagnosing new diseases or clinical conditions.
   - Changing, adjusting, or stopping any prescribed medications or dosages.
   - Recommending new prescription drugs.
3. If the user mentions emergency signs (severe chest pain, breathing difficulty, acute bleeding), immediately advise calling Emergency Services (108 / 112) or visiting the nearest hospital immediately.
4. Current Patient Active Medications: ${medicinesList || 'No active digital prescription found'}.
Always respond warmly, clearly, and concisely.`;

    const client = this.getClient();

    if (client) {
      try {
        const response = await client.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemPrompt}\n\nUser Question: ${userMessage}`,
        });

        if (response.text) {
          return {
            reply: response.text,
            isAiGenerated: true,
            model: 'gemini-2.5-flash',
          };
        }
      } catch (err: any) {
        console.warn('[AIService] Gemini API error, applying safe fallback response.', err.message);
      }
    }

    // Smart Heuristic Fallback
    return {
      reply: this.generateFallbackResponse(userMessage, activeSchedules, language),
      isAiGenerated: false,
      model: 'curevia-clinical-rules-engine',
    };
  }

  private static generateFallbackResponse(query: string, schedules: any[], language: string): string {
    const q = query.toLowerCase();

    if (q.includes('chest pain') || q.includes('emergency') || q.includes('heart attack') || q.includes('breath')) {
      return 'EMERGENCY ALERT: Please contact emergency ambulance services at 108 or proceed to the nearest emergency medical department immediately. Do not delay.';
    }

    if (q.includes('when') || q.includes('time') || q.includes('schedule') || q.includes('medicine')) {
      if (schedules.length > 0) {
        const list = schedules.map((s) => `• ${s.medicineName} (${s.dosage}) at ${s.scheduledTime} (${s.mealTiming.replace('_', ' ')})`).join('\n');
        return `Here are your scheduled medications for today:\n${list}\n\nCurevia will trigger alarms 5 minutes and 2 minutes before each dose.`;
      }
      return 'You currently have no active medicine alarms. If you have a doctor appointment scheduled, your medications will automatically appear here once prescribed.';
    }

    if (q.includes('food') || q.includes('empty stomach') || q.includes('after food')) {
      return 'Most medications like Metformin and Telmisartan are best taken after food to prevent stomach irritation and ensure optimal absorption. Always take your pills with a full glass of water.';
    }

    if (q.includes('miss') || q.includes('forgot')) {
      return 'If you missed a dose, take it as soon as you remember unless it is almost time for your next scheduled dose. Never take two doses together to make up for a missed one.';
    }

    return 'Namaste! I am your Curevia Health Companion. I can help you understand your medicine schedule, meal timings, upcoming doctor appointments, and prescription instructions. How can I assist your health today?';
  }
}
