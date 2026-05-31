import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
    where,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";

type AppNotification = {
  id: string;
  ownerUid: string;
  tipo: "reporte" | "adopcion" | "cita" | "chat" | "sistema" | string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt?: any;
};

export default function NotificacionesRecientes() {
  const [notificaciones, setNotificaciones] = useState<AppNotification[]>([]);
  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(true);

  useEffect(() => {
    const unsubscribe = escucharNotificaciones();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const escucharNotificaciones = () => {
    const user = auth.currentUser;

    if (!user) {
      setCargandoNotificaciones(false);
      return;
    }

    const q = query(
      collection(db, "notificaciones"),
      where("ownerUid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: AppNotification[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();

          return {
            id: docSnap.id,
            ownerUid: d.ownerUid || "",
            tipo: d.tipo || "sistema",
            titulo: d.titulo || "Notificación",
            mensaje: d.mensaje || "",
            leida: d.leida ?? false,
            createdAt: d.createdAt,
          };
        });

        setNotificaciones(data);
        setCargandoNotificaciones(false);
      },
      (error) => {
        console.log("Error cargando notificaciones:", error);
        setCargandoNotificaciones(false);
        Alert.alert("Error", "No se pudieron cargar las notificaciones.");
      }
    );

    return unsubscribe;
  };

  const marcarComoLeida = async (notificacionId: string) => {
    try {
      await updateDoc(doc(db, "notificaciones", notificacionId), {
        leida: true,
      });
    } catch (error) {
      console.log("Error marcando notificación como leída:", error);
      Alert.alert("Error", "No se pudo marcar como leída.");
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      const pendientes = notificaciones.filter((n) => !n.leida);

      if (pendientes.length === 0) {
        Alert.alert("Listo", "No tienes notificaciones pendientes.");
        return;
      }

      await Promise.all(
        pendientes.map((n) =>
          updateDoc(doc(db, "notificaciones", n.id), {
            leida: true,
          })
        )
      );

      Alert.alert("Listo", "Todas las notificaciones fueron marcadas como leídas.");
    } catch (error) {
      console.log("Error marcando todas como leídas:", error);
      Alert.alert("Error", "No se pudieron marcar como leídas.");
    }
  };

  const eliminarNotificacion = (notificacionId: string) => {
    Alert.alert(
      "Eliminar notificación",
      "¿Quieres eliminar esta notificación?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "notificaciones", notificacionId));
            } catch (error) {
              console.log("Error eliminando notificación:", error);
              Alert.alert("Error", "No se pudo eliminar la notificación.");
            }
          },
        },
      ]
    );
  };

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

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

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "900",
              color: "#1F2937",
            }}
          >
            Notificaciones
          </Text>

          <Text
            style={{
              color: "#666",
              marginTop: 4,
            }}
          >
            {noLeidas > 0
              ? `${noLeidas} sin leer`
              : "No tienes notificaciones pendientes"}
          </Text>
        </View>

        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#E8F7F5",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name="bell-outline"
            size={27}
            color="#4DB6AC"
          />
        </View>
      </View>

      <Text
        style={{
          color: "#666",
          marginBottom: 16,
          lineHeight: 22,
        }}
      >
        Aquí puedes revisar tus avisos recientes sobre reportes, adopciones,
        citas, chats y novedades de la app.
      </Text>

      {noLeidas > 0 ? (
        <TouchableOpacity
          onPress={marcarTodasComoLeidas}
          style={{
            backgroundColor: "#E8F7F5",
            paddingVertical: 13,
            paddingHorizontal: 16,
            borderRadius: 16,
            marginBottom: 16,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#4DB6AC",
              fontWeight: "900",
              fontSize: 15,
            }}
          >
            Marcar todas como leídas
          </Text>
        </TouchableOpacity>
      ) : null}

      {cargandoNotificaciones ? (
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
            Cargando notificaciones...
          </Text>
        </View>
      ) : notificaciones.length === 0 ? (
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
            name="bell-outline"
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
            Aún no tienes notificaciones
          </Text>

          <Text
            style={{
              color: "#777",
              textAlign: "center",
              marginTop: 6,
              lineHeight: 20,
            }}
          >
            Cuando registres citas, adopciones, reportes o mensajes, aparecerán
            aquí.
          </Text>
        </View>
      ) : (
        notificaciones.map((notificacion) => (
          <NotificationCard
            key={notificacion.id}
            notification={notificacion}
            onPress={() => marcarComoLeida(notificacion.id)}
            onDelete={() => eliminarNotificacion(notificacion.id)}
          />
        ))
      )}
    </ScrollView>
  );
}

function NotificationCard({
  notification,
  onPress,
  onDelete,
}: {
  notification: AppNotification;
  onPress: () => void;
  onDelete: () => void;
}) {
  const color = getNotificationColor(notification.tipo);
  const icon = getNotificationIcon(notification.tipo);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        backgroundColor: notification.leida ? "#fff" : "#E8F7F5",
        padding: 18,
        borderRadius: 18,
        marginBottom: 14,
        elevation: 2,
        borderWidth: notification.leida ? 0 : 1,
        borderColor: notification.leida ? "transparent" : "#4DB6AC",
      }}
    >
      <View
        style={{
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
          <MaterialCommunityIcons name={icon as any} size={23} color={color} />
        </View>

        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontWeight: "900",
                fontSize: 15,
                color: "#1F2937",
              }}
            >
              {notification.titulo}
            </Text>

            {!notification.leida ? (
              <View
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 5,
                  backgroundColor: "#4DB6AC",
                }}
              />
            ) : null}
          </View>

          <Text
            style={{
              color: "#666",
              marginTop: 3,
              lineHeight: 20,
            }}
          >
            {notification.mensaje}
          </Text>

          <Text
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "#9CA3AF",
            }}
          >
            {formatearFecha(notification.createdAt)}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginTop: 12,
        }}
      >
        <TouchableOpacity onPress={onDelete}>
          <Text
            style={{
              color: "#C62828",
              fontWeight: "800",
            }}
          >
            Eliminar
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function getNotificationIcon(tipo: string) {
  switch (tipo) {
    case "reporte":
      return "alert-circle-outline";
    case "adopcion":
      return "heart-outline";
    case "cita":
      return "calendar-check-outline";
    case "chat":
      return "message-text-outline";
    case "sistema":
      return "bell-outline";
    default:
      return "bell-outline";
  }
}

function getNotificationColor(tipo: string) {
  switch (tipo) {
    case "reporte":
      return "#FF7043";
    case "adopcion":
      return "#EC407A";
    case "cita":
      return "#5C6BC0";
    case "chat":
      return "#4DB6AC";
    case "sistema":
      return "#607D8B";
    default:
      return "#4DB6AC";
  }
}

function formatearFecha(fecha: any) {
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