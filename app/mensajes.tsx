import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

type ChatItem = {
  id: number;
  name: string;
  message: string;
  time: string;
  unread: number;
  avatar: string;
  online?: boolean;
};

const CHATS: ChatItem[] = [
  {
    id: 1,
    name: "María López",
    message: "Hola, creo que vi a tu perrito cerca del parque.",
    time: "10:45 a.m.",
    unread: 2,
    avatar: "https://i.pravatar.cc/150?img=32",
    online: true,
  },
  {
    id: 2,
    name: "Carlos Ramírez",
    message: "La gatita sigue disponible para adopción?",
    time: "Ayer",
    unread: 0,
    avatar: "https://i.pravatar.cc/150?img=12",
    online: false,
  },
  {
    id: 3,
    name: "Ana Martínez",
    message: "Gracias por responder, estaré pendiente.",
    time: "Ayer",
    unread: 1,
    avatar: "https://i.pravatar.cc/150?img=5",
    online: true,
  },
  {
    id: 4,
    name: "José Herrera",
    message: "¿Me compartes más información de la mascota?",
    time: "Lun",
    unread: 0,
    avatar: "https://i.pravatar.cc/150?img=15",
    online: false,
  },
];

export default function Mensajes() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F5F6FA" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 8,
          marginBottom: 18,
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "900",
            color: "#1F2937",
          }}
        >
          Mensajes
        </Text>

        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: "#E8F7F5",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name="message-text-outline"
            size={22}
            color="#4DB6AC"
          />
        </View>
      </View>

      <Text
        style={{
          color: "#6B7280",
          marginBottom: 18,
          lineHeight: 22,
        }}
      >
        Comunícate con personas interesadas en adopción o reportes de mascotas.
      </Text>

      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 18,
          padding: 14,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          elevation: 2,
        }}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={22}
          color="#9CA3AF"
        />
        <Text style={{ color: "#9CA3AF", fontSize: 15 }}>
          Buscar conversación
        </Text>
      </View>

      {CHATS.map((chat) => (
        <TouchableOpacity
          key={chat.id}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: "/chatDetalle" as any,
              params: {
                name: chat.name,
                avatar: chat.avatar,
              },
            })
          }
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 14,
            marginBottom: 14,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View style={{ position: "relative" }}>
            <Image
              source={{ uri: chat.avatar }}
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
              }}
            />
            {chat.online && (
              <View
                style={{
                  position: "absolute",
                  right: 2,
                  bottom: 2,
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: "#22C55E",
                  borderWidth: 2,
                  borderColor: "#fff",
                }}
              />
            )}
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: "#1F2937",
                  flex: 1,
                  marginRight: 8,
                }}
                numberOfLines={1}
              >
                {chat.name}
              </Text>

              <Text
                style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                  fontWeight: "600",
                }}
              >
                {chat.time}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  color: "#6B7280",
                  lineHeight: 20,
                }}
                numberOfLines={1}
              >
                {chat.message}
              </Text>

              {chat.unread > 0 && (
                <View
                  style={{
                    minWidth: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: "#4DB6AC",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingHorizontal: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: "800",
                    }}
                  >
                    {chat.unread}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}