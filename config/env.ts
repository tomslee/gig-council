import Constants from 'expo-constants';

interface Config {
  firebaseEmail: string;
  firebasePassword: string;
}

const config: Config = {
  firebaseEmail: Constants.expoConfig?.extra?.firebaseEmail || '',
  firebasePassword: Constants.expoConfig?.extra?.firebasePassword || '',
};

export default config;
