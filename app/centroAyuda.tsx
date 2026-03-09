import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    LayoutAnimation,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type HelpItem = {
  id: number;
  question: string;
  answer: string;
};

const HELP_DATA: HelpItem[] = [
  {
    id: 1,
    question: "¿Cómo puedo reportar una mascota perdida?",
    answer:
      "Debes ingresar al apartado de reportes, seleccionar la opción de mascota perdida y completar los datos solicitados como nombre, especie, ubicación, rasgos y fotografía si la tienes.",
  },
  {
    id: 2,
    question: "¿Cómo funciona la sección de adopción?",
    answer:
      "En la sección de adopción puedes publicar mascotas en busca de hogar o revisar publicaciones disponibles para iniciar un proceso de adopción.",
  },
  {
    id: 3,
    question: "¿Puedo editar mi perfil?",
    answer:
      "Sí. Desde la pantalla de perfil puedes cambiar tu nombre y actualizar tu foto para mantener tu información al día.",
  },
  {
    id: 4,
    question: "¿Qué hago si no recibo notificaciones?",
    answer:
      "Puedes revisar el apartado de notificaciones dentro de configuración y soporte para verificar que las alertas estén activadas.",
  },
  {
    id: 5,
    question: "¿Qué hago si encuentro un error en la app?",
    answer:
      "Puedes reportarlo desde el apartado de contacto y soporte, explicando el problema para que pueda revisarse y corregirse.",
  },
];

export default function CentroAyuda() {
  const [openId, setOpenId] = useState<number | null>(1);

  const toggleItem = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F5F6FA" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ color: "#4DB6AC", fontWeight: "700", marginBottom: 16, marginTop:15  }}>
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
        Centro de ayuda
      </Text>

      <Text
        style={{
          color: "#6B7280",
          lineHeight: 22,
          marginBottom: 18,
        }}
      >
        Encuentra respuestas rápidas sobre el uso de la aplicación.
      </Text>

      {HELP_DATA.map((item) => (
        <AccordionItem
          key={item.id}
          question={item.question}
          answer={item.answer}
          isOpen={openId === item.id}
          onPress={() => toggleItem(item.id)}
        />
      ))}
    </ScrollView>
  );
}

type AccordionItemProps = {
  question: string;
  answer: string;
  isOpen: boolean;
  onPress: () => void;
};

function AccordionItem({
  question,
  answer,
  isOpen,
  onPress,
}: AccordionItemProps) {
  const rotateAnim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isOpen, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        overflow: "hidden",
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={{
          paddingHorizontal: 18,
          paddingVertical: 18,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: "#1F2937",
              lineHeight: 22,
            }}
          >
            {question}
          </Text>
        </View>

        <Animated.View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "#E8F7F5",
            justifyContent: "center",
            alignItems: "center",
            transform: [{ rotate }],
          }}
        >
          <Text
            style={{
              color: "#4DB6AC",
              fontSize: 16,
              fontWeight: "900",
              marginTop: -1,
            }}
          >
            ˅
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {isOpen && (
        <View
          style={{
            paddingHorizontal: 18,
            paddingBottom: 18,
            paddingTop: 2,
            borderTopWidth: 1,
            borderTopColor: "#F1F5F9",
            backgroundColor: "#FCFCFD",
          }}
        >
          <Text
            style={{
              color: "#6B7280",
              lineHeight: 22,
              fontSize: 14.5,
            }}
          >
            {answer}
          </Text>
        </View>
      )}
    </View>
  );
}