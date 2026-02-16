import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Button, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, db } from "../../config/firebase";
import { uploadToImageKit } from "../../services/imageUpload";

const PHOTO_KEY = "pf_profile_photo_uri";

export default function Perfil() {
  const [loadingUser, setLoadingUser] = useState(true);

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");

  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const [notificationsOn, setNotificationsOn] = useState(true);

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
    } catch (error: any) {
      console.log("ERROR SUBIENDO FOTO:", error?.message ?? error);
      Alert.alert("Error", error?.message ?? "No se pudo subir la imagen");
    }
  };

  const onSaveProfile = async () => {
    const user = auth.currentUser;
    const newName = nameInput.trim();

    if (!user) return Alert.alert("Error", "No hay usuario autenticado.");
    if (!newName) return Alert.alert("Error", "Escribe tu nombre de usuario.");

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
      contentContainerStyle={{
        flexGrow: 1,
        padding: 16,
        gap: 14,
        paddingBottom: 110,
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "800" }}>Perfil / Ajustes</Text>

      {/* Foto + nombre */}
      <View style={{ padding: 12, borderWidth: 1, borderRadius: 12, borderColor: "#ddd", gap: 10 }}>
        <TouchableOpacity onPress={pickPhoto} style={{ alignSelf: "flex-start" }}>
          <View
            style={{
              width: 92,
              height: 92,
              borderRadius: 46,
              backgroundColor: "#eee",
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={{ width: "100%", height: "100%" }}/>
            ) : (
              <Text>Foto</Text>
            )}
          </View>
        </TouchableOpacity>

        <Text>Correo: {email || "-"}</Text>

        {editing ? (
          <>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Nombre de usuario"
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 }}
            />
            <Button title="Guardar cambios" onPress={onSaveProfile} />
            <Button title="Cancelar" onPress={() => { setNameInput(userName); setEditing(false); }} />
          </>
        ) : (
          <>
            <Text>
              Nombre de usuario: <Text style={{ fontWeight: "700" }}>{userName || "Usuario"}</Text>
            </Text>
            <Button title="Editar perfil" onPress={startEdit} />
          </>
        )}
      </View>

      <Section title="Mascotas registradas" />

      <Section title="Mi actividad" />

      <Section title="Configuración y soporte" />


      <View style={{ marginTop: "auto" }}>
        <Button title="Cerrar sesión" onPress={onLogout} />
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <View
      style={{
        padding: 12,
        borderWidth: 1,
        borderRadius: 12,
        borderColor: "#eee",
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700" }}>{title}</Text>
      {children}
    </View>
  );
}

