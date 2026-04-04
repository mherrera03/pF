import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

// Firestore
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

// ImageKit uploader
import { uploadToImageKit } from "../services/imageUpload";

// Validador de imágenes
import {
  validateManyPetImages,
  type ExpectedPetType,
} from "../services/petImageValidator";

const formatDateDDMMYYYY = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function ReporteScreen() {
  const router = useRouter();

  const [tipoReporte, setTipoReporte] = useState<"rapido" | "completo">("rapido");
  const [images, setImages] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validatingImages, setValidatingImages] = useState(false);
  const [imageValidationSummary, setImageValidationSummary] = useState<string | null>(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.08,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const [formData, setFormData] = useState({
    nombre: "",
    especie: "",
    raza: "",
    razaOtro: "",
    color: "",
    telefono: "",
    tamaño: "",
    rasgos: "",
    ofreceRecompensa: "",
    montoRecompensa: "",
  });

  const [fechaDate, setFechaDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (campo: string, valor: string) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const mapSpeciesToExpectedType = (especie: string): ExpectedPetType | null => {
    if (especie === "Perro") return "dog";
    if (especie === "Gato") return "cat";
    return null;
  };

  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert("Límite alcanzado", "Solo puedes agregar hasta 5 imágenes.");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
    });

    if (result.canceled) return;

    const nuevasUris = result.assets.map((asset) => asset.uri);
    const combinadas = [...images, ...nuevasUris].slice(0, 5);

    setImages(combinadas);
    setImageValidationSummary(null);
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    setImageValidationSummary(null);
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Activa la ubicación.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setCoords({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const validateSelectedImages = async () => {
    if (!formData.especie) {
      Alert.alert("Falta información", "Primero selecciona la especie antes de validar fotos.");
      return false;
    }

    if (images.length === 0) {
      Alert.alert("Falta información", "Agrega al menos una foto.");
      return false;
    }

    const expectedType = mapSpeciesToExpectedType(formData.especie);

    if (!expectedType) {
      Alert.alert("Error", "La especie seleccionada no es válida.");
      return false;
    }

    try {
      setValidatingImages(true);
      setImageValidationSummary(null);

      const results = await validateManyPetImages(images, expectedType);

      const invalidOnes = results.filter((item) => item.decision === "reject");
      const warningOnes = results.filter((item) => item.decision === "warning");

      if (invalidOnes.length > 0) {
        const detalle = invalidOnes
          .map((item, index) => {
            const originalIndex = results.findIndex((r) => r.uri === item.uri);
            return `Imagen ${originalIndex + 1}: ${item.message}`;
          })
          .join("\n");

        Alert.alert(
          "Imágenes no válidas",
          `Algunas fotos no coinciden con la especie seleccionada.\n\n${detalle}`
        );

        setImageValidationSummary("Hay imágenes rechazadas.");
        return false;
      }

      if (warningOnes.length > 0) {
        setImageValidationSummary(
          `${warningOnes.length} imagen(es) coinciden, pero con confianza media.`
        );
      } else {
        setImageValidationSummary("Todas las imágenes fueron validadas correctamente.");
      }

      return true;
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudieron validar las imágenes.");
      return false;
    } finally {
      setValidatingImages(false);
    }
  };

  const validar = () => {
    if (!formData.nombre.trim()) return "Escribe el nombre de la mascota.";
    if (!formData.especie) return "Selecciona la especie (Perro/Gato).";
    if (!formData.raza) return "Selecciona la raza.";
    if (formData.raza === "Otro" && !formData.razaOtro.trim()) {
      return "Escribe la raza de la mascota.";
    }
    if (images.length === 0) return "Agrega al menos una foto de la mascota.";
    if (!formData.telefono.trim()) return "Escribe un teléfono.";
    if (!coords) return "Obtén la ubicación actual.";

    if (formData.ofreceRecompensa === "si" && !formData.montoRecompensa.trim()) {
      return "Escribe el monto de la recompensa.";
    }

    if (tipoReporte === "completo") {
      if (!formData.tamaño) return "Selecciona el tamaño.";
      if (!formData.rasgos.trim()) return "Describe los rasgos.";
    }

    return null;
  };

  const handleSubmit = async () => {
    const error = validar();
    if (error) {
      Alert.alert("Falta información", error);
      return;
    }

    const imagesAreValid = await validateSelectedImages();
    if (!imagesAreValid) {
      return;
    }

    try {
      setSubmitting(true);

      const user = auth.currentUser;
      const uid = user?.uid ?? null;

      const uploadedUrls: string[] = [];

      for (const uri of images) {
        const res = await uploadToImageKit(uri);
        const url = typeof res === "string" ? res : res?.url ?? null;

        if (url) {
          uploadedUrls.push(url);
        }
      }

      const razaFinal =
        formData.raza === "Otro"
          ? formData.razaOtro.trim()
          : formData.raza.trim();

      await addDoc(collection(db, "reportes"), {
        nombre: formData.nombre.trim(),
        tipo: formData.especie,
        raza: razaFinal,
        fecha: formatDateDDMMYYYY(fechaDate),
        color: formData.color || null,
        telefono: formData.telefono.trim(),

        tamaño: tipoReporte === "completo" ? formData.tamaño : null,
        rasgos: tipoReporte === "completo" ? formData.rasgos.trim() : null,

        recompensa: formData.ofreceRecompensa === "si",
        montoRecompensa:
          formData.ofreceRecompensa === "si"
            ? formData.montoRecompensa.trim()
            : null,

        coords: coords
          ? { latitude: coords.latitude, longitude: coords.longitude }
          : null,
        ubicacion: coords
          ? `${coords.latitude}, ${coords.longitude}`
          : null,

        fotosUrls: uploadedUrls.slice(0, 5),
        fotoUrl: uploadedUrls.length > 0 ? uploadedUrls[0] : null,
        tipoReporte,

        createdAt: serverTimestamp(),
        ownerUid: uid,
      });

      Alert.alert("Reporte enviado", "Tu reporte fue publicado correctamente 🐾");
      router.back();
    } catch (e) {
      console.log("Error publicando:", e);
      Alert.alert("Error", "No se pudo publicar el reporte. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const onChangeFecha = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selectedDate) setFechaDate(selectedDate);
  };

  const razasPerro = [
    "Labrador",
    "Golden Retriever",
    "Pastor Alemán",
    "Chihuahua",
    "Poodle",
    "Bulldog",
    "Husky",
    "Shih Tzu",
    "Beagle",
    "Rottweiler",
    "Mezclado",
    "Aguacaterri",
    "Otro",
  ];

  const razasGato = [
    "Persa",
    "Siamés",
    "Maine Coon",
    "Angora",
    "Bengalí",
    "Azul Ruso",
    "British Shorthair",
    "Sphynx",
    "Mezclado",
    "Otro"
  ];

  const razasSegunEspecie =
    formData.especie === "Perro"
      ? razasPerro
      : formData.especie === "Gato"
      ? razasGato
      : [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 150 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Nuevo Reporte</Text>

      <View style={styles.toggleContainer}>
        {["rapido", "completo"].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[
              styles.toggleButton,
              tipoReporte === tipo && styles.activeToggle,
            ]}
            onPress={() => setTipoReporte(tipo as "rapido" | "completo")}
            disabled={submitting || validatingImages}
          >
            <Text
              style={[
                styles.toggleText,
                tipoReporte === tipo && styles.activeText,
              ]}
            >
              {tipo === "rapido" ? "Reporte Rápido" : "Reporte Completo"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la mascota"
        value={formData.nombre}
        onChangeText={(text) => handleChange("nombre", text)}
        editable={!submitting && !validatingImages}
      />

      <Text style={styles.label}>Especie</Text>
      <View style={styles.wrapRow}>
        {["Perro", "Gato"].map((esp) => (
          <Animated.View key={esp} style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[
                styles.chip,
                formData.especie === esp && styles.chipActive,
              ]}
              onPress={() => {
                handleChange("especie", esp);
                handleChange("raza", "");
                handleChange("razaOtro", "");
                setImageValidationSummary(null);
                animatePress();
              }}
              disabled={submitting || validatingImages}
            >
              <Text
                style={[
                  styles.chipText,
                  formData.especie === esp && styles.chipTextActive,
                ]}
              >
                {esp}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <Text style={styles.label}>Raza</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.raza}
          onValueChange={(v) => {
            handleChange("raza", v);
            if (v !== "Otro") {
              handleChange("razaOtro", "");
            }
          }}
          enabled={!submitting && !validatingImages && !!formData.especie}
        >
          <Picker.Item
            label={
              formData.especie
                ? "Seleccionar raza..."
                : "Primero selecciona la especie"
            }
            value=""
          />

          {razasSegunEspecie.map((raza) => (
            <Picker.Item key={raza} label={raza} value={raza} />
          ))}
        </Picker>
      </View>

      {formData.raza === "Otro" && (
        <TextInput
          style={styles.input}
          placeholder="Escribe la raza de la mascota"
          value={formData.razaOtro}
          onChangeText={(text) => handleChange("razaOtro", text)}
          editable={!submitting && !validatingImages}
        />
      )}

      <Text style={styles.label}>Fecha</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
        disabled={submitting || validatingImages}
      >
        <Text style={styles.dateText}>
          Seleccionar fecha: {formatDateDDMMYYYY(fechaDate)}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={fechaDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeFecha}
          maximumDate={new Date()}
        />
      )}

      <Text style={styles.label}>Color</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.color}
          onValueChange={(v) => handleChange("color", v)}
          enabled={!submitting && !validatingImages}
        >
          <Picker.Item label="Seleccionar color..." value="" />
          <Picker.Item label="Blanco" value="Blanco" />
          <Picker.Item label="Negro" value="Negro" />
          <Picker.Item label="Café" value="Café" />
          <Picker.Item label="Gris" value="Gris" />
          <Picker.Item label="Amarillo" value="Amarillo" />
          <Picker.Item label="Dorado" value="Dorado" />
          <Picker.Item label="Mixto" value="Mixto" />
        </Picker>
      </View>

      <Text style={styles.label}>Ubicación</Text>
      <TouchableOpacity
        style={styles.locationButton}
        onPress={getLocation}
        disabled={submitting || validatingImages}
      >
        <Text style={styles.locationText}>Obtener ubicación actual</Text>
      </TouchableOpacity>

      {coords && (
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`
            )
          }
        >
          <Text style={styles.mapPreview}>Ver en Google Maps</Text>
        </TouchableOpacity>
      )}

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="numeric"
        value={formData.telefono}
        onChangeText={(text) => handleChange("telefono", text)}
        editable={!submitting && !validatingImages}
      />

      <Text style={styles.label}>¿Ofreces recompensa?</Text>
      <View style={styles.wrapRow}>
        {[
          { label: "Sí", value: "si" },
          { label: "No", value: "no" },
        ].map((item) => (
          <Animated.View
            key={item.value}
            style={{ transform: [{ scale: scaleAnim }] }}
          >
            <TouchableOpacity
              style={[
                styles.chip,
                formData.ofreceRecompensa === item.value && styles.chipActive,
              ]}
              onPress={() => {
                handleChange("ofreceRecompensa", item.value);
                if (item.value === "no") handleChange("montoRecompensa", "");
                animatePress();
              }}
              disabled={submitting || validatingImages}
            >
              <Text
                style={[
                  styles.chipText,
                  formData.ofreceRecompensa === item.value &&
                    styles.chipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {formData.ofreceRecompensa === "si" && (
        <TextInput
          style={styles.input}
          placeholder="Monto de la recompensa"
          keyboardType="numeric"
          value={formData.montoRecompensa}
          onChangeText={(text) => handleChange("montoRecompensa", text)}
          editable={!submitting && !validatingImages}
        />
      )}

      <TouchableOpacity
        style={styles.photoButton}
        onPress={pickImages}
        disabled={submitting || validatingImages}
      >
        <Text style={styles.photoText}>
          {images.length > 0
            ? `Agregar o cambiar fotos (${images.length}/5)`
            : "Agregar fotos"}
        </Text>
      </TouchableOpacity>

      <View style={styles.previewGrid}>
        {images.map((uri, index) => (
          <View key={`${uri}-${index}`} style={styles.previewItem}>
            <Image source={{ uri }} style={styles.previewImage} />

            <TouchableOpacity
              style={styles.removeBadge}
              onPress={() => removeImage(index)}
              disabled={submitting || validatingImages}
            >
              <Text style={styles.removeBadgeText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {validatingImages && (
        <Text style={styles.validationInfo}>Validando imágenes...</Text>
      )}

      {imageValidationSummary && !validatingImages && (
        <Text style={styles.validationInfo}>{imageValidationSummary}</Text>
      )}

      {tipoReporte === "completo" && (
        <>
          <Text style={styles.label}>Tamaño</Text>
          <View style={styles.wrapRow}>
            {["Pequeño", "Mediano", "Grande"].map((size) => (
              <Animated.View
                key={size}
                style={{ transform: [{ scale: scaleAnim }] }}
              >
                <TouchableOpacity
                  style={[
                    styles.chip,
                    formData.tamaño === size && styles.chipActive,
                  ]}
                  onPress={() => {
                    handleChange("tamaño", size);
                    animatePress();
                  }}
                  disabled={submitting || validatingImages}
                >
                  <Text
                    style={[
                      styles.chipText,
                      formData.tamaño === size && styles.chipTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <TextInput
            style={[styles.input, { height: 90 }]}
            placeholder="Características distintivas"
            multiline
            value={formData.rasgos}
            onChangeText={(text) => handleChange("rasgos", text)}
            editable={!submitting && !validatingImages}
          />
        </>
      )}

      <TouchableOpacity
        style={[
          styles.submitButton,
          (submitting || validatingImages) && { opacity: 0.7 },
        ]}
        onPress={handleSubmit}
        disabled={submitting || validatingImages}
      >
        <Text style={styles.submitText}>
          {validatingImages
            ? "Validando imágenes..."
            : submitting
            ? "Publicando..."
            : tipoReporte === "rapido"
            ? "Publicar Reporte Rápido"
            : "Publicar Reporte Completo"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4ECFF",
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6A5ACD",
    textAlign: "center",
    marginBottom: 25,
    marginTop: 15,
  },

  toggleContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 25,
    backgroundColor: "#E5D9FF",
    marginHorizontal: 5,
    alignItems: "center",
  },
  activeToggle: {
    backgroundColor: "#6A5ACD",
  },
  toggleText: {
    color: "#6A5ACD",
    fontWeight: "600",
  },
  activeText: {
    color: "#fff",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D6C8FF",
  },

  label: {
    fontWeight: "600",
    color: "#6A5ACD",
    marginBottom: 8,
    marginTop: 10,
  },

  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  chip: {
    backgroundColor: "#E5D9FF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 6,
  },
  chipActive: {
    backgroundColor: "#6A5ACD",
  },
  chipText: {
    color: "#5A4FCF",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#fff",
  },

  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D6C8FF",
    marginBottom: 15,
  },

  locationButton: {
    backgroundColor: "#D6C8FF",
    padding: 14,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  locationText: {
    color: "#4B3FBF",
    fontWeight: "600",
  },

  mapPreview: {
    textAlign: "center",
    color: "#6A5ACD",
    marginBottom: 15,
    textDecorationLine: "underline",
  },

  photoButton: {
    backgroundColor: "#D6C8FF",
    padding: 14,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  photoText: {
    color: "#4B3FBF",
    fontWeight: "600",
  },

  previewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  previewItem: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#EDE7FF",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  removeBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeBadgeText: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "bold",
  },

  validationInfo: {
    textAlign: "center",
    color: "#6A5ACD",
    marginBottom: 18,
    fontWeight: "600",
  },

  dateButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D6C8FF",
    marginBottom: 10,
  },
  dateText: {
    color: "#4B3FBF",
    fontWeight: "600",
  },

  submitButton: {
    backgroundColor: "#5A4FCF",
    padding: 18,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
    elevation: 4,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});