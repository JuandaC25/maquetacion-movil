
import React, { useState, useEffect } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Modal, TextInput, Button } from 'react-native';
import { styles } from '../../../styles/Instructor/Solicitudes/Portatiles';

const { width } = Dimensions.get('window');

const PORTATILES_IMAGES = [
  require('../../../../public/imagenes_port/portatil1.png'),
  require('../../../../public/imagenes_port/portatil2.png'),
  require('../../../../public/imagenes_port/portatil3.png'),
  require('../../../../public/imagenes_port/portatil4.png'),
  require('../../../../public/imagenes_port/portatil5.png'),
  require('../../../../public/imagenes_port/portatil6.png'),
];

export default function Portatiles({ navigation }: any) {
    // Estados principales
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
    const [portatilesActivos, setPortatilesActivos] = useState<any[]>([]);
    const [subcatInfo, setSubcatInfo] = useState<any>(null);
    const [equiposDisponibles, setEquiposDisponibles] = useState(0);
    const [categoriaFiltro, setCategoriaFiltro] = useState<'computo' | 'multimedia'>('computo');
    const [portatilInfo, setPortatilInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    // Cargar portátiles activos y subcategoría
    const loadElementos = async () => {
      try {
        setIsLoading(true);
        const response = await elementosService.getAll();
        const data = response.data || [];
        const filtrados = data.filter((item: any) => {
          if (!item.sub_catg) return false;
          const subcat = item.sub_catg.trim().toLowerCase();
          if (categoriaFiltro === 'computo') {
            return subcat === 'portatil';
          } else {
            return subcat === 'portatil de edición';
          }
        });
        const activos = filtrados.filter((item: any) => item.est === 1);
        setEquiposDisponibles(activos.length);
        setPortatilesActivos(activos);
        if (filtrados.length > 0) {
          const primerElemento = filtrados[0];
          setPortatilInfo({
            nombre: primerElemento.sub_catg || '',
            observacion: primerElemento.obse || '',
            especificaciones: (primerElemento.componen || '')
              .split(',')
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0),
            id_subcat: primerElemento.id_subcat || primerElemento.id_subcategoria,
          });
        } else {
          setPortatilInfo(null);
        }
      } catch (error) {
        console.error('Error al cargar elementos:', error);
        Alert.alert('Error', 'No se pudieron cargar los elementos');
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      loadElementos();
    }, [categoriaFiltro]);
    // Envío de solicitud
    const handleSubmitSolicitud = async () => {
      if (equiposDisponibles === 0) {
        Alert.alert('Error', 'No hay portátiles disponibles para solicitar.');
        return;
      }
      if (form.cantidad < 1 || form.cantidad > 3) {
        Alert.alert('Error', 'Solo puedes solicitar entre 1 y 3 portátiles.');
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
        // Tomamos el primer portátil activo para obtener el id_subcategoria
        const primerEquipo = portatilesActivos[0];
        const idSubcategoria = primerEquipo?.id_subcat || primerEquipo?.id_subcategoria;
        const idsElem = portatilesActivos.slice(0, form.cantidad).map(eq => eq.id);
        const dto = {
          fecha_ini: `${form.fecha_ini}T${form.hora_ini}:00`,
          fecha_fn: `${form.fecha_fn}T${form.hora_fn}:00`,
          ambient: form.ambient,
          num_fich: Number(form.num_ficha),
          cantid: Number(form.cantidad),
          ids_elem: idsElem,
          id_categoria: categoriaFiltro === 'computo' ? 1 : 2,
          id_subcategoria: Number(idSubcategoria),
          id_usu: 1, // Ajusta según tu lógica de usuario
          id_estado_soli: 1, // Ajusta según tu backend
        };
        console.log('Solicitudes DTO:', dto);
        console.log('IDs enviados en ids_elem:', idsElem);
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
        Alert.alert('Error', `No se pudo enviar la solicitud: ${err?.message || 'Error desconocido'}`);
      }
    };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithDrawer navigation={navigation} title="Portátiles" />
      <ScrollView style={styles.content}>
        {/* Toggle de categorías */}
        <View style={styles.filterContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                categoriaFiltro === 'computo' && styles.filterButtonActive,
              ]}
              onPress={() => setCategoriaFiltro('computo')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  categoriaFiltro === 'computo' && styles.filterButtonTextActive,
                ]}
              >
                Computo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                categoriaFiltro === 'multimedia' && styles.filterButtonActive,
              ]}
              onPress={() => setCategoriaFiltro('multimedia')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  categoriaFiltro === 'multimedia' && styles.filterButtonTextActive,
                ]}
              >
                Multimedia
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {portatilInfo ? (
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.title}>🖥️ {portatilInfo.nombre}</Text>
              <Text style={styles.subtitle}>
                Visualiza aquí los detalles generales de los portátiles disponibles
              </Text>
            </View>

            {/* Badge de disponibles igual que Elementos */}
            <View style={styles.counterContainer}>
              <Text style={styles.counterText}>
                <Text style={{fontWeight: 'bold', color: '#4caf50', fontSize: 14}}>● </Text>
                {equiposDisponibles} disponibles
              </Text>
            </View>

            {/* Carrusel de imágenes */}
            <View style={styles.carouselContainer}>
              <Image
                source={PORTATILES_IMAGES[currentImageIndex]}
                style={styles.carouselImage}
                resizeMode="contain"
              />
            </View>

            {/* Descripción */}
            <View style={styles.descripcionContainer}>
              <Text style={styles.sectionTitle}>📋 Descripción general</Text>
              <View style={styles.descripcionTextContainer}>
                <Text style={styles.descripcionText}>
                  {portatilInfo.observacion || 'Sin observaciones disponibles.'}
                </Text>
              </View>
            </View>

            {/* Especificaciones */}
            <View style={styles.especificacionesContainer}>
              <Text style={styles.sectionTitle}>  Componentes principales</Text>
              <View style={styles.listaContainer}>
                {portatilInfo.especificaciones.map((esp: string, i: number) => (
                  <Text key={i} style={styles.listaItem}>
                    <Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>
                    {esp}
                  </Text>
                ))}
              </View>
            </View>

            {/* Botón de solicitud */}
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
                <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Solicitud de Portátil</Text>
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
                      {categoriaFiltro === 'computo' ? 'Computo' : 'Multimedia'}
                    </Text>
                    <Text style={styles.modalText}>Subcategoría</Text>
                    <Text style={[styles.modalInput, { backgroundColor: '#e3f2fd', color: '#0d47a1' }]}> 
                      {portatilInfo?.nombre}
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