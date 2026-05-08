import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Only import MapView on native platforms
let MapView, Marker;
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch (e) {
    console.log('react-native-maps not available');
  }
}

export default function ShopMap({ shop }) {
  const latitude = parseFloat(shop.latitude);
  const longitude = parseFloat(shop.longitude);

  // Web fallback
  if (Platform.OS === 'web') {
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

  // Native MapView
  if (!MapView || !Marker) {
    return null;
  }

  return (
    <View style={styles.mapCard}>
      <Text style={styles.cardTitle}>Location</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={shop.name}
          description={shop.address}
        />
      </MapView>
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
  map: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
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
