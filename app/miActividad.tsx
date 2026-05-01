import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";

type ActivityType = "reporte" | "mascota" | "adopcion" | "cita";

type Activity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  date: string;
  timestamp: number;
};

export default function MiActividad() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setCargando(false);
      return;
    }

    const reportesQuery = query(
      collection(db, "reportes"),
      where("ownerUid", "==", user.uid)
    );

    const mascotasQuery = query(
      collection(db, "mascotas"),
      where("ownerUid", "==", user.uid)
    );

    const adopcionesQuery = query(
      collection(db, "adopciones"),
      where("ownerUid", "==", user.uid)
    );

    const citasQuery = query(
      collection(db, "citas"),
      where("ownerUid", "==", user.uid)
    );

    let reportes: Activity[] = [];
    let mascotas: Activity[] = [];
    let adopciones: Activity[] = [];
    let citas: Activity[] = [];

    const actualizarLista = () => {
      const todas = [...reportes, ...mascotas, ...adopciones, ...citas].sort(
        (a, b) => b.timestamp - a.timestamp
      );

      setActivities(todas);
      setCargando(false);
    };

    const unsubReportes = onSnapshot(
      reportesQuery,
      (snapshot) => {
        reportes = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const fecha = data.createdAt || data.updatedAt;

          const nombreMascota =
            data.nombre ||
            data.nombreMascota ||
            data.petName ||
            "una mascota";

          const ubicacion =
            data.ubicacion ||
            data.direccion ||
            data.zona ||
            "ubicación no especificada";

          return {
            id: `reporte-${docSnap.id}`,
            type: "reporte",
            title: "Reporte de mascota perdida",
            description: `Publicaste un reporte de ${nombreMascota} en ${ubicacion}`,
            date: formatearFechaFirestore(fecha),
            timestamp: obtenerTimestamp(fecha),
          };
        });

        actualizarLista();
      },
      (error) => {
        console.log("Error cargando reportes en actividad:", error);
        actualizarLista();
      }
    );

    const unsubMascotas = onSnapshot(
      mascotasQuery,
      (snapshot) => {
        mascotas = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const fecha = data.createdAt || data.updatedAt;

          const nombreMascota = data.nombre || "una mascota";
          const tipo = data.tipo || data.especie || "mascota";

          return {
            id: `mascota-${docSnap.id}`,
            type: "mascota",
            title: "Mascota registrada",
            description: `Agregaste a ${nombreMascota} a tus mascotas registradas (${tipo})`,
            date: formatearFechaFirestore(fecha),
            timestamp: obtenerTimestamp(fecha),
          };
        });

        actualizarLista();
      },
      (error) => {
        console.log("Error cargando mascotas en actividad:", error);
        actualizarLista();
      }
    );

    const unsubAdopciones = onSnapshot(
      adopcionesQuery,
      (snapshot) => {
        adopciones = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const fecha = data.createdAt || data.updatedAt;

          const nombreMascota =
            data.nombre ||
            data.nombreMascota ||
            data.petName ||
            "una mascota";

          return {
            id: `adopcion-${docSnap.id}`,
            type: "adopcion",
            title: "Mascota puesta en adopción",
            description: `Publicaste a ${nombreMascota} para adopción`,
            date: formatearFechaFirestore(fecha),
            timestamp: obtenerTimestamp(fecha),
          };
        });

        actualizarLista();
      },
      (error) => {
        console.log("Error cargando adopciones en actividad:", error);
        actualizarLista();
      }
    );

    const unsubCitas = onSnapshot(
      citasQuery,
      (snapshot) => {
        citas = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const fecha = data.createdAt || data.updatedAt;

          const nombreMascota =
            data.petName ||
            data.nombre ||
            data.nombreMascota ||
            "tu mascota";

          const fechaCita = data.date || "fecha pendiente";
          const horaCita = data.time || "hora pendiente";

          return {
            id: `cita-${docSnap.id}`,
            type: "cita",
            title: "Cita veterinaria programada",
            description: `Agendaste una cita para ${nombreMascota} el ${fechaCita} a las ${horaCita}`,
            date: formatearFechaFirestore(fecha),
            timestamp: obtenerTimestamp(fecha),
          };
        });

        actualizarLista();
      },
      (error) => {
        console.log("Error cargando citas en actividad:", error);
        actualizarLista();
      }
    );

    return () => {
      unsubReportes();
      unsubMascotas();
      unsubAdopciones();
      unsubCitas();
    };
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F5F6FA" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text
          style={{
            color: "#4DB6AC",
            fontWeight: "700",
            marginBottom: 16,
            marginTop: 15,
          }}
        >
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
          lineHeight: 20,
        }}
      >
        Aquí puedes ver las acciones recientes que has realizado dentro de la
        aplicación.
      </Text>

      {cargando ? (
        <View
          style={{
            backgroundColor: "#fff",
            padding: 25,
            borderRadius: 18,
            alignItems: "center",
            elevation: 2,
          }}
        >
          <ActivityIndicator size="large" color="#4DB6AC" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            Cargando actividad...
          </Text>
        </View>
      ) : activities.length === 0 ? (
        <View
          style={{
            backgroundColor: "#fff",
            padding: 22,
            borderRadius: 18,
            alignItems: "center",
            elevation: 2,
          }}
        >
          <MaterialCommunityIcons
            name="clipboard-text-clock-outline"
            size={45}
            color="#4DB6AC"
          />

          <Text
            style={{
              fontWeight: "800",
              fontSize: 17,
              color: "#1F2937",
              marginTop: 10,
              textAlign: "center",
            }}
          >
            Aún no tienes actividad
          </Text>

          <Text
            style={{
              color: "#777",
              textAlign: "center",
              marginTop: 6,
              lineHeight: 20,
            }}
          >
            Cuando registres mascotas, reportes, adopciones o citas, aparecerán
            aquí.
          </Text>
        </View>
      ) : (
        activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))
      )}
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

  const getColor = () => {
    switch (activity.type) {
      case "reporte":
        return "#FF7043";
      case "mascota":
        return "#4DB6AC";
      case "adopcion":
        return "#EC407A";
      case "cita":
        return "#5C6BC0";
      default:
        return "#4DB6AC";
    }
  };

  const color = getColor();

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
          backgroundColor: `${color}20`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons
          name={getIcon() as any}
          size={22}
          color={color}
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

function obtenerTimestamp(fecha: any) {
  if (!fecha) return 0;

  if (fecha?.toDate) {
    return fecha.toDate().getTime();
  }

  if (fecha instanceof Date) {
    return fecha.getTime();
  }

  return 0;
}

function formatearFechaFirestore(fecha: any) {
  if (!fecha) return "Fecha no disponible";

  let dateObj: Date;

  if (fecha?.toDate) {
    dateObj = fecha.toDate();
  } else if (fecha instanceof Date) {
    dateObj = fecha;
  } else {
    return "Fecha no disponible";
  }

  return dateObj.toLocaleDateString("es-SV", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}