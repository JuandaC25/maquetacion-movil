import { useTheme } from '../../context/ThemeContext';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, ScrollView, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AdminHeader from './AdminHeader/AdminHeader';
import ReservaEspacioCard, { ReservaEspacio } from './ReservaEspacioCard';
import DatePickerModal from '../../components/DatePickerModal';
import { espaciosService, solicitudesService, authService } from '../../services/Api';

const SolicitudesEspacioAdmin = () => {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const navigation = useNavigation<any>();
  type Espacio = {
    id: number;
    nom_espa: string;
    descripcion?: string;
    imagenes?: string;
    estadoespacio?: number;
  };
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showReservaModal, setShowReservaModal] = useState<boolean>(false);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState<Espacio | null>(null);
  const [reservaForm, setReservaForm] = useState({
    fecha_ini: '',
    fecha_fn: '',
    ambient: '',
    num_ficha: '',
    estadosoli: 1,
    id_usu: null as number | null,
  });

  // Estados para los pickers de fecha/hora
  const [showPicker, setShowPicker] = useState<{field: 'fecha_ini'|'fecha_fn'|null, mode: 'date'|'time', visible: boolean}>({field: null, mode: 'date', visible: false});
  const [tempDate, setTempDate] = useState<Date>(new Date());
  // Helpers para mostrar el picker
  const openPicker = (field: 'fecha_ini'|'fecha_fn', mode: 'date'|'time') => {
    let current = reservaForm[field];
    let d = current && /^\d{4}-\d{2}-\d{2}( |T)\d{2}:\d{2}$/.test(current)
      ? new Date(current.replace(' ', 'T'))
      : new Date();
    setTempDate(d);
    setShowPicker({field, mode, visible: true});
  };
  const onPickerChange = (event: any, date?: Date) => {
    if (date && showPicker.field) {
      let prev = reservaForm[showPicker.field];
      let d = date;
      // Si el modo es 'date', actualiza solo la fecha, conserva la hora previa
      if (showPicker.mode === 'date' && prev && /^\d{4}-\d{2}-\d{2}( |T)\d{2}:\d{2}$/.test(prev)) {
        let prevDate = new Date(prev.replace(' ', 'T'));
        d.setHours(prevDate.getHours(), prevDate.getMinutes());
      }
      // Si el modo es 'time', actualiza solo la hora, conserva la fecha previa
      if (showPicker.mode === 'time' && prev && /^\d{4}-\d{2}-\d{2}( |T)\d{2}:\d{2}$/.test(prev)) {
        let prevDate = new Date(prev.replace(' ', 'T'));
        d.setFullYear(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
      }
      // Formato: YYYY-MM-DD HH:mm
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatted = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setReservaForm(f => ({ ...f, [showPicker.field!]: formatted }));
    }
    setShowPicker({field: null, mode: 'date', visible: false});
  };
  const [usuario, setUsuario] = useState<any>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarUsuarioYEspacios();
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const res = await solicitudesService.getAll();
      console.log('RESPUESTA getAll solicitudes:', res?.data);
      setSolicitudes(res.data as any[] || []);
    } catch (err) {
      setError('No se pudo cargar solicitudes.');
    }
  };

  const cargarUsuarioYEspacios = async () => {
    try {
      const user = await authService.getCurrentUser();
      setUsuario(user);
    } catch {}
    cargarEspacios();
  };

  const cargarEspacios = async () => {
    try {
      setLoading(true);
      const res = await espaciosService.getAll();
      setEspacios(res.data as Espacio[] || []);
    } catch (err) {
      setError('No se pudo cargar espacios. ¿Sesión expirada o sin permisos?');
    } finally {
      setLoading(false);
    }
  };

  const abrirReserva = (espacio: Espacio) => {
    setEspacioSeleccionado(espacio);
    setReservaForm({
      fecha_ini: '',
      fecha_fn: '',
      ambient: '',
      num_ficha: '',
      estadosoli: 1,
      id_usu: usuario?.id || null,
    });
    setShowReservaModal(true);
  };

  // Convierte '2025-12-05 03:50' a '2025-12-05T03:50'
  const toBackendDate = (str: string) => str.replace(' ', 'T');

  const reservarEspacio = async () => {
    if (!espacioSeleccionado || !usuario?.id) return;
    setSaving(true);
    try {
      await solicitudesService.create({
        ...reservaForm,
        fecha_ini: toBackendDate(reservaForm.fecha_ini),
        fecha_fn: toBackendDate(reservaForm.fecha_fn),
        id_esp: espacioSeleccionado.id,
        id_usu: usuario.id,
      });
      setShowReservaModal(false);
      setEspacioSeleccionado(null);
    } catch (err: any) {
      let msg = 'Error al reservar espacio';
      if (err?.response?.data?.message) {
        msg += ': ' + err.response.data.message;
      } else if (err?.response?.data) {
        msg += ': ' + JSON.stringify(err.response.data);
      } else if (err?.message) {
        msg += ': ' + err.message;
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Carrusel y paginación de imágenes como en Instructor
  const [activeSlides, setActiveSlides] = useState<{ [key: number]: number }>({});
  const { width } = Dimensions.get('window');
  const cardWidth = width - 30;
  const renderEspacio = ({ item }: { item: Espacio }) => {
    let imagenes: string[] = [];
    try {
      imagenes = item.imagenes ? JSON.parse(item.imagenes) : [];
    } catch {
      imagenes = [];
    }
    if (imagenes.length === 0) {
      imagenes = ['http://192.168.20.60:8081/imagenes/imagenes_espacios/default.jpg'];
    }
    const currentSlide = activeSlides[item.id] || 0;
    return (
      <View style={{
        borderRadius: 14,
        backgroundColor: colors.background,
        marginBottom: 18,
        alignSelf: 'center',
        width: cardWidth,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
        overflow: 'hidden',
      }}>
        {/* Carrusel de imágenes */}
        <View style={{ width: cardWidth, height: 180, backgroundColor: '#222' }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={e => {
              const contentOffsetX = e.nativeEvent.contentOffset.x;
              const slide = Math.round(contentOffsetX / cardWidth);
              setActiveSlides(prev => ({ ...prev, [item.id]: slide }));
            }}
            scrollEventThrottle={16}
            style={{ width: cardWidth }}
          >
            {imagenes.map((img, idx) => {
              const fullUrl = img.startsWith('http') ? img : `http://192.168.20.60:8081${img}`;
              return (
                <Image
                  key={idx}
                  source={{ uri: fullUrl }}
                  style={{ width: cardWidth, height: 180, resizeMode: 'cover' }}
                />
              );
            })}
          </ScrollView>
          {/* Paginación */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 4, position: 'absolute', bottom: 8, width: '100%' }}>
            {imagenes.map((_, idx) => (
              <View
                key={idx}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 2,
                  backgroundColor: currentSlide === idx ? 'rgb(9,180,26)' : '#555',
                }}
              />
            ))}
          </View>
        </View>
        <View style={{ padding: 16 }}>
          <Text style={{ color: 'rgb(9,180,26)', fontSize: 20, fontWeight: 'bold', marginBottom: 2, textTransform: 'lowercase' }}>{item.nom_espa}</Text>
          <Text style={{ color: colors.textPrimary, fontSize: 15, marginBottom: 16 }}>{item.descripcion}</Text>
          <TouchableOpacity
            style={{
              backgroundColor: 'rgb(9,180,26)',
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: 'center',
              marginTop: 8,
              width: '100%',
            }}
            onPress={() => abrirReserva(item)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Apartar espacio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <AdminHeader title="Solicitudes y Espacios" navigation={navigation} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.header, { color: colors.title }]}>Espacios Disponibles</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={{ marginTop: 40 }}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : (
          <>
            {espacios.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textPrimary, fontSize: 16 }}>No hay espacios registrados.</Text>
            ) : (
              espacios.map((item) => (
                <View key={item.id} style={{ marginBottom: 18 }}>
                  {renderEspacio({ item })}
                </View>
              ))
            )}
            <Text style={[styles.header, { color: colors.title, marginTop: 32 }]}>Solicitudes de Espacio</Text>
            {(() => {
              // Solo solicitudes de espacio: deben tener id_esp o id_espa y NO deben tener campos de equipo/elemento
              const isEspacioRequest = (item: any) => {
                const equipoKeys = ['elemento', 'elementos', 'equipo', 'ids_elem', 'id_elemento', 'categoria', 'subcategoria', 'id_categoria', 'id_subcategoria'];
                const hasEspacioId = !!(item.id_esp || item.id_espa);
                const isEquipo = equipoKeys.some(key => item[key] && (!Array.isArray(item[key]) || item[key].length > 0));
                return hasEspacioId && !isEquipo;
              };
              const solicitudesEspacio = solicitudes.filter(isEspacioRequest);
              if (solicitudesEspacio.length === 0) {
                return <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textPrimary, fontSize: 16 }}>No hay solicitudes registradas.</Text>;
              }
              return solicitudesEspacio.map((item) => {
                // Mapeo robusto del ID de solicitud
                const solicitudId = item.id ?? item.id_soli ?? item._id ?? null;
                const espacio = espacios.find(e => e.id === (item.id_esp || item.id_espa));
                let imagen = undefined;
                try {
                  const imgs = espacio?.imagenes ? JSON.parse(espacio.imagenes) : [];
                  imagen = imgs.length > 0 ? (imgs[0].startsWith('http') ? imgs[0] : `http://192.168.20.60:8081${imgs[0]}`) : undefined;
                } catch { imagen = undefined; }
                // Estado puede venir como string ("Aprobado") o número (1,2,3), priorizamos el string
                let estadoTexto = '';
                if (typeof item.est_soli === 'string' && item.est_soli.trim() !== '') {
                  estadoTexto = item.est_soli;
                } else if (typeof item.estado === 'string' && item.estado.trim() !== '') {
                  estadoTexto = item.estado;
                } else {
                  const estadoNum = Number(item.estadosoli ?? item.est_soli ?? item.estado ?? 1);
                  const estadoMap: any = { 1: 'Pendiente', 2: 'Aprobado', 3: 'Rechazado' };
                  estadoTexto = estadoMap[estadoNum] || 'Pendiente';
                }
                const reserva: ReservaEspacio = {
                  id: solicitudId,
                  nom_espa: espacio?.nom_espa || 'Espacio',
                  usuario: item.nom_usu || 'Usuario',
                  ambient: item.ambient || '',
                  num_ficha: item.num_ficha || item.num_fich || '',
                  fecha_ini: item.fecha_ini?.replace('T', ', ') || '',
                  fecha_fn: item.fecha_fn?.replace('T', ', ') || '',
                  estado: estadoTexto,
                  imagen,
                  _locked: !!item._locked,
                };
                const actualizarEstado = async (nuevoEstado: number) => {
                  if (!solicitudId) {
                    setError('ID de solicitud no válido');
                    return;
                  }
                  try {
                    // Actualización optimista: cambia el estado localmente primero y marca como bloqueada
                    setSolicitudes(prev => prev.map(s => {
                      const id = s.id ?? s.id_soli ?? s._id ?? null;
                      if (id === solicitudId) {
                        return { ...s, est_soli: nuevoEstado, estadosoli: nuevoEstado, estado: nuevoEstado, _locked: true };
                      }
                      return s;
                    }));
                    const resp = await solicitudesService.update(solicitudId, { id_est_soli: nuevoEstado });
                    console.log('RESPUESTA update solicitud:', resp?.data);
                    let msg = '';
                    if (nuevoEstado === 2) msg = '¡Solicitud aprobada correctamente!';
                    else if (nuevoEstado === 3) msg = '¡Solicitud rechazada correctamente!';
                    else if (nuevoEstado === 1) msg = '¡Solicitud marcada como pendiente!';
                    else msg = 'Estado actualizado.';
                    if (typeof window === 'undefined') {
                      const { Alert } = require('react-native');
                      Alert.alert('Éxito', msg);
                    } else {
                      alert(msg);
                    }
                    // Refrescar desde backend para asegurar consistencia
                    setTimeout(() => { cargarSolicitudes(); }, 500);
                  } catch (err) {
                    setError('No se pudo actualizar el estado.');
                  }
                };
                return (
                  <ReservaEspacioCard
                    key={solicitudId}
                    reserva={reserva}
                    onAprobar={() => actualizarEstado(2)}
                    onRechazar={() => actualizarEstado(3)}
                    onPendiente={() => actualizarEstado(1)}
                  />
                );
              });
            })()}
          </>
        )}
      </ScrollView>
      <Modal visible={showReservaModal} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}> 
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.title }]}>Reservar {espacioSeleccionado?.nom_espa || ''}</Text>
            <ScrollView>
              <TouchableOpacity onPress={() => openPicker('fecha_ini', 'date')}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Fecha de inicio (ej: 2025-12-05)"
                  placeholderTextColor={isDark ? '#aaa' : '#555'}
                  value={reservaForm.fecha_ini.split(' ')[0] || ''}
                  editable={false}
                  pointerEvents="none"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openPicker('fecha_ini', 'time')}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Hora de inicio (ej: 14:30)"
                  placeholderTextColor={isDark ? '#aaa' : '#555'}
                  value={reservaForm.fecha_ini.split(' ')[1] || ''}
                  editable={false}
                  pointerEvents="none"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openPicker('fecha_fn', 'date')}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Fecha de fin (ej: 2025-12-05)"
                  placeholderTextColor={isDark ? '#aaa' : '#555'}
                  value={reservaForm.fecha_fn.split(' ')[0] || ''}
                  editable={false}
                  pointerEvents="none"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openPicker('fecha_fn', 'time')}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Hora de fin (ej: 16:00)"
                  placeholderTextColor={isDark ? '#aaa' : '#555'}
                  value={reservaForm.fecha_fn.split(' ')[1] || ''}
                  editable={false}
                  pointerEvents="none"
                />
              </TouchableOpacity>
              {/* DateTimePicker modal */}
              <DatePickerModal
                visible={showPicker.visible}
                mode={showPicker.mode}
                value={tempDate}
                onChange={onPickerChange}
                onClose={() => setShowPicker({ field: null, mode: 'date', visible: false })}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <TouchableOpacity style={[styles.boton, { backgroundColor: '#aaa' }]} onPress={() => setShowReservaModal(false)}>
                  <Text style={styles.botonTexto}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.boton, (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(reservaForm.fecha_ini) || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(reservaForm.fecha_fn)) ? { backgroundColor: '#bbb' } : null]}
                  onPress={reservarEspacio}
                  disabled={saving || !/^\d{4}-\d{2}-\d{2}( |T)\d{2}:\d{2}$/.test(reservaForm.fecha_ini) || !/^\d{4}-\d{2}-\d{2}( |T)\d{2}:\d{2}$/.test(reservaForm.fecha_fn)}
                >
                  <Text style={styles.botonTexto}>{saving ? 'Reservando...' : 'Confirmar'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, /* backgroundColor: '#fff', */ padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgb(9,180,26)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    // backgroundColor dinámico
  },
  titulo: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'sans-serif-medium',
    letterSpacing: 0.2,
    textAlign: 'center',
    textTransform: 'uppercase',
    // color dinámico
  },
  descripcion: { fontSize: 15, marginBottom: 10, textAlign: 'center' },
  imagen: { width: '100%', height: 140, borderRadius: 10, marginBottom: 8 },
  boton: {
    // backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgb(9,180,26)',
    paddingVertical: 9,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: 'rgb(9,180,26)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 1,
  },
  botonTexto: {
    color: 'rgb(9,180,26)',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { borderRadius: 12, padding: 24, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 12, fontSize: 16 },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gridItem: {
    width: '48%',
    marginBottom: 12,
  },
});

export default SolicitudesEspacioAdmin;
