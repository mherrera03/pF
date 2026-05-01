import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { mostrarNotificacionLocal } from "../../services/notifications";

type AppointmentType = "Vacuna" | "Control" | "Urgencia" | "Desparasitación";

type MedicalAppointment = {
  id: string;
  petName: string;
  reason: string;
  date: string;
  time: string;
  clinic: string;
  type: AppointmentType;
  ownerUid: string;
};

const TIPOS_CITA: AppointmentType[] = [
  "Vacuna",
  "Control",
  "Urgencia",
  "Desparasitación",
];

export default function CitasScreen() {
  const [todasLasCitas, setTodasLasCitas] = useState<MedicalAppointment[]>([]);
  const [citas, setCitas] = useState<MedicalAppointment[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [filtrosActivos, setFiltrosActivos] = useState<string[]>([]);
  const [menuFiltroVisible, setMenuFiltroVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [petName, setPetName] = useState("");
  const [reason, setReason] = useState("");
  const [clinic, setClinic] = useState("");
  const [time, setTime] = useState("");
  const [selectedType, setSelectedType] = useState<AppointmentType>("Control");

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateLabel, setDateLabel] = useState("Seleccionar fecha");

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setCargando(false);
      return;
    }

    const q = query(collection(db, "citas"), where("ownerUid", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: MedicalAppointment[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();

          return {
            id: docSnap.id,
            petName: d.petName || "",
            reason: d.reason || "",
            date: d.date || "",
            time: d.time || "",
            clinic: d.clinic || "",
            type: d.type || "Control",
            ownerUid: d.ownerUid || "",
          };
        });

        setTodasLasCitas(data);
        aplicarFiltros(data, filtrosActivos);
        setCargando(false);
      },
      (error) => {
        console.log("Error cargando citas:", error);
        setCargando(false);
        Alert.alert("Error", "No se pudieron cargar las citas.");
      }
    );

    return () => unsubscribe();
  }, []);

  const aplicarFiltros = (
    listaBase: MedicalAppointment[],
    filtros: string[]
  ) => {
    const tiposSeleccionados = filtros.map((f) => f.split(":")[1]);

    if (tiposSeleccionados.length === 0) {
      setCitas(listaBase);
      return;
    }

    const filtradas = listaBase.filter((cita) =>
      tiposSeleccionados.includes(cita.type)
    );

    setCitas(filtradas);
  };

  const aplicarFiltro = (valor: string) => {
    const filtro = `tipo:${valor}`;

    const nuevosFiltros = filtrosActivos.includes(filtro)
      ? filtrosActivos.filter((f) => f !== filtro)
      : [...filtrosActivos, filtro];

    setFiltrosActivos(nuevosFiltros);
    aplicarFiltros(todasLasCitas, nuevosFiltros);
  };

  const limpiarFiltros = () => {
    setFiltrosActivos([]);
    setCitas(todasLasCitas);
    setMenuFiltroVisible(false);
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");

    if (selectedDate) {
      setDate(selectedDate);
      setDateLabel(formatearFecha(selectedDate));
    }
  };

  const limpiarFormulario = () => {
    setPetName("");
    setReason("");
    setClinic("");
    setTime("");
    setSelectedType("Control");
    setDate(new Date());
    setDateLabel("Seleccionar fecha");
    setEditandoId(null);
  };

  const abrirNuevaCita = () => {
    limpiarFormulario();
    setFormVisible(true);
  };

  const abrirEditarCita = (cita: MedicalAppointment) => {
    setEditandoId(cita.id);
    setPetName(cita.petName);
    setReason(cita.reason);
    setClinic(cita.clinic);
    setTime(cita.time);
    setSelectedType(cita.type);
    setDateLabel(cita.date);
    setFormVisible(true);
  };

  const crearNotificacionCita = async (
    userId: string,
    accion: "creada" | "editada"
  ) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      const notificationSettings = userSnap.exists()
        ? userSnap.data().notificationSettings
        : null;

      const recordatoriosActivos =
        notificationSettings?.recordatoriosCitas !== false;

      if (!recordatoriosActivos) {
        console.log("Notificación de cita no creada porque el usuario la desactivó.");
        return;
      }

      await addDoc(collection(db, "notificaciones"), {
        ownerUid: userId,
        tipo: "cita",
        titulo:
          accion === "creada"
            ? "Cita veterinaria programada"
            : "Cita veterinaria actualizada",
        mensaje:
          accion === "creada"
            ? `Agendaste una cita para ${petName.trim()} el ${dateLabel} a las ${time.trim()}`
            : `Actualizaste la cita de ${petName.trim()} para el ${dateLabel} a las ${time.trim()}`,
        leida: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.log("Error creando notificación de cita:", error);
    }
  };

  const guardarCita = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Sesión no encontrada", "Debes iniciar sesión para guardar citas.");
      return;
    }

    if (
      !petName.trim() ||
      !reason.trim() ||
      !clinic.trim() ||
      !time.trim() ||
      dateLabel === "Seleccionar fecha"
    ) {
      Alert.alert("Campos incompletos", "Completa todos los datos de la cita.");
      return;
    }

    try {
      setGuardando(true);

      const citaData = {
        petName: petName.trim(),
        reason: reason.trim(),
        date: dateLabel,
        time: time.trim(),
        clinic: clinic.trim(),
        type: selectedType,
        ownerUid: user.uid,
        updatedAt: serverTimestamp(),
      };

      if (editandoId) {
        await updateDoc(doc(db, "citas", editandoId), citaData);

        await crearNotificacionCita(user.uid, "editada");

        await mostrarNotificacionLocal({
          titulo: "Cita veterinaria actualizada",
          mensaje: `Actualizaste la cita de ${petName.trim()} para el ${dateLabel} a las ${time.trim()}`,
        });

        Alert.alert("Listo", "La cita fue actualizada correctamente.");
      } else {
        await addDoc(collection(db, "citas"), {
          ...citaData,
          createdAt: serverTimestamp(),
        });

        await crearNotificacionCita(user.uid, "creada");

        await mostrarNotificacionLocal({
          titulo: "Cita veterinaria programada",
          mensaje: `Agendaste una cita para ${petName.trim()} el ${dateLabel} a las ${time.trim()}`,
        });

        Alert.alert("Listo", "La cita fue registrada correctamente.");
      }

      limpiarFormulario();
      setFormVisible(false);
    } catch (error) {
      console.log("Error guardando cita:", error);
      Alert.alert("Error", "No se pudo guardar la cita.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCita = (citaId: string) => {
    Alert.alert("Eliminar cita", "¿Seguro que quieres eliminar esta cita?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "citas", citaId));
            Alert.alert("Eliminada", "La cita fue eliminada correctamente.");
          } catch (error) {
            console.log("Error eliminando cita:", error);
            Alert.alert("Error", "No se pudo eliminar la cita.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* MODAL DE FILTROS */}
      <Modal visible={menuFiltroVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuFiltroVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.filterMenu, { top: 180, right: 20 }]}>
              <Text style={styles.menuHeader}>Tipo de cita</Text>

              {TIPOS_CITA.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.menuItem,
                    filtrosActivos.includes(`tipo:${t}`) &&
                      styles.menuItemActive,
                  ]}
                  onPress={() => aplicarFiltro(t)}
                >
                  <Text
                    style={[
                      styles.menuText,
                      filtrosActivos.includes(`tipo:${t}`) &&
                        styles.menuTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={styles.divider} />

              <TouchableOpacity onPress={limpiarFiltros}>
                <Text style={styles.clearText}>Limpiar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL DE NUEVA / EDITAR CITA */}
      <Modal visible={formVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback
          onPress={() => {
            if (!guardando) {
              limpiarFormulario();
              setFormVisible(false);
            }
          }}
        >
          <View style={styles.modalFullOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.formContainer}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>
                    {editandoId ? "Editar Cita Médica" : "Nueva Cita Médica"}
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      limpiarFormulario();
                      setFormVisible(false);
                    }}
                    disabled={guardando}
                  >
                    <MaterialIcons name="close" size={28} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.label}>Nombre de la Mascota</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Max"
                    value={petName}
                    onChangeText={setPetName}
                  />

                  <Text style={styles.label}>Motivo de la cita</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Vacunación anual"
                    value={reason}
                    onChangeText={setReason}
                  />

                  <Text style={styles.label}>Clínica veterinaria</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Vet Central"
                    value={clinic}
                    onChangeText={setClinic}
                  />

                  <Text style={styles.label}>Hora</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. 09:00 AM"
                    value={time}
                    onChangeText={setTime}
                  />

                  <Text style={styles.label}>Tipo de Servicio</Text>
                  <View style={styles.chipRow}>
                    {TIPOS_CITA.map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[
                          styles.chip,
                          selectedType === t && styles.chipActive,
                        ]}
                        onPress={() => setSelectedType(t)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedType === t && styles.chipTextActive,
                          ]}
                        >
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Fecha Seleccionada</Text>
                  <View style={styles.calendarSim}>
                    <MaterialCommunityIcons
                      name="calendar-month"
                      size={24}
                      color="#4DB6AC"
                    />
                    <Text style={styles.calendarText}>{dateLabel}</Text>

                    <TouchableOpacity
                      style={styles.changeBtn}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.changeBtnText}>Cambiar</Text>
                    </TouchableOpacity>
                  </View>

                  {showDatePicker && (
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="default"
                      onChange={onDateChange}
                      minimumDate={new Date()}
                    />
                  )}

                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      guardando && { backgroundColor: "#9E9E9E" },
                    ]}
                    onPress={guardarCita}
                    disabled={guardando}
                  >
                    {guardando ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>
                        {editandoId ? "Guardar cambios" : "Confirmar Cita"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <FlatList
        data={citas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 35 }}
        ListHeaderComponent={
          <>
            <CitasHeader />

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.addButton} onPress={abrirNuevaCita}>
                <MaterialIcons name="add-circle" size={22} color="white" />
                <Text style={styles.addButtonText}>Nueva Cita</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setMenuFiltroVisible(true)}
              >
                <MaterialCommunityIcons
                  name="tune-variant"
                  size={28}
                  color="#444"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Próximas Citas</Text>
          </>
        }
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            onEdit={() => abrirEditarCita(item)}
            onDelete={() => eliminarCita(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={
          cargando ? (
            <View style={styles.emptyBox}>
              <ActivityIndicator size="large" color="#4DB6AC" />
              <Text style={styles.emptyText}>Cargando citas...</Text>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons
                name="calendar-blank"
                size={45}
                color="#4DB6AC"
              />
              <Text style={styles.emptyTitle}>No tienes citas registradas</Text>
              <Text style={styles.emptyText}>
                Presiona “Nueva Cita” para agregar la primera.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

/* --- COMPONENTES --- */

function CitasHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerIconBg}>
        <MaterialIcons name="medical-services" size={40} color="white" />
      </View>
      <Text style={styles.title}>Salud y Citas</Text>
      <Text style={styles.subtitle}>Gestiona el bienestar de tus mascotas</Text>
    </View>
  );
}

function AppointmentCard({
  appointment,
  onEdit,
  onDelete,
}: {
  appointment: MedicalAppointment;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isUrgent = appointment.type === "Urgencia";

  const getIcon = () => {
    switch (appointment.type) {
      case "Vacuna":
        return "needle";
      case "Desparasitación":
        return "pill";
      case "Urgencia":
        return "pulse";
      default:
        return "clipboard-pulse";
    }
  };

  const getBadgeColor = () => {
    switch (appointment.type) {
      case "Vacuna":
        return "#4DB6AC";
      case "Control":
        return "#4DB6AC";
      case "Urgencia":
        return "#D32F2F";
      default:
        return "#4DB6AC";
    }
  };

  return (
    <View
      style={[
        styles.card,
        isUrgent && { borderColor: "#FFEBEE", borderWidth: 1 },
      ]}
    >
      <View style={styles.cardRow}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: isUrgent ? "#FFEBEE" : "#E0F2F1" },
          ]}
        >
          <MaterialCommunityIcons
            name={getIcon() as any}
            size={28}
            color={isUrgent ? "#D32F2F" : "#00796B"}
          />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.petNameText}>{appointment.petName}</Text>

            <View
              style={[styles.typeBadge, { backgroundColor: getBadgeColor() }]}
            >
              <Text style={styles.typeBadgeText}>
                {appointment.type.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.reasonText}>{appointment.reason}</Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="access-time" size={14} color="#666" />
            <Text style={styles.infoText}>
              {" "}
              {appointment.date} • {appointment.time}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={14} color="#BBB" />
            <Text style={styles.locationText}> {appointment.clinic}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <MaterialIcons name="edit" size={18} color="#00796B" />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <MaterialIcons name="delete-outline" size={18} color="#C62828" />
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },

  modalFullOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },

  headerIconBg: {
    backgroundColor: "#4DB6AC",
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#333",
  },

  subtitle: {
    color: "gray",
    fontSize: 14,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
    alignItems: "center",
  },

  addButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#4DB6AC",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    elevation: 2,
  },

  addButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },

  filterButton: {
    width: 52,
    height: 52,
    backgroundColor: "white",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },

  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#333",
  },

  filterMenu: {
    position: "absolute",
    width: 190,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    elevation: 10,
    shadowOpacity: 0.1,
  },

  menuHeader: {
    fontSize: 11,
    color: "#999",
    paddingHorizontal: 5,
    marginBottom: 5,
    fontWeight: "bold",
  },

  menuItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },

  menuItemActive: {
    backgroundColor: "#E0F2F1",
  },

  menuText: {
    fontSize: 15,
  },

  menuTextActive: {
    color: "#00796B",
    fontWeight: "bold",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 5,
  },

  clearText: {
    color: "#7B61FF",
    fontWeight: "bold",
    paddingVertical: 5,
    textAlign: "center",
  },

  formContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    maxHeight: "85%",
  },

  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00796B",
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginTop: 15,
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#eee",
  },

  chipActive: {
    backgroundColor: "#4DB6AC",
  },

  chipText: {
    color: "#666",
  },

  chipTextActive: {
    color: "white",
    fontWeight: "bold",
  },

  calendarSim: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2F1",
    padding: 15,
    borderRadius: 12,
    marginTop: 5,
  },

  calendarText: {
    flex: 1,
    marginLeft: 10,
    fontWeight: "600",
    color: "#00796B",
  },

  changeBtn: {
    padding: 5,
  },

  changeBtnText: {
    color: "#00796B",
    fontWeight: "bold",
  },

  saveButton: {
    backgroundColor: "#00796B",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 30,
  },

  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 65,
    height: 65,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },

  petNameText: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#333",
    flex: 1,
  },

  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  typeBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },

  reasonText: {
    fontSize: 16,
    color: "#444",
    marginBottom: 6,
    fontWeight: "500",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },

  infoText: {
    fontSize: 14,
    color: "#666",
  },

  locationText: {
    fontSize: 14,
    color: "#BBB",
  },

  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  editButton: {
    flex: 1,
    backgroundColor: "#E0F2F1",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  editButtonText: {
    color: "#00796B",
    fontWeight: "bold",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#FFEBEE",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  deleteButtonText: {
    color: "#C62828",
    fontWeight: "bold",
  },

  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#333",
    marginTop: 10,
  },

  emptyText: {
    color: "#777",
    marginTop: 6,
    textAlign: "center",
  },
});