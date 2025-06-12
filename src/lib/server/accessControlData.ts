// --- START JSON-BASED ACCESS CONTROL DATA (TEMPORARY) ---
// This section uses JSON files for roles, permissions, and hierarchy.
// It will be replaced with Drizzle ORM queries to a database when the architecture is finalized.

import rolesData from '../../../memory-bank/rbac-test-data/roles.json';
import permissionsData from '../../../memory-bank/rbac-test-data/permissions.json';
import userRolesData from '../../../memory-bank/rbac-test-data/userRoles.json';
import rolePermissionsData from '../../../memory-bank/rbac-test-data/rolePermissions.json';
import roleHierarchyData from '../../../memory-bank/rbac-test-data/roleHierarchy.json';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for file system operations
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths to JSON files relative to this module
const USER_ROLES_JSON_PATH = path.resolve(__dirname, '../../../memory-bank/rbac-test-data/userRoles.json');

// Export the loaded data for use in other modules
export const roles = rolesData;
export const permissions = permissionsData;
export let userRoles = userRolesData; // Use `let` because we will modify this
export const rolePermissions = rolePermissionsData;
export const roleHierarchy = roleHierarchyData;

// --- Mapped data for faster lookups ---
const userRolesMap = new Map<string, string[]>();
userRoles.forEach((ur: { userId: string; roleId: string }) => {
    if (!userRolesMap.has(ur.userId)) {
        userRolesMap.set(ur.userId, []);
    }
    userRolesMap.get(ur.userId)?.push(ur.roleId);
});

const rolePermissionsMap = new Map<string, string[]>();
rolePermissions.forEach((rp: { roleId: string; permissionId: string }) => {
    if (!rolePermissionsMap.has(rp.roleId)) {
        rolePermissionsMap.set(rp.roleId, []);
    }
    rolePermissionsMap.get(rp.roleId)?.push(rp.permissionId);
});

// --- Public functions to access data ---

/**
 * Retrieves all role IDs assigned to a specific user.
 * @param userId The ID of the user.
 * @returns An array of role IDs.
 */
export function getUserRoles(userId: string): string[] {
    return userRolesMap.get(userId) || [];
}

/**
 * Retrieves all permission IDs assigned to a specific role.
 * @param roleId The ID of the role.
 * @returns An array of permission IDs.
 */
export function getRolePermissions(roleId: string): string[] {
    return rolePermissionsMap.get(roleId) || [];
}

/**
 * Checks if a child role is a descendant of a parent role in the hierarchy.
 * @param parentRoleId The ID of the potential parent role.
 * @param childRoleId The ID of the potential child role.
 * @returns True if childRoleId is a sub-role of parentRoleId, false otherwise.
 */
export function isSubRole(parentRoleId: string, childRoleId: string): boolean {
    if (parentRoleId === childRoleId) return true; // A role is a sub-role of itself

    const directChildren = roleHierarchy
        .filter((link: { parentRoleId: string; childRoleId: string }) => link.parentRoleId === parentRoleId)
        .map((link: { parentRoleId: string; childRoleId: string }) => link.childRoleId);

    // Check direct children
    if (directChildren.includes(childRoleId)) return true;

    // Recursively check grandchildren
    for (const child of directChildren) {
        if (isSubRole(child, childRoleId)) return true;
    }

    return false;
}

/**
 * Updates the roles assigned to a user and persists the change to userRoles.json.
 * @param userId The ID of the user to update.
 * @param newRoleIds An array of new role IDs to assign to the user.
 */
export function updateUserRolesJson(userId: string, newRoleIds: string[]): void {
    // Remove existing entries for the user
    userRoles = userRoles.filter((ur: { userId: string; roleId: string }) => ur.userId !== userId);

    // Add new entries
    newRoleIds.forEach(roleId => {
        userRoles.push({ userId, roleId });
    });

    // Update the in-memory map
    userRolesMap.set(userId, newRoleIds);

    // Persist to file
    try {
        writeFileSync(USER_ROLES_JSON_PATH, JSON.stringify(userRoles, null, 4));
        console.log(`Updated roles for user ${userId} in ${USER_ROLES_JSON_PATH}`);
    } catch (error) {
        console.error(`Failed to write to ${USER_ROLES_JSON_PATH}:`, error);
        throw new Error('Failed to persist user roles.');
    }
}

// --- END JSON-BASED ACCESS CONTROL DATA (TEMPORARY) ---
