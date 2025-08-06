import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "gig-council", // Update this
  slug: "gig-council", // Update this
  extra: {
    firebaseEmail: process.env.FIREBASE_EMAIL,
    firebasePassword: process.env.FIREBASE_PASSWORD,
  },
});
