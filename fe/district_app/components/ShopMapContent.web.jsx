import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ShopMap({ shop }) {
  const latitude = parseFloat(shop.latitude);
  const longitude = parseFloat(shop.longitude);

  return (
    <View style={styles.mapCard}>
      <Text style={styles.cardTitle}>Location</Text>
      <View style={styles.webMapPlaceholder}>
        <Text style={styles.webMapIcon}>📍</Text>
        <Text style={styles.webMapText}>
          Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
        </Text>
        <TouchableOpacity 
          style={styles.webMapButton}
          onPress={() => {
            const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
            Linking.openURL(url);
          }}
        >
          <Text style={styles.webMapButtonText}>Open in Google Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#537D96',
    marginBottom: 16,
  },
  webMapPlaceholder: {
    width: '100%',
    padding: 20,
    backgroundColor: '#F4F0E4',
    borderRadius: 12,
    alignItems: 'center',
  },
  webMapIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  webMapText: {
    fontSize: 14,
    color: '#537D96',
    marginBottom: 16,
    fontWeight: '600',
  },
  webMapButton: {
    backgroundColor: '#537D96',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  webMapButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
