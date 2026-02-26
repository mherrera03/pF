import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../config/firebase";
import { uploadToImageKit } from "../../services/imageUpload";

export default function Perfil() {
  const [loadingUser, setLoadingUser] = useState(true);

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");

  const [photoUri, setPhotoUri] = useState(null);

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUserName(u?.displayName ?? "");
      setEmail(u?.email ?? "");
      setLoadingUser(false);

      if (u) {
        await setDoc(
          doc(db, "users", u.uid),
          {
            uid: u.uid,
            email: u.email ?? "",
            displayName: u.displayName ?? "",
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );

        const snap = await getDoc(doc(db, "users", u.uid));
        const data = snap.data();
        if (data?.photoUrl) {
          setPhotoUri(data.photoUrl);
        }
      }
    });

    return unsub;
  }, []);

  const startEdit = () => {
    setNameInput(userName);
    setEditing(true);
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Permite acceso a fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets?.[0]?.uri;
    if (!uri) return;

    try {
      const imageUrl = await uploadToImageKit(uri);

      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        photoUrl: imageUrl,
      });

      setPhotoUri(imageUrl);

      Alert.alert("Listo", "Foto actualizada");
    } catch (error) {
      Alert.alert("Error", "No se pudo subir la imagen");
    }
  };

  const onSaveProfile = async () => {
    const user = auth.currentUser;
    const newName = nameInput.trim();

    if (!user) return Alert.alert("Error", "No hay usuario autenticado.");
    if (!newName) return Alert.alert("Error", "Escribe tu nombre.");

    try {
      await updateProfile(user, { displayName: newName });
      setUserName(newName);
      setEditing(false);
      Alert.alert("Listo", "Nombre actualizado.");
    } catch {
      Alert.alert("Error", "No se pudo actualizar el nombre.");
    }
  };

  const onLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch {
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };

  if (loadingUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F5F6FA" }}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* TITULO */}
      <Text
        style={{
          fontSize: 26,
          fontWeight: "900",
          textAlign: "center",
          marginBottom: 18,
          marginTop:10,
        }}
      >
        Mi perfil
      </Text>

      {/* CARD PRINCIPAL */}
      <View
        style={{
          padding: 22,
          borderRadius: 20,
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 4,
          gap: 12,
        }}
      >
        {/* FOTO */}
        <TouchableOpacity onPress={pickPhoto}>
          <View
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: "#F2F4F7",
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Text>Foto</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* INFO */}
        {editing ? (
          <>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Nombre"
              style={{
                width: "100%",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 12,
                padding: 12,
              }}
            />

            <TouchableOpacity
              onPress={onSaveProfile}
              style={{
                backgroundColor: "#4DB6AC",
                paddingVertical: 12,
                paddingHorizontal: 25,
                borderRadius: 12,
                marginTop: 6,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Guardar cambios
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setEditing(false)}>
              <Text style={{ color: "#777", marginTop: 6 }}>Cancelar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 21, fontWeight: "800" }}>
              {userName || "Usuario"}
            </Text>

            <Text style={{ color: "#777" }}>{email}</Text>

            <TouchableOpacity
              onPress={startEdit}
              style={{
                backgroundColor: "#4DB6AC",
                paddingVertical: 10,
                paddingHorizontal: 18,
                borderRadius: 12,
                marginTop: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Editar perfil
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* SECCIONES */}
      <Section title="Mascotas registradas" />
      <Section title="Mi actividad" />
      <Section title="Configuración y soporte" />

      {/* LOGOUT */}
      <TouchableOpacity
        onPress={onLogout}
        style={{
          backgroundColor: "#cd1f5c",
          padding: 14,
          borderRadius: 14,
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800" }}>
          Cerrar sesión
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Section({ title }) {
  return (
    <View
      style={{
        padding: 18,
        borderRadius: 18,
        backgroundColor: "#fff",
        marginTop: 16,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700" }}>{title}</Text>
    </View>
  );
}
