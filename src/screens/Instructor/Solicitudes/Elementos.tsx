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
import { SafeAreaView } from 'react-native-safe-area-context';
import { elementosService, solicitudesService, subcategoriasService, authService } from '../../../services/Api';
import HeaderWithDrawer from '../Header/Header';
import { styles } from '../../../styles/Instructor/Solicitudes/Elementos';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

const ELEMENTOS_IMAGES = [
  require('../../../../public/Elementos/CableInternet.png'),
  require('../../../../public/Elementos/destornillador.png'),
  require('../../../../public/Elementos/Mouse.png'),
  require('../../../../public/Elementos/Teclaado.png'),
];

export default function Elementos({ navigation }: any) {
  const [equiposDisponibles, setEquiposDisponibles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

      const [subcategorias, setSubcategorias] = useState<any[]>([]);
      const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<number | null>(null);
  const handleSubmitSolicitud = async () => {
    
    const usuario = await authService.getCurrentUser();
    if (!usuario) {
      Alert.alert('Error', 'Debes iniciar sesión para enviar solicitudes.');
      return;
    }
    const roles = usuario.roles || usuario.authorities || [];
    const tienePermiso = roles.some((r: any) => {
      const nombre = r.authority || r;
      return (
        nombre === 'Administrador' ||
        nombre === 'ADMINISTRADOR' ||
        nombre === 'Tecnico' ||
        nombre === 'TECNICO' ||
        nombre === 'Instructor' ||
        nombre === 'INSTRUCTOR'
      );
    });
    if (!tienePermiso) {
      Alert.alert('Error', 'No tienes permisos para enviar solicitudes.');
      return;
    }
    if (equiposDisponibles === 0) {
      Alert.alert('Error', 'No hay elementos disponibles para solicitar.');
      return;
    }
    if (form.cantidad < 1 || form.cantidad > 10) {
      Alert.alert('Error', 'Solo puedes solicitar entre 1 y 10 elementos.');
      return;
    }
    if (!form.fecha_ini || !form.hora_ini || !form.fecha_fn || !form.hora_fn || !form.ambient || !form.num_ficha) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    
    const inicio = new Date(`${form.fecha_ini}T${form.hora_ini}:00`);
    const fin = new Date(`${form.fecha_fn}T${form.hora_fn}:00`);
    if (fin <= inicio) {
      Alert.alert('Hora incorrecta', 'Seleccione una hora de fin posterior a la hora de inicio.');
      return;
    }
    try {
      
      const idsElem: number[] = [];
      const dto = {
        fecha_ini: `${form.fecha_ini}T${form.hora_ini}:00`,
        fecha_fn: `${form.fecha_fn}T${form.hora_fn}:00`,
        ambient: form.ambient,
        num_fich: Number(form.num_ficha),
        cantid: Number(form.cantidad),
        ids_elem: idsElem,
        id_categoria: 1, 
        id_subcategoria: subcategoriaSeleccionada,
        id_usu: usuario.id || 1, 
        id_estado_soli: 1, 
      };
      console.log('Solicitudes DTO Elementos:', dto);
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
        cantidad: 1 
      });
    } catch (err: any) {
      console.error("Error en la solicitud:", err);
      if (err.response && err.response.data) {
        console.log('Detalle error backend:', err.response.data);
        Alert.alert('Error', `No se pudo enviar la solicitud: ${err.response.data.error || JSON.stringify(err.response.data)}`);
      } else {
        Alert.alert('Error', `No se pudo enviar la solicitud: ${err?.message || 'Error desconocido'}`);
      }
    }
  };

  useEffect(() => {
    loadElementos();
  }, []);

  useEffect(() => {
    
    const cargarSubcategorias = async () => {
      try {
        const resp = await subcategoriasService.getAll();
        console.log('Respuesta subcategorias:', resp.data); 
        const data = resp.data || [];
        setSubcategorias(data); 
        if (data.length > 0) setSubcategoriaSeleccionada(data[0].id_subcategoria);
      } catch (err) {
        console.error('Error cargando subcategorías:', err);
      }
    };
    cargarSubcategorias();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % ELEMENTOS_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadElementos = async () => {
    try {
      setIsLoading(true);
      const response = await elementosService.getAll();
      const data = response.data || [];
      
      const subcategoriasExcluir = ['Equipo de edicion', 'Portátil de edicion', 'Equipo de mesa', 'Portátil'];
      const elementosGenerales = data.filter(
        (item: any) =>
          item.tip_catg &&
          item.tip_catg.toLowerCase().trim() !== 'multimedia' &&
          (!item.sub_catg || !subcategoriasExcluir.includes(item.sub_catg))
      );
      
      const activos = elementosGenerales.filter((item: any) => item.est === 1);
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
      <HeaderWithDrawer navigation={navigation} title="Elementos" />
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>🔧 Equipos Generales</Text>
            <Text style={styles.subtitle}>
              Visualiza aquí los detalles generales de todos los equipos disponibles
            </Text>
          </View>

          <View style={styles.carouselContainer}>
            <Image
              source={ELEMENTOS_IMAGES[currentImageIndex]}
              style={styles.carouselImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.descripcionContainer}>
            <Text style={styles.sectionTitle}>📦 Equipos y Recursos Generales</Text>
            <View style={styles.descripcionTextContainer}>
              <Text style={styles.descripcionText}>
                En este apartado encontrarás todos los elementos y accesorios disponibles del Centro,
                abarcando diferentes categorías y subcategorías. Aquí podrás solicitar elementos de 
                distintas áreas según las necesidades de tu proyecto o actividad académica.
              </Text>
            </View>
          </View>

          <View style={styles.especificacionesContainer}>
            <Text style={styles.sectionTitle}>  ¿Qué encontrarás en esta categoría?</Text>
            <View style={styles.listaContainer}>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Equipos de diferentes categorías del Centro</Text>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Herramientas para múltiples propósitos académicos</Text>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Accesorios complementarios</Text>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Elementos para desarrollo de proyectos</Text>
            </View>
          </View>

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

          
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Solicitud Elemento</Text>
                  <Text style={styles.modalText}>Fecha inicio</Text>
                  <TextInput style={styles.modalInput} value={form.fecha_ini} editable={false} />
                  <Text style={styles.modalText}>Hora inicio</Text>
                  <TouchableOpacity onPress={() => { setShowTimePicker('hora_ini'); setPickerTime(new Date()); }}>
                    <View pointerEvents="none">
                      <TextInput style={styles.modalInput} placeholder="HH:MM AM/PM" value={formatTo12Hour(form.hora_ini)} editable={false} />
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.modalText}>Fecha fin</Text>
                  <TextInput style={styles.modalInput} value={form.fecha_fn} editable={false} />
                  <Text style={styles.modalText}>Hora fin</Text>
                  <TouchableOpacity onPress={() => { setShowTimePicker('hora_fn'); setPickerTime(new Date()); }}>
                    <View pointerEvents="none">
                      <TextInput style={styles.modalInput} placeholder="HH:MM AM/PM" value={formatTo12Hour(form.hora_fn)} editable={false} />
                    </View>
                  </TouchableOpacity>
                  {showTimePicker && (
                    <DateTimePicker value={pickerTime} mode="time" is24Hour={false} display="default" onChange={handleTimeChange} />
                  )}
                  <Text style={styles.modalText}>Cantidad (Máx 10)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="1"
                    value={String(form.cantidad)}
                    keyboardType="numeric"
                    onChangeText={(v: string) => {
                      const num = parseInt(v) || 0;
                      if (v === '') { setForm(f => ({ ...f, cantidad: 0 })); } 
                      else { let val = Math.max(1, Math.min(10, num)); setForm(f => ({ ...f, cantidad: val })); }
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
                  <Text style={[styles.modalInput, { backgroundColor: '#e3f2fd', color: '#0d47a1', fontWeight: 'bold'}]}>Computo</Text>
                  <Text style={styles.modalText}>Subcategoría</Text>
                  <View style={{ width: '100%', marginBottom: 10, borderBlockColor: '#ccc', borderWidth: 1}}>
                    <Picker
                      selectedValue={subcategoriaSeleccionada}
                      onValueChange={(itemValue) => setSubcategoriaSeleccionada(itemValue)}
                      style={[styles.pickerInput]}
                    >
                      {subcategorias.map(subcat => (
                        <Picker.Item
                          key={subcat.id}
                          label={subcat.nom_subcateg}
                          value={subcat.id}
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