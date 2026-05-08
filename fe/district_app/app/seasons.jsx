import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

// Use the same BASE_URL as in your dashboard screen
const BASE_URL = 'http://10.229.214.121:8080';

export default function SeasonsScreen() {
  const router = useRouter();
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/seasons`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setSeasons(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching seasons:', err);
        Toast.show({
          type: 'error',
          text1: 'Failed to load seasons',
          text2: 'Please check your internet or server',
          position: 'top',
          visibilityTime: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSeasons();
  }, []);

  const formatDateRange = (start, end) => {
    if (!start || !end) return '—';

    const format = (dateStr) => {
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } catch {
        return dateStr.split('T')[0].split('-').reverse().join('-');
      }
    };

    return `${format(start)} — ${format(end)}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#537D96', '#6A91A8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>All Discount Seasons</Text>

          <View style={{ width: 40 }} /> {/* balance */}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.centerMessage}>
            <ActivityIndicator size="large" color="#537D96" />
            <Text style={styles.loadingText}>Loading seasons...</Text>
          </View>
        ) : seasons.length === 0 ? (
          <View style={styles.centerMessage}>
            <Text style={styles.emptyTitle}>No seasons found</Text>
            <Text style={styles.emptySubtitle}>
              Check back later for festive offers & special sales!
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.intro}>
              Current & upcoming discount seasons
            </Text>

            {seasons.map((season) => (
              <View key={season.id} style={styles.seasonCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.seasonName}>{season.title}</Text>
                  <View style={styles.dateTag}>
                    <Text style={styles.dateText}>
                      {formatDateRange(season.startDate, season.endDate)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.description}>
                  {season.description}
                </Text>

                {/* You can add more actions later */}
                {/* <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionText}>View participating offers →</Text>
                </TouchableOpacity> */}
              </View>
            ))}

            <View style={{ height: 60 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F0E4',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backArrow: {
    fontSize: 28,
    color: 'white',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  intro: {
    fontSize: 16,
    color: '#537D96',
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  centerMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#537D96',
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#537D96',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8B9DAB',
    textAlign: 'center',
    lineHeight: 22,
  },
  seasonCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EC8F8D15',
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  seasonName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D32F2F',
    flex: 1,
    marginRight: 12,
  },
  dateTag: {
    backgroundColor: '#537D9610',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#537D96',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    marginBottom: 8,
  },
  actionButton: {
    marginTop: 12,
    backgroundColor: '#EC8F8D',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
});