import type { User } from '../types';

export const authService = {
  async getCurrentUser(): Promise<User> {
    return {
      name: 'Fahad Al-Harbi',
      avatarInitials: 'FH',
      upiId: 'fahad@sarie',
      mobile: '+966 50 123 4567',
      email: 'fahad.alharbi@email.sa',
    };
  },
};
