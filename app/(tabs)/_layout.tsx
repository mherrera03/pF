import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { registrarPushTokenUsuario } from "../../services/notifications";

const TAB_ROUTES = ["/", "/adoption", "/chatDetalle", "/citas", "/perfil"];

function getCurrentIndex(pathname: string): number {
  if (pathname === "/" || pathname === "") return 0;
  const idx = TAB_ROUTES.findIndex(
    (r) => r !== "/" && pathname.startsWith(r)
  );
  return idx >= 0 ? idx : 0;
}

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    registrarPushTokenUsuario();
  }, []);

  const currentIndex = getCurrentIndex(pathname);

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])   // activa solo tras 20px horizontal
    .failOffsetY([-15, 15])     // falla si el movimiento vertical supera 15px primero
    .onEnd(({ translationX, velocityX }) => {
      const goNext = translationX < -50 || velocityX < -500;
      const goPrev = translationX > 50  || velocityX > 500;

      if (goNext && currentIndex < TAB_ROUTES.length - 1) {
        router.push(TAB_ROUTES[currentIndex + 1] as any);
      } else if (goPrev && currentIndex > 0) {
        router.push(TAB_ROUTES[currentIndex - 1] as any);
      }
    });

  return (
    <GestureDetector gesture={swipe}>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#7E57C2",
            tabBarInactiveTintColor: "#9E9E9E",
            tabBarStyle: {
              backgroundColor: "#FFFFFF",
              height: Platform.OS === "ios" ? 100 : 110,
              borderTopWidth: 1,
              borderTopColor: "#F0F0F0",
              paddingBottom: Platform.OS === "ios" ? 30 : 12,
              paddingTop: 10,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "600",
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Inicio",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="home" size={28} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="adoption"
            options={{
              title: "Adopción",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="heart" size={28} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="chatDetalle"
            options={{
              title: "Chats",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="chat" size={28} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="citas"
            options={{
              title: "Citas",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="calendar" size={28} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="perfil"
            options={{
              title: "Perfil",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="account" size={28} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </GestureDetector>
  );
}