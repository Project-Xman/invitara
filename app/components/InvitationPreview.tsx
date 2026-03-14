import { Suspense } from "react";
import { TEMPLATE_REGISTRY, DEFAULT_TEMPLATE_ID } from "./templates/registry";
import type { TemplateProps } from "./templates/shared/types";

export type {
  TemplateProps,
  InvitationData,
  WeddingEvent,
  TemplateColors,
} from "./templates/shared/types";

export function InvitationPreview(props: TemplateProps) {
  const TemplateComponent =
    TEMPLATE_REGISTRY[props.template.id] ?? TEMPLATE_REGISTRY[DEFAULT_TEMPLATE_ID];

  return (
    <Suspense fallback={<TemplateLoadingShell colors={props.template.colors} />}>
      <TemplateComponent {...props} />
    </Suspense>
  );
}

function TemplateLoadingShell({ colors }: { colors: TemplateProps["template"]["colors"] }) {
  return (
    <div style={{ background: colors.bg, minHeight: 460 }} className="animate-pulse">
      <div className="h-[460px] opacity-30" style={{ background: colors.accent }} />
      <div className="space-y-4 p-6">
        <div className="h-4 rounded" style={{ background: colors.accent, width: "60%" }} />
        <div className="h-4 rounded" style={{ background: colors.accent, width: "40%" }} />
        <div className="h-3 rounded" style={{ background: colors.accent, width: "80%" }} />
      </div>
    </div>
  );
}
