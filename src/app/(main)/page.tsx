import { AsciiHeader } from "@/components/sections/ascii-header";
import { Intro } from "@/components/sections/intro";
import { About } from "@/components/sections/about";
import { Projects } from "@/components/sections/projects";
import { Publications } from "@/components/sections/publications";
import { RecentBlogs } from "@/components/sections/recent-blogs";
import { GithubContributions, GitmapSkeleton } from "@/components/github-contributions";
import { Suspense } from "react";
import { BookACall } from "@/components/sections/book-a-call";

export default function Home() {
  return (
    <>
      <AsciiHeader />
      <Intro />
      <About />
      <BookACall />
      <Suspense fallback={<GitmapSkeleton className="mt-7 mb-8" />}>
        <GithubContributions />
      </Suspense>
      <Projects />
      <Publications />
      <RecentBlogs />
    </>
  );
}
