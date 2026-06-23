import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1B2B5E',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { borderTopColor: '#E5E7EB', paddingTop: 6, height: 60 },
        headerStyle: { backgroundColor: '#1B2B5E' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Tableau de bord', tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} /> }} />
      <Tabs.Screen name="reservations" options={{ title: 'Réservations', tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} /> }} />
      <Tabs.Screen name="housekeeping" options={{ title: 'Housekeeping', tabBarIcon: ({ color, size }) => <Ionicons name="bed" size={size} color={color} /> }} />
      <Tabs.Screen name="maintenance" options={{ title: 'Maintenance', tabBarIcon: ({ color, size }) => <Ionicons name="construct" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tabs>
  );
}
