import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
import type { Projects } from "#site/content";
import { cn } from "@/lib/utils";

type ProjectRowProps = Pick<
  Projects,
  "slugAsParams" | "title" | "excerpt" | "github" | "url"
>;

export function ProjectRow({
  slugAsParams,
  title,
  excerpt,
  github,
  url,
}: ProjectRowProps) {
  const hasGithub = github && github !== "#";
  const hasLive = url && url !== "#";

  return (
    <div
      className={cn(
        "relative p-2 bg-background rounded-lg group",
        "hover:bg-chart-2/15 dark:hover:bg-gitmap-ocean-3/25 transition-colors"
      )}
    >
      {/* Covers the whole row so the card is clickable, while the external
          links below sit above it and stay independently clickable. */}
      <Link
        href={`/projects/${slugAsParams}`}
        className="absolute inset-0 rounded-lg"
        aria-label={title}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-medium text-sm w-fit">{title}</span>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        </div>

        {(hasGithub || hasLive) && (
          <div className="relative z-10 flex items-center gap-1 shrink-0 sm:invisible sm:group-hover:visible">
            {hasGithub && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${title} on GitHub`}
                className="p-1 rounded hover:bg-background transition-colors"
              >
                <Github className="size-3.5" />
              </a>
            )}
            {hasLive && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${title} live site`}
                className="p-1 rounded hover:bg-background transition-colors"
              >
                <ArrowUpRight className="size-3.5 text-muted-foreground hover:text-foreground transition-colors" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
