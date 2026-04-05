import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { auth, db } from "../../config/firebase";

type ChatItem = {
  id: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
};

function formatearFechaChat(fecha: any) {
  if (!fecha) return "";

  const date =
    typeof fecha?.toDate === "function" ? fecha.toDate() : new Date(fecha);

  if (Number.isNaN(date.getTime())) return "";

  const ahora = new Date();

  const mismoDia =
    date.getDate() === ahora.getDate() &&
    date.getMonth() === ahora.getMonth() &&
    date.getFullYear() === ahora.getFullYear();

  if (mismoDia) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const ayer = new Date();
  ayer.setDate(ahora.getDate() - 1);

  const esAyer =
    date.getDate() === ayer.getDate() &&
    date.getMonth() === ayer.getMonth() &&
    date.getFullYear() === ayer.getFullYear();

  if (esAyer) return "Ayer";

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function ChatDetalle() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "chats"),
      where("participantes", "array-contains", user.uid),
      orderBy("actualizadoEn", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista: ChatItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;

          const otroUid =
            Array.isArray(data.participantes)
              ? data.participantes.find((uid: string) => uid !== user.uid)
              : null;

          const otroUsuario =
            (otroUid && data.participantesInfo?.[otroUid]) || {};

          return {
            id: docSnap.id,
            userName: otroUsuario.nombre || "Usuario",
            userAvatar:
              otroUsuario.foto || "https://i.pravatar.cc/150?img=32",
            lastMessage: data.ultimoMensaje || "Sin mensajes",
            time: formatearFechaChat(data.actualizadoEn),
            unreadCount: data.unreadCount?.[user.uid] ?? 0,
            isOnline: false,
          };
        });

        setChats(lista);
        setLoading(false);
      },
      (error) => {
        console.log("Error cargando chats:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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
      pathname: "/chatScreen" as any,
      params: {
        chatId: chat.id,
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
                {loading ? "Cargando chats..." : "No hay chats todavía"}
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: "#7B728D",
                  textAlign: "center",
                  lineHeight: 21,
                }}
              >
                {loading
                  ? "Espera un momento."
                  : "Cuando alguien responda un reporte o inicies una conversación, aparecerá aquí."}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}