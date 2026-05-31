import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { db } from "../../config/firebase";

type PetType = "Perro" | "Gato" | "Ave" | "Otro";
type PetSize = "Pequeño" | "Mediano" | "Grande";

interface AdoptionPet {
  id: string;
  nombre: string;
  raza: string;
  edad: string;
  sexo: string;
  descripcion: string;
  tipo: PetType;
  tamaño: PetSize;
  fotoUrl?: string | null;
  fotosUrls?: string[];
  ownerName?: string;
}

export default function AdoptionScreen() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [mascotas, setMascotas] = useState<AdoptionPet[]>([]);
  const [todasLasMascotas, setTodasLasMascotas] = useState<AdoptionPet[]>([]);
  const [filtrosActivos, setFiltrosActivos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarAdopciones = async () => {
    try {
      setLoading(true);

      const q = query(collection(db, "adopciones"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const lista: AdoptionPet[] = snap.docs.map((doc) => {
        const data = doc.data();

        const fotosUrls = Array.isArray(data.fotosUrls)
          ? data.fotosUrls
          : data.fotoUrl
          ? [data.fotoUrl]
          : [];

      return {
        id: doc.id,
        nombre: data.nombre || "",
        raza: data.raza || "",
        edad: data.edad || "",
        sexo: data.sexo || "",
        descripcion: data.descripcion || "",
        tipo: data.tipo || data.especie || "Otro",
        tamaño: data.tamaño || "Mediano",
        fotoUrl: data.fotoUrl || fotosUrls[0] || null,
        fotosUrls,
        ownerName: data.ownerName || "Usuario",
      };
      });

      setTodasLasMascotas(lista);
      setMascotas(lista);
    } catch (error) {
      console.log("Error cargando adopciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarAdopciones();
    }, [])
  );

  const aplicarFiltrosConLista = (listaBase: AdoptionPet[], filtros: string[]) => {
    let filtrados = [...listaBase];

    const especies = filtros
      .filter((f) => f.startsWith("especie"))
      .map((f) => f.split(":")[1]);

    const tamaños = filtros
      .filter((f) => f.startsWith("tamaño"))
      .map((f) => f.split(":")[1]);

    if (especies.length > 0) {
      filtrados = filtrados.filter((m) => especies.includes(m.tipo));
    }

    if (tamaños.length > 0) {
      filtrados = filtrados.filter((m) => tamaños.includes(m.tamaño));
    }

    setMascotas(filtrados);
  };

  const aplicarFiltro = (tipoFiltro: string, valor: string) => {
    const filtro = `${tipoFiltro}:${valor}`;
    let nuevosFiltros: string[];

    if (filtrosActivos.includes(filtro)) {
      nuevosFiltros = filtrosActivos.filter((f) => f !== filtro);
    } else {
      nuevosFiltros = [...filtrosActivos, filtro];
    }

    setFiltrosActivos(nuevosFiltros);
    aplicarFiltrosConLista(todasLasMascotas, nuevosFiltros);
  };

  const limpiarFiltros = () => {
    setMascotas(todasLasMascotas);
    setFiltrosActivos([]);
    setMenuVisible(false);
  };

  const getMenuItemStyle = (tipo: string, valor: string) => [
    styles.menuItem,
    filtrosActivos.includes(`${tipo}:${valor}`) && styles.menuItemActive,
  ];

  const getMenuTextStyle = (tipo: string, valor: string) => [
    styles.menuText,
    filtrosActivos.includes(`${tipo}:${valor}`) && styles.menuTextActive,
  ];

  return (
    <View style={styles.container}>
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.androidMenu, { top: 160, right: 20 }]}>
              <Text style={styles.menuHeader}>Especie</Text>

              <TouchableOpacity
                style={getMenuItemStyle("especie", "Perro")}
                onPress={() => aplicarFiltro("especie", "Perro")}
              >
                <Text style={getMenuTextStyle("especie", "Perro")}>Perros</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={getMenuItemStyle("especie", "Gato")}
                onPress={() => aplicarFiltro("especie", "Gato")}
              >
                <Text style={getMenuTextStyle("especie", "Gato")}>Gatos</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <Text style={styles.menuHeader}>Tamaño</Text>

              <TouchableOpacity
                style={getMenuItemStyle("tamaño", "Pequeño")}
                onPress={() => aplicarFiltro("tamaño", "Pequeño")}
              >
                <Text style={getMenuTextStyle("tamaño", "Pequeño")}>Pequeño</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={getMenuItemStyle("tamaño", "Mediano")}
                onPress={() => aplicarFiltro("tamaño", "Mediano")}
              >
                <Text style={getMenuTextStyle("tamaño", "Mediano")}>Mediano</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={getMenuItemStyle("tamaño", "Grande")}
                onPress={() => aplicarFiltro("tamaño", "Grande")}
              >
                <Text style={getMenuTextStyle("tamaño", "Grande")}>Grande</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={limpiarFiltros}>
                <Text style={[styles.menuText, { color: "#7B61FF", fontWeight: "bold" }]}>
                  Limpiar filtros
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#7B61FF" />
          <Text style={{ marginTop: 10, color: "#666" }}>Cargando adopciones...</Text>
        </View>
      ) : (
        <FlatList
          data={mascotas}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              <AdoptionHeader />

              <View style={styles.topRow}>
                <TouchableOpacity
                  style={styles.adoptButton}
                  onPress={() => router.push("/darAdop")}
                >
                  <MaterialIcons name="add" size={20} color="white" />
                  <Text style={styles.adoptButtonText}>Dar en adopción</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setMenuVisible(true)}
                  style={styles.filterDots}
                >
                  <MaterialCommunityIcons name="dots-vertical" size={28} color="#444" />
                </TouchableOpacity>
              </View>
            </>
          }
          renderItem={({ item }) => <AdoptionPetCard pet={item} />}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 30, color: "#777" }}>
              No hay mascotas en adopción
            </Text>
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        />
      )}
    </View>
  );
}

function AdoptionHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Adopción</Text>
      <Text style={styles.headerSubtitle}>Encuentra un nuevo amigo</Text>
    </View>
  );
}

function AdoptionPetCard({ pet }: { pet: AdoptionPet }) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.imageBox}>
          {pet.fotoUrl ? (
            <Image source={{ uri: pet.fotoUrl }} style={styles.petImageReal} />
          ) : (
            <View style={styles.petImage}>
              <MaterialIcons name="pets" size={40} color="#9575CD" />
            </View>
          )}

          {(pet.fotosUrls?.length || 0) > 1 && (
            <View style={styles.morePhotosBadge}>
              <Text style={styles.morePhotosText}>+{(pet.fotosUrls?.length || 0) - 1}</Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.ownerText}>Publicado por: {pet.ownerName || "Usuario"}</Text>
          <Text style={styles.petName}>{pet.nombre}</Text>
          <Text style={styles.petText}>Raza: {pet.raza}</Text>
          <Text style={styles.petSub}>
            {pet.edad} • {pet.sexo}
          </Text>
          <Text style={styles.petPersonality} numberOfLines={2}>
            {pet.descripcion}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.wantButton}
        onPress={() =>
          router.push({
            pathname: "/infoAdopcion",
            params: { id: pet.id },
          })
        }
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Ver información</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  imageBox: {
  width: 100,
  height: 100,
  marginRight: 12,
  position: "relative",
},

morePhotosBadge: {
  position: "absolute",
  right: 6,
  bottom: 6,
  backgroundColor: "rgba(0,0,0,0.65)",
  borderRadius: 12,
  minWidth: 34,
  height: 24,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 8,
},

morePhotosText: {
  color: "white",
  fontWeight: "800",
  fontSize: 12,
},
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  modalOverlay: { flex: 1, backgroundColor: "transparent" },
  header: { alignItems: "center", marginTop: 24, marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#5E35B1" },
  headerSubtitle: { color: "gray", fontSize: 14 },
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  adoptButton: {
    flex: 1,
    height: 45,
    backgroundColor: "#7B61FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  adoptButtonText: { color: "white", fontWeight: "bold" },
  filterDots: { width: 40, alignItems: "flex-end" },
  androidMenu: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 10,
    paddingVertical: 10,
    width: 170,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 1000,
  },
  menuHeader: {
    fontSize: 11,
    color: "#999",
    paddingHorizontal: 15,
    marginBottom: 5,
    fontWeight: "bold",
  },
  menuItem: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  menuItemActive: { backgroundColor: "#EFE9FF" },
  menuText: { fontSize: 15 },
  menuTextActive: { color: "#7B61FF", fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 5 },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E1BEE7",
    padding: 12,
    marginBottom: 16,
  },
  cardRow: { flexDirection: "row" },
  petImage: {
  width: 100,
  height: 100,
  borderRadius: 12,
  backgroundColor: "#F3E5F5",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
},
petImageReal: {
  width: 100,
  height: 100,
  borderRadius: 12,
  marginRight: 12,
},
  petName: { fontWeight: "bold", fontSize: 20, color: "#9575CD" },
  petText: { fontSize: 13 },
  petSub: { fontSize: 13, color: "gray" },
  petPersonality: { fontSize: 12, color: "#444" },
  wantButton: {
    marginTop: 12,
    height: 42,
    backgroundColor: "#9575CD",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ownerText: {
  fontSize: 12,
  color: "#666",
  marginTop: 4,
  },
});