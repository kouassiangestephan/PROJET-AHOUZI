import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) { setError('Veuillez remplir tous les champs'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { accessToken, refreshToken } = data.data;
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>A</Text>
        </View>
        <Text style={styles.title}>AHOUZI</Text>
        <Text style={styles.subtitle}>Villas Ahouzi</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Connexion</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="vous@ahouzi.ci"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1B2B5E', justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 72, height: 72, backgroundColor: '#D4A017', borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10 },
  logoText: { fontSize: 32, fontWeight: 'bold', color: '#1B2B5E' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', letterSpacing: 2 },
  subtitle: { fontSize: 14, color: '#D4A017', marginTop: 4 },
  form: { backgroundColor: '#fff', borderRadius: 24, padding: 28, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20 },
  formTitle: { fontSize: 22, fontWeight: 'bold', color: '#1B2B5E', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, backgroundColor: '#F9FAFB', color: '#111827' },
  error: { color: '#EF4444', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: '#1B2B5E', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: '#1B2B5E', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
