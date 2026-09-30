export class I18nService {
  private static translations: Record<string, Record<string, string>> = {
    en: {
      'medicine.reminder.5_minutes': 'Reminder: Your medicine {medicineName} ({dosage}) is scheduled in 5 minutes.',
      'medicine.reminder.2_minutes': 'Alert: Please get ready to take {medicineName} in 2 minutes ({mealTiming}).',
      'medicine.reminder.due': 'Time to take your medication: {medicineName} ({dosage}) now.',
      'medicine.reminder.missed': 'Attention: You missed your scheduled dose of {medicineName}. Please check your prescription.',
      'appointment.reminder.10_days': 'Appointment Notice: You have an upcoming consultation with {doctorName} in 10 days.',
      'appointment.reminder.5_days': 'Appointment Reminder: Your appointment with {doctorName} at {hospitalName} is in 5 days.',
      'appointment.reminder.1_day': 'Tomorrow: Your appointment with {doctorName} is scheduled tomorrow at {time}.',
      'appointment.reminder.today': 'Today is your appointment with {doctorName} at {time} (Token #{tokenNumber}).',
      'prescription.created': 'Dr. {doctorName} has issued a new digital prescription for you. Alarms have been set.',
      'family.access.request': '{inviterName} has invited you to join their Family Health Circle.',
      'family.access.accepted': 'Family health access granted for {memberName}.',
      'medicine.refill': 'Your supply of {medicineName} has {remaining} doses left. Please request a refill.',
      'op.queue.update': 'OP Queue update: Doctor is now consulting Token #{currentToken}. Your token is #{yourToken}.',
    },
    ta: {
      'medicine.reminder.5_minutes': 'நினைவூட்டல்: உங்கள் மருந்து {medicineName} ({dosage}) இன்னும் 5 நிமிடங்களில் உட்கொள்ள வேண்டும்.',
      'medicine.reminder.2_minutes': 'எச்சரிக்கை: {medicineName} மருந்தை 2 நிமிடங்களில் உட்கொள்ள தயாராகுங்கள் ({mealTiming}).',
      'medicine.reminder.due': 'மருந்து உட்கொள்ளும் நேரம்: இப்போது {medicineName} ({dosage}) உட்கொள்ளவும்.',
      'medicine.reminder.missed': 'கவனம்: நீங்கள் {medicineName} மருந்தை உட்கொள்ள மறந்துவிட்டீர்கள்.',
      'appointment.reminder.1_day': 'நாளை: {doctorName} மருத்துவரிடம் உங்கள் மருத்துவ ஆலோசனை நேரம் {time}.',
      'prescription.created': 'மருத்துவர் {doctorName} புதிய டிஜிட்டல் மருந்துச்சீட்டை வழங்கியுள்ளார். அலாரங்கள் அமைக்கப்பட்டுள்ளன.',
      'medicine.refill': 'உங்கள் {medicineName} மருந்து கையிருப்பு {remaining} மட்டுமே உள்ளது. உடனே மறுநிரப்பவும்.',
    },
    hi: {
      'medicine.reminder.5_minutes': 'याद दिलाना: आपकी दवा {medicineName} ({dosage}) 5 मिनट में लेने का समय है।',
      'medicine.reminder.2_minutes': 'अलर्ट: कृपया 2 मिनट में {medicineName} लेने के लिए तैयार रहें ({mealTiming})।',
      'medicine.reminder.due': 'दवा लेने का समय: अभी {medicineName} ({dosage}) लें।',
      'medicine.reminder.missed': 'ध्यान दें: आपकी {medicineName} की निर्धारित खुराक छूट गई है।',
      'appointment.reminder.1_day': 'कल: {doctorName} के साथ आपका अपॉइंटमेंट कल {time} पर निर्धारित है।',
      'prescription.created': 'डॉ. {doctorName} ने आपका डिजिटल नुस्खा जारी किया है। अलार्म सेट हो चुके हैं।',
      'medicine.refill': 'आपकी दवा {medicineName} में केवल {remaining} खुराक बची हैं। कृपया रीफिल करें।',
    },
  };

  public static format(key: string, lang: string = 'en', params: Record<string, any> = {}): string {
    const langDict = this.translations[lang] || this.translations['en'];
    let template = langDict[key] || this.translations['en'][key] || key;

    for (const [k, v] of Object.entries(params)) {
      template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }

    return template;
  }
}
