import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../config/firebase";

type AdoptionDetail = {
  id: string;
  nombre?: string;
  tipo?: string;
  especie?: string;
  raza?: string;
  edad?: string;
  tamaño?: string;
  sexo?: string;
  color?: string;
  salud?: string;
  energia?: string;
  descripcion?: string;
  contactoNombre?: string;
  telefono?: string;
  ubicacion?: string;
  vacunado?: string;
  esterilizado?: string;
  convivePerros?: string;
  conviveGatos?: string;
  conviveNinos?: string;
  tipoHogar?: string;
  requisitos?: string;
  seguimiento?: string;
  notas?: string;
  fotoUrl?: string | null;
  fotosUrls?: string[];
  ownerName?: string;
  ownerUid?: string;
};

export default function AdoptionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [mascota, setMascota] = useState<AdoptionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "adopciones", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setMascota({
            id: snap.id,
            ...(snap.data() as Omit<AdoptionDetail, "id">),
          });
        } else {
          setMascota(null);
        }
      } catch (error) {
        console.log("Error cargando detalle de adopción:", error);
        setMascota(null);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [id]);

  const nombreMascota = useMemo(() => mascota?.nombre || "Mascota", [mascota]);

  const fotos = useMemo(() => {
    if (Array.isArray(mascota?.fotosUrls) && mascota.fotosUrls.length > 0) {
      return mascota.fotosUrls;
    }

    if (mascota?.fotoUrl) {
      return [mascota.fotoUrl];
    }

    return [];
  }, [mascota]);

  const abrirTelefono = async () => {
    if (!mascota?.telefono) return;
    const url = `tel:${mascota.telefono}`;
    await Linking.openURL(url);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#7B61FF" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </SafeAreaView>
    );
  }

  if (!mascota) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorTitle}>No se encontró la publicación</Text>
        <TouchableOpacity style={styles.backOnlyButton} onPress={() => router.back()}>
          <Text style={styles.backOnlyButtonText}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F2FF" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#6A5ACD" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
            {fotos.length > 0 ? (
      <>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
        >
          {fotos.map((foto, index) => (
            <Image
              key={`${foto}-${index}`}
              source={{ uri: foto }}
              style={styles.heroImage}
            />
          ))}
        </ScrollView>

        {fotos.length > 1 && (
          <Text style={styles.carouselCount}>
            {fotos.length} fotos
          </Text>
        )}
      </>
    ) : (
      <View style={styles.heroPlaceholder}>
        <MaterialIcons name="pets" size={54} color="#9575CD" />
      </View>
    )}

        <View style={styles.headerCard}>
          <Text style={styles.name}>{mascota.nombre || "Sin nombre"}</Text>
          <Text style={styles.meta}>
            {[mascota.raza, mascota.edad, mascota.sexo].filter(Boolean).join(" • ") ||
              "Información general"}
          </Text>
          <Text style={styles.owner}>
            Publicado por: {mascota.ownerName || mascota.contactoNombre || "Usuario"}
          </Text>
        </View>

        <Section title="Descripción">
          <Text style={styles.bodyText}>
            {mascota.descripcion || "No se agregó descripción."}
          </Text>
        </Section>

        <Section title="Datos de la mascota">
          <InfoRow label="Especie" value={mascota.tipo || mascota.especie} />
          <InfoRow label="Raza" value={mascota.raza} />
          <InfoRow label="Edad" value={mascota.edad} />
          <InfoRow label="Tamaño" value={mascota.tamaño} />
          <InfoRow label="Sexo" value={mascota.sexo} />
          <InfoRow label="Color" value={mascota.color} />
          <InfoRow label="Salud" value={mascota.salud} />
          <InfoRow label="Energía" value={mascota.energia} />
          <InfoRow label="Vacunado" value={mascota.vacunado} />
          <InfoRow label="Esterilizado" value={mascota.esterilizado} />
        </Section>

        <Section title="Convivencia">
          <InfoRow label="Convive con perros" value={mascota.convivePerros} />
          <InfoRow label="Convive con gatos" value={mascota.conviveGatos} />
          <InfoRow label="Convive con niños" value={mascota.conviveNinos} />
          <InfoRow label="Hogar ideal" value={mascota.tipoHogar} />
        </Section>

        <Section title="Proceso de adopción">
          <InfoRow label="Ubicación" value={mascota.ubicacion} />
          <InfoRow label="Responsable" value={mascota.contactoNombre || mascota.ownerName} />
          <InfoRow label="Teléfono" value={mascota.telefono} />
          <InfoRow label="Requisitos" value={mascota.requisitos} />
          <InfoRow label="Seguimiento" value={mascota.seguimiento} />
          <InfoRow label="Notas" value={mascota.notas} />
        </Section>

        {!!mascota.telefono && (
          <TouchableOpacity style={styles.secondaryButton} onPress={abrirTelefono}>
            <Text style={styles.secondaryButtonText}>Llamar al contacto</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.push({
              pathname: "/perfilInteres",
              params: {
                petId: mascota.id,
                petName: mascota.nombre || "",
                petBreed: mascota.raza || "",
                petAge: mascota.edad || "",
                petGender: mascota.sexo || "",
                ownerUid: mascota.ownerUid || "",
                ownerName: mascota.ownerName || mascota.contactoNombre || "Usuario",
              },
            })
          }
        >
          <Text style={styles.primaryButtonText}>Quiero adoptar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "No especificado"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  carousel: {
  marginTop: 8,
  marginBottom: 10,
},
carouselCount: {
  marginBottom: 12,
  textAlign: "center",
  color: "#6B7280",
  fontSize: 12,
  fontWeight: "700",
},
  container: { flex: 1, backgroundColor: "#F6F2FF" },
  centered: {
    flex: 1,
    backgroundColor: "#F6F2FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { marginTop: 10, color: "#666" },
  errorTitle: { fontSize: 18, fontWeight: "800", color: "#5E35B1", marginBottom: 14 },
  backOnlyButton: {
    backgroundColor: "#7B61FF",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backOnlyButtonText: { color: "white", fontWeight: "800" },
  topBar: { paddingHorizontal: 18, paddingTop: 8 },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EDE7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { padding: 18, paddingBottom: 40 },
  heroImage: {
    width: 340,
    height: 260,
    borderRadius: 22,
    marginRight: 10,
  },
  heroPlaceholder: {
    width: "100%",
    height: 260,
    borderRadius: 22,
    marginTop: 8,
    marginBottom: 14,
    backgroundColor: "#F3E5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E7DEFF",
  },
  name: { fontSize: 26, fontWeight: "800", color: "#6A5ACD", marginBottom: 4 },
  meta: { color: "#6B7280", fontSize: 14, marginBottom: 6 },
  owner: { color: "#6B7280", fontSize: 13 },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E7DEFF",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#5E35B1",
    marginBottom: 10,
  },
  bodyText: { color: "#374151", fontSize: 14, lineHeight: 21 },
  infoRow: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0ECFF",
    paddingBottom: 8,
  },
  infoLabel: { fontSize: 12, color: "#7C7C8A", fontWeight: "700", marginBottom: 2 },
  infoValue: { fontSize: 14, color: "#374151" },
  secondaryButton: {
    backgroundColor: "#EDE7FF",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButtonText: { color: "#6A52D9", fontWeight: "800", fontSize: 15 },
  primaryButton: {
    backgroundColor: "#7B61FF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  primaryButtonText: { color: "white", fontWeight: "800", fontSize: 15 },
});