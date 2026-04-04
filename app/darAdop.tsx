import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
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

export default function DarAdopScreen() {
  const router = useRouter();
  const [pasoActual, setPasoActual] = useState<1 | 2>(1);
  const [image, setImage] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

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

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 4],
    });

    if (!resultado.canceled) {
      setImage(resultado.assets[0].uri);
    }
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

  const guardarPlantilla = () => {
    if (!validarPaso2()) return;

    Alert.alert(
      "Plantilla lista 🐾",
      "Por ahora solo quedó la plantilla visual del formulario de dar en adopción."
    );
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
            <TouchableOpacity style={styles.imageBox} onPress={seleccionarImagen}>
              {image ? (
                <Image source={{ uri: image }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholderContent}>
                  <MaterialCommunityIcons
                    name="camera-plus-outline"
                    size={34}
                    color="#7B61FF"
                  />
                  <Text style={styles.imageText}>Agregar foto de la mascota</Text>
                </View>
              )}
            </TouchableOpacity>

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
              placeholder="Ej. 8 meses / 2 años"
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
              placeholder="Ej. Café con blanco"
              placeholderTextColor="#9A8FB5"
              value={formData.color}
              onChangeText={(text) => actualizarCampo("color", text)}
            />

            <Text style={styles.label}>Estado de salud</Text>
            {renderOpcion("salud", formData.salud, [
              "Bueno",
              "Regular",
              "Requiere cuidados",
            ])}

            <Text style={styles.label}>Nivel de energía</Text>
            {renderOpcion("energia", formData.energia, [
              "Bajo",
              "Medio",
              "Alto",
            ])}

            <Text style={styles.label}>Descripción de la mascota</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe su personalidad, comportamiento, si es cariñoso, juguetón, tranquilo, etc."
              placeholderTextColor="#9A8FB5"
              multiline
              value={formData.descripcion}
              onChangeText={(text) => actualizarCampo("descripcion", text)}
            />
          </>
        ) : (
          <>
            <View style={styles.noticeBox}>
              <MaterialCommunityIcons
                name="information-outline"
                size={22}
                color="#6A5ACD"
              />
              <Text style={styles.noticeText}>
                Esta parte ayuda a preparar el flujo de adopción en 2 fases:
                primero una solicitud inicial y luego una validación más
                detallada.
              </Text>
            </View>

            <Text style={styles.label}>Nombre del contacto</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. María López"
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
            <TouchableOpacity style={styles.locationButton} onPress={obtenerUbicacion}>
              <MaterialCommunityIcons
                name="crosshairs-gps"
                size={20}
                color="#4C1D95"
              />
              <Text style={styles.locationButtonText}>Tomar mi ubicación actual</Text>
            </TouchableOpacity>

            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="La dirección aparecerá aquí"
              placeholderTextColor="#9A8FB5"
              value={formData.ubicacion}
              onChangeText={(text) => actualizarCampo("ubicacion", text)}
            />

            {!!formData.ubicacion && (
              <View style={styles.locationBox}>
                <Text style={styles.locationText}>{formData.ubicacion}</Text>

                {coords && (
                  <TouchableOpacity onPress={abrirMapa}>
                    <Text style={styles.mapLink}>Ver en Google Maps</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <Text style={styles.label}>¿Está vacunado?</Text>
            {renderOpcion("vacunado", formData.vacunado, ["Sí", "No", "Parcial"])}

            <Text style={styles.label}>¿Está esterilizado?</Text>
            {renderOpcion("esterilizado", formData.esterilizado, ["Sí", "No"])}

            <Text style={styles.label}>¿Convive con perros?</Text>
            {renderOpcion("convivePerros", formData.convivePerros, [
              "Sí",
              "No",
              "No se sabe",
            ])}

            <Text style={styles.label}>¿Convive con gatos?</Text>
            {renderOpcion("conviveGatos", formData.conviveGatos, [
              "Sí",
              "No",
              "No se sabe",
            ])}

            <Text style={styles.label}>¿Convive con niños?</Text>
            {renderOpcion("conviveNinos", formData.conviveNinos, [
              "Sí",
              "No",
              "No se sabe",
            ])}

            <Text style={styles.label}>Tipo de hogar ideal</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Casa con patio, apartamento tranquilo, familia con experiencia..."
              placeholderTextColor="#9A8FB5"
              value={formData.tipoHogar}
              onChangeText={(text) => actualizarCampo("tipoHogar", text)}
            />

            <Text style={styles.label}>Requisitos de adopción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ej. Ser mayor de edad, compromiso responsable, seguimiento, espacio adecuado..."
              placeholderTextColor="#9A8FB5"
              multiline
              value={formData.requisitos}
              onChangeText={(text) => actualizarCampo("requisitos", text)}
            />

            <Text style={styles.label}>Seguimiento posterior</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ej. Se solicitarán fotos, visita previa, contacto durante las primeras semanas..."
              placeholderTextColor="#9A8FB5"
              multiline
              value={formData.seguimiento}
              onChangeText={(text) => actualizarCampo("seguimiento", text)}
            />

            <Text style={styles.label}>Notas adicionales</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Información extra que quieras agregar"
              placeholderTextColor="#9A8FB5"
              multiline
              value={formData.notas}
              onChangeText={(text) => actualizarCampo("notas", text)}
            />
          </>
        )}

        <View style={styles.buttonsRow}>
          {pasoActual === 2 && (
            <TouchableOpacity style={styles.secondaryButton} onPress={pasoAnterior}>
              <Text style={styles.secondaryButtonText}>Anterior</Text>
            </TouchableOpacity>
          )}

          {pasoActual === 1 ? (
            <TouchableOpacity style={styles.primaryButton} onPress={siguientePaso}>
              <Text style={styles.primaryButtonText}>Siguiente</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={guardarPlantilla}>
              <Text style={styles.primaryButtonText}>Guardar plantilla</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F2FF",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 2,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EFE7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#6A5ACD",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 20,
  },
  stepsWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E7DEFF",
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
  },
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E9DFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: "#7B61FF",
  },
  stepNumber: {
    color: "#6A5ACD",
    fontWeight: "800",
  },
  stepNumberActive: {
    color: "#FFFFFF",
  },
  stepLabel: {
    fontSize: 13,
    color: "#8A7FB1",
    fontWeight: "600",
  },
  stepLabelActive: {
    color: "#6A5ACD",
  },
  stepLine: {
    height: 2,
    flex: 0.5,
    backgroundColor: "#E5D9FF",
    marginHorizontal: 8,
    marginBottom: 20,
  },
  imageBox: {
    height: 190,
    borderRadius: 20,
    backgroundColor: "#EFE7FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  imagePlaceholderContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageText: {
    color: "#7B61FF",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4B5563",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  rowOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    backgroundColor: "#EDE9FE",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  optionButtonActive: {
    backgroundColor: "#7C3AED",
  },
  optionText: {
    color: "#6D28D9",
    fontWeight: "600",
  },
  optionTextActive: {
    color: "#FFFFFF",
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F1EDFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#DED4FF",
    gap: 10,
  },
  noticeText: {
    flex: 1,
    color: "#5B4D8A",
    fontSize: 13.5,
    lineHeight: 20,
  },
  locationButton: {
    backgroundColor: "#C4B5FD",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  locationButtonText: {
    color: "#4C1D95",
    fontWeight: "700",
  },
  locationBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  locationText: {
    color: "#374151",
    marginBottom: 8,
  },
  mapLink: {
    color: "#7C3AED",
    fontWeight: "700",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 26,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#E9DFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#6A5ACD",
    fontSize: 15,
    fontWeight: "800",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#7B61FF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});