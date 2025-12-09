import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { authService } from '../../../services/Api';
import { useFocusEffect } from '@react-navigation/native';

interface Solicitud {
  id_soli: number;
  nom_cat: string;
  nom_elem?: string;
  nom_espa?: string;
  nom_usu: string;
  fecha_ini: string;
  fecha_act?: string;
  nom_estado: string;
  id_estado_solicitud: number;
}

const HistorialTecnico = ({ navigation }: any) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 5;

  useFocusEffect(
    React.useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const res = await authService.obtenerSolicitudesPendientes();
      // Filtrar solo las solicitudes completadas (aprobadas o rechazadas)
      const solicitudesCompletadas = (res.data || []).filter(
        (sol: any) =>
          sol.id_estado_solicitud === 2 || // Aprobada
          sol.id_estado_solicitud === 3    // Rechazada
      );
      setSolicitudes(solicitudesCompletadas);
      setPaginaActual(1);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudo cargar el historial');
    } finally {
      setCargando(false);
    }
  };

  const solicitudesFiltradas = solicitudes.filter((solicitud) => {
    const nombre = solicitud.nom_espa || solicitud.nom_elem || '';
    const cumpleBusqueda = busqueda
      ? nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        solicitud.nom_estado?.toLowerCase().includes(busqueda.toLowerCase())
      : true;
    return cumpleBusqueda;
  });

  const totalPaginas = Math.max(1, Math.ceil(solicitudesFiltradas.length / itemsPorPagina));
  const solicitudesPagina = solicitudesFiltradas.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const limpiarFiltros = () => {
    setBusqueda('');
    setPaginaActual(1);
  };

  const getColorEstado = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'aprobada':
        return '#4CAF50';
      case 'rechazada':
        return '#F44336';
      default:
        return '#666';
    }
  };

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#3fbb34" />
        <Text style={{ marginTop: 10, color: '#666', fontSize: 14 }}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#3fbb34', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 15 }}>
          Historial
        </Text>
      </View>

      {/* Botón de Filtros */}
      <TouchableOpacity
        onPress={() => setMostrarFiltros(!mostrarFiltros)}
        style={{
          backgroundColor: '#f0f0f0',
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#e0e0e0',
        }}
      >
        <Text style={{ color: '#3fbb34', fontWeight: '600', fontSize: 14 }}>
          {mostrarFiltros ? '▼ Ocultar Filtros' : '▶ Mostrar Filtros'}
        </Text>
      </TouchableOpacity>

      {/* Panel de Filtros */}
      {mostrarFiltros && (
        <ScrollView style={{ backgroundColor: '#fafafa', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
          {/* Búsqueda */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 6 }}>
              🔍 Buscar por Nombre o Estado
            </Text>
            <TextInput
              placeholder="Escribe..."
              value={busqueda}
              onChangeText={(text) => {
                setBusqueda(text);
                setPaginaActual(1);
              }}
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 6,
                paddingHorizontal: 10,
                paddingVertical: 8,
                fontSize: 13,
                color: '#333',
              }}
            />
          </View>

          {/* Botón Limpiar Filtros */}
          {busqueda && (
            <TouchableOpacity
              onPress={limpiarFiltros}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor: '#ff9800',
                borderRadius: 4,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
                Limpiar Filtros
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Lista de Solicitudes */}
      {solicitudesFiltradas.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#999', textAlign: 'center', marginHorizontal: 20 }}>
            {solicitudes.length === 0 ? 'No hay historial disponible' : 'No hay resultados con los filtros seleccionados'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={solicitudesPagina}
          keyExtractor={(item) => item.id_soli.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                borderLeftWidth: 4,
                borderLeftColor: '#3fbb34',
                backgroundColor: '#fff',
                marginHorizontal: 12,
                marginVertical: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 4,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              {/* Nombre y Estado */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#333', flex: 1 }}>
                  {item.nom_espa || item.nom_elem}
                </Text>
                <View
                  style={{
                    backgroundColor: getColorEstado(item.nom_estado),
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>
                    {item.nom_estado}
                  </Text>
                </View>
              </View>

              {/* Categoría */}
              <View style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>
                  Categoría
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#333' }}>
                  {item.nom_cat}
                </Text>
              </View>

              {/* Usuario y Fecha */}
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>
                    Usuario
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#333' }}>
                    {item.nom_usu}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>
                    Fecha
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#333' }}>
                    {new Date(item.fecha_ini).toLocaleDateString('es-ES', {
                      year: '2-digit',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      )}

      {/* Paginación */}
      {solicitudesFiltradas.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            backgroundColor: '#fafafa',
          }}
        >
          <TouchableOpacity
            onPress={() => setPaginaActual(Math.max(1, paginaActual - 1))}
            disabled={paginaActual === 1}
            style={{ opacity: paginaActual === 1 ? 0.5 : 1 }}
          >
            <Text style={{ fontSize: 24, color: '#3fbb34', fontWeight: '700' }}>◄</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 13, color: '#666', fontWeight: '600' }}>
            Página {paginaActual} de {totalPaginas}
          </Text>

          <TouchableOpacity
            onPress={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
            disabled={paginaActual === totalPaginas}
            style={{ opacity: paginaActual === totalPaginas ? 0.5 : 1 }}
          >
            <Text style={{ fontSize: 24, color: '#3fbb34', fontWeight: '700' }}>►</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botón Recargar */}
      <TouchableOpacity
        onPress={cargarDatos}
        style={{
          backgroundColor: '#3fbb34',
          paddingVertical: 12,
          marginHorizontal: 16,
          marginVertical: 12,
          borderRadius: 4,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
          🔄 Recargar Historial
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HistorialTecnico;
