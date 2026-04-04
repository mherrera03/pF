import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function PerfilInteresScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const mascotaNombre =
    typeof params.petName === "string" ? params.petName : "esta mascota";
  const mascotaRaza =
    typeof params.petBreed === "string" ? params.petBreed : "";
  const mascotaEdad =
    typeof params.petAge === "string" ? params.petAge : "";
  const mascotaGenero =
    typeof params.petGender === "string" ? params.petGender : "";

  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    nombreCompleto: "",
    telefono: "",
    edad: "",
    ubicacion: "",
    motivoInteres: "",
    experienciaMascotas: "",
    cuidadorPrincipal: "",
    expectativas: "",
  });

  const actualizarCampo = (campo: string, valor: string) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
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

  const validarFormulario = () => {
    if (
      !formData.nombreCompleto.trim() ||
      !formData.telefono.trim() ||
      !formData.motivoInteres.trim() ||
      !formData.cuidadorPrincipal.trim()
    ) {
      Alert.alert(
        "Faltan datos",
        "Completa al menos el nombre, teléfono, motivo de interés y cuidador principal."
      );
      return false;
    }

    return true;
  };

  const enviarPerfil = () => {
    if (!validarFormulario()) return;

    Alert.alert(
      "Perfil enviado 💜",
      `Tu perfil de interés para ${mascotaNombre} fue enviado correctamente. Si el responsable continúa el proceso, luego podrás completar la fase 2.`
    );

    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F2FF" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={26}
              color="#6A5ACD"
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Perfil de interés</Text>
          <Text style={styles.subtitle}>
            Completa esta primera fase para mostrar tu interés en la adopción.
          </Text>

          <View style={styles.petSummaryCard}>
            <View style={styles.petIconBox}>
              <MaterialCommunityIcons name="paw" size={30} color="#7B61FF" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.petSummaryTitle}>{mascotaNombre}</Text>
              <Text style={styles.petSummaryText}>
                {mascotaRaza ? `Raza: ${mascotaRaza}` : "Raza no especificada"}
              </Text>
              <Text style={styles.petSummaryText}>
                {[mascotaEdad, mascotaGenero].filter(Boolean).join(" • ") ||
                  "Datos generales"}
              </Text>
            </View>
          </View>

          <View style={styles.noticeBox}>
            <MaterialCommunityIcons
              name="information-outline"
              size={22}
              color="#6A5ACD"
            />
            <Text style={styles.noticeText}>
              Esta es la fase 1 del proceso. Aquí se evalúa tu interés inicial.
              Si el responsable de la mascota acepta continuar, luego se
              habilitará la fase 2 con una evaluación más detallada del hogar.
            </Text>
          </View>

          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. María Fernanda López"
            placeholderTextColor="#9A8FB5"
            value={formData.nombreCompleto}
            onChangeText={(text) => actualizarCampo("nombreCompleto", text)}
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

          <Text style={styles.label}>Edad</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 22"
            placeholderTextColor="#9A8FB5"
            keyboardType="numeric"
            value={formData.edad}
            onChangeText={(text) => actualizarCampo("edad", text)}
          />

          <Text style={styles.label}>Ubicación</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={obtenerUbicacion}
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={20}
              color="#4C1D95"
            />
            <Text style={styles.locationButtonText}>
              Tomar mi ubicación actual
            </Text>
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

          <Text style={styles.label}>¿Por qué elegiste esta mascota?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Cuéntanos por qué te interesa adoptar esta mascota"
            placeholderTextColor="#9A8FB5"
            multiline
            value={formData.motivoInteres}
            onChangeText={(text) => actualizarCampo("motivoInteres", text)}
          />

          <Text style={styles.label}>¿Has tenido mascotas antes?</Text>
          <TextInput
            style={[styles.input, styles.textAreaSmall]}
            placeholder="Ej. Sí, he tenido perros / No, sería mi primera mascota"
            placeholderTextColor="#9A8FB5"
            multiline
            value={formData.experienciaMascotas}
            onChangeText={(text) =>
              actualizarCampo("experienciaMascotas", text)
            }
          />

          <Text style={styles.label}>¿Quién sería el cuidador principal?</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Yo sería la responsable principal"
            placeholderTextColor="#9A8FB5"
            value={formData.cuidadorPrincipal}
            onChangeText={(text) =>
              actualizarCampo("cuidadorPrincipal", text)
            }
          />

          <Text style={styles.label}>¿Qué esperas al adoptar?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej. Darle un hogar estable, compañía, cuidado y seguimiento responsable"
            placeholderTextColor="#9A8FB5"
            multiline
            value={formData.expectativas}
            onChangeText={(text) => actualizarCampo("expectativas", text)}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={enviarPerfil}>
            <Text style={styles.primaryButtonText}>
              Enviar perfil de interés
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: 18,
    lineHeight: 20,
  },
  petSummaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E7DEFF",
  },
  petIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F1EDFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  petSummaryTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#6A5ACD",
    marginBottom: 4,
  },
  petSummaryText: {
    fontSize: 13,
    color: "#6B7280",
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F1EDFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
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
  textAreaSmall: {
    minHeight: 80,
    textAlignVertical: "top",
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
  primaryButton: {
    backgroundColor: "#7B61FF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 26,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});