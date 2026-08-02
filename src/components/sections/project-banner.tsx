import Image from "next/image";
import type { Projects } from "#site/content";

const BANNER_OVERLAYS: Record<string, { light: string; dark: string }> = {
  "flex-living-reviews": {
    light: "linear-gradient(135deg, rgba(14,165,233,0.22) 0%, transparent 50%)",
    dark: "linear-gradient(135deg, rgba(56,189,248,0.18) 0%, transparent 50%)",
  },
  wizardocs: {
    light: "linear-gradient(135deg, rgba(201,154,58,0.22) 0%, transparent 50%)",
    dark: "linear-gradient(135deg, rgba(212,168,67,0.18) 0%, transparent 50%)",
  },
};

const DEFAULT_OVERLAY = { light: "transparent", dark: "transparent" };

const FADE_MASK =
  "linear-gradient(#000 0%, rgba(0,0,0,.99) 18.5%, rgba(0,0,0,.953) 34.3%, rgba(0,0,0,.894) 47.6%, rgba(0,0,0,.824) 58.5%, rgba(0,0,0,.74) 67.5%, rgba(0,0,0,.647) 74.7%, rgba(0,0,0,.55) 80.3%, rgba(0,0,0,.45) 84.7%, rgba(0,0,0,.353) 88%, rgba(0,0,0,.26) 90.5%, rgba(0,0,0,.176) 92.5%, rgba(0,0,0,.106) 94.2%, rgba(0,0,0,.047) 95.9%, rgba(0,0,0,.01) 97.7%, transparent 100%)";

type ProjectBannerProps = Pick<
  Projects,
  "bannerLight" | "bannerDark" | "slugAsParams" | "title"
>;

export function ProjectBanner({
  bannerLight,
  bannerDark,
  slugAsParams,
  title,
}: ProjectBannerProps) {
  const overlay = BANNER_OVERLAYS[slugAsParams] ?? DEFAULT_OVERLAY;

  return (
    <div
      className="aspect-3/1 bg-muted w-full relative shrink-0 overflow-hidden rounded-lg"
      style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
    >
      <Image
        src={bannerLight}
        alt={`${title} banner`}
        width={1500}
        height={500}
        className="object-cover object-top w-full h-full dark:hidden"
        priority
      />
      <Image
        src={bannerDark}
        alt={`${title} banner`}
        width={1500}
        height={500}
        className="object-cover object-top w-full h-full hidden dark:block"
        priority
      />
      <div
        className="absolute inset-0 pointer-events-none dark:hidden"
        style={{ background: overlay.light }}
        aria-hidden
      />
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{ background: overlay.dark }}
        aria-hidden
      />
    </div>
  );
}
