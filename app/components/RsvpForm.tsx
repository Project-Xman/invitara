import { useState } from "react";
import { useSubmitRsvp } from "~/lib/queries";

interface Event {
  id: number;
  name: string;
  date: string | null;
  time: string | null;
  icon: string;
  color: string;
}

interface Props {
  invitationId: string;
  events: Event[];
}

export function RsvpForm({ invitationId, events }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState(1);
  const [eventsAttending, setEventsAttending] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const submit = useSubmitRsvp();

  const toggleEvent = (name: string) => {
    setEventsAttending((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    submit.mutate(
      {
        invitationId,
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        guests,
        eventsAttending,
        message: message.trim() || undefined,
      },
      {
        onSuccess: () => setSubmitted(true),
        onError: (err: any) => setError(err?.message ?? "Something went wrong. Please try again."),
      }
    );
  };

  if (submitted) {
    return (
      <div className="animate-fade-up rounded-2xl border border-gold-200/15 bg-white p-8 text-center shadow-card">
        <div className="mb-4 text-5xl">🎉</div>
        <h3 className="mb-2 font-display text-2xl font-bold">RSVP Received!</h3>
        <p className="text-sm opacity-50">
          Thank you, <span className="font-semibold opacity-80">{name}</span>! We've noted your
          response and can't wait to celebrate with you.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-up space-y-5 rounded-2xl border border-gold-200/15 bg-white p-8 shadow-card"
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
          Your Name <span className="text-gold-500">*</span>
        </label>
        <input
          className="input-gold"
          placeholder="e.g. Rahul & Priya Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Phone + Email */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
            Phone
          </label>
          <input
            className="input-gold"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
            Email
          </label>
          <input
            type="email"
            className="input-gold"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      {/* Guest count */}
      <div>
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
          Number of Guests
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            className="h-10 w-10 rounded-xl border border-gold-200/30 text-lg font-bold transition-colors hover:bg-gold-50"
          >
            −
          </button>
          <span className="w-8 text-center font-display text-2xl font-bold">{guests}</span>
          <button
            type="button"
            onClick={() => setGuests((g) => Math.min(20, g + 1))}
            className="h-10 w-10 rounded-xl border border-gold-200/30 text-lg font-bold transition-colors hover:bg-gold-50"
          >
            +
          </button>
          <span className="ml-1 text-xs opacity-35">{guests === 1 ? "person" : "people"}</span>
        </div>
      </div>

      {/* Events attending */}
      {events.length > 0 && (
        <div>
          <label className="mb-3 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
            Which events will you attend?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {events.map((ev) => {
              const selected = eventsAttending.includes(ev.name);
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => toggleEvent(ev.name)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    selected
                      ? "border-current text-white"
                      : "border-gold-200/25 bg-white hover:border-gold-400/40"
                  }`}
                  style={selected ? { background: ev.color, borderColor: ev.color } : {}}
                >
                  <span className="mb-1 block text-lg">{ev.icon}</span>
                  <span
                    className={`block text-[11px] font-semibold ${selected ? "text-white" : ""}`}
                  >
                    {ev.name}
                  </span>
                  {ev.date && (
                    <span
                      className={`mt-0.5 block text-[10px] ${selected ? "text-white/70" : "opacity-35"}`}
                    >
                      {ev.date}
                      {ev.time ? ` · ${ev.time}` : ""}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Message */}
      <div>
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
          Message (optional)
        </label>
        <textarea
          className="input-gold min-h-[80px] resize-y"
          placeholder="Leave a heartfelt message for the couple…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={submit.isPending}
        className="btn-gold w-full !py-3.5 disabled:opacity-50"
      >
        {submit.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Sending…
          </span>
        ) : (
          "✦ Confirm RSVP"
        )}
      </button>
    </form>
  );
}
