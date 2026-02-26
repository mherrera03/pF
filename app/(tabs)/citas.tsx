import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
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

/* ---------------- MODELO ---------------- */
type AppointmentType = "Vacuna" | "Control" | "Urgencia" | "Desparasitación";

type MedicalAppointment = {
  id: string;
  petName: string;
  reason: string;
  date: string;
  time: string;
  clinic: string;
  type: AppointmentType;
};

const DATA_INICIAL: MedicalAppointment[] = [
  { id: '1', petName: "Max", reason: "Vacunación Anual", date: "25/10/2025", time: "10:00 AM", clinic: "Vet Central", type: "Vacuna" },
  { id: '2', petName: "Luna", reason: "Control de Peso", date: "30/10/2025", time: "04:30 PM", clinic: "Clínica Animal", type: "Control" },
  { id: '3', petName: "Thor", reason: "Herida en pata", date: "02/11/2025", time: "09:15 AM", clinic: "Vet Central", type: "Urgencia" },
];

export default function CitasScreen() {
  const [citas, setCitas] = useState(DATA_INICIAL);
  const [filtrosActivos, setFiltrosActivos] = useState<string[]>([]);
  const [menuFiltroVisible, setMenuFiltroVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  // Estados del Formulario
  const [newPetName, setNewPetName] = useState("");
  const [selectedType, setSelectedType] = useState<AppointmentType>("Control");
  
  // --- LÓGICA DEL CALENDARIO ---
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateLabel, setDateLabel] = useState("Seleccionar fecha");

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) {
      setDate(selectedDate);
      const formatted = selectedDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      setDateLabel(formatted);
    }
  };

  const aplicarFiltro = (valor: string) => {
    const filtro = `tipo:${valor}`;
    let nuevosFiltros = filtrosActivos.includes(filtro) 
      ? filtrosActivos.filter(f => f !== filtro) 
      : [...filtrosActivos, filtro];
    setFiltrosActivos(nuevosFiltros);

    const tiposSeleccionados = nuevosFiltros.map(f => f.split(':')[1]);
    setCitas(tiposSeleccionados.length > 0 
      ? DATA_INICIAL.filter(c => tiposSeleccionados.includes(c.type)) 
      : DATA_INICIAL);
  };

  const agregarCita = () => {
    if (!newPetName) return;
    const nueva: MedicalAppointment = {
      id: Math.random().toString(),
      petName: newPetName,
      reason: "Consulta agendada",
      date: dateLabel,
      time: "09:00 AM",
      clinic: "Clínica Veterinaria",
      type: selectedType,
    };
    setCitas([nueva, ...citas]);
    setFormVisible(false);
    setNewPetName("");
    setDateLabel("Seleccionar fecha");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 1. MODAL DE FILTROS */}
      <Modal visible={menuFiltroVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuFiltroVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.filterMenu, { top: 180, right: 20 }]}>
              <Text style={styles.menuHeader}>Especie</Text>
              {["Vacuna", "Control", "Urgencia", "Desparasitación"].map((t) => (
                <TouchableOpacity 
                  key={t} 
                  style={[styles.menuItem, filtrosActivos.includes(`tipo:${t}`) && styles.menuItemActive]} 
                  onPress={() => aplicarFiltro(t)}
                >
                  <Text style={[styles.menuText, filtrosActivos.includes(`tipo:${t}`) && styles.menuTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.divider} />
              <TouchableOpacity onPress={() => { setCitas(DATA_INICIAL); setFiltrosActivos([]); setMenuFiltroVisible(false); }}>
                <Text style={styles.clearText}>Limpiar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 2. MODAL DE NUEVA CITA */}
      <Modal visible={formVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setFormVisible(false)}>
          <View style={styles.modalFullOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.formContainer}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Nueva Cita Médica</Text>
                  <TouchableOpacity onPress={() => setFormVisible(false)}>
                    <MaterialIcons name="close" size={28} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.label}>Nombre de la Mascota</Text>
                  <TextInput style={styles.input} placeholder="Ej. Max" value={newPetName} onChangeText={setNewPetName} />

                  <Text style={styles.label}>Tipo de Servicio</Text>
                  <View style={styles.chipRow}>
                    {["Vacuna", "Control", "Urgencia", "Desparasitación"].map((t) => (
                      <TouchableOpacity 
                        key={t} 
                        style={[styles.chip, selectedType === t && styles.chipActive]} 
                        onPress={() => setSelectedType(t as AppointmentType)}
                      >
                        <Text style={[styles.chipText, selectedType === t && styles.chipTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Fecha Seleccionada</Text>
                  <View style={styles.calendarSim}>
                    <MaterialCommunityIcons name="calendar-month" size={24} color="#4DB6AC" />
                    <Text style={styles.calendarText}>{dateLabel}</Text>
                    <TouchableOpacity style={styles.changeBtn} onPress={() => setShowDatePicker(true)}>
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

                  <TouchableOpacity style={styles.saveButton} onPress={agregarCita}>
                    <Text style={styles.saveButtonText}>Confirmar Cita</Text>
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
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <>
            <CitasHeader />
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.addButton} onPress={() => setFormVisible(true)}>
                <MaterialIcons name="add-circle" size={22} color="white" />
                <Text style={styles.addButtonText}>Nueva Cita</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton} onPress={() => setMenuFiltroVisible(true)}>
                <MaterialCommunityIcons name="tune-variant" size={28} color="#444" />
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionTitle}>Próximas Citas</Text>
          </>
        }
        renderItem={({ item }) => <AppointmentCard appointment={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
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

function AppointmentCard({ appointment }: { appointment: MedicalAppointment }) {
  const isUrgent = appointment.type === "Urgencia";
  
  const getIcon = () => {
    switch(appointment.type) {
      case "Vacuna": return "needle";
      case "Desparasitación": return "pill";
      case "Urgencia": return "pulse";
      default: return "clipboard-pulse";
    }
  };

  const getBadgeColor = () => {
    switch(appointment.type) {
      case "Vacuna": return "#4DB6AC";
      case "Control": return "#4DB6AC";
      case "Urgencia": return "#D32F2F";
      default: return "#4DB6AC";
    }
  };

  return (
    <View style={[styles.card, isUrgent && { borderColor: '#FFEBEE', borderWidth: 1 }]}>
      <View style={styles.cardRow}>
        <View style={[styles.iconBox, { backgroundColor: isUrgent ? '#FFEBEE' : '#E0F2F1' }]}>
          <MaterialCommunityIcons name={getIcon() as any} size={28} color={isUrgent ? "#D32F2F" : "#00796B"} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.petNameText}>{appointment.petName}</Text>
            <View style={[styles.typeBadge, { backgroundColor: getBadgeColor() }]}>
              <Text style={styles.typeBadgeText}>{appointment.type.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.reasonText}>{appointment.reason}</Text>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="access-time" size={14} color="#666" />
            <Text style={styles.infoText}> {appointment.date} • {appointment.time}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={14} color="#BBB" />
            <Text style={styles.locationText}> {appointment.clinic}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  modalOverlay: { flex: 1, backgroundColor: 'transparent' },
  modalFullOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  header: { alignItems: "center", marginTop: 40, marginBottom: 20 },
  headerIconBg: { backgroundColor: '#4DB6AC', padding: 12, borderRadius: 18, marginBottom: 10 },
  title: { fontSize: 26, fontWeight: "800", color: '#333' },
  subtitle: { color: "gray", fontSize: 14 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 15, alignItems: 'center' },
  addButton: { flex: 1, height: 52, borderRadius: 14, backgroundColor: "#4DB6AC", justifyContent: "center", alignItems: "center", flexDirection: "row", elevation: 2 },
  addButtonText: { color: "white", fontWeight: "bold", marginLeft: 8, fontSize: 16 },
  filterButton: { width: 52, height: 52, backgroundColor: 'white', borderRadius: 14, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  sectionTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 12, color: '#333' },
  filterMenu: { position: 'absolute', width: 170, backgroundColor: 'white', borderRadius: 12, padding: 10, elevation: 10, shadowOpacity: 0.1 },
  menuHeader: { fontSize: 11, color: '#999', paddingHorizontal: 5, marginBottom: 5, fontWeight: 'bold' },
  menuItem: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  menuItemActive: { backgroundColor: '#E0F2F1' },
  menuText: { fontSize: 15 },
  menuTextActive: { color: '#00796B', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 5 },
  clearText: { color: '#7B61FF', fontWeight: 'bold', paddingVertical: 5, textAlign: 'center' },
  formContainer: { backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  formTitle: { fontSize: 22, fontWeight: 'bold', color: '#00796B' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#666', marginTop: 15, marginBottom: 8 },
  input: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 12, fontSize: 16 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#eee' },
  chipActive: { backgroundColor: '#4DB6AC' },
  chipText: { color: '#666' },
  chipTextActive: { color: 'white', fontWeight: 'bold' },
  calendarSim: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2F1', padding: 15, borderRadius: 12, marginTop: 5 },
  calendarText: { flex: 1, marginLeft: 10, fontWeight: '600', color: '#00796B' },
  changeBtn: { padding: 5 }, // <--- ESTE ES EL ESTILO QUE FALTABA
  changeBtnText: { color: '#00796B', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#00796B', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 30 },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: "white", borderRadius: 24, padding: 18, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  cardRow: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 65, height: 65, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: 16 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  petNameText: { fontWeight: "bold", fontSize: 20, color: "#333" },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  typeBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  reasonText: { fontSize: 16, color: '#444', marginBottom: 6, fontWeight: '500' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  infoText: { fontSize: 14, color: "#666" },
  locationText: { fontSize: 14, color: "#BBB" },
});