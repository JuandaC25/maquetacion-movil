import { useTheme } from '../../context/ThemeContext';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AdminHeader from './AdminHeader/AdminHeader';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { elementosService, subcategoriasService, categoriasService } from '../../services/Api';

type Elemento = {
  id: number;
  nombre: string;
  categoria: string;
  serie: string;
  marca?: string;
  estado?: number;
  observaciones?: string;
  componentes?: string;
  // For modal display only
  [key: string]: any;
};



const InventarioAdmin = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedElem, setSelectedElem] = useState<Elemento | null>(null);
  const [editData, setEditData] = useState({
    nombre: '',
    estado: '1',
    observaciones: '',
    componentes: '',
    serie: '',
    marca: '',
    categoria: '',
    subcategoria: '',
  });
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showSubcategoriaModal, setShowSubcategoriaModal] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [subcategorias, setSubcategorias] = useState<any[]>([]);
  const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState<any[]>([]);

  useEffect(() => {
    fetchElementos();
    fetchCategorias();
    fetchSubcategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const res = await categoriasService.getAll();
      const raw = res.data || [];
      setCategorias(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error('Error al obtener categorías:', e);
      setCategorias([]);
    }
  };

  const fetchSubcategorias = async () => {
    try {
      const res = await subcategoriasService.getAll();
      const raw = res.data || [];
      setSubcategorias(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error('Error al obtener subcategorías:', e);
      setSubcategorias([]);
    }
  };

  const fetchElementos = async () => {
    setLoading(true);
    try {
      const res = await elementosService.getAll();
      const raw = res.data || [];
      const normalizados = Array.isArray(raw)
        ? raw.map((el: any, idx: number) => ({
            id: el.id_elemen || el.id || el.id_elemento || `temp-${idx}-${Date.now()}`,
            nombre: el.nom_eleme || el.nombre || el.nom_elemento || '',
            categoria: el.tip_catg || el.categoria || el.nom_cat || '',
            serie: el.num_seri?.toString() || el.serie || el.num_serie || '',
            marca: el.marc || el.marca || '',
            estado: el.est !== undefined ? el.est : 1,
            observaciones: el.obse || el.observaciones || '',
            componentes: el.componen || el.componentes || '',
          }))
        : [];
      setElementos(normalizados);
    } catch (e) {
      setElementos([
        { id: 1, nombre: 'Laptop Dell XPS', categoria: 'Portátil', serie: 'ABC123', marca: 'Dell' },
        { id: 2, nombre: 'Monitor Samsung', categoria: 'Accesorio', serie: 'XYZ789', marca: 'Samsung' },
        { id: 3, nombre: 'PC Escritorio HP', categoria: 'Equipo de Escritorio', serie: 'QWE456', marca: 'HP' },
      ]);
    }
    setLoading(false);
  };

  const handleEdit = (elem: Elemento) => {
    setSelectedElem(elem);
    // Encontrar la categoría que coincida con el nombre
    const categoriaBuscada = categorias.find((c: any) => 
      (c.nom_cat || c.nombre) === elem.categoria
    );
    const catId = categoriaBuscada?.id || categoriaBuscada?.id_cat || null;
    const filtradas = catId ? subcategorias.filter((s: any) => s.id_cat === catId) : [];
    setSubcategoriasFiltradas(filtradas);
    setEditData({
      nombre: elem.nombre || '',
      estado: elem.estado !== undefined ? String(elem.estado) : '1',
      observaciones: elem.observaciones || '',
      componentes: elem.componentes || '',
      serie: elem.serie || '',
      marca: elem.marca || '',
      categoria: elem.categoria || '',
      subcategoria: elem.subcategoria || '',
    });
    setEditModalVisible(true);
  };

  // Actualizar subcategorías cuando cambia la categoría
  const handleCategoriaChange = (categoriaObj: any) => {
    const catId = categoriaObj.id || categoriaObj.id_cat;
    const filtradas = catId ? subcategorias.filter((s: any) => s.id_cat === catId) : [];
    setSubcategoriasFiltradas(filtradas);
    const nombreCategoria = categoriaObj.nom_cat || categoriaObj.nombre;
    setEditData({
      ...editData,
      categoria: nombreCategoria,
      subcategoria: '', // Limpiar subcategoría al cambiar categoría
    });
  };

  const handleSave = async () => {
    if (!selectedElem) return;
    setSaving(true);
    try {
      // Enviar todos los campos editables
      const payload = {
        id_elem: selectedElem.id,
        nom_elem: editData.nombre,
        est: Number(editData.estado),
        obser: editData.observaciones,
        componentes: editData.componentes,
        num_seri: editData.serie,
        marc: editData.marca,
        tip_catg: editData.categoria,
      };
      await elementosService.update(selectedElem.id, payload);
      setMessage('✅ Elemento actualizado correctamente');
      await fetchElementos();
      setEditModalVisible(false);
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage('❌ Error al actualizar el elemento');
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(null), 3000);
      console.error('Error al guardar:', e);
    }
    setSaving(false);
  };

  const elementosFiltrados = Array.isArray(elementos)
    ? elementos.filter(e => {
        const term = searchTerm.toLowerCase();
        return (
          (e.nombre || '').toLowerCase().includes(term) ||
          (e.categoria || '').toLowerCase().includes(term) ||
          (e.serie || '').toLowerCase().includes(term) ||
          (e.marca || '').toLowerCase().includes(term)
        );
      })
    : [];


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {message && (
        <View style={{
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          padding: 12,
          margin: 10,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: message.includes('✅') ? '#28a745' : '#dc3545'
        }}>
          <Text style={{
            color: message.includes('✅') ? '#155724' : '#721c24',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>{message}</Text>
        </View>
      )}
      <AdminHeader title="Inventario" navigation={navigation} />
      <View style={{ height: 12 }} />
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={colors.primary} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]}
          placeholder="Buscar por nombre, categoría, serie o marca..."
          placeholderTextColor={colors.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={elementosFiltrados}
          keyExtractor={(item, index) => (item && item.id !== undefined && item.id !== null ? item.id.toString() : `elem-${index}`)}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View style={[styles.inventoryCard, { backgroundColor: colors.cardBackground }]}> 
              <View style={styles.inventoryBadge}>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
                  {item.categoria || 'Sin categoría'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingTop: 12 }}>
                <View style={styles.inventoryIconWrap}>
                  {item.categoria === 'Portátil' && <MaterialIcons name="laptop" size={50} color={colors.success} style={styles.inventoryIcon} />}
                  {item.categoria === 'Equipo de Escritorio' && <MaterialIcons name="desktop-windows" size={50} color={colors.success} style={styles.inventoryIcon} />}
                  {item.categoria === 'Televisor' && <MaterialIcons name="tv" size={50} color={colors.success} style={styles.inventoryIcon} />}
                  {item.categoria === 'Accesorio' && <MaterialIcons name="settings" size={50} color={colors.success} style={styles.inventoryIcon} />}
                  {['Portátil','Equipo de Escritorio','Televisor','Accesorio'].indexOf(item.categoria) === -1 && <MaterialIcons name="devices" size={50} color={colors.success} style={styles.inventoryIcon} />}
                </View>
                <View style={styles.inventoryInfoWrap}>
                  <Text style={[styles.inventoryName, { color: colors.textPrimary }]}>
                    {item.nombre || '(sin dato)'}
                  </Text>
                  <Text style={[styles.inventoryCategoria]}>
                    {item.categoria ? `Categoría: ${item.categoria}` : 'Categoría: (sin dato)'}
                  </Text>
                  <Text style={[styles.inventorySerie]}>
                    {item.serie ? `Serie: ${item.serie}` : 'Serie: (sin dato)'}
                  </Text>
                  {item.marca && <Text style={[styles.inventoryMarca]}>{`Marca: ${item.marca}`}</Text>}
                  <Text style={[styles.inventoryMarca]}>
                    Estado: {item.estado === 1 || item.estado === '1' ? 'Activo' : item.estado === 0 || item.estado === '0' ? 'Inactivo' : '(sin dato)'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.inventoryEditBtn} onPress={() => handleEdit(item)}>
                  <MaterialIcons name="edit" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
            <View style={[styles.webModalContent, { backgroundColor: colors.cardBackground }]}> 
            <Text style={[styles.webModalTitle, { color: colors.success }]}>Editar Elemento</Text>
            <ScrollView style={[styles.webModalBody, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={true}>
              <View style={styles.webFieldGroup}><Text style={[styles.webLabel, { color: colors.textPrimary }]}>Nombre</Text>
                <TextInput style={[styles.webInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]} value={editData.nombre} onChangeText={v => setEditData({ ...editData, nombre: v })} placeholder="Nombre del elemento" placeholderTextColor={colors.textSecondary} />
              </View>
              <View style={styles.webFieldGroup}><Text style={[styles.webLabel, { color: colors.textPrimary }]}>Marca</Text>
                <TextInput style={[styles.webInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]} value={editData.marca} onChangeText={v => setEditData({ ...editData, marca: v })} placeholder="Marca" placeholderTextColor={colors.textSecondary} />
              </View>
              <View style={styles.webFieldGroup}><Text style={[styles.webLabel, { color: colors.textPrimary }]}>Número de Serie</Text>
                <TextInput style={[styles.webInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]} value={editData.serie} onChangeText={v => setEditData({ ...editData, serie: v })} placeholder="Serie" placeholderTextColor={colors.textSecondary} />
              </View>
              <View style={styles.webFieldGroup}><Text style={[styles.webLabel, { color: colors.textPrimary }]}>Categoría</Text>
                <TouchableOpacity
                  style={[styles.webInput, { backgroundColor: colors.inputBackground, justifyContent: 'center' }]}
                  onPress={() => setShowCategoriaModal(true)}
                >
                  <Text style={{ color: colors.textPrimary }}>
                    {editData.categoria || 'Seleccionar categoría'}
                  </Text>
                </TouchableOpacity>
                {showCategoriaModal && (
                  <Modal
                    visible={showCategoriaModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowCategoriaModal(false)}
                  >
                    <View style={styles.modalBg}>
                      <View style={[styles.webModalContent, { backgroundColor: colors.cardBackground, maxWidth: 300 }]}> 
                        <Text style={[styles.webModalTitle, { color: colors.title, fontSize: 18 }]}>Selecciona categoría</Text>
                        <ScrollView showsVerticalScrollIndicator={true}>
                          {categorias.length > 0 ? (
                            categorias.map((cat: any, idx: number) => (
                              <TouchableOpacity key={`cat-${Date.now()}-${idx}`} onPress={() => { handleCategoriaChange(cat); setShowCategoriaModal(false); }} style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: colors.inputBackground }}>
                                <Text style={{ color: colors.textPrimary }}>{cat.nom_cat || cat.nombre}</Text>
                              </TouchableOpacity>
                            ))
                          ) : (
                            <Text style={{ padding: 14, color: colors.textSecondary }}>No hay categorías disponibles</Text>
                          )}
                        </ScrollView>
                      </View>
                    </View>
                  </Modal>
                )}
              </View>
              <View style={styles.webFieldGroup}><Text style={[styles.webLabel, { color: colors.textPrimary }]}>Subcategoría</Text>
                <TouchableOpacity
                  style={[styles.webInput, { backgroundColor: colors.inputBackground, justifyContent: 'center' }]}
                  onPress={() => setShowSubcategoriaModal(true)}
                  disabled={subcategoriasFiltradas.length === 0}
                >
                  <Text style={{ color: subcategoriasFiltradas.length === 0 ? colors.textSecondary : colors.textPrimary }}>
                    {editData.subcategoria ? subcategoriasFiltradas.find((s: any) => s.nom_subcateg === editData.subcategoria)?.nom_subcateg || editData.subcategoria : 'Seleccionar subcategoría'}
                  </Text>
                </TouchableOpacity>
                {showSubcategoriaModal && (
                  <Modal
                    visible={showSubcategoriaModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowSubcategoriaModal(false)}
                  >
                    <View style={styles.modalBg}>
                      <View style={[styles.webModalContent, { backgroundColor: colors.cardBackground, maxWidth: 300 }]}> 
                        <Text style={[styles.webModalTitle, { color: colors.title, fontSize: 18 }]}>Selecciona subcategoría</Text>
                        <ScrollView showsVerticalScrollIndicator={true}>
                          {subcategoriasFiltradas.length > 0 ? (
                            subcategoriasFiltradas.map((subcat: any, idx: number) => (
                              <TouchableOpacity key={`subcat-${Date.now()}-${idx}`} onPress={() => { setEditData({ ...editData, subcategoria: subcat.nom_subcateg }); setShowSubcategoriaModal(false); }} style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: colors.inputBackground }}>
                                <Text style={{ color: colors.textPrimary }}>{subcat.nom_subcateg}</Text>
                              </TouchableOpacity>
                            ))
                          ) : (
                            <Text style={{ padding: 14, color: colors.textSecondary }}>No hay subcategorías disponibles</Text>
                          )}
                        </ScrollView>
                      </View>
                    </View>
                  </Modal>
                )}
              </View>
              <View style={styles.webFieldGroup}><Text style={[styles.webLabel, { color: colors.textPrimary }]}>Estado</Text>
                <TouchableOpacity
                  style={[styles.webInput, { backgroundColor: colors.inputBackground, justifyContent: 'center' }]}
                  onPress={() => setShowEstadoModal(true)}
                >
                  <Text style={{ color: colors.textPrimary }}>
                    {editData.estado === '1' ? 'Activo' : 'Inactivo'}
                  </Text>
                </TouchableOpacity>
                {/* Modal para seleccionar estado */}
                {showEstadoModal && (
                  <Modal
                    visible={showEstadoModal}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowEstadoModal(false)}
                  >
                    <View style={styles.modalBg}>
                      <View style={[styles.webModalContent, { backgroundColor: colors.cardBackground, maxWidth: 300 }]}> 
                        <Text style={[styles.webModalTitle, { color: colors.title, fontSize: 18 }]}>Selecciona estado</Text>
                        <ScrollView showsVerticalScrollIndicator={true}>
                          <TouchableOpacity key={`estado-1-${Date.now()}`} onPress={() => { setEditData({ ...editData, estado: '1' }); setShowEstadoModal(false); }} style={{ padding: 14 }}>
                            <Text style={{ color: colors.textPrimary }}>Activo</Text>
                          </TouchableOpacity>
                          <TouchableOpacity key={`estado-0-${Date.now()}`} onPress={() => { setEditData({ ...editData, estado: '0' }); setShowEstadoModal(false); }} style={{ padding: 14 }}>
                            <Text style={{ color: colors.textPrimary }}>Inactivo</Text>
                          </TouchableOpacity>
                        </ScrollView>
                      </View>
                    </View>
                  </Modal>
                )}
              </View>
              <View style={styles.webFieldGroup}><Text style={[styles.webLabel, { color: colors.textPrimary }]}>Observaciones</Text>
                <TextInput style={[styles.webInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]} value={editData.observaciones} onChangeText={v => setEditData({ ...editData, observaciones: v })} placeholder="Observaciones" multiline placeholderTextColor={colors.textSecondary} />
              </View>
              <View style={styles.webFieldGroup}><Text style={[styles.webLabel, { color: colors.textPrimary }]}>Componentes</Text>
                <TextInput style={[styles.webInput, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]} value={editData.componentes} onChangeText={v => setEditData({ ...editData, componentes: v })} placeholder="Componentes" multiline placeholderTextColor={colors.textSecondary} />
              </View>
            </ScrollView>
            <View style={styles.webModalActions}>
              <TouchableOpacity style={[styles.webCancelBtn, { backgroundColor: colors.inputBackground }]} onPress={() => setEditModalVisible(false)}>
                <Text style={[styles.webCancelText, { color: colors.success }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.webSaveBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.webSaveText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    // color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e6ed',
    borderRadius: 8,
    padding: 10,
    // backgroundColor: '#fff',
    fontSize: 16,
  },
  inventoryCard: {
    flexDirection: 'column',
    alignItems: 'stretch',
    borderRadius: 16,
    marginVertical: 12,
    marginHorizontal: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: '#fff',
  },
  inventoryBadge: {
    height: 44,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    zIndex: 1,
  },
  inventoryIconWrap: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    paddingVertical: 12,
  },
  inventoryIcon: {
    alignSelf: 'center',
    zIndex: 2,
  },
  inventoryInfoWrap: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 60,
    paddingBottom: 12,
    zIndex: 2,
  },
  inventoryName: {
    fontSize: 18,
    color: '#1a1a1a',
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 0,
  },
  inventoryCategoria: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 4,
    fontWeight: '600',
  },
  inventorySerie: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
    fontWeight: '500',
  },
  inventoryMarca: {
    fontSize: 13,
    color: '#555',
    marginTop: 3,
    fontWeight: '500',
  },
  inventoryEditBtn: {
    position: 'absolute',
    top: 56,
    right: 12,
    backgroundColor: '#28a745',
    borderRadius: 24,
    padding: 10,
    borderWidth: 0,
    elevation: 5,
    zIndex: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webModalContent: {
    // backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  webModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    // color: '#28a745',
    marginBottom: 18,
    textAlign: 'center',
  },
  webModalBody: {
    // backgroundColor: '#fcfcfc',
    borderRadius: 8,
    paddingVertical: 8,
    marginBottom: 10,
  },
  webFieldGroup: {
    marginBottom: 16,
  },
  webLabel: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
    fontSize: 16,
  },
  webInput: {
    borderWidth: 1,
    borderColor: '#e0e6ed',
    borderRadius: 8,
    padding: 12,
    // backgroundColor: '#fff',
    fontSize: 16,
  },
  webModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  webCancelBtn: {
    // backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderWidth: 2,
    borderColor: '#28a745',
  },
  webCancelText: {
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: 16,
  },
  webSaveBtn: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginLeft: 12,
  },
  webSaveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default InventarioAdmin;
