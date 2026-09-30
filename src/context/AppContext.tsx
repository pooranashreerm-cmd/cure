import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  UserRole,
  LanguageCode,
  UserProfile,
  MedicineScheduleItem,
  DoctorPrescription,
  Appointment,
  EHRRecord,
  FamilyMember,
  NotificationItem,
  Hospital,
  DoctorReview,
  CommunityPatient,
  PharmacyOrder,
} from '../types';
import {
  INITIAL_PATIENT,
  INITIAL_DOCTOR,
  INITIAL_COMMUNITY_WORKER,
  INITIAL_PHARMACY,
  INITIAL_MEDICINES,
  INITIAL_PRESCRIPTIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_EHR_RECORDS,
  INITIAL_FAMILY_MEMBERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_HOSPITALS,
  INITIAL_DOCTOR_REVIEWS,
  INITIAL_COMMUNITY_PATIENTS,
  INITIAL_PHARMACY_ORDERS,
} from '../data/mockData';
import { getTranslation } from '../utils/translations';
import { speakText, playSynthesizedAlarm } from '../utils/speech';

interface AppContextType {
  // Authentication & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  isLoggedIn: boolean;
  loginUser: (role: UserRole, phone: string, name?: string) => void;
  logoutUser: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  // Global Settings
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  easyMode: boolean;
  setEasyMode: (enabled: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  fontSize: 'normal' | 'large' | 'extra-large';
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  t: (key: string, params?: Record<string, string>) => string;
  speak: (text: string) => void;

  // Active view tabs
  activePatientTab: string;
  setActivePatientTab: (tab: string) => void;
  activeDoctorTab: string;
  setActiveDoctorTab: (tab: string) => void;
  activeChwTab: string;
  setActiveChwTab: (tab: string) => void;
  activePharmacyTab: string;
  setActivePharmacyTab: (tab: string) => void;

  // Data States
  medicines: MedicineScheduleItem[];
  addMedicine: (med: Omit<MedicineScheduleItem, 'id' | 'history'>) => void;
  markMedicineTaken: (id: string, scheduledTime?: string) => void;
  snoozeMedicine: (id: string) => void;
  deleteMedicine: (id: string) => void;

  prescriptions: DoctorPrescription[];
  createPrescription: (rx: Omit<DoctorPrescription, 'id' | 'prescriptionNumber' | 'date' | 'status'>) => void;

  appointments: Appointment[];
  bookAppointment: (apt: Omit<Appointment, 'id' | 'opNumber' | 'currentOpNumber' | 'estimatedWaitMinutes' | 'status' | 'aiCallStatus'>) => void;
  cancelAppointment: (id: string) => void;

  ehrRecords: EHRRecord[];
  addEHRRecord: (record: Omit<EHRRecord, 'id'>) => void;

  familyMembers: FamilyMember[];
  inviteFamilyMember: (member: Omit<FamilyMember, 'id' | 'status' | 'requestedDate'>) => void;
  updateFamilyAccess: (id: string, status: 'active' | 'rejected') => void;
  revokeFamilyAccess: (id: string) => void;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  unreadNotificationsCount: number;

  hospitals: Hospital[];
  doctorReviews: DoctorReview[];
  addDoctorReview: (review: Omit<DoctorReview, 'id' | 'date' | 'verifiedVisit'>) => void;

  communityPatients: CommunityPatient[];
  updateCommunityPatient: (id: string, updates: Partial<CommunityPatient>) => void;

  pharmacyOrders: PharmacyOrder[];
  updatePharmacyOrderStatus: (id: string, status: PharmacyOrder['status']) => void;
  triggerRefillAlert: (orderId: string) => void;

  // Modals & Active Alerts
  alarmModalOpen: boolean;
  setAlarmModalOpen: (open: boolean) => void;
  activeAlarmMedicine: MedicineScheduleItem | null;
  triggerMedicineAlarm: (med: MedicineScheduleItem) => void;
  dismissAlarm: () => void;

  aiCallModalOpen: boolean;
  setAiCallModalOpen: (open: boolean) => void;
  activeCallAppointment: Appointment | null;
  startAiCall: (apt: Appointment) => void;

  aiAssistantOpen: boolean;
  setAiAssistantOpen: (open: boolean) => void;

  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication & Roles
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Current user based on role
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_PATIENT);

  // Settings
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [easyMode, setEasyMode] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('curevia_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.warn('Unable to access localStorage for theme:', e);
    }
    return 'light';
  });
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Active View Tabs
  const [activePatientTab, setActivePatientTab] = useState<string>('home');
  const [activeDoctorTab, setActiveDoctorTab] = useState<string>('dashboard');
  const [activeChwTab, setActiveChwTab] = useState<string>('dashboard');
  const [activePharmacyTab, setActivePharmacyTab] = useState<string>('dashboard');

  // Data Collections
  const [medicines, setMedicines] = useState<MedicineScheduleItem[]>(INITIAL_MEDICINES);
  const [prescriptions, setPrescriptions] = useState<DoctorPrescription[]>(INITIAL_PRESCRIPTIONS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [ehrRecords, setEhrRecords] = useState<EHRRecord[]>(INITIAL_EHR_RECORDS);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY_MEMBERS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [hospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [doctorReviews, setDoctorReviews] = useState<DoctorReview[]>(INITIAL_DOCTOR_REVIEWS);
  const [communityPatients, setCommunityPatients] = useState<CommunityPatient[]>(INITIAL_COMMUNITY_PATIENTS);
  const [pharmacyOrders, setPharmacyOrders] = useState<PharmacyOrder[]>(INITIAL_PHARMACY_ORDERS);

  // Interactive Alerts & Modals
  const [alarmModalOpen, setAlarmModalOpen] = useState<boolean>(false);
  const [activeAlarmMedicine, setActiveAlarmMedicine] = useState<MedicineScheduleItem | null>(null);
  const [aiCallModalOpen, setAiCallModalOpen] = useState<boolean>(false);
  const [activeCallAppointment, setActiveCallAppointment] = useState<Appointment | null>(null);
  const [aiAssistantOpen, setAiAssistantOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync role changes to respective user profiles
  const switchUserRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'patient') setCurrentUser(INITIAL_PATIENT);
    else if (role === 'doctor') setCurrentUser(INITIAL_DOCTOR);
    else if (role === 'community_worker') setCurrentUser(INITIAL_COMMUNITY_WORKER);
    else if (role === 'pharmacy') setCurrentUser(INITIAL_PHARMACY);
  };

  const loginUser = (role: UserRole, phone: string, name?: string) => {
    setIsLoggedIn(true);
    setCurrentRole(role);
    if (role === 'patient') {
      setCurrentUser({ ...INITIAL_PATIENT, phone, name: name || INITIAL_PATIENT.name });
    } else if (role === 'doctor') {
      setCurrentUser({ ...INITIAL_DOCTOR, phone, name: name || INITIAL_DOCTOR.name });
    } else if (role === 'community_worker') {
      setCurrentUser({ ...INITIAL_COMMUNITY_WORKER, phone, name: name || INITIAL_COMMUNITY_WORKER.name });
    } else {
      setCurrentUser({ ...INITIAL_PHARMACY, phone, name: name || INITIAL_PHARMACY.name });
    }
    setAuthModalOpen(false);
    showToast(`Welcome to Curevia, ${name || 'User'}!`);
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setAuthModalOpen(true);
  };

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    setCurrentUser((prev) => ({ ...prev, language: lang }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const t = (key: string, params?: Record<string, string>) => {
    return getTranslation(language, key, params);
  };

  const speak = (text: string) => {
    speakText(text, language);
  };

  // Medicine Actions
  const addMedicine = (medData: Omit<MedicineScheduleItem, 'id' | 'history'>) => {
    const newMed: MedicineScheduleItem = {
      ...medData,
      id: `med_${Date.now()}`,
      history: [],
    };
    setMedicines((prev) => [newMed, ...prev]);

    // Send confirmation notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      type: 'medicine_reminder',
      title: '💊 Medicine Added',
      message: `Schedule created for ${newMed.name} (${newMed.dosage}) at ${newMed.times.join(', ')}.`,
      timestamp: 'Just now',
      read: false,
      metadata: { medicineName: newMed.name, dosage: newMed.dosage },
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Added reminder for ${newMed.name}`);
  };

  const markMedicineTaken = (id: string, scheduledTime?: string) => {
    const timeStr = scheduledTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = new Date().toISOString().split('T')[0];

    setMedicines((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const updatedRemaining = Math.max(0, med.remainingTablets - med.quantity);
          const newHistory = [
            {
              id: `h_${Date.now()}`,
              date: todayStr,
              time: timeStr,
              status: 'taken' as const,
              timestamp: new Date().toISOString(),
            },
            ...med.history,
          ];

          // Trigger Refill Warning if remaining is low (<= 5)
          if (updatedRemaining <= 5 && med.status === 'active') {
            setTimeout(() => {
              const refillNotif: NotificationItem = {
                id: `notif_refill_${Date.now()}`,
                type: 'medicine_refill',
                title: '🔄 Medicine Refill Reminder',
                message: `Your ${med.name} supply has only ${updatedRemaining} tablets remaining. A refill request has been queued.`,
                timestamp: 'Just now',
                read: false,
                metadata: { medicineName: med.name, refillDaysLeft: Math.ceil(updatedRemaining / med.times.length) },
              };
              setNotifications((n) => [refillNotif, ...n]);
            }, 1200);
          }

          return {
            ...med,
            remainingTablets: updatedRemaining,
            history: newHistory,
          };
        }
        return med;
      })
    );

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0ea5e9', '#10b981', '#6366f1'],
      });
    } catch {
      // ignore
    }

    if (alarmModalOpen) {
      setAlarmModalOpen(false);
    }

    showToast(`Great job! Marked medicine as taken.`);
  };

  const snoozeMedicine = (id: string) => {
    const med = medicines.find((m) => m.id === id);
    if (med) {
      showToast(`Reminder snoozed for 10 minutes.`);
      if (alarmModalOpen) setAlarmModalOpen(false);
    }
  };

  const deleteMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    showToast('Medicine removed from schedule.');
  };

  // Prescription Generator -> Automatic Reminder Creation + EHR + Pharmacy Order Pipeline
  const createPrescription = (rxData: Omit<DoctorPrescription, 'id' | 'prescriptionNumber' | 'date' | 'status'>) => {
    const rxId = `rx_${Date.now()}`;
    const rxNumber = `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const newPrescription: DoctorPrescription = {
      ...rxData,
      id: rxId,
      prescriptionNumber: rxNumber,
      date: todayStr,
      status: 'active',
      pharmacyStatus: 'pending',
    };

    setPrescriptions((prev) => [newPrescription, ...prev]);

    // 1. Automatically convert prescription medicines into Medicine Schedules!
    const createdMedicineItems: MedicineScheduleItem[] = rxData.medicines.map((m, idx) => {
      const daysMatch = m.duration.match(/\d+/);
      const days = daysMatch ? parseInt(daysMatch[0], 10) : 5;
      const times = m.times.length > 0 ? m.times : ['08:00', '14:00', '20:00'];

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      return {
        id: `med_rx_${Date.now()}_${idx}`,
        name: m.name,
        dosage: m.dosage,
        form: m.form || 'tablet',
        quantity: 1,
        times: times,
        mealTiming: m.mealTiming || 'after_food',
        startDate: todayStr,
        endDate: endDate.toISOString().split('T')[0],
        durationDays: days,
        totalTablets: days * times.length,
        remainingTablets: days * times.length,
        reminderSound: 'gentle-chime',
        reminderLanguage: language,
        status: 'active',
        instructions: m.instructions || `Take as prescribed by ${rxData.doctorName}`,
        prescribedBy: rxData.doctorName,
        doctorPrescriptionId: rxId,
        history: [],
      };
    });

    setMedicines((prev) => [...createdMedicineItems, ...prev]);

    // 2. Automatically attach to Patient EHR Records!
    const newEhr: EHRRecord = {
      id: `ehr_rx_${Date.now()}`,
      patientId: rxData.patientId,
      title: `Digital Prescription #${rxNumber}`,
      type: 'prescription',
      date: todayStr,
      doctorName: rxData.doctorName,
      hospitalName: rxData.hospitalName,
      department: rxData.doctorSpecialty,
      summary: `Diagnosis: ${rxData.diagnosis}. Prescribed ${rxData.medicines.map((m) => `${m.name} ${m.dosage}`).join(', ')}. Follow up on ${rxData.followUpDate}.`,
      tags: ['Prescription', 'Doctor Visit', 'EHR'],
      findings: [`Diagnosis: ${rxData.diagnosis}`, `Notes: ${rxData.notes || 'Routine follow-up'}`],
    };
    setEhrRecords((prev) => [newEhr, ...prev]);

    // 3. Automatically dispatch order to Pharmacy Dashboard!
    const newPharmacyOrder: PharmacyOrder = {
      id: `ord_${Date.now()}`,
      prescriptionId: rxId,
      prescriptionNumber: rxNumber,
      patientId: rxData.patientId,
      patientName: rxData.patientName,
      patientPhone: INITIAL_PATIENT.phone,
      doctorName: rxData.doctorName,
      hospitalName: rxData.hospitalName,
      date: todayStr,
      medicines: rxData.medicines.map((m) => {
        const d = m.duration.match(/\d+/);
        const days = d ? parseInt(d[0], 10) : 5;
        return {
          name: `${m.name} ${m.dosage}`,
          dosage: m.dosage,
          quantity: days * (m.times.length || 3),
          days: days,
          inStock: true,
        };
      }),
      status: 'new',
      refillReminderTriggered: false,
      notes: rxData.notes,
    };
    setPharmacyOrders((prev) => [newPharmacyOrder, ...prev]);

    // 4. Send Instant Push Notification
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      type: 'new_prescription',
      title: `📄 Prescription Added: #${rxNumber}`,
      message: `${rxData.doctorName} generated a digital prescription. Your medicine reminder schedule was automatically updated!`,
      timestamp: 'Just now',
      read: false,
      metadata: { prescriptionId: rxId },
    };
    setNotifications((prev) => [notif, ...prev]);

    // 5. Trigger Success Feedback
    showToast(t('autoCreatedMsg'));
  };

  // Appointments
  const bookAppointment = (aptData: Omit<Appointment, 'id' | 'opNumber' | 'currentOpNumber' | 'estimatedWaitMinutes' | 'status' | 'aiCallStatus'>) => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt_${Date.now()}`,
      opNumber: Math.floor(15 + Math.random() * 30),
      currentOpNumber: Math.floor(5 + Math.random() * 10),
      estimatedWaitMinutes: Math.floor(15 + Math.random() * 25),
      status: 'confirmed',
      aiCallStatus: 'scheduled',
      aiCallScheduledTime: '1 day prior at 06:00 PM',
    };

    setAppointments((prev) => [newApt, ...prev]);

    const notif: NotificationItem = {
      id: `notif_apt_${Date.now()}`,
      type: 'appointment_reminder',
      title: `📅 Appointment Confirmed: ${newApt.doctorName}`,
      message: `Your appointment is confirmed at ${newApt.hospitalName} on ${newApt.date} at ${newApt.time}. Your OP Queue # is ${newApt.opNumber}.`,
      timestamp: 'Just now',
      read: false,
      metadata: { appointmentId: newApt.id },
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Appointment booked! OP Queue #${newApt.opNumber}`);
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' as const } : a))
    );
    showToast('Appointment cancelled.');
  };

  // EHR
  const addEHRRecord = (recordData: Omit<EHRRecord, 'id'>) => {
    const newRec: EHRRecord = {
      ...recordData,
      id: `ehr_${Date.now()}`,
    };
    setEhrRecords((prev) => [newRec, ...prev]);
    showToast('Health document uploaded to EHR.');
  };

  // Family Members
  const inviteFamilyMember = (memberData: Omit<FamilyMember, 'id' | 'status' | 'requestedDate'>) => {
    const newFam: FamilyMember = {
      ...memberData,
      id: `fam_${Date.now()}`,
      status: 'pending',
      requestedDate: new Date().toISOString().split('T')[0],
    };
    setFamilyMembers((prev) => [newFam, ...prev]);
    showToast(`Invitation sent to ${newFam.name}`);
  };

  const updateFamilyAccess = (id: string, status: 'active' | 'rejected') => {
    setFamilyMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status,
              approvedDate: status === 'active' ? new Date().toISOString().split('T')[0] : undefined,
            }
          : m
      )
    );
    showToast(status === 'active' ? 'Access granted to family member.' : 'Access request rejected.');
  };

  const revokeFamilyAccess = (id: string) => {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
    showToast('Family access revoked.');
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Doctor Reviews
  const addDoctorReview = (revData: Omit<DoctorReview, 'id' | 'date' | 'verifiedVisit'>) => {
    const newRev: DoctorReview = {
      ...revData,
      id: `rev_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      verifiedVisit: true,
    };
    setDoctorReviews((prev) => [newRev, ...prev]);
    showToast('Thank you! Your feedback was submitted anonymously.');
  };

  // Community Patients
  const updateCommunityPatient = (id: string, updates: Partial<CommunityPatient>) => {
    setCommunityPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Patient record updated.');
  };

  // Pharmacy Orders
  const updatePharmacyOrderStatus = (id: string, status: PharmacyOrder['status']) => {
    setPharmacyOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    showToast(`Order status updated to ${status}.`);
  };

  const triggerRefillAlert = (orderId: string) => {
    const order = pharmacyOrders.find((o) => o.id === orderId);
    if (order) {
      setPharmacyOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, refillReminderTriggered: true } : o))
      );

      const refillNotif: NotificationItem = {
        id: `notif_refill_${Date.now()}`,
        type: 'medicine_refill',
        title: '🔄 Automated Refill Ready',
        message: `Apex Pharmacy has prepared your prescription refill for #${order.prescriptionNumber}. Tap to confirm pickup or delivery.`,
        timestamp: 'Just now',
        read: false,
      };
      setNotifications((n) => [refillNotif, ...n]);
      showToast(`Automated refill alert sent to ${order.patientName}!`);
    }
  };

  // Alarms
  const triggerMedicineAlarm = (med: MedicineScheduleItem) => {
    setActiveAlarmMedicine(med);
    setAlarmModalOpen(true);
    playSynthesizedAlarm(med.reminderSound);
    // Voice prompt
    const msg = getTranslation(language, 'takeMedicineNow', { name: med.name, dosage: med.dosage });
    setTimeout(() => {
      speakText(msg, language);
    }, 600);
  };

  const dismissAlarm = () => {
    setAlarmModalOpen(false);
    setActiveAlarmMedicine(null);
  };

  // AI Health Call Simulation
  const startAiCall = (apt: Appointment) => {
    setActiveCallAppointment(apt);
    setAiCallModalOpen(true);
  };

  // Apply dark class and high-contrast / font size classes to html/body
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem('curevia_theme', theme);
    } catch (e) {
      console.warn('Unable to persist theme to localStorage:', e);
    }

    if (highContrast) {
      root.classList.add('contrast-125');
    } else {
      root.classList.remove('contrast-125');
    }

    if (fontSize === 'large') {
      root.style.fontSize = '18px';
    } else if (fontSize === 'extra-large') {
      root.style.fontSize = '20px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [theme, highContrast, fontSize]);

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole: switchUserRole,
        currentUser,
        setCurrentUser,
        isLoggedIn,
        loginUser,
        logoutUser,
        authModalOpen,
        setAuthModalOpen,
        language,
        setLanguage,
        easyMode,
        setEasyMode,
        theme,
        setTheme,
        toggleTheme,
        highContrast,
        setHighContrast,
        fontSize,
        setFontSize,
        t,
        speak,
        activePatientTab,
        setActivePatientTab,
        activeDoctorTab,
        setActiveDoctorTab,
        activeChwTab,
        setActiveChwTab,
        activePharmacyTab,
        setActivePharmacyTab,
        medicines,
        addMedicine,
        markMedicineTaken,
        snoozeMedicine,
        deleteMedicine,
        prescriptions,
        createPrescription,
        appointments,
        bookAppointment,
        cancelAppointment,
        ehrRecords,
        addEHRRecord,
        familyMembers,
        inviteFamilyMember,
        updateFamilyAccess,
        revokeFamilyAccess,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        unreadNotificationsCount,
        hospitals,
        doctorReviews,
        addDoctorReview,
        communityPatients,
        updateCommunityPatient,
        pharmacyOrders,
        updatePharmacyOrderStatus,
        triggerRefillAlert,
        alarmModalOpen,
        setAlarmModalOpen,
        activeAlarmMedicine,
        triggerMedicineAlarm,
        dismissAlarm,
        aiCallModalOpen,
        setAiCallModalOpen,
        activeCallAppointment,
        startAiCall,
        aiAssistantOpen,
        setAiAssistantOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
