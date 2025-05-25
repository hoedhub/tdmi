src/
└── lib/
    └── components/
        └── SuperTable/
            // --- Core Component Files ---
            ├── SuperTable.svelte             // Main component UI, event handling, composition
            ├── index.ts                      // Exports SuperTable and related types/interfaces for easy import

            // --- Type Definitions ---
            ├── types.ts                      // All TypeScript interfaces (ColumnDef, SortConfig, FilterState, etc.)

            // --- State Management ---
            ├── stores.ts                     // Svelte stores (writable, derived) for internal state

            // --- Feature Logic Modules (Highly Recommended for Separation of Concerns & Testability) ---
            ├── features/
            │   ├── sorting.ts                // Client-side sorting logic functions
            │   ├── filtering.ts              // Client-side filtering logic functions
            │   └── pagination.ts             // Client-side pagination calculation logic

            // --- Svelte Actions (Must for specific DOM interactions) ---
            ├── actions/
            │   ├── swipeAction.ts            // Svelte action for swipe-to-reveal functionality
            │   └── longPressAction.ts        // Svelte action for long-press detection

            // --- Subcomponents (Consider as needed during development if parts become too complex) ---
            // For v1, you might start by inlining these and extract later if necessary.
            // If you decide to use them from the start for clarity:
            ├── subcomponents/
            │   ├── TableRowDesktop.svelte    // Handles rendering a <tr> for desktop/table view
            │   ├── TableRowMobileCard.svelte // Handles rendering a card for mobile card view
            │   ├── TableHeader.svelte        // Handles rendering the <thead>, including sort icons and filter inputs
            │   ├── PaginationControls.svelte // Dedicated component for pagination UI
            │   └── FilterInput.svelte        // A generic filter input component (text, select) if used in multiple places

            // --- Testing (Absolutely Must) ---
            ├── tests/
            │   // Component Tests (Interaction, Rendering)
            │   ├── SuperTable.spec.ts        // Tests for SuperTable.svelte interactions and rendering
            │   ├── TableRowDesktop.spec.ts   // If subcomponent exists
            │   ├── TableRowMobileCard.spec.ts// If subcomponent exists
            │   ├── TableHeader.spec.ts       // If subcomponent exists
            │   ├── PaginationControls.spec.ts// If subcomponent exists
            │
            │   // Logic Unit Tests
            │   ├── features/
            │   │   ├── sorting.spec.ts       // Unit tests for sorting.ts
            │   │   ├── filtering.spec.ts     // Unit tests for filtering.ts
            │   │   └── pagination.spec.ts    // Unit tests for pagination.ts
            │
            │   // Action Tests (if complex enough, otherwise tested via SuperTable.spec.ts)
            │   ├── actions/
            │   │   ├── swipeAction.spec.ts
            │   │   └── longPressAction.spec.ts

            // --- Documentation ---
            └── README.md                     // Component-specific usage, props, slots, events