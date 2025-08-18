import { ToastProvider } from '@/components/ui/toast';
import { Stack, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { auth2 } from './firebaseConfig'; // ajusta la ruta según la ubicación

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth2, (user) => {
      console.log('onAuthStateChanged', user);
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (user && !inAuthGroup) {
      router.replace('/(auth)/home');
    } else if (!user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, initializing]);

  // 🔹 Splash Screen personalizado con fondo blanco y logo
  if (initializing)
    return (
      <View style={styles.splash}>
        <Image
          source={require('../assets/images/BlueLogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );

  return (
    <ToastProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Login', headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#FFFFFF', // ⚪ Fondo blanco
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,   // puedes ajustar el tamaño
    height: 180,
  },
});
