/**
 * User Roles - Định nghĩa các role trong hệ thống
 */

/**
 * Enum cho các role trong hệ thống
 */
export enum UserRole {
  CLIENT = 'CLIENT',
  STAFF = 'STAFF',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

/**
 * Type cho role
 */
export type Role = UserRole.CLIENT | UserRole.STAFF | UserRole.MANAGER | UserRole.ADMIN;

/**
 * Array chứa tất cả các role
 */
export const ROLES = Object.values(UserRole) as Role[];

/**
 * Kiểm tra xem role có phải là admin không
 */
export const isAdmin = (role: string | Role): boolean => {
  return role === UserRole.ADMIN;
};

/**
 * Kiểm tra xem role có phải là client không
 */
export const isClient = (role: string | Role): boolean => {
  return role === UserRole.CLIENT;
};

/**
 * Kiểm tra xem role có phải là staff không
 */
export const isStaff = (role: string | Role): boolean => {
  return role === UserRole.STAFF;
};

/**
 * Kiểm tra xem role có phải là manager không
 */
export const isManager = (role: string | Role): boolean => {
  return role === UserRole.MANAGER;
};

/**
 * Lấy label tiếng Việt cho role
 */
export const getRoleLabel = (role: Role | string): string => {
  const roleMap: Record<string, string> = {
    [UserRole.CLIENT]: 'Khách hàng',
    [UserRole.STAFF]: 'Nhân viên',
    [UserRole.MANAGER]: 'Quản lý',
    [UserRole.ADMIN]: 'Quản trị viên',
  };
  return roleMap[role] || role;
};

/**
 * Kiểm tra xem role có phải là admin, manager hoặc staff không (có quyền vào khu vực quản lý)
 */
export const isManagementRole = (role: string | Role): boolean => {
  return isAdmin(role) || isStaff(role) || isManager(role);
};

/**
 * Kiểm tra xem role có hợp lệ không
 */
export const isValidRole = (role: string): role is Role => {
  return ROLES.includes(role as Role);
};
