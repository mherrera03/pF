import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function configurarNotificacionesLocales() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("citas", {
      name: "Recordatorios de citas",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4DB6AC",
    });
  }

  const permisos = await Notifications.getPermissionsAsync();

  if (permisos.status === "granted") {
    return true;
  }

  const nuevosPermisos = await Notifications.requestPermissionsAsync();

  return nuevosPermisos.status === "granted";
}

export async function mostrarNotificacionLocal({
  titulo,
  mensaje,
}: {
  titulo: string;
  mensaje: string;
}) {
  const permitido = await configurarNotificacionesLocales();

  if (!permitido) {
    console.log("Permiso de notificaciones no concedido.");
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: mensaje,
      sound: "default",
    },
    trigger: null,
  });
}

export async function registrarPushTokenUsuario() {
  const user = auth.currentUser;

  if (!user) {
    console.log("No hay usuario para registrar push token.");
    return null;
  }

  if (!Device.isDevice) {
    console.log("Las push notifications necesitan un dispositivo físico.");
    return null;
  }

  const permitido = await configurarNotificacionesLocales();

  if (!permitido) {
    console.log("Permiso de notificaciones no concedido.");
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();

    const expoPushToken = tokenData.data;

    await setDoc(
      doc(db, "users", user.uid),
      {
        expoPushToken,
        pushTokenUpdatedAt: new Date(),
      },
      { merge: true }
    );

    console.log("Expo Push Token guardado:", expoPushToken);

    return expoPushToken;
  } catch (error) {
    console.log("Error registrando Expo Push Token:", error);
    return null;
  }
}

export async function enviarPushNotificationExpo({
  expoPushToken,
  titulo,
  mensaje,
  data = {},
}: {
  expoPushToken: string;
  titulo: string;
  mensaje: string;
  data?: Record<string, any>;
}) {
  if (!expoPushToken) {
    console.log("No hay expoPushToken para enviar push.");
    return;
  }

  const message = {
    to: expoPushToken,
    sound: "default",
    title: titulo,
    body: mensaje,
    data,
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    console.log("Resultado push Expo:", result);

    return result;
  } catch (error) {
    console.log("Error enviando push Expo:", error);
  }
}