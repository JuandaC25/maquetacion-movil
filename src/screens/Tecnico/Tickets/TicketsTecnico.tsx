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
import { ticketsService, authService } from '../../../services/Api';
import { useFocusEffect } from '@react-navigation/native';

interface Ticket {
  id_ticket: number;
  num_ticket: string;
  nom_problema: string;
  nom_cat: string;
  nom_elem: string;
  nom_usu: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  id_estado_ticket: number;
  nom_estado: string;
}

interface Categoria {
  id: number;
  nom_cat: string;
}

const TicketsTecnico = ({ navigation }: any) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [busquedaProblema, setBusquedaProblema] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
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
      const [ticketsRes, categoriasRes] = await Promise.all([
        ticketsService.getActivos(),
        authService.obtenerCategorias(),
      ]);

      setTickets(ticketsRes.data || []);
      setCategorias(categoriasRes.data || []);
      setPaginaActual(1);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los tickets');
    } finally {
      setCargando(false);
    }
  };

  const ticketsFiltrados = tickets.filter((ticket) => {
    const cumpleCategoria = categoriaFiltro
      ? ticket.nom_cat?.toLowerCase() === categoriaFiltro.toLowerCase()
      : true;
    const cumpleProblema = busquedaProblema
      ? ticket.nom_problema?.toLowerCase().includes(busquedaProblema.toLowerCase())
      : true;
    return cumpleCategoria && cumpleProblema;
  });

  const totalPaginas = Math.max(1, Math.ceil(ticketsFiltrados.length / itemsPorPagina));
  const ticketsPagina = ticketsFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const limpiarFiltros = () => {
    setCategoriaFiltro('');
    setBusquedaProblema('');
    setPaginaActual(1);
  };

  const irADetalles = (ticket: Ticket) => {
    navigation.navigate('DetallesTicket', { ticket });
  };

  const getColorEstado = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'abierto':
        return '#FF9800';
      case 'en proceso':
        return '#2196F3';
      case 'resuelto':
        return '#4CAF50';
      case 'cerrado':
        return '#757575';
      default:
        return '#666';
    }
  };

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#3fbb34" />
        <Text style={{ marginTop: 10, color: '#666', fontSize: 14 }}>Cargando tickets...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#3fbb34', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 15 }}>
          Tickets Técnico
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
          {/* Categoría */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 6 }}>
              Categoría
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -16, paddingHorizontal: 16 }}
            >
              <TouchableOpacity
                onPress={() => {
                  setCategoriaFiltro('');
                  setPaginaActual(1);
                }}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  backgroundColor: categoriaFiltro === '' ? '#3fbb34' : '#e0e0e0',
                  borderRadius: 16,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    color: categoriaFiltro === '' ? '#fff' : '#666',
                    fontWeight: '600',
                    fontSize: 12,
                  }}
                >
                  Todas
                </Text>
              </TouchableOpacity>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => {
                    setCategoriaFiltro(cat.nom_cat);
                    setPaginaActual(1);
                  }}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    backgroundColor: categoriaFiltro === cat.nom_cat ? '#3fbb34' : '#e0e0e0',
                    borderRadius: 16,
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      color: categoriaFiltro === cat.nom_cat ? '#fff' : '#666',
                      fontWeight: '600',
                      fontSize: 12,
                    }}
                  >
                    {cat.nom_cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Búsqueda por problema */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 6 }}>
              🔍 Buscar por Problema
            </Text>
            <TextInput
              placeholder="Escribe el problema..."
              value={busquedaProblema}
              onChangeText={(text) => {
                setBusquedaProblema(text);
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
          {(categoriaFiltro || busquedaProblema) && (
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

      {/* Lista de Tickets */}
      {ticketsFiltrados.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#999', textAlign: 'center', marginHorizontal: 20 }}>
            {tickets.length === 0 ? 'No hay tickets' : 'No hay resultados con los filtros seleccionados'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={ticketsPagina}
          keyExtractor={(item) => item.id_ticket.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => irADetalles(item)}
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
              {/* Número de Ticket y Estado */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#333' }}>
                  Ticket #{item.num_ticket}
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

              {/* Problema */}
              <View style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 2 }}>
                  Problema:
                </Text>
                <Text style={{ fontSize: 13, color: '#333' }} numberOfLines={2}>
                  {item.nom_problema}
                </Text>
              </View>

              {/* Categoría y Elemento */}
              <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>
                    Categoría
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#333' }}>
                    {item.nom_cat}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>
                    Elemento
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#333' }} numberOfLines={1}>
                    {item.nom_elem}
                  </Text>
                </View>
              </View>

              {/* Usuario y Fecha */}
              <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>
                    Reportado por
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#333' }}>
                    {item.nom_usu}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>
                    Creado
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#333' }}>
                    {new Date(item.fecha_creacion).toLocaleDateString('es-ES', {
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
      {ticketsFiltrados.length > 0 && (
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
          🔄 Recargar Tickets
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TicketsTecnico;
