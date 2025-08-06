import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "gig-council", // Update this
  slug: "gig-council", // Update this
  extra: {
    eas: {
      projectId: "88ce4772-2bf3-4c9d-a4c4-aa54d278be72"
    }
  },
});
