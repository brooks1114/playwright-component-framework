// constants/dropdown-values.ts
export const DROPDOWN = {
    ROLE: {
        ADMIN: 'admin',
        USER: 'user',
        GUEST: 'guest',
    } as const,
    COUNTRY: {
        USA: 'US',
        CANADA: 'CA',
        UK: 'GB',
    } as const,
    THEME: {
        LIGHT: 'light',
        DARK: 'dark',
    } as const,
} as const;