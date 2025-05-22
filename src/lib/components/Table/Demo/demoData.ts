import type { ActionDefinition, ColumnDefinition } from '../types';
import BalanceCell from './BalanceCell.svelte';

export type UserData = {
    id: number;
    name: string;
    email: string;
    status: 'Active' | 'Inactive' | 'Pending';
    registrationDate: string;
    balance: number;
    isAdmin: boolean;
};

export const userActions: ActionDefinition<UserData>[] = [
    {
        label: 'View Details',
        handler: (row) => alert(`Viewing ${row.name} (ID: ${row.id})`)
    },
    {
        label: 'Edit User',
        handler: (row) => alert(`Editing ${row.name}`),
        hidden: (row) => row.status === 'Inactive'
    },
    {
        label: 'Toggle Admin',
        handler: (row) => console.log(`Toggling admin for ${row.name}`),
        disabled: (row) => row.id === 1
    },
    {
        label: 'Delete',
        class: 'text-error',
        handler: (row) => {
            if (confirm(`Are you sure you want to delete ${row.name}?`)) {
                console.log('Deleting user:', row.id);
            }
        },
        hidden: (row) => row.isAdmin === true
    }
];

export const sampleClientData: UserData[] = [
    {
        id: 1,
        name: 'Alice Wonderland',
        email: 'alice@example.com',
        status: 'Active',
        registrationDate: '2023-01-15T10:00:00Z',
        balance: 1250.75,
        isAdmin: true
    },
    {
        id: 2,
        name: 'Bob The Builder',
        email: 'bob@sample.org',
        status: 'Active',
        registrationDate: '2023-03-22T14:30:00Z',
        balance: -50.0,
        isAdmin: false
    },
    {
        id: 3,
        name: 'Charlie Chaplin',
        email: 'charlie@domain.net',
        status: 'Pending',
        registrationDate: '2023-05-01T09:15:00Z',
        balance: 0,
        isAdmin: false
    },
    {
        id: 4,
        name: 'Diana Prince',
        email: 'diana@themyscira.org',
        status: 'Inactive',
        registrationDate: '2022-11-30T23:59:00Z',
        balance: 5000.0,
        isAdmin: false
    },
    {
        id: 5,
        name: 'Ethan Hunt',
        email: 'ethan@imf.gov',
        status: 'Active',
        registrationDate: '2023-07-10T11:00:00Z',
        balance: 750.25,
        isAdmin: false
    },
    {
        id: 6,
        name: 'Fiona Gallagher',
        email: 'fiona@southside.com',
        status: 'Active',
        registrationDate: '2023-02-18T16:45:00Z',
        balance: -200.5,
        isAdmin: false
    },
    {
        id: 7,
        name: 'George Constanza',
        email: 'george@pendant.com',
        status: 'Pending',
        registrationDate: '2023-08-01T12:00:00Z',
        balance: 10.0,
        isAdmin: false
    },
    {
        id: 8,
        name: 'Hannah Montana',
        email: 'hannah@secretstar.tv',
        status: 'Inactive',
        registrationDate: '2023-04-05T18:20:00Z',
        balance: 10000.0,
        isAdmin: false
    },
    {
        id: 9,
        name: 'Isaac Newton',
        email: 'isaac@gravity.uk',
        status: 'Active',
        registrationDate: '2023-06-12T08:00:00Z',
        balance: 999.99,
        isAdmin: false
    },
    {
        id: 10,
        name: 'Jane Doe',
        email: 'jane@anonymous.com',
        status: 'Active',
        registrationDate: '2023-09-01T00:00:00Z',
        balance: 300.0,
        isAdmin: false
    }
];

export const clientColumns: ColumnDefinition<UserData>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    {
        key: 'status',
        label: 'Status',
        sortable: true,
        formatter: (value) => {
            const color =
                value === 'Active'
                    ? 'badge-success'
                    : value === 'Inactive'
                        ? 'badge-error'
                        : 'badge-warning';
            return `<span class="badge ${color} badge-sm">${value}</span>`;
        }
    },
    {
        key: 'registrationDate',
        label: 'Registered On',
        sortable: true,
        formatter: (value) => (value ? new Date(value).toLocaleDateString() : '-')
    },
    {
        key: 'balance',
        label: 'Balance',
        sortable: true,
        component: BalanceCell,
        cellClass: 'text-right font-mono',
        headerClass: 'text-right'
    },
    {
        key: 'isAdmin',
        label: 'Admin',
        formatter: (value) => (value ? '✔️' : '❌'),
        cellClass: 'text-center',
        headerClass: 'text-center'
    }
];