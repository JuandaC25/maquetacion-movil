import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { elementosService } from '../../../services/Api';
import HeaderWithDrawer from '../Header/Header';
import { styles } from '../../../styles/Instructor/Solicitudes/AudioVideo';

const { width } = Dimensions.get('window');

const AUDIO_VIDEO_IMAGES = [
  require('../../../../public/Audiovideo/Audifonos.png'),
  require('../../../../public/Audiovideo/Camara.png'),
  require('../../../../public/Audiovideo/Reflector.png'),
  require('../../../../public/Audiovideo/tabletaGrafica.png'),
  require('../../../../public/Audiovideo/Trajedecroma.png'),
];

export default function Audio_video({ navigation }: any) {
      // Estado para subcategoría seleccionada
      const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<number | null>(null);
    // Listado de todas las subcategorías
    const [todasSubcategorias, setTodasSubcategorias] = useState<any[]>([]);

    useEffect(() => {
          // Selecciona la primera subcategoría por defecto si existe
          if (todasSubcategorias.length > 0 && subcategoriaSeleccionada === null) {
            setSubcategoriaSeleccionada(todasSubcategorias[0].id_subcategoria);
          }
      // Importo el servicio aquí para evitar error de import duplicada
      const { subcategoriasService } = require('../../../services/Api');
      const cargarTodasSubcategorias = async () => {
        try {
          const resp = await subcategoriasService.getAll();
          const data = resp.data || [];
          setTodasSubcategorias(data);
        } catch (err) {
          console.error('Error cargando todas las subcategorías:', err);
          setTodasSubcategorias([]);
        }
      };
      cargarTodasSubcategorias();
    }, []);
  const [equiposDisponibles, setEquiposDisponibles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Modal y formulario
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    fecha_ini: '',
    hora_ini: '',
    fecha_fn: '',
    hora_fn: '',
    ambient: '',
    num_ficha: '',
    cantidad: 1,
  });
  const [showTimePicker, setShowTimePicker] = useState<string | null>(null);
  const [pickerTime, setPickerTime] = useState<Date>(new Date());
  // Eliminado: subcategorias y subcategoriaSeleccionada (solo se listan todas las subcategorías)

  // Helpers reutilizados
  const getCurrentDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const getCurrentTimePlusOne = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 1);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  const formatTo12Hour = (time: string) => {
    if (!time) return '';
    const [hour, minute] = time.split(':');
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h.toString().padStart(2, '0')}:${minute} ${ampm}`;
  };
  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(null);
      return;
    }
    const currentDate = selectedDate || pickerTime;
    setPickerTime(currentDate);
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    if (showTimePicker === 'hora_ini') {
      setForm(f => ({ ...f, hora_ini: `${hours}:${minutes}` }));
    } else if (showTimePicker === 'hora_fn') {
      setForm(f => ({ ...f, hora_fn: `${hours}:${minutes}` }));
    }
    setShowTimePicker(null);
  };

  // Mock de subcategorías para Multimedia
  // Eliminado: useEffect de mock de subcategorías

  // Envío de solicitud
  const handleSubmitSolicitud = async () => {
    // Aquí deberías obtener el usuario y roles si lo necesitas
    // Para ejemplo, solo validamos campos
    if (equiposDisponibles === 0) {
      Alert.alert('Error', 'No hay elementos disponibles para solicitar.');
      return;
    }
    if (form.cantidad < 1 || form.cantidad > 3) {
      Alert.alert('Error', 'Solo puedes solicitar entre 1 y 3 elementos.');
      return;
    }
    if (!form.fecha_ini || !form.hora_ini || !form.fecha_fn || !form.hora_fn || !form.ambient || !form.num_ficha) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    // Validación de hora: la hora de fin debe ser posterior a la de inicio
    const inicio = new Date(`${form.fecha_ini}T${form.hora_ini}:00`);
    const fin = new Date(`${form.fecha_fn}T${form.hora_fn}:00`);
    if (fin <= inicio) {
      Alert.alert('Hora incorrecta', 'Seleccione una hora de fin posterior a la hora de inicio.');
      return;
    }
    try {
      // Aquí deberías obtener los IDs de los elementos activos, para ejemplo se envía un array vacío
      const idsElem: number[] = [];
      const dto = {
        fecha_ini: `${form.fecha_ini}T${form.hora_ini}:00`,
        fecha_fn: `${form.fecha_fn}T${form.hora_fn}:00`,
        ambient: form.ambient,
        num_fich: Number(form.num_ficha),
        cantid: Number(form.cantidad),
        ids_elem: idsElem,
        id_categoria: 2, // Multimedia (ID ejemplo)
        id_subcategoria: subcategoriaSeleccionada,
        id_usu: 1, // ID de usuario ejemplo
        id_estado_soli: 1,
      };
      console.log('Solicitudes DTO AudioVideo:', dto);
      // Aquí deberías llamar a tu servicio de solicitudes
      Alert.alert('Solicitud enviada', 'La solicitud se ha enviado correctamente ✅');
      setModalVisible(false);
      setForm({ 
        fecha_ini: '', 
        hora_ini: '', 
        fecha_fn: '', 
        hora_fn: '', 
        ambient: '', 
        num_ficha: '', 
        cantidad: 1 
      });
    } catch (err: any) {
      console.error("Error en la solicitud:", err);
      Alert.alert('Error', `No se pudo enviar la solicitud: ${err?.message || 'Error desconocido'}`);
    }
  };

  useEffect(() => {
    loadElementos();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % AUDIO_VIDEO_IMAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const loadElementos = async () => {
    try {
      setIsLoading(true);
      const response = await elementosService.getAll();
      const data = response.data || [];
      
      const subcategoriasExcluir = ['Equipo de edicion', 'Portátil de edicion'];
      const multimediaItems = data.filter(
        (item: any) =>
          item.tip_catg &&
          item.tip_catg.toLowerCase().trim() === 'multimedia' &&
          (!item.sub_catg || !subcategoriasExcluir.includes(item.sub_catg))
      );
      
      const activos = multimediaItems.filter((item: any) => item.est === 1);
      setEquiposDisponibles(activos.length);
    } catch (error) {
      console.error('Error al cargar elementos:', error);
      Alert.alert('Error', 'No se pudieron cargar los elementos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithDrawer navigation={navigation} title="Audio y Video" />
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.title}>🎬 Audio/Video</Text>
            <Text style={styles.subtitle}>
              Visualiza aquí los detalles generales de los elementos de audio/video disponibles
            </Text>
          </View>
          {/* Carrusel de imágenes */}
          <View style={styles.carouselContainer}>
            <Image
              source={AUDIO_VIDEO_IMAGES[currentImageIndex]}
              style={styles.carouselImage}
              resizeMode="contain"
            />
          </View>

          {/* Descripción */}
          <View style={styles.descripcionContainer}>
            <Text style={styles.sectionTitle}>📹 Zona de Producción Audiovisual</Text>
            <View style={styles.descripcionTextContainer}>
              <Text style={styles.descripcionText}>
                En este apartado encontrarás los accesorios y elementos esenciales para la creación
                de proyectos o trabajos de multimedia dentro del Centro. Equipos como micrófonos,
                pantallas verdes, audífonos, iluminación entre otros están disponibles para
                actividades de grabación, ensayo, diseño de escenas y producción audiovisual
                en general.
              </Text>
            </View>
          </View>

          {/* Especificaciones */}
          <View style={styles.especificacionesContainer}>
            <Text style={styles.sectionTitle}> ¿Qué encontrarás en esta categoría?</Text>
            <View style={styles.listaContainer}>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Equipos para captura de audio</Text>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Herramientas para composición visual y chromas</Text>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Accesorios de ambientación multimedia</Text>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Elementos para monitorización y control de sonido</Text>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Recursos para actividades de grabación y producción</Text>
            </View>
          </View>

          {/* Botón de solicitud */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => {
              setForm(f => ({
                ...f,
                fecha_ini: getCurrentDate(),
                fecha_fn: getCurrentDate(),
                hora_ini: getCurrentTimePlusOne(),
                hora_fn: '',
                cantidad: 1,
                ambient: '',
                num_ficha: ''
              }));
              setModalVisible(true);
            }}
          >
            <Text style={styles.submitButtonText}>Realizar solicitud</Text>
          </TouchableOpacity>

          {/* ---- MODAL DE SOLICITUD ---- */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Solicitud Elemento Multimedia</Text>
                  {/* Fecha Inicio */}
                  <Text style={styles.modalText}>Fecha inicio</Text>
                  <TextInput style={styles.modalInput} value={form.fecha_ini} editable={false} />
                  {/* Hora Inicio */}
                  <Text style={styles.modalText}>Hora inicio</Text>
                  <TouchableOpacity onPress={() => { setShowTimePicker('hora_ini'); setPickerTime(new Date()); }}>
                    <View pointerEvents="none">
                      <TextInput style={styles.modalInput} placeholder="HH:MM AM/PM" value={formatTo12Hour(form.hora_ini)} editable={false} />
                    </View>
                  </TouchableOpacity>
                  {/* Fecha Fin */}
                  <Text style={styles.modalText}>Fecha fin</Text>
                  <TextInput style={styles.modalInput} value={form.fecha_fn} editable={false} />
                  {/* Hora Fin */}
                  <Text style={styles.modalText}>Hora fin</Text>
                  <TouchableOpacity onPress={() => { setShowTimePicker('hora_fn'); setPickerTime(new Date()); }}>
                    <View pointerEvents="none">
                      <TextInput style={styles.modalInput} placeholder="HH:MM AM/PM" value={formatTo12Hour(form.hora_fn)} editable={false} />
                    </View>
                  </TouchableOpacity>
                  {showTimePicker && (
                    <DateTimePicker value={pickerTime} mode="time" is24Hour={false} display="default" onChange={handleTimeChange} />
                  )}
                  {/* Eliminado texto de cantidad 10, solo se muestra cantidad 3 */}
                  <Text style={styles.modalText}>Cantidad (Máx 3)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="1"
                    value={String(form.cantidad)}
                    keyboardType="numeric"
                    onChangeText={(v: string) => {
                      const num = parseInt(v) || 0;
                      if (v === '') { setForm(f => ({ ...f, cantidad: 0 })); } 
                      else { let val = Math.max(1, Math.min(3, num)); setForm(f => ({ ...f, cantidad: val })); }
                    }}
                  />
                  <Text style={styles.modalText}>Ambiente</Text>
                  <TextInput style={styles.modalInput} placeholder="Ej: Ambiente 301" value={form.ambient} onChangeText={(v: string) => setForm(f => ({ ...f, ambient: v }))} />
                  <Text style={styles.modalText}>Número de ficha</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    placeholder="Ej: 2560014" 
                    value={form.num_ficha} 
                    onChangeText={(v: string) => setForm(f => ({ ...f, num_ficha: v }))} 
                    keyboardType="numeric"
                  />
                  <Text style={styles.modalText}>Categoría</Text>
                  <Text style={[styles.modalInput, { backgroundColor: '#e3f2fd', color: '#0d47a1', fontWeight: 'bold' }]}>Multimedia</Text>
                  <Text style={styles.modalText}>Subcategoría</Text>
                  <View style={{ width: '100%', marginBottom: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 7 }}>
                    <Picker
                      selectedValue={subcategoriaSeleccionada}
                      onValueChange={(itemValue) => setSubcategoriaSeleccionada(itemValue)}
                      style={[styles.pickerInput, { height: 50}]}
                      itemStyle={{ fontSize: 16, color: '#000', fontWeight: 'bold' }}
                    >
                      {todasSubcategorias.map(subcat => (
                        <Picker.Item
                          key={subcat.id_subcategoria}
                          label={String(subcat.nom_subcategoria || subcat.nom_subcateg || subcat.nombre || 'Sin nombre')}
                          value={subcat.id_subcategoria}
                        />
                      ))}
                    </Picker>
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <Button title="Enviar Solicitud" color="#4caf50" onPress={handleSubmitSolicitud} />
                    <View style={{ marginTop: 10 }}>
                      <Button title="Cancelar" color="#dc3545" onPress={() => setModalVisible(false)} />
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
