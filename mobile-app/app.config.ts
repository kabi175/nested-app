import 'dotenv/config';

module.exports = () => ({
  expo: {
    name: "NestEd",
    slug: "nested",
    owner: "kabi175",
    version: "1.4.2",
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
        NSUserTrackingUsageDescription: "This identifier will be used to deliver personalized ads."
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
      ["expo-tracking-transparency"],
      [
        "react-native-fbsdk-next",
        {
          "appID": process.env.FB_APP_ID,
          "clientToken": process.env.FB_CLIENT_TOKEN,
          "displayName": "Nested",
          "scheme": "nested",
          "advertiserIDCollectionEnabled": true,
          "autoLogAppEventsEnabled": true,
          "isAutoInitEnabled": true
        }
      ]
    ],
    extra: {
      router: {},
      eas: {
        projectId: "6477a09a-e718-4279-a315-efd930313c29",
      },
    },
  },
});
