import { router } from "expo-router";
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from "firebase/auth";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { auth } from "../config/firebase";

export default function CambiarPassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const onChangePassword = async () => {
    const user = auth.currentUser;
    const oldPass = currentPassword.trim();
    const newPass = newPassword.trim();
    const confirmPass = confirmPassword.trim();

    if (!user) {
      return Alert.alert("Error", "No hay usuario autenticado.");
    }

    if (!user.email) {
      return Alert.alert("Error", "No se encontró el correo del usuario.");
    }

    if (!oldPass || !newPass || !confirmPass) {
      return Alert.alert(
        "Error",
        "Completa la contraseña actual, la nueva y su confirmación."
      );
    }

    if (newPass.length < 6) {
      return Alert.alert(
        "Error",
        "La nueva contraseña debe tener al menos 6 caracteres."
      );
    }

    if (newPass !== confirmPass) {
      return Alert.alert("Error", "Las nuevas contraseñas no coinciden.");
    }

    if (oldPass === newPass) {
      return Alert.alert(
        "Error",
        "La nueva contraseña no puede ser igual a la actual."
      );
    }

    try {
      setSaving(true);

      const credential = EmailAuthProvider.credential(user.email, oldPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      Alert.alert("Listo", "Tu contraseña fue actualizada correctamente.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      if (error?.code === "auth/wrong-password") {
        return Alert.alert("Error", "La contraseña actual es incorrecta.");
      }

      if (error?.code === "auth/invalid-credential") {
        return Alert.alert("Error", "Las credenciales no son válidas.");
      }

      if (error?.code === "auth/weak-password") {
        return Alert.alert(
          "Error",
          "La nueva contraseña es demasiado débil."
        );
      }

      if (error?.code === "auth/too-many-requests") {
        return Alert.alert(
          "Error",
          "Demasiados intentos. Intenta de nuevo más tarde."
        );
      }

      if (error?.code === "auth/requires-recent-login") {
        return Alert.alert(
          "Error",
          "Debes volver a iniciar sesión antes de cambiar la contraseña."
        );
      }

      Alert.alert("Error", "No se pudo actualizar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F5F6FA" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text
          style={{
            color: "#4DB6AC",
            fontWeight: "700",
            marginBottom: 16,
            marginTop: 15,
          }}
        >
          ← Volver
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "900",
          marginBottom: 18,
        }}
      >
        Cambiar contraseña
      </Text>

      <Text
        style={{
          color: "#666",
          marginBottom: 18,
          lineHeight: 20,
        }}
      >
        Ingresa tu contraseña actual y luego escribe la nueva contraseña dos veces.
      </Text>

      <TextInput
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Contraseña actual"
        secureTextEntry
        editable={!saving}
        style={{
          width: "100%",
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 12,
          padding: 14,
          backgroundColor: "#fff",
          marginBottom: 14,
        }}
      />

      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Nueva contraseña"
        secureTextEntry
        editable={!saving}
        style={{
          width: "100%",
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 12,
          padding: 14,
          backgroundColor: "#fff",
          marginBottom: 14,
        }}
      />

      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirmar nueva contraseña"
        secureTextEntry
        editable={!saving}
        style={{
          width: "100%",
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 12,
          padding: 14,
          backgroundColor: "#fff",
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
        onPress={onChangePassword}
        disabled={saving}
        style={{
          backgroundColor: "#4DB6AC",
          paddingVertical: 14,
          borderRadius: 14,
          alignItems: "center",
          opacity: saving ? 0.7 : 1,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800" }}>
          {saving ? "Guardando..." : "Actualizar contraseña"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}