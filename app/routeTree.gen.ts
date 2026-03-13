/* eslint-disable */
// @ts-nocheck
import { Route as rootRoute } from "./routes/__root";
import { Route as IndexImport } from "./routes/index";
import { Route as EditorImport } from "./routes/editor";
import { Route as DashboardImport } from "./routes/dashboard";
import { Route as PreviewImport } from "./routes/preview";
import { Route as TemplatesImport } from "./routes/templates";
import { Route as PricingImport } from "./routes/pricing";
import { Route as AccountImport } from "./routes/account";
import { Route as LoginImport } from "./routes/auth/login";
import { Route as RegisterImport } from "./routes/auth/register";

const IndexRoute = IndexImport.update({ id: "/", path: "/", getParentRoute: () => rootRoute });
const EditorRoute = EditorImport.update({ id: "/editor", path: "/editor", getParentRoute: () => rootRoute });
const DashboardRoute = DashboardImport.update({ id: "/dashboard", path: "/dashboard", getParentRoute: () => rootRoute });
const PreviewRoute = PreviewImport.update({ id: "/preview", path: "/preview", getParentRoute: () => rootRoute });
const TemplatesRoute = TemplatesImport.update({ id: "/templates", path: "/templates", getParentRoute: () => rootRoute });
const PricingRoute = PricingImport.update({ id: "/pricing", path: "/pricing", getParentRoute: () => rootRoute });
const AccountRoute = AccountImport.update({ id: "/account", path: "/account", getParentRoute: () => rootRoute });
const LoginRoute = LoginImport.update({ id: "/auth/login", path: "/auth/login", getParentRoute: () => rootRoute });
const RegisterRoute = RegisterImport.update({ id: "/auth/register", path: "/auth/register", getParentRoute: () => rootRoute });

export const routeTree = rootRoute.addChildren([
  IndexRoute, EditorRoute, DashboardRoute, PreviewRoute,
  TemplatesRoute, PricingRoute, AccountRoute, LoginRoute, RegisterRoute,
]);
