import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import Button from './Button';

export interface ErrorScreenProps {
  /** The error message to display */
  errorMessage?: string;
}

export default function ErrorScreen({ 
  errorMessage = "Something went wrong. Please try again later." 
}: ErrorScreenProps) {
  const router = useRouter();

  const handleGoHome = () => {
    // Navigate back to the home screen
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <AlertCircle size={64} color="#EF4444" />
      </View>
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.message}>{errorMessage}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Go to Home" onPress={handleGoHome} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC', // Slate 50 to match other screens
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    color: '#0F172A', // Slate 900
  },
  message: {
    fontSize: 16,
    color: '#64748B', // Slate 500
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
  }
});
