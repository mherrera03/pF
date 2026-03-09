import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { db } from "../config/firebase";

import MapView, { Marker } from "react-native-maps";

export default function DetalleReporte() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [reporte, setReporte] = useState<any>(null);

  useEffect(() => {
    const cargar = async () => {
      const ref = doc(db, "reportes", id as string);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setReporte(snap.data());
      }
    };

    cargar();
  }, []);

  const abrirMaps = () => {
    if (!reporte?.coords) return;

    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${reporte.coords.latitude},${reporte.coords.longitude}`
    );
  };

  const llamarDueno = () => {
    if (!reporte?.telefono) return;
    Linking.openURL(`tel:${reporte.telefono}`);
  };

  const compartirReporte = async () => {
    try {
      await Share.share({
        message:
          `🐾 Reporte de mascota perdida\n\n` +
          `Nombre: ${reporte?.nombre || "No especificado"}\n` +
          `Especie: ${reporte?.tipo || "No especificado"}\n` +
          `Raza: ${reporte?.raza || "No especificada"}\n` +
          `Color: ${reporte?.color || "No especificado"}\n` +
          `Fecha: ${reporte?.fecha || "No especificada"}\n` +
          `Teléfono: ${reporte?.telefono || "No disponible"}\n` +
          `Rasgos: ${reporte?.rasgos || "Sin detalles"}`
      });
    } catch (error) {
      console.log("Error al compartir:", error);
    }
  };

  // 🔔 NUEVO: reportar hallazgo
  const reportarHallazgo = async () => {
    try {

      // guardar reporte de hallazgo
      await addDoc(collection(db, "hallazgos"), {
        reporteId: id,
        nombreMascota: reporte?.nombre || null,
        telefonoContacto: reporte?.telefono || null,
        createdAt: serverTimestamp()
      });

      // crear notificación para el dueño
      await addDoc(collection(db, "notificaciones"), {
        tipo: "hallazgo",
        reporteId: id,
        mensaje: `Alguien reportó haber encontrado a ${reporte?.nombre || "tu mascota"}`,
        createdAt: serverTimestamp(),
        leido: false
      });

      alert("Se notificó al dueño de la mascota 🐾");

    } catch (error) {
      console.log("Error reportando hallazgo:", error);
    }
  };

  if (!reporte) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando reporte...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      {reporte.fotoUrl ? (
        <Image source={{ uri: reporte.fotoUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>Sin imagen</Text>
        </View>
      )}

      <View style={styles.headerCard}>
        <Text style={styles.nombre}>{reporte.nombre || "Mascota sin nombre"}</Text>
        <Text style={styles.estado}>Reporte de mascota perdida</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, !reporte.telefono && styles.actionButtonDisabled]}
          onPress={llamarDueno}
          disabled={!reporte.telefono}
        >
          <Text style={styles.actionButtonText}>Llamar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={compartirReporte}>
          <Text style={styles.actionButtonText}>Compartir</Text>
        </TouchableOpacity>
      </View>

      {/* 🐾 NUEVO BOTÓN */}
      <TouchableOpacity
        style={styles.foundButton}
        onPress={reportarHallazgo}
      >
        <Text style={styles.foundButtonText}>Reportar hallazgo</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información general</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Especie:</Text>
          <Text style={styles.value}>{reporte.tipo || "No especificado"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Raza:</Text>
          <Text style={styles.value}>{reporte.raza || "No especificada"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tamaño:</Text>
          <Text style={styles.value}>{reporte.tamaño || "No especificado"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Color:</Text>
          <Text style={styles.value}>{reporte.color || "No especificado"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.value}>{reporte.fecha || "No especificada"}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Características</Text>
        <Text style={styles.description}>
          {reporte.rasgos || "No se agregaron rasgos o características distintivas."}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contacto</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Teléfono:</Text>
          <Text style={styles.value}>{reporte.telefono || "No disponible"}</Text>
        </View>
      </View>

      {reporte.coords && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ubicación</Text>

          <MapView
            style={styles.map}
            initialRegion={{
              latitude: reporte.coords.latitude,
              longitude: reporte.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: reporte.coords.latitude,
                longitude: reporte.coords.longitude,
              }}
            />
          </MapView>

          <TouchableOpacity style={styles.mapButton} onPress={abrirMaps}>
            <Text style={styles.mapButtonText}>Abrir en Google Maps</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F2FF",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F2FF",
    padding: 40,
  },

  loadingText: {
    fontSize: 18,
    color: "#6B5AA6",
    fontWeight: "600",
  },

  backButton: {
    marginTop: 10,
    marginBottom: 10,
    alignSelf: "flex-start",
    backgroundColor: "#E9DFFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  backText: {
    color: "#5E35B1",
    fontWeight: "bold",
    fontSize: 14,
  },

  image: {
    width: "100%",
    height: 260,
    borderRadius: 24,
    marginBottom: 18,
  },

  imagePlaceholder: {
    width: "100%",
    height: 260,
    borderRadius: 24,
    marginBottom: 18,
    backgroundColor: "#E9DFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  imagePlaceholderText: {
    color: "#7B61FF",
    fontSize: 18,
    fontWeight: "600",
  },

  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E4D8FF",
  },

  nombre: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#5E35B1",
    marginBottom: 6,
  },

  estado: {
    fontSize: 15,
    color: "#8A79C9",
    fontWeight: "600",
    marginBottom: 12,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  actionButton: {
    flex: 1,
    backgroundColor: "#7B61FF",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
  },

  actionButtonDisabled: {
    opacity: 0.5,
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },

  // 🐾 ESTILOS NUEVOS
  foundButton: {
    backgroundColor: "#ab1d85",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
  },

  foundButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E4D8FF",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5E35B1",
    marginBottom: 14,
  },

  row: {
    marginBottom: 10,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7A68B3",
    marginBottom: 2,
  },

  value: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
  },

  description: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
  },

  map: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    marginTop: 4,
  },

  mapButton: {
    marginTop: 14,
    backgroundColor: "#7B61FF",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
  },

  mapButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});