import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, TouchableOpacity, TextInput, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DatePickerModal from '../../components/DatePickerModal';
import { solicitudesService } from '../../services/Api';
// ...resto del archivo sin cambios...

// Interfaces necesarias
interface Categoria {
  id?: number;
  id_cat?: number;
  nombre?: string;
  nom_cat?: string;
}

interface Solicitud {
  id: number;
  id_soli?: number;
  estado: string;
  est_soli?: string;
  fecha: string;
  fecha_ini?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  solicitante: string;
  nom_usu?: string;
  elemento: string;
  nom_elem?: string;
  categoria: string;
  nom_cat?: string;
  subcategoria?: string;
  detalles?: string;
  serial?: string;
  cantidad?: string;
  ambiente?: string;
}

// Función para cargar solicitudes (debe estar definida en este archivo)
const fetchSolicitudes = async (setSolicitudes: React.Dispatch<React.SetStateAction<Solicitud[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  setLoading(true);
  try {
    const response: any = await solicitudesService.getAll();
    // axios responde con { data: [...] }
    const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    const mapped = data.map((s: any) => ({
      id: s.id ?? s.id_soli ?? s._id ?? null,
      estado: s.estado ?? s.est_soli ?? s.estado_solicitud ?? '',
      fecha: s.fecha ?? s.fecha_ini ?? s.fecha_inicio ?? '',
      solicitante: s.solicitante ?? s.nom_usu ?? s.usuario ?? '',
      elemento: s.elemento ?? s.nom_elem ?? '',
      categoria: s.categoria ?? s.nom_cat ?? '',
    }));
    setSolicitudes(mapped as Solicitud[]);
  } catch (e) {
    setSolicitudes([]);
  }
  setLoading(false);
};

const ESTADOS: Record<number, string> = {
  1: 'Pendiente',
  2: 'Aprobado',
  3: 'Rechazado',
  4: 'Cancelado',
  5: 'Finalizado',
};

const ESTADO_IDS: Record<string, number> = {
  'Pendiente': 1,
  'Aprobado': 2,
  'Rechazado': 3,
  'Cancelado': 4,
  'Finalizado': 5,
};

const SolicitudesElementoAdmin = () => {
  // Estados para mostrar los modales de selección
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showSubcategoriaModal, setShowSubcategoriaModal] = useState(false);
  const [showElementoModal, setShowElementoModal] = useState(false);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [elementos, setElementos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [subcategorias, setSubcategorias] = useState<any[]>([]);
  const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState<any[]>([]);
  const [elementosFiltrados, setElementosFiltrados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editEstado, setEditEstado] = useState('');
  const [editCantidad, setEditCantidad] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addData, setAddData] = useState({
    elemento: '',
    categoria: '',
    subcategoria: '',
    fecha_ini: '',
    fecha_fin: '',
    cantidad: '',
    ambiente: '',
    detalles: '',
    serial: '',
    espacio: '', // Nuevo campo para id_esp si lo necesitas
  });

  // Estados y helpers para los pickers de fecha/hora
  const [showPicker, setShowPicker] = useState<{field: 'fecha_ini'|'fecha_fin'|null, mode: 'date'|'time', visible: boolean}>({field: null, mode: 'date', visible: false});
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const openPicker = (field: 'fecha_ini'|'fecha_fin', mode: 'date'|'time') => {
    let current = addData[field];
    let d = current && /^\d{4}-\d{2}-\d{2}( |T)\d{2}:\d{2}$/.test(current)
      ? new Date(current.replace(' ', 'T'))
      : new Date();
    setTempDate(d);
    setShowPicker({field, mode, visible: true});
  };
  const onPickerChange = (event: any, date?: Date) => {
    if (date && showPicker.field) {
      let prev = addData[showPicker.field];
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
      setAddData(f => ({ ...f, [showPicker.field!]: formatted }));
    }
    setShowPicker({field: null, mode: 'date', visible: false});
  };

  // Cargar solicitudes al montar
  useEffect(() => {
    fetchSolicitudes(setSolicitudes, setLoading);
    // Cargar categorías y subcategorías al montar
    (async () => {
      const catRes = await import('../../services/Api').then(m => m.categoriasService.getAll());
      setCategorias(catRes.data as any[]);
      const subcatRes = await import('../../services/Api').then(m => m.subcategoriasService.getAll());
      setSubcategorias(subcatRes.data as any[]);
      const elemRes = await import('../../services/Api').then(m => m.elementosService.getAll());
      setElementos(elemRes.data as any[]);
    })();
  }, []);

  // Render principal
  return (
    <View style={styles.container}>
      {/* Header alineado a la izquierda, sin botón verde */}
      <View style={{marginBottom: 10, paddingHorizontal: 16, paddingTop: 4}}>
        <Text style={[styles.title, {textAlign: 'left', fontSize: 22}]}>Solicitudes de Elementos (Admin)</Text>
      </View>
      <View style={styles.solicitudesListWrap}>
        {loading ? (
          <ActivityIndicator size="large" color="#28a745" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={solicitudes}
            keyExtractor={item => item.id?.toString() || Math.random().toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => {
                setSelectedSolicitud(item);
                setEditEstado(item.estado || '');
                setEditCantidad(item.cantidad ? String(item.cantidad) : '');
                setEditModalVisible(true);
              }}>
                <View style={styles.solicitudCard}>
                  <View style={styles.solicitudBadge} />
                  <View style={styles.solicitudIconWrap}>
                    <MaterialIcons name="assignment" size={48} color="#28a745" style={styles.solicitudIcon} />
                  </View>
                  <View style={styles.solicitudInfoWrap}>
                    <Text style={styles.solicitudTitulo}>Solicitud #{item.id !== undefined ? item.id : 'Sin número'}</Text>
                    <Text style={styles.solicitudEstado}>Estado: <Text style={styles.solicitudEstadoValor}>{item.estado !== undefined ? item.estado : 'Sin estado'}</Text></Text>
                    <Text style={styles.solicitudDetalle}>Fecha: {item.fecha !== undefined ? item.fecha : 'Sin fecha'}</Text>
                    <Text style={styles.solicitudDetalle}>Solicitante: {item.solicitante !== undefined ? item.solicitante : 'Sin nombre'}</Text>
                    <Text style={styles.solicitudDetalle}>Elemento: {item.elemento !== undefined ? item.elemento : 'Sin elemento'}</Text>
                    <Text style={styles.solicitudDetalle}>Categoría: {item.categoria !== undefined ? item.categoria : 'Sin categoría'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Botón flotante para añadir */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
        accessibilityLabel="Añadir solicitud"
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Modal para añadir solicitud */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Solicitud</Text>
            {/* Selector de Categoría */}
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowCategoriaModal(true)}
            >
              <Text style={{ color: addData.categoria ? '#212529' : '#aaa' }}>
                {addData.categoria
                  ? (categorias.find((cat: any) => String(cat.id ?? cat.id_cat) === String(addData.categoria))?.nombre ?? categorias.find((cat: any) => String(cat.id ?? cat.id_cat) === String(addData.categoria))?.nom_cat ?? addData.categoria)
                  : 'Selecciona una categoría'}
              </Text>
            </TouchableOpacity>
            {/* Modal de selección de categoría */}
            {showCategoriaModal && (
              <Modal
                visible={showCategoriaModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCategoriaModal(false)}
              >
                <View style={styles.modalBg}>
                  <View style={[styles.modalContent, {maxHeight: 350}]}> 
                    <Text style={styles.modalTitle}>Selecciona una categoría</Text>
                    <FlatList
                      data={categorias}
                      keyExtractor={item => String(item.id ?? item.id_cat)}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}
                          onPress={() => {
                            setAddData(prev => ({ ...prev, categoria: String(item.id ?? item.id_cat), subcategoria: '', elemento: '' }));
                            setSubcategoriasFiltradas(subcategorias.filter((s: any) => {
                              // Relacionar usando id_cat (Long) en subcategoría y id o id_cat en categoría
                              const catId = String(item.id ?? item.id_cat);
                              return String(s.id_cat) === catId;
                            }));
                            setElementosFiltrados([]);
                            setShowCategoriaModal(false);
                          }}
                        >
                          <Text>{item.nombre ?? item.nom_cat}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              </Modal>
            )}

            {/* Selector de Subcategoría */}
            <TouchableOpacity
              style={styles.input}
              onPress={() => addData.categoria && setShowSubcategoriaModal(true)}
              disabled={!addData.categoria}
            >
              <Text style={{ color: addData.subcategoria ? '#212529' : '#aaa' }}>
                {addData.subcategoria
                  ? (
                      subcategoriasFiltradas.find((sub: any) => String(sub.id ?? sub.id_subcat) === String(addData.subcategoria))?.nom_subcateg
                      ?? subcategoriasFiltradas.find((sub: any) => String(sub.id ?? sub.id_subcat) === String(addData.subcategoria))?.nombre
                      ?? addData.subcategoria
                    )
                  : 'Selecciona una subcategoría'}
              </Text>
            </TouchableOpacity>
            {/* Modal de selección de subcategoría */}
            {showSubcategoriaModal && (
              <Modal
                visible={showSubcategoriaModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSubcategoriaModal(false)}
              >
                <View style={styles.modalBg}>
                  <View style={[styles.modalContent, {maxHeight: 350}]}> 
                    <Text style={styles.modalTitle}>Selecciona una subcategoría</Text>
                    <FlatList
                      data={subcategoriasFiltradas}
                      keyExtractor={item => String(item.id ?? item.id_subcat)}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}
                          onPress={() => {
                            setAddData(prev => ({ ...prev, subcategoria: String(item.id ?? item.id_subcat), elemento: '' }));
                            setElementosFiltrados(elementos.filter((e: any) => String(e.id_subcat ?? e.id_subcategoria) === String(item.id ?? item.id_subcat)));
                            setShowSubcategoriaModal(false);
                          }}
                        >
                          <Text>{item.nom_subcateg ?? item.nombre ?? item.nom_subcat}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              </Modal>
            )}

            {/* Selector de Elemento */}
            <TouchableOpacity
              style={styles.input}
              onPress={() => addData.subcategoria && setShowElementoModal(true)}
              disabled={!addData.subcategoria}
            >
              <Text style={{ color: addData.elemento ? '#212529' : '#aaa' }}>
                {addData.elemento
                  ? (
                      elementosFiltrados.find((el: any) => String(el.id ?? el.id_elem ?? el.id_elemen ?? el.id_elemento) === String(addData.elemento))?.nom_eleme
                      ?? elementosFiltrados.find((el: any) => String(el.id ?? el.id_elem ?? el.id_elemen ?? el.id_elemento) === String(addData.elemento))?.nom_elem
                      ?? elementosFiltrados.find((el: any) => String(el.id ?? el.id_elem ?? el.id_elemen ?? el.id_elemento) === String(addData.elemento))?.nombre
                      ?? elementosFiltrados.find((el: any) => String(el.id ?? el.id_elem ?? el.id_elemen ?? el.id_elemento) === String(addData.elemento))?.nom_elemento
                      ?? addData.elemento
                    )
                  : 'Selecciona un elemento'}
              </Text>
            </TouchableOpacity>
            {/* Modal de selección de elemento */}
            {showElementoModal && (
              <Modal
                visible={showElementoModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowElementoModal(false)}
              >
                <View style={styles.modalBg}>
                  <View style={[styles.modalContent, {maxHeight: 350}]}> 
                    <Text style={styles.modalTitle}>Selecciona un elemento</Text>
                    <FlatList
                      data={elementosFiltrados}
                      keyExtractor={item => String(item.id)}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}
                          onPress={() => {
                            setAddData(prev => ({ ...prev, elemento: String(item.id ?? item.id_elem ?? item.id_elemen ?? item.id_elemento) }));
                            setShowElementoModal(false);
                          }}
                        >
                          <Text>{item.nom_eleme ?? item.nom_elem ?? item.nombre ?? item.nom_elemento ?? 'Sin nombre'}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              </Modal>
            )}
            {/* Fecha y hora inicio */}
            <TouchableOpacity onPress={() => openPicker('fecha_ini', 'date')}>
              <TextInput
                style={styles.input}
                placeholder="Fecha de inicio (ej: 2025-12-05)"
                value={addData.fecha_ini.split(' ')[0] || ''}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openPicker('fecha_ini', 'time')}>
              <TextInput
                style={styles.input}
                placeholder="Hora de inicio (ej: 14:30)"
                value={addData.fecha_ini.split(' ')[1] || ''}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            {/* Fecha y hora fin */}
            <TouchableOpacity onPress={() => openPicker('fecha_fin', 'date')}>
              <TextInput
                style={styles.input}
                placeholder="Fecha de fin (ej: 2025-12-05)"
                value={addData.fecha_fin.split(' ')[0] || ''}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openPicker('fecha_fin', 'time')}>
              <TextInput
                style={styles.input}
                placeholder="Hora de fin (ej: 16:00)"
                value={addData.fecha_fin.split(' ')[1] || ''}
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
              onClose={() => setShowPicker({field: null, mode: 'date', visible: false})}
            />
            {/* Validación de formato */}
            {(!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(addData.fecha_ini) || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(addData.fecha_fin)) && (addData.fecha_ini || addData.fecha_fin) ? (
              <Text style={{color:'red',fontSize:13,marginBottom:8}}>
                  El formato debe ser: 2025-12-05 14:30 <Text style={{fontWeight:'bold'}}>o</Text> 2025-12-05T14:30
              </Text>
            ) : null}
            <TextInput
              style={styles.input}
              placeholder="Cantidad"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={addData.cantidad}
              onChangeText={text => setAddData(prev => ({ ...prev, cantidad: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Ambiente"
              placeholderTextColor="#aaa"
              value={addData.ambiente}
              onChangeText={text => setAddData(prev => ({ ...prev, ambiente: text }))}
            />
            <View style={styles.modalActions}>
              <Button title="Cancelar" color="#888" onPress={() => setAddModalVisible(false)} />
              <Button
                title="Añadir"
                color="#28a745"
                onPress={async () => {
                  try {
                    if (!addData.elemento || !addData.categoria || !addData.fecha_ini || !addData.fecha_fin) {
                      alert('Por favor, completa los campos obligatorios.');
                      return;
                    }
                    if (addData.cantidad && Number(addData.cantidad) > 2) {
                      alert('La cantidad máxima permitida es 2 equipos.');
                      return;
                    }
                    // Obtener usuario actual para id_usu y token para debug
                    const apiModule = await import('../../services/Api');
                    const user = await apiModule.authService.getCurrentUser();
                    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
                    const token = await AsyncStorage.getItem('token');
                    console.log('[DEBUG] Usuario actual:', user);
                    console.log('[DEBUG] Token actual:', token);
                    const id_usu = user?.id || user?.id_usu || null;
                    if (!id_usu) {
                      alert('No se pudo obtener el usuario actual.');
                      return;
                    }
                    // Construir payload para el backend
                    // Formatear fechas con 'T' para LocalDateTime
                    const toIsoLocal = (str: string) => str.replace(' ', 'T');
                    const payload = {
                      fecha_ini: addData.fecha_ini ? toIsoLocal(addData.fecha_ini) : '',
                      fecha_fn: addData.fecha_fin ? toIsoLocal(addData.fecha_fin) : '',
                      ambient: addData.ambiente,
                      num_fich: 0, // Si tienes este dato, cámbialo
                      cantid: addData.cantidad ? Number(addData.cantidad) : 1,
                      id_estado_soli: 1, // 1 = Pendiente
                      mensaj: addData.detalles || '',
                      id_categoria: addData.categoria ? Number(addData.categoria) : null,
                      id_subcategoria: addData.subcategoria ? Number(addData.subcategoria) : null,
                      id_usu,
                      id_esp: addData.espacio ? Number(addData.espacio) : null, // Si tienes selector de espacio
                      ids_elem: addData.elemento ? [Number(addData.elemento)] : [],
                    };
                    // Limpia los campos null para evitar problemas (type-safe)
                    const cleanPayload = Object.fromEntries(
                      Object.entries(payload).filter(([_, v]) => v !== null && v !== undefined)
                    );
                    await solicitudesService.create(cleanPayload);
                    setAddModalVisible(false);
                    setAddData({ elemento: '', categoria: '', subcategoria: '', fecha_ini: '', fecha_fin: '', cantidad: '', ambiente: '', detalles: '', serial: '', espacio: '' });
                    fetchSolicitudes(setSolicitudes, setLoading);
                  } catch (e: any) {
                    // Mostrar el error real del backend si existe
                    let msg = 'Error al crear la solicitud.';
                    if (e?.response?.data) {
                      msg += '\n' + JSON.stringify(e.response.data);
                    } else if (e?.message) {
                      msg += '\n' + e.message;
                    } else if (typeof e === 'string') {
                      msg += '\n' + e;
                    }
                    console.log('❌ Error al crear solicitud:', e);
                    alert(msg);
                  }
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    {/* Modal de edición de estado y cantidad */}
    <Modal
      visible={editModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalBg}>
        <View style={[styles.modalContent, {backgroundColor: '#232734'}]}>
          <Text style={[styles.modalTitle, {color: '#fff', fontWeight: 'bold', fontSize: 20, textAlign: 'center', marginBottom: 18}]}>Detalle de Solicitud</Text>
          <Text style={{color: '#fff', marginBottom: 8, fontWeight: 'bold'}}>Cantidad</Text>
          <TextInput
            style={[styles.input, {backgroundColor: '#232734', color: '#fff', borderColor: '#28a745'}]}
            placeholder="Cantidad"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={editCantidad}
            onChangeText={setEditCantidad}
          />
          <Text style={{color: '#fff', marginBottom: 8, fontWeight: 'bold', marginTop: 12}}>Estado</Text>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16}}>
            {['Pendiente','Aprobado','Rechazado','Cancelado','Finalizado'].map(estado => (
              <TouchableOpacity
                key={estado}
                style={[
                  {paddingHorizontal:16, paddingVertical:8, borderRadius:18, margin:4, borderWidth:2},
                  editEstado === estado
                    ? {backgroundColor:'#28a745', borderColor:'#28a745'}
                    : {backgroundColor:'#232734', borderColor:'#28a745'}
                ]}
                onPress={() => setEditEstado(estado)}
              >
                <Text style={{color: editEstado === estado ? '#fff' : '#28a745', fontWeight:'bold'}}>{estado}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[styles.modalActions, {marginTop: 18}]}> 
            <Button title="Cancelar" color="#888" onPress={() => setEditModalVisible(false)} />
            <Button
              title="Guardar"
              color="#28a745"
              onPress={async () => {
                if (!selectedSolicitud) return;
                if (!editEstado) {
                  alert('Seleccione un estado');
                  return;
                }
                if (editCantidad && Number(editCantidad) > 2) {
                  alert('La cantidad máxima permitida es 2 equipos.');
                  return;
                }
                try {
                  const estadoMap: Record<string, number> = {
                    'Pendiente': 1,
                    'Aprobado': 2,
                    'Rechazado': 3,
                    'Cancelado': 4,
                    'Finalizado': 5
                  };
                  const resp = await solicitudesService.update(selectedSolicitud.id, {
                    est_soli: estadoMap[editEstado],
                    cantidad: editCantidad,
                  });
                  alert('Respuesta backend: ' + JSON.stringify(resp?.data || resp));
                  setEditModalVisible(false);
                  fetchSolicitudes(setSolicitudes, setLoading);
                } catch (e) {
                  alert('Error al actualizar la solicitud.');
                }
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  </View>
  );
// ...
// ...existing code...
};

const styles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
    textAlign: 'center',
  },
  solicitudesListWrap: {
    flex: 1,
    marginBottom: 60,
  },
  solicitudCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  solicitudBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#28a745',
    marginRight: 10,
  },
  solicitudTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  solicitudEstado: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  solicitudEstadoValor: {
    fontWeight: 'bold',
    color: '#28a745',
  },
  solicitudDetalle: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 1,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#28a745',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 10,
  },
  addTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  addTopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  // Modal styles
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 20,
    textAlign: 'center',
  },
  // Form styles
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#212529',
    marginRight: 8,
    marginBottom: 8,
  },
  estadoButtonSelected: {
    backgroundColor: '#28a745',
  },
  estadoButtonText: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  estadoButtonTextSelected: {
    color: '#fff',
  },
  solicitudIconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  solicitudIcon: {
    marginRight: 8,
  },
  solicitudInfoWrap: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});

export default SolicitudesElementoAdmin;
