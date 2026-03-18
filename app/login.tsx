import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../config/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Completa correo y contraseña.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Credenciales incorrectas.");
    }
  };

  const onForgotPassword = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      Alert.alert(
        "Correo requerido",
        "Escribe tu correo para enviarte el enlace de recuperación."
      );
      return;
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      Alert.alert(
        "Correo enviado",
        "Te enviamos un enlace para restablecer tu contraseña."
      );
    } catch (error: any) {
      if (error?.code === "auth/user-not-found") {
        Alert.alert("Error", "No existe una cuenta con ese correo.");
        return;
      }

      if (error?.code === "auth/invalid-email") {
        Alert.alert("Error", "El correo no es válido.");
        return;
      }

      Alert.alert("Error", "No se pudo enviar el correo de recuperación.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PATITAS FELICES</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Correo"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#999"
          returnKeyType="next"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#999"
            returnKeyType="done"
            onSubmitEditing={onLogin}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialCommunityIcons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#777"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onForgotPassword}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <View style={styles.button}>
          <Button title="Entrar" onPress={onLogin} color="#863ac9" />
        </View>

        <View style={styles.button}>
          <Button
            title="Registrarse"
            onPress={() => router.push("/registro")}
            color="#5bb7b4"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7FB",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#555",
    letterSpacing: 2,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  input: {
    backgroundColor: "#F1F2F6",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  passwordContainer: {
    backgroundColor: "#F1F2F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  forgotText: {
    textAlign: "right",
    color: "#863ac9",
    fontWeight: "600",
    marginTop: -2,
  },
  button: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 5,
  },
});