import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

const BASE_URL = 'http://10.229.214.121:8080';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [voucher, setVoucher] = useState(null);   // claimed voucher object
  const [claiming, setClaiming] = useState(false);
  const [using, setUsing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // ── Load userId from AsyncStorage ─────────────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('userData');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUserId(parsed.id);
        }
      } catch (e) {
        console.error('Failed to read userId from storage:', e);
      }
    };
    loadUser();
  }, []);

  // ── Pre-fetch favorites to set initial heart state ─────────────────────────
  useEffect(() => {
    if (!userId || !id) return;
    const checkFav = async () => {
      try {
        const res = await fetch(`${BASE_URL}/favorites/user/${userId}`);
        if (!res.ok) return;
        const list = await res.json();
        if (Array.isArray(list)) {
          setIsFav(list.some((p) => String(p.id) === String(id)));
        }
      } catch (_) { }
    };
    checkFav();
  }, [userId, id]);

  // ── Toggle favourite ───────────────────────────────────────────────────────
  const handleToggleFav = async () => {
    if (!userId) {
      Toast.show({ type: 'error', text1: 'Please log in to save favourites', position: 'top' });
      return;
    }
    setFavLoading(true);
    const nextFav = !isFav;
    try {
      const url = `${BASE_URL}/favorites/${nextFav ? 'add' : 'remove'}?userId=${userId}&productId=${id}`;
      const res = await fetch(url, {
        method: nextFav ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setIsFav(nextFav);
      Toast.show({
        type: 'success',
        text1: nextFav ? '❤️ Added to Favourites' : '💔 Removed from Favourites',
        position: 'top',
        visibilityTime: 2000,
      });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Could not update favourites', text2: err.message, position: 'top' });
    } finally {
      setFavLoading(false);
    }
  };

  // ── Fetch product ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${BASE_URL}/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Failed to load product', position: 'top' });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ── Claim voucher ─────────────────────────────────────────────────────────
  const handleClaimVoucher = async () => {
    if (!product) return;
    setClaiming(true);
    try {
      if (!userId) throw new Error('User not logged in');
      const url = `${BASE_URL}/vouchers/claim?userId=${userId}&productId=${id}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || `Error ${res.status}`);
      }
      const data = await res.json();
      setVoucher(data);
      setModalVisible(true);
      // Optimistic update: decrement available count
      setProduct((prev) => ({
        ...prev,
        availableDiscountVouchers: prev.availableDiscountVouchers - 1,
      }));
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to claim voucher',
        text2: err.message || 'Please try again',
        position: 'top',
        visibilityTime: 5000,
      });
    } finally {
      setClaiming(false);
    }
  };

  // ── Use voucher ───────────────────────────────────────────────────────────
  const handleUseVoucher = async () => {
    if (!voucher) return;
    Alert.alert(
      'Use Voucher',
      `Mark voucher "${voucher.voucherCode}" as used?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Use',
          style: 'destructive',
          onPress: async () => {
            setUsing(true);
            try {
              const res = await fetch(`${BASE_URL}/vouchers/use/${voucher.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
              });
              if (!res.ok) throw new Error(`Error ${res.status}`);
              const data = await res.json();
              setVoucher(data);
              Toast.show({
                type: 'success',
                text1: 'Voucher Used!',
                text2: 'The voucher has been marked as used.',
                position: 'top',
              });
            } catch (err) {
              Toast.show({
                type: 'error',
                text1: 'Failed to use voucher',
                text2: err.message,
                position: 'top',
              });
            } finally {
              setUsing(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // ── Download voucher ──────────────────────────────────────────────────────
  const handleDownloadVoucher = async () => {
    if (!voucher) return;
    const downloadUrl = `${BASE_URL}/vouchers/download/${voucher.id}`;
    try {
      const supported = await Linking.canOpenURL(downloadUrl);
      if (supported) {
        await Linking.openURL(downloadUrl);
      } else {
        Toast.show({ type: 'error', text1: 'Cannot open download link', position: 'top' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Download failed', text2: err.message, position: 'top' });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#537D96" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ padding: 20, color: '#537D96' }}>Product not found</Text>
      </SafeAreaView>
    );
  }

  const discountedPrice = (product.price * (1 - product.discount / 100)).toFixed(0);
  const vouchersLeft = product.availableDiscountVouchers;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header image + overlaid fav/back buttons */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.imageUrl }} style={styles.headerImage} />
          {/* Back button overlay */}
          <TouchableOpacity
            style={styles.imageBackBtn}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/UserDashboardScreen'))}
            activeOpacity={0.8}
          >
            <Text style={styles.imageBackBtnText}>←</Text>
          </TouchableOpacity>
          {/* Favourite button overlay */}
          <TouchableOpacity
            style={[styles.favBtn, isFav && styles.favBtnActive]}
            onPress={handleToggleFav}
            disabled={favLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.favBtnText}>{isFav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Name */}
          <Text style={styles.name}>{product.productName}</Text>

          {/* Price row */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{discountedPrice}</Text>
            {product.discount > 0 && (
              <Text style={styles.original}>₹{product.price.toFixed(0)}</Text>
            )}
            {product.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{product.discount}% OFF</Text>
              </View>
            )}
          </View>

          {/* Business & category */}
          <Text style={styles.business}>From: {product.business?.name || 'Local Business'}</Text>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.validity}>Valid until: {product.validityDate}</Text>

          {/* Voucher availability */}
          <View style={styles.voucherInfo}>
            <View style={styles.voucherStat}>
              <Text style={styles.voucherStatNum}>{vouchersLeft}</Text>
              <Text style={styles.voucherStatLabel}>Available</Text>
            </View>
            <View style={styles.voucherDivider} />
            <View style={styles.voucherStat}>
              <Text style={styles.voucherStatNum}>{product.totalDiscountVouchers}</Text>
              <Text style={styles.voucherStatLabel}>Total</Text>
            </View>
            <View style={styles.voucherDivider} />
            <View style={styles.voucherStat}>
              <Text style={styles.voucherStatNum}>{product.soldDiscountVouchers ?? product.totalDiscountVouchers - vouchersLeft}</Text>
              <Text style={styles.voucherStatLabel}>Claimed</Text>
            </View>
          </View>

          {/* ── CLAIM VOUCHER BUTTON ── */}
          {!voucher ? (
            vouchersLeft > 0 ? (
              <TouchableOpacity
                style={[styles.claimBtn, claiming && styles.btnDisabled]}
                onPress={handleClaimVoucher}
                disabled={claiming}
                activeOpacity={0.8}
              >
                {claiming ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.claimBtnText}>🎟  Claim Voucher</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.noVouchersBox}>
                <Text style={styles.noVouchersText}>😔  No vouchers left</Text>
              </View>
            )
          ) : (
            /* ── POST-CLAIM actions ── */
            <TouchableOpacity
              style={styles.viewVoucherBtn}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.viewVoucherText}>🎟  View My Voucher</Text>
            </TouchableOpacity>
          )}

          {/* Discount season */}
          {product.discountSeason && (
            <View style={styles.seasonBox}>
              <Text style={styles.seasonTitle}>{product.discountSeason.title}</Text>
              <Text style={styles.seasonDates}>
                {product.discountSeason.startDate} – {product.discountSeason.endDate}
              </Text>
              <Text style={styles.seasonDesc}>{product.discountSeason.description}</Text>
            </View>
          )}

          {/* Description */}
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

        </View>
      </ScrollView>

      {/* ══════════════════════════════════════════════
          VOUCHER MODAL
      ══════════════════════════════════════════════ */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Close */}
            <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Your Voucher</Text>

            {voucher && (
              <>
                {/* Voucher code */}
                <View style={styles.codeBox}>
                  <Text style={styles.codeLabel}>Voucher Code</Text>
                  <Text style={styles.codeValue}>{voucher.voucherCode}</Text>
                </View>

                <View style={styles.modalDetails}>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Product</Text>
                    <Text style={styles.modalDetailValue}>{voucher.product?.productName}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Claimed on</Text>
                    <Text style={styles.modalDetailValue}>{voucher.downloadDate}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Status</Text>
                    <View style={[styles.statusBadge, voucher.used ? styles.statusUsed : styles.statusActive]}>
                      <Text style={styles.statusText}>{voucher.used ? 'Used' : 'Active'}</Text>
                    </View>
                  </View>
                </View>

                {/* Action buttons */}
                <View style={styles.modalActions}>
                  {/* Download */}
                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.downloadBtn]}
                    onPress={handleDownloadVoucher}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalActionText}>⬇  Download</Text>
                  </TouchableOpacity>

                  {/* Use */}
                  {!voucher.used && (
                    <TouchableOpacity
                      style={[styles.modalActionBtn, styles.useBtn, using && styles.btnDisabled]}
                      onPress={handleUseVoucher}
                      disabled={using}
                      activeOpacity={0.8}
                    >
                      {using ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.modalActionText}>✓  Use Voucher</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F0E4' },

  // ── Image with overlaid buttons ───────────────────────────────────────────
  imageContainer: { position: 'relative' },
  headerImage: { width: '100%', height: 280 },
  imageBackBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBackBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  favBtn: {
    position: 'absolute',
    top: 48,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtnActive: { backgroundColor: 'rgba(236,143,141,0.75)' },
  favBtnText: { fontSize: 20 },
  content: { padding: 20 },

  name: { fontSize: 26, fontWeight: '800', color: '#537D96', marginBottom: 12 },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  price: { fontSize: 32, fontWeight: '900', color: '#EC8F8D' },
  original: { fontSize: 20, color: '#8B9DAB', textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  discountText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  business: { fontSize: 16, color: '#537D96', marginBottom: 6 },
  category: { fontSize: 15, color: '#8B9DAB', marginBottom: 8 },
  validity: { fontSize: 15, color: '#537D96', fontWeight: '600', marginBottom: 20 },

  // ── Voucher stats strip ──────────────────────────────────────────────────
  voucherInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 24,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  voucherStat: { alignItems: 'center', flex: 1 },
  voucherStatNum: { fontSize: 22, fontWeight: '900', color: '#EC8F8D' },
  voucherStatLabel: { fontSize: 12, color: '#8B9DAB', marginTop: 2 },
  voucherDivider: { width: 1, height: 36, backgroundColor: '#E0D9CC' },

  // ── Claim button ─────────────────────────────────────────────────────────
  claimBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  claimBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  viewVoucherBtn: {
    backgroundColor: '#537D96',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#537D96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  viewVoucherText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  noVouchersBox: {
    backgroundColor: '#D32F2F12',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  noVouchersText: { color: '#D32F2F', fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },

  // ── Season box ───────────────────────────────────────────────────────────
  seasonBox: { backgroundColor: '#EC8F8D15', padding: 16, borderRadius: 16, marginBottom: 24 },
  seasonTitle: { fontSize: 18, fontWeight: '800', color: '#D32F2F' },
  seasonDates: { color: '#537D96', marginTop: 4, fontWeight: '600' },
  seasonDesc: { marginTop: 8, color: '#8B9DAB' },

  descriptionTitle: { fontSize: 20, fontWeight: '800', color: '#537D96', marginBottom: 12 },
  description: { fontSize: 16, color: '#537D96', lineHeight: 24, marginBottom: 24 },

  backBtn: { backgroundColor: '#537D96', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  backText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  // ── Modal ────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FDFAF4',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
  },
  modalClose: {
    alignSelf: 'flex-end',
    backgroundColor: '#E8E0D0',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalCloseText: { color: '#537D96', fontWeight: '700', fontSize: 15 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#537D96', marginBottom: 20 },

  codeBox: {
    backgroundColor: '#537D9615',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  codeLabel: { fontSize: 12, color: '#8B9DAB', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  codeValue: { fontSize: 15, fontWeight: '800', color: '#537D96', letterSpacing: 1.5 },

  modalDetails: { marginBottom: 24 },
  modalDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EDE6D8' },
  modalDetailLabel: { fontSize: 14, color: '#8B9DAB' },
  modalDetailValue: { fontSize: 14, fontWeight: '700', color: '#537D96' },

  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  statusActive: { backgroundColor: '#4CAF5020' },
  statusUsed: { backgroundColor: '#D32F2F20' },
  statusText: { fontWeight: '700', fontSize: 13 },

  modalActions: { flexDirection: 'row', gap: 12 },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  downloadBtn: { backgroundColor: '#537D96' },
  useBtn: { backgroundColor: '#4CAF50' },
  modalActionText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});