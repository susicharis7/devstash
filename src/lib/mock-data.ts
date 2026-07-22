export type ContentType = "TEXT" | "URL" | "FILE";

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPro: boolean;
}

export interface ItemType {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  contentType: ContentType;
  isSystem: boolean;
  count: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemCount: number;
  itemTypeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  title: string;
  description: string | null;
  contentType: ContentType;
  content: string | null;
  url: string | null;
  fileName: string | null;
  fileSize: number | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  itemTypeId: string;
  collectionIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const currentUser: User = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  image: null,
  isPro: true,
};

export const itemTypes: ItemType[] = [
  {
    id: "type-snippet",
    name: "Snippets",
    slug: "snippets",
    icon: "Code",
    color: "#3b82f6",
    contentType: "TEXT",
    isSystem: true,
    count: 24,
  },
  {
    id: "type-prompt",
    name: "Prompts",
    slug: "prompts",
    icon: "Sparkles",
    color: "#8b5cf6",
    contentType: "TEXT",
    isSystem: true,
    count: 18,
  },
  {
    id: "type-command",
    name: "Commands",
    slug: "commands",
    icon: "Terminal",
    color: "#f97316",
    contentType: "TEXT",
    isSystem: true,
    count: 15,
  },
  {
    id: "type-note",
    name: "Notes",
    slug: "notes",
    icon: "StickyNote",
    color: "#fde047",
    contentType: "TEXT",
    isSystem: true,
    count: 12,
  },
  {
    id: "type-file",
    name: "Files",
    slug: "files",
    icon: "File",
    color: "#6b7280",
    contentType: "FILE",
    isSystem: true,
    count: 5,
  },
  {
    id: "type-image",
    name: "Images",
    slug: "images",
    icon: "Image",
    color: "#ec4899",
    contentType: "FILE",
    isSystem: true,
    count: 3,
  },
  {
    id: "type-link",
    name: "Links",
    slug: "links",
    icon: "Link",
    color: "#10b981",
    contentType: "URL",
    isSystem: true,
    count: 8,
  },
];

export const itemTypesById: Record<string, ItemType> = Object.fromEntries(
  itemTypes.map((type) => [type.id, type])
);

export const collections: Collection[] = [
  {
    id: "col-react-patterns",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    isFavorite: true,
    itemCount: 12,
    itemTypeIds: ["type-snippet", "type-note", "type-link"],
    createdAt: "2026-01-04T09:00:00.000Z",
    updatedAt: "2026-01-15T14:20:00.000Z",
  },
  {
    id: "col-python-snippets",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    isFavorite: false,
    itemCount: 8,
    itemTypeIds: ["type-snippet", "type-note"],
    createdAt: "2026-01-05T10:30:00.000Z",
    updatedAt: "2026-01-13T11:00:00.000Z",
  },
  {
    id: "col-context-files",
    name: "Context Files",
    description: "AI context files for projects",
    isFavorite: true,
    itemCount: 5,
    itemTypeIds: ["type-file", "type-note"],
    createdAt: "2026-01-06T08:15:00.000Z",
    updatedAt: "2026-01-14T16:45:00.000Z",
  },
  {
    id: "col-interview-prep",
    name: "Interview Prep",
    description: "Technical interview preparation",
    isFavorite: false,
    itemCount: 24,
    itemTypeIds: ["type-note", "type-snippet", "type-link", "type-prompt"],
    createdAt: "2026-01-02T12:00:00.000Z",
    updatedAt: "2026-01-12T09:30:00.000Z",
  },
  {
    id: "col-git-commands",
    name: "Git Commands",
    description: "Frequently used git commands",
    isFavorite: true,
    itemCount: 15,
    itemTypeIds: ["type-command", "type-note"],
    createdAt: "2026-01-03T13:45:00.000Z",
    updatedAt: "2026-01-11T10:10:00.000Z",
  },
  {
    id: "col-ai-prompts",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    isFavorite: false,
    itemCount: 18,
    itemTypeIds: ["type-prompt", "type-snippet", "type-note"],
    createdAt: "2026-01-01T15:00:00.000Z",
    updatedAt: "2026-01-10T18:00:00.000Z",
  },
];

export const items: Item[] = [
  {
    id: "item-1",
    title: "useAuth Hook",
    description: "Custom authentication hook for React applications",
    contentType: "TEXT",
    content:
      "export function useAuth() {\n  const { data: session } = useSession();\n  return { user: session?.user, isLoggedIn: !!session };\n}",
    url: null,
    fileName: null,
    fileSize: null,
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    itemTypeId: "type-snippet",
    collectionIds: ["col-react-patterns"],
    tags: ["react", "auth", "hooks"],
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "item-2",
    title: "API Error Handling Pattern",
    description: "Fetch wrapper with exponential backoff retry logic",
    contentType: "TEXT",
    content:
      "async function fetchWithRetry(url, options, retries = 3) {\n  return fetch(url, options);\n}",
    url: null,
    fileName: null,
    fileSize: null,
    language: "typescript",
    isFavorite: false,
    isPinned: true,
    itemTypeId: "type-snippet",
    collectionIds: ["col-react-patterns"],
    tags: ["fetch", "error-handling", "api"],
    createdAt: "2026-01-12T14:30:00.000Z",
    updatedAt: "2026-01-12T14:30:00.000Z",
  },
  {
    id: "item-3",
    title: "Optimize this function",
    description: "Prompt to optimize and explain a block of code",
    contentType: "TEXT",
    content:
      "Optimize the following code for readability and performance, then explain the changes:\n\n{code}",
    url: null,
    fileName: null,
    fileSize: null,
    language: null,
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type-prompt",
    collectionIds: ["col-ai-prompts"],
    tags: ["ai", "refactor"],
    createdAt: "2026-01-11T09:20:00.000Z",
    updatedAt: "2026-01-11T09:20:00.000Z",
  },
  {
    id: "item-4",
    title: "Reset branch to remote",
    description: "Discard local changes and match origin",
    contentType: "TEXT",
    content: "git reset --hard origin/main",
    url: null,
    fileName: null,
    fileSize: null,
    language: "bash",
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type-command",
    collectionIds: ["col-git-commands"],
    tags: ["git"],
    createdAt: "2026-01-10T16:40:00.000Z",
    updatedAt: "2026-01-10T16:40:00.000Z",
  },
  {
    id: "item-5",
    title: "Big-O Cheatsheet",
    description: "Time complexity of common data structures and algorithms",
    contentType: "TEXT",
    content: "## Big-O Cheatsheet\n\n- Array access: O(1)\n- Hash lookup: O(1)",
    url: null,
    fileName: null,
    fileSize: null,
    language: null,
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type-note",
    collectionIds: ["col-interview-prep"],
    tags: ["algorithms", "interview"],
    createdAt: "2026-01-09T11:15:00.000Z",
    updatedAt: "2026-01-09T11:15:00.000Z",
  },
  {
    id: "item-6",
    title: "Next.js App Router Docs",
    description: "Official reference for the App Router",
    contentType: "URL",
    content: null,
    url: "https://nextjs.org/docs/app",
    fileName: null,
    fileSize: null,
    language: null,
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type-link",
    collectionIds: ["col-react-patterns"],
    tags: ["nextjs", "docs"],
    createdAt: "2026-01-08T13:00:00.000Z",
    updatedAt: "2026-01-08T13:00:00.000Z",
  },
  {
    id: "item-7",
    title: "project-context.md",
    description: "AI context file describing the DevStash project",
    contentType: "FILE",
    content: null,
    url: null,
    fileName: "project-context.md",
    fileSize: 4096,
    language: null,
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type-file",
    collectionIds: ["col-context-files"],
    tags: ["context", "ai"],
    createdAt: "2026-01-07T10:45:00.000Z",
    updatedAt: "2026-01-07T10:45:00.000Z",
  },
  {
    id: "item-8",
    title: "Merge two dicts",
    description: "Merge dictionaries with the spread operator",
    contentType: "TEXT",
    content: "merged = { **a, **b }",
    url: null,
    fileName: null,
    fileSize: null,
    language: "python",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type-snippet",
    collectionIds: ["col-python-snippets"],
    tags: ["python", "dict"],
    createdAt: "2026-01-06T12:30:00.000Z",
    updatedAt: "2026-01-06T12:30:00.000Z",
  },
];
