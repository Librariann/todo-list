# Agent Guidelines for Todo-List Project

## Build & Development Commands

- **Dev**: `npm run start:dev` (uses Turbopack)
- **Build**: `npm run build` (uses Turbopack)
- **Lint**: `npm run lint` (ESLint with Next.js config)
- **Start**: `npm start` (production mode)
- **No tests configured**: Project has no test framework yet

## Code Style Guidelines

### Imports & Structure

- Use `'use client'` directive for client components (useState, useEffect, etc.)
- Import order: React → Next.js → External → Internal types → Internal components → Mock data
- Use absolute imports with `@/*` path alias (e.g., `@/app/components`)
- Group related imports together

### TypeScript & Types

- **Strict mode enabled**: All types must be explicitly defined
- Define interfaces for props (e.g., `interface RewardShopProps`)
- Use enums for fixed sets of values (e.g., `TodoStatus`, `RewardType`)
- Type all useState hooks: `useState<Type>(initialValue)`
- Use `useMemo` for derived/computed values to optimize performance

### Naming Conventions

- **Components**: PascalCase (e.g., `RewardShop`, `SimpleTodoCard`)
- **Files**: PascalCase for components (.tsx), camelCase for utilities (.ts)
- **Functions**: camelCase with descriptive names (e.g., `handleStatusChange`, `formatDate`)
- **Interfaces**: PascalCase with descriptive names (e.g., `UserStats`, `DailyTodos`)
- **Event handlers**: Prefix with `handle` or `on` (e.g., `handleAddTodo`, `onClaim`)

### React Patterns

- Use functional components with hooks (no class components)
- Prefer `useMemo` for expensive computations and derived state
- Keep state management simple with `useState` (no Redux/Zustand yet)
- Extract reusable components into separate files in `app/components/`
- Use controlled components for forms with onChange handlers

### Styling (Tailwind CSS v4)

- Use Tailwind utility classes exclusively (no custom CSS unless necessary)
- Dark mode: Use `dark:` prefix for dark mode variants (e.g., `dark:bg-gray-800`)
- Responsive: Use breakpoint prefixes (e.g., `sm:`, `md:`, `lg:`)
- Template literals for conditional classes with proper formatting
- Gradients: Use `bg-gradient-to-*` utilities for visual appeal

### Error Handling

- No formal error boundaries yet - add as needed
- Use optional chaining (`?.`) for safe property access
- Provide fallback UI for empty states (e.g., "할 일이 없습니다")
- Validate input before processing (e.g., `if (!newTodoTitle.trim()) return`)

## Github Commit Message Guidelines

- use English for commit message
- commit per file
- ForExample you maybe commit 1.tsx of 2024.01.01 next commit 2.tsx commit date is 2024.01.02
- not wirte claude related commit message
- contributor also not write commit message
- generator by claude na such message is not written

## Project-Specific Notes

- **Korean UI**: All user-facing text is in Korean (keep this consistency)
- **Date format**: Use `YYYY-MM-DD` string format for dates
- **Points system**: Track with `rewardPoints` and `totalPoints`
- **Mock data**: Currently using mock data from `app/lib/mockData.ts`
