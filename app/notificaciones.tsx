import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";

type NotificationSettings = {
  alertasPerdidas: boolean;
  solicitudesAdopcion: boolean;
  recordatoriosCitas: boolean;
  novedadesApp: boolean;
};

type AppNotification = {
  id: string;
  ownerUid: string;
  tipo: "reporte" | "adopcion" | "cita" | "chat" | "sistema" | string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt?: any;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  alertasPerdidas: true,
  solicitudesAdopcion: true,
  recordatoriosCitas: false,
  novedadesApp: false,
};

export default function Notificaciones() {
  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);

  const [notificaciones, setNotificaciones] = useState<AppNotification[]>([]);

  const [cargando, setCargando] = useState(true);
  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarPreferencias();
    escucharNotificaciones();
  }, []);

  const cargarPreferencias = async () => {
    const user = auth.currentUser;

    if (!user) {
      setCargando(false);
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        if (data.notificationSettings) {
          setSettings({
            alertasPerdidas:
              data.notificationSettings.alertasPerdidas ??
              DEFAULT_SETTINGS.alertasPerdidas,

            solicitudesAdopcion:
              data.notificationSettings.solicitudesAdopcion ??
              DEFAULT_SETTINGS.solicitudesAdopcion,

            recordatoriosCitas:
              data.notificationSettings.recordatoriosCitas ??
              DEFAULT_SETTINGS.recordatoriosCitas,

            novedadesApp:
              data.notificationSettings.novedadesApp ??
              DEFAULT_SETTINGS.novedadesApp,
          });
        }
      }
    } catch (error) {
      console.log("Error cargando preferencias:", error);
      Alert.alert(
        "Error",
        "No se pudieron cargar tus preferencias de notificaciones."
      );
    } finally {
      setCargando(false);
    }
  };

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

  const actualizarPreferencia = async (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Sesión no encontrada",
        "Debes iniciar sesión para cambiar tus preferencias."
      );
      return;
    }

    const preferenciasAnteriores = settings;

    const nuevasPreferencias = {
      ...settings,
      [key]: value,
    };

    setSettings(nuevasPreferencias);

    try {
      setGuardando(true);

      await setDoc(
        doc(db, "users", user.uid),
        {
          notificationSettings: nuevasPreferencias,
        },
        { merge: true }
      );
    } catch (error) {
      console.log("Error guardando preferencia:", error);

      setSettings(preferenciasAnteriores);

      Alert.alert(
        "Error",
        "No se pudo guardar el cambio. Intenta nuevamente."
      );
    } finally {
      setGuardando(false);
    }
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

      await Promise.all(
        pendientes.map((n) =>
          updateDoc(doc(db, "notificaciones", n.id), {
            leida: true,
          })
        )
      );
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

  if (cargando) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F5F6FA",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#4DB6AC" />
        <Text style={{ marginTop: 10, color: "#666" }}>
          Cargando preferencias...
        </Text>
      </View>
    );
  }

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
        }}
      >
        Notificaciones
      </Text>

      <Text
        style={{
          color: "#666",
          marginBottom: 16,
          lineHeight: 22,
        }}
      >
        Aquí puedes decidir qué tipo de avisos quieres recibir dentro de la app
        y revisar tus notificaciones recientes.
      </Text>

      {guardando ? (
        <Text
          style={{
            color: "#4DB6AC",
            fontWeight: "700",
            marginBottom: 12,
          }}
        >
          Guardando cambios...
        </Text>
      ) : null}

      <OptionSwitch
        title="Alertas de mascotas perdidas"
        subtitle="Recibe avisos sobre reportes cercanos"
        value={settings.alertasPerdidas}
        onValueChange={(value) =>
          actualizarPreferencia("alertasPerdidas", value)
        }
      />

      <OptionSwitch
        title="Solicitudes de adopción"
        subtitle="Notificaciones sobre nuevas solicitudes y actualizaciones"
        value={settings.solicitudesAdopcion}
        onValueChange={(value) =>
          actualizarPreferencia("solicitudesAdopcion", value)
        }
      />

      <OptionSwitch
        title="Recordatorios de citas"
        subtitle="Avisos para citas veterinarias o encuentros programados"
        value={settings.recordatoriosCitas}
        onValueChange={(value) =>
          actualizarPreferencia("recordatoriosCitas", value)
        }
      />

      <OptionSwitch
        title="Novedades de la app"
        subtitle="Información sobre mejoras y nuevas funciones"
        value={settings.novedadesApp}
        onValueChange={(value) =>
          actualizarPreferencia("novedadesApp", value)
        }
      />

      <View
        style={{
          marginTop: 18,
          marginBottom: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "900",
              color: "#1F2937",
            }}
          >
            Recientes
          </Text>

          <Text
            style={{
              color: "#6B7280",
              marginTop: 2,
            }}
          >
            {noLeidas > 0
              ? `${noLeidas} sin leer`
              : "No tienes notificaciones pendientes"}
          </Text>
        </View>

        {noLeidas > 0 ? (
          <TouchableOpacity onPress={marcarTodasComoLeidas}>
            <Text
              style={{
                color: "#4DB6AC",
                fontWeight: "800",
              }}
            >
              Marcar todas
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

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

type OptionSwitchProps = {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function OptionSwitch({
  title,
  subtitle,
  value,
  onValueChange,
}: OptionSwitchProps) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 18,
        marginBottom: 14,
        elevation: 2,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              marginBottom: 4,
            }}
          >
            {title}
          </Text>

          <Text style={{ color: "#777", lineHeight: 20 }}>{subtitle}</Text>
        </View>

        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: "#D1D5DB",
            true: "#A7E3DD",
          }}
          thumbColor={value ? "#4DB6AC" : "#F4F4F5"}
        />
      </View>
    </View>
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