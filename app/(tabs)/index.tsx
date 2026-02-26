import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const DATA_INICIAL = [
  { id: '1', nombre: 'Max', tipo: 'Perro', tamaño: 'Grande', raza: 'Golden Retriever', fecha: '18/12/2023', rasgos: 'Collar rojo', ubicacion: 'Cerca de Reforma' },
  { id: '2', nombre: 'Luna', tipo: 'Gato', tamaño: 'Pequeño', raza: 'Siamés', fecha: '15/12/2023', rasgos: 'Ojos azules', ubicacion: 'En colonia centro' },
  { id: '3', nombre: 'Rocky', tipo: 'Perro', tamaño: 'Mediano', raza: 'Mestizo', fecha: '10/12/2023', rasgos: 'Mancha en ojo', ubicacion: 'Zona residencial' },
];

function HomeScreen() {
  const router = useRouter();

  const [showMenu, setShowMenu] = useState(false);
  const [mascotas, setMascotas] = useState(DATA_INICIAL);
  const [filtrosActivos, setFiltrosActivos] = useState<string[]>([]);

  const aplicarFiltro = (tipo: string, valor: string) => {
    const filtro = `${tipo}:${valor}`;
    let nuevosFiltros;

    if (filtrosActivos.includes(filtro)) {
      nuevosFiltros = filtrosActivos.filter(f => f !== filtro);
    } else {
      nuevosFiltros = [...filtrosActivos, filtro];
    }

    setFiltrosActivos(nuevosFiltros);

    let filtrados = DATA_INICIAL;
    const especies = nuevosFiltros.filter(f => f.startsWith('especie')).map(f => f.split(':')[1]);
    const tamaños = nuevosFiltros.filter(f => f.startsWith('tamaño')).map(f => f.split(':')[1]);

    if (especies.length > 0) {
      filtrados = filtrados.filter(m => especies.includes(m.tipo));
    }
    if (tamaños.length > 0) {
      filtrados = filtrados.filter(m => tamaños.includes(m.tamaño));
    }

    setMascotas(filtrados);
  };

  const limpiarFiltros = () => {
    setMascotas(DATA_INICIAL);
    setFiltrosActivos([]);
    setShowMenu(false);
  };

  const getMenuItemStyle = (tipo: string, valor: string) => ([
    styles.menuItem,
    filtrosActivos.includes(`${tipo}:${valor}`) && styles.menuItemActive
  ]);

  const getMenuTextStyle = (tipo: string, valor: string) => ([
    styles.menuText,
    filtrosActivos.includes(`${tipo}:${valor}`) && styles.menuTextActive
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Patitas Felices</Text>
        <Text style={styles.subtitle}>Mascotas perdidas</Text>
      </View>

      <View style={styles.actionRow}>
        <View style={{ width: 30 }} /> 

        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => router.push('/reporteScreen')}
        >
          <MaterialCommunityIcons name="shield-check" size={20} color="white" />
          <Text style={styles.reportButtonText}>Reportar mascota perdida</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterDots} onPress={() => setShowMenu(true)}>
          <MaterialCommunityIcons name="dots-vertical" size={28} color="#444" />
        </TouchableOpacity>

        {/* --- MODAL PARA EL MENU --- */}
        <Modal
          visible={showMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.androidMenu, { top: 160, right: 20 }]}>
                <Text style={styles.menuHeader}>Especie</Text>

                <TouchableOpacity style={getMenuItemStyle('especie', 'Perro')} onPress={() => aplicarFiltro('especie', 'Perro')}>
                  <Text style={getMenuTextStyle('especie', 'Perro')}>Perros</Text>
                </TouchableOpacity>

                <TouchableOpacity style={getMenuItemStyle('especie', 'Gato')} onPress={() => aplicarFiltro('especie', 'Gato')}>
                  <Text style={getMenuTextStyle('especie', 'Gato')}>Gatos</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <Text style={styles.menuHeader}>Tamaño</Text>

                <TouchableOpacity style={getMenuItemStyle('tamaño', 'Pequeño')} onPress={() => aplicarFiltro('tamaño', 'Pequeño')}>
                  <Text style={getMenuTextStyle('tamaño', 'Pequeño')}>Pequeño</Text>
                </TouchableOpacity>

                <TouchableOpacity style={getMenuItemStyle('tamaño', 'Mediano')} onPress={() => aplicarFiltro('tamaño', 'Mediano')}>
                  <Text style={getMenuTextStyle('tamaño', 'Mediano')}>Mediano</Text>
                </TouchableOpacity>

                <TouchableOpacity style={getMenuItemStyle('tamaño', 'Grande')} onPress={() => aplicarFiltro('tamaño', 'Grande')}>
                  <Text style={getMenuTextStyle('tamaño', 'Grande')}>Grande</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.menuItem} onPress={limpiarFiltros}>
                  <Text style={[styles.menuText, {color: '#7B61FF', fontWeight: 'bold'}]}>
                    Limpiar filtros
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>

      <FlatList
        data={mascotas}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="image" size={40} color="#9F8CFF" />
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.petName}>{item.nombre}</Text>
                <Text style={styles.petDetails}>Raza: {item.raza}</Text>
                <Text style={styles.petDetails}>Fecha: {item.fecha}</Text>
                <Text style={styles.petDetails}><Text style={{fontWeight: 'bold'}}>Rasgos:</Text> {item.rasgos}</Text>
                <Text style={styles.petLocation}>{item.ubicacion}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.foundButton}>
              <Text style={styles.foundButtonText}>Reportar hallazgo</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F2FF', paddingHorizontal: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'transparent' }, // Capa para detectar clics fuera
  header: { alignItems: 'center', marginTop: 30, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#5E35B1' },
  subtitle: { fontSize: 16, color: '#777' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, zIndex: 10 },
  reportButton: { backgroundColor: '#7B61FF', flex: 1, padding: 15, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  reportButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
  filterDots: { width: 40, alignItems: 'flex-end' },
  androidMenu: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 10,
    paddingVertical: 10,
    width: 170,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  menuHeader: { fontSize: 11, color: '#999', paddingHorizontal: 15, marginBottom: 5, fontWeight: 'bold' },
  menuItem: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  menuItemActive: { backgroundColor: '#EFE9FF' },
  menuText: { fontSize: 15 },
  menuTextActive: { color: '#7B61FF', fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 5 },
  card: { backgroundColor: 'white', borderRadius: 16, borderWidth: 2, borderColor: '#C9B8FF', padding: 15, marginBottom: 20 },
  cardContent: { flexDirection: 'row', marginBottom: 15 },
  imagePlaceholder: { width: 100, height: 100, backgroundColor: '#F1EDFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  infoContainer: { marginLeft: 15, flex: 1 },
  petName: { fontSize: 20, fontWeight: 'bold', color: '#5E35B1' },
  petDetails: { fontSize: 13, color: '#666' },
  petLocation: { fontSize: 12, color: '#999', marginTop: 5 },
  foundButton: { backgroundColor: '#9F8CFF', padding: 12, borderRadius: 25, alignItems: 'center' },
  foundButtonText: { color: 'white', fontWeight: 'bold' },
});