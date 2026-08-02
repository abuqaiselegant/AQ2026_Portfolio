"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { motion, useSpring } from "motion/react";
import { cn } from "@/lib/utils";
import { useIsMounted } from "@/hooks/use-is-mounted";

interface TocEntry {
  items?: TocEntry[];
  url: string;
  title: string;
}

interface TocProps {
  toc: TocEntry[];
}

export function TableOfContents({ toc }: TocProps) {
  const mounted = useIsMounted();

  const itemIds = useMemo(
    () =>
      toc
        ? toc
            .flatMap((item) => [item.url, item?.items?.map((item) => item.url)])
            .flat()
            .filter(Boolean)
            .map((id) => id?.split("#")[1])
        : [],
    [toc]
  );
  const activeHeadings = useActiveItems(itemIds);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Map<string, HTMLElement>>(new Map());
  const [contentHeight, setContentHeight] = useState(0);
  
  const y1 = useSpring(0, {
    stiffness: 300,
    damping: 30,
    bounce: 0,
    duration: 0.3
  });
  
  const y2 = useSpring(0, {
    stiffness: 300,
    damping: 30,
    bounce: 0,
    duration: 0.3
  });
  
  useEffect(() => {
    if (!mounted) return;
    
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setContentHeight(entry.target.scrollHeight);
      });
    });
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }
    return () => observer.disconnect();
  }, [toc, mounted]);

  useEffect(() => {
    if (activeHeadings.length === 0 || !contentRef.current) return;

    const activeNodes = Array.from(nodesRef.current.entries())
      .filter(([id]) => activeHeadings.includes(id))
      .map(([id, element]) => {
        const rect = element.getBoundingClientRect();
        const contentRect = contentRef.current!.getBoundingClientRect();
        return {
          id,
          top: rect.top - contentRect.top,
          bottom: rect.top - contentRect.top + rect.height
        };
      })
      .sort((a, b) => a.top - b.top);

    if (activeNodes.length > 0) {
      const firstItem = activeNodes[0];
      y1.set(firstItem.top);
      
      const lastItem = activeNodes[activeNodes.length - 1];
      y2.set(lastItem.bottom);
    }
  }, [activeHeadings, y1, y2]);

  return mounted ? (
    <div className="space-y-4">
      <div className="relative" ref={contentRef}>
        <motion.svg
          className="absolute h-full w-2 overflow-visible z-10"
        >
          <path
            d={`M 1 0 L 1 ${contentHeight}`}
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
          />
          <motion.path
            id="progress"
            d={`M 1 0 L 1 ${contentHeight}`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="1.25"
            transition={{
              duration: 0.3,
              type: "spring",
              bounce: 0,
            }}
          />
          <defs>
            <motion.linearGradient
              id="gradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1}
              y2={y2}
            >
              <stop stopColor="var(--foreground)" stopOpacity="0"></stop>
              <stop stopColor="var(--foreground)"></stop>
              <stop offset="1" stopColor="var(--foreground)"></stop>
              <stop offset="1" stopColor="var(--foreground)" stopOpacity="0"></stop>
            </motion.linearGradient>
          </defs>
        </motion.svg>
        <Tree tree={toc} activeItems={activeHeadings} nodesRef={nodesRef} />
      </div>
    </div>
  ) : null;
}

function useActiveItems(itemIds: (string | undefined)[]) {
  const [activeIds, setActiveIds] = useState<string[]>([]);

  useEffect(() => {
    const updateActiveHeading = () => {
      const headingElements = itemIds
        .filter(Boolean)
        .map((id) => document.getElementById(id!))
        .filter(Boolean) as HTMLElement[];

      const headingsWithPositions = headingElements
        .map((element) => ({
          id: element.id,
          top: element.offsetTop,
          bottom: element.offsetTop + element.offsetHeight,
          element,
        }))
        .sort((a, b) => a.top - b.top);

      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const threshold = viewportHeight * 0.2;

      const visibleHeadings = headingsWithPositions
        .filter(({ top }) => top <= scrollY + threshold)
        .sort((a, b) => b.top - a.top);

      if (visibleHeadings.length > 0) {
        setActiveIds([visibleHeadings[0].id]);
      } else {
        setActiveIds([]);
      }
    };

    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading, { passive: true });

    updateActiveHeading();

    return () => {
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [itemIds]);

  return activeIds;
}

interface TreeProps {
  tree: TocEntry[];
  level?: number;
  activeItems?: string[];
  nodesRef: { current: Map<string, HTMLElement> };
}

function Tree({ tree, level = 1, activeItems = [], nodesRef }: TreeProps) {
  const getRelativeMargin = (itemLevel: number) => {
    switch (itemLevel) {
      case 1: return "pl-4"
      case 2: return "pl-8"
      case 3: return "pl-12"
      default: return "pl-4"
    }
  };

  return tree.length && level < 4 ? (
    <ul className="m-0 list-none text-[13px] relative mt-2">
      {tree.map((item, index) => {
        const id = item.url.split("#")[1] || item.url;
        const isActive = activeItems.includes(id);
        
        return (
          <li key={index} className="mt-0 relative">
            <div 
              className={cn("flex items-center gap-2", getRelativeMargin(level))}
              ref={(el) => {
                if (el) {
                  nodesRef.current.set(id, el);
                  el.setAttribute('data-level', level.toString());
                } else nodesRef.current.delete(id);
              }}
              data-level={level}
            >
              <a
                href={item.url}
                className={cn(
                  "inline-block no-underline px-1 py-1 rounded hover:text-foreground",
                  isActive ? "text-gray-975 dark:text-white" : "text-gray-500 dark:text-gray-400",
                  index === 0 && "pt-0",
                  index === tree.length - 1 && level === 1 && "pb-0"
                )}
              >
                {item.title}
              </a>
            </div>
            {item.items?.length ? (
              <Tree
                tree={item.items}
                level={level + 1}
                activeItems={activeItems}
                nodesRef={nodesRef}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  ) : null;
}

