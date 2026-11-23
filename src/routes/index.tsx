import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { COMMUNES, SERVICES } from "@/lib/sal7li";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "صلحلي Sal7Li — احجز حرفيًا موثوقًا في معسكر" },
      { name: "description", content: "احجز سباكًا أو كهربائيًا أو مصلح أجهزة في بلديات معسكر، مع دفع محمي وخدمة مضمونة." },
      { property: "og:title", content: "صلحلي Sal7Li" },
      { property: "og:description", content: "دفع محمي وخدمة مضمونة مع حرفيين موثوقين." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: App,
});

type Step = "login" | "signup" | "location" | "service" | "date" | "payment" | "chat" | "execution" | "rating" | "refunded" | "done";
type Msg = { from: "me" | "support"; text: string };

function Shell({ title, sub, back, children }: { title: string; sub?: string; back?: () => void; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-hero px-5 pb-8 pt-6 text-primary-foreground rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">صلحلي <span className="opacity-70 text-sm">Sal7Li</span></span>
          {back && <button onClick={back} className="text-sm opacity-80">رجوع ←</button>}
        </div>
        <h1 className="mt-5 text-2xl font-bold">{title}</h1>
        {sub && <p className="mt-1 text-sm opacity-80">{sub}</p>}
      </header>
      <main className="mx-auto max-w-md space-y-4 p-5">{children}</main>
    </div>
  );
}

function Guarantee() {
  return (
    <div className="rounded-2xl border border-success/40 bg-success/10 p-4 text-center" dir="ltr">
      <p className="font-bold text-success">🔒 Payment Protected</p>
      <p className="font-bold text-success">✅ Services Guaranteed</p>
    </div>
  );
}

function App() {
  const [step, setStep] = useState<Step>("login");
  const [user, setUser] = useState({ first: "", last: "", phone: "", email: "", pass: "", confirm: "" });
  const [login, setLogin] = useState({ email: "", pass: "" });
  const [err, setErr] = useState("");
  const [commune, setCommune] = useState("");
  const [q, setQ] = useState("");
  const [service, setService] = useState<(typeof SERVICES)[number] | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [method, setMethod] = useState<"baridimob" | "edahabia" | "">("");
  const [card, setCard] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "support", text: "مرحبًا! أنا خدمة العملاء. مبلغك محفوظ بأمان لدى صلحلي، وسنوجّه لك حرفيًا الآن." }]);
  const [draft, setDraft] = useState("");
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [progress, setProgress] = useState(0);

  const doLogin = () => {
    if (!/^\S+@\S+\.\S+$/.test(login.email) || login.pass.length < 6) return setErr("أدخل بريدًا صحيحًا وكلمة مرور من 6 أحرف على الأقل");
    setErr(""); setStep("location");
  };
  const doSignup = () => {
    if (!user.first || !user.last) return setErr("أدخل الاسم واللقب");
    if (!/^0[567]\d{8}$/.test(user.phone)) return setErr("رقم الهاتف غير صحيح (مثال: 0550123456)");
    if (!/^\S+@\S+\.\S+$/.test(user.email)) return setErr("البريد الإلكتروني غير صحيح");
    if (user.pass.length < 6) return setErr("كلمة المرور قصيرة");
    if (user.pass !== user.confirm) return setErr("كلمتا المرور غير متطابقتين");
    setErr(""); setStep("location");
  };
  const send = () => {
    if (!draft.trim()) return;
    setMsgs((m) => [...m, { from: "me", text: draft.trim() }, { from: "support", text: "شكرًا، تم استلام رسالتك. الحرفي في الطريق إليك." }]);
    setDraft("");
  };

  const today = new Date().toISOString().slice(0, 10);

  if (step === "login")
    return (
      <Shell title="تسجيل الدخول" sub="حرفيون موثوقون، دفع محمي">
        <input className="field" type="email" placeholder="البريد الإلكتروني" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
        <input className="field" type="password" placeholder="كلمة المرور" value={login.pass} onChange={(e) => setLogin({ ...login, pass: e.target.value })} />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button className="btn-main" onClick={doLogin}>دخول</button>
        <button className="w-full text-sm text-primary" onClick={() => { setErr(""); setStep("signup"); }}>ليس لديك حساب؟ إنشاء حساب</button>
        <div className="border-t pt-4 text-center">
          <Link to="/craftsman" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-secondary">
            هل أنت حرفي؟ افتح لوحة الطلبات ←
          </Link>
        </div>
      </Shell>
    );

  if (step === "signup")
    return (
      <Shell title="إنشاء حساب" back={() => setStep("login")}>
        <div className="grid grid-cols-2 gap-3">
          <input className="field" placeholder="الاسم" value={user.first} onChange={(e) => setUser({ ...user, first: e.target.value })} />
          <input className="field" placeholder="اللقب" value={user.last} onChange={(e) => setUser({ ...user, last: e.target.value })} />
        </div>
        <input className="field" type="tel" placeholder="رقم الهاتف" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
        <input className="field" type="email" placeholder="البريد الإلكتروني" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
        <input className="field" type="password" placeholder="كلمة المرور" value={user.pass} onChange={(e) => setUser({ ...user, pass: e.target.value })} />
        <input className="field" type="password" placeholder="تأكيد كلمة المرور" value={user.confirm} onChange={(e) => setUser({ ...user, confirm: e.target.value })} />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button className="btn-main" onClick={doSignup}>إنشاء الحساب</button>
      </Shell>
    );

  if (step === "location") {
    const list = COMMUNES.filter((c) => c.includes(q));
    return (
      <Shell title="📍 حدد موقعك" sub="اختر بلديتك من بلديات ولاية معسكر الـ47">
        <input className="field" placeholder="ابحث عن بلدية..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="grid max-h-[50vh] grid-cols-2 gap-2 overflow-y-auto">
          {list.map((c) => (
            <button key={c} onClick={() => setCommune(c)} className={`rounded-xl border p-3 text-sm ${commune === c ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{c}</button>
          ))}
        </div>
        <button className="btn-main" disabled={!commune} onClick={() => setStep("service")}>متابعة</button>
      </Shell>
    );
  }

  if (step === "service")
    return (
      <Shell title="🧰 اختر الخدمة" sub={`الموقع: ${commune}`} back={() => setStep("location")}>
        {SERVICES.map((s) => (
          <button key={s.id} onClick={() => setService(s)} className={`flex w-full items-center justify-between rounded-2xl border p-4 ${service?.id === s.id ? "border-primary bg-accent" : "bg-card"}`}>
            <span className="flex items-center gap-3 text-lg font-semibold"><span className="text-2xl">{s.icon}</span>{s.name}</span>
            <span className="text-sm text-muted-foreground">{s.price} دج</span>
          </button>
        ))}
        <button className="btn-main" disabled={!service} onClick={() => setStep("date")}>متابعة</button>
      </Shell>
    );

  if (step === "date")
    return (
      <Shell title="🗓️ موعد الخدمة" sub="حدد التاريخ والوقت المناسبين لك" back={() => setStep("service")}>
        <label className="block text-sm">التاريخ</label>
        <input className="field" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
        <label className="block text-sm">الوقت</label>
        <div className="grid grid-cols-3 gap-2">
          {["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map((t) => (
            <button key={t} onClick={() => setTime(t)} className={`rounded-xl border p-3 ${time === t ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{t}</button>
          ))}
        </div>
        <button className="btn-main" disabled={!date || !time} onClick={() => setStep("payment")}>متابعة إلى الدفع</button>
      </Shell>
    );

  if (step === "payment")
    return (
      <Shell title="💳 الدفع" sub="المبلغ يُحفظ بأمان ولا يُرسل للحرفي إلا بعد رضاك" back={() => setStep("date")}>
        <div className="rounded-2xl bg-card p-4 text-sm space-y-1 border">
          <p>الخدمة: <b>{service?.name}</b></p>
          <p>البلدية: <b>{commune}</b></p>
          <p>الموعد: <b>{date} — {time}</b></p>
          <p className="pt-2 text-lg">المبلغ: <b className="text-primary">{service?.price} دج</b></p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {([["baridimob", "بريدي موب", "📱"], ["edahabia", "البطاقة الذهبية", "💳"]] as const).map(([id, n, i]) => (
            <button key={id} onClick={() => setMethod(id)} className={`rounded-2xl border p-4 ${method === id ? "border-primary bg-accent" : "bg-card"}`}><div className="text-2xl">{i}</div>{n}</button>
          ))}
        </div>
        {method && <input className="field" dir="ltr" inputMode="numeric" placeholder={method === "edahabia" ? "رقم البطاقة (16 رقم)" : "رقم RIP"} value={card} onChange={(e) => setCard(e.target.value.replace(/\D/g, ""))} />}
        <Guarantee />
        <button className="btn-main" disabled={!method || card.length < 10} onClick={() => setStep("chat")}>ادفع {service?.price} دج بأمان</button>
      </Shell>
    );

  if (step === "chat")
    return (
      <Shell title="💬 خدمة العملاء" sub="تم الدفع ✅ المبلغ محفوظ في حساب الضمان">
        <div className="space-y-2 rounded-2xl border bg-card p-3 min-h-[40vh]">
          {msgs.map((m, i) => (
            <div key={i} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.from === "me" ? "mr-auto bg-primary text-primary-foreground" : "bg-muted"}`}>{m.text}</div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="field" placeholder="اكتب استفسارك أو تعليقك..." value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
          <button onClick={send} className="rounded-2xl bg-secondary px-4 text-secondary-foreground">إرسال</button>
        </div>
        <button className="btn-main" onClick={() => setStep("execution")}>متابعة تنفيذ الخدمة</button>
      </Shell>
    );

  if (step === "execution") {
    const stages = ["تم توجيه الحرفي", "الحرفي في الطريق إليك", "الحرفي وصل", "جاري التنفيذ", "تم الانتهاء"];
    return (
      <Shell title="🚚 تنفيذ الخدمة" sub={`${service?.name} — ${commune}`}>
        <div className="rounded-2xl border bg-card p-4">
          <p className="font-semibold">الحرفي: محمد ب. ⭐ 4.8</p>
          <ol className="mt-3 space-y-2">
            {stages.map((s, i) => (
              <li key={s} className={`flex items-center gap-2 text-sm ${i <= progress ? "text-success font-semibold" : "text-muted-foreground"}`}>{i <= progress ? "●" : "○"} {s}</li>
            ))}
          </ol>
          {progress < 4 && <button className="mt-3 text-sm text-primary" onClick={() => setProgress(progress + 1)}>تحديث الحالة ←</button>}
        </div>
        <Guarantee />
        <button className="btn-main" disabled={progress < 4} onClick={() => setStep("rating")}>راضٍ عن الخدمة — تحرير المبلغ للحرفي</button>
        <button className="w-full rounded-2xl border border-destructive p-3 text-destructive" onClick={() => setStep("refunded")}>الحرفي لم يحضر / تأخر — رفض الطلب واسترجاع المبلغ</button>
      </Shell>
    );
  }

  if (step === "refunded")
    return (
      <Shell title="↩️ تم رفض الطلب" sub="سيُعاد المبلغ إليك بأمان وبسرعة">
        <div className="rounded-2xl border bg-card p-5 text-center"><p className="text-3xl">💰</p><p className="mt-2">تم استرجاع <b>{service?.price} دج</b> إلى {method === "edahabia" ? "البطاقة الذهبية" : "بريدي موب"}.</p></div>
        <button className="btn-main" onClick={() => { setProgress(0); setStep("service"); }}>طلب خدمة جديدة</button>
      </Shell>
    );

  if (step === "rating")
    return (
      <Shell title="⭐ قيّم الخدمة" sub="تم إرسال المبلغ للحرفي بأمان">
        <div className="flex justify-center gap-2 text-4xl" dir="ltr">
          {[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setStars(n)} className={n <= stars ? "text-primary" : "text-muted-foreground"}>★</button>)}
        </div>
        <textarea className="field min-h-28" placeholder="اكتب تعليقك..." value={comment} onChange={(e) => setComment(e.target.value)} />
        <button className="btn-main" disabled={!stars} onClick={() => setStep("done")}>إرسال التقييم</button>
      </Shell>
    );

  return (
    <Shell title="🎉 شكرًا لك!" sub="تقييمك يساعدنا على بناء الثقة">
      <button className="btn-main" onClick={() => { setProgress(0); setStars(0); setComment(""); setStep("service"); }}>طلب خدمة أخرى</button>
    </Shell>
  );
}
