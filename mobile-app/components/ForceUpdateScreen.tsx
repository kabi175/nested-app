import { VersionConfig } from '@/api/versionApi';
import { getStoreUrl } from '@/hooks/useForceUpdate';
import { DownloadCloud } from 'lucide-react-native';
import React from 'react';
import { BackHandler, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface ForceUpdateScreenProps {
  config: VersionConfig | null;
}

export const ForceUpdateScreen: React.FC<ForceUpdateScreenProps> = ({ config }) => {
  // Prevent back button on Android to ensure the app is blocked
  React.useEffect(() => {
    const backAction = () => true; // Returning true disables the back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleUpdate = async () => {
    const url = getStoreUrl(config);
    if (url) {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <DownloadCloud size={80} color="#2563EB" />
          </View>
          
          <ThemedText type="title" style={styles.title}>Update Required</ThemedText>
          
          <ThemedText style={styles.message}>
            {config?.message || "A new version of the app is available. Please update to the latest version to continue using the application."}
          </ThemedText>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleUpdate}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.buttonText}>Update Now</ThemedText>
            </TouchableOpacity>
            
            {config && (
              <ThemedText style={styles.versionInfo}>
                New version: {config.latestVersion}
              </ThemedText>
            )}
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fallback
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    backgroundColor: '#EFF6FF',
    padding: 30,
    borderRadius: 60,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 28,
  },
  message: {
    textAlign: 'center',
    marginBottom: 48,
    opacity: 0.8,
    lineHeight: 24,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2563EB',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  versionInfo: {
    marginTop: 20,
    fontSize: 14,
    opacity: 0.4,
  }
});
