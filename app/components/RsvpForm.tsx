import { useState } from "react";
import { useSubmitRsvp } from "~/lib/queries";
import {
  PartyPopper,
  Minus,
  Plus,
  Loader2,
  Send,
  CheckCircle2,
} from "lucide-react";

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
      <div className="animate-fade-up rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 font-display text-2xl font-bold">RSVP Received!</h3>
        <p className="text-sm text-muted-foreground">
          Thank you, <span className="font-semibold text-foreground">{name}</span>! We've noted your
          response and can't wait to celebrate with you.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-up space-y-5 rounded-2xl border border-border bg-card p-8 shadow-card"
    >
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="rsvp-name" className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
          Your Name <span className="text-primary">*</span>
        </label>
        <input
          id="rsvp-name"
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
          <label htmlFor="rsvp-phone" className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
            Phone
          </label>
          <input
            id="rsvp-phone"
            className="input-gold"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="rsvp-email" className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
            Email
          </label>
          <input
            id="rsvp-email"
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
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
          Number of Guests
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-lg font-bold transition-colors hover:bg-accent"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-display text-2xl font-bold">{guests}</span>
          <button
            type="button"
            onClick={() => setGuests((g) => Math.min(20, g + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-lg font-bold transition-colors hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
          </button>
          <span className="ml-1 text-xs text-muted-foreground">{guests === 1 ? "person" : "people"}</span>
        </div>
      </div>

      {/* Events attending */}
      {events.length > 0 && (
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
            Which events will you attend?
          </p>
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
                      : "border-border bg-card hover:border-primary/40"
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
                      className={`mt-0.5 block text-[10px] ${selected ? "text-white/70" : "text-muted-foreground/50"}`}
                    >
                      {ev.date}
                      {ev.time ? ` \u00B7 ${ev.time}` : ""}
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
        <label htmlFor="rsvp-message" className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
          Message (optional)
        </label>
        <textarea
          id="rsvp-message"
          className="input-gold min-h-[80px] resize-y"
          placeholder="Leave a heartfelt message for the couple..."
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
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Send className="h-4 w-4" /> Confirm RSVP
          </span>
        )}
      </button>
    </form>
  );
}
