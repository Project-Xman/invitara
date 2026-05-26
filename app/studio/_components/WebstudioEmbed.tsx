'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink, Layers, AlertTriangle } from 'lucide-react';

interface WebstudioEmbedProps {
  webstudioUrl: string | null;
  templateId?: string | null;
}

export function WebstudioEmbed({ webstudioUrl, templateId }: WebstudioEmbedProps) {
  const targetUrl = templateId && webstudioUrl
    ? `${webstudioUrl}/projects?templateId=${encodeURIComponent(templateId)}`
    : webstudioUrl ?? null;

  if (!targetUrl) {
    return <WebstudioNotConfigured />;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex h-10 flex-shrink-0 items-center gap-3 border-b border-white/10 bg-neutral-900 px-4">
        <Link
          href="/admin/templates"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Admin
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Layers className="h-3.5 w-3.5" />
          <span>Webstudio</span>
          {templateId && (
            <>
              <span>/</span>
              <span className="text-white/70">{templateId}</span>
            </>
          )}
        </div>
        <div className="ml-auto">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in new tab
          </a>
        </div>
      </div>

      {/* Webstudio iframe — no sandbox needed: Webstudio is a trusted self-hosted service */}
      <iframe
        src={targetUrl}
        title="Webstudio"
        className="flex-1 w-full border-0"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}

function WebstudioNotConfigured() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20">
        <AlertTriangle className="h-8 w-8 text-amber-400" />
      </div>
      <div className="max-w-md">
        <h2 className="text-xl font-semibold text-white">Webstudio not configured</h2>
        <p className="mt-2 text-sm text-white/60">
          Set the{' '}
          <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs text-white/80">
            WEBSTUDIO_URL
          </code>{' '}
          environment variable to point to your self-hosted Webstudio instance.
        </p>
      </div>

      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-white/5 p-4 text-left">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">
          Quick setup with Docker
        </p>
        <ol className="space-y-2 text-sm text-white/70">
          <li className="flex gap-2">
            <span className="flex-shrink-0 font-mono text-amber-400">1.</span>
            Run{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white/80">
              docker compose up webstudio minio -d
            </code>{' '}
            from the project root
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 font-mono text-amber-400">2.</span>
            Add{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white/80">
              WEBSTUDIO_URL=http://localhost:5173
            </code>{' '}
            to your <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs text-white/80">.env</code>
          </li>
          <li className="flex gap-2">
            <span className="flex-shrink-0 font-mono text-amber-400">3.</span>
            Restart the dev server
          </li>
        </ol>
      </div>

      <div className="flex gap-3">
        <a
          href="https://docs.webstudio.is/self-hosting"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          Webstudio docs
        </a>
        <Link
          href="/admin/templates"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Link>
      </div>
    </div>
  );
}
