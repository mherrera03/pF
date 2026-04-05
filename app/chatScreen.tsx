import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    addDoc,
    collection,
    doc,
    increment,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { auth, db } from "../config/firebase";

type Mensaje = {
  id: string;
  texto: string;
  senderId: string;
  createdAt?: any;
  tipo?: string;
};

function formatearHora(fecha: any) {
  if (!fecha) return "";

  const date =
    typeof fecha?.toDate === "function" ? fecha.toDate() : new Date(fecha);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [chatInfo, setChatInfo] = useState<any>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [loadingChat, setLoadingChat] = useState(true);
  const [sending, setSending] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (!chatId || !user) return;

    const chatRef = doc(db, "chats", String(chatId));

    const unsubscribe = onSnapshot(
      chatRef,
      (snap) => {
        if (!snap.exists()) {
          setChatInfo(null);
          setLoadingChat(false);
          return;
        }

        const data = snap.data() as any;
        const otroUid =
          Array.isArray(data.participantes)
            ? data.participantes.find((uid: string) => uid !== user.uid)
            : null;

        const otroUsuario =
          (otroUid && data.participantesInfo?.[otroUid]) || {};

        setChatInfo({
          id: snap.id,
          nombre: otroUsuario.nombre || "Usuario",
          foto: otroUsuario.foto || "https://i.pravatar.cc/150?img=32",
          otroUid,
          lastReadAtOtro: otroUid ? data.lastReadAt?.[otroUid] : null,
        });

        setLoadingChat(false);
      },
      (error) => {
        console.log("Error cargando chat:", error);
        setLoadingChat(false);
      }
    );

    return () => unsubscribe();
  }, [chatId, user]);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", String(chatId), "mensajes"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista: Mensaje[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          return {
            id: docSnap.id,
            texto: data.texto || "",
            senderId: data.senderId || "",
            createdAt: data.createdAt,
            tipo: data.tipo || "texto",
          };
        });

        setMensajes(lista);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      (error) => {
        console.log("Error cargando mensajes:", error);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !user) return;

    const marcarComoLeido = async () => {
      try {
        await updateDoc(doc(db, "chats", String(chatId)), {
          [`unreadCount.${user.uid}`]: 0,
          [`lastReadAt.${user.uid}`]: serverTimestamp(),
        });
      } catch (error) {
        console.log("Error marcando como leído:", error);
      }
    };

    marcarComoLeido();
  }, [chatId, user]);

  const enviarMensaje = async () => {
    const contenido = texto.trim();

    if (!contenido || !chatId || !user || sending || !chatInfo?.otroUid) return;

    try {
      setSending(true);

      await addDoc(collection(db, "chats", String(chatId), "mensajes"), {
        texto: contenido,
        senderId: user.uid,
        createdAt: serverTimestamp(),
        tipo: "texto",
      });

      await updateDoc(doc(db, "chats", String(chatId)), {
        ultimoMensaje: contenido,
        ultimoMensajeEnviadoPor: user.uid,
        actualizadoEn: serverTimestamp(),
        [`unreadCount.${user.uid}`]: 0,
        [`unreadCount.${chatInfo.otroUid}`]: increment(1),
      });

      setTexto("");
    } catch (error) {
      console.log("Error enviando mensaje:", error);
    } finally {
      setSending(false);
    }
  };

  const mensajesInvertidos = useMemo(() => mensajes, [mensajes]);

  if (loadingChat) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F2FF" }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#6B5AA6", fontSize: 18, fontWeight: "600" }}>
            Cargando chat...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!chatInfo) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F2FF" }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 30 }}>
          <Text style={{ color: "#6B5AA6", fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
            Chat no disponible
          </Text>
          <Text style={{ color: "#7B728D", textAlign: "center" }}>
            No se pudo cargar la conversación.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F2FF" }} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
            backgroundColor: "#FFFFFF",
            borderBottomWidth: 1,
            borderBottomColor: "#E9DFFF",
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#5E35B1" />
          </TouchableOpacity>

          <Image
            source={{ uri: chatInfo.foto }}
            style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }}
          />

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#2D1B69" }}>
              {chatInfo.nombre}
            </Text>
            <Text style={{ fontSize: 12.5, color: "#8E8AAE" }}>
              Conversación privada
            </Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={mensajesInvertidos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingTop: 16,
            paddingBottom: 16,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const mio = item.senderId === user?.uid;

            const visto =
              mio &&
              item.createdAt &&
              chatInfo?.lastReadAtOtro &&
              typeof item.createdAt?.toDate === "function" &&
              typeof chatInfo.lastReadAtOtro?.toDate === "function" &&
              chatInfo.lastReadAtOtro.toDate() >= item.createdAt.toDate();

            return (
              <View
                style={{
                  alignSelf: mio ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    backgroundColor: mio ? "#7B61FF" : "#FFFFFF",
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 18,
                    borderBottomRightRadius: mio ? 6 : 18,
                    borderBottomLeftRadius: mio ? 18 : 6,
                    borderWidth: mio ? 0 : 1,
                    borderColor: "#E9DFFF",
                  }}
                >
                  <Text
                    style={{
                      color: mio ? "#FFFFFF" : "#2D1B69",
                      fontSize: 14,
                      lineHeight: 20,
                    }}
                  >
                    {item.texto}
                  </Text>
                </View>

                <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 4,
                    alignSelf: mio ? "flex-end" : "flex-start",
                }}
                >
                <Text
                    style={{
                    fontSize: 11,
                    color: "#8E8AAE",
                    }}
                >
                    {formatearHora(item.createdAt)}
                </Text>

                {mio && (
                    <Text
                    style={{
                        fontSize: 11,
                        marginLeft: 6,
                        color: visto ? "#34B7F1" : "#8E8AAE",
                        fontWeight: "700",
                    }}
                    >
                    {visto ? "✓✓" : "✓"}
                    </Text>
                )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 80 }}>
              <MaterialCommunityIcons
                name="message-text-outline"
                size={42}
                color="#7E57C2"
              />
              <Text
                style={{
                  marginTop: 12,
                  fontSize: 17,
                  fontWeight: "800",
                  color: "#2D1B69",
                }}
              >
                No hay mensajes todavía
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontSize: 14,
                  color: "#7B728D",
                  textAlign: "center",
                  paddingHorizontal: 30,
                }}
              >
                Escribe el primer mensaje para comenzar la conversación.
              </Text>
            </View>
          }
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            paddingHorizontal: 12,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom, 10),
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E9DFFF",
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#F6F2FF",
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: "#E4D8FF",
              marginRight: 10,
            }}
          >
            <TextInput
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#9A8FB5"
              value={texto}
              onChangeText={setTexto}
              multiline
              style={{
                minHeight: 42,
                maxHeight: 110,
                fontSize: 14.5,
                color: "#1F2937",
                paddingTop: 10,
                paddingBottom: 10,
              }}
            />
          </View>

          <TouchableOpacity
            onPress={enviarMensaje}
            disabled={!texto.trim() || sending}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: !texto.trim() || sending ? "#CFC4F5" : "#7B61FF",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons name="send" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}