import { Injectable, signal } from '@angular/core';

export interface UserProfile {
  name: string;
  profileImage: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly STORAGE_KEY = 'user:profile';

  // Default user profile
  private defaultProfile: UserProfile = {
    name: 'Shihab Rahman',
    profileImage: 'https://i.pravatar.cc/150',
    email: 'shihab@example.com',
  };

  userProfile = signal<UserProfile>(this.defaultProfile);

  constructor() {
    this.loadProfile();
  }

  /**
   * Load user profile from localStorage
   */
  loadProfile(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const profile = JSON.parse(stored) as UserProfile;
        this.userProfile.set(profile);
      } else {
        // Save default profile if none exists
        this.saveProfile(this.defaultProfile);
      }
    } catch (error) {
      console.warn('Failed to load user profile', error);
      this.userProfile.set(this.defaultProfile);
    }
  }

  /**
   * Save user profile to localStorage
   */
  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
      this.userProfile.set(profile);
    } catch (error) {
      console.error('Failed to save user profile', error);
    }
  }

  /**
   * Update user profile
   */
  updateProfile(updates: Partial<UserProfile>): void {
    const currentProfile = this.userProfile();
    const updatedProfile = { ...currentProfile, ...updates };
    this.saveProfile(updatedProfile);
  }

  /**
   * Get greeting message based on time of day
   */
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }
}
