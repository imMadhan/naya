import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Dimensions, StatusBar, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const LETTERS = ["V", "y", "b", "e"];

export default function VybeSplash() {
  const glowScale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0.2);

  useEffect(() => {
    glowScale.value = withRepeat(
      withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    glowOpacity.value = withRepeat(
      withTiming(0.4, { duration: 2000 }),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Neon Glow Background */}
      <Animated.View style={[styles.glowWrapper, glowStyle]}>
        <LinearGradient colors={["#25343F", "#BFC9D1"]} style={styles.glow} />
      </Animated.View>

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <FloatingParticle key={i} delay={i * 300} />
      ))}

      {/* Letter Reveal */}
      <View style={styles.logoRow}>
        {LETTERS.map((letter, index) => (
          <AnimatedLetter key={index} letter={letter} delay={index * 200} />
        ))}
      </View>

      <Text style={styles.tagline}>Find Your Vybe</Text>
    </View>
  );
}

function AnimatedLetter({ letter, delay }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 12, stiffness: 120 }),
    );
    scale.value = withDelay(delay, withSpring(1));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return <Animated.Text style={[styles.logo, style]}>{letter}</Animated.Text>;
}

function FloatingParticle({ delay }) {
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-50, { duration: 6000, easing: Easing.linear }),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    left: Math.random() * width,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#BFC9D1",
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#15173D",
    justifyContent: "center",
    alignItems: "center",
  },
  glowWrapper: {
    position: "absolute",
  },
  glow: {
    width: 300,
    height: 300,
    borderRadius: 200,
  },
  logoRow: {
    flexDirection: "row",
  },
  logo: {
    fontSize: 54,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 6,
  },
  tagline: {
    marginTop: 20,
    fontSize: 16,
    color: "#EAEFEF",
    letterSpacing: 2,
  },
});
