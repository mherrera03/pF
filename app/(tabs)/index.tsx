import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- IMPORTACIÓN AGREGADA ---
import AdoptionScreen from './adoption';

// Datos limpios
const DATA_INICIAL = [
  { id: '1', nombre: 'Max', tipo: 'Perro', tamaño: 'Grande', raza: 'Golden Retriever', fecha: '18/12/2023', rasgos: 'Collar rojo', ubicacion: 'Cerca de Reforma' },
  { id: '2', nombre: 'Luna', tipo: 'Gato', tamaño: 'Pequeño', raza: 'Siamés', fecha: '15/12/2023', rasgos: 'Ojos azules', ubicacion: 'En colonia centro' },
  { id: '3', nombre: 'Rocky', tipo: 'Perro', tamaño: 'Mediano', raza: 'Mestizo', fecha: '10/12/2023', rasgos: 'Mancha en ojo', ubicacion: 'Zona residencial' },
];

function HomeScreen() {
  const [showMenu, setShowMenu] = useState(false);
  const [mascotas, setMascotas] = useState(DATA_INICIAL);

  const aplicarFiltro = (tipo, valor) => {
    let filtrados = DATA_INICIAL;
    if (tipo === 'especie') filtrados = DATA_INICIAL.filter(m => m.tipo === valor);
    if (tipo === 'tamaño') filtrados = DATA_INICIAL.filter(m => m.tamaño === valor);
    setMascotas(filtrados);
    setShowMenu(false);
  };

  const limpiarFiltros = () => {
    setMascotas(DATA_INICIAL);
    setShowMenu(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Limpio (Sin texto de filtrado) */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="paw" size={45} color="black" />
        <Text style={styles.title}>Patitas Felices</Text>
        <Text style={styles.subtitle}>Mascotas perdidas</Text>
      </View>

      <View style={styles.actionRow}>
        <View style={{ width: 40 }} /> 
        <TouchableOpacity style={styles.reportButton}>
          <MaterialCommunityIcons name="shield-check" size={20} color="white" />
          <Text style={styles.reportButtonText}>Reportar mascota perdida</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterDots} onPress={() => setShowMenu(!showMenu)}>
          <MaterialCommunityIcons name="dots-vertical" size={28} color="black" />
        </TouchableOpacity>

        {showMenu && (
          <View style={styles.androidMenu}>
            <Text style={styles.menuHeader}>Especie</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => aplicarFiltro('especie', 'Perro')}><Text style={styles.menuText}>Perros</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => aplicarFiltro('especie', 'Gato')}><Text style={styles.menuText}>Gatos</Text></TouchableOpacity>
            <View style={styles.divider} />
            <Text style={styles.menuHeader}>Tamaño</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => aplicarFiltro('tamaño', 'Pequeño')}><Text style={styles.menuText}>Pequeño</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => aplicarFiltro('tamaño', 'Mediano')}><Text style={styles.menuText}>Mediano</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => aplicarFiltro('tamaño', 'Grande')}><Text style={styles.menuText}>Grande</Text></TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={limpiarFiltros}><Text style={[styles.menuText, {color: '#6A5ACD', fontWeight: 'bold'}]}>Limpiar filtros</Text></TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={mascotas}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="image" size={40} color="#ccc" />
              </View>
              <View style={styles.infoContainer}>
                {/* Nombre Limpio (Sin el tamaño al lado) */}
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

// --- NAVEGACIÓN ---
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <Tab.Navigator screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#673AB7',
        tabBarInactiveTintColor: '#555',
        tabBarStyle: styles.tabBar, 
    }}>
      <Tab.Screen name="index" component={HomeScreen} options={{ tabBarLabel: 'Inicio', tabBarIcon: ({color}) => <MaterialCommunityIcons name="home" size={26} color={color}/> }} />
      <Tab.Screen name="adoption" component={AdoptionScreen} options={{ tabBarLabel: 'Adopción', tabBarIcon: ({color}) => <MaterialCommunityIcons name="heart" size={26} color={color}/> }} />
      <Tab.Screen name="citas" component={View} options={{ tabBarLabel: 'Citas', tabBarIcon: ({color}) => <MaterialCommunityIcons name="plus-box" size={26} color={color}/> }} />
      <Tab.Screen name="perfil" component={View} options={{ tabBarLabel: 'Perfil', tabBarIcon: ({color}) => <MaterialCommunityIcons name="account" size={26} color={color}/> }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBFF', paddingHorizontal: 20 },
  header: { alignItems: 'center', marginTop: 30, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#666' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, zIndex: 10 },
  reportButton: { backgroundColor: '#6A5ACD', flex: 1, padding: 15, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  reportButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 10 },
  filterDots: { width: 40, alignItems: 'flex-end' },
  androidMenu: { position: 'absolute', right: 0, top: 50, backgroundColor: 'white', borderRadius: 8, elevation: 10, paddingVertical: 10, width: 160, zIndex: 100 },
  menuHeader: { fontSize: 11, color: '#999', paddingHorizontal: 15, marginBottom: 5, fontWeight: 'bold' },
  menuItem: { paddingHorizontal: 15, paddingVertical: 8 },
  menuText: { fontSize: 15 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 5 },
  card: { backgroundColor: 'white', borderRadius: 25, padding: 15, marginBottom: 20, elevation: 3 },
  cardContent: { flexDirection: 'row', marginBottom: 15 },
  imagePlaceholder: { width: 100, height: 100, backgroundColor: '#D9D9D9', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  infoContainer: { marginLeft: 15, flex: 1 },
  petName: { fontSize: 18, fontWeight: 'bold' },
  petDetails: { fontSize: 13, color: '#666' },
  petLocation: { fontSize: 12, color: '#999', marginTop: 5 },
  foundButton: { backgroundColor: '#6FCF97', padding: 12, borderRadius: 25, alignItems: 'center' },
  foundButtonText: { color: 'white', fontWeight: 'bold' },
  tabBar: { height: 70, borderTopWidth: 0, backgroundColor: '#FFF' },
});