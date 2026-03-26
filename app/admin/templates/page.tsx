"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import {
  Plus,
  Pencil,
  X,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Gift,
  Layers,
} from "lucide-react";

import {
  adminTemplatesQueryOptions,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from "~/lib/admin-queries";

// ━━━ TYPES ━━━

type TemplateColors = {
  primary: string;
  secondary: string;
  bg: string;
  accent: string;
  text: string;
  card: string;
};

type AdminTemplate = {
  id: string;
  name: string;
  category: string;
  price: number;
  emoji: string;
  description: string;
  gradient: string;
  colors: TemplateColors;
  isFree: boolean;
  isPremium: boolean;
  sortOrder: number;
  active: boolean;
};

const CATEGORIES = [
  "Hindu Weddings",
  "Christian Weddings",
  "Sikh Weddings",
  "Muslim Weddings",
  "South-Indian Weddings",
  "Save the Date",
] as const;

const DEFAULT_COLORS: TemplateColors = {
  primary: "#d4a574",
  secondary: "#b8860b",
  bg: "#1a1a2e",
  accent: "#e6c99a",
  text: "#ffffff",
  card: "#2a2a4e",
};

const COLOR_LABELS: Record<keyof TemplateColors, string> = {
  primary: "Primary",
  secondary: "Secondary",
  bg: "Background",
  accent: "Accent",
  text: "Text",
  card: "Card",
};

// ━━━ SKELETON CARDS ━━━

function SkeletonCards() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card p-5 shadow-card animate-pulse"
        >
          <div className="h-40 rounded-xl bg-accent/30 mb-4" />
          <div className="h-5 rounded bg-accent/40 w-3/4 mb-2" />
          <div className="h-4 rounded bg-accent/30 w-1/2 mb-3" />
          <div className="flex gap-2">
            <div className="h-6 rounded-full bg-accent/30 w-16" />
            <div className="h-6 rounded-full bg-accent/30 w-16" />
          </div>
        </div>
      ))}
    </>
  );
}

// ━━━ TEMPLATE FORM MODAL ━━━

function TemplateFormModal({
  template,
  open,
  onClose,
}: {
  template: AdminTemplate | null; // null = create mode
  open: boolean;
  onClose: () => void;
}) {
  const isEdit = !!template;
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [price, setPrice] = useState(0);
  const [emoji, setEmoji] = useState("");
  const [description, setDescription] = useState("");
  const [gradient, setGradient] = useState("linear-gradient(135deg, #667eea 0%, #764ba2 100%)");
  const [colors, setColors] = useState<TemplateColors>({ ...DEFAULT_COLORS });
  const [isFree, setIsFree] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  // Reset form when template changes
  useEffect(() => {
    if (template) {
      setId(template.id);
      setName(template.name);
      setCategory(template.category);
      setPrice(template.price);
      setEmoji(template.emoji);
      setDescription(template.description);
      setGradient(template.gradient);
      setColors(template.colors ?? { ...DEFAULT_COLORS });
      setIsFree(template.isFree);
      setIsPremium(template.isPremium);
      setSortOrder(template.sortOrder);
    } else {
      setId("");
      setName("");
      setCategory(CATEGORIES[0]);
      setPrice(0);
      setEmoji("");
      setDescription("");
      setGradient("linear-gradient(135deg, #667eea 0%, #764ba2 100%)");
      setColors({ ...DEFAULT_COLORS });
      setIsFree(false);
      setIsPremium(false);
      setSortOrder(0);
    }
  }, [template, open]);

  // Auto-slug from name (create only)
  useEffect(() => {
    if (!isEdit && name) {
      setId(
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  }, [name, isEdit]);

  const handleColorChange = (key: keyof TemplateColors, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const payload = {
      id,
      name,
      category,
      price,
      emoji,
      description,
      gradient,
      colors,
      isFree,
      isPremium,
      sortOrder,
    };

    if (isEdit) {
      updateTemplate.mutate(payload, { onSuccess: onClose });
    } else {
      createTemplate.mutate(payload, { onSuccess: onClose });
    }
  };

  const isPending = createTemplate.isPending || updateTemplate.isPending;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {isEdit ? "Edit Template" : "Add New Template"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-lg hover:bg-accent/50 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            {/* ID */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                ID (slug)
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                readOnly={isEdit}
                className={`input-gold w-full ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="auto-generated-from-name"
              />
            </div>

            {/* Name & Category */}
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
                  placeholder="Royal Gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-gold w-full appearance-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price & Emoji */}
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
                  Emoji
                </label>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="input-gold w-full"
                  placeholder="crown"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="input-gold w-full resize-none"
                placeholder="A royal gold-themed wedding template..."
              />
            </div>

            {/* Gradient with preview */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Gradient
              </label>
              <input
                type="text"
                value={gradient}
                onChange={(e) => setGradient(e.target.value)}
                className="input-gold w-full mb-2"
                placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              />
              <div
                className="h-16 rounded-xl border border-border"
                style={{ background: gradient }}
              />
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Colors
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(COLOR_LABELS) as (keyof TemplateColors)[]).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colors[key]}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{COLOR_LABELS[key]}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{colors[key]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Toggles & Sort */}
            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary/50 w-4 h-4"
                />
                Free
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary/50 w-4 h-4"
                />
                Premium
              </label>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="input-gold w-full"
                />
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
              disabled={!id || !name || !description || !emoji || isPending}
              className="btn-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Template"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ━━━ MAIN PAGE ━━━

export default function AdminTemplatesPage() {
  const { data: templates, isLoading } = useQuery(adminTemplatesQueryOptions());
  const deleteTemplate = useDeleteTemplate();
  const updateTemplate = useUpdateTemplate();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AdminTemplate | null>(null);

  const handleEdit = (template: AdminTemplate) => {
    setEditingTemplate(template);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingTemplate(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingTemplate(null);
  };

  const handleToggleActive = (template: AdminTemplate) => {
    if (template.active) {
      // Deactivate via deleteTemplate (soft delete)
      deleteTemplate.mutate({ id: template.id });
    } else {
      // Reactivate via updateTemplate
      updateTemplate.mutate({ id: template.id, active: true });
    }
  };

  const allTemplates = (templates ?? []) as AdminTemplate[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage wedding invitation templates
          </p>
        </div>
        <button onClick={handleAdd} className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Template
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <SkeletonCards />
        ) : allTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12 text-sm text-muted-foreground">
            No templates found. Create your first template.
          </div>
        ) : (
          allTemplates.map((template) => (
            <div
              key={template.id}
              className={`rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-lg ${
                !template.active ? "opacity-60" : ""
              }`}
            >
              {/* Gradient Preview */}
              <div
                className="h-40 rounded-xl mb-4 flex items-center justify-center"
                style={{ background: template.gradient }}
              >
                <span className="text-4xl">{template.emoji}</span>
              </div>

              {/* Info */}
              <div className="mb-3">
                <h3 className="text-base font-semibold text-foreground">{template.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{template.category}</p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {template.price === 0 ? "Free" : `\u20B9${template.price}`}
                </span>
                {template.isFree && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                    <Gift className="w-3 h-3" />
                    Free
                  </span>
                )}
                {template.isPremium && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Sparkles className="w-3 h-3" />
                    Premium
                  </span>
                )}
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    template.active
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {template.active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(template)}
                  className="btn-gold-outline flex-1 flex items-center justify-center gap-1.5 text-sm py-2"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <Link
                  href={`/studio?templateId=${encodeURIComponent(template.id)}`}
                  className="btn-gold-outline flex items-center justify-center gap-1.5 text-sm py-2 px-3"
                  title="Design in Webstudio"
                >
                  <Layers className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => handleToggleActive(template)}
                  disabled={deleteTemplate.isPending || updateTemplate.isPending}
                  className="p-2 rounded-xl border border-border hover:bg-accent/50 text-foreground transition-colors disabled:opacity-50"
                  title={template.active ? "Deactivate" : "Activate"}
                >
                  {template.active ? (
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

      {/* Form Modal */}
      <TemplateFormModal
        template={editingTemplate}
        open={formOpen}
        onClose={handleCloseForm}
      />
    </div>
  );
}
