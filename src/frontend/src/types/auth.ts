export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface AuthUser {
    sub: string;
    exp: number;
    [key: string]: any;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    lockoutEnd?: string;
    displayName: string;
}

export interface ChangePasswordData {
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
}
