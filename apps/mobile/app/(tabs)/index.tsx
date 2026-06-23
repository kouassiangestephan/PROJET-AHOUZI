import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';

const kpis = [
  { label: 'Taux d\'occupation', value: '78%', icon: 'bed', color: '#1B2B5E', sub: '94/120 chambres' },
  { label: 'Revenus du mois', value: '7,1M XOF', icon: 'cash', color: '#D4A017', sub: 'Décembre 2024' },
  { label: 'Check-ins aujourd\'hui', value: '12', icon: 'log-in', color: '#10B981', sub: '5 check-outs' },
  { label: 'Maintenance ouverte', value: '8', icon: 'construct', color: '#F59E0B', sub: '3 urgents' },
];

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1B2B5E" />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('fr-CI', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AU</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Indicateurs clés</Text>
        <View style={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <View key={kpi.label} style={[styles.kpiCard, { borderLeftColor: kpi.color }]}>
              <View style={[styles.kpiIcon, { backgroundColor: kpi.color + '20' }]}>
                <Ionicons name={kpi.icon as any} size={20} color={kpi.color} />
              </View>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={styles.kpiSub}>{kpi.sub}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsGrid}>
          {[
            { label: 'Check-in', icon: 'log-in', color: '#1B2B5E' },
            { label: 'Check-out', icon: 'log-out', color: '#EF4444' },
            { label: 'Réservation', icon: 'calendar-plus', color: '#10B981' },
            { label: 'Ticket', icon: 'build', color: '#F59E0B' },
          ].map((action) => (
            <TouchableOpacity key={action.label} style={[styles.actionBtn, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon as any} size={24} color="#fff" />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  date: { fontSize: 13, color: '#6B7280', marginTop: 2, textTransform: 'capitalize' },
  avatar: { width: 44, height: 44, backgroundColor: '#1B2B5E', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginHorizontal: 20, marginTop: 16, marginBottom: 10 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10 },
  kpiCard: { width: '46%', marginHorizontal: 4, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  kpiIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  kpiValue: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  kpiLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  kpiSub: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, paddingBottom: 30 },
  actionBtn: { width: '46%', marginHorizontal: 4, borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  actionLabel: { color: '#fff', fontWeight: '700', marginTop: 8, fontSize: 13 },
});
