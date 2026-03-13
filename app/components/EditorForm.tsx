import { useForm } from "@tanstack/react-form";
import { useState } from "react";

function Field({
  label,
  req,
  children,
}: {
  label: string;
  req?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
        {label}
        {req && <span className="ml-1 text-gold-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function CoupleForm({
  defaultValues,
  onSave,
}: {
  defaultValues: Record<string, string>;
  onSave: (v: Record<string, string>) => void;
}) {
  const form = useForm({ defaultValues, onSubmit: async ({ value }) => onSave(value) });
  const save = () => form.handleSubmit();
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
            <Field label={f.label} req={f.req}>
              <input
                className="input-gold"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={save}
                placeholder={f.ph}
              />
            </Field>
          )}
        </form.Field>
      ))}
      <form.Field name="message">
        {(field) => (
          <Field label="Couple's Message">
            <textarea
              className="input-gold min-h-[120px] resize-y"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={save}
              placeholder="A heartfelt message..."
            />
          </Field>
        )}
      </form.Field>
    </div>
  );
}

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
    if (!n.name.trim()) return;
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
        <p className="mb-3 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
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
        <p className="mb-3 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
          Add New Event
        </p>
        <div className="space-y-3">
          <input
            className="input-gold"
            placeholder="Event name"
            value={n.name}
            onChange={(e) => setN({ ...n, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              className="input-gold"
              placeholder="Date"
              value={n.date}
              onChange={(e) => setN({ ...n, date: e.target.value })}
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

export function DetailsForm({
  defaultValues,
  onSave,
}: {
  defaultValues: Record<string, string>;
  onSave: (v: Record<string, string>) => void;
}) {
  const form = useForm({ defaultValues, onSubmit: async ({ value }) => onSave(value) });
  const save = () => form.handleSubmit();
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
            <Field label={f.label}>
              <input
                type={f.type || "text"}
                className="input-gold"
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  if (f.type === "date") save();
                }}
                onBlur={save}
                placeholder={f.ph}
              />
            </Field>
          )}
        </form.Field>
      ))}
    </div>
  );
}
