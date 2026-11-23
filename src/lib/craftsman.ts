export const STATUS_META = {
  new: { label: "طلب جديد", shortLabel: "جديد" },
  accepted: { label: "تم قبول الطلب", shortLabel: "مقبول" },
  on_way: { label: "الحرفي في الطريق", shortLabel: "في الطريق" },
  arrived: { label: "وصل الحرفي إلى الموقع", shortLabel: "وصل" },
  in_progress: { label: "جاري تنفيذ الخدمة", shortLabel: "قيد التنفيذ" },
  completed: { label: "تم إنهاء الخدمة", shortLabel: "مكتمل" },
  cancelled: { label: "تم رفض الطلب", shortLabel: "مرفوض" },
} as const;

export type JobStatus = keyof typeof STATUS_META;

export type ServiceRequest = {
  id: string;
  customer: string;
  initials: string;
  service: string;
  serviceIcon: string;
  commune: string;
  date: string;
  time: string;
  description: string;
  price: number;
  status: JobStatus;
  receivedAt: string;
};

export const NEXT_STATUS: Record<JobStatus, JobStatus | null> = {
  new: "accepted",
  accepted: "on_way",
  on_way: "arrived",
  arrived: "in_progress",
  in_progress: "completed",
  completed: null,
  cancelled: null,
};

export const NEXT_ACTION_LABEL: Partial<Record<JobStatus, string>> = {
  accepted: "أنا في الطريق",
  on_way: "تأكيد الوصول إلى الموقع",
  arrived: "بدء تنفيذ الخدمة",
  in_progress: "تم إنهاء الخدمة",
};

export const EXECUTION_STEPS: Array<{ status: JobStatus; label: string }> = [
  { status: "accepted", label: "قبول الطلب" },
  { status: "on_way", label: "الانطلاق نحو الزبون" },
  { status: "arrived", label: "الوصول إلى الموقع" },
  { status: "in_progress", label: "تنفيذ الخدمة" },
  { status: "completed", label: "إنهاء الخدمة" },
];

export function getNextJobStatus(status: JobStatus): JobStatus | null {
  return NEXT_STATUS[status];
}

export function isActiveJob(status: JobStatus): boolean {
  return ["accepted", "on_way", "arrived", "in_progress"].includes(status);
}

export function isJobStatus(value: unknown): value is JobStatus {
  return typeof value === "string" && value in STATUS_META;
}

export const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: "SL-1048",
    customer: "ياسين حمادي",
    initials: "ي ح",
    service: "سباكة",
    serviceIcon: "🚰",
    commune: "معسكر",
    date: "اليوم، 23 نوفمبر",
    time: "18:30",
    description: "تسريب ماء تحت حوض المطبخ، مع تغيير الأنبوب المتضرر إذا لزم الأمر.",
    price: 2500,
    status: "new",
    receivedAt: "منذ 8 دقائق",
  },
  {
    id: "SL-1047",
    customer: "نادية مرابط",
    initials: "ن م",
    service: "كهربائي",
    serviceIcon: "⚡",
    commune: "سيق",
    date: "غدًا، 24 نوفمبر",
    time: "10:00",
    description: "انقطاع متكرر للكهرباء في المطبخ وفحص لوحة التوزيع المنزلية.",
    price: 2000,
    status: "accepted",
    receivedAt: "منذ 35 دقيقة",
  },
  {
    id: "SL-1046",
    customer: "أحمد بوعلام",
    initials: "أ ب",
    service: "صيانة الأجهزة",
    serviceIcon: "🛠️",
    commune: "تيزي",
    date: "اليوم، 23 نوفمبر",
    time: "16:00",
    description: "الغسالة تتوقف قبل مرحلة العصر وتصدر صوتًا غير معتاد أثناء التشغيل.",
    price: 3000,
    status: "on_way",
    receivedAt: "منذ ساعتين",
  },
  {
    id: "SL-1045",
    customer: "خالد سعيدي",
    initials: "خ س",
    service: "التلحيم",
    serviceIcon: "🔥",
    commune: "غريس",
    date: "اليوم، 23 نوفمبر",
    time: "14:00",
    description: "إصلاح كسر في بوابة حديدية خارجية وتثبيت المفصل العلوي.",
    price: 3500,
    status: "in_progress",
    receivedAt: "منذ 4 ساعات",
  },
  {
    id: "SL-1044",
    customer: "فاطمة زروقي",
    initials: "ف ز",
    service: "الترصيص",
    serviceIcon: "🔧",
    commune: "المحمدية",
    date: "أمس، 22 نوفمبر",
    time: "09:00",
    description: "تركيب خلاط جديد لحوض الحمام والتأكد من عدم وجود أي تسريب.",
    price: 2800,
    status: "completed",
    receivedAt: "أمس",
  },
];
