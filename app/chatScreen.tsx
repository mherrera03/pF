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
  Alert,
  FlatList,
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type KeyboardEvent
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { auth, db } from "../config/firebase";

type Mensaje = {
  id: string;
  texto: string;
  senderId: string;
  senderName?: string;
  createdAt?: any;
  tipo?: string;
  petId?: string;
  petName?: string;
  perfilInteres?: {
    nombreCompleto?: string;
    telefono?: string;
    edad?: string;
    ubicacion?: string;
    motivoInteres?: string;
    experienciaMascotas?: string;
    cuidadorPrincipal?: string;
    expectativas?: string;
  };
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

const [kbHeight, setKbHeight] = useState(0);

useEffect(() => {
  const showSub = Keyboard.addListener("keyboardDidShow", (e: KeyboardEvent) => {
    setKbHeight(e.endCoordinates.height);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  });
  const hideSub = Keyboard.addListener("keyboardDidHide", () => {
    setKbHeight(0);
  });
  return () => {
    showSub.remove();
    hideSub.remove();
  };
}, []);

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
          bloqueadoPorMi: data.blockedBy?.[user.uid] === true,
          bloqueadoPorOtro: otroUid ? data.blockedBy?.[otroUid] === true : false,
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
            texto: data.text || data.texto || "",
            senderId: data.senderId || "",
            senderName: data.senderName || "",
            createdAt: data.createdAt,
            tipo: data.tipo || "texto",
            petId: data.petId || "",
            petName: data.petName || "",
            perfilInteres: data.perfilInteres || null,
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

    if (chatInfo?.bloqueadoPorMi) {
      Alert.alert(
        "Usuario bloqueado",
        "No puedes enviar mensajes porque bloqueaste esta conversación."
      );
      return;
    }

    if (chatInfo?.bloqueadoPorOtro) {
      Alert.alert(
        "Chat no disponible",
        "No puedes enviar mensajes en esta conversación por el momento."
      );
      return;
    }

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

const eliminarConversacionParaMi = async () => {
  if (!chatId || !user) return;

  Alert.alert(
    "Eliminar conversación",
    "La conversación se ocultará solo para ti. La otra persona aún podrá verla.",
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
            await updateDoc(doc(db, "chats", String(chatId)), {
              [`hiddenFor.${user.uid}`]: true,
              [`unreadCount.${user.uid}`]: 0,
              [`deletedAt.${user.uid}`]: serverTimestamp(),
            });

            Alert.alert("Listo", "La conversación fue eliminada de tu lista.");
            router.back();
          } catch (error) {
            console.log("Error eliminando conversación:", error);
            Alert.alert(
              "Error",
              "No se pudo eliminar la conversación. Intenta de nuevo."
            );
          }
        },
      },
    ],
    {
      cancelable: true
    }
  );
};

const crearReporteChat = async (motivo: string) => {
  if (!chatId || !user || !chatInfo?.otroUid) return;

  try {
    const ultimoMensaje = mensajes[mensajes.length - 1];

    await addDoc(collection(db, "reportesChat"), {
      chatId: String(chatId),
      reporterUid: user.uid,
      reportedUid: chatInfo.otroUid,
      motivo,
      estado: "pendiente",
      ultimoMensaje: ultimoMensaje?.texto || "",
      ultimoMensajeSenderId: ultimoMensaje?.senderId || "",
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "chats", String(chatId)), {
      [`reportedBy.${user.uid}`]: true,
      actualizadoEn: serverTimestamp(),
    });

    Alert.alert(
      "Reporte enviado",
      "Gracias por avisarnos. Revisaremos esta conversación."
    );
  } catch (error) {
    console.log("Error reportando chat:", error);
    Alert.alert("Error", "No se pudo enviar el reporte. Intenta de nuevo.");
  }
};

const reportarChat = () => {
  Alert.alert(
    "Reportar chat",
    "Selecciona el motivo del reporte.",
    [
      {
        text: "Spam",
        onPress: () => crearReporteChat("Spam"),
      },
      {
        text: "Comportamiento inapropiado",
        onPress: () => crearReporteChat("Comportamiento inapropiado"),
      },
      {
        text: "Información falsa o sospechosa",
        onPress: () => crearReporteChat("Información falsa o sospechosa"),
      },
      {
        text: "Otro motivo",
        onPress: () => crearReporteChat("Otro motivo"),
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ],
    {
      cancelable: true
    }
  );
};

const bloquearUsuario = async () => {
  if (!chatId || !user || !chatInfo?.otroUid) return;

  Alert.alert(
    "Bloquear usuario",
    "Si bloqueas este usuario, ya no podrás enviar mensajes en esta conversación.",
    [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Bloquear",
        style: "destructive",
        onPress: async () => {
          try {
            await updateDoc(doc(db, "chats", String(chatId)), {
              [`blockedBy.${user.uid}`]: true,
              actualizadoEn: serverTimestamp(),
            });

            Alert.alert("Usuario bloqueado", "Ya no podrás enviar mensajes aquí.");
          } catch (error) {
            console.log("Error bloqueando usuario:", error);
            Alert.alert("Error", "No se pudo bloquear el usuario.");
          }
        },
      },
    ],
    {
      cancelable: true
    }
  );
};

const abrirOpcionesChat = () => {
  Alert.alert(
    "Opciones del chat",
    "Elige una acción para esta conversación.",
    [
      {
        text: "Eliminar conversación",
        style: "destructive",
        onPress: eliminarConversacionParaMi,
      },
      {
        text: "Reportar chat o usuario",
        onPress: reportarChat,
      },
      {
        text: "Bloquear usuario",
        style: "destructive",
        onPress: bloquearUsuario,
      },
      {
        text: "Cancelar",
        style: "cancel",
      },
    ],
    {
      cancelable: true
    }
  );
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
      <View style={{ flex: 1 }}>
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

          <TouchableOpacity
            onPress={abrirOpcionesChat}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons name="dots-vertical" size={26} color="#5E35B1" />
          </TouchableOpacity>
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

            const esSolicitud =
              item.tipo === "solicitud_adopcion" && item.perfilInteres;

            return (
              <View
                style={{
                  alignSelf: mio ? "flex-end" : "flex-start",
                  maxWidth: "86%",
                  marginBottom: 10,
                }}
              >
                {esSolicitud ? (
                  <View
                    style={{
                      backgroundColor: mio ? "#EDE7FF" : "#FFFFFF",
                      padding: 12,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: "#D9CCFF",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "800",
                        color: "#5E35B1",
                        marginBottom: 8,
                      }}
                    >
                      Perfil de interés
                    </Text>

                    {!!item.petName && (
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: "#4B5563",
                          marginBottom: 8,
                        }}
                      >
                        Mascota: {item.petName}
                      </Text>
                    )}

                    <Text style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>
                      <Text style={{ fontWeight: "700" }}>Nombre: </Text>
                      {item.perfilInteres?.nombreCompleto || "No especificado"}
                    </Text>

                    <Text style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>
                      <Text style={{ fontWeight: "700" }}>Teléfono: </Text>
                      {item.perfilInteres?.telefono || "No especificado"}
                    </Text>

                    <Text style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>
                      <Text style={{ fontWeight: "700" }}>Edad: </Text>
                      {item.perfilInteres?.edad || "No especificada"}
                    </Text>

                    <Text style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>
                      <Text style={{ fontWeight: "700" }}>Ubicación: </Text>
                      {item.perfilInteres?.ubicacion || "No especificada"}
                    </Text>

                    <Text style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>
                      <Text style={{ fontWeight: "700" }}>Motivo: </Text>
                      {item.perfilInteres?.motivoInteres || "No especificado"}
                    </Text>

                    <Text style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>
                      <Text style={{ fontWeight: "700" }}>Experiencia: </Text>
                      {item.perfilInteres?.experienciaMascotas || "No especificada"}
                    </Text>

                    <Text style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>
                      <Text style={{ fontWeight: "700" }}>Cuidador principal: </Text>
                      {item.perfilInteres?.cuidadorPrincipal || "No especificado"}
                    </Text>

                    <Text style={{ fontSize: 13, color: "#374151" }}>
                      <Text style={{ fontWeight: "700" }}>Expectativas: </Text>
                      {item.perfilInteres?.expectativas || "No especificadas"}
                    </Text>
                  </View>
                ) : (
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
                )}

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
            disabled={!texto.trim() || sending || chatInfo?.bloqueadoPorMi || chatInfo?.bloqueadoPorOtro}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor:
                !texto.trim() || sending || chatInfo?.bloqueadoPorMi || chatInfo?.bloqueadoPorOtro
                  ? "#CFC4F5"
                  : "#7B61FF",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons name="send" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={{ height: kbHeight }} />
      </View>
    </SafeAreaView>
  );
}