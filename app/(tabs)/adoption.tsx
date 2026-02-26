import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type PetType = "Perro" | "Gato";
type PetSize = "Pequeño" | "Mediano" | "Grande";

interface AdoptionPet {
  name: string;
  breed: string;
  age: string;
  gender: string;
  personality: string;
  tipo: PetType; 
  tamaño: PetSize; 
}

const adoptionPetsList: AdoptionPet[] = [
  { name: "Buddy", breed: "Golden Retriever", age: "2 años", gender: "Macho", personality: "Juguetón", tipo: "Perro", tamaño: "Grande" },
  { name: "Mía", breed: "Siamés", age: "6 meses", gender: "Hembra", personality: "Tranquila", tipo: "Gato", tamaño: "Pequeño" },
  { name: "Thor", breed: "Mestizo", age: "4 años", gender: "Macho", personality: "Protector", tipo: "Perro", tamaño: "Mediano" },
];

export default function AdoptionScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [mascotas, setMascotas] = useState(adoptionPetsList);
  const [filtrosActivos, setFiltrosActivos] = useState<string[]>([]);

 
  const aplicarFiltro = (tipoFiltro: string, valor: string) => {
    const filtro = `${tipoFiltro}:${valor}`;
    let nuevosFiltros;

    if (filtrosActivos.includes(filtro)) {
      nuevosFiltros = filtrosActivos.filter(f => f !== filtro);
    } else {
      nuevosFiltros = [...filtrosActivos, filtro];
    }

    setFiltrosActivos(nuevosFiltros);

    let filtrados = adoptionPetsList;
    const especies = nuevosFiltros.filter(f => f.startsWith('especie')).map(f => f.split(':')[1]);
    const tamaños = nuevosFiltros.filter(f => f.startsWith('tamaño')).map(f => f.split(':')[1]);

    if (especies.length > 0) {
      filtrados = filtrados.filter(m => especies.includes(m.tipo));
    }
    if (tamaños.length > 0) {
      filtrados = filtrados.filter(m => tamaños.includes(m.tamaño));
    }

    setMascotas(filtrados);
  };

  const limpiarFiltros = () => {
    setMascotas(adoptionPetsList);
    setFiltrosActivos([]);
    setMenuVisible(false);
  };

  const getMenuItemStyle = (tipo: string, valor: string) => ([
    styles.menuItem,
    filtrosActivos.includes(`${tipo}:${valor}`) && styles.menuItemActive
  ]);

  const getMenuTextStyle = (tipo: string, valor: string) => ([
    styles.menuText,
    filtrosActivos.includes(`${tipo}:${valor}`) && styles.menuTextActive
  ]);

  return (
    <View style={styles.container}>
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.androidMenu, { top: 160, right: 20 }]}>
              <Text style={styles.menuHeader}>Especie</Text>

              <TouchableOpacity style={getMenuItemStyle('especie', 'Perro')} onPress={() => aplicarFiltro('especie', 'Perro')}>
                <Text style={getMenuTextStyle('especie', 'Perro')}>Perros</Text>
              </TouchableOpacity>

              <TouchableOpacity style={getMenuItemStyle('especie', 'Gato')} onPress={() => aplicarFiltro('especie', 'Gato')}>
                <Text style={getMenuTextStyle('especie', 'Gato')}>Gatos</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <Text style={styles.menuHeader}>Tamaño</Text>

              <TouchableOpacity style={getMenuItemStyle('tamaño', 'Pequeño')} onPress={() => aplicarFiltro('tamaño', 'Pequeño')}>
                <Text style={getMenuTextStyle('tamaño', 'Pequeño')}>Pequeño</Text>
              </TouchableOpacity>

              <TouchableOpacity style={getMenuItemStyle('tamaño', 'Mediano')} onPress={() => aplicarFiltro('tamaño', 'Mediano')}>
                <Text style={getMenuTextStyle('tamaño', 'Mediano')}>Mediano</Text>
              </TouchableOpacity>

              <TouchableOpacity style={getMenuItemStyle('tamaño', 'Grande')} onPress={() => aplicarFiltro('tamaño', 'Grande')}>
                <Text style={getMenuTextStyle('tamaño', 'Grande')}>Grande</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={limpiarFiltros}>
                <Text style={[styles.menuText, {color: '#7B61FF', fontWeight: 'bold'}]}>
                  Limpiar filtros
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <FlatList
        data={mascotas}
        keyExtractor={(item) => item.name}
        ListHeaderComponent={
          <>
            <AdoptionHeader />
            <View style={styles.topRow}>
              <TouchableOpacity style={styles.adoptButton}>
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
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      />
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
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.petImage}>
          <MaterialIcons name="pets" size={40} color="#9575CD" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petText}>Raza: {pet.breed}</Text>
          <Text style={styles.petSub}>{pet.age} • {pet.gender}</Text>
          <Text style={styles.petPersonality}>{pet.personality}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.wantButton}>
        <Text style={{ color: "white", fontWeight: "bold" }}>Quiero adoptar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  modalOverlay: { flex: 1, backgroundColor: 'transparent' },
  header: { alignItems: "center", marginTop: 24, marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#5E35B1" },
  headerSubtitle: { color: "gray", fontSize: 14 },
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  adoptButton: {
    flex: 1, height: 45, backgroundColor: "#7B61FF", borderRadius: 12,
    justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 8,
  },
  adoptButtonText: { color: "white", fontWeight: "bold" },
  filterDots: { width: 40, alignItems: 'flex-end' },
  androidMenu: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 10,
    paddingVertical: 10,
    width: 170,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    zIndex: 1000
  },
  menuHeader: { fontSize: 11, color: '#999', paddingHorizontal: 15, marginBottom: 5, fontWeight: 'bold' },
  menuItem: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  menuItemActive: { backgroundColor: '#EFE9FF' },
  menuText: { fontSize: 15 },
  menuTextActive: { color: '#7B61FF', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 5 },
  card: {
    backgroundColor: "white", borderRadius: 16, borderWidth: 2,
    borderColor: "#E1BEE7", padding: 12, marginBottom: 16,
  },
  cardRow: { flexDirection: "row" },
  petImage: {
    width: 100, height: 100, borderRadius: 12, backgroundColor: "#F3E5F5",
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  petName: { fontWeight: "bold", fontSize: 20, color: "#9575CD" },
  petText: { fontSize: 13 },
  petSub: { fontSize: 13, color: "gray" },
  petPersonality: { fontSize: 12, color: "#444" },
  wantButton: {
    marginTop: 12, height: 42, backgroundColor: "#9575CD",
    borderRadius: 25, justifyContent: "center", alignItems: "center",
  },
});