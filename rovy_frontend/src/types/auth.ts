export interface User {
  id: string;
  email: string;
  coPilotProfile?: { isActive: boolean };
}

export interface Profile {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  onboardingCompleted: boolean;
  name?: string | null;
  age?: number | null;
  gender?: string | null;
  vehicleType?: string | null;
  buildStatus?: string | null;
  rigPhotoUrl?: string | null;
  coPilotProfile?: { isActive: boolean };
}

export interface OnboardingData {
  username: string;
  name: string;
  age: number;
  gender: string;
  vehicleType: string;
  buildStatus: string;
  avatarUrl?: string;
  rigPhotoUrl?: string;
}

export interface AuthResponse {
  data: {
    user: User;
    session: {
      access_token: string;
      refresh_token: string;
    };
    profile: Profile;
  };
}
