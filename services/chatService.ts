import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

type CrearChatParams = {
  reportId: string;
  ownerUid: string;
  ownerName: string;
  ownerPhoto?: string;
  currentUserName: string;
  currentUserPhoto?: string;
  petName?: string;
};

export async function crearOObtenerChat({
  reportId,
  ownerUid,
  ownerName,
  ownerPhoto = "",
  currentUserName,
  currentUserPhoto = "",
  petName,
}: CrearChatParams) {
  const user = auth.currentUser;

  if (!user) throw new Error("Usuario no autenticado");

  if (user.uid === ownerUid) {
    throw new Error("No puedes crear un chat contigo misma");
  }

  const mensajeInicial = petName
    ? `Hola, creo que tengo información sobre ${petName}.`
    : "Hola, creo que tengo información sobre tu mascota.";

  const participantesOrdenados = [user.uid, ownerUid].sort();
  const chatKey = `${reportId}_${participantesOrdenados[0]}_${participantesOrdenados[1]}`;

  const q = query(collection(db, "chats"), where("chatKey", "==", chatKey));
  const existing = await getDocs(q);

  if (!existing.empty) {
    return existing.docs[0].id;
  }

  const chatRef = await addDoc(collection(db, "chats"), {
    chatKey,
    reportId,
    participantes: participantesOrdenados,
    participantesInfo: {
      [ownerUid]: {
        nombre: ownerName,
        foto: ownerPhoto,
      },
      [user.uid]: {
        nombre: currentUserName,
        foto: currentUserPhoto,
      },
    },
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
    ultimoMensaje: mensajeInicial,
    ultimoMensajeEnviadoPor: user.uid,
    unreadCount: {
      [ownerUid]: 1,
      [user.uid]: 0,
    },
  });

  await addDoc(collection(db, "chats", chatRef.id, "mensajes"), {
    texto: mensajeInicial,
    senderId: user.uid,
    createdAt: serverTimestamp(),
    tipo: "texto",
  });

  await updateDoc(doc(db, "chats", chatRef.id), {
    actualizadoEn: serverTimestamp(),
  });

  return chatRef.id;
}