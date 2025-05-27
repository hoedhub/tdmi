# SuperTable

A powerful, responsive, and accessible data table component for SvelteKit with DaisyUI styling.

## Features

- 📱 Mobile-first design with card and table views
- 🔍 Global and column-specific filtering
- 🔄 Client-side sorting
- ✨ Row selection with bulk actions
- 📱 Swipe actions on mobile
- 📑 Pagination
- 🎨 DaisyUI styled
- ♿ Fully accessible
- 🎯 TypeScript support

## Installation

```bash
npm install @your-scope/super-table
# or
pnpm add @your-scope/super-table
```

## Basic Usage

```svelte
<script lang="ts">
    import { SuperTable, type ColumnDef } from '@your-scope/super-table';
    import { Edit, Trash2 } from 'lucide-svelte';
    
    interface User {
        id: number;
        name: string;
        email: string;
        role: string;
        status: 'active' | 'inactive';
    }

    const users: User[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
        // ... more users
    ];

    const columns: ColumnDef<User>[] = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            filterable: 'text',
            cardPriority: 1 // Show first in card view
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
            cardPriority: 2
        },
        {
            key: 'role',
            label: 'Role',
            filterable: 'select',
            filterOptions: ['Admin', 'User', 'Guest']
        },
        {
            key: 'status',
            label: 'Status',
            formatter: (value) => `<span class="badge ${value === 'active' ? 'badge-success' : 'badge-error'}">${value}</span>`,
            filterable: 'select',
            filterOptions: ['active', 'inactive']
        }
    ];

    let selectedIds: number[] = [];

    function handleEdit(user: User) {
        // Handle edit
    }

    function handleDelete(user: User) {
        // Handle delete
    }

    function handleBulkDelete() {
        // Handle bulk delete
    }
</script>

<SuperTable
    data={users}
    {columns}
    rowKey="id"
    mobileView="cards"
>
    <svelte:fragment slot="bulk-actions" let:selectedIds>
        {#if selectedIds.length}
            <button 
                class="btn btn-error btn-sm" 
                on:click={handleBulkDelete}
            >
                Delete Selected ({selectedIds.length})
            </button>
        {/if}
    </svelte:fragment>

    <svelte:fragment slot="row-actions" let:row>
        <button
            class="btn btn-ghost btn-sm"
            on:click={() => handleEdit(row)}
        >
            <Edit size={16} />
        </button>
        <button
            class="btn btn-ghost btn-sm text-error"
            on:click={() => handleDelete(row)}
        >
            <Trash2 size={16} />
        </button>
    </svelte:fragment>
</SuperTable>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `T[]` | `[]` | Array of data to display |
| columns | `ColumnDef<T>[]` | `[]` | Column definitions |
| rowKey | `keyof T` | required | Unique identifier field for each row |
| mobileView | `'cards' \| 'table'` | `'cards'` | Mobile display mode |
| initialSort | `SortConfig` | `null` | Initial sort configuration |
| itemsPerPage | `number` | `10` | Items per page |
| totalItems | `number` | `undefined` | Total items (for server-side pagination) |
| isLoading | `boolean` | `false` | Loading state |
| tableClass | `string` | `''` | Additional classes for table |
| cardClass | `string` | `''` | Additional classes for cards |
| rowClass | `string \| ((row: T) => string)` | `''` | Additional classes for rows |

## Column Definition

```typescript
interface ColumnDef<T = any> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    filterable?: boolean | 'text' | 'select' | 'date';
    filterOptions?: string[] | { label: string; value: any }[];
    formatter?: (value: any, row: T, column: ColumnDef<T>) => string | ComponentType;
    headerClass?: string;
    cellClass?: string | ((value: any, row: T) => string);
    responsiveShow?: 'always' | 'md' | 'lg';
    cardPriority?: number;
    hidden?: boolean;
}
```

## Events

| Event | Detail Type | Description |
|-------|-------------|-------------|
| sort | `SortConfig \| null` | Emitted when sort changes |
| filter | `FilterState` | Emitted when filters change |
| selectionChange | `Array<T[keyof T]>` | Emitted when selection changes |
| pageChange | `number` | Emitted when page changes |

## Slots

- `global-filter`: Customize the global filter input
- `bulk-actions`: Actions for selected rows
- `row-actions`: Actions for individual rows
- `loading-state`: Custom loading state
- `empty-state`: Custom empty state

## Mobile Support

The component provides two modes for mobile display:

1. Card View (default):
   - Each row becomes a card
   - Prioritized fields shown by default
   - "Show More" button for additional fields
   - Swipe actions for quick actions
   - Long press for selection

2. Table View:
   - Horizontally scrollable table
   - Responsive column visibility
   - Touch-friendly controls

## Accessibility

SuperTable is built with accessibility in mind:

- ARIA attributes for sorting, filtering, and selection
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus management
- Touch target sizing

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.
