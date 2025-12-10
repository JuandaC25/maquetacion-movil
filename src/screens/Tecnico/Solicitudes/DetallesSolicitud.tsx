import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import HeaderTecnico from '../HeaderTecnico/HeaderTecnico';
import { SolicitudesTecnicoStyles } from '../../../styles/Tecnico/Solicitudes/SolicitudesTecnico';
import { solicitudesService, authService } from '../../../services/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DetallesSolicitudProps {
  route: any;
  navigation: any;
}

interface Elemento {
  id_elemen: number;
  nom_eleme: string;
  marc: string;
  sub_catg: string;
  componen: string;
}

interface ElementoSeleccionado {
  id_elemen: number;
  nom_eleme: string;
  cantidad: number;
}

export default function DetallesSolicitud({ route, navigation }: DetallesSolicitudProps) {
  const { solicitud } = route.params;
  const { colors, theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [estadoActual, setEstadoActual] = useState(solicitud.est_soli);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<string | null>(null);
  const [isAprobarPressed, setIsAprobarPressed] = useState(false);
  const [isRechazarPressed, setIsRechazarPressed] = useState(false);
  const [mostrarModalAsignar, setMostrarModalAsignar] = useState(false);
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [elementosSeleccionados, setElementosSeleccionados] = useState<ElementoSeleccionado[]>([]);
  const [enviando, setEnviando] = useState(false);

  const obtenerIdEstado = (estado: string): number => {
    const estados: { [key: string]: number } = {
      'Pendiente': 1,
      'Aprobada': 2,
      'Rechazada': 3,
    };
    return estados[estado] || 1;
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    try {
      setLoading(true);
      const nuevoIdEstado = obtenerIdEstado(nuevoEstado);
      console.log('📤 Enviando actualización:', {
        id_soli: solicitud.id_soli,
        id_est_soli: nuevoIdEstado,
        nuevoEstado: nuevoEstado
      });
      
      const datosActualizacion = {
        id_est_soli: nuevoIdEstado,
      };
      
      const respuesta = await solicitudesService.update(solicitud.id_soli, datosActualizacion);
      console.log('✅ Respuesta del servidor:', respuesta);
      
      setEstadoActual(nuevoEstado);
      setModalVisible(false);
      setModalAction(null);
      
      const mensaje = nuevoEstado === 'Aprobada' 
        ? 'Solicitud aprobada correctamente' 
        : 'Solicitud rechazada correctamente';
      Alert.alert('Éxito', mensaje);
      
      // Volver a la lista después de 1 segundo
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      console.error('❌ Error al actualizar solicitud:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo actualizar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Función independiente para Aprobar (abre directamente el modal de equipos)
  const abrirModalAprobar = () => {
    cargarElementos();
    setMostrarModalAsignar(true);
  };

  // Función independiente para Rechazar (abre modal de confirmación)
  const abrirModalRechazar = () => {
    setModalAction('rechazar');
    setModalVisible(true);
  };

  const confirmarAccion = () => {
    if (modalAction === 'rechazar') {
      cambiarEstado('Rechazada');
    }
  };

  // Cargar elementos disponibles
  const cargarElementos = async () => {
    try {
      const data = await authService.obtenerElementos();
      console.log('📦 Elementos cargados:', data);
      setElementos(data || []);
    } catch (error) {
      console.error('Error al cargar elementos:', error);
      Alert.alert('Error', 'No se pudieron cargar los equipos');
    }
  };

  // Filtrar elementos por subcategoría
  const obtenerElementosFiltrados = (): Elemento[] => {
    console.log('📋 Subcategoría buscada:', solicitud.nom_subcat);
    console.log('📋 Total elementos disponibles:', elementos.length);
    
    if (!solicitud.nom_subcat || elementos.length === 0) {
      console.log('⚠️ Sin subcategoría o sin elementos, mostrando todos');
      return elementos;
    }
    
    const filtrados = elementos.filter((elem) => {
      console.log('🔍 Comparando:', {
        elem_subcatg: elem.sub_catg,
        solicitud_subcat: solicitud.nom_subcat,
        coinciden: elem.sub_catg === solicitud.nom_subcat
      });
      return elem.sub_catg === solicitud.nom_subcat;
    });
    
    console.log('✅ Elementos filtrados:', filtrados.length);
    return filtrados.length > 0 ? filtrados : elementos; // Si no hay coincidencias, mostrar todos
  };

  // Agregar elemento (respetando el límite de cantidad)
  const agregarElemento = (elemento: Elemento) => {
    // Calcular cantidad total actual
    const cantidadActual = elementosSeleccionados.reduce((sum, e) => sum + e.cantidad, 0);
    
    // Si ya alcanzamos el límite, no agregar más
    if (cantidadActual >= solicitud.cantid) {
      Alert.alert('Límite alcanzado', `Solo puedes asignar ${solicitud.cantid} equipos en total`);
      return;
    }

    const existe = elementosSeleccionados.find((e) => e.id_elemen === elemento.id_elemen);
    if (existe) {
      // Si el elemento ya existe, incrementar
      if (existe.cantidad + 1 > solicitud.cantid) {
        Alert.alert('Límite alcanzado', `Solo puedes asignar ${solicitud.cantid} equipos en total`);
        return;
      }
      setElementosSeleccionados(
        elementosSeleccionados.map((e) =>
          e.id_elemen === elemento.id_elemen ? { ...e, cantidad: e.cantidad + 1 } : e
        )
      );
    } else {
      // Agregar nuevo elemento
      setElementosSeleccionados([
        ...elementosSeleccionados,
        { id_elemen: elemento.id_elemen, nom_eleme: elemento.nom_eleme, cantidad: 1 },
      ]);
    }
  };

  // Remover elemento
  const removerElemento = (elementoId: number) => {
    const existe = elementosSeleccionados.find((e) => e.id_elemen === elementoId);
    if (existe && existe.cantidad > 1) {
      setElementosSeleccionados(
        elementosSeleccionados.map((e) =>
          e.id_elemen === elementoId ? { ...e, cantidad: e.cantidad - 1 } : e
        )
      );
    } else {
      setElementosSeleccionados(elementosSeleccionados.filter((e) => e.id_elemen !== elementoId));
    }
  };

  // Enviar asignación
  const enviarAsignacion = async () => {
    const cantidadTotal = elementosSeleccionados.reduce((sum, e) => sum + e.cantidad, 0);
    
    if (cantidadTotal > solicitud.cantid) {
      Alert.alert(
        'Cantidad excedida',
        `No puedes asignar más de ${solicitud.cantid} equipos. Actualmente has seleccionado ${cantidadTotal}.`
      );
      return;
    }

    if (cantidadTotal === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos un elemento');
      return;
    }

    setEnviando(true);
    try {
      const usuarioJSON = await AsyncStorage.getItem('usuario');
      const usuario = usuarioJSON ? JSON.parse(usuarioJSON) : {};
      const id_tecnico = usuario.id || 0;
      const nombre_tecnico = usuario.nombre || usuario.nom_usu || 'Técnico';

      const idsElem: number[] = [];
      elementosSeleccionados.forEach((item) => {
        for (let i = 0; i < item.cantidad; i++) {
          idsElem.push(item.id_elemen);
        }
      });

      const payload = {
        id_soli: solicitud.id_soli,
        id_est_soli: 2,
        ids_elem: idsElem,
        id_tecnico,
        nombre_tecnico,
      };

      console.log('📤 Enviando asignación:', payload);

      const token = await AsyncStorage.getItem('token');
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }

      const response = await fetch(`http://192.168.1.6:8080/api/solicitudes/${solicitud.id_soli}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Error al actualizar solicitud');

      Alert.alert('Éxito', 'Solicitud aprobada y elementos asignados');
      setMostrarModalAsignar(false);
      setElementosSeleccionados([]);
      setEstadoActual('Aprobada');
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      console.error('Error al enviar asignación:', error);
      Alert.alert('Error', 'No se pudo asignar los elementos');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={[SolicitudesTecnicoStyles.container, { backgroundColor: colors.background }]}>
      <HeaderTecnico title="Detalles de Solicitud" navigation={navigation} />
      
      <ScrollView style={[SolicitudesTecnicoStyles.contentContainer, { backgroundColor: colors.background }]}>
        <View style={SolicitudesTecnicoStyles.filterContainer}>
          {/* Botón para volver */}
          <TouchableOpacity
            style={{ 
              alignSelf: 'flex-end', 
              marginBottom: 15, 
              padding: 5,
              backgroundColor: colors.cardBackground,
              borderRadius: 50,
              width: 30,
              height: 30,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border
            }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>✕</Text>
          </TouchableOpacity>
          <View style={SolicitudesTecnicoStyles.tarjeta}>
            <Text style={SolicitudesTecnicoStyles.cardModelo}>
              {solicitud.nom_elem}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>ID Solicitud: </Text>
              {solicitud.id_soli}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Categoría: </Text>
              {solicitud.nom_cat}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Subcategoría: </Text>
              {solicitud.nom_subcat}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Usuario: </Text>
              {solicitud.nom_usu}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Correo: </Text>
              {solicitud.correo}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Cantidad: </Text>
              {solicitud.cantid}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Fecha Inicio: </Text>
              {new Date(solicitud.fecha_ini).toLocaleString()}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Fecha Fin: </Text>
              {new Date(solicitud.fecha_fn).toLocaleString()}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Ambiente: </Text>
              {solicitud.ambient}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Número de Ficha: </Text>
              {solicitud.num_fich}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Estado: </Text>
              {estadoActual}
            </Text>

            {solicitud.mensaj && (
              <Text style={SolicitudesTecnicoStyles.cardInfo}>
                <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Mensaje: </Text>
                {solicitud.mensaj}
              </Text>
            )}
          </View>

          {/* Botones de Acción */}
          <View style={{ marginTop: 20, gap: 10 }}>
            <TouchableOpacity
              style={{
                width: '100%',
                padding: 12,
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: '#3fbb34',
                borderRadius: 5,
                alignItems: 'center',
              }}
              onPress={abrirModalAprobar}
              disabled={loading}
            >
              <Text style={{ color: '#3fbb34', fontWeight: 'bold', fontSize: 14 }}>Aprobar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '100%',
                padding: 12,
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: '#d9534f',
                borderRadius: 5,
                alignItems: 'center',
              }}
              onPress={abrirModalRechazar}
              disabled={loading}
            >
              <Text style={{ color: '#d9534f', fontWeight: 'bold', fontSize: 14 }}>Rechazar</Text>
            </TouchableOpacity>
          </View>

          {/* Modal de Confirmación */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible && modalAction === 'rechazar'}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: colors.cardBackground, borderRadius: 10, padding: 20, width: '85%' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: colors.textPrimary }}>
                  ¿Rechazar solicitud?
                </Text>
                <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: 20, textAlign: 'center' }}>
                  Una vez rechazada, se notificará al usuario
                </Text>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={{ 
                      flex: 1, 
                      padding: 12, 
                      backgroundColor: '#3fbb34', 
                      borderRadius: 5, 
                      alignItems: 'center' 
                    }}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>No</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ 
                      flex: 1, 
                      padding: 12, 
                      backgroundColor: colors.inputBackground,
                      borderWidth: 2,
                      borderColor: '#3fbb34',
                      borderRadius: 5, 
                      alignItems: 'center' 
                    }}
                    onPress={confirmarAccion}
                  >
                    <Text style={{ color: '#3fbb34', fontWeight: 'bold' }}>Sí</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>

      {/* Modal para Asignar Equipos */}
      <Modal
        visible={mostrarModalAsignar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setMostrarModalAsignar(false);
          setElementosSeleccionados([]);
        }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingTop: 20,
            paddingHorizontal: 16,
            paddingBottom: 20,
            maxHeight: '85%',
          }}>
            {/* Header del Modal */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#333' }}>
                  Asignar Equipos
                </Text>
                {solicitud && (
                  <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    {solicitud.nom_elem} • {solicitud.nom_subcat}
                  </Text>
                )}
              </View>
              <TouchableOpacity 
                onPress={() => {
                  setMostrarModalAsignar(false);
                  setElementosSeleccionados([]);
                }}
                style={{ padding: 8 }}
              >
                <Text style={{ fontSize: 24, color: '#999' }}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Lista de Equipos Disponibles */}
            {obtenerElementosFiltrados().length > 0 ? (
              <FlatList
                data={obtenerElementosFiltrados()}
                renderItem={({ item }) => {
                  const elementoSeleccionado = elementosSeleccionados.find(e => e.id_elemen === item.id_elemen);
                  const cantidadSeleccionada = elementoSeleccionado?.cantidad || 0;

                  return (
                    <View style={{
                      padding: 12,
                      backgroundColor: '#f9f9f9',
                      borderRadius: 8,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: cantidadSeleccionada > 0 ? '#3fbb34' : '#e0e0e0',
                    }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 }}>
                            {item.nom_eleme}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#999' }}>
                            {item.marc}
                          </Text>
                        </View>

                        {/* Controles de Cantidad */}
                        {cantidadSeleccionada > 0 ? (
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            backgroundColor: '#e8f5e9',
                            paddingHorizontal: 8,
                            paddingVertical: 6,
                            borderRadius: 6,
                          }}>
                            <TouchableOpacity 
                              onPress={() => removerElemento(item.id_elemen)}
                              style={{ paddingHorizontal: 6 }}
                            >
                              <Text style={{ fontSize: 16, fontWeight: '600', color: '#3fbb34' }}>−</Text>
                            </TouchableOpacity>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#3fbb34', minWidth: 24, textAlign: 'center' }}>
                              {cantidadSeleccionada}
                            </Text>
                            <TouchableOpacity 
                              onPress={() => agregarElemento(item)}
                              style={{ paddingHorizontal: 6 }}
                            >
                              <Text style={{ fontSize: 16, fontWeight: '600', color: '#3fbb34' }}>+</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            onPress={() => agregarElemento(item)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              backgroundColor: '#e8f5e9',
                              borderRadius: 6,
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#3fbb34' }}>Agregar</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                }}
                keyExtractor={(item) => item.id_elemen.toString()}
                scrollEnabled={true}
                nestedScrollEnabled={true}
                style={{ maxHeight: 300, marginBottom: 16 }}
              />
            ) : (
              <View style={{
                paddingVertical: 30,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0f0f0',
                borderRadius: 8,
                marginBottom: 16,
              }}>
                <Text style={{ fontSize: 14, color: '#999', textAlign: 'center' }}>
                  No hay equipos disponibles para esta categoría
                </Text>
              </View>
            )}

            {/* Resumen de Selección */}
            {elementosSeleccionados.length > 0 && (
              <View style={{
                padding: 12,
                backgroundColor: '#f0f7f0',
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: '#3fbb34',
                marginBottom: 16,
              }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#3fbb34', marginBottom: 8 }}>
                  Equipos Seleccionados ({elementosSeleccionados.reduce((sum, e) => sum + e.cantidad, 0)}/{solicitud.cantid} solicitados)
                </Text>
                {elementosSeleccionados.map((elem) => (
                  <Text key={elem.id_elemen} style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>
                    • {elem.nom_eleme} (x{elem.cantidad})
                  </Text>
                ))}
              </View>
            )}

            {/* Botones de Acción */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity 
                onPress={() => {
                  setMostrarModalAsignar(false);
                  setElementosSeleccionados([]);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: '#f0f0f0',
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                disabled={enviando}
              >
                <Text style={{ fontWeight: '600', color: '#666', fontSize: 14 }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={enviarAsignacion}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: (elementosSeleccionados.length > 0 && elementosSeleccionados.reduce((sum, e) => sum + e.cantidad, 0) === solicitud.cantid) ? '#3fbb34' : '#ccc',
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                disabled={(elementosSeleccionados.reduce((sum, e) => sum + e.cantidad, 0) !== solicitud.cantid) || enviando}
              >
                <Text style={{ fontWeight: '600', color: '#fff', fontSize: 14 }}>
                  {enviando ? 'Asignando...' : 'Confirmar Asignación'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
