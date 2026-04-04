import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity } from "react-native";

export default function ConfiguracionSoporte() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F5F6FA" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
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
          marginBottom: 18,
        }}
      >
        Configuración y soporte
      </Text>

      <OptionItem
        title="Cambiar contraseña"
        subtitle="Actualiza la seguridad de tu cuenta"
        onPress={() => router.push("/cambiarPassword")}
      />

      <OptionItem
        title="Notificaciones"
        subtitle="Configura las alertas de la app"
        onPress={() => router.push("/notificaciones")}
      />

      <OptionItem
        title="Centro de ayuda"
        subtitle="Resuelve dudas frecuentes"
        onPress={() => router.push("/centroAyuda")}
      />

      <OptionItem
        title="Contacto y soporte"
        subtitle="Comunícate con nosotros"
        onPress={() => router.push("/contactoSoporte")}
      />
    </ScrollView>
  );
}

type OptionItemProps = {
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
};

function OptionItem({
  title,
  subtitle,
  onPress,
  disabled = false,
}: OptionItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: "#fff",
        padding: 18,
        borderRadius: 18,
        marginBottom: 14,
        elevation: 2,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 4 }}>
        {title}
      </Text>
      <Text style={{ color: "#777" }}>{subtitle}</Text>
    </TouchableOpacity>
  );
}