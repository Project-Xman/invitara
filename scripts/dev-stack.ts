/**
 * dev:stack — one command to bring the whole local environment up.
 *
 *   infra (postgres + minio + webstudio)  ->  migrate  ->  seed  ->  next dev
 *
 * Every host port is probed first and shifted upward if something else already
 * holds it, so this is safe to run alongside other projects' containers.
 * The chosen ports are written to .env.stack (gitignored) for reference.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { writeFileSync, readFileSync, existsSync, unlinkSync } from "node:fs";

const LOCK = ".dev-stack.lock";

/**
 * Two Next dev servers in one project share a single .next directory and
 * overwrite each other's Server Action manifests — the browser then posts an
 * action id the answering server has never heard of ("Server Action ... was not
 * found on the server"). Shifting the second server to a free port does not
 * help; it makes the collision quieter. Only one may run.
 */
function acquireLock() {
  if (existsSync(LOCK)) {
    const pid = Number(readFileSync(LOCK, "utf8").trim());
    let alive = false;
    try {
      process.kill(pid, 0); // signal 0 = existence check, does not kill
      alive = true;
    } catch {
      alive = false; // stale lock from a crashed run
    }
    if (alive) {
      console.error(
        `\n❌ dev:stack is already running (pid ${pid}).\n\n` +
          `   Two dev servers would share .next and break Server Actions.\n` +
          `   Stop the other one first (Ctrl-C in its terminal), or:\n` +
          `     kill ${pid}\n`,
      );
      process.exit(1);
    }
    unlinkSync(LOCK);
  }

  writeFileSync(LOCK, String(process.pid));
  const release = () => {
    try {
      unlinkSync(LOCK);
    } catch {}
  };
  process.on("exit", release);
  for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"] as const) {
    process.on(sig, () => {
      release();
      process.exit(130);
    });
  }
}

// Required — the dev server cannot come up without these.
const INFRA = ["postgres", "minio"] as const;

// Best-effort. The Webstudio image is not published publicly, so the pull may
// fail; /studio degrades to a setup message when WEBSTUDIO_URL is unset, so a
// failure here must not take the rest of the stack down with it.
const OPTIONAL_INFRA = ["webstudio"] as const;

// Services whose container healthcheck we block on before migrating.
const WAIT_FOR_HEALTHY = ["invitara-db", "invitara-minio"] as const;

const HEALTH_TIMEOUT_MS = 120_000;

type Ports = {
  POSTGRES_PORT: string;
  MINIO_PORT: string;
  MINIO_CONSOLE_PORT: string;
  WEBSTUDIO_PORT: string;
  APP_PORT: string;
};

function isFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const srv = createServer();
    srv.once("error", () => resolve(false));
    srv.once("listening", () => srv.close(() => resolve(true)));
    // 0.0.0.0 — a container publishing on all interfaces must also be caught.
    srv.listen(port, "0.0.0.0");
  });
}

/**
 * The host port an already-running Invitara container publishes for
 * `containerPort`, if any.
 *
 * Without this, a port we ourselves published on a previous run looks like a
 * conflict, so we'd shift one higher, recreate the container, and drift upward
 * on every single run. An existing container's port is ours — reuse it.
 */
async function existingPort(container: string, containerPort: number): Promise<number | null> {
  const out = await capture("docker", ["port", container, String(containerPort)]);
  const match = out.match(/:(\d+)\s*$/m); // "0.0.0.0:5433" -> 5433
  return match ? Number(match[1]) : null;
}

/**
 * Reuse our own container's port if it has one; otherwise take the first free
 * port at or above `start`.
 */
async function pickPort(
  name: string,
  start: number,
  taken: Set<number>,
  owned?: { container: string; containerPort: number },
): Promise<number> {
  if (owned) {
    const mine = await existingPort(owned.container, owned.containerPort);
    if (mine !== null) {
      taken.add(mine);
      console.log(`  ↺ ${name}: reusing ${mine} (already published by ${owned.container})`);
      return mine;
    }
  }

  for (let port = start; port < start + 100; port++) {
    if (taken.has(port)) continue;
    if (await isFree(port)) {
      taken.add(port);
      if (port !== start) {
        console.log(`  ⚠ ${name}: ${start} is in use → using ${port}`);
      }
      return port;
    }
  }
  throw new Error(`No free port for ${name} in range ${start}-${start + 100}`);
}

function run(cmd: string, args: string[], env: NodeJS.ProcessEnv = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      env: { ...process.env, ...env },
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`)),
    );
  });
}

function capture(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args);
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.on("error", () => resolve(""));
    child.on("exit", () => resolve(out.trim()));
  });
}

/** Block until each container reports healthy, or throw on timeout//unhealthy. */
async function waitForHealthy(containers: readonly string[]) {
  const deadline = Date.now() + HEALTH_TIMEOUT_MS;
  const pending = new Set(containers);

  while (pending.size > 0) {
    for (const name of [...pending]) {
      const status = await capture("docker", [
        "inspect",
        "-f",
        "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}",
        name,
      ]);

      if (status === "healthy" || status === "running") {
        console.log(`  ✓ ${name} healthy`);
        pending.delete(name);
      } else if (status === "exited" || status === "dead") {
        // Only a dead container is terminal. `unhealthy` is not: on first boot
        // postgres runs initdb for ~30s and can trip its own healthcheck before
        // recovering, so we keep polling until the deadline instead of bailing.
        throw new Error(`${name} is ${status}. Check: docker logs ${name}`);
      }
    }

    if (pending.size === 0) break;

    if (Date.now() > deadline) {
      throw new Error(
        `Timed out waiting for: ${[...pending].join(", ")}. Check: docker logs ${[...pending][0]}`,
      );
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

async function main() {
  acquireLock();

  // ─── 1. Pick non-conflicting host ports ───────────────────────────────────
  console.log("\n🔌 Resolving ports…");
  const taken = new Set<number>();
  const ports: Ports = {
    POSTGRES_PORT: String(
      await pickPort("postgres", 5432, taken, { container: "invitara-db", containerPort: 5432 }),
    ),
    MINIO_PORT: String(
      await pickPort("minio", 9000, taken, { container: "invitara-minio", containerPort: 9000 }),
    ),
    MINIO_CONSOLE_PORT: String(
      await pickPort("minio console", 9001, taken, {
        container: "invitara-minio",
        containerPort: 9001,
      }),
    ),
    WEBSTUDIO_PORT: String(
      await pickPort("webstudio", 5173, taken, {
        container: "invitara-webstudio",
        containerPort: 3000,
      }),
    ),
    APP_PORT: String(await pickPort("app", Number(process.env.PORT) || 3000, taken)),
  };

  // Point the app + drizzle at the *local* container, not whatever remote
  // DATABASE_URL happens to be sitting in .env — seeding a remote DB by
  // accident is exactly the failure this script exists to prevent.
  const databaseUrl = `postgresql://postgres:postgres@localhost:${ports.POSTGRES_PORT}/invitara`;

  const env: NodeJS.ProcessEnv = {
    ...ports,
    DATABASE_URL: databaseUrl,
    APP_URL: `http://localhost:${ports.APP_PORT}`,
    PORT: ports.APP_PORT,
  };

  // ─── 2. Infra up ──────────────────────────────────────────────────────────
  console.log("\n🐳 Starting infra (postgres, minio)…");
  await run("docker", ["compose", "up", "-d", ...INFRA], env);

  console.log("\n⏳ Waiting for health…");
  await waitForHealthy(WAIT_FOR_HEALTHY);

  // Optional: only expose WEBSTUDIO_URL to the app if the container really came up.
  let webstudioUp = false;
  try {
    console.log("\n🎨 Starting webstudio (optional)…");
    await run("docker", ["compose", "up", "-d", ...OPTIONAL_INFRA], env);
    webstudioUp = true;
    env.WEBSTUDIO_URL = `http://localhost:${ports.WEBSTUDIO_PORT}`;
  } catch {
    console.log(
      `  ⚠ could not pull the webstudio image from ghcr.io.\n` +
        `    ghcr.io currently refuses ALL repos from this network (even public ones),\n` +
        `    while Docker Hub works — so this is a network/ISP block, not a bad image.\n` +
        `    Try again on a VPN/hotspot. Skipping — /studio shows its setup message.`,
    );
  }

  writeFileSync(
    ".env.stack",
    `# Generated by \`bun run dev:stack\` — do not edit, do not commit.\n` +
      Object.entries(env)
        .map(([k, v]) => `${k}=${v}`)
        .join("\n") +
      "\n",
  );

  // ─── 3. Migrate + seed ────────────────────────────────────────────────────
  console.log("\n📦 Running migrations…");
  await run("bunx", ["drizzle-kit", "migrate"], env);

  console.log("\n🌱 Seeding…");
  await run("bun", ["run", "app/lib/seed.ts"], env);

  // Admin rights come from SUPERADMIN_EMAILS, so the seeded user must use the
  // same address the app will check against.
  const adminEmail =
    (process.env.SUPERADMIN_EMAILS ?? "").split(",")[0].trim() || "admin@example.com";
  const adminPassword = process.env.DEV_ADMIN_PASSWORD ?? "Admin@12345";

  await run("bun", ["run", "scripts/seed-admin.ts"], {
    ...env,
    SUPERADMIN_EMAILS: adminEmail,
    DEV_ADMIN_PASSWORD: adminPassword,
  });

  // ─── 4. Dev server (foreground — Ctrl-C stops it; infra keeps running) ────
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app        http://localhost:${ports.APP_PORT}
  admin      ${adminEmail} / ${adminPassword}   (log in at /login)
  minio      http://localhost:${ports.MINIO_CONSOLE_PORT}  (minioadmin / minioadmin)
  postgres   localhost:${ports.POSTGRES_PORT}
  webstudio  ${webstudioUp ? `http://localhost:${ports.WEBSTUDIO_PORT}` : "skipped (ghcr.io blocked on this network)"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Ctrl-C stops the dev server. Infra keeps running —
  stop it with: bun run dev:stack:down
`);

  await run("bunx", ["next", "dev", "--port", ports.APP_PORT], env);
}

main().catch((err) => {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});
