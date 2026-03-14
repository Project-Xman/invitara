"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Pencil,
  X,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Plus,
  Minus,
  Crown,
  Check,
  Image,
  Calendar,
  Send,
  CreditCard,
  Award,
} from "lucide-react";

import {
  adminPlansQueryOptions,
  useUpdatePlan,
  useTogglePlanActive,
} from "~/lib/admin-queries";

// ━━━ TYPES ━━━

type AdminPlan = {
  id: string;
  name: string;
  price: number;
  showAds: boolean;
  credits: number;
  maxPublished: number;
  maxEvents: number;
  maxPhotos: number;
  badge: string;
  features: string[];
  sortOrder: number;
  active: boolean;
};

// ━━━ SKELETON CARDS ━━━

function SkeletonCards() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card p-5 shadow-card animate-pulse"
        >
          <div className="h-6 rounded bg-accent/40 w-1/2 mb-3" />
          <div className="h-10 rounded bg-accent/30 w-3/4 mb-4" />
          <div className="space-y-2 mb-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-4 rounded bg-accent/20 w-full" />
            ))}
          </div>
          <div className="h-10 rounded-xl bg-accent/30" />
        </div>
      ))}
    </>
  );
}

// ━━━ PLAN EDIT MODAL ━━━

function PlanEditModal({
  plan,
  open,
  onClose,
}: {
  plan: AdminPlan | null;
  open: boolean;
  onClose: () => void;
}) {
  const updatePlan = useUpdatePlan();

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [credits, setCredits] = useState(0);
  const [maxPublished, setMaxPublished] = useState(0);
  const [maxEvents, setMaxEvents] = useState(0);
  const [maxPhotos, setMaxPhotos] = useState(0);
  const [badge, setBadge] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setPrice(plan.price);
      setCredits(plan.credits);
      setMaxPublished(plan.maxPublished);
      setMaxEvents(plan.maxEvents);
      setMaxPhotos(plan.maxPhotos);
      setBadge(plan.badge ?? "");
      setFeatures([...(plan.features ?? [])]);
      setNewFeature("");
    }
  }, [plan, open]);

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setFeatures((prev) => [...prev, newFeature.trim()]);
    setNewFeature("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateFeature = (index: number, value: string) => {
    setFeatures((prev) => prev.map((f, i) => (i === index ? value : f)));
  };

  const handleSubmit = () => {
    if (!plan) return;
    updatePlan.mutate(
      {
        id: plan.id,
        name,
        price,
        credits,
        maxPublished,
        maxEvents,
        maxPhotos,
        badge,
        features,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              Edit Plan: {plan?.name}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-lg hover:bg-accent/50 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            {/* Name & Badge */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-gold w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Badge
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="input-gold w-full"
                  placeholder="e.g. Most Popular"
                />
              </div>
            </div>

            {/* Price & Credits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Price (INR)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="input-gold w-full"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Credits
                </label>
                <input
                  type="number"
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  className="input-gold w-full"
                  min={0}
                />
              </div>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Max Published
                </label>
                <input
                  type="number"
                  value={maxPublished}
                  onChange={(e) => setMaxPublished(Number(e.target.value))}
                  className="input-gold w-full"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Max Events
                </label>
                <input
                  type="number"
                  value={maxEvents}
                  onChange={(e) => setMaxEvents(Number(e.target.value))}
                  className="input-gold w-full"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Max Photos
                </label>
                <input
                  type="number"
                  value={maxPhotos}
                  onChange={(e) => setMaxPhotos(Number(e.target.value))}
                  className="input-gold w-full"
                  min={0}
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Features
              </label>
              <div className="space-y-2 mb-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleUpdateFeature(index, e.target.value)}
                      className="input-gold flex-1"
                    />
                    <button
                      onClick={() => handleRemoveFeature(index)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  className="input-gold flex-1"
                  placeholder="Add a feature..."
                />
                <button
                  onClick={handleAddFeature}
                  disabled={!newFeature.trim()}
                  className="p-1.5 rounded-lg hover:bg-green-500/10 text-muted-foreground hover:text-green-500 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name || updatePlan.isPending}
              className="btn-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatePlan.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ━━━ MAIN PAGE ━━━

export default function AdminPlansPage() {
  const { data: plans, isLoading } = useQuery(adminPlansQueryOptions());
  const toggleActive = useTogglePlanActive();

  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);

  const allPlans = (plans ?? []) as AdminPlan[];

  const STAT_ICONS: Record<string, typeof Crown> = {
    credits: CreditCard,
    maxPublished: Send,
    maxEvents: Calendar,
    maxPhotos: Image,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Plans</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage subscription plans and pricing
        </p>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading ? (
          <SkeletonCards />
        ) : allPlans.length === 0 ? (
          <div className="col-span-full text-center py-12 text-sm text-muted-foreground">
            No plans found.
          </div>
        ) : (
          allPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-lg relative ${
                !plan.active ? "opacity-60" : ""
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-lg">
                    <Award className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Name & Price */}
              <div className="text-center mb-5 pt-2">
                <h3 className="text-lg font-bold text-foreground capitalize">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price === 0 ? "Free" : `\u20B9${plan.price}`}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                {(
                  [
                    ["credits", "Credits", plan.credits],
                    ["maxPublished", "Published", plan.maxPublished],
                    ["maxEvents", "Events", plan.maxEvents],
                    ["maxPhotos", "Photos", plan.maxPhotos],
                  ] as const
                ).map(([key, label, value]) => {
                  const Icon = STAT_ICONS[key] ?? Crown;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </span>
                      <span className="font-medium text-foreground">{value}</span>
                    </div>
                  );
                })}
              </div>

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <div className="border-t border-border/50 pt-3 mb-4">
                  <ul className="space-y-1.5">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-center mb-4">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    plan.active
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {plan.active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingPlan(plan)}
                  className="btn-gold-outline flex-1 flex items-center justify-center gap-1.5 text-sm py-2"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => toggleActive.mutate({ id: plan.id })}
                  disabled={toggleActive.isPending}
                  className="p-2 rounded-xl border border-border hover:bg-accent/50 text-foreground transition-colors disabled:opacity-50"
                  title={plan.active ? "Deactivate" : "Activate"}
                >
                  {plan.active ? (
                    <ToggleRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <PlanEditModal
        plan={editingPlan}
        open={!!editingPlan}
        onClose={() => setEditingPlan(null)}
      />
    </div>
  );
}
