"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useIsMounted } from "@/hooks/use-is-mounted";

type MermaidProps = {
  chart: string;
  className?: string;
  /** Optional caption rendered under the diagram. */
  caption?: string;
  /**
   * Optional CSS width for the diagram itself, e.g. "50%". Omit to keep
   * mermaid's own sizing, which is what most diagrams should use.
   */
  width?: string;
};

/**
 * Renders a Mermaid diagram. Mermaid is imported dynamically so its bundle is
 * only fetched on pages that actually contain a diagram, and re-rendered when
 * the theme changes so the diagram matches light/dark.
 */
export function Mermaid({ chart, className, caption, width }: MermaidProps) {
  const mounted = useIsMounted();
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const renderId = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        const isDark = resolvedTheme === "dark";

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          fontFamily: "inherit",
          // Scale diagrams to the container width. Tall, narrow diagrams scale
          // up and read large; very wide ones get scaled down, so prefer a
          // top-to-bottom flow when a chart has many stages.
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            nodeSpacing: 45,
            rankSpacing: 65,
            padding: 14,
          },
          themeVariables: isDark
            ? {
                background: "transparent",
                fontSize: "16px",
                primaryColor: "#1f2937",
                primaryTextColor: "#e5e7eb",
                primaryBorderColor: "#4b5563",
                lineColor: "#6b7280",
                secondaryColor: "#111827",
                tertiaryColor: "#0b1220",
              }
            : {
                background: "transparent",
                fontSize: "16px",
                primaryColor: "#f3f4f6",
                primaryTextColor: "#111827",
                primaryBorderColor: "#d1d5db",
                lineColor: "#9ca3af",
                secondaryColor: "#ffffff",
                tertiaryColor: "#f9fafb",
              },
        });

        const { svg: rendered } = await mermaid.render(renderId, chart);

        // Only when an explicit width is requested: mermaid pins the SVG to its
        // natural width with an inline max-width, and inline styles beat CSS
        // classes, so strip that cap and let the diagram fill its wrapper.
        // Without `width`, mermaid's own sizing is left untouched.
        const sized = width
          ? rendered
              .replace(/max-width:\s*[\d.]+px/g, "max-width: 100%")
              .replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1 width="100%"')
              .replace(/<svg([^>]*?)\sheight="[^"]*"/, "<svg$1")
          : rendered;

        if (!cancelled) {
          setSvg(sized);
          setFailed(false);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, mounted, resolvedTheme, renderId, width]);

  if (failed) {
    return (
      <pre className="text-xs overflow-x-auto rounded-lg border p-3">
        {chart}
      </pre>
    );
  }

  return (
    <figure className={cn("my-6 not-prose", className)}>
      <div
        ref={containerRef}
        className="w-full overflow-x-auto rounded-lg border bg-muted/30 p-4"
      >
        <div
          className="mx-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
          style={width ? { width } : undefined}
          // Mermaid output is generated from trusted, repo-authored diagram
          // source with securityLevel "strict", which sanitises embedded HTML.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
