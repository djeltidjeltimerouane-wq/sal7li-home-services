import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  Hammer,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  Star,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  EXECUTION_STEPS,
  INITIAL_REQUESTS,
  NEXT_ACTION_LABEL,
  STATUS_META,
  getNextJobStatus,
  isActiveJob,
  isJobStatus,
  type JobStatus,
  type ServiceRequest,
} from "@/lib/craftsman";

export const Route = createFileRoute("/craftsman")({
  head: () => ({
    meta: [
      { title: "لوحة الحرفي — صلحلي Sal7Li" },
      {
        name: "description",
        content: "استعرض طلبات الزبائن، اقبل الطلبات الجديدة وحدّث مراحل تنفيذ الخدمة من لوحة الحرفي في صلحلي.",
      },
      { property: "og:title", content: "لوحة الحرفي — صلحلي Sal7Li" },
      {
        property: "og:description",
        content: "كل طلباتك ومراحل تنفيذها في مكان واحد واضح.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CraftsmanDashboard,
});

type Filter = "all" | "new" | "active" | "completed";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "كل الطلبات" },
  { id: "new", label: "الجديدة" },
  { id: "active", label: "الجارية" },
  { id: "completed", label: "المكتملة" },
];

const STATUS_STYLES: Record<JobStatus, string> = {
  new: "bg-primary/10 text-primary",
  accepted: "bg-secondary/10 text-secondary",
  on_way: "bg-secondary/10 text-secondary",
  arrived: "bg-secondary/10 text-secondary",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const STORAGE_KEY = "sal7li.craftsman.requests";

function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      {STATUS_META[status].shortLabel}
    </span>
  );
}

function RequestCard({
  request,
  selected,
  onSelect,
}: {
  request: ServiceRequest;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-2xl border bg-card p-4 text-right transition-colors hover:border-primary/50 ${
        selected ? "border-primary ring-1 ring-primary" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl" aria-hidden="true">
            {request.serviceIcon}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-card-foreground">{request.service}</h3>
              <span className="text-xs text-muted-foreground" dir="ltr">#{request.id}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{request.customer}</p>
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{request.commune}</span>
        <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{request.date}</span>
        <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{request.time}</span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <span className="text-sm font-bold text-foreground">{request.price.toLocaleString("ar-DZ")} دج</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
          عرض التفاصيل <ChevronLeft className="size-4" />
        </span>
      </div>
    </button>
  );
}

function RequestDetails({
  request,
  onUpdate,
  onClose,
}: {
  request: ServiceRequest;
  onUpdate: (status: JobStatus) => void;
  onClose?: () => void;
}) {
  const nextStatus = getNextJobStatus(request.status);
  const nextAction = NEXT_ACTION_LABEL[request.status];
  const currentStep = EXECUTION_STEPS.findIndex((step) => step.status === request.status);

  return (
    <div className="rounded-3xl border bg-card">
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <p className="text-xs text-muted-foreground">تفاصيل الطلب</p>
          <h2 className="mt-1 font-bold" dir="ltr">#{request.id}</h2>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={request.status} />
          {onClose && (
            <button type="button" onClick={onClose} aria-label="إغلاق تفاصيل الطلب" className="rounded-full border p-2 lg:hidden">
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-secondary font-bold text-secondary-foreground">
            {request.initials}
          </span>
          <div>
            <p className="text-xs text-muted-foreground">الزبون</p>
            <p className="font-semibold">{request.customer}</p>
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold"><Wrench className="size-4 text-primary" />وصف الخدمة</h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{request.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border p-3">
            <MapPin className="mb-2 size-4 text-primary" />
            <p className="text-xs text-muted-foreground">البلدية</p>
            <p className="mt-1 font-semibold">{request.commune}</p>
          </div>
          <div className="rounded-xl border p-3">
            <Clock3 className="mb-2 size-4 text-primary" />
            <p className="text-xs text-muted-foreground">الموعد</p>
            <p className="mt-1 font-semibold">{request.time}</p>
            <p className="mt-1 text-xs text-muted-foreground">{request.date}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><Navigation className="size-4 text-primary" />مسار التنفيذ</h3>
          <ol className="space-y-0">
            {EXECUTION_STEPS.map((step, index) => {
              const done = currentStep >= index;
              const active = currentStep === index;
              return (
                <li key={step.status} className="relative flex gap-3 pb-4 last:pb-0">
                  {index < EXECUTION_STEPS.length - 1 && <span className={`absolute right-[11px] top-6 h-full w-px ${done ? "bg-success" : "bg-border"}`} />}
                  <span className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border ${done ? "border-success bg-success text-primary-foreground" : "bg-card text-muted-foreground"}`}>
                    {done ? <Check className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
                  </span>
                  <div className="pt-0.5">
                    <p className={`text-sm ${active ? "font-bold text-foreground" : done ? "font-medium text-success" : "text-muted-foreground"}`}>{step.label}</p>
                    {active && <p className="mt-0.5 text-xs text-muted-foreground">المرحلة الحالية</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-success/10 p-4">
          <div className="flex items-center gap-2 text-success">
            <ShieldCheck className="size-5" />
            <div>
              <p className="text-xs">المبلغ المحمي</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {request.status === "completed" ? "بانتظار تأكيد الزبون" : "لا يُحرر إلا بعد رضا الزبون"}
              </p>
            </div>
          </div>
          <p className="font-bold text-success">{request.price.toLocaleString("ar-DZ")} دج</p>
        </div>

        {request.status === "new" && (
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button type="button" className="btn-main" onClick={() => onUpdate("accepted")}>
              <span className="flex items-center justify-center gap-2"><Check className="size-4" />قبول الطلب</span>
            </button>
            <button type="button" onClick={() => onUpdate("cancelled")} className="rounded-xl border border-destructive/40 px-4 text-sm font-semibold text-destructive">
              رفض
            </button>
          </div>
        )}

        {nextStatus && nextAction && (
          <button type="button" className="btn-main" onClick={() => onUpdate(nextStatus)}>
            <span className="flex items-center justify-center gap-2"><CheckCircle2 className="size-5" />{nextAction}</span>
          </button>
        )}

        {request.status === "completed" && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-success/40 p-3 text-sm font-semibold text-success">
            <CheckCircle2 className="size-5" />تم تحديث جميع مراحل التنفيذ
          </div>
        )}

        {request.status === "cancelled" && (
          <p className="rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">تم رفض هذا الطلب ولن يظهر ضمن الطلبات الجارية.</p>
        )}
      </div>
    </div>
  );
}

function CraftsmanDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>(() => INITIAL_REQUESTS.map((request) => ({ ...request })));
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(INITIAL_REQUESTS[0]?.id ?? "");
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const saved = JSON.parse(stored) as Array<{ id?: unknown; status?: unknown }>;
        if (Array.isArray(saved)) {
          const statuses = new Map<string, JobStatus>();
          for (const item of saved) {
            if (typeof item.id === "string" && isJobStatus(item.status)) statuses.set(item.id, item.status);
          }
          setRequests((current) => current.map((request) => ({ ...request, status: statuses.get(request.id) ?? request.status })));
        }
      }
    } catch {
      // Keep the demo requests available when browser storage is unavailable.
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests.map(({ id, status }) => ({ id, status }))));
    } catch {
      // Status changes still work for this visit when storage is unavailable.
    }
  }, [requests, storageReady]);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ar");
    return requests.filter((request) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "new" && request.status === "new") ||
        (filter === "active" && isActiveJob(request.status)) ||
        (filter === "completed" && request.status === "completed");
      const haystack = `${request.id} ${request.customer} ${request.service} ${request.commune}`.toLocaleLowerCase("ar");
      return matchesFilter && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [filter, query, requests]);

  const selectedRequest = filteredRequests.find((request) => request.id === selectedId) ?? filteredRequests[0];
  const newCount = requests.filter((request) => request.status === "new").length;
  const activeCount = requests.filter((request) => isActiveJob(request.status)).length;
  const completedCount = requests.filter((request) => request.status === "completed").length;

  const selectRequest = (id: string) => {
    setSelectedId(id);
    setShowMobileDetails(true);
  };

  const updateStatus = (id: string, status: JobStatus) => {
    setRequests((current) => current.map((request) => (request.id === id ? { ...request, status } : request)));
    setNotice(`تم تحديث الطلب ${id} إلى «${STATUS_META[status].label}».`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-hero pb-16 pt-5 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3" aria-label="العودة إلى صلحلي">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/15"><Hammer className="size-5" /></span>
              <span>
                <span className="block text-xl font-bold">صلحلي <span className="text-xs font-normal opacity-75">Sal7Li</span></span>
                <span className="block text-xs opacity-75">فضاء الحرفي</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="التنبيهات" onClick={() => setNotice(`لديك ${newCount} طلب جديد بانتظار المراجعة.`)} className="relative rounded-full bg-primary-foreground/10 p-2.5">
                <Bell className="size-5" />
                {newCount > 0 && <span className="absolute -left-1 -top-1 flex size-5 items-center justify-center rounded-full bg-card text-[10px] font-bold text-primary">{newCount}</span>}
              </button>
              <Link to="/" aria-label="العودة إلى واجهة الزبون" className="rounded-full bg-primary-foreground/10 p-2.5"><ArrowRight className="size-5" /></Link>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm opacity-80">مساء الخير، محمد 👋</p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">طلباتك وخدماتك في مكان واحد</h1>
              <p className="mt-2 text-sm opacity-80">تابع كل مرحلة وأبقِ الزبون على اطلاع.</p>
            </div>
            <div className="flex items-center gap-3 self-start rounded-2xl bg-primary-foreground/10 px-4 py-3 sm:self-auto">
              <span className="flex size-11 items-center justify-center rounded-full bg-primary-foreground/20"><UserRound className="size-5" /></span>
              <div>
                <p className="text-sm font-bold">محمد بن عيسى</p>
                <p className="mt-1 flex items-center gap-1 text-xs opacity-85"><Star className="size-3.5 fill-current" />4.8 · حرفي موثوق</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-8 max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mb-3 flex justify-end">
          <span className="rounded-full border bg-card px-3 py-1 text-[11px] text-muted-foreground">بيانات تجريبية للعرض</span>
        </div>
        <section aria-label="ملخص الطلبات" className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border bg-card p-3 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-xl bg-primary/10 p-2 text-primary"><ClipboardList className="size-5" /></span>
              <span className="text-2xl font-bold sm:text-3xl">{newCount}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground sm:text-sm">طلبات جديدة</p>
          </div>
          <div className="rounded-2xl border bg-card p-3 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-xl bg-secondary/10 p-2 text-secondary"><Navigation className="size-5" /></span>
              <span className="text-2xl font-bold sm:text-3xl">{activeCount}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground sm:text-sm">خدمات جارية</p>
          </div>
          <div className="rounded-2xl border bg-card p-3 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-xl bg-success/10 p-2 text-success"><CircleDollarSign className="size-5" /></span>
              <span className="text-2xl font-bold sm:text-3xl">{completedCount}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground sm:text-sm">خدمات مكتملة</p>
          </div>
        </section>

        {notice && (
          <div role="status" className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
            <span>{notice}</span>
            <button type="button" aria-label="إغلاق الرسالة" onClick={() => setNotice("")}><X className="size-4" /></button>
          </div>
        )}

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
          <section aria-labelledby="requests-title">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 id="requests-title" className="text-lg font-bold">الطلبات الموجهة إليك</h2>
                <p className="mt-1 text-xs text-muted-foreground">{filteredRequests.length} من {requests.length} طلبات</p>
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <label htmlFor="request-search" className="sr-only">ابحث في الطلبات</label>
              <input id="request-search" className="field pr-11" placeholder="ابحث بالزبون، الخدمة أو البلدية..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  aria-pressed={filter === item.id}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold ${filter === item.id ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-3">
              {filteredRequests.map((request) => (
                <RequestCard key={request.id} request={request} selected={selectedRequest?.id === request.id} onSelect={() => selectRequest(request.id)} />
              ))}
              {filteredRequests.length === 0 && (
                <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
                  <Search className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 font-semibold">لا توجد طلبات مطابقة</p>
                  <p className="mt-1 text-sm text-muted-foreground">جرّب بحثًا آخر أو اختر تصنيفًا مختلفًا.</p>
                </div>
              )}
            </div>
          </section>

          <aside className="sticky top-5 hidden lg:block" aria-label="تفاصيل الطلب المحدد">
            {selectedRequest ? (
              <RequestDetails request={selectedRequest} onUpdate={(status) => updateStatus(selectedRequest.id, status)} />
            ) : (
              <div className="rounded-3xl border bg-card p-10 text-center text-sm text-muted-foreground">اختر طلبًا لعرض تفاصيله.</div>
            )}
          </aside>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">نسخة تجريبية — أسماء الزبائن والطلبات والأسعار لأغراض العرض فقط.</p>
      </main>

      {showMobileDetails && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background p-4 lg:hidden">
          <RequestDetails request={selectedRequest} onUpdate={(status) => updateStatus(selectedRequest.id, status)} onClose={() => setShowMobileDetails(false)} />
        </div>
      )}
    </div>
  );
}
