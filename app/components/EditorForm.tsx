import { useForm } from "@tanstack/react-form";
import { useDebouncer } from "@tanstack/react-pacer";
import { useState } from "react";
import { z } from "zod";

function Field({
  label,
  req,
  error,
  children,
}: {
  label: string;
  req?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-gold-700 dark:text-gold-400">
        {label}
        {req && <span className="ml-1 text-gold-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-500/80">{error}</p>}
    </div>
  );
}

// ━━━ COUPLE FORM ━━━

const coupleSchema = z.object({
  groomName: z.string().min(1, "Groom's name is required").max(100, "Name too long"),
  brideName: z.string().min(1, "Bride's name is required").max(100, "Name too long"),
  groomFamily: z.string().max(200, "Too long").optional(),
  brideFamily: z.string().max(200, "Too long").optional(),
  blessingFrom: z.string().max(200, "Too long").optional(),
  mantra: z.string().max(200, "Too long").optional(),
  message: z.string().max(1000, "Message too long (max 1000 characters)").optional(),
});

export function CoupleForm({
  defaultValues,
  onSave,
}: {
  defaultValues: Record<string, string>;
  onSave: (v: Record<string, string>) => void;
}) {
  const form = useForm({
    defaultValues,
    validators: { onSubmit: coupleSchema },
    onSubmit: async ({ value }) => onSave(value),
  });

  const debouncer = useDebouncer(() => form.handleSubmit(), { wait: 800 });

  const fields = [
    { name: "groomName", label: "Groom's Name", req: true, ph: "Groom's name" },
    { name: "brideName", label: "Bride's Name", req: true, ph: "Bride's name" },
    { name: "groomFamily", label: "Groom's Family", ph: "Mrs. Reena & Mr. Rajiv Kapoor" },
    { name: "brideFamily", label: "Bride's Family", ph: "Mrs. Shalini & Mr. Aakash Mittal" },
    { name: "blessingFrom", label: "Blessings From", ph: "Smt. Lata Devi & Sm. Kamal Kapoor" },
    { name: "mantra", label: "Sacred Mantra", ph: "ॐ श्री गणेशाय नमः" },
  ] as { name: string; label: string; req?: boolean; ph: string }[];

  return (
    <div className="space-y-5">
      {fields.map((f) => (
        <form.Field key={f.name} name={f.name}>
          {(field) => (
            <Field
              label={f.label}
              req={f.req}
              error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
            >
              <input
                className="input-gold"
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  debouncer.maybeExecute();
                }}
                onBlur={() => {
                  field.handleBlur();
                  debouncer.flush();
                }}
                placeholder={f.ph}
              />
            </Field>
          )}
        </form.Field>
      ))}
      <form.Field name="message">
        {(field) => (
          <Field
            label="Couple's Message"
            error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
          >
            <textarea
              className="input-gold min-h-[120px] resize-y"
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value);
                debouncer.maybeExecute();
              }}
              onBlur={() => {
                field.handleBlur();
                debouncer.flush();
              }}
              placeholder="A heartfelt message..."
            />
          </Field>
        )}
      </form.Field>
    </div>
  );
}

// ━━━ EVENTS FORM ━━━

interface Ev {
  id: number;
  name: string;
  date: string | null;
  venue: string | null;
  time: string | null;
  icon: string;
  color: string;
}

export function EventsForm({
  events,
  onAdd,
  onRemove,
}: {
  events: Ev[];
  onAdd: (e: any) => void;
  onRemove: (id: number) => void;
}) {
  const [n, setN] = useState({ name: "", date: "", venue: "", time: "" });
  const [addError, setAddError] = useState<string | null>(null);

  const icons = ["🌿", "💛", "🎶", "🥂", "💍", "🎉", "🎊", "🪔", "✨", "💐"];
  const colors = [
    "#4D6B3A",
    "#D4A853",
    "#7A6AAB",
    "#A67C2E",
    "#C73866",
    "#7A5A1E",
    "#8B1A1A",
    "#B85C1A",
    "#1A4A3A",
    "#4A3A6B",
  ];

  const add = () => {
    if (!n.name.trim()) {
      setAddError("Event name is required");
      return;
    }
    if (n.date && !/^\d{4}-\d{2}-\d{2}$/.test(n.date)) {
      setAddError("Date must be in YYYY-MM-DD format");
      return;
    }
    setAddError(null);
    onAdd({
      name: n.name,
      date: n.date || "TBD",
      venue: n.venue || "TBD",
      time: n.time || "TBD",
      icon: icons[events.length % icons.length],
      color: colors[events.length % colors.length],
    });
    setN({ name: "", date: "", venue: "", time: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 block text-[10px] font-semibold uppercase tracking-[2px] text-gold-700 dark:text-gold-400">
          Your Events ({events.length})
        </p>
        <div className="space-y-2">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="group flex items-center gap-3 rounded-xl border border-gold-200/15 bg-cream-100/40 p-3"
            >
              <span className="text-lg">{ev.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{ev.name}</p>
                <p className="truncate text-[11px] opacity-35">
                  {ev.date} · {ev.venue}
                </p>
              </div>
              <button
                onClick={() => onRemove(ev.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-sm text-red-400/60 opacity-0 transition-all hover:bg-red-50 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="border-gold-200/12 border-t pt-5">
        <p className="mb-3 block text-[10px] font-semibold uppercase tracking-[2px] text-gold-700 dark:text-gold-400">
          Add New Event
        </p>
        <div className="space-y-3">
          <input
            className="input-gold"
            placeholder="Event name *"
            value={n.name}
            onChange={(e) => {
              setN({ ...n, name: e.target.value });
              if (addError) setAddError(null);
            }}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              className="input-gold"
              placeholder="Date (YYYY-MM-DD)"
              value={n.date}
              onChange={(e) => {
                setN({ ...n, date: e.target.value });
                if (addError) setAddError(null);
              }}
            />
            <input
              className="input-gold"
              placeholder="Time"
              value={n.time}
              onChange={(e) => setN({ ...n, time: e.target.value })}
            />
          </div>
          <input
            className="input-gold"
            placeholder="Venue"
            value={n.venue}
            onChange={(e) => setN({ ...n, venue: e.target.value })}
          />
          {addError && <p className="text-[11px] text-red-500/80">{addError}</p>}
          <button
            onClick={add}
            disabled={!n.name.trim()}
            className="btn-gold w-full !py-3 disabled:opacity-25"
          >
            + Add Event
          </button>
        </div>
      </div>
    </div>
  );
}

// ━━━ DETAILS FORM ━━━

const detailsSchema = z.object({
  weddingDate: z.string().optional(),
  venue: z.string().max(300, "Too long").optional(),
  mapLink: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.startsWith("https://") || v.startsWith("http://"),
      "Must be a valid URL starting with https://"
    ),
  whatsappNumber: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\+?[\d\s\-()]{7,20}$/.test(v),
      "Must be a valid phone number"
    ),
  instagramLink: z
    .string()
    .optional()
    .refine(
      (v) =>
        !v ||
        v.startsWith("https://instagram.com") ||
        v.startsWith("https://www.instagram.com"),
      "Must be a valid Instagram URL"
    ),
  hashtag: z
    .string()
    .max(50, "Too long")
    .optional()
    .refine((v) => !v || v.startsWith("#"), "Hashtag must start with #"),
});

export function DetailsForm({
  defaultValues,
  onSave,
}: {
  defaultValues: Record<string, string>;
  onSave: (v: Record<string, string>) => void;
}) {
  const form = useForm({
    defaultValues,
    validators: { onSubmit: detailsSchema },
    onSubmit: async ({ value }) => onSave(value),
  });

  const debouncer = useDebouncer(() => form.handleSubmit(), { wait: 800 });

  const fields = [
    { name: "weddingDate", label: "Wedding Date", type: "date", ph: "" },
    { name: "venue", label: "Main Venue", ph: "Taj Exotica Resort, Goa" },
    { name: "mapLink", label: "Google Maps Link", ph: "https://maps.google.com/..." },
    { name: "whatsappNumber", label: "WhatsApp Number", ph: "+91 98765 43210" },
    { name: "instagramLink", label: "Instagram", ph: "https://instagram.com/..." },
    { name: "hashtag", label: "Hashtag", ph: "#AbhishekWedsKanika" },
  ] as { name: string; label: string; type?: string; ph: string }[];

  return (
    <div className="space-y-5">
      {fields.map((f) => (
        <form.Field key={f.name} name={f.name}>
          {(field) => (
            <Field
              label={f.label}
              error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
            >
              <input
                type={f.type || "text"}
                className="input-gold"
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  debouncer.maybeExecute();
                }}
                onBlur={() => {
                  field.handleBlur();
                  debouncer.flush();
                }}
                placeholder={f.ph}
              />
            </Field>
          )}
        </form.Field>
      ))}
    </div>
  );
}
