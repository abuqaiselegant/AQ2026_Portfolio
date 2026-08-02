import { projects } from "#site/content";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { ProjectBanner } from "@/components/sections/project-banner";
import { MDXContentRenderer } from "@/components/mdx/mdx-content-renderer";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";

type ProjectPageParams = {
  params: Promise<{
    slug: string;
  }>;
};

async function getProjectFromParam(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  return (
    projects.find(
      (project) => project.slugAsParams === decodeURIComponent(slug)
    ) ?? null
  );
}

export async function generateMetadata({
  params,
}: ProjectPageParams): Promise<Metadata> {
  const project = await getProjectFromParam(params);

  if (!project) {
    return {};
  }

  const ogUrl = new URL(`${siteConfig.origin}/api/og`);
  ogUrl.searchParams.set("title", project.title);

  return {
    title: `${project.title} | ${siteConfig.name}`,
    description: project.excerpt,
    keywords: [...project.tech, ...siteConfig.keywords, project.title],
    openGraph: {
      title: project.title,
      description: project.excerpt,
      type: "article",
      url: `${siteConfig.origin}/projects/${project.slugAsParams}`,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.excerpt,
      images: {
        url: ogUrl.toString(),
        width: 1200,
        height: 630,
        alt: project.title,
      },
    },
  };
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return projects.map((project) => ({
    slug: project.slugAsParams,
  }));
}

export default async function ProjectPage({ params }: ProjectPageParams) {
  const project = await getProjectFromParam(params);

  if (!project || project.published === false) {
    notFound();
  }

  const hasGithub = project.github && project.github !== "#";
  const hasLive = project.url && project.url !== "#";

  return (
    <article className="relative">
      <div className="absolute h-full w-10 -left-12 top-8">
        <Link href="/projects" className="sticky top-4" aria-label="Back to projects">
          <ArrowLeft className="size-4" />
        </Link>
      </div>

      <div className="mt-6">
        <ProjectBanner
          bannerLight={project.bannerLight}
          bannerDark={project.bannerDark}
          slugAsParams={project.slugAsParams}
          title={project.title}
        />
      </div>

      <header className="mt-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-semibold text-xl md:text-2xl tracking-tight">
            {project.title}
          </h1>

          {(hasGithub || hasLive) && (
            <div className="flex items-center gap-1 shrink-0 mt-1">
              {hasGithub && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.title} on GitHub`}
                  className="p-1 rounded hover:bg-muted transition-colors"
                >
                  <Github className="size-4" />
                </a>
              )}
              {hasLive && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.title} live site`}
                  className="p-1 rounded hover:bg-muted transition-colors"
                >
                  <ArrowUpRight className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
                </a>
              )}
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {project.excerpt}
        </p>

        {project.tech.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 mt-3">
            {project.tech.map((tech) => (
              <li
                key={tech}
                className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="prose prose-neutral dark:prose-invert max-w-none mt-6">
        <MDXContentRenderer code={project.body} />
      </div>
    </article>
  );
}
