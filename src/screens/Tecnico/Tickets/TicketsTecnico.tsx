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
import { Picker } from '@react-native-picker/picker';
import { ticketsService, authService } from '../../../services/Api';
import { useTheme } from '../../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import HeaderTecnico from '../../Tecnico/HeaderTecnico/HeaderTecnico';

interface Ticket {
  id_tickets?: number;
  id_ticket?: number;
  num_ticket?: string;
  nom_problema?: string;
  nom_problm?: string;
  nom_cat?: string;
  nom_subcateg?: string;
  nom_elem?: string;
  id_eleme?: number;
  nom_usu?: string;
  id_usuario?: number;
  fecha_creacion?: string;
  fecha_in?: string;
  fecha_actualizacion?: string;
  fecha_fin?: string;
  id_estado_ticket?: number;
  id_est_tick?: number;
  nom_estado?: string;
  tip_est_ticket?: string;
  ambient?: string;
}

interface Categoria {
  id: number;
  nom_cat: string;
}

interface Subcategoria {
  id: number;
  nom_subcateg: string;
  id_cat: number;
}

const TicketsTecnico = ({ navigation }: any) => {
  const { colors, theme } = useTheme();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState('');
  const [busquedaProblema, setBusquedaProblema] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
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
      const [ticketsRes, categoriasRes, subcategoriasRes] = await Promise.all([
        ticketsService.getAll(),
        authService.obtenerCategorias(),
        authService.obtenerSubcategorias(),
      ]);

      // Extraer el array de tickets (puede venir como respuesta.data o directamente)
      let allTickets = [];
      if (Array.isArray(ticketsRes)) {
        allTickets = ticketsRes;
      } else if (ticketsRes && Array.isArray(ticketsRes.data)) {
        allTickets = ticketsRes.data;
      } else if (ticketsRes && ticketsRes.data) {
        allTickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
      }
      
      console.log('📋 Total de tickets cargados:', allTickets.length);
      console.log('📋 Datos sin filtrar:', JSON.stringify(allTickets.slice(0, 3), null, 2));
      
      // Filtrar solo tickets con id_est_tick = 2 (Pendiente)
      const ticketsPendientes = allTickets.filter((ticket: any) => {
        const estadoId = ticket.id_est_tick || ticket.id_estado_ticket || ticket.estado;
        console.log(`Ticket ${ticket.id_tickets || ticket.id_ticket}: estado=${estadoId}, ¿es 2?=${estadoId === 2}`);
        return estadoId === 2;
      });

      console.log('✅ Tickets pendientes encontrados:', ticketsPendientes.length);
      
      setTickets(ticketsPendientes);
      setCategorias(Array.isArray(categoriasRes) ? categoriasRes : categoriasRes.data || []);
      setSubcategorias(Array.isArray(subcategoriasRes) ? subcategoriasRes : subcategoriasRes.data || []);
      setPaginaActual(1);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los tickets');
      setTickets([]);
      setCategorias([]);
      setSubcategorias([]);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar subcategorías según la categoría seleccionada
  const subcategoriasFiltradas = categoriaFiltro
    ? subcategorias.filter(sub => {
        const categoria = categorias.find(cat => cat.nom_cat === categoriaFiltro);
        return categoria && sub.id_cat === categoria.id;
      })
    : subcategorias;

  const ticketsFiltrados = tickets.filter((ticket) => {
    // Usar nom_cat si existe, si no está disponible no filtramos por categoría
    const cumpleCategoria = categoriaFiltro
      ? ticket.nom_cat?.toLowerCase() === categoriaFiltro.toLowerCase()
      : true;
    
    // No filtrar por subcategoría ya que los tickets no devuelven este dato
    // const cumpleSubcategoria = true;
    
    // Filtrar por problema usando nom_problema o nom_problm
    const problema = ticket.nom_problema || ticket.nom_problm || '';
    const cumpleProblema = busquedaProblema
      ? problema.toLowerCase().includes(busquedaProblema.toLowerCase())
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
    setSubcategoriaFiltro('');
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#3fbb34" />
        <Text style={{ marginTop: 10, color: colors.textSecondary, fontSize: 14 }}>Cargando tickets...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderTecnico title="Tickets Técnico" navigation={navigation} />

      {/* Filtros Siempre Visibles */}
      <View style={{ backgroundColor: colors.cardBackground, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {/* Categoría - Dropdown con indicador visual llamativo */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ 
            borderWidth: 3, 
            borderColor: categoriaFiltro ? '#3fbb34' : colors.border, 
            borderRadius: 8, 
            overflow: 'hidden', 
            backgroundColor: categoriaFiltro ? '#e8f5e9' : colors.inputBackground,
            shadowColor: categoriaFiltro ? '#3fbb34' : 'transparent',
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: categoriaFiltro ? 3 : 0,
          }}>
            <View style={{ paddingLeft: 10, paddingTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: categoriaFiltro ? '#2e7d32' : colors.textTertiary }}>
                Categoría {categoriaFiltro && '✓ SELECCIONADO'}
              </Text>
              {categoriaFiltro && (
                <View style={{ backgroundColor: '#3fbb34', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>
                    {categoriaFiltro}
                  </Text>
                </View>
              )}
            </View>
            <Picker
              selectedValue={categoriaFiltro}
              onValueChange={(value: string) => {
                setCategoriaFiltro(value);
                setPaginaActual(1);
              }}
              style={{ height: 35, paddingHorizontal: 0 }}
              itemStyle={{ color: '#333', fontWeight: '600' }}
            >
              <Picker.Item label="Todas" value="" />
              {categorias && categorias.length > 0 ? (
                categorias.map((cat: any) => (
                  <Picker.Item key={`cat-${cat.id}`} label={cat.nom_cat} value={cat.nom_cat} />
                ))
              ) : null}
            </Picker>
          </View>
        </View>

        {/* Subcategoría - Dropdown con indicador visual */}
        {tickets.some((t: any) => t.nom_subcateg) && (
        <View style={{ marginBottom: 12 }}>
          <View style={{ 
            borderWidth: 3, 
            borderColor: subcategoriaFiltro ? '#3fbb34' : colors.border, 
            borderRadius: 8, 
            overflow: 'hidden', 
            backgroundColor: subcategoriaFiltro ? '#e8f5e9' : colors.inputBackground,
            shadowColor: subcategoriaFiltro ? '#3fbb34' : 'transparent',
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: subcategoriaFiltro ? 3 : 0,
          }}>
            <View style={{ paddingLeft: 10, paddingTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: subcategoriaFiltro ? '#2e7d32' : colors.textTertiary }}>
                Subcategoría {subcategoriaFiltro && '✓ SELECCIONADO'}
              </Text>
              {subcategoriaFiltro && (
                <View style={{ backgroundColor: '#3fbb34', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>
                    {subcategoriaFiltro}
                  </Text>
                </View>
              )}
            </View>
            <Picker
              selectedValue={subcategoriaFiltro}
              onValueChange={(value: string) => {
                setSubcategoriaFiltro(value);
                setPaginaActual(1);
              }}
              style={{ height: 35, paddingHorizontal: 0 }}
              itemStyle={{ color: '#333', fontWeight: '600' }}
            >
              <Picker.Item label="Todas" value="" />
              {subcategoriasFiltradas && subcategoriasFiltradas.length > 0 ? (
                subcategoriasFiltradas.map((subcat: any) => (
                  <Picker.Item key={`subcat-${subcat.id}`} label={subcat.nom_subcateg} value={subcat.nom_subcateg} />
                ))
              ) : null}
            </Picker>
          </View>
        </View>
        )}

        {/* Búsqueda por Problema */}
        <View style={{ marginBottom: 12 }}>
          <TextInput
            style={{ borderWidth: 2, borderColor: '#3fbb34', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, backgroundColor: colors.inputBackground, color: colors.textPrimary }}
            placeholder="🔍 Buscar por Problema"
            placeholderTextColor={colors.textTertiary}
            value={busquedaProblema}
            onChangeText={(text) => {
              setBusquedaProblema(text);
              setPaginaActual(1);
            }}
          />
        </View>

        {/* Botón Limpiar Filtros */}
        {(categoriaFiltro || subcategoriaFiltro || busquedaProblema) && (
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
      </View>

      {/* ScrollView para Lista de Tickets */}
      {cargando ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3fbb34" />
        </View>
      ) : ticketsFiltrados.length === 0 ? (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 16, color: colors.textTertiary, textAlign: 'center', marginHorizontal: 20 }}>
              {tickets.length === 0 ? 'No hay tickets' : 'No hay resultados con los filtros seleccionados'}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
          <FlatList
            data={ticketsPagina}
            keyExtractor={(item, index) => ((item.id_tickets || item.id_ticket || index) as any).toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => irADetalles(item)}
                style={{
                  marginHorizontal: 12,
                  marginVertical: 8,
                  borderRadius: 12,
                  backgroundColor: colors.cardBackground,
                  shadowColor: '#000',
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 5,
                  overflow: 'hidden',
                }}
              >
                {/* Header con color verde y número */}
                <View style={{ 
                  backgroundColor: '#3fbb34', 
                  paddingVertical: 12, 
                  paddingHorizontal: 16, 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
                      TICKET
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>
                      #{item.id_tickets || item.id_ticket}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>
                      {item.tip_est_ticket || item.nom_estado || 'Pendiente'}
                    </Text>
                  </View>
                </View>

                {/* Contenido */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                  {/* Problema - más prominente */}
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textTertiary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      ⚠️ Problema
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, lineHeight: 22 }} numberOfLines={2}>
                      {item.nom_problm || item.nom_problema || 'Sin descripción'}
                    </Text>
                  </View>

                  {/* Grid de 2 columnas - Categoría y Elemento */}
                  <View style={{ flexDirection: 'row', marginBottom: 12, gap: 8 }}>
                    <View style={{ flex: 1, backgroundColor: colors.inputBackground, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#3fbb34' }}>
                      <Text style={{ fontSize: 10, color: colors.textTertiary, fontWeight: '600', marginBottom: 3, textTransform: 'uppercase' }}>
                        🏷️ Categoría
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
                        {item.nom_cat || categorias.find((c: any) => c.id === item.id_cat)?.nom_cat || 'N/A'}
                      </Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: colors.inputBackground, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#3fbb34' }}>
                      <Text style={{ fontSize: 10, color: colors.textTertiary, fontWeight: '600', marginBottom: 3, textTransform: 'uppercase' }}>
                        ⚙️ Equipo
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }} numberOfLines={1}>
                        {item.nom_elem || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Grid de 2 columnas - Usuario y Fecha */}
                  <View style={{ flexDirection: 'row', marginBottom: 0, gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 10, color: colors.textTertiary, fontWeight: '600', marginBottom: 3, textTransform: 'uppercase' }}>
                        👤 Reportado por
                      </Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textPrimary }}>
                        {item.nom_usu || 'Desconocido'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 10, color: colors.textTertiary, fontWeight: '600', marginBottom: 3, textTransform: 'uppercase' }}>
                        📅 Fecha
                      </Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textPrimary }}>
                        {item.fecha_in ? new Date(item.fecha_in).toLocaleDateString('es-ES', { month: 'short', day: '2-digit' }) : 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Footer - Indicador de interacción */}
                <View style={{ backgroundColor: colors.inputBackground, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border }}>
                  {/* Ubicación eliminada */}
                  <Text style={{ fontSize: 16, color: '#3fbb34' }}>→</Text>
                </View>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
            contentContainerStyle={{ paddingVertical: 12 }}
          />

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
                borderTopColor: colors.border,
                backgroundColor: colors.inputBackground,
              }}
            >
              <TouchableOpacity
                onPress={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                style={{ opacity: paginaActual === 1 ? 0.5 : 1 }}
              >
                <Text style={{ fontSize: 24, color: '#3fbb34', fontWeight: '700' }}>◄</Text>
              </TouchableOpacity>

              <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>
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

          </ScrollView>
      )}
    </View>
  );
};

export default TicketsTecnico;
