import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";
import { uploadToImageKitFromBase64 } from "../services/imageUpload";

type Mascota = {
  id: string;
  nombre: string;
  tipo: string;
  raza: string;
  edad: string;
  imageUrl?: string;
  fotoUrl?: string;
  ownerUid: string;
};

export default function MascotasRegistradas() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [raza, setRaza] = useState("");
  const [edad, setEdad] = useState("");

  const [imagenLocal, setImagenLocal] = useState<string | null>(null);
  const [imagenBase64, setImagenBase64] = useState<string | null>(null);
  const [imagenActualUrl, setImagenActualUrl] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setCargando(false);
      return;
    }

    const q = query(
      collection(db, "mascotas"),
      where("ownerUid", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Mascota[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();

          return {
            id: docSnap.id,
            nombre: d.nombre || "",
            tipo: d.tipo || "",
            raza: d.raza || "",
            edad: d.edad || "",
            imageUrl: d.imageUrl || d.fotoUrl || "",
            fotoUrl: d.fotoUrl || d.imageUrl || "",
            ownerUid: d.ownerUid || "",
          };
        });

        setMascotas(data);
        setCargando(false);
      },
      (error) => {
        console.log("Error cargando mascotas:", error);
        setCargando(false);
        Alert.alert("Error", "No se pudieron cargar las mascotas registradas.");
      }
    );

    return () => unsubscribe();
  }, []);

  const limpiarFormulario = () => {
    setNombre("");
    setTipo("");
    setRaza("");
    setEdad("");
    setImagenLocal(null);
    setImagenBase64(null);
    setImagenActualUrl(null);
    setEditandoId(null);
  };

  const abrirAgregar = () => {
    limpiarFormulario();
    setModalVisible(true);
  };

  const abrirEditar = (mascota: Mascota) => {
    setEditandoId(mascota.id);
    setNombre(mascota.nombre);
    setTipo(mascota.tipo);
    setRaza(mascota.raza);
    setEdad(mascota.edad);
    setImagenLocal(null);
    setImagenBase64(null);
    setImagenActualUrl(mascota.imageUrl || mascota.fotoUrl || null);
    setModalVisible(true);
  };

  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert(
        "Permiso requerido",
        "Debes permitir acceso a la galería."
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      base64: true,
    });

    if (!resultado.canceled) {
      const asset = resultado.assets[0];

      if (!asset.uri || !asset.base64) {
        Alert.alert("Error", "No se pudo seleccionar la imagen.");
        return;
      }

      setImagenLocal(asset.uri);
      setImagenBase64(asset.base64);
    }
  };

  const quitarImagen = () => {
    setImagenLocal(null);
    setImagenBase64(null);
    setImagenActualUrl(null);
  };

  const guardarMascota = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Sesión no encontrada",
        "Debes iniciar sesión para registrar mascotas."
      );
      return;
    }

    if (!nombre.trim() || !tipo.trim() || !raza.trim() || !edad.trim()) {
      Alert.alert(
        "Campos incompletos",
        "Completa todos los campos de la mascota."
      );
      return;
    }

    try {
      setGuardando(true);

      let imageUrl = imagenActualUrl || "";

      if (imagenBase64) {
        console.log("Subiendo imagen de mascota registrada...");
        imageUrl = await uploadToImageKitFromBase64(imagenBase64);
      }

      if (editandoId) {
        const mascotaRef = doc(db, "mascotas", editandoId);

        await updateDoc(mascotaRef, {
          nombre: nombre.trim(),
          tipo: tipo.trim(),
          raza: raza.trim(),
          edad: edad.trim(),
          imageUrl,
          fotoUrl: imageUrl,
          updatedAt: serverTimestamp(),
        });

        Alert.alert("Listo", "La información de la mascota fue actualizada.");
      } else {
        await addDoc(collection(db, "mascotas"), {
          nombre: nombre.trim(),
          tipo: tipo.trim(),
          raza: raza.trim(),
          edad: edad.trim(),
          imageUrl,
          fotoUrl: imageUrl,
          ownerUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        Alert.alert("Listo", "La mascota fue registrada correctamente.");
      }

      limpiarFormulario();
      setModalVisible(false);
    } catch (error) {
      console.log("Error guardando mascota:", error);
      Alert.alert("Error", "No se pudo guardar la mascota.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarMascota = (mascotaId: string) => {
    Alert.alert(
      "Eliminar mascota",
      "¿Seguro que quieres eliminar este registro?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "mascotas", mascotaId));
              Alert.alert(
                "Eliminada",
                "La mascota fue eliminada correctamente."
              );
            } catch (error) {
              console.log("Error eliminando mascota:", error);
              Alert.alert("Error", "No se pudo eliminar la mascota.");
            }
          },
        },
      ]
    );
  };

  const imagenPreview = imagenLocal || imagenActualUrl;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F5F6FA" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
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

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "900",
            flex: 1,
          }}
        >
          Mascotas registradas
        </Text>

        <TouchableOpacity
          onPress={abrirAgregar}
          style={{
            backgroundColor: "#4DB6AC",
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      {cargando ? (
        <View
          style={{
            backgroundColor: "#fff",
            padding: 25,
            borderRadius: 18,
            alignItems: "center",
            elevation: 2,
          }}
        >
          <ActivityIndicator size="large" color="#4DB6AC" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            Cargando mascotas...
          </Text>
        </View>
      ) : mascotas.length === 0 ? (
        <View
          style={{
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 18,
            elevation: 2,
          }}
        >
          <Text
            style={{
              color: "#777",
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Aún no tienes mascotas registradas. Presiona el botón “Agregar” para
            registrar una.
          </Text>
        </View>
      ) : (
        mascotas.map((mascota) => {
          const foto = mascota.imageUrl || mascota.fotoUrl || "";

          return (
            <View
              key={mascota.id}
              style={{
                backgroundColor: "#fff",
                padding: 18,
                borderRadius: 18,
                marginBottom: 14,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: "row", gap: 14 }}>
                {foto ? (
                  <Image
                    source={{ uri: foto }}
                    style={{
                      width: 78,
                      height: 78,
                      borderRadius: 18,
                      backgroundColor: "#E0E0E0",
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 78,
                      height: 78,
                      borderRadius: 18,
                      backgroundColor: "#E0F2F1",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>🐾</Text>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 17, fontWeight: "800" }}>
                    {mascota.nombre}
                  </Text>

                  <Text style={{ color: "#666", marginTop: 4 }}>
                    {mascota.tipo} • {mascota.raza}
                  </Text>

                  <Text style={{ color: "#666", marginTop: 4 }}>
                    Edad: {mascota.edad}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginTop: 14,
                  gap: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() => abrirEditar(mascota)}
                  style={{
                    flex: 1,
                    backgroundColor: "#E0F2F1",
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#00796B", fontWeight: "800" }}>
                    Editar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => eliminarMascota(mascota.id)}
                  style={{
                    flex: 1,
                    backgroundColor: "#FFEBEE",
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#C62828", fontWeight: "800" }}>
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          limpiarFormulario();
          setModalVisible(false);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "flex-end",
          }}
        >
          <ScrollView
            style={{
              backgroundColor: "#fff",
              maxHeight: "90%",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
            contentContainerStyle={{
              padding: 22,
              paddingBottom: 35,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "900",
                marginBottom: 16,
              }}
            >
              {editandoId ? "Editar mascota" : "Agregar mascota"}
            </Text>

            <TouchableOpacity
              onPress={seleccionarImagen}
              style={{
                backgroundColor: "#F5F6FA",
                borderRadius: 18,
                height: 160,
                marginBottom: 12,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#E0E0E0",
                overflow: "hidden",
              }}
            >
              {imagenPreview ? (
                <Image
                  source={{ uri: imagenPreview }}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 35, marginBottom: 6 }}>📷</Text>
                  <Text style={{ color: "#555", fontWeight: "700" }}>
                    Seleccionar imagen
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {imagenPreview ? (
              <TouchableOpacity
                onPress={quitarImagen}
                style={{
                  alignSelf: "center",
                  marginBottom: 14,
                }}
              >
                <Text style={{ color: "#C62828", fontWeight: "800" }}>
                  Quitar imagen
                </Text>
              </TouchableOpacity>
            ) : null}

            <Text style={{ fontWeight: "700", marginBottom: 6 }}>Nombre</Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ejemplo: Luna"
              style={inputStyle}
            />

            <Text style={{ fontWeight: "700", marginBottom: 6 }}>Tipo</Text>
            <TextInput
              value={tipo}
              onChangeText={setTipo}
              placeholder="Ejemplo: Perro o Gato"
              style={inputStyle}
            />

            <Text style={{ fontWeight: "700", marginBottom: 6 }}>Raza</Text>
            <TextInput
              value={raza}
              onChangeText={setRaza}
              placeholder="Ejemplo: Mestizo, Siamés, Labrador"
              style={inputStyle}
            />

            <Text style={{ fontWeight: "700", marginBottom: 6 }}>Edad</Text>
            <TextInput
              value={edad}
              onChangeText={setEdad}
              placeholder="Ejemplo: 2 años"
              style={inputStyle}
            />

            <TouchableOpacity
              onPress={guardarMascota}
              disabled={guardando}
              style={{
                backgroundColor: guardando ? "#9E9E9E" : "#4DB6AC",
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
                marginTop: 8,
              }}
            >
              {guardando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "900",
                    fontSize: 16,
                  }}
                >
                  {editandoId ? "Guardar cambios" : "Registrar mascota"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                limpiarFormulario();
                setModalVisible(false);
              }}
              disabled={guardando}
              style={{
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <Text style={{ color: "#777", fontWeight: "800" }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const inputStyle = {
  backgroundColor: "#F5F6FA",
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 12,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#E0E0E0",
  fontSize: 15,
};