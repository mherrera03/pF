import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type ChatItem = {
  id: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
};

const CHATS_INICIALES: ChatItem[] = [
  {
    id: "1",
    userName: "María López",
    userAvatar: "https://i.pravatar.cc/150?img=32",
    lastMessage: "Hola, gracias por avisarme. ¿Dónde la viste exactamente?",
    time: "10:24 a.m.",
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "2",
    userName: "Carlos Ramírez",
    userAvatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: "Sí, creo que era cerca del parque central.",
    time: "9:10 a.m.",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "3",
    userName: "Andrea Flores",
    userAvatar: "https://i.pravatar.cc/150?img=47",
    lastMessage: "Muchas gracias por compartir la publicación 💜",
    time: "Ayer",
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: "4",
    userName: "Refugio San Miguel",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    lastMessage: "Podemos ayudar a difundir el caso en nuestras redes.",
    time: "Ayer",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "5",
    userName: "Alcaldía Municipal",
    userAvatar: "https://i.pravatar.cc/150?img=15",
    lastMessage: "Recibimos el reporte, estaremos atentos.",
    time: "Lun",
    unreadCount: 3,
    isOnline: false,
  },
];

export default function ChatDetalle() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [chats] = useState<ChatItem[]>(CHATS_INICIALES);

  const chatsFiltrados = useMemo(() => {
    const texto = search.trim().toLowerCase();

    if (!texto) return chats;

    return chats.filter(
      (chat) =>
        chat.userName.toLowerCase().includes(texto) ||
        chat.lastMessage.toLowerCase().includes(texto)
    );
  }, [search, chats]);

  const abrirChat = (chat: ChatItem) => {
    router.push({
      pathname: "/chatScreen",
      params: {
        userName: chat.userName,
        userAvatar: chat.userAvatar,
      },
    });
  };

  const renderItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => abrirChat(item)}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 14,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      }}
    >
      <View style={{ marginRight: 12 }}>
        <Image
          source={{ uri: item.userAvatar }}
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
          }}
        />

        {item.isOnline && (
          <View
            style={{
              position: "absolute",
              right: 2,
              bottom: 2,
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: "#4CAF50",
              borderWidth: 2,
              borderColor: "#FFFFFF",
            }}
          />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 15.5,
              fontWeight: "800",
              color: "#2D1B69",
              marginRight: 8,
            }}
          >
            {item.userName}
          </Text>

          <Text
            style={{
              fontSize: 12,
              color: "#8E8AAE",
              fontWeight: "600",
            }}
          >
            {item.time}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 13.5,
              color: "#6B7280",
              lineHeight: 19,
              marginRight: 10,
            }}
          >
            {item.lastMessage}
          </Text>

          {item.unreadCount > 0 && (
            <View
              style={{
                minWidth: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: "#7E57C2",
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 6,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontWeight: "800",
                }}
              >
                {item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F6F2FF" }}
      edges={["top", "left", "right"]}
    >
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 18,
            paddingTop: Platform.OS === "android" ? 10 : 6,
            paddingBottom: 14,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "900",
              color: "#2D1B69",
              marginBottom: 6,
            }}
          >
            Chats
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: "#7B728D",
              marginBottom: 16,
            }}
          >
            Aquí aparecerán las conversaciones de tus reportes y avisos.
          </Text>

          {/* Buscador */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderRadius: 18,
              paddingHorizontal: 14,
              height: 52,
              borderWidth: 1,
              borderColor: "#E9DFFF",
            }}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={22}
              color="#9A8FB5"
            />

            <TextInput
              placeholder="Buscar chats..."
              placeholderTextColor="#9A8FB5"
              value={search}
              onChangeText={setSearch}
              style={{
                flex: 1,
                marginLeft: 10,
                fontSize: 14.5,
                color: "#1F2937",
              }}
            />
          </View>
        </View>

        {/* Lista */}
        <FlatList
          data={chatsFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 120 + Math.max(insets.bottom, 10),
            flexGrow: chatsFiltrados.length === 0 ? 1 : 0,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 30,
                paddingTop: 80,
              }}
            >
              <View
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  backgroundColor: "#EDE4FF",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <MaterialCommunityIcons
                  name="chat-processing-outline"
                  size={40}
                  color="#7E57C2"
                />
              </View>

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#2D1B69",
                  marginBottom: 8,
                }}
              >
                No hay chats todavía
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: "#7B728D",
                  textAlign: "center",
                  lineHeight: 21,
                }}
              >
                Cuando alguien responda un reporte o inicies una conversación,
                aparecerá aquí.
              </Text>
            </View>
          }
        />

        {/* Botón flotante opcional */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={{
            position: "absolute",
            right: 18,
            bottom: 95 + Math.max(insets.bottom, 10),
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: "#7E57C2",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.16,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 5,
          }}
        >
          <MaterialCommunityIcons
            name="message-plus-outline"
            size={26}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}