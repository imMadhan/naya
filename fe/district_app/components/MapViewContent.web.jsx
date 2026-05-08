import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapViewScreen() {
    const { lat, lng, name } = useLocalSearchParams();
    const router = useRouter();

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text>Invalid coordinates</Text>
                    <TouchableOpacity style={styles.backButtonInline} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const openInGoogleMaps = () => {
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        Linking.openURL(url);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.center}>
                <View style={styles.webMapPlaceholder}>
                    <Text style={styles.webMapIcon}>📍</Text>
                    <Text style={styles.shopName}>{name || 'Shop Location'}</Text>
                    <Text style={styles.coords}>
                        Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
                    </Text>

                    <TouchableOpacity
                        style={styles.openButton}
                        onPress={openInGoogleMaps}
                    >
                        <Text style={styles.openButtonText}>Open in Google Maps</Text>
                    </TouchableOpacity>

                    <Text style={styles.note}>
                        Interactive maps are currently available on mobile App.
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F0E4',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    webMapPlaceholder: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#537D96',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    webMapIcon: {
        fontSize: 64,
        marginBottom: 20,
    },
    shopName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#537D96',
        marginBottom: 8,
        textAlign: 'center',
    },
    coords: {
        fontSize: 16,
        color: '#8B9DAB',
        marginBottom: 24,
    },
    openButton: {
        backgroundColor: '#537D96',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    openButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    note: {
        fontSize: 12,
        color: '#8B9DAB',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    backButtonInline: {
        marginTop: 20,
        backgroundColor: '#537D96',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    backButtonText: {
        fontWeight: 'bold',
        color: '#537D96',
    },
});
