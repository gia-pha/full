import type { Role } from '../types';

export const defaultRoles: Role[] = [
  {
    name: 'admin',
    label: 'Admin',
    color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
  {
    name: 'treasurer',
    label: 'Treasurer',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  },
  {
    name: 'editor',
    label: 'Editor',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  {
    name: 'member',
    label: 'Member',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  },
];
