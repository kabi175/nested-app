module.exports = () => ({
  expo: {
    name: "NestEd",
    slug: "nested",
    owner: "kabi175",
    icon: "./assets/images/icon.png",
    scheme: "nested",
    android: {
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
      package: "com.nexted.app",
      intentFilters: {
        action: "VIEW",
        category: ["BROWSABLE", "DEFAULT"],
        data: [
          {
            scheme: "upi",
          },
        ],
      },
    },
    ios: {
      googleServicesFile: "./GoogleService-Info.plist",
      bundleIdentifier: "com.nexted.app",
      infoPlist: {
        LSApplicationQueriesSchemes: ["whatsapp"],
      },
    },
    plugins: [
      "expo-web-browser",
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
      [
        "react-native-auth0",
        {
          domain: "dev-yscagulfy0qamarm.us.auth0.com",
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
