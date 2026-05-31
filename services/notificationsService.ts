import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { db } from "../config/firebase";

export type AppNotification = {
  id: string;
  ownerUid: string;
  tipo: "reporte" | "adopcion" | "cita" | "chat" | "sistema" | string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt?: any;
};

export function listenUserNotifications(
  uid: string,
  callback: (notifications: AppNotification[]) => void,
  onError?: (error: any) => void
) {
  const q = query(
    collection(db, "notificaciones"),
    where("ownerUid", "==", uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const data: AppNotification[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();

        return {
          id: docSnap.id,
          ownerUid: d.ownerUid || "",
          tipo: d.tipo || "sistema",
          titulo: d.titulo || "Notificación",
          mensaje: d.mensaje || "",
          leida: d.leida ?? false,
          createdAt: d.createdAt,
        };
      });

      callback(data);
    },
    (error) => {
      console.log("Error escuchando notificaciones:", error);
      onError?.(error);
    }
  );
}