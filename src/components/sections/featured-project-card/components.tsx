"use client";

import type { Projects } from "#site/content";
import { MDXContentRenderer } from "@/components/mdx/mdx-content-renderer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowUpRight, Github, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ChatContext,
  ProjectCardContext,
  useChat,
  useProjectCard,
} from "./context";
import type { ChatMessage } from "./use-chat";
import { ProjectContext, useChat as useChatHook } from "./use-chat";

const springTransition = { type: "spring", bounce: 0, duration: 0.3 } as const;

/** Aesthetic banner overlay per project — subtle gradient tint */
const BANNER_OVERLAYS: Record<string, { light: string; dark: string }> = {
  "taskops": {
    light: "linear-gradient(135deg, rgba(251,191,36,0.25) 0%, transparent 50%)",
    dark: "linear-gradient(135deg, rgba(245,158,11,0.2) 0%, transparent 50%)",
  },
  "ml-tracking-app": {
    light: "linear-gradient(135deg, rgba(59,130,246,0.22) 0%, transparent 50%)",
    dark: "linear-gradient(135deg, rgba(96,165,250,0.18) 0%, transparent 50%)",
  },
  "ai-trading-stock-prediction": {
    light: "linear-gradient(135deg, rgba(34,197,94,0.24) 0%, transparent 50%)",
    dark: "linear-gradient(135deg, rgba(74,222,128,0.18) 0%, transparent 50%)",
  },
  "agentic-ai-financial-insights": {
    light: "linear-gradient(135deg, rgba(139,92,246,0.24) 0%, transparent 50%)",
    dark: "linear-gradient(135deg, rgba(167,139,250,0.2) 0%, transparent 50%)",
  },
  "llm-sentiment-analysis": {
    light: "linear-gradient(135deg, rgba(236,72,153,0.22) 0%, transparent 50%)",
    dark: "linear-gradient(135deg, rgba(244,114,182,0.18) 0%, transparent 50%)",
  },
  "giants-from-dust": {
    light: "linear-gradient(135deg, rgba(234,88,12,0.22) 0%, transparent 50%)",
    dark: "linear-gradient(135deg, rgba(251,146,60,0.18) 0%, transparent 50%)",
  },
  "scalable-class-imbalance": {
    light: "linear-gradient(135deg, rgba(20,184,166,0.24) 0%, transparent 50%)",
    dark: "linear-gradient(135deg, rgba(45,212,191,0.18) 0%, transparent 50%)",
  },
  "flex-living-reviews": {
    light: "linear-gradient(135deg, rgba(14,165,233,0.22) 0%, transparent 50%)",
    dark: "linear-gradient(135deg, rgba(56,189,248,0.18) 0%, transparent 50%)",
  },
  "wizardocs": {
    light: "linear-gradient(135deg, rgba(201,154,58,0.22) 0%, transparent 50%)",
    dark: "linear-gradient(135deg, rgba(212,168,67,0.18) 0%, transparent 50%)",
  },
};
const DEFAULT_OVERLAY = { light: "transparent", dark: "transparent" };

interface ProviderProps {
  project: Projects;
  isActive: boolean;
  isChatMode: boolean;
  onOpen: () => void;
  onClose: () => void;
  onEnterChatMode: () => void;
  onExitChatMode: () => void;
  children: React.ReactNode;
}

function Provider({
  project,
  isActive,
  isChatMode,
  onOpen,
  onClose,
  onEnterChatMode,
  onExitChatMode,
  children,
}: ProviderProps) {
  const formattedDate = new Date(project.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });

  return (
    <ProjectCardContext
      value={{
        state: { project, isActive, isChatMode },
        actions: {
          open: onOpen,
          close: onClose,
          enterChatMode: onEnterChatMode,
          exitChatMode: onExitChatMode,
        },
        meta: { formattedDate },
      }}
    >
      {children}
    </ProjectCardContext>
  );
}

function Trigger({ children }: { children: React.ReactNode }) {
  const { state, actions } = useProjectCard();
  const { slugAsParams } = state.project;

  return (
    <motion.div
      layoutId={`project-card-${slugAsParams}`}
      className={cn(
        "relative p-2 bg-background rounded-lg cursor-pointer",
        "hover:bg-chart-2/15 dark:hover:bg-gitmap-ocean-3/25 transition-colors group",
      )}
      whileTap={{ scale: 0.98 }}
      onClick={actions.open}
      transition={springTransition}
    >
      {children}
    </motion.div>
  );
}

function TriggerTitle() {
  const { state } = useProjectCard();
  const { slugAsParams, title } = state.project;

  return (
    <motion.span
      layoutId={`project-title-${slugAsParams}`}
      className="font-medium text-sm w-fit"
      transition={springTransition}
    >
      {title}
    </motion.span>
  );
}

function TriggerDescription() {
  const { state } = useProjectCard();
  const { slugAsParams, excerpt } = state.project;

  return (
    <motion.p
      layoutId={`project-description-${slugAsParams}`}
      className="text-xs text-muted-foreground line-clamp-2 leading-relaxed"
      transition={springTransition}
    >
      {excerpt}
    </motion.p>
  );
}

function TriggerLinks() {
  const { state } = useProjectCard();
  const { slugAsParams, github, url } = state.project;
  const hasGithub = github && github !== "#";
  const hasLive = url && url !== "#";

  if (!hasGithub && !hasLive) return null;

  return (
    <motion.div
      layoutId={`project-links-${slugAsParams}`}
      className="flex items-center gap-1 shrink-0 sm:invisible sm:group-hover:visible"
      transition={springTransition}
    >
      {hasGithub && (
        <Link
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded hover:bg-background transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Github className="size-3.5" />
        </Link>
      )}
      {hasLive && (
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded hover:bg-background transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ArrowUpRight className="size-3.5 text-muted-foreground hover:text-foreground transition-colors" />
        </Link>
      )}
    </motion.div>
  );
}

function Overlay() {
  const { state } = useProjectCard();

  return (
    <AnimatePresence>
      {state.isActive && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </AnimatePresence>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  const { state, actions } = useProjectCard();
  const { slugAsParams } = state.project;
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        actions.close();
      }
    },
    [actions],
  );

  useEffect(() => {
    if (!state.isActive) return;
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [state.isActive, handleClickOutside]);

  return (
    <AnimatePresence>
      {state.isActive && (
        <motion.div
          ref={ref}
          layoutId={`project-card-${slugAsParams}`}
          className={cn(
            "fixed z-50 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2",
            "w-full max-w-[calc(100%-2rem)] sm:max-w-2xl",
            "bg-background border shadow-lg rounded-lg overflow-hidden",
            "flex flex-col max-h-[calc(100vh - 8rem)] no-scrollbar",
            state.isChatMode ? "h-[750px]" : "h-auto",
          )}
          transition={springTransition}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Banner({ children }: { children?: React.ReactNode }) {
  const { state } = useProjectCard();
  const { bannerLight, bannerDark, slugAsParams } = state.project;
  const overlay = BANNER_OVERLAYS[slugAsParams] ?? DEFAULT_OVERLAY;

  return (
    <div
      className="aspect-3/1 bg-muted w-full relative shrink-0 overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(#000 0%, rgba(0,0,0,.99) 18.5%, rgba(0,0,0,.953) 34.3%, rgba(0,0,0,.894) 47.6%, rgba(0,0,0,.824) 58.5%, rgba(0,0,0,.74) 67.5%, rgba(0,0,0,.647) 74.7%, rgba(0,0,0,.55) 80.3%, rgba(0,0,0,.45) 84.7%, rgba(0,0,0,.353) 88%, rgba(0,0,0,.26) 90.5%, rgba(0,0,0,.176) 92.5%, rgba(0,0,0,.106) 94.2%, rgba(0,0,0,.047) 95.9%, rgba(0,0,0,.01) 97.7%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(#000 0%, rgba(0,0,0,.99) 18.5%, rgba(0,0,0,.953) 34.3%, rgba(0,0,0,.894) 47.6%, rgba(0,0,0,.824) 58.5%, rgba(0,0,0,.74) 67.5%, rgba(0,0,0,.647) 74.7%, rgba(0,0,0,.55) 80.3%, rgba(0,0,0,.45) 84.7%, rgba(0,0,0,.353) 88%, rgba(0,0,0,.26) 90.5%, rgba(0,0,0,.176) 92.5%, rgba(0,0,0,.106) 94.2%, rgba(0,0,0,.047) 95.9%, rgba(0,0,0,.01) 97.7%, transparent 100%)",
      }}
    >
      <Image
        src={bannerLight}
        alt=""
        width={1500}
        height={500}
        className="object-cover object-top w-full h-full dark:hidden"
      />
      <Image
        src={bannerDark}
        alt=""
        width={1500}
        height={500}
        className="object-cover object-top w-full h-full hidden dark:block"
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
      {children}
    </div>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return <div className="p-4 lg:p-6 shrink-0">{children}</div>;
}

function Title() {
  const { state } = useProjectCard();
  const { slugAsParams, title } = state.project;

  return (
    <motion.span
      layoutId={`project-title-${slugAsParams}`}
      className="font-semibold text-lg w-fit"
      transition={springTransition}
    >
      {title}
    </motion.span>
  );
}

function Description() {
  const { state } = useProjectCard();
  const { slugAsParams, excerpt } = state.project;

  return (
    <motion.p
      layoutId={`project-description-${slugAsParams}`}
      className="text-sm text-muted-foreground mt-1 leading-relaxed origin-top"
      animate={{
        opacity: state.isChatMode ? 0 : 1,
        height: state.isChatMode ? 0 : "auto",
        marginTop: state.isChatMode ? 0 : 4,
      }}
      transition={springTransition}
    >
      {excerpt}
    </motion.p>
  );
}

function Links() {
  const { state } = useProjectCard();
  const { slugAsParams, github, url } = state.project;
  const hasGithub = github && github !== "#";
  const hasLive = url && url !== "#";

  if (!hasGithub && !hasLive) return null;

  return (
    <motion.div
      layoutId={`project-links-${slugAsParams}`}
      className="flex items-center gap-2"
      transition={springTransition}
    >
      {hasGithub && (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Github className="size-3.5" />
          <span>GitHub</span>
        </a>
      )}
      {hasLive && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ArrowUpRight className="size-3.5 text-muted-foreground hover:text-foreground transition-colors" />
          <span>Live</span>
        </a>
      )}
    </motion.div>
  );
}

function CloseButton() {
  const { actions } = useProjectCard();

  return (
    <button
      className={cn(
        "absolute top-3 right-3 p-1 rounded-sm",
        "bg-background/80 backdrop-blur-sm border border-border/50",
        "hover:bg-background transition-colors",
      )}
      onClick={actions.close}
      aria-label="Close"
    >
      <X className="size-4" />
    </button>
  );
}

function Body() {
  const { state } = useProjectCard();

  return (
    <motion.div
      className="overflow-hidden origin-top"
      animate={{
        opacity: state.isChatMode ? 0 : 1,
        height: state.isChatMode ? 0 : "auto",
        marginTop: state.isChatMode ? 0 : 12,
        marginBottom: state.isChatMode ? 0 : 24,
      }}
      transition={springTransition}
    >
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <MDXContentRenderer
          code={state.project.body}
          components={{
            p: ({
              className,
              ...props
            }: React.HTMLAttributes<HTMLParagraphElement>) => (
              <p
                className={cn("leading-snug not-first:mt-2", className)}
                {...props}
              />
            ),
          }}
        />
      </div>
    </motion.div>
  );
}

interface ChatProviderProps {
  projectContext: ProjectContext;
  children: React.ReactNode;
}

function ChatProvider({ projectContext, children }: ChatProviderProps) {
  const { actions: cardActions, state: cardState } = useProjectCard();

  const chat = useChatHook({
    onFirstMessage: cardActions.enterChatMode,
    projectContext,
  });

  const resetRef = useRef(chat.reset);
  resetRef.current = chat.reset;

  // Removed reset on close logic to persist chat history
  //   useEffect(() => {
  //     if (!cardState.isActive) {
  //       resetRef.current();
  //     }
  //   }, [cardState.isActive]);

  return (
    <ChatContext
      value={{
        state: { messages: chat.messages, isLoading: chat.isLoading },
        actions: {
          sendMessage: chat.sendMessage,
          stopGeneration: chat.stopGeneration,
          reset: chat.reset,
        },
      }}
    >
      {children}
    </ChatContext>
  );
}

function GeminiLogo({ className }: { className?: string }) {
  const id = React.useId();

  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient
          id={`gemini-grad-${id}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#4285F4">
            <animate
              attributeName="stop-color"
              values="#4285F4;#EA4335;#FBBC05;#34A853;#4285F4"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="50%" stopColor="#9B72CB">
            <animate
              attributeName="stop-color"
              values="#9B72CB;#D96570;#F9AB00;#0F9D58;#9B72CB"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#D96570">
            <animate
              attributeName="stop-color"
              values="#D96570;#FBBC05;#34A853;#4285F4;#D96570"
              dur="4s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
      </defs>
      <path
        d="M14 0C14 7.732 7.732 14 0 14C7.732 14 14 20.268 14 28C14 20.268 20.268 14 28 14C20.268 14 14 7.732 14 0Z"
        fill={`url(#gemini-grad-${id})`}
      />
    </svg>
  );
}

function ThinkingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="flex justify-start"
    >
      <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-muted/30">
        <GeminiLogo className="size-4" />
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-1.5 rounded-full bg-muted-foreground/60"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ChatMessage({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div
        className="flex justify-end"
      >
        <div className="max-w-[85%] px-3.5 py-2 rounded-lg text-sm bg-muted/50">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.isStreaming && !message.content) {
    return <ThinkingIndicator />;
  }

  return (
    <div
      className="flex justify-start"
    >
      <div className="px-3.5 py-2.5 rounded-lg bg-muted/30 text-sm max-w-[85%]">
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="leading-relaxed not-first:mt-2">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mt-2 space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mt-2 space-y-1">
                {children}
              </ol>
            ),
            code: ({ children }) => (
              <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-background/50 p-3 rounded-md mt-2 overflow-x-auto text-xs">
                {children}
              </pre>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
        {message.isStreaming && message.content && (
          <motion.span
            className="inline-block w-1.5 h-4 ml-0.5 bg-foreground/70 rounded-sm align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        )}
      </div>
    </div>
  );
}

function ChatMessages() {
  const { state: cardState } = useProjectCard();
  const { state } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages]);

  return (
    <div
      className="flex-1 overflow-hidden no-scrollbar"
    >
      {cardState.isChatMode && (
        <div ref={scrollRef} className="h-full p-4 lg:p-6 overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-3 py-2">
            {state.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ChatInputProps {
  placeholder?: string;
  autoFocus?: boolean;
}

function ChatInput({ placeholder = "Ask Gemini", autoFocus }: ChatInputProps) {
  const { state, actions } = useChat();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSubmit = input.trim() && !state.isLoading;

  const suggestedPrompts = [
    "Tech stack?",
    "Hardest bug?",
    "Features?",
    "How it works?",
  ];

  useEffect(() => {
    if (autoFocus && !state.isLoading) {
      textareaRef.current?.focus();
    }
  }, [autoFocus, state.isLoading, state.messages.length]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "inherit";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (input.trim() && !state.isLoading) {
        actions.sendMessage(input.trim());
        setInput("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "inherit";
        }
        requestAnimationFrame(() => {
          textareaRef.current?.focus();
        });
      }
    },
    [input, state.isLoading, actions],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence>
        {state.messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="flex flex-wrap gap-1.5 px-0.5"
          >
            {suggestedPrompts.map((prompt, i) => (
              <motion.button
                key={prompt}
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...springTransition, delay: i * 0.05 }}
                onClick={() => actions.sendMessage(prompt)}
                className={cn(
                  "text-[10px] sm:text-xs px-2.5 py-1 rounded-full border border-border/50",
                  "bg-muted/30 hover:bg-muted/50 hover:border-border",
                  "text-muted-foreground hover:text-foreground",
                  "transition-all duration-200 whitespace-nowrap",
                )}
              >
                {prompt}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "relative flex items-end",
            "bg-muted/30 rounded-md",
            "ring-1 ring-border/50",
            "focus-within:ring-border focus-within:bg-muted/40",
            "transition-all duration-200",
          )}
        >
          <div className="absolute left-3 bottom-3 pointer-events-none">
            <GeminiLogo className="size-4" />
          </div>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "w-full bg-transparent",
              "pl-10 pr-12 py-2.5 text-sm",
              "placeholder:text-muted-foreground/50",
              "focus:outline-none",
              "resize-none overflow-y-auto",
              "min-h-[40px] max-h-[80px]",
            )}
          />
          <motion.button
            type="submit"
            disabled={!canSubmit}
            initial={false}
            animate={{
              opacity: canSubmit ? 1 : 0.3,
            }}
            whileHover={canSubmit ? { scale: 1.05 } : undefined}
            whileTap={canSubmit ? { scale: 0.95 } : undefined}
            transition={springTransition}
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2",
              "size-8 flex items-center justify-center",
              "rounded-md",
              "bg-foreground text-background",
              "disabled:cursor-not-allowed",
              "shadow-sm",
            )}
          >
            <ArrowUp className="size-4" strokeWidth={2.5} />
          </motion.button>
        </div>
      </form>
    </div>
  );
}

function ChatInputWrapper({ children }: { children: React.ReactNode }) {
  return <div className="p-4 lg:p-6 shrink-0">{children}</div>;
}

export const ProjectCard = {
  Provider,
  Trigger,
  TriggerTitle,
  TriggerDescription,
  TriggerLinks,
  Overlay,
  Content,
  Banner,
  Header,
  Title,
  Description,
  Links,
  CloseButton,
  Body,
  ChatProvider,
  ChatMessages,
  ChatInput,
  ChatInputWrapper,
};
