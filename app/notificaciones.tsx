import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

export default function Notificaciones() {
  const [alertasPerdidas, setAlertasPerdidas] = useState(true);
  const [solicitudesAdopcion, setSolicitudesAdopcion] = useState(true);
  const [recordatoriosCitas, setRecordatoriosCitas] = useState(false);
  const [novedadesApp, setNovedadesApp] = useState(false);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F5F6FA" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
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
        Notificaciones
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

      <OptionSwitch
        title="Alertas de mascotas perdidas"
        subtitle="Recibe avisos sobre reportes cercanos"
        value={alertasPerdidas}
        onValueChange={setAlertasPerdidas}
      />

      <OptionSwitch
        title="Solicitudes de adopción"
        subtitle="Notificaciones sobre nuevas solicitudes y actualizaciones"
        value={solicitudesAdopcion}
        onValueChange={setSolicitudesAdopcion}
      />

      <OptionSwitch
        title="Recordatorios de citas"
        subtitle="Avisos para citas veterinarias o encuentros programados"
        value={recordatoriosCitas}
        onValueChange={setRecordatoriosCitas}
      />

      <OptionSwitch
        title="Novedades de la app"
        subtitle="Información sobre mejoras y nuevas funciones"
        value={novedadesApp}
        onValueChange={setNovedadesApp}
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
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4 }}>
            {title}
          </Text>
          <Text style={{ color: "#777", lineHeight: 20 }}>{subtitle}</Text>
        </View>

        <Switch value={value} onValueChange={onValueChange} />
      </View>
    </View>
  );
}