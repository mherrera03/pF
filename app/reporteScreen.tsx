import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ReporteScreen() {
  const router = useRouter();

  const [tipoReporte, setTipoReporte] = useState<'rapido' | 'completo'>('rapido');
  const [image, setImage] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.08,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    color: '',
    telefono: '',
    tamaño: '',
    rasgos: '',
  });

  const handleChange = (campo: string, valor: string) => {
    setFormData({ ...formData, [campo]: valor });
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Activa la ubicación');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});

    setCoords({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const handleSubmit = () => {
    console.log('Datos enviados:', { ...formData, image, coords });
    Alert.alert('Reporte enviado', 'Tu reporte fue publicado correctamente 🐾');
    router.back();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 150 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Nuevo Reporte</Text>

      {/* Toggle */}
      <View style={styles.toggleContainer}>
        {['rapido', 'completo'].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[
              styles.toggleButton,
              tipoReporte === tipo && styles.activeToggle,
            ]}
            onPress={() => setTipoReporte(tipo as 'rapido' | 'completo')}
          >
            <Text
              style={[
                styles.toggleText,
                tipoReporte === tipo && styles.activeText,
              ]}
            >
              {tipo === 'rapido' ? 'Reporte Rápido' : 'Reporte Completo'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la mascota"
        value={formData.nombre}
        onChangeText={(text) => handleChange('nombre', text)}
      />

      {/* Especie */}
      <Text style={styles.label}>Especie</Text>
      <View style={styles.wrapRow}>
        {['Perro', 'Gato'].map((esp) => (
          <Animated.View
            key={esp}
            style={{ transform: [{ scale: scaleAnim }] }}
          >
            <TouchableOpacity
              style={[
                styles.chip,
                formData.especie === esp && styles.chipActive,
              ]}
              onPress={() => {
                handleChange('especie', esp);
                animatePress();
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  formData.especie === esp && styles.chipTextActive,
                ]}
              >
                {esp}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Color */}
      <Text style={styles.label}>Color</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.color}
          onValueChange={(itemValue) => handleChange('color', itemValue)}
        >
          <Picker.Item label="Seleccionar color..." value="" />
          <Picker.Item label="Blanco" value="Blanco" />
          <Picker.Item label="Negro" value="Negro" />
          <Picker.Item label="Café" value="Café" />
          <Picker.Item label="Gris" value="Gris" />
          <Picker.Item label="Amarillo" value="Amarillo" />
          <Picker.Item label="Dorado" value="Dorado" />
          <Picker.Item label="Mixto" value="Mixto" />
        </Picker>
      </View>

      {/* Ubicación */}
      <Text style={styles.label}>Ubicación</Text>

      <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
        <Text style={styles.locationText}>Obtener ubicación actual</Text>
      </TouchableOpacity>

      {coords && (
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`
            )
          }
        >
          <Text style={styles.mapPreview}>Ver en Google Maps</Text>
        </TouchableOpacity>
      )}

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="numeric"
        value={formData.telefono}
        onChangeText={(text) => handleChange('telefono', text)}
      />

      {tipoReporte === 'completo' && (
        <>
          {/* Tamaño */}
          <Text style={styles.label}>Tamaño</Text>
          <View style={styles.wrapRow}>
            {['Pequeño', 'Mediano', 'Grande'].map((size) => (
              <Animated.View
                key={size}
                style={{ transform: [{ scale: scaleAnim }] }}
              >
                <TouchableOpacity
                  style={[
                    styles.chip,
                    formData.tamaño === size && styles.chipActive,
                  ]}
                  onPress={() => {
                    handleChange('tamaño', size);
                    animatePress();
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      formData.tamaño === size && styles.chipTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          <TextInput
            style={[styles.input, { height: 90 }]}
            placeholder="Características distintivas"
            multiline
            value={formData.rasgos}
            onChangeText={(text) => handleChange('rasgos', text)}
          />

          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            <Text style={styles.photoText}>Agregar Foto</Text>
          </TouchableOpacity>

          {image && (
            <Image source={{ uri: image }} style={styles.previewImage} />
          )}
        </>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>
          {tipoReporte === 'rapido'
            ? 'Publicar Reporte Rápido'
            : 'Publicar Reporte Completo'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4ECFF', padding: 20 },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A5ACD',
    textAlign: 'center',
    marginBottom: 25,
    marginTop: 15,
  },

  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#E5D9FF',
    marginHorizontal: 5,
    alignItems: 'center',
  },

  activeToggle: { backgroundColor: '#6A5ACD' },

  toggleText: { color: '#6A5ACD', fontWeight: '600' },

  activeText: { color: '#fff' },

  input: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D6C8FF',
  },

  label: {
    fontWeight: '600',
    color: '#6A5ACD',
    marginBottom: 8,
    marginTop: 10,
  },

  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  chip: {
    backgroundColor: '#E5D9FF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 6,
  },

  chipActive: { backgroundColor: '#6A5ACD' },

  chipText: { color: '#5A4FCF', fontWeight: '600' },

  chipTextActive: { color: '#fff' },

  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D6C8FF',
    marginBottom: 15,
  },

  locationButton: {
    backgroundColor: '#D6C8FF',
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },

  locationText: { color: '#4B3FBF', fontWeight: '600' },

  mapPreview: {
    textAlign: 'center',
    color: '#6A5ACD',
    marginBottom: 15,
    textDecorationLine: 'underline',
  },

  photoButton: {
    backgroundColor: '#D6C8FF',
    padding: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
  },

  photoText: { color: '#4B3FBF', fontWeight: '600' },

  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
  },

  submitButton: {
    backgroundColor: '#5A4FCF',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
    elevation: 4,
  },

  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});