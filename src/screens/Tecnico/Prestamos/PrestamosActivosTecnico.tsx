import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import HeaderTecnico from '../HeaderTecnico/HeaderTecnico';
import { SolicitudesTecnicoStyles } from '../../../styles/Tecnico/Solicitudes/SolicitudesTecnico';
import { authService } from '../../../services/Api';

interface Prestamo {
  id_prest: number;
  nom_elem: string;
  nom_cat: string;
  nom_subcateg: string;
  nom_usu: string;
  fecha_ini: string;
  nom_estado: string;
  id_estado_prestamo: number;
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

export default function PrestamosActivosTecnico({ navigation }: any) {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState('');
  const [busquedaMarca, setBusquedaMarca] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarCalendarioInicio, setMostrarCalendarioInicio] = useState(false);
  const [mostrarCalendarioFin, setMostrarCalendarioFin] = useState(false);
  const [mesActualInicio, setMesActualInicio] = useState(new Date());
  const [mesActualFin, setMesActualFin] = useState(new Date());

  useFocusEffect(
    React.useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [dataPrestamos, dataCategorias, dataSubcategorias] = await Promise.all([
        authService.obtenerPrestamosActivos(),
        authService.obtenerCategorias(),
        authService.obtenerSubcategorias(),
      ]);

      setPrestamos(Array.isArray(dataPrestamos) ? dataPrestamos : []);
      setCategorias(Array.isArray(dataCategorias) ? dataCategorias : []);
      setSubcategorias(Array.isArray(dataSubcategorias) ? dataSubcategorias : []);
      setPaginaActual(1);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los préstamos');
      setPrestamos([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar subcategorías según la categoría seleccionada
  const subcategoriasFiltradas = categoriaFiltro
    ? subcategorias.filter(sub => {
        const categoria = categorias.find(cat => cat.nom_cat === categoriaFiltro);
        return categoria && sub.id_cat === categoria.id;
      })
    : subcategorias;

  const generarDiasDelMes = (fecha: Date) => {
    const year = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(year, mes, 1);
    const ultimoDia = new Date(year, mes + 1, 0);
    const dias: (number | null)[] = [];

    const diasAnteriores = primerDia.getDay();
    for (let i = 0; i < diasAnteriores; i++) {
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
    setPaginaActual(1);
  };

  const seleccionarFechaFin = (dia: number) => {
    setFechaFin(formatearFecha(dia, mesActualFin));
    setMostrarCalendarioFin(false);
    setPaginaActual(1);
  };

  const renderCalendario = (dias: (number | null)[], esInicio: boolean) => {
    const dias_semana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];
    const mesActual = esInicio ? mesActualInicio : mesActualFin;
    const setMes = esInicio ? setMesActualInicio : setMesActualFin;
    const seleccionar = esInicio ? seleccionarFechaInicio : seleccionarFechaFin;

    return (
      <View style={{ padding: 15 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <TouchableOpacity onPress={() => setMes(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))}>
            <Text style={{ fontSize: 18, color: '#3fbb34', fontWeight: '700' }}>◄</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#333' }}>
            {mesActual.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => setMes(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))}>
            <Text style={{ fontSize: 18, color: '#3fbb34', fontWeight: '700' }}>►</Text>
          </TouchableOpacity>
        </View>

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
              onPress={() => dia && seleccionar(dia)}
              style={{
                width: '14.28%',
                paddingVertical: 8,
                alignItems: 'center',
                backgroundColor: dia ? '#f0f0f0' : 'transparent',
                borderRadius: 4,
                marginBottom: 5,
              }}
            >
              <Text style={{ color: dia ? '#333' : '#ccc', fontWeight: '500', fontSize: 12 }}>
                {dia}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const prestamosFiltrados = prestamos.filter((prest) => {
    const cumpleCategoria = categoriaFiltro
      ? prest.nom_cat?.toLowerCase() === categoriaFiltro.toLowerCase()
      : true;
    
    const cumpleSubcategoria = subcategoriaFiltro
      ? prest.nom_subcateg?.toLowerCase() === subcategoriaFiltro.toLowerCase()
      : true;
    
    const cumpleMarca = busquedaMarca
      ? prest.nom_elem?.toLowerCase().includes(busquedaMarca.toLowerCase())
      : true;

    let cumpleFecha = true;
    if (fechaInicio || fechaFin) {
      const fecha = new Date(prest.fecha_ini);
      const inicio = fechaInicio ? new Date(fechaInicio) : new Date('1900-01-01');
      const fin = fechaFin ? new Date(fechaFin) : new Date('2099-12-31');
      cumpleFecha = fecha >= inicio && fecha <= fin;
    }

    return cumpleCategoria && cumpleSubcategoria && cumpleMarca && cumpleFecha;
  });

  const itemsPorPagina = 5;
  const totalPaginas = Math.max(1, Math.ceil(prestamosFiltrados.length / itemsPorPagina));
  const prestamosPagina = prestamosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const irADetalles = (prestamo: Prestamo) => {
    navigation.navigate('DetallesPrestamo', { prestamo });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#3fbb34" />
        <Text style={{ marginTop: 10, color: '#666', fontSize: 14 }}>Cargando préstamos...</Text>
      </View>
    );
  }

  return (
    <View style={SolicitudesTecnicoStyles.container}>
      <HeaderTecnico title="Préstamos Activos" navigation={navigation} />

      <ScrollView style={SolicitudesTecnicoStyles.contentContainer}>
        {/* Filtros Compactos */}
        <View style={{ backgroundColor: '#fff', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
          {/* Categoría y Subcategoría */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            <View style={{ flex: 1, borderWidth: 2, borderColor: '#3fbb34', borderRadius: 6, overflow: 'hidden', backgroundColor: '#f9f9f9', paddingLeft: 10 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#3fbb34', marginTop: 3 }}>Categoría</Text>
              <Picker
                selectedValue={categoriaFiltro}
                onValueChange={(value) => {
                  setCategoriaFiltro(value);
                  setSubcategoriaFiltro('');
                  setPaginaActual(1);
                }}
                style={{ height: 30, paddingHorizontal: 0 }}
              >
                <Picker.Item label="Todos" value="" />
                {categorias.map((cat) => (
                  <Picker.Item key={cat.id} label={cat.nom_cat} value={cat.nom_cat} />
                ))}
              </Picker>
            </View>

            <View style={{ flex: 1, borderWidth: 2, borderColor: '#3fbb34', borderRadius: 6, overflow: 'hidden', backgroundColor: '#f9f9f9', paddingLeft: 10 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#3fbb34', marginTop: 3 }}>Subcategoría</Text>
              <Picker
                selectedValue={subcategoriaFiltro}
                onValueChange={(value) => {
                  setSubcategoriaFiltro(value);
                  setPaginaActual(1);
                }}
                style={{ height: 30, paddingHorizontal: 0 }}
                enabled={categoriaFiltro !== ''}
              >
                <Picker.Item label="Todos" value="" />
                {subcategoriasFiltradas.map((subcat) => (
                  <Picker.Item key={subcat.id} label={subcat.nom_subcateg} value={subcat.nom_subcateg} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Búsqueda por marca */}
          <View style={{ marginBottom: 12 }}>
            <TextInput
              style={{ borderWidth: 2, borderColor: '#3fbb34', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, backgroundColor: '#f9f9f9' }}
              placeholder="🔍 Buscar por Marca"
              placeholderTextColor="#999"
              value={busquedaMarca}
              onChangeText={(text) => {
                setBusquedaMarca(text);
                setPaginaActual(1);
              }}
            />
          </View>

          {/* Fechas */}
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
                  onPress={() => {
                    setFechaInicio('');
                    setPaginaActual(1);
                  }}
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
                  onPress={() => {
                    setFechaFin('');
                    setPaginaActual(1);
                  }}
                >
                  <Text style={{ fontSize: 14, color: '#999' }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Modal Calendario Inicio */}
        <Modal
          visible={mostrarCalendarioInicio}
          transparent
          animationType="fade"
          onRequestClose={() => setMostrarCalendarioInicio(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
              <TouchableOpacity
                onPress={() => setMostrarCalendarioInicio(false)}
                style={{ alignSelf: 'center', marginTop: 10, paddingHorizontal: 10, paddingVertical: 5 }}
              >
                <Text style={{ fontSize: 20, color: '#666' }}>✕</Text>
              </TouchableOpacity>
              {renderCalendario(generarDiasDelMes(mesActualInicio), true)}
            </View>
          </View>
        </Modal>

        {/* Modal Calendario Fin */}
        <Modal
          visible={mostrarCalendarioFin}
          transparent
          animationType="fade"
          onRequestClose={() => setMostrarCalendarioFin(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
              <TouchableOpacity
                onPress={() => setMostrarCalendarioFin(false)}
                style={{ alignSelf: 'center', marginTop: 10, paddingHorizontal: 10, paddingVertical: 5 }}
              >
                <Text style={{ fontSize: 20, color: '#666' }}>✕</Text>
              </TouchableOpacity>
              {renderCalendario(generarDiasDelMes(mesActualFin), false)}
            </View>
          </View>
        </Modal>

        {/* Lista de Préstamos */}
        {prestamosFiltrados.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 16, color: '#999', textAlign: 'center', marginHorizontal: 20 }}>
              {prestamos.length === 0 ? 'No hay préstamos activos' : 'No hay resultados con los filtros seleccionados'}
            </Text>
          </View>
        ) : (
          <>
            {prestamosPagina.map((item) => (
              <TouchableOpacity
                key={item.id_prest}
                onPress={() => irADetalles(item)}
                style={SolicitudesTecnicoStyles.tarjeta}
              >
                <View style={{ marginBottom: 8 }}>
                  <Text style={SolicitudesTecnicoStyles.cardModelo}>
                    {item.nom_elem}
                  </Text>
                </View>

                <Text style={SolicitudesTecnicoStyles.cardInfo}>
                  <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Categoría: </Text>
                  {item.nom_cat}
                </Text>

                <Text style={SolicitudesTecnicoStyles.cardInfo}>
                  <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Usuario: </Text>
                  {item.nom_usu}
                </Text>

                <Text style={SolicitudesTecnicoStyles.cardInfo}>
                  <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Fecha de Inicio: </Text>
                  {new Date(item.fecha_ini).toLocaleString()}
                </Text>

                <Text style={SolicitudesTecnicoStyles.cardInfo}>
                  <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Estado: </Text>
                  <Text style={{ color: '#ffc107', fontWeight: '700' }}>● {item.nom_estado}</Text>
                </Text>
              </TouchableOpacity>
            ))}

            {/* Paginación Mejorada */}
            {prestamosFiltrados.length > 0 && (
              <View style={{ 
                paddingHorizontal: 16, 
                paddingVertical: 16, 
                marginTop: 12,
                backgroundColor: '#fff',
                borderRadius: 8,
              }}>
                {/* Indicador de página */}
                <View style={{ 
                  alignItems: 'center', 
                  marginBottom: 12,
                }}>
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#666', 
                    fontWeight: '600',
                    marginBottom: 4
                  }}>
                    Página {paginaActual} de {totalPaginas}
                  </Text>
                  <Text style={{ 
                    fontSize: 12, 
                    color: '#999',
                  }}>
                    Mostrando {prestamosPagina.length} de {prestamosFiltrados.length} préstamos
                  </Text>
                </View>

                {/* Botones de navegación */}
                <View style={{ 
                  flexDirection: 'row', 
                  gap: 10,
                  justifyContent: 'center',
                }}>
                  <TouchableOpacity
                    onPress={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                    disabled={paginaActual === 1}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      backgroundColor: paginaActual === 1 ? '#f0f0f0' : '#3fbb34',
                      borderRadius: 6,
                      alignItems: 'center',
                      minWidth: 50,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ 
                      fontSize: 16, 
                      color: paginaActual === 1 ? '#ccc' : '#fff', 
                      fontWeight: '700' 
                    }}>
                      ← Anterior
                    </Text>
                  </TouchableOpacity>

                  {/* Indicador visual de progreso */}
                  <View style={{
                    flex: 1,
                    height: 6,
                    backgroundColor: '#e0e0e0',
                    borderRadius: 3,
                    justifyContent: 'center',
                    marginHorizontal: 10,
                  }}>
                    <View style={{
                      height: 6,
                      backgroundColor: '#3fbb34',
                      borderRadius: 3,
                      width: `${(paginaActual / totalPaginas) * 100}%`,
                    }} />
                  </View>

                  <TouchableOpacity
                    onPress={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                    disabled={paginaActual === totalPaginas}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      backgroundColor: paginaActual === totalPaginas ? '#f0f0f0' : '#3fbb34',
                      borderRadius: 6,
                      alignItems: 'center',
                      minWidth: 50,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ 
                      fontSize: 16, 
                      color: paginaActual === totalPaginas ? '#ccc' : '#fff', 
                      fontWeight: '700' 
                    }}>
                      Siguiente →
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

      </ScrollView>
    </View>
  );
}
