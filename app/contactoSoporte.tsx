import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ContactoSoporte() {
  const email = "soporte@patitasfelices.com";
  const phone = "+503 7481 1255";
  const whatsappNumber = "+503 7481 1255";

  const openEmail = async () => {
    const url = `mailto:${email}?subject=Soporte%20Patitas%20Felices`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "No se pudo abrir la aplicación de correo.");
    }
  };

  const openPhone = async () => {
    const url = `tel:${phone}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "No se pudo abrir la aplicación de llamadas.");
    }
  };

  const openWhatsApp = async () => {
    const message = encodeURIComponent(
      "Hola, necesito ayuda con la app Patitas Felices."
    );

    const url = `https://wa.me/${whatsappNumber}?text=${message}`;

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "No se pudo abrir WhatsApp.");
    }
  };

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
          marginBottom: 10,
          color: "#1F2937",
        }}
      >
        Contacto y soporte
      </Text>

      <Text
        style={{
          color: "#6B7280",
          lineHeight: 22,
          marginBottom: 18,
        }}
      >
        Si tienes dudas o problemas con la aplicación, puedes comunicarte con
        nosotros por cualquiera de estos medios.
      </Text>

      <ContactCard
        icon="email-outline"
        title="Correo electrónico"
        value={email}
        actionText="Enviar correo"
        onPress={openEmail}
      />

      <ContactCard
        icon="phone-outline"
        title="Teléfono"
        value="+503 7481 1255"
        actionText="Realizar llamada"
        onPress={openPhone}
      />

      <ContactCard
        icon="whatsapp"
        title="WhatsApp"
        value="+503 7481 1255"
        actionText="Abrir WhatsApp"
        onPress={openWhatsApp}
      />

      <View
        style={{
          backgroundColor: "#fff",
          padding: 18,
          borderRadius: 18,
          marginTop: 6,
          elevation: 3,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            marginBottom: 8,
            color: "#1F2937",
          }}
        >
          Horario de atención
        </Text>
        <Text style={{ color: "#666" }}>
          Lunes a viernes, de 8:00 a.m. a 5:00 p.m.
        </Text>
      </View>
    </ScrollView>
  );
}

function ContactCard({ icon, title, value, actionText, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
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
          <MaterialCommunityIcons name={icon} size={22} color="#4DB6AC" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "800", fontSize: 15 }}>{title}</Text>
          <Text style={{ color: "#666", marginTop: 2 }}>{value}</Text>
          <Text
            style={{
              color: "#4DB6AC",
              marginTop: 6,
              fontWeight: "700",
            }}
          >
            {actionText}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}