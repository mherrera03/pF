import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function MascotasRegistradas() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F5F6FA" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ color: "#4DB6AC", fontWeight: "700", marginBottom: 16, marginTop:15 }}>
          ← Volver
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "900",
          marginBottom: 18,
        }}
      >
        Mascotas registradas
      </Text>

      <View
        style={{
          backgroundColor: "#fff",
          padding: 18,
          borderRadius: 18,
          marginBottom: 14,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 17, fontWeight: "800" }}>Luna</Text>
        <Text style={{ color: "#666", marginTop: 4 }}>Gato • Siamés</Text>
        <Text style={{ color: "#666", marginTop: 4 }}>Edad: 2 años</Text>
      </View>

      <View
        style={{
          backgroundColor: "#fff",
          padding: 18,
          borderRadius: 18,
          marginBottom: 14,
          elevation: 2,
        }}
      >
        <Text style={{ fontSize: 17, fontWeight: "800" }}>Max</Text>
        <Text style={{ color: "#666", marginTop: 4 }}>Perro • Mestizo</Text>
        <Text style={{ color: "#666", marginTop: 4 }}>Edad: 4 años</Text>
      </View>

      <View
        style={{
          backgroundColor: "#fff",
          padding: 18,
          borderRadius: 18,
          elevation: 2,
        }}
      >
        <Text style={{ color: "#777", textAlign: "center" }}>
          Aquí luego puedes mostrar todas las mascotas que el usuario haya registrado.
        </Text>
      </View>
    </ScrollView>
  );
}