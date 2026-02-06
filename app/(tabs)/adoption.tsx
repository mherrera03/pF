import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  type: PetType;
  size: PetSize;
}

const adoptionPetsList: AdoptionPet[] = [
  {
    name: "Buddy",
    breed: "Golden Retriever",
    age: "2 años",
    gender: "Macho",
    personality: "Juguetón",
    type: "Perro",
    size: "Grande",
  },
  {
    name: "Mía",
    breed: "Siamés",
    age: "6 meses",
    gender: "Hembra",
    personality: "Tranquila",
    type: "Gato",
    size: "Pequeño",
  },
  {
    name: "Thor",
    breed: "Mestizo",
    age: "4 años",
    gender: "Macho",
    personality: "Protector",
    type: "Perro",
    size: "Mediano",
  },
];

export default function AdoptionScreen() {
  const [selectedType, setSelectedType] = useState<PetType | null>(null);
  const [selectedSize, setSelectedSize] = useState<PetSize | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const filteredPets = adoptionPetsList.filter(
    (pet) =>
      (!selectedType || pet.type === selectedType) &&
      (!selectedSize || pet.size === selectedSize)
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredPets}
        keyExtractor={(item) => item.name}
        ListHeaderComponent={
          <>
            <AdoptionHeader />

            <View style={styles.topRow}>
              <TouchableOpacity style={styles.adoptButton}>
                <MaterialIcons name="add" size={20} color="white" />
                <Text style={styles.adoptButtonText}>Dar en adopción</Text>
              </TouchableOpacity>

              <View>
                <TouchableOpacity
                  onPress={() => setMenuVisible(!menuVisible)}
                  style={styles.menuButton}
                >
                  <MaterialIcons name="more-vert" size={24} color="black" />
                </TouchableOpacity>

                {menuVisible && (
                  <View style={styles.menu}>
                    <Text style={styles.menuTitle}>Tipo</Text>

                    <TouchableOpacity onPress={() => setSelectedType("Perro")}>
                      <Text style={styles.menuItem}>Perros</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setSelectedType("Gato")}>
                      <Text style={styles.menuItem}>Gatos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setSelectedType(null)}>
                      <Text style={styles.menuItem}>Todos</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <Text style={styles.menuTitle}>Tamaño</Text>

                    <TouchableOpacity onPress={() => setSelectedSize("Pequeño")}>
                      <Text style={styles.menuItem}>Pequeño</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setSelectedSize("Mediano")}>
                      <Text style={styles.menuItem}>Mediano</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setSelectedSize("Grande")}>
                      <Text style={styles.menuItem}>Grande</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setSelectedSize(null)}>
                      <Text style={styles.menuItem}>Todos</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => <AdoptionPetCard pet={item} />}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

function AdoptionHeader() {
  return (
    <View style={styles.header}>
      <MaterialIcons name="favorite" size={50} color="#9575CD" />
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
          <Text style={styles.petSub}>
            {pet.age} • {pet.gender}
          </Text>
          <Text style={styles.petPersonality}>{pet.personality}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.wantButton}>
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Quiero adoptar
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  header: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "gray",
    fontSize: 14,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  adoptButton: {
    flex: 1,
    height: 45,
    backgroundColor: "#2196F3",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  adoptButtonText: {
    color: "white",
    fontWeight: "bold",
  },

  menuButton: {
    marginLeft: 8,
    padding: 6,
  },

  menu: {
    position: "absolute",
    top: 35,
    right: 0,
    width: 170,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },

  menuTitle: {
    fontWeight: "bold",
    marginTop: 4,
  },

  menuItem: {
    paddingVertical: 6,
  },

  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 6,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E1BEE7",
    padding: 12,
    marginBottom: 16,
  },

  cardRow: {
    flexDirection: "row",
  },

  petImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#F3E5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  petName: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#9575CD",
  },

  petText: {
    fontSize: 13,
  },

  petSub: {
    fontSize: 13,
    color: "gray",
  },

  petPersonality: {
    fontSize: 12,
    color: "#444",
  },

  wantButton: {
    marginTop: 12,
    height: 42,
    backgroundColor: "#9575CD",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});
