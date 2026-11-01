export type SportLKRole = 'player' | 'team_manager' | 'organizer' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'disabled';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: SportLKRole[];
  status: AccountStatus;
}
