module.exports = () => ({
  expo: {
    name: "NestEd",
    slug: "nested",
    owner: "kabi175",
    version: "1.4.0",
    icon: "./assets/images/icon.png",
    scheme: "nested",
    android: {
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
      bundleIdentifier: "com.nexted.app",
      infoPlist: {
        LSApplicationQueriesSchemes: ["whatsapp"],
      },
    },
    plugins: [
      "expo-web-browser",
      "expo-router",
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
          customScheme: "nested",
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
