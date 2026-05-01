import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, serverTimestamp, } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../config/firebase";
import { uploadToImageKitFromBase64 } from "../services/imageUpload";

export default function DarAdopScreen() {
  const router = useRouter();
  const [pasoActual, setPasoActual] = useState<1 | 2>(1);
  const [images, setImages] = useState<string[]>([]);
  const [imagesBase64, setImagesBase64] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    especie: "",
    raza: "",
    otraRaza: "",
    edad: "",
    tamaño: "",
    sexo: "",
    color: "",
    salud: "",
    energia: "",
    descripcion: "",

    contactoNombre: "",
    telefono: "",
    ubicacion: "",
    vacunado: "",
    esterilizado: "",
    convivePerros: "",
    conviveGatos: "",
    conviveNinos: "",
    tipoHogar: "",
    requisitos: "",
    seguimiento: "",
    notas: "",
  });

  const actualizarCampo = (campo: string, valor: string) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const seleccionarImagen = async () => {
  const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permiso.granted) {
    Alert.alert("Permiso requerido", "Debes permitir acceso a la galería.");
    return;
  }

  const cuposRestantes = 5 - images.length;

  if (cuposRestantes <= 0) {
    Alert.alert("Límite alcanzado", "Solo puedes subir un máximo de 5 fotos.");
    return;
  }

  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
    allowsEditing: false,
    allowsMultipleSelection: true,
    selectionLimit: cuposRestantes,
    base64: true,
  });

  if (!resultado.canceled) {
    const nuevasUris = resultado.assets.map((asset) => asset.uri);
    const nuevasBase64 = resultado.assets
      .map((asset) => asset.base64 ?? "")
      .filter(Boolean);

    const totalUris = [...images, ...nuevasUris].slice(0, 5);
    const totalBase64 = [...imagesBase64, ...nuevasBase64].slice(0, 5);

    setImages(totalUris);
    setImagesBase64(totalBase64);

    console.log("Fotos seleccionadas:", totalUris.length);
  }
};

const eliminarImagen = (index: number) => {
  setImages((prev) => prev.filter((_, i) => i !== index));
  setImagesBase64((prev) => prev.filter((_, i) => i !== index));
};

  const obtenerUbicacion = async () => {
    try {
      const permiso = await Location.requestForegroundPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert("Permiso denegado", "No se pudo acceder a tu ubicación.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setCoords({ latitude, longitude });

      const direcciones = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (direcciones.length > 0) {
        const direccion = direcciones[0];

        const textoUbicacion = [
          direccion.street,
          direccion.district,
          direccion.city,
          direccion.region,
          direccion.country,
        ]
          .filter(Boolean)
          .join(", ");

        actualizarCampo("ubicacion", textoUbicacion);
      } else {
        actualizarCampo("ubicacion", `${latitude}, ${longitude}`);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener la ubicación.");
    }
  };

  const abrirMapa = () => {
    if (!coords) return;

    const url = `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;
    Linking.openURL(url);
  };

  const validarPaso1 = () => {
    if (
      !formData.nombre.trim() ||
      !formData.especie.trim() ||
      !formData.edad.trim() ||
      !formData.tamaño.trim() ||
      !formData.descripcion.trim()
    ) {
      Alert.alert(
        "Faltan datos",
        "Completa los campos principales de la mascota antes de continuar."
      );
      return false;
    }

    if (formData.raza === "Otro" && !formData.otraRaza.trim()) {
      Alert.alert("Falta información", "Escribe la raza en el campo de 'Otro'.");
      return false;
    }

    if (images.length === 0) {
      Alert.alert("Falta información", "Agrega al menos una foto de la mascota.");
      return false;
    }

    return true;
  };

  const validarPaso2 = () => {
    if (
      !formData.contactoNombre.trim() ||
      !formData.telefono.trim() ||
      !formData.ubicacion.trim() ||
      !formData.requisitos.trim()
    ) {
      Alert.alert(
        "Faltan datos",
        "Completa la información de contacto, ubicación y requisitos de adopción."
      );
      return false;
    }

    return true;
  };

  const siguientePaso = () => {
    if (pasoActual === 1 && validarPaso1()) {
      setPasoActual(2);
    }
  };

  const pasoAnterior = () => {
    if (pasoActual === 2) {
      setPasoActual(1);
    }
  };

  const publicarAdopcion = async () => {
    if (!validarPaso2()) return;

    try {
      setGuardando(true);

      let fotosUrls: string[] = [];

      if (imagesBase64.length > 0) {
        console.log("Subiendo fotos de adopción...");

        for (const base64 of imagesBase64) {
          const url = await uploadToImageKitFromBase64(base64);
          fotosUrls.push(url);
        }
      }

      const uid = auth.currentUser?.uid;

      if (!uid) {
        Alert.alert("Error", "Debes iniciar sesión para publicar.");
        return;
      }

      let ownerName = "Usuario";

      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        ownerName = userData.nombre || userData.name || userData.username || "Usuario";
      }

      await addDoc(collection(db, "adopciones"), {
        ownerUid: uid,
        ownerName,

        nombre: formData.nombre.trim(),
        tipo: formData.especie.trim(),
        especie: formData.especie.trim(),

        raza:
          formData.raza === "Otro"
            ? formData.otraRaza.trim()
            : formData.raza.trim(),

        edad: formData.edad.trim(),
        tamaño: formData.tamaño.trim(),
        sexo: formData.sexo.trim(),
        color: formData.color.trim(),
        salud: formData.salud.trim(),
        energia: formData.energia.trim(),
        descripcion: formData.descripcion.trim(),

        contactoNombre: formData.contactoNombre.trim(),
        telefono: formData.telefono.trim(),
        ubicacion: formData.ubicacion.trim(),
        coords: coords || null,

        vacunado: formData.vacunado.trim(),
        esterilizado: formData.esterilizado.trim(),
        convivePerros: formData.convivePerros.trim(),
        conviveGatos: formData.conviveGatos.trim(),
        conviveNinos: formData.conviveNinos.trim(),
        tipoHogar: formData.tipoHogar.trim(),
        requisitos: formData.requisitos.trim(),
        seguimiento: formData.seguimiento.trim(),
        notas: formData.notas.trim(),

        fotosUrls,
        fotoUrl: fotosUrls[0] || null,
        estado: "disponible",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Éxito", "La mascota fue publicada en adopción.");
      router.back();
    } catch (error) {
      console.log("Error completo al publicar adopción:", error);
      Alert.alert("Error", "No se pudo publicar la adopción.");
    } finally {
      setGuardando(false);
    }
  };

  const renderOpcion = (
    campo: string,
    valorActual: string,
    opciones: string[]
  ) => (
    <View style={styles.rowOptions}>
      {opciones.map((item) => {
        const activo = valorActual === item;
        return (
          <TouchableOpacity
            key={item}
            style={[styles.optionButton, activo && styles.optionButtonActive]}
            onPress={() => actualizarCampo(campo, item)}
          >
            <Text style={[styles.optionText, activo && styles.optionTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F2FF" />

      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#6A5ACD" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Dar en adopción</Text>
        <Text style={styles.subtitle}>
          Prepara la publicación de la mascota y define las condiciones del
          proceso de adopción en 2 fases.
        </Text>

        <View style={styles.stepsWrapper}>
          <View style={styles.stepsRow}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  pasoActual === 1 && styles.stepCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    pasoActual === 1 && styles.stepNumberActive,
                  ]}
                >
                  1
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  pasoActual === 1 && styles.stepLabelActive,
                ]}
              >
                Mascota
              </Text>
            </View>

            <View style={styles.stepLine} />

            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  pasoActual === 2 && styles.stepCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    pasoActual === 2 && styles.stepNumberActive,
                  ]}
                >
                  2
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  pasoActual === 2 && styles.stepLabelActive,
                ]}
              >
                Condiciones
              </Text>
            </View>
          </View>
        </View>

        {pasoActual === 1 ? (
          <>
            <Text style={styles.label}>Fotos de la mascota</Text>

            <TouchableOpacity style={styles.imageAddBox} onPress={seleccionarImagen}>
              <MaterialCommunityIcons
                name="camera-plus-outline"
                size={34}
                color="#7B61FF"
              />
              <Text style={styles.imageText}>
                {images.length === 0
                  ? "Agregar fotos de la mascota"
                  : `Agregar más fotos (${images.length}/5)`}
              </Text>
            </TouchableOpacity>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
            >
              {images.map((uri, index) => (
                <View key={`${uri}-${index}`} style={styles.previewWrap}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => eliminarImagen(index)}
                  >
                    <MaterialCommunityIcons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Luna"
              placeholderTextColor="#9A8FB5"
              value={formData.nombre}
              onChangeText={(text) => actualizarCampo("nombre", text)}
            />

            <Text style={styles.label}>Especie</Text>
            {renderOpcion("especie", formData.especie, [
              "Perro",
              "Gato",
              "Ave",
              "Otro",
            ])}

            <Text style={styles.label}>Raza</Text>
            {renderOpcion("raza", formData.raza, [
              "Mestizo",
              "Labrador",
              "Pastor Alemán",
              "Siamés",
              "Otro",
            ])}

            {formData.raza === "Otro" && (
              <TextInput
                style={styles.input}
                placeholder="Escribe la raza"
                placeholderTextColor="#9A8FB5"
                value={formData.otraRaza}
                onChangeText={(text) => actualizarCampo("otraRaza", text)}
              />
            )}

            <Text style={styles.label}>Edad</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 2 años"
              placeholderTextColor="#9A8FB5"
              value={formData.edad}
              onChangeText={(text) => actualizarCampo("edad", text)}
            />

            <Text style={styles.label}>Tamaño</Text>
            {renderOpcion("tamaño", formData.tamaño, [
              "Pequeño",
              "Mediano",
              "Grande",
            ])}

            <Text style={styles.label}>Sexo</Text>
            {renderOpcion("sexo", formData.sexo, ["Macho", "Hembra"])}

            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Café claro"
              placeholderTextColor="#9A8FB5"
              value={formData.color}
              onChangeText={(text) => actualizarCampo("color", text)}
            />

            <Text style={styles.label}>Estado de salud</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Bueno, en tratamiento, etc."
              placeholderTextColor="#9A8FB5"
              value={formData.salud}
              onChangeText={(text) => actualizarCampo("salud", text)}
            />

            <Text style={styles.label}>Nivel de energía</Text>
            {renderOpcion("energia", formData.energia, [
              "Baja",
              "Media",
              "Alta",
            ])}

            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe la personalidad y situación de la mascota"
              placeholderTextColor="#9A8FB5"
              multiline
              value={formData.descripcion}
              onChangeText={(text) => actualizarCampo("descripcion", text)}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={siguientePaso}>
              <Text style={styles.primaryButtonText}>Continuar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Nombre de contacto</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Juan"
              placeholderTextColor="#9A8FB5"
              value={formData.contactoNombre}
              onChangeText={(text) => actualizarCampo("contactoNombre", text)}
            />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 7000-0000"
              placeholderTextColor="#9A8FB5"
              keyboardType="phone-pad"
              value={formData.telefono}
              onChangeText={(text) => actualizarCampo("telefono", text)}
            />

            <Text style={styles.label}>Ubicación</Text>
            <TextInput
              style={styles.input}
              placeholder="Ubicación de entrega"
              placeholderTextColor="#9A8FB5"
              value={formData.ubicacion}
              onChangeText={(text) => actualizarCampo("ubicacion", text)}
            />

            <TouchableOpacity style={styles.secondaryButton} onPress={obtenerUbicacion}>
              <Text style={styles.secondaryButtonText}>Usar mi ubicación actual</Text>
            </TouchableOpacity>

            {coords && (
              <TouchableOpacity style={styles.mapButton} onPress={abrirMapa}>
                <Text style={styles.mapButtonText}>Ver ubicación en mapa</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.label}>¿Vacunado?</Text>
            {renderOpcion("vacunado", formData.vacunado, ["Sí", "No", "No sé"])}

            <Text style={styles.label}>¿Esterilizado?</Text>
            {renderOpcion("esterilizado", formData.esterilizado, ["Sí", "No", "No sé"])}

            <Text style={styles.label}>¿Convive con perros?</Text>
            {renderOpcion("convivePerros", formData.convivePerros, ["Sí", "No", "No sé"])}

            <Text style={styles.label}>¿Convive con gatos?</Text>
            {renderOpcion("conviveGatos", formData.conviveGatos, ["Sí", "No", "No sé"])}

            <Text style={styles.label}>¿Convive con niños?</Text>
            {renderOpcion("conviveNinos", formData.conviveNinos, ["Sí", "No", "No sé"])}

            <Text style={styles.label}>Tipo de hogar ideal</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Casa con patio"
              placeholderTextColor="#9A8FB5"
              value={formData.tipoHogar}
              onChangeText={(text) => actualizarCampo("tipoHogar", text)}
            />

            <Text style={styles.label}>Requisitos de adopción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ej. Visita, compromiso, seguimiento..."
              placeholderTextColor="#9A8FB5"
              multiline
              value={formData.requisitos}
              onChangeText={(text) => actualizarCampo("requisitos", text)}
            />

            <Text style={styles.label}>Seguimiento</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Se pedirán fotos cada mes"
              placeholderTextColor="#9A8FB5"
              value={formData.seguimiento}
              onChangeText={(text) => actualizarCampo("seguimiento", text)}
            />

            <Text style={styles.label}>Notas adicionales</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Información extra"
              placeholderTextColor="#9A8FB5"
              multiline
              value={formData.notas}
              onChangeText={(text) => actualizarCampo("notas", text)}
            />

            <View style={styles.bottomActions}>
              <TouchableOpacity style={styles.backStepButton} onPress={pasoAnterior}>
                <Text style={styles.backStepButtonText}>Atrás</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, { flex: 1 }, guardando && { opacity: 0.7 }]}
                onPress={publicarAdopcion}
                disabled={guardando}
              >
                <Text style={styles.primaryButtonText}>
                  {guardando ? "Publicando..." : "Publicar adopción"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  imageAddBox: {
  height: 130,
  borderRadius: 18,
  borderWidth: 2,
  borderStyle: "dashed",
  borderColor: "#C8B8FF",
  backgroundColor: "#FBF9FF",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 10,
},
previewWrap: {
  marginRight: 10,
  position: "relative",
},
previewImage: {
  width: 110,
  height: 110,
  borderRadius: 16,
},
removeImageButton: {
  position: "absolute",
  top: 6,
  right: 6,
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: "rgba(0,0,0,0.65)",
  alignItems: "center",
  justifyContent: "center",
},
  container: {
    flex: 1,
    backgroundColor: "#F6F2FF",
  },
  topHeader: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EDE7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#5B43B4",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6D6487",
    lineHeight: 21,
    marginBottom: 22,
  },
  stepsWrapper: {
    marginBottom: 24,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepItem: {
    alignItems: "center",
    width: 90,
  },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#DDD3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: "#7B61FF",
  },
  stepNumber: {
    fontWeight: "800",
    color: "#6E62A6",
  },
  stepNumberActive: {
    color: "white",
  },
  stepLabel: {
    marginTop: 6,
    fontSize: 13,
    color: "#8D82AE",
    fontWeight: "600",
  },
  stepLabelActive: {
    color: "#5B43B4",
  },
  stepLine: {
    height: 2,
    flex: 1,
    backgroundColor: "#D8D0F5",
    marginHorizontal: 10,
  },
  imageBox: {
    height: 200,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#C8B8FF",
    backgroundColor: "#FBF9FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  imagePlaceholderContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    marginTop: 10,
    color: "#7B61FF",
    fontWeight: "700",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5D517D",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#2E2A3B",
    borderWidth: 1,
    borderColor: "#DDD4F3",
  },
  textArea: {
    minHeight: 95,
    textAlignVertical: "top",
  },
  rowOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    backgroundColor: "#EEE8FF",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#DDD4F3",
  },
  optionButtonActive: {
    backgroundColor: "#7B61FF",
    borderColor: "#7B61FF",
  },
  optionText: {
    color: "#5D517D",
    fontWeight: "700",
    fontSize: 13,
  },
  optionTextActive: {
    color: "white",
  },
  primaryButton: {
    marginTop: 22,
    backgroundColor: "#7B61FF",
    borderRadius: 14,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 15,
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: "#ECE5FF",
    borderRadius: 14,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#6A52D9",
    fontWeight: "800",
  },
  mapButton: {
    marginTop: 10,
    backgroundColor: "#F3EEFF",
    borderRadius: 14,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  mapButtonText: {
    color: "#6A52D9",
    fontWeight: "700",
  },
  bottomActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
    alignItems: "center",
  },
  backStepButton: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "#E9E2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  backStepButtonText: {
    color: "#6A52D9",
    fontWeight: "800",
  },
});