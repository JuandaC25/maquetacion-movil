import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent
} from 'react-native';
import { EspaciosStyles } from '../../../styles/Instructor/Solicitudes/Espacios';
import { espaciosService } from '../../../services/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface Espacio {
  id: number;
  nom_espa: string;
  descripcion: string;
  imagenes: string;
  estadoespacio: number;
}

export default function EspaciosContent({ navigation }: any) {
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState<Espacio | null>(null);
  const [activeSlides, setActiveSlides] = useState<{ [key: number]: number }>({});

  const [form, setForm] = useState({
    fecha_ini: '',
    hora_ini: '',
    fecha_fn: '',
    hora_fn: '',
    ambient: '',
    num_ficha: '',
  });

  useEffect(() => {
    cargarEspacios();
  }, []);

  const cargarEspacios = async () => {
    try {
      setLoading(true);
      const response = await espaciosService.getAll();
      const espaciosActivos = response.data.filter((esp: Espacio) => esp.estadoespacio === 1);
      setEspacios(espaciosActivos);
      setError(null);
    } catch (err: any) {
      console.error('Error al cargar espacios:', err);
      setError('No se pudieron cargar los espacios disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (espacio: Espacio) => {
    setEspacioSeleccionado(espacio);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({
      fecha_ini: '',
      hora_ini: '',
      fecha_fn: '',
      hora_fn: '',
      ambient: '',
      num_ficha: '',
    });
  };

  const handleSubmit = async () => {
    if (!espacioSeleccionado) return;

    // Validación básica
    if (!form.fecha_ini || !form.hora_ini || !form.fecha_fn || !form.hora_fn || !form.ambient || !form.num_ficha) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const user = await AsyncStorage.getItem('user');
      const userData = user ? JSON.parse(user) : null;

      const fechaInicio = new Date(`${form.fecha_ini}T${form.hora_ini}:00`);
      const fechaFin = new Date(`${form.fecha_fn}T${form.hora_fn}:00`);

      if (fechaFin <= fechaInicio) {
        Alert.alert('Error', 'La fecha y hora de fin debe ser posterior a la de inicio');
        return;
      }

      const pad = (n: number) => String(n).padStart(2, '0');
      const formatLocal = (d: Date) => {
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      };

      const solicitudData = {
        fecha_ini: formatLocal(fechaInicio),
        fecha_fn: formatLocal(fechaFin),
        ambient: form.ambient,
        estadosoli: 1,
        id_usu: userData?.id || 1,
        num_fich: form.num_ficha,
        id_esp: espacioSeleccionado.id,
      };

      Alert.alert('Éxito', 'Solicitud enviada correctamente');
      handleCloseModal();
    } catch (err: any) {
      console.error('Error al enviar solicitud:', err);
      Alert.alert('Error', 'No se pudo enviar la solicitud');
    }
  };

  const renderCarouselItem = ({ item, index }: { item: string; index: number }) => {
    const fullUrl = item.startsWith('http') 
      ? item 
      : `http://192.168.0.7:8081${item}`;

    return (
      <View key={index} style={{ width: width - 30 }}>
        <Image
          source={{ uri: fullUrl }}
          style={EspaciosStyles.carouselImage}
          defaultSource={require('../../../../public/Imagenes_solicitudes/Portatil.png')}
        />
      </View>
    );
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>, espacioId: number) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / (width - 30));
    setActiveSlides(prev => ({ ...prev, [espacioId]: currentIndex }));
  };

  const renderEspacioCard = (espacio: Espacio) => {
    let imagenes: string[] = [];
    try {
      imagenes = espacio.imagenes ? JSON.parse(espacio.imagenes) : [];
    } catch (e) {
      console.error('Error al parsear imágenes:', e);
      imagenes = [];
    }

    if (imagenes.length === 0) {
      imagenes = ['/imagenes/imagenes_espacios/default.jpg'];
    }

    const currentSlide = activeSlides[espacio.id] || 0;

    return (
      <View key={espacio.id} style={EspaciosStyles.espacioCard}>
        <View style={EspaciosStyles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => handleScroll(e, espacio.id)}
            scrollEventThrottle={16}
          >
            {imagenes.map((img, idx) => renderCarouselItem({ item: img, index: idx }))}
          </ScrollView>
          
          {/* Indicadores de paginación */}
          <View style={EspaciosStyles.paginationContainer}>
            {imagenes.map((_, index) => (
              <View
                key={index}
                style={[
                  EspaciosStyles.dotStyle,
                  currentSlide !== index && EspaciosStyles.inactiveDotStyle
                ]}
              />
            ))}
          </View>
        </View>

        <View style={EspaciosStyles.cardContent}>
          <Text style={EspaciosStyles.espacioNombre}>{espacio.nom_espa}</Text>
          <Text style={EspaciosStyles.espacioDescripcion}>{espacio.descripcion}</Text>
          
          <TouchableOpacity 
            style={EspaciosStyles.reservarButton}
            onPress={() => handleOpenModal(espacio)}
          >
            <Text style={EspaciosStyles.reservarButtonText}>Apartar espacio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={EspaciosStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#3fbb34" />
        <Text style={EspaciosStyles.loadingText}>Cargando espacios disponibles...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={EspaciosStyles.errorContainer}>
        <Text style={EspaciosStyles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={EspaciosStyles.content}>
        {espacios.length === 0 ? (
          <View style={EspaciosStyles.emptyContainer}>
            <Text style={EspaciosStyles.emptyIcon}>🏢</Text>
            <Text style={EspaciosStyles.emptyText}>
              No hay espacios disponibles en este momento
            </Text>
          </View>
        ) : (
          espacios.map(espacio => renderEspacioCard(espacio))
        )}
      </ScrollView>

      {/* Modal de Reserva */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={EspaciosStyles.modalOverlay}>
          <View style={EspaciosStyles.modalContent}>
            <View style={EspaciosStyles.modalHeader}>
              <Text style={EspaciosStyles.modalTitle}>
                Reservar {espacioSeleccionado?.nom_espa}
              </Text>
              <TouchableOpacity 
                onPress={handleCloseModal}
                style={EspaciosStyles.closeButton}
              >
                <Text style={EspaciosStyles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Fecha y Hora de Inicio */}
              <View style={EspaciosStyles.formGroup}>
                <Text style={EspaciosStyles.formLabel}>Fecha y Hora de Inicio</Text>
                <View style={EspaciosStyles.formRow}>
                  <View style={EspaciosStyles.formHalfInput}>
                    <TextInput
                      style={EspaciosStyles.input}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#666"
                      value={form.fecha_ini}
                      onChangeText={(text) => setForm({...form, fecha_ini: text})}
                    />
                  </View>
                  <View style={EspaciosStyles.formHalfInput}>
                    <TextInput
                      style={EspaciosStyles.input}
                      placeholder="HH:MM"
                      placeholderTextColor="#666"
                      value={form.hora_ini}
                      onChangeText={(text) => setForm({...form, hora_ini: text})}
                    />
                  </View>
                </View>
              </View>

              {/* Fecha y Hora de Fin */}
              <View style={EspaciosStyles.formGroup}>
                <Text style={EspaciosStyles.formLabel}>Fecha y Hora de Fin</Text>
                <View style={EspaciosStyles.formRow}>
                  <View style={EspaciosStyles.formHalfInput}>
                    <TextInput
                      style={EspaciosStyles.input}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#666"
                      value={form.fecha_fn}
                      onChangeText={(text) => setForm({...form, fecha_fn: text})}
                    />
                  </View>
                  <View style={EspaciosStyles.formHalfInput}>
                    <TextInput
                      style={EspaciosStyles.input}
                      placeholder="HH:MM"
                      placeholderTextColor="#666"
                      value={form.hora_fn}
                      onChangeText={(text) => setForm({...form, hora_fn: text})}
                    />
                  </View>
                </View>
              </View>

              {/* Ambiente */}
              <View style={EspaciosStyles.formGroup}>
                <Text style={EspaciosStyles.formLabel}>Ambiente</Text>
                <TextInput
                  style={EspaciosStyles.input}
                  placeholder="Ej: Ambiente301"
                  placeholderTextColor="#666"
                  value={form.ambient}
                  onChangeText={(text) => setForm({...form, ambient: text})}
                />
              </View>

              {/* Número de Ficha */}
              <View style={EspaciosStyles.formGroup}>
                <Text style={EspaciosStyles.formLabel}>Número de ficha</Text>
                <TextInput
                  style={EspaciosStyles.input}
                  placeholder="Ej: 2560014"
                  placeholderTextColor="#666"
                  value={form.num_ficha}
                  onChangeText={(text) => setForm({...form, num_ficha: text})}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity 
                style={EspaciosStyles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={EspaciosStyles.submitButtonText}>Confirmar Reserva</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
