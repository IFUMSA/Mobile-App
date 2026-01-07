import Constants from 'expo-constants';

export const generateAPIUrl = (relativePath: string) => {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

  // Always use EXPO_PUBLIC_API_BASE_URL if set (for backend API)
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL.concat(path);
  }

  // Fallback: use Expo origin (mainly for Expo API routes, not backend)
  const origin = Constants.experienceUrl?.replace('exp://', 'http://') || 'http://localhost:8081';
  return origin.concat(path);
};
