import React, { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker'
import { Modal, TextInput, Button } from 'react-native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { elementosService, solicitudesService } from '../../../services/Api';
import HeaderWithDrawer from '../Header/Header';
import { styles } from '../../../styles/Instructor/Solicitudes/EquipoMesa';

const { width } = Dimensions.get('window');

const ID_USUARIO = 1;
const ESTADO_SOLI_INICIAL = 1;
// Mapeo de IDs de Categoría (DEBE COINCIDIR CON TU BACKEND)
const ID_CATEGORIA_COMPUTO = 1; 
const ID_CATEGORIA_MULTIMEDIA = 2; 

const ESCRITORIO_IMAGES = [
  require('../../../../public/imagenes_escritorio/Escritorio1.png'),
  require('../../../../public/imagenes_escritorio/Escritorio2.png'),
  require('../../../../public/imagenes_escritorio/Escritorio3.png'),
];

export default function Equipo_Mesa({ navigation }: any) {
  const [subcatInfo, setSubcatInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState('computo');
  const [equiposDisponibles, setEquiposDisponibles] = useState(0);
  const [equiposActivos, setEquiposActivos] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const [form, setForm] = useState({
    fecha_ini: '',
    hora_ini: '',
    fecha_fn: '',
    hora_fn: '',
    ambient: '',
    num_ficha: '',
    id_subcategoria: '',
    cantidad: 1,
  });

  const [showTimePicker, setShowTimePicker] = useState<string | null>(null);
  const [pickerTime, setPickerTime] = useState<Date>(new Date());

  // --- HELPERS ---
  const getCurrentDate = () => {
    const d = new Date();
    // Asegurarse de que sea la fecha de hoy, sin sumar días
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

  // Determinar el nombre de la categoría para la UI
  const getCategoriaNombre = () => {
    return categoriaFiltro === 'computo' ? 'Cómputo' : 'Multimedia';
  };
  
  // Determinar el ID de la categoría para el DTO
  const getCategoriaId = () => {
    return categoriaFiltro === 'computo' ? ID_CATEGORIA_COMPUTO : ID_CATEGORIA_MULTIMEDIA;
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

  useEffect(() => {
    loadElementos();
  }, [categoriaFiltro]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % ESCRITORIO_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadElementos = async () => {
    try {
      setIsLoading(true);
      const response = await elementosService.getAll();
      const data = response.data || [];
      const subCatgFiltroNombre = categoriaFiltro === 'computo' ? 'Equipo de mesa' : 'Equipo de edición';
      
      const filtrados = data.filter((item: any) => item.sub_catg === subCatgFiltroNombre);
      const activos = filtrados.filter((item: any) => item.est === 1);
      
      setEquiposDisponibles(activos.length);
      setEquiposActivos(activos);
      
      if (filtrados.length > 0) {
        const primerElemento = filtrados[0];
        setSubcatInfo({
          nombre: subCatgFiltroNombre,
          observacion: primerElemento.obse || '',
          especificaciones: (primerElemento.componen || '')
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0),
        });
      } else {
        setSubcatInfo(null);
      }
    } catch (error) {
      console.error('Error al cargar elementos:', error);
      Alert.alert('Error', 'No se pudieron cargar los elementos');
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNCIÓN DE ENVÍO CON ID DE CATEGORÍA ---
  const handleSubmitSolicitud = async () => {
    if (equiposActivos.length === 0) {
      Alert.alert('Error', 'No hay equipos disponibles para solicitar.');
      return;
    }
    if (form.cantidad < 1 || form.cantidad > 3) {
      Alert.alert('Error', 'Solo puedes solicitar entre 1 y 3 equipos.');
      return;
    }
    if (!form.fecha_ini || !form.hora_ini || !form.fecha_fn || !form.hora_fn || !form.ambient || !form.num_ficha) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    // Validar que la hora fin sea posterior a la hora de inicio
    const inicio = new Date(`${form.fecha_ini}T${form.hora_ini}:00`);
    const fin = new Date(`${form.fecha_fn}T${form.hora_fn}:00`);
    if (fin <= inicio) {
      Alert.alert('Hora incorrecta', 'Seleccione una hora de fin posterior a la hora de inicio.');
      return;
    }

    try {
      const idCategoriaNumerico = getCategoriaId();
      // Tomamos el primer equipo activo para obtener el id_subcategoria
      const primerEquipo = equiposActivos[0];
      const idSubcategoria = primerEquipo?.id_subcat || primerEquipo?.id_subcategoria;

      const dto = {
        fecha_ini: `${form.fecha_ini}T${form.hora_ini}:00`,
        fecha_fn: `${form.fecha_fn}T${form.hora_fn}:00`,
        ambient: form.ambient,
        num_fich: form.num_ficha,
        ids_elem: equiposActivos.slice(0, form.cantidad).map(eq => eq.id), // array de IDs de elementos
        id_categoria: idCategoriaNumerico, // ID numérico de la categoría
        id_subcategoria: idSubcategoria, // ID numérico de la subcategoría
        id_usu: ID_USUARIO,
        id_estado_soli: ESTADO_SOLI_INICIAL, // nombre correcto según backend
      };

      await solicitudesService.create(dto);

      Alert.alert('Solicitud enviada', 'La solicitud se ha enviado correctamente ✅');
      setModalVisible(false);
      setForm({ 
        fecha_ini: '', 
        hora_ini: '', 
        fecha_fn: '', 
        hora_fn: '', 
        ambient: '', 
        num_ficha: '', 
        id_subcategoria: '', 
        cantidad: 1 
      });

    } catch (err: any) {
      console.error("Error en la solicitud:", err);
      Alert.alert('Error', `No se pudo enviar la solicitud: ${err?.message || 'Error desconocido'}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithDrawer navigation={navigation} title="Equipos de Escritorio" />
      
      <ScrollView style={styles.content}>
        {/* Toggle de categorías */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                categoriaFiltro === 'computo' && styles.toggleButtonActive,
              ]}
              onPress={() => setCategoriaFiltro('computo')}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  categoriaFiltro === 'computo' && styles.toggleButtonTextActive,
                ]}
              >
                Cómputo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                categoriaFiltro === 'multimedia' && styles.toggleButtonActive,
              ]}
              onPress={() => setCategoriaFiltro('multimedia')}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  categoriaFiltro === 'multimedia' && styles.toggleButtonTextActive,
                ]}
              >
                Multimedia
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {subcatInfo ? (
          <View style={styles.card}>
            {/* ... Header, Contador, Carrusel, Descripción ... */}
            <View style={styles.cardHeader}>
              <Text style={styles.title}>💻 {subcatInfo.nombre}</Text>
              <Text style={styles.subtitle}>
                Visualiza aquí los detalles generales de los equipos disponibles
              </Text>
            </View>

            <View style={styles.counterContainer}>
              <Text style={styles.counterText}>
                <Text style={styles.availableDot}>● </Text> 
                {equiposDisponibles} disponibles
              </Text>
            </View>
            <View style={styles.carouselContainer}>
              <Image
                source={ESCRITORIO_IMAGES[currentImageIndex]}
                style={styles.carouselImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.descripcionContainer}>
              <Text style={styles.sectionTitle}>📋 Descripción general</Text>
              <View style={styles.descripcionTextContainer}>
                <Text style={styles.descripcionText}>
                  {subcatInfo.observacion || 'Sin observaciones disponibles.'}
                </Text>
              </View>
            </View>

            <View style={styles.especificacionesContainer}>
              <Text style={styles.sectionTitle}>  Componentes principales</Text>
              <View style={styles.listaContainer}>
                {subcatInfo.especificaciones.map((esp: string, i: number) => (
                  <Text key={i} style={styles.listaItem}>
                    <Text style={styles.listItemDot}>• </Text>
                    {esp}
                  </Text>
                ))}
              </View>
            </View>

            {/* Botón Abrir Modal */}
            <TouchableOpacity 
              style={[styles.submitButton, equiposDisponibles === 0 && styles.submitButtonDisabled]}
              disabled={equiposDisponibles === 0}
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
                {/* ScrollView añadido para evitar overflow en pantallas pequeñas */}
                <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}> 
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Solicitud de Equipo</Text>
                        
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

                        <Text style={styles.modalText}>Cantidad (Máx 3)</Text>
                        <TextInput
                          style={styles.modalInput}
                          placeholder="1"
                          value={String(form.cantidad)}
                          keyboardType="numeric"
                          onChangeText={v => {
                            const num = parseInt(v) || 0;
                            if (v === '') { setForm(f => ({ ...f, cantidad: 0 })); } 
                            else { let val = Math.max(1, Math.min(3, num)); setForm(f => ({ ...f, cantidad: val })); }
                          }}
                        />

                        <Text style={styles.modalText}>Ambiente</Text>
                        <TextInput style={styles.modalInput} placeholder="Ej: Ambiente 301" value={form.ambient} onChangeText={v => setForm(f => ({ ...f, ambient: v }))} />

                        <Text style={styles.modalText}>Número de ficha</Text>
                        <TextInput 
                          style={styles.modalInput} 
                          placeholder="Ej: 2560014" 
                          value={form.num_ficha} 
                          onChangeText={v => setForm(f => ({ ...f, num_ficha: v }))} 
                          keyboardType="numeric"
                        />
                        <Text style={styles.modalText}>Categoría</Text>
                        <Text style={[styles.modalInput, { backgroundColor: '#e3f2fd', color: '#0d47a1', fontWeight: 'bold' }]}> 
                          {getCategoriaNombre()}
                        </Text>

                        <Text style={styles.modalText}>Subcategoría</Text>
                        <Text style={[styles.modalInput, { backgroundColor: '#f5f5f5', color: '#555' }]}>
                          {subcatInfo?.nombre}
                        </Text>

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
        ) : (
          <View style={styles.card}>
            <Text style={styles.noDataText}>
              {isLoading ? 'Cargando información...' : 'No hay datos disponibles.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}