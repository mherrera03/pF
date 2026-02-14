import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
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
      router.replace("/(tabs)"); // o cámbialo por /login si prefieres
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
    <View style={{ padding: 20, gap: 10 }}>
      <TextInput placeholder="Nombre de usuario" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput placeholder="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />

      <Button title="Registrarme" onPress={onRegister} />
      <Button title="Ir a Login" onPress={() => router.push("/login")} />
    </View>
  );
}