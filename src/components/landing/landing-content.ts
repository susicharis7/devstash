import type { ItemTypeIconName } from "@/lib/item-types";

export interface TypeBlurb {
  name: string;
  belongs: string;
}

export interface SampleItem {
  title: string;
  description: string;
  icon: ItemTypeIconName;
  accentColor: string;
  tags: string[];
  date: string;
  isPinned?: boolean;
}

export interface SampleCollection {
  name: string;
  itemCount: number;
  accentColor: string;
  icon: ItemTypeIconName;
}

export interface Capability {
  title: string;
  body: string;
}

export const TYPE_BLURBS: Record<string, string> = {
  snippet: "Code you rewrite too often",
  prompt: "System messages and prompts that worked",
  command: "The shell incantations you always re-google",
  note: "Explanations worth keeping",
  file: "Context files and templates",
  image: "Screenshots and diagrams",
  link: "Docs you actually return to",
};

export const DEMO_QUERIES = [
  "port",
  "docker prune",
  "useDebounced",
  "reset --soft",
];

export const DEMO_HITS: Record<string, { kind: string; title: string }[]> = {
  port: [
    { kind: "command", title: "Kill process on a port" },
    { kind: "snippet", title: "Run Next dev on a custom port" },
    { kind: "note", title: "Neon pooled vs direct ports" },
  ],
  "docker prune": [
    { kind: "command", title: "Prune all unused Docker data" },
    { kind: "note", title: "What prune actually deletes" },
    { kind: "command", title: "Remove dangling images only" },
  ],
  useDebounced: [
    { kind: "snippet", title: "Debounced value hook" },
    { kind: "snippet", title: "Debounced search input" },
    { kind: "note", title: "When to debounce vs throttle" },
  ],
  "reset --soft": [
    { kind: "command", title: "Undo last commit, keep changes" },
    { kind: "note", title: "soft vs mixed vs hard" },
    { kind: "link", title: "git reset documentation" },
  ],
};

export const SAMPLE_ITEMS: SampleItem[] = [
  {
    title: "Undo last commit, keep changes",
    description: "git reset --soft HEAD~1",
    icon: "Terminal",
    accentColor: "#f97316",
    tags: ["git", "recovery"],
    date: "Jul 24",
    isPinned: true,
  },
  {
    title: "Debounced value hook",
    description: "export function useDebounced<T>(value: T, ms = 250)",
    icon: "Code",
    accentColor: "#3b82f6",
    tags: ["react", "hooks"],
    date: "Jul 22",
  },
  {
    title: "Explain this diff to a reviewer",
    description: "You are reviewing a pull request. Summarise the intent…",
    icon: "Sparkles",
    accentColor: "#8b5cf6",
    tags: ["review"],
    date: "Jul 21",
  },
  {
    title: "Tailwind v4 theme directive",
    description: "tailwindcss.com/docs/theme",
    icon: "Link",
    accentColor: "#10b981",
    tags: ["css"],
    date: "Jul 18",
  },
];

export const SAMPLE_COLLECTIONS: SampleCollection[] = [
  { name: "React patterns", itemCount: 12, accentColor: "#3b82f6", icon: "Code" },
  { name: "Terminal", itemCount: 8, accentColor: "#f97316", icon: "Terminal" },
  { name: "Prompt library", itemCount: 9, accentColor: "#8b5cf6", icon: "Sparkles" },
];

export const CAPABILITIES: Capability[] = [
  {
    title: "Search across everything",
    body: "One query runs over content, titles, tags and types. No remembering which app you saved it in.",
  },
  {
    title: "Collections that overlap",
    body: "An item lives in as many collections as it belongs to. A React snippet can sit in both React patterns and Interview prep.",
  },
  {
    title: "Pin and favorite",
    body: "Push the handful you reach for daily to the top, and star the ones worth keeping close.",
  },
  {
    title: "Write in markdown",
    body: "Text items take real markdown, with syntax highlighting for code.",
  },
  {
    title: "Import from a file",
    body: "Paste a file in and keep the language and formatting instead of retyping it.",
  },
  {
    title: "Take it with you",
    body: "Export your stash when you want it somewhere else. It stays yours.",
  },
];
