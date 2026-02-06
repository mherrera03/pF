import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

/* ---------------- MODELO ---------------- */

type MedicalAppointment = {
  petName: string;
  reason: string;
  date: string;
  time: string;
  clinic: string;
};

/* ---------------- DATA ---------------- */

const sampleAppointments: MedicalAppointment[] = [
  {
    petName: "Max",
    reason: "Vacunación Anual",
    date: "25/10/2025",
    time: "10:00 AM",
    clinic: "Vet Central",
  },
  {
    petName: "Luna",
    reason: "Control de Peso",
    date: "30/10/2025",
    time: "04:30 PM",
    clinic: "Clínica Animal",
  },
  {
    petName: "Thor",
    reason: "Desparasitación",
    date: "02/11/2025",
    time: "09:15 AM",
    clinic: "Vet Central",
  },
];

/* ---------------- SCREEN ---------------- */

export default function CitasScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={sampleAppointments}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListHeaderComponent={
          <>
            <CitasHeader />

            <TouchableOpacity style={styles.addButton}>
              <MaterialIcons name="add-circle" size={22} color="white" />
              <Text style={styles.addButtonText}>Agendar Nueva Cita</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Próximas Citas</Text>
          </>
        }
        renderItem={({ item }) => (
          <AppointmentCard appointment={item} />
        )}
      />
    </View>
  );
}

/* ---------------- HEADER ---------------- */

function CitasHeader() {
  return (
    <View style={styles.header}>
      <MaterialIcons
        name="medical-services"
        size={50}
        color="#4DB6AC"
      />
      <Text style={styles.title}>Salud y Citas</Text>
      <Text style={styles.subtitle}>
        Gestiona el bienestar de tus mascotas
      </Text>
    </View>
  );
}

/* ---------------- CARD ---------------- */

function AppointmentCard({
  appointment,
}: {
  appointment: MedicalAppointment;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <MaterialIcons name="event" size={26} color="#00796B" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.petName}>
            {appointment.petName}
          </Text>

          <Text style={styles.reason}>
            {appointment.reason}
          </Text>

          <Text style={styles.gray}>
            {appointment.date} • {appointment.time}
          </Text>

          <Text style={styles.lightGray}>
            {appointment.clinic}
          </Text>
        </View>

        <TouchableOpacity>
          <MaterialIcons
            name="more-vert"
            size={22}
            color="gray"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },

  header: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
  },

  subtitle: {
    color: "gray",
    fontSize: 14,
  },

  addButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#4DB6AC",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 12,
  },

  addButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },

  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginVertical: 8,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#E0F2F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  petName: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#00796B",
  },

  reason: {
    fontSize: 14,
    fontWeight: "500",
  },

  gray: {
    fontSize: 13,
    color: "gray",
  },

  lightGray: {
    fontSize: 12,
    color: "#BDBDBD",
  },
});
