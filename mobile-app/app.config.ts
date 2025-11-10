module.exports = () => ({
  expo: {
    name: "NextEd",
    slug: "nested",
    owner: "kabi175",
    icon: "./assets/images/icon.png",
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
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you upload your signature.",
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
