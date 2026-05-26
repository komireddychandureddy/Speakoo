export type LangCode = 'en' | 'hi' | 'es' | 'fr' | 'ar';

export const LANG_META: Record<LangCode, { label: string; native: string; rtl?: true }> = {
  en: { label: 'English', native: 'English' },
  hi: { label: 'Hindi', native: 'हिन्दी' },
  es: { label: 'Spanish', native: 'Español' },
  fr: { label: 'French', native: 'Français' },
  ar: { label: 'Arabic', native: 'العربية', rtl: true },
};

export type TKey =
  | 'nav_dashboard' | 'nav_sessions' | 'nav_book' | 'nav_tutors'
  | 'nav_resources' | 'nav_curriculum' | 'nav_credits' | 'nav_profile'
  | 'nav_refer' | 'nav_leaderboard' | 'nav_faq'
  | 'nav_practice' | 'nav_community'
  | 'header_credits' | 'lang_select'
  | 'book_select_date' | 'book_times_in' | 'book_tutor_time'
  | 'cred_balance' | 'cred_buy' | 'cred_bonus' | 'cred_buy_now' | 'cred_how'
  | 'fee_base' | 'fee_addon' | 'fee_total' | 'fee_platform' | 'fee_you_earn' | 'fee_save'
  | 'payout_title' | 'payout_schedule' | 'payout_biweekly' | 'payout_monthly'
  | 'payout_min' | 'payout_request' | 'payout_pending';

export const TRANSLATIONS: Record<LangCode, Record<TKey, string>> = {
  en: {
    nav_dashboard: 'Dashboard', nav_sessions: 'My Sessions', nav_book: 'Book Session',
    nav_tutors: 'All Tutors', nav_resources: 'EY Resource', nav_curriculum: 'Curriculum',
    nav_credits: 'My Credits', nav_profile: 'My Profile', nav_refer: 'Refer & Earn',
    nav_leaderboard: 'My Level', nav_faq: 'FAQs',
    nav_practice: 'Practice', nav_community: 'Community',
    header_credits: 'Credits', lang_select: 'Language',
    book_select_date: 'Select Date', book_times_in: 'Times in', book_tutor_time: "Tutor's time",
    cred_balance: 'Credit Balance', cred_buy: 'Buy Credits',
    cred_bonus: 'bonus', cred_buy_now: 'Buy Now', cred_how: 'How Credits Work',
    fee_base: 'Platform Base Price', fee_addon: 'Your Add-on Fee',
    fee_total: 'Learner Pays', fee_platform: 'Platform Fee (5%)',
    fee_you_earn: 'You Earn', fee_save: 'Save Pricing',
    payout_title: 'Payout Settings', payout_schedule: 'Payout Schedule',
    payout_biweekly: 'Biweekly (1st & 15th)', payout_monthly: 'Monthly (1st)',
    payout_min: 'Min. Withdrawal', payout_request: 'Request Payout', payout_pending: 'Pending Payout',
  },
  hi: {
    nav_dashboard: 'डैशबोर्ड', nav_sessions: 'मेरे सत्र', nav_book: 'सत्र बुक करें',
    nav_tutors: 'सभी ट्यूटर', nav_resources: 'EY संसाधन', nav_curriculum: 'पाठ्यक्रम',
    nav_credits: 'मेरे क्रेडिट', nav_profile: 'मेरी प्रोफ़ाइल', nav_refer: 'रेफर करें',
    nav_leaderboard: 'मेरा स्तर', nav_faq: 'सामान्य प्रश्न',
    nav_practice: 'अभ्यास', nav_community: 'समुदाय',
    header_credits: 'क्रेडिट', lang_select: 'भाषा',
    book_select_date: 'तिथि चुनें', book_times_in: 'समय दिखाया', book_tutor_time: 'ट्यूटर समय',
    cred_balance: 'क्रेडिट बैलेंस', cred_buy: 'क्रेडिट खरीदें',
    cred_bonus: 'बोनस', cred_buy_now: 'अभी खरीदें', cred_how: 'क्रेडिट कैसे काम करते हैं',
    fee_base: 'आधार मूल्य', fee_addon: 'अतिरिक्त फीस',
    fee_total: 'कुल भुगतान', fee_platform: 'प्लेटफ़ॉर्म शुल्क (5%)',
    fee_you_earn: 'आप कमाते हैं', fee_save: 'सहेजें',
    payout_title: 'भुगतान सेटिंग', payout_schedule: 'भुगतान अनुसूची',
    payout_biweekly: 'द्विसाप्ताहिक (1 & 15)', payout_monthly: 'मासिक (1 तारीख)',
    payout_min: 'न्यूनतम निकासी', payout_request: 'भुगतान अनुरोध', payout_pending: 'लंबित भुगतान',
  },
  es: {
    nav_dashboard: 'Panel', nav_sessions: 'Mis sesiones', nav_book: 'Reservar',
    nav_tutors: 'Tutores', nav_resources: 'Recursos', nav_curriculum: 'Plan de estudios',
    nav_credits: 'Mis créditos', nav_profile: 'Mi perfil', nav_refer: 'Referir',
    nav_leaderboard: 'Mi nivel', nav_faq: 'Preguntas',
    nav_practice: 'Práctica', nav_community: 'Comunidad',
    header_credits: 'Créditos', lang_select: 'Idioma',
    book_select_date: 'Seleccionar fecha', book_times_in: 'Horas en', book_tutor_time: 'Hora tutor',
    cred_balance: 'Saldo de créditos', cred_buy: 'Comprar créditos',
    cred_bonus: 'bono', cred_buy_now: 'Comprar', cred_how: 'Cómo funcionan los créditos',
    fee_base: 'Precio base', fee_addon: 'Tarifa adicional',
    fee_total: 'El alumno paga', fee_platform: 'Comisión (5%)',
    fee_you_earn: 'Ganas', fee_save: 'Guardar',
    payout_title: 'Configuración de pago', payout_schedule: 'Calendario de pagos',
    payout_biweekly: 'Quincenal (1 y 15)', payout_monthly: 'Mensual (día 1)',
    payout_min: 'Mínimo retiro', payout_request: 'Solicitar pago', payout_pending: 'Pago pendiente',
  },
  fr: {
    nav_dashboard: 'Tableau de bord', nav_sessions: 'Mes séances', nav_book: 'Réserver',
    nav_tutors: 'Tuteurs', nav_resources: 'Ressources', nav_curriculum: 'Programme',
    nav_credits: 'Mes crédits', nav_profile: 'Mon profil', nav_refer: 'Parrainer',
    nav_leaderboard: 'Mon niveau', nav_faq: 'FAQ',
    nav_practice: 'Pratique', nav_community: 'Communauté',
    header_credits: 'Crédits', lang_select: 'Langue',
    book_select_date: 'Sélectionner', book_times_in: 'Heures en', book_tutor_time: 'Heure tuteur',
    cred_balance: 'Solde de crédits', cred_buy: 'Acheter des crédits',
    cred_bonus: 'bonus', cred_buy_now: 'Acheter', cred_how: 'Comment fonctionnent les crédits',
    fee_base: 'Prix de base', fee_addon: 'Majoration',
    fee_total: "L'élève paie", fee_platform: 'Commission (5%)',
    fee_you_earn: 'Vous gagnez', fee_save: 'Sauvegarder',
    payout_title: 'Paramètres de paiement', payout_schedule: 'Calendrier de versement',
    payout_biweekly: 'Bimensuel (1er & 15)', payout_monthly: 'Mensuel (1er)',
    payout_min: 'Retrait minimum', payout_request: 'Demander un paiement', payout_pending: 'En attente',
  },
  ar: {
    nav_dashboard: 'لوحة التحكم', nav_sessions: 'جلساتي', nav_book: 'احجز',
    nav_tutors: 'المعلمون', nav_resources: 'موارد', nav_curriculum: 'المناهج',
    nav_credits: 'رصيدي', nav_profile: 'ملفي', nav_refer: 'أحل واربح',
    nav_leaderboard: 'مستواي', nav_faq: 'الأسئلة',
    nav_practice: 'تدريب', nav_community: 'مجتمع',
    header_credits: 'رصيد', lang_select: 'اللغة',
    book_select_date: 'اختر التاريخ', book_times_in: 'المواعيد', book_tutor_time: 'وقت المعلم',
    cred_balance: 'رصيد الاعتمادات', cred_buy: 'شراء رصيد',
    cred_bonus: 'مكافأة', cred_buy_now: 'اشتر الآن', cred_how: 'كيف تعمل الاعتمادات',
    fee_base: 'السعر الأساسي', fee_addon: 'رسومك الإضافية',
    fee_total: 'يدفع المتعلم', fee_platform: 'رسوم المنصة (5٪)',
    fee_you_earn: 'تكسب', fee_save: 'حفظ',
    payout_title: 'إعدادات الدفع', payout_schedule: 'جدول الدفع',
    payout_biweekly: 'كل أسبوعين (1 و15)', payout_monthly: 'شهري (اليوم 1)',
    payout_min: 'الحد الأدنى', payout_request: 'طلب دفع', payout_pending: 'دفع معلق',
  },
};
