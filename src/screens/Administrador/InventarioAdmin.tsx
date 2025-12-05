import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { elementosService } from '../../services/Api';

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
  });
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchElementos();
  }, []);

  const fetchElementos = async () => {
    setLoading(true);
    try {
      const res = await elementosService.getAll();
      const raw = res.data || [];
      const normalizados = Array.isArray(raw)
        ? raw.map((el: any) => ({
            id: el.id_elemen || el.id || el.id_elemento || Math.random(),
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
    setEditData({
      nombre: elem.nombre || '',
      estado: elem.estado !== undefined ? String(elem.estado) : '1',
      observaciones: elem.observaciones || '',
      componentes: elem.componentes || '',
      serie: elem.serie || '',
      marca: elem.marca || '',
      categoria: elem.categoria || '',
    });
    setEditModalVisible(true);
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
      setMessage('Elemento actualizado correctamente');
      await fetchElementos();
    } catch (e) {
      setMessage('Error al actualizar el elemento');
    }
    setSaving(false);
    setEditModalVisible(false);
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
    <View style={styles.container}>
      {message && (
        <View style={{backgroundColor: '#e0f7fa', padding: 10, margin: 10, borderRadius: 8}}>
          <Text style={{color: '#00796b', textAlign: 'center'}}>{message}</Text>
        </View>
      )}
      <Text style={styles.title}>Inventario</Text>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#3b82f6" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, categoría, serie o marca..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={elementosFiltrados}
          keyExtractor={item => (item && item.id !== undefined && item.id !== null ? item.id.toString() : Math.random().toString())}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View style={styles.inventoryCard}>
              <View style={styles.inventoryBadge} />
              <View style={styles.inventoryIconWrap}>
                {item.categoria === 'Portátil' && <MaterialIcons name="laptop" size={60} color="#28a745" style={styles.inventoryIcon} />}
                {item.categoria === 'Equipo de Escritorio' && <MaterialIcons name="desktop-windows" size={60} color="#28a745" style={styles.inventoryIcon} />}
                {item.categoria === 'Televisor' && <MaterialIcons name="tv" size={60} color="#28a745" style={styles.inventoryIcon} />}
                {item.categoria === 'Accesorio' && <MaterialIcons name="settings" size={60} color="#28a745" style={styles.inventoryIcon} />}
                {['Portátil','Equipo de Escritorio','Televisor','Accesorio'].indexOf(item.categoria) === -1 && <MaterialIcons name="devices" size={60} color="#28a745" style={styles.inventoryIcon} />}
              </View>
              <View style={styles.inventoryInfoWrap}>
                <Text style={styles.inventoryName}>{item.nombre ? `Nombre: ${item.nombre}` : 'Nombre: (sin dato)'}</Text>
                <Text style={styles.inventoryCategoria}>{item.categoria ? `Categoría: ${item.categoria}` : 'Categoría: (sin dato)'}</Text>
                <Text style={styles.inventorySerie}>{item.serie ? `Serie: ${item.serie}` : 'Serie: (sin dato)'}</Text>
                <Text style={styles.inventoryMarca}>{item.marca ? `Marca: ${item.marca}` : 'Marca: (sin dato)'}</Text>
                <Text style={styles.inventoryMarca}>{item.estado !== undefined ? `Estado: ${item.estado}` : 'Estado: (sin dato)'}</Text>
                <Text style={styles.inventoryMarca}>{item.observaciones ? `Observaciones: ${item.observaciones}` : 'Observaciones: (sin dato)'}</Text>
                <Text style={styles.inventoryMarca}>{item.componentes ? `Componentes: ${item.componentes}` : 'Componentes: (sin dato)'}</Text>
              </View>
              <TouchableOpacity style={styles.inventoryEditBtn} onPress={() => handleEdit(item)}>
                <MaterialIcons name="edit" size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.webModalContent}>
            <Text style={styles.webModalTitle}>Editar Elemento</Text>
            <View style={styles.webModalBody}>
              <View style={styles.webFieldGroup}><Text style={styles.webLabel}>Nombre</Text>
                <TextInput style={styles.webInput} value={editData.nombre} onChangeText={v => setEditData({ ...editData, nombre: v })} placeholder="Nombre" />
              </View>
              <View style={styles.webFieldGroup}><Text style={styles.webLabel}>Estado</Text>
                <TextInput style={styles.webInput} value={editData.estado} onChangeText={v => setEditData({ ...editData, estado: v })} placeholder="1=Activo, 0=Inactivo" keyboardType="numeric" />
              </View>
              <View style={styles.webFieldGroup}><Text style={styles.webLabel}>Observaciones</Text>
                <TextInput style={styles.webInput} value={editData.observaciones} onChangeText={v => setEditData({ ...editData, observaciones: v })} placeholder="Observaciones" multiline />
              </View>
              <View style={styles.webFieldGroup}><Text style={styles.webLabel}>Componentes</Text>
                <TextInput style={styles.webInput} value={editData.componentes} onChangeText={v => setEditData({ ...editData, componentes: v })} placeholder="Componentes" multiline />
              </View>
              <View style={styles.webFieldGroup}><Text style={styles.webLabel}>Serie</Text>
                <TextInput style={styles.webInput} value={editData.serie} onChangeText={v => setEditData({ ...editData, serie: v })} placeholder="Serie" />
              </View>
              <View style={styles.webFieldGroup}><Text style={styles.webLabel}>Marca</Text>
                <TextInput style={styles.webInput} value={editData.marca} onChangeText={v => setEditData({ ...editData, marca: v })} placeholder="Marca" />
              </View>
              <View style={styles.webFieldGroup}><Text style={styles.webLabel}>Categoría</Text>
                <TextInput style={styles.webInput} value={editData.categoria} onChangeText={v => setEditData({ ...editData, categoria: v })} placeholder="Categoría" />
              </View>
            </View>
            <View style={styles.webModalActions}>
              <TouchableOpacity style={styles.webCancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.webCancelText}>Cancelar</Text>
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
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e6ed',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  inventoryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 22,
    marginVertical: 14,
    marginHorizontal: 8,
    padding: 18,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#28a745',
    position: 'relative',
    minHeight: 140,
  },
  inventoryBadge: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 38,
    width: '100%',
    backgroundColor: '#28a745',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    zIndex: 1,
  },
  inventoryIconWrap: {
    marginRight: 18,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 70,
  },
  inventoryIcon: {
    alignSelf: 'center',
    zIndex: 2,
  },
  inventoryInfoWrap: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 8,
    marginLeft: 2,
    zIndex: 2,
  },
  inventoryName: {
    fontSize: 20,
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: 2,
    marginTop: 2,
  },
  inventoryCategoria: {
    fontSize: 16,
    color: '#8b5cf6',
    marginTop: 2,
    fontWeight: 'bold',
  },
  inventorySerie: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 2,
  },
  inventoryMarca: {
    fontSize: 15,
    color: '#28a745',
    marginTop: 2,
  },
  inventoryEditBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#28a745',
    borderRadius: 20,
    padding: 12,
    borderWidth: 2,
    borderColor: '#218838',
    elevation: 4,
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  webModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 18,
    textAlign: 'center',
  },
  webModalBody: {
    backgroundColor: '#fcfcfc',
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
    backgroundColor: '#fff',
    fontSize: 16,
  },
  webModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  webCancelBtn: {
    backgroundColor: '#fff',
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
