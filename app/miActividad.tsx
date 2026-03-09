import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

type Activity = {
  id: number;
  type: "reporte" | "mascota" | "adopcion" | "cita";
  title: string;
  description: string;
  date: string;
};

const ACTIVITIES: Activity[] = [
  {
    id: 1,
    type: "reporte",
    title: "Reporte de mascota perdida",
    description: "Publicaste un reporte de Rocky en San Salvador",
    date: "10 marzo 2026",
  },
  {
    id: 2,
    type: "mascota",
    title: "Mascota registrada",
    description: "Agregaste a Luna a tus mascotas",
    date: "5 marzo 2026",
  },
  {
    id: 3,
    type: "adopcion",
    title: "Solicitud de adopción",
    description: "Enviaste una solicitud para adoptar a Max",
    date: "2 marzo 2026",
  },
  {
    id: 4,
    type: "cita",
    title: "Cita veterinaria programada",
    description: "Agendaste una cita para Luna",
    date: "28 febrero 2026",
  },
];

export default function MiActividad() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F5F6FA" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ color: "#4DB6AC", fontWeight: "700", marginBottom: 16, marginTop: 15 }}>
          ← Volver
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "900",
          marginBottom: 8,
          color: "#1F2937",
        }}
      >
        Mi actividad
      </Text>

      <Text
        style={{
          color: "#6B7280",
          marginBottom: 18,
        }}
      >
        Aquí puedes ver las acciones recientes que has realizado dentro de la aplicación.
      </Text>

      {ACTIVITIES.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </ScrollView>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const getIcon = () => {
    switch (activity.type) {
      case "reporte":
        return "alert-circle-outline";
      case "mascota":
        return "paw-outline";
      case "adopcion":
        return "heart-outline";
      case "cita":
        return "calendar-check-outline";
      default:
        return "information-outline";
    }
  };

  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 18,
        marginBottom: 14,
        elevation: 3,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
      }}
    >
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 23,
          backgroundColor: "#E8F7F5",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons
          name={getIcon()}
          size={22}
          color="#4DB6AC"
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontWeight: "800",
            fontSize: 15,
            color: "#1F2937",
          }}
        >
          {activity.title}
        </Text>

        <Text
          style={{
            color: "#666",
            marginTop: 2,
            lineHeight: 20,
          }}
        >
          {activity.description}
        </Text>

        <Text
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "#9CA3AF",
          }}
        >
          {activity.date}
        </Text>
      </View>
    </View>
  );
}