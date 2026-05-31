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

import { doc, getDoc, setDoc } from "firebase/firestore";

import { auth, db } from "../config/firebase";

type NotificationSettings = {
  alertasPerdidas: boolean;
  solicitudesAdopcion: boolean;
  recordatoriosCitas: boolean;
  novedadesApp: boolean;
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

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarPreferencias();
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
          color: "#1F2937",
        }}
      >
        Configuración de notificaciones
      </Text>

      <Text
        style={{
          color: "#666",
          marginBottom: 16,
          lineHeight: 22,
        }}
      >
        Aquí puedes decidir qué tipo de avisos quieres recibir dentro de la app.
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
        onValueChange={(value) => actualizarPreferencia("novedadesApp", value)}
      />
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
              color: "#1F2937",
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