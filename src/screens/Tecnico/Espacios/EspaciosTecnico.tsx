import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import HeaderTecnico from '../HeaderTecnico/HeaderTecnico';
import { authService, solicitudesService } from '../../../services/Api';

interface Solicitud {
  id_soli: number;
  nom_cat: string | null;
  nom_elem?: string | null;
  nom_espa?: string | null;
  nom_usu: string;
  fecha_ini: string;
  fecha_fn?: string;
  est_soli?: string;
  nom_estado?: string;
  id_espa?: number | null;
  id_elem?: string | null;
}

export default function EspaciosTecnico({ navigation }: any) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mostrarCalendarioInicio, setMostrarCalendarioInicio] = useState(false);
  const [mostrarCalendarioFin, setMostrarCalendarioFin] = useState(false);
  const [mesActualInicio, setMesActualInicio] = useState(new Date());
  const [mesActualFin, setMesActualFin] = useState(new Date());
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [actualizando, setActualizando] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Usar solicitudesService.getAll() para traer TODAS las solicitudes
      const response = await solicitudesService.getAll();
      console.log('RESPUESTA RAW solicitudesService.getAll():', response);
      console.log('RESPUESTA typeof:', typeof response);
      console.log('RESPUESTA isArray:', Array.isArray(response));
      
      // Obtener array de solicitudes (puede venir en response.data o directamente)
      let todasLasSolicitudes = [];
      
      if (Array.isArray(response)) {
        todasLasSolicitudes = response;
      } else if (response?.data && Array.isArray(response.data)) {
        todasLasSolicitudes = response.data;
      } else if (response?.data) {
        todasLasSolicitudes = Array.isArray(response.data) ? response.data : [response.data];
      } else {
        todasLasSolicitudes = [];
      }
      
      console.log('Todas las solicitudes (antes de filtrar):', todasLasSolicitudes);
      console.log('Total solicitudes cargadas:', todasLasSolicitudes.length);
      
      // Filtrar solo las solicitudes de Espacios (cuando id_espa NO es null) Y que estén Pendientes
      const espacios = todasLasSolicitudes.filter((sol: any) => {
        const esEspacio = sol?.id_espa !== null && sol?.id_espa !== undefined;
        const esPendiente = sol?.est_soli === 'Pendiente' || sol?.est_soli === 1;
        const cumple = esEspacio && esPendiente;
        console.log(`Solicitud ${sol?.id_soli}: id_espa=${sol?.id_espa}, nom_espa=${sol?.nom_espa}, est_soli=${sol?.est_soli}, esEspacio=${esEspacio}, esPendiente=${esPendiente}, cumple=${cumple}`);
        return cumple;
      });
      
      console.log('Espacios filtrados (finales):', espacios);
      console.log('Total espacios encontrados:', espacios.length);
      setSolicitudes(espacios);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  const generarDiasDelMes = (fecha: Date) => {
    const year = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(year, mes, 1);
    const ultimoDia = new Date(year, mes + 1, 0);
    const dias = [];
    const diasAntes = primerDia.getDay();

    for (let i = 0; i < diasAntes; i++) {
      dias.push(null);
    }

    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push(i);
    }

    return dias;
  };

  const formatearFecha = (dia: number, mes: Date) => {
    const year = mes.getFullYear();
    const mesNum = String(mes.getMonth() + 1).padStart(2, '0');
    const diaStr = String(dia).padStart(2, '0');
    return `${year}-${mesNum}-${diaStr}`;
  };

  const seleccionarFechaInicio = (dia: number) => {
    setFechaInicio(formatearFecha(dia, mesActualInicio));
    setMostrarCalendarioInicio(false);
  };

  const seleccionarFechaFin = (dia: number) => {
    setFechaFin(formatearFecha(dia, mesActualFin));
    setMostrarCalendarioFin(false);
  };

  const renderCalendario = (dias: (number | null)[], esInicio: boolean) => {
    const dias_semana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];
    return (
      <View style={{ padding: 15 }}>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {dias_semana.map(d => (
            <Text key={d} style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#333', fontSize: 12 }}>
              {d}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {dias.map((dia, index) => (
            <TouchableOpacity
              key={index}
              style={{
                width: '14.28%',
                padding: 10,
                alignItems: 'center',
                backgroundColor: dia ? '#f0f0f0' : 'transparent',
                borderRadius: 4,
                marginBottom: 5,
              }}
              disabled={!dia}
              onPress={() => dia && (esInicio ? seleccionarFechaInicio(dia) : seleccionarFechaFin(dia))}
            >
              {dia && <Text style={{ fontWeight: '500', color: '#333', fontSize: 12 }}>{dia}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const abrirDetalle = (solicitud: Solicitud) => {
    navigation.navigate('DetallesEspacios', { solicitud });
  };

  const abrirModalConfirmacion = (solicitud: Solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setMostrarModalConfirmacion(true);
  };

  const cambiarEstadoAAprobada = async () => {
    if (!solicitudSeleccionada) return;
    
    try {
      setActualizando(true);
      // Cambiar estado a Aprobada (estado 2)
      const datosActualizacion = {
        id_est_soli: 2, // Estado Aprobada
        id_soli: solicitudSeleccionada.id_soli,
      };
      
      await solicitudesService.updateEstado(solicitudSeleccionada.id_soli, datosActualizacion);
      
      // Actualizar la lista local
      setSolicitudes(solicitudes.map(sol => 
        sol.id_soli === solicitudSeleccionada.id_soli 
          ? { ...sol, est_soli: 'Aprobada' }
          : sol
      ));
      
      setMostrarModalConfirmacion(false);
      setSolicitudSeleccionada(null);
      Alert.alert('Éxito', 'Solicitud de espacio aprobada correctamente');
    } catch (error: any) {
      console.error('Error al aprobar solicitud:', error);
      Alert.alert('Error', 'No se pudo aprobar la solicitud');
    } finally {
      setActualizando(false);
    }
  };


  // Filtrar solicitudes
  const solicitudesFiltradas = solicitudes.filter((sol) => {
    const nombre = sol.nom_espa || sol.nom_elem || '';
    const cumpleNombre = busquedaNombre 
      ? nombre.toLowerCase().includes(busquedaNombre.toLowerCase()) 
      : true;
    const cumpleFecha =
      (!fechaInicio || new Date(sol.fecha_ini) >= new Date(fechaInicio)) &&
      (!fechaFin || new Date(sol.fecha_ini) <= new Date(fechaFin));
    
    return cumpleNombre && cumpleFecha;
  });

  // Paginación
  const itemsPorPagina = 5;
  const totalPaginas = Math.max(1, Math.ceil(solicitudesFiltradas.length / itemsPorPagina));
  const solicitudesPagina = solicitudesFiltradas.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const irPagina = (n: number) => {
    setPaginaActual(Math.min(Math.max(1, n), totalPaginas));
  };

  const renderSolicitud = ({ item }: { item: Solicitud }) => (
    <View style={{ padding: 10, backgroundColor: '#fff', marginBottom: 8 }}>
      <TouchableOpacity 
        style={{
          padding: 15,
          backgroundColor: '#f9f9f9',
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: '#3fbb34',
          elevation: 2,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        }}
        onPress={() => abrirDetalle(item)}
        activeOpacity={0.7}
      >
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 6 }}>
            {item.nom_espa || item.nom_elem}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <View style={{ backgroundColor: item.est_soli === 'Pendiente' ? '#fff3cd' : '#e8f5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 }}>
              <Text style={{ fontSize: 12, color: item.est_soli === 'Pendiente' ? '#856404' : '#3fbb34', fontWeight: '600' }}>
                {item.est_soli || item.nom_estado}
              </Text>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>
          <Text style={{ fontWeight: '600' }}>Usuario: </Text>
          {item.nom_usu}
        </Text>
        
        <Text style={{ fontSize: 13, color: '#999' }}>
          <Text style={{ fontWeight: '600' }}>Fecha: </Text>
          {new Date(item.fecha_ini).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <HeaderTecnico title="Espacios" navigation={navigation} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3fbb34" />
          <Text style={{ color: '#999', marginTop: 10, fontSize: 14 }}>Cargando solicitudes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <HeaderTecnico title="Solicitudes de Espacios" navigation={navigation} />
      
      <ScrollView style={{ flex: 1 }}>
        {/* Filtros Compactos */}
        <View style={{ backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
          <View style={{ marginBottom: 12 }}>
            <TextInput
              style={{ borderWidth: 2, borderColor: '#3fbb34', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, backgroundColor: '#f9f9f9' }}
              placeholder="🔍 Buscar por nombre"
              placeholderTextColor="#999"
              value={busquedaNombre}
              onChangeText={setBusquedaNombre}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity 
                style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#f9f9f9', justifyContent: 'center' }}
                onPress={() => setMostrarCalendarioInicio(true)}
              >
                <Text style={{ fontSize: 12, color: fechaInicio ? '#333' : '#999' }}>
                  📅 {fechaInicio || 'Desde'}
                </Text>
              </TouchableOpacity>
              {fechaInicio && (
                <TouchableOpacity 
                  style={{ padding: 6, backgroundColor: '#f0f0f0', borderRadius: 4 }}
                  onPress={() => setFechaInicio('')}
                >
                  <Text style={{ fontSize: 14, color: '#999' }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity 
                style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#f9f9f9', justifyContent: 'center' }}
                onPress={() => setMostrarCalendarioFin(true)}
              >
                <Text style={{ fontSize: 12, color: fechaFin ? '#333' : '#999' }}>
                  📅 {fechaFin || 'Hasta'}
                </Text>
              </TouchableOpacity>
              {fechaFin && (
                <TouchableOpacity 
                  style={{ padding: 6, backgroundColor: '#f0f0f0', borderRadius: 4 }}
                  onPress={() => setFechaFin('')}
                >
                  <Text style={{ fontSize: 14, color: '#999' }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Lista de solicitudes */}
        {solicitudesPagina.length > 0 ? (
          <FlatList
            data={solicitudesPagina}
            renderItem={renderSolicitud}
            keyExtractor={(item) => item.id_soli.toString()}
            scrollEnabled={false}
            style={{ backgroundColor: '#f5f5f5', padding: 10 }}
          />
        ) : (
          <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <Text style={{ color: '#999', fontSize: 14 }}>No hay solicitudes de espacios disponibles</Text>
          </View>
        )}

        {/* Paginación Minimalista */}
        {totalPaginas > 1 && (
          <View style={{ paddingVertical: 15, paddingHorizontal: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
            <TouchableOpacity
              style={{ paddingHorizontal: 10, paddingVertical: 6 }}
              onPress={() => irPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              <Text style={{ color: paginaActual === 1 ? '#ccc' : '#3fbb34', fontSize: 13, fontWeight: '600' }}>←</Text>
            </TouchableOpacity>

            {Array.from({ length: totalPaginas }).map((_, i) => (
              <TouchableOpacity
                key={i}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                  backgroundColor: paginaActual === i + 1 ? '#3fbb34' : 'transparent',
                  borderWidth: paginaActual === i + 1 ? 0 : 1,
                  borderColor: '#ddd',
                }}
                onPress={() => irPagina(i + 1)}
              >
                <Text
                  style={{
                    color: paginaActual === i + 1 ? '#fff' : '#333',
                    fontSize: 12,
                    fontWeight: '500',
                  }}
                >
                  {i + 1}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={{ paddingHorizontal: 10, paddingVertical: 6 }}
              onPress={() => irPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              <Text style={{ color: paginaActual === totalPaginas ? '#ccc' : '#3fbb34', fontSize: 13, fontWeight: '600' }}>→</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal Calendario Inicio */}
      <Modal
        visible={mostrarCalendarioInicio}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMostrarCalendarioInicio(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 15, borderTopRightRadius: 15, padding: 15 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <TouchableOpacity onPress={() => setMesActualInicio(new Date(mesActualInicio.getFullYear(), mesActualInicio.getMonth() - 1))}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3fbb34' }}>◄</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
                {mesActualInicio.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => setMesActualInicio(new Date(mesActualInicio.getFullYear(), mesActualInicio.getMonth() + 1))}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3fbb34' }}>►</Text>
              </TouchableOpacity>
            </View>
            {renderCalendario(generarDiasDelMes(mesActualInicio), true)}
            <TouchableOpacity 
              style={{ backgroundColor: '#3fbb34', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 10 }}
              onPress={() => setMostrarCalendarioInicio(false)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Calendario Fin */}
      <Modal
        visible={mostrarCalendarioFin}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMostrarCalendarioFin(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 15, borderTopRightRadius: 15, padding: 15 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <TouchableOpacity onPress={() => setMesActualFin(new Date(mesActualFin.getFullYear(), mesActualFin.getMonth() - 1))}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3fbb34' }}>◄</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
                {mesActualFin.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => setMesActualFin(new Date(mesActualFin.getFullYear(), mesActualFin.getMonth() + 1))}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3fbb34' }}>►</Text>
              </TouchableOpacity>
            </View>
            {renderCalendario(generarDiasDelMes(mesActualFin), false)}
            <TouchableOpacity 
              style={{ backgroundColor: '#3fbb34', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 10 }}
              onPress={() => setMostrarCalendarioFin(false)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmación para Aprobar */}
      <Modal
        visible={mostrarModalConfirmacion}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMostrarModalConfirmacion(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 300 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 15, textAlign: 'center' }}>
              Confirmar Aprobación
            </Text>
            
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' }}>
              ¿Deseas aprobar la solicitud de espacio "{solicitudSeleccionada?.nom_espa || solicitudSeleccionada?.nom_elem}"?
            </Text>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 12, borderWidth: 2, borderColor: '#999', borderRadius: 6, alignItems: 'center' }}
                onPress={() => setMostrarModalConfirmacion(false)}
                disabled={actualizando}
              >
                <Text style={{ color: '#999', fontWeight: '600', fontSize: 14 }}>No</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 12, backgroundColor: '#3fbb34', borderRadius: 6, alignItems: 'center' }}
                onPress={cambiarEstadoAAprobada}
                disabled={actualizando}
              >
                {actualizando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Sí, Aprobar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
