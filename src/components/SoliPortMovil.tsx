import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { elementosService, subcategoriasService, solicitudesService } from '../services/Api';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Alert, TextInput, Modal, Platform} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

// --- INTERFACES ---
interface Equipo {
  id: number;
  nombre: string;
  marca: string;
  disponible: boolean;
  descripcion?: string;
  componentes?: string[];
  categoria?: string;
  tipo?: string;
  tipo_categoria?: string;
}

interface SolicitudForm {
  fecha_ini: string;
  hora_ini: string;
  fecha_fn: string;
  hora_fn: string;
  ambient: string;
  num_ficha: string;
  id_subcategoria: string | number;
}

// Tipos para los targets del Picker
type PickerTargetKey = 'fecha_ini' | 'fecha_fn' | 'hora_ini' | 'hora_fn';


// Función para obtener la hora actual en formato HH:MM
const getCurrentTime = () => {
    return new Date().toTimeString().split(' ')[0].substring(0, 5);
}

// Función para obtener la fecha actual en formato YYYY-MM-DD
const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
}



const SoliPortMovil = forwardRef((props, ref) => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoria, setCategoria] = useState<'computo' | 'multimedia'>('computo');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para categorías y subcategorías
  const [categorias, setCategorias] = useState<any[]>([]);
  const [subcategorias, setSubcategorias] = useState<any[]>([]);
  const [elementosPorSubcategoria, setElementosPorSubcategoria] = useState<Equipo[]>([]);

  // Estados para el control de DatePickers
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const [currentPickerTarget, setCurrentPickerTarget] = useState<PickerTargetKey | null>(null);

  const USER_ID = 1; // Temporal, deberías obtenerlo del contexto de autenticación

  const initialFormState: SolicitudForm = {
    fecha_ini: getCurrentDate(),
    hora_ini: getCurrentTime(),
    fecha_fn: getCurrentDate(),
    hora_fn: "",
    ambient: "",
    num_ficha: "",
    id_subcategoria: "",
  };

  const [form, setForm] = useState<SolicitudForm>(initialFormState);  const fetchEquipos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await elementosService.getAll();
      const data = response.data || [];
      const categoriaPrincipal = categoria === 'computo' ? 'Computo' : 'Multimedia';
      const filtrados = data.filter((el: Equipo) => {
        const esPortatil = el.categoria === 'Portátil' || el.tipo === 'portatil'; 
        const esDeCategoria = el.categoria === categoriaPrincipal || el.tipo_categoria === categoriaPrincipal; 
        return esPortatil && esDeCategoria;
      });
      setEquipos(filtrados);
    } catch (err) {
      console.error('Error al cargar los equipos:', err);
      setError('Error al cargar los equipos. Verifica la conexión o la URL.');
    }
    setLoading(false);
  }, [categoria]);

  // Obtener subcategorías reales del backend
  const fetchSubcategorias = useCallback(async () => {
    try {
      const response = await subcategoriasService.getAll();
      setSubcategorias(response.data || []);
    } catch (err) {
      setSubcategorias([]);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    refreshEquipos: fetchEquipos
  }));

  useEffect(() => {
    fetchEquipos();
    fetchSubcategorias();
  }, [categoria, fetchEquipos, fetchSubcategorias]);

  // --- Manejadores de Fecha y Hora (NUEVO) ---
  const handleConfirmDateTime = (date: Date) => {
    // Maneja la confirmación de cualquiera de los tres pickers
    if (currentPickerTarget === 'fecha_ini') {
      setForm(f => ({ ...f, fecha_ini: date.toISOString().split('T')[0] }));
    } else if (currentPickerTarget === 'fecha_fn') {
      setForm(f => ({ ...f, fecha_fn: date.toISOString().split('T')[0] }));
    } else if (currentPickerTarget === 'hora_ini') {
      setForm(f => ({ ...f, hora_ini: date.toTimeString().split(' ')[0].substring(0, 5) }));
    } else if (currentPickerTarget === 'hora_fn') {
      setForm(f => ({ ...f, hora_fn: date.toTimeString().split(' ')[0].substring(0, 5) }));
    }
    
    // Ocultar todos los pickers después de confirmar
    setDatePickerVisibility(false);
    setTimePickerVisibility(false);
    setEndTimePickerVisibility(false);
    setCurrentPickerTarget(null);
  };
  
  const showPicker = (target: PickerTargetKey) => {
    setCurrentPickerTarget(target);

    // Lógica para mostrar el picker correcto (Fecha, Hora Inicio, Hora Fin)
    if (target.startsWith('fecha')) {
        setDatePickerVisibility(true); // Se usa DatePickerModal en modo 'date'
    } else if (target === 'hora_ini') {
        setTimePickerVisibility(true); // Se usa TimePickerModal en modo 'time'
    } else if (target === 'hora_fn') {
        setEndTimePickerVisibility(true); // Se usa TimePickerModal en modo 'time' (simulando el reloj)
    }
  };

  const hidePicker = () => {
    setDatePickerVisibility(false);
    setTimePickerVisibility(false);
    setEndTimePickerVisibility(false);
    setCurrentPickerTarget(null);
  };
  // ------------------------------------------

  // Manejador para abrir el modal, asegurando que las fechas de fin tengan valores iniciales lógicos
  const handleAbrirModalSolicitud = () => {
    setForm(f => {
        // Si la fecha/hora de fin no están seteadas, las inicializamos
        let newForm = f;
        if (!f.fecha_fn) {
            newForm = { ...newForm, fecha_fn: f.fecha_ini };
        }
        if (!f.hora_fn) {
            // Inicializamos la hora final 1 hora después de la inicial (simulación)
            const now = new Date();
            const [h, m] = f.hora_ini.split(':').map(Number);
            now.setHours(h + 1, m, 0, 0);
            newForm = { ...newForm, hora_fn: now.toTimeString().split(' ')[0].substring(0, 5) };
        }
        // Asegurar que el picker de subcategoría tiene un valor predeterminado si no hay
        if (!newForm.id_subcategoria && subcategorias.length > 0) {
             newForm = { ...newForm, id_subcategoria: subcategorias[0].valor };
        }
        return newForm;
    });
    setIsModalVisible(true);
  };

  // Manejador de la solicitud formal
  const handleEnviarSolicitud = async () => {
    if (!form.fecha_ini || !form.hora_ini || !form.fecha_fn || !form.hora_fn || !form.ambient || !form.num_ficha || !form.id_subcategoria) {
      Alert.alert('Error', 'Por favor, completa todos los campos de la solicitud.');
      return;
    }
    try {
      await solicitudesService.create(form);
      Alert.alert('Solicitud enviada', 'La solicitud se ha enviado correctamente.');
      setIsModalVisible(false);
    } catch (err) {
      Alert.alert('Error', 'No se pudo enviar la solicitud.');
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#007bff" style={styles.loading} />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  const datosGenerales: Equipo = equipos[0] || {} as Equipo; 

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Selector de Categoría */}
      <View style={styles.categoriaSwitchContainer}>
        <TouchableOpacity
          style={[styles.switchButton, categoria === 'computo' && styles.switchButtonActive]}
          onPress={() => setCategoria('computo')}
        >
          <Text style={[styles.switchButtonText, categoria === 'computo' && styles.switchButtonTextActive]}>Cómputo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchButton, categoria === 'multimedia' && styles.switchButtonActive]}
          onPress={() => setCategoria('multimedia')}
        >
          <Text style={[styles.switchButtonText, categoria === 'multimedia' && styles.switchButtonTextActive]}>Multimedia</Text>
        </TouchableOpacity>
      </View>

      {/* Sección de Visualización de Equipos */}
      <View style={styles.cuadroGeneral}>
        <View style={styles.tituloEquiposRow}>
          <Text style={styles.tituloCuadro}>{categoria === 'computo' ? 'Portátiles' : 'Portátil de Edición'}</Text>
          <Text style={styles.equiposDisponiblesVerde}>Equipos: {equipos.filter((e: Equipo) => e.disponible).length}</Text>
        </View>
        <Text style={styles.subtituloCuadro}>Visualiza aquí los detalles generales de los portátiles disponibles</Text>

        <View style={styles.detallesRecuadro}>
          <Text style={styles.descripcion}>{datosGenerales.descripcion ? datosGenerales.descripcion : <Text>Sin observaciones disponibles.</Text>}</Text>
        </View>

        <Text style={styles.seccionTitulo}>Componentes principales</Text>
        <View style={styles.listaComponentes}>
          {(datosGenerales.componentes || ['Sin especificaciones']).map((comp, i) => (
            <Text key={i} style={styles.componenteItem}>{`• ${comp}`}</Text>
          ))}
        </View>

        <TouchableOpacity
          style={styles.botonSolicitar}
          onPress={handleAbrirModalSolicitud}
        >
          <Text style={styles.botonSolicitarTexto}>Realizar solicitud</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DEL FORMULARIO DE SOLICITUD */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.tituloCuadro}>📅 Realizar Solicitud de Portátil</Text>

            {/* INPUT DE SUBCATEGORÍA (DROPDOWN / PICKER) */}
            <Text style={[styles.label, { marginBottom: 8 }]}>Subcategoría *</Text>
            <View style={[styles.pickerContainer, { marginBottom: 10 }]}> 
              <Picker
                selectedValue={form.id_subcategoria}
                onValueChange={(itemValue) => setForm(f => ({ ...f, id_subcategoria: itemValue }))}
                style={[styles.picker, { minHeight: 60, height: 60 }]}
              >
                <Picker.Item label="Selecciona una subcategoría" value="" />
                {Array.isArray(subcategorias) && subcategorias.length > 0 && subcategorias.map(sub => (
                  <Picker.Item key={sub.id || sub._id} label={sub.nom_subcateg || 'Sin nombre'} value={sub.id || sub._id} />
                ))}
              </Picker>
            </View>
            {/* SUBE el texto de ambiente para que no quede tan abajo */}
            <Text style={[styles.label, { marginTop: 0 }]}>Descripción del Ambiente (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Sala de reuniones piso 3"
              value={form.ambient}
              onChangeText={v => setForm(f => ({ ...f, ambient: v }))}
            />

            {/* SELECTORES DE FECHA Y HORA */}
            <View style={styles.dateTimeRow}>
              {/* Fecha Inicio */}
              <TouchableOpacity style={styles.dateInputButton} onPress={() => showPicker('fecha_ini')}>
                <Text style={styles.label}>Fecha Inicio (Hoy)</Text>
                <Text style={styles.dateText}>{form.fecha_ini ? form.fecha_ini : 'Seleccionar Fecha'}</Text>
              </TouchableOpacity>

              {/* Hora Inicio */}
              <TouchableOpacity style={styles.dateInputButton} onPress={() => showPicker('hora_ini')}>
                <Text style={styles.label}>Hora Inicio (Actual)</Text>
                <Text style={styles.dateText}>{form.hora_ini ? form.hora_ini : 'Seleccionar Hora'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateTimeRow}>
              {/* Fecha Fin */}
              <TouchableOpacity style={styles.dateInputButton} onPress={() => showPicker('fecha_fn')}>
                <Text style={styles.label}>Fecha Fin</Text>
                <Text style={styles.dateText}>{form.fecha_fn ? form.fecha_fn : 'Seleccionar Fecha'}</Text>
              </TouchableOpacity>

              {/* Hora Fin */}
              <TouchableOpacity style={styles.dateInputButton} onPress={() => showPicker('hora_fn')}>
                <Text style={styles.label}>Hora Fin (Reloj)</Text>
                <Text style={styles.dateText}>{form.hora_fn ? form.hora_fn : 'Seleccionar Hora'}</Text>
              </TouchableOpacity>
            </View>

            {/* INPUT DE NÚMERO DE FICHA */}
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Número de ficha"
              value={form.num_ficha}
              onChangeText={v => setForm(f => ({ ...f, num_ficha: v }))}
            />

            {/* Botones de Acción */}
            <TouchableOpacity
              style={styles.botonEnviar}
              onPress={handleEnviarSolicitud}
            >
              <Text style={styles.botonSolicitarTexto}>Enviar Solicitud</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botonCerrar, { backgroundColor: '#dc3545' }]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.botonSolicitarTexto}>Cerrar</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* SELECTORES DE FECHA/HORA OCULTOS */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDateTime}
        onCancel={hidePicker}
        minimumDate={new Date()}
      />
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        is24Hour={true}
        onConfirm={handleConfirmDateTime}
        onCancel={hidePicker}
      />
      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode="time"
        is24Hour={true}
        onConfirm={handleConfirmDateTime}
        onCancel={hidePicker}
      />
    </ScrollView>
  );
});

// 📏 Estilos de la Aplicación 
const styles = StyleSheet.create({
    // ... (Mantener estilos existentes)
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center', padding: 20 },
    scrollContent: { padding: 16, alignItems: 'center', minHeight: '100%' },
    cuadroGeneral: {
        width: '100%', backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, marginBottom: 24,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2, shadowRadius: 1.41, alignItems: 'center',
    },
    categoriaSwitchContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16, width: '100%' },
    switchButton: { paddingVertical: 8, paddingHorizontal: 24, borderRadius: 6, backgroundColor: '#e0e0e0', marginHorizontal: 8 },
    switchButtonActive: { backgroundColor: '#007bff' },
    switchButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
    switchButtonTextActive: { color: '#fff' },
    tituloEquiposRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 4 },
    tituloCuadro: { fontSize: 20, fontWeight: 'bold', textAlign: 'left', color: '#333' },
    equiposDisponiblesVerde: { fontSize: 15, color: '#2ecc71', fontWeight: 'bold', marginLeft: 8 },
    detallesRecuadro: {
        width: '100%', backgroundColor: '#eafaf1', borderRadius: 8, padding: 10, marginBottom: 10,
        borderWidth: 1, borderColor: '#2ecc71',
    },
    subtituloCuadro: { fontSize: 14, color: '#555', marginBottom: 10, textAlign: 'center' },
    descripcion: { fontSize: 15, textAlign: 'center' },
    seccionTitulo: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 4, alignSelf: 'flex-start', color: '#333' },
    listaComponentes: { width: '100%', marginBottom: 10 },
    componenteItem: { fontSize: 14, color: '#333', marginLeft: 8 },
    botonSolicitar: {
        backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 6,
        alignItems: 'center', marginTop: 8, width: '100%',
    },
    botonSolicitarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    input: {
        width: '100%', height: 44, backgroundColor: '#fff', borderRadius: 6, paddingHorizontal: 10,
        marginBottom: 10, borderWidth: 1, borderColor: '#ccc',
    },
    label: { alignSelf: 'flex-start', fontWeight: 'bold', marginBottom: 4, marginTop: 8, width: '100%' },
    centeredView: {
        flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    },
    modalView: {
        margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
        width: '90%', maxHeight: '90%', 
    },
    botonEnviar: {
        backgroundColor: '#2ecc71', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 6,
        alignItems: 'center', marginTop: 15, width: '100%',
    },
    botonCerrar: {
        backgroundColor: '#dc3545', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 6,
        alignItems: 'center', marginTop: 10, width: '100%',
    },
    // Nuevos estilos para los selectores
    pickerContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 6,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        overflow: 'hidden', 
    },
    picker: {
      width: '100%',
      minHeight: 60,
      height: Platform.OS === 'ios' ? 100 : 60, 
    },
    dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    dateInputButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 6,
        marginHorizontal: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    dateText: {
        fontSize: 16,
        marginTop: 5,
        fontWeight: 'bold',
        color: '#007bff',
    }
});

export { SoliPortMovil };