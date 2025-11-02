module.exports = () => ({
  expo: {
    name: "NextEd",
    slug: "nested",
    owner: "kabi175",
    android: {
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
      package: "com.nexted.app",
    },
    ios: {
      googleServicesFile: "./GoogleService-Info.plist",
      bundleIdentifier: "com.nexted.app",
    },
    plugins: [
      "expo-router",
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/crashlytics",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
        },
      ],
    ],
    extra: {
      router: {},
      eas: {
        projectId: "6477a09a-e718-4279-a315-efd930313c29",
      },
    },
  },
});
