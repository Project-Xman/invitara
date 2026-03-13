import { lazy, type ComponentType } from "react";
import type { TemplateProps } from "./shared/types";

const CityTemplate = lazy(() => import("./CityTemplate"));
const BeachTemplate = lazy(() => import("./BeachTemplate"));
const MountainTemplate = lazy(() => import("./MountainTemplate"));
const MeenayaTemplate = lazy(() => import("./MeenayaTemplate"));
const LaavanTemplate = lazy(() => import("./LaavanTemplate"));
const RaabtaTemplate = lazy(() => import("./RaabtaTemplate"));
const WhimsicalTemplate = lazy(() => import("./WhimsicalTemplate"));
const CityMinimalTemplate = lazy(() => import("./CityMinimalTemplate"));

export const TEMPLATE_REGISTRY: Record<string, ComponentType<TemplateProps>> = {
  city: CityTemplate,
  beach: BeachTemplate,
  mountain: MountainTemplate,
  meenaya: MeenayaTemplate,
  anand: LaavanTemplate,
  nikah: RaabtaTemplate,
  whimsical: WhimsicalTemplate,
  city2: CityMinimalTemplate,
};

export const DEFAULT_TEMPLATE_ID = "beach";
