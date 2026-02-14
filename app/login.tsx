import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { auth } from "../config/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  return (
    <View style={{ padding: 20, gap: 10 }}>
      <TextInput placeholder="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />

      <Button title="Entrar" onPress={onLogin} />
      <Button title="Volver a Registro" onPress={() => router.push("/registro")} />
    </View>
  );
}