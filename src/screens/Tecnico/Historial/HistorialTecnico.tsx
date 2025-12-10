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
  Share,
} from 'react-native';
import * as XLSX from 'xlsx';
import HeaderTecnico from '../HeaderTecnico/HeaderTecnico';
import { authService, ticketsService, solicitudesService } from '../../../services/Api';
import { useFocusEffect } from '@react-navigation/native';

interface Solicitud {
  id_soli: number;
  nom_cat: string;
  nom_subcat?: string;
  nom_elem?: string;
  nom_espa?: string;
  nom_usu: string;
  fecha_ini: string;
  fecha_act?: string;
  nom_estado: string;
  id_estado_solicitud: number;
  tipo: 'solicitud';
}

interface Prestamo {
  id_prest: number;
  nom_elem: string;
  nom_cat: string;
  nom_subcateg?: string; // Opcional porque no siempre viene
  nom_usu: string;
  fecha_ini?: string;
  fecha_entreg?: string; // Campo que trae la API
  fecha_repc?: string;
  nom_estado?: string;
  estado?: number; // Campo que trae la API (0 = Finalizado)
  id_estado_prestamo?: number;
  tipo: 'prestamo';
  ambiente?: string;
  tipo_pres?: string;
}

interface Ticket {
  id_ticket?: number;
  id: number;
  titulo?: string;
  titulo_ticket?: string;
  descripcion?: string;
  descripcion_ticket?: string;
  estado?: number;
  estado_ticket?: string;
  fecha_creacion?: string;
  fecha_registro?: string;
  fecha_actualizacion?: string;
  nom_usu?: string;
  nombre_usuario?: string;
  tipo: 'ticket';
}


const HistorialTecnico = ({ navigation }: any) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [espacios, setEspacios] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [subcategorias, setSubcategorias] = useState<string[]>([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [tab, setTab] = useState<'tickets' | 'prestamos' | 'espacios'>('tickets');
  const itemsPorPagina = 5;

  // Estilos separados por tab
  const estilosCard = {
    tickets: {
      container: {
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
      },
      titulo: { fontSize: 14, fontWeight: '700' as const, color: '#333', flex: 1 },
      subtitulo: { fontSize: 11, color: '#999', marginBottom: 2 },
      contenido: { fontSize: 12, fontWeight: '500' as const, color: '#333' },
    },
    prestamos: {
      container: {
        borderLeftWidth: 4,
        borderLeftColor: '#ff9800',
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
      },
      titulo: { fontSize: 14, fontWeight: '700' as const, color: '#333', flex: 1 },
      subtitulo: { fontSize: 11, color: '#999', marginBottom: 2 },
      contenido: { fontSize: 12, fontWeight: '500' as const, color: '#333' },
    },
    espacios: {
      container: {
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
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
      },
      titulo: { fontSize: 14, fontWeight: '700' as const, color: '#333', flex: 1 },
      subtitulo: { fontSize: 11, color: '#999', marginBottom: 2 },
      contenido: { fontSize: 12, fontWeight: '500' as const, color: '#333' },
    },
  };

  useFocusEffect(
    React.useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      // Cargar tickets finalizados o inactivos
      let ticketsFinalizados: any[] = [];
      try {
        const resTickets = await ticketsService.getAll();
        const ticketsData = resTickets.data || resTickets || [];
        // Filtrar tickets con estado 3 (Resuelto) y 4 (Cerrado)
        ticketsFinalizados = Array.isArray(ticketsData)
          ? ticketsData
              .filter((ticket: any) => {
                const estado = ticket.id_est_tick || ticket.id_estado_ticket || ticket.estado;
                return estado === 3 || estado === 4;
              })
              .map((ticket: any) => ({ ...ticket, tipo: 'ticket' }))
          : [];
      } catch (errorTickets) {
        console.error('Error cargando tickets:', errorTickets);
        ticketsFinalizados = [];
      }
      
      // Cargar préstamos finalizados (de elementos)
      let prestamosFinalizados: any[] = [];
      try {
        const resPrestamos = await authService.obtenerPrestamosFinalizados();
        let prestamosData: any[] = [];
        
        // Extraer array de diferentes posibles estructuras
        if (Array.isArray(resPrestamos)) {
          prestamosData = resPrestamos;
        } else if (resPrestamos && Array.isArray(resPrestamos.data)) {
          prestamosData = resPrestamos.data;
        } else if (resPrestamos && resPrestamos.data && typeof resPrestamos.data === 'object') {
          prestamosData = Object.values(resPrestamos.data);
        }
        
        console.log('📋 Préstamos cargados:', prestamosData);
        
        // Filtrar solo préstamos con estado 0 (Finalizados) y espacio null
        prestamosFinalizados = prestamosData
          .filter((prest: any) => {
            const estado = prest.estado;
            const espaNull = prest.id_espac === null || prest.id_espac === undefined;
            console.log(`Préstamo ${prest.id_prest}: estado=${estado}, espacio=${prest.id_espac}, ¿es válido?=${estado === 0 && espaNull}`);
            return estado === 0 && espaNull;
          })
          .map((prest: any) => ({ ...prest, tipo: 'prestamo' }));
          
        console.log('✅ Préstamos finalizados encontrados:', prestamosFinalizados.length);
      } catch (errorPrestamo) {
        console.error('Error cargando préstamos:', errorPrestamo);
        prestamosFinalizados = [];
      }
      
      // Cargar solicitudes de espacios finalizados (estado 5)
      let espaciosCompletados: any[] = [];
      try {
        const resSolicitudes = await solicitudesService.getAll();
        let solicitudesData: any[] = [];
        
        // Extraer array de diferentes posibles estructuras
        if (Array.isArray(resSolicitudes)) {
          solicitudesData = resSolicitudes;
        } else if (resSolicitudes && Array.isArray(resSolicitudes.data)) {
          solicitudesData = resSolicitudes.data;
        } else if (resSolicitudes && resSolicitudes.data && typeof resSolicitudes.data === 'object') {
          solicitudesData = Object.values(resSolicitudes.data);
        }
        
        console.log('📋 Solicitudes cargadas:', solicitudesData);
        
        // Ver todos los estados de espacios para debug
        const espacios = solicitudesData.filter((sol: any) => sol.id_espa !== null && sol.id_espa !== undefined);
        console.log('🏢 Espacios encontrados:', espacios.length);
        espacios.forEach((sol: any) => {
          console.log(`   Solicitud ${sol.id_soli}: est_soli=${sol.est_soli}, id_estado_solicitud=${sol.id_estado_solicitud}`);
        });
        
        // Filtrar solo solicitudes de espacios FINALIZADOS
        espaciosCompletados = solicitudesData
          .filter(
            (sol: any) =>
              (sol.id_espa !== null && sol.id_espa !== undefined) && // Solo espacios
              (sol.est_soli?.toLowerCase() === 'finalizado' || sol.est_soli?.toLowerCase() === 'completado') // Estado = Finalizado
          )
          .map((sol: any) => {
            console.log(`✅ Incluido - Solicitud ${sol.id_soli}: espacio=${sol.id_espa}, est_soli=${sol.est_soli}`);
            return { ...sol, tipo: 'solicitud' };
          });
          
        console.log('✅ Espacios finalizados encontrados:', espaciosCompletados.length);
      } catch (errorEspacios) {
        console.error('Error cargando espacios:', errorEspacios);
        espaciosCompletados = [];
      }
      
      setTickets(ticketsFinalizados);
      setPrestamos(prestamosFinalizados);
      setEspacios(espaciosCompletados);
      
      // Extraer categorías (solo para préstamos)
      const todasLasCategorias = new Set<string>();
      prestamosFinalizados.forEach((prest: any) => {
        if (prest.nom_cat) todasLasCategorias.add(prest.nom_cat);
      });
      
      setCategorias(Array.from(todasLasCategorias).sort());
      setPaginaActual(1);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudo cargar el historial');
    } finally {
      setCargando(false);
    }
  };

  const datosFiltrados = (tab === 'tickets' ? tickets : tab === 'prestamos' ? prestamos : espacios).filter((item: any) => {
    const nombre = tab === 'tickets' 
      ? (item.titulo_ticket || item.titulo || '')
      : (item as any).nom_espa || (item as any).nom_elem || '';
    const cumpleBusqueda = busqueda
      ? nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (item as any).nom_estado?.toLowerCase().includes(busqueda.toLowerCase()) ||
        (item as any).estado_ticket?.toLowerCase().includes(busqueda.toLowerCase())
      : true;
    
    // Filtro por categoría (solo para préstamos)
    const cumpleCategoria = tab === 'prestamos' ? (categoria ? (item as any).nom_cat === categoria : true) : true;
    
    // Filtro por subcategoría (solo para préstamos)
    const cumpleSubcategoria = tab === 'prestamos' ? (subcategoria ? (item as any).nom_cat === subcategoria : true) : true;
    
    // Filtro por fechas
    let cumpleFechas = true;
    if (fechaInicio || fechaFin) {
      let fechaStr = '';
      if (tab === 'tickets') {
        fechaStr = (item as any).fecha_actualizacion || (item as any).fecha_creacion || '';
      } else if (tab === 'prestamos') {
        fechaStr = (item as any).fecha_entreg || (item as any).fecha_ini || '';
      } else {
        fechaStr = (item as any).fecha_ini || '';
      }
      
      if (fechaStr) {
        const fecha = new Date(fechaStr);
        if (fechaInicio) {
          const inicio = new Date(fechaInicio);
          cumpleFechas = cumpleFechas && fecha >= inicio;
        }
        if (fechaFin) {
          const fin = new Date(fechaFin);
          fin.setHours(23, 59, 59, 999);
          cumpleFechas = cumpleFechas && fecha <= fin;
        }
      }
    }
    
    return cumpleBusqueda && cumpleCategoria && cumpleSubcategoria && cumpleFechas;
  });

  const totalPaginas = Math.max(1, Math.ceil(datosFiltrados.length / itemsPorPagina));
  const datosPagina = datosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const limpiarFiltros = () => {
    setBusqueda('');
    setPaginaActual(1);
  };

  const irADetalle = (item: any) => {
    if (tab === 'tickets') {
      navigation.navigate('DetallesTicket', { ticket: item });
    } else if (tab === 'prestamos') {
      navigation.navigate('DetallesPrestamo', { prestamo: item });
    } else {
      navigation.navigate('DetallesSolicitud', { solicitud: item });
    }
  };

  const exportarACSV = async () => {
    try {
      const datosAExportar = tab === 'tickets' ? tickets : tab === 'prestamos' ? prestamos : espacios;
      
      if (datosAExportar.length === 0) {
        Alert.alert('Sin datos', 'No hay registros para exportar');
        return;
      }

      // Preparar datos para CSV
      let datosParaExcel: any[] = [];
      let headers: string[] = [];

      if (tab === 'tickets') {
        headers = ['ID', 'Título', 'Estado', 'Usuario', 'Fecha', 'Descripción'];
        datosParaExcel = datosAExportar.map((t: any) => ({
          'ID': t.id_ticket || t.id,
          'Título': t.titulo_ticket || t.titulo || '',
          'Estado': t.estado_ticket || t.estado || '',
          'Usuario': t.nom_usu || t.nombre_usuario || '',
          'Fecha': new Date(t.fecha_actualizacion || t.fecha_creacion || '').toLocaleDateString('es-ES'),
          'Descripción': t.descripcion_ticket || t.descripcion || ''
        }));
      } else if (tab === 'prestamos') {
        headers = ['ID', 'Elemento', 'Categoría', 'Usuario', 'Fecha', 'Estado'];
        datosParaExcel = datosAExportar.map((p: any) => ({
          'ID': p.id_prest,
          'Elemento': p.nom_elem,
          'Categoría': p.nom_cat,
          'Usuario': p.nom_usu,
          'Fecha': new Date(p.fecha_entreg || p.fecha_ini).toLocaleDateString('es-ES'),
          'Estado': p.nom_estado || (p.estado === 0 ? 'Finalizado' : 'Activo')
        }));
      } else {
        // Espacios
        headers = ['ID', 'Espacio', 'Usuario', 'Fecha', 'Estado'];
        datosParaExcel = datosAExportar.map((e: any) => ({
          'ID': e.id_soli,
          'Espacio': e.nom_espa || '',
          'Usuario': e.nom_usu,
          'Fecha': new Date(e.fecha_ini).toLocaleDateString('es-ES'),
          'Estado': e.nom_estado
        }));
      }

      // Crear Excel usando XLSX
      const ws = XLSX.utils.json_to_sheet(datosParaExcel);
      const wb = XLSX.utils.book_new();
      const nombreHoja = tab === 'tickets' ? 'Tickets' : tab === 'prestamos' ? 'Préstamos' : 'Espacios';
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja);

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 25 },  // Título/Elemento/Espacio
        { wch: 15 },  // Estado/Categoría
        { wch: 20 },  // Usuario
        { wch: 15 },  // Fecha
        { wch: 20 }   // Descripción/Estado
      ];
      ws['!cols'] = colWidths;

      // Generar nombre del archivo
      const nombreArchivo = tab === 'tickets' 
        ? `tickets_historial_${new Date().toISOString().split('T')[0]}.xlsx`
        : tab === 'prestamos'
        ? `prestamos_historial_${new Date().toISOString().split('T')[0]}.xlsx`
        : `espacios_historial_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Generar Excel en base64
      try {
        const excelData = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        
        // Convertir base64 a string para compartir
        const message = `Archivo Excel generado: ${nombreArchivo}\n\nDatos: ${datosAExportar.length} registros`;
        
        // Usar Share API de React Native
        await Share.share({
          message: message,
          title: nombreArchivo,
          url: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelData}`,
        });
        Alert.alert('Éxito', 'Datos exportados correctamente');
      } catch (shareError: any) {
        if (shareError.message !== 'User did not share') {
          console.error('Error al compartir:', shareError);
          Alert.alert('Error', 'No se pudo compartir los datos');
        }
      }
    } catch (error) {
      console.error('Error exportando:', error);
      Alert.alert('Error', 'No se pudo exportar los datos: ' + (error as Error).message);
    }
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
      {/* Header Principal */}
      <HeaderTecnico title="Historial" navigation={navigation} />

      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: '#f5f5f5', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
        <TouchableOpacity
          onPress={() => {
            setTab('tickets');
            setPaginaActual(1);
          }}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderBottomWidth: tab === 'tickets' ? 3 : 0,
            borderBottomColor: '#3fbb34',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: tab === 'tickets' ? '700' : '500',
              color: tab === 'tickets' ? '#3fbb34' : '#999',
            }}
          >
            🎫 Tickets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setTab('prestamos');
            setPaginaActual(1);
          }}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderBottomWidth: tab === 'prestamos' ? 3 : 0,
            borderBottomColor: '#3fbb34',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: tab === 'prestamos' ? '700' : '500',
              color: tab === 'prestamos' ? '#3fbb34' : '#999',
            }}
          >
            📦 Préstamos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setTab('espacios');
            setPaginaActual(1);
          }}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderBottomWidth: tab === 'espacios' ? 3 : 0,
            borderBottomColor: '#3fbb34',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: tab === 'espacios' ? '700' : '500',
              color: tab === 'espacios' ? '#3fbb34' : '#999',
            }}
          >
            🏢 Espacios
          </Text>
        </TouchableOpacity>
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

      {/* Panel de Filtros Compacto */}
      {mostrarFiltros && (
        <ScrollView style={{ backgroundColor: '#fafafa', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
          {/* Búsqueda por Nombre */}
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#666', marginBottom: 4 }}>
              🔍 Buscar
            </Text>
            <TextInput
              placeholder="Nombre o estado..."
              value={busqueda}
              onChangeText={(text) => {
                setBusqueda(text);
                setPaginaActual(1);
              }}
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 5,
                paddingHorizontal: 8,
                paddingVertical: 6,
                fontSize: 12,
                color: '#333',
              }}
            />
          </View>

          {/* Filtro por Categoría */}
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#666', marginBottom: 4 }}>
              📦 Categoría
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 4 }}
            >
              <TouchableOpacity
                onPress={() => {
                  setCategoria('');
                  setSubcategoria('');
                  setPaginaActual(1);
                }}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 16,
                  backgroundColor: categoria === '' ? '#3fbb34' : '#e0e0e0',
                  marginRight: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: categoria === '' ? '#fff' : '#666',
                  }}
                >
                  Todas
                </Text>
              </TouchableOpacity>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    setCategoria(cat);
                    setSubcategoria('');
                    setPaginaActual(1);
                  }}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 16,
                    backgroundColor: categoria === cat ? '#3fbb34' : '#e0e0e0',
                    marginRight: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: categoria === cat ? '#fff' : '#666',
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filtro por Subcategoría */}
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#666', marginBottom: 4 }}>
              📂 Subcategoría
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 4 }}
            >
              <TouchableOpacity
                onPress={() => {
                  setSubcategoria('');
                  setPaginaActual(1);
                }}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 16,
                  backgroundColor: subcategoria === '' ? '#3fbb34' : '#e0e0e0',
                  marginRight: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: subcategoria === '' ? '#fff' : '#666',
                  }}
                >
                  Todas
                </Text>
              </TouchableOpacity>
              {tab === 'prestamos' && Array.from(
                new Set(
                  prestamos
                    .filter((item: any) => !categoria || item.nom_cat === categoria)
                    .map((item: any) => (item as any).nom_cat)
                    .filter((v: any) => v)
                )
              ).sort().map((subcat) => (
                <TouchableOpacity
                  key={subcat}
                  onPress={() => {
                    setSubcategoria(subcat);
                    setPaginaActual(1);
                  }}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 16,
                    backgroundColor: subcategoria === subcat ? '#3fbb34' : '#e0e0e0',
                    marginRight: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: subcategoria === subcat ? '#fff' : '#666',
                    }}
                  >
                    {subcat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filtro por Fechas en una sola fila */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#666', marginBottom: 3 }}>
                📅 Desde
              </Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={fechaInicio}
                onChangeText={(text) => {
                  setFechaInicio(text);
                  setPaginaActual(1);
                }}
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 5,
                  paddingHorizontal: 6,
                  paddingVertical: 5,
                  fontSize: 11,
                  color: '#333',
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#666', marginBottom: 3 }}>
                📅 Hasta
              </Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={fechaFin}
                onChangeText={(text) => {
                  setFechaFin(text);
                  setPaginaActual(1);
                }}
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 5,
                  paddingHorizontal: 6,
                  paddingVertical: 5,
                  fontSize: 11,
                  color: '#333',
                }}
              />
            </View>
          </View>

          {/* Botón Limpiar Filtros */}
          {(busqueda || fechaInicio || fechaFin || categoria || subcategoria) && (
            <TouchableOpacity
              onPress={() => {
                setBusqueda('');
                setFechaInicio('');
                setFechaFin('');
                setCategoria('');
                setSubcategoria('');
                setPaginaActual(1);
              }}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                backgroundColor: '#ff9800',
                borderRadius: 4,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>
                🗑️ Limpiar
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Lista de Datos - Tickets */}
      {tab === 'tickets' && (
        <>
          {datosFiltrados.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: '#999', textAlign: 'center', marginHorizontal: 20 }}>
                {tickets.length === 0 ? 'No hay tickets en el historial' : 'No hay resultados con los filtros seleccionados'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={datosPagina}
              keyExtractor={(item: any) => `tickets-${item.id_soli}`}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  onPress={() => irADetalle(item)}
                  style={estilosCard.tickets.container as any}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ ...estilosCard.tickets.titulo, flex: 1 }}>
                      {item.titulo_ticket || item.titulo}
                    </Text>
                    <View
                      style={{
                        backgroundColor: getColorEstado(item.estado_ticket || 'Sin estado'),
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 12,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>
                        {item.estado_ticket || 'Sin estado'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 6 }}>
                    <Text style={estilosCard.tickets.subtitulo}>Descripción</Text>
                    <Text style={estilosCard.tickets.contenido}>
                      {(item.descripcion_ticket || item.descripcion || 'Sin descripción').substring(0, 60)}...
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={estilosCard.tickets.subtitulo}>Usuario</Text>
                      <Text style={estilosCard.tickets.contenido}>{item.nom_usu || 'N/A'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={estilosCard.tickets.subtitulo}>Fecha</Text>
                      <Text style={estilosCard.tickets.contenido}>
                        {new Date(item.fecha_actualizacion || item.fecha_creacion || new Date()).toLocaleDateString('es-ES', {
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
        </>
      )}

      {/* Lista de Datos - Préstamos */}
      {tab === 'prestamos' && (
        <>
          {datosFiltrados.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: '#999', textAlign: 'center', marginHorizontal: 20 }}>
                {prestamos.length === 0 ? 'No hay préstamos en el historial' : 'No hay resultados con los filtros seleccionados'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={datosPagina}
              keyExtractor={(item: any) => `prestamos-${item.id_prest}`}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  onPress={() => irADetalle(item)}
                  style={estilosCard.prestamos.container as any}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ ...estilosCard.prestamos.titulo, flex: 1 }}>
                      {item.nom_elem || 'Sin nombre'}
                    </Text>
                    <View
                      style={{
                        backgroundColor: getColorEstado(item.nom_estado || 'Sin estado'),
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 12,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>
                        {item.nom_estado || 'Sin estado'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 6 }}>
                    <Text style={estilosCard.prestamos.subtitulo}>Categoría</Text>
                    <Text style={estilosCard.prestamos.contenido}>
                      {item.nom_cat || 'Sin categoría'}
                    </Text>
                  </View>

                  <View style={{ marginBottom: 6 }}>
                    <Text style={estilosCard.prestamos.subtitulo}>Tipo</Text>
                    <Text style={estilosCard.prestamos.contenido}>
                      {item.tipo_pres || 'N/A'}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={estilosCard.prestamos.subtitulo}>Usuario</Text>
                      <Text style={estilosCard.prestamos.contenido}>{item.nom_usu || 'N/A'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={estilosCard.prestamos.subtitulo}>Fecha</Text>
                      <Text style={estilosCard.prestamos.contenido}>
                        {new Date(item.fecha_entreg || new Date()).toLocaleDateString('es-ES', {
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
        </>
      )}

      {/* Lista de Datos - Espacios */}
      {tab === 'espacios' && (
        <>
          {datosFiltrados.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: '#999', textAlign: 'center', marginHorizontal: 20 }}>
                {espacios.length === 0 ? 'No hay espacios en el historial' : 'No hay resultados con los filtros seleccionados'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={datosPagina}
              keyExtractor={(item: any) => `espacios-${item.id_soli}`}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  onPress={() => irADetalle(item)}
                  style={estilosCard.espacios.container as any}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ ...estilosCard.espacios.titulo, flex: 1 }}>
                      {item.nom_espa || 'Sin nombre'}
                    </Text>
                    <View
                      style={{
                        backgroundColor: getColorEstado(item.nom_estado || 'Sin estado'),
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 12,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>
                        {item.nom_estado || 'Sin estado'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 6 }}>
                    <Text style={estilosCard.espacios.subtitulo}>Descripción</Text>
                    <Text style={estilosCard.espacios.contenido}>
                      {((item.descripcion || item.nom_cat || 'Sin descripción') as string).substring(0, 60)}...
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={estilosCard.espacios.subtitulo}>Usuario</Text>
                      <Text style={estilosCard.espacios.contenido}>{item.nom_usu || 'N/A'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={estilosCard.espacios.subtitulo}>Fecha</Text>
                      <Text style={estilosCard.espacios.contenido}>
                        {new Date(item.fecha_ini || new Date()).toLocaleDateString('es-ES', {
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
        </>
      )}

      {/* Paginación */}
      {datosFiltrados.length > 0 && (
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

      {/* Botón Exportar */}
      <TouchableOpacity
        onPress={exportarACSV}
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
          📊 Exportar a Excel
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HistorialTecnico;
