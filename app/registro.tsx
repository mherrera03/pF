import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { auth } from "../config/firebase";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Completa usuario, correo y contraseña.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: username.trim() });

      Alert.alert("OK", "Usuario creado.");
      router.replace("/(tabs)");
    } catch (e: any) {
      const msg =
        e?.code === "auth/email-already-in-use"
          ? "Ese correo ya está registrado."
          : e?.code === "auth/invalid-email"
          ? "Correo inválido."
          : e?.code === "auth/weak-password"
          ? "Contraseña muy débil."
          : "Error al registrar.";
      Alert.alert("Error", msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PATITAS FELICES</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Correo"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <View style={styles.button}>
          <Button title="Registrarme" onPress={onRegister} color="#F8A5C2" />
        </View>

        <View style={styles.button}>
          <Button title="Ir a Login" onPress={() => router.push("/login")} color="#A0E7E5" />
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
  button: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 5,
  },
});
