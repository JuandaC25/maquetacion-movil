import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { usuariosService } from '../../services/Api';
import DateTimePicker from '@react-native-community/datetimepicker';

type Usuario = {
  id: number;
  nom_us: string;
  ape_us: string;
  corre: string;
};

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({ nom_us: '', ape_us: '', corre: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await usuariosService.getAll();
      setUsuarios(res.data as Usuario[] || []);
    } catch (e) {
      setUsuarios([]);
    }
    setLoading(false);
  };

  const handleEdit = (user: Usuario) => {
    setSelectedUser(user);
    setEditData({ nom_us: user.nom_us, ape_us: user.ape_us, corre: user.corre });
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await usuariosService.update((selectedUser as Usuario).id, editData);
      fetchUsuarios();
    } catch (e) {}
    setSaving(false);
  };

  const filteredUsuarios = usuarios.filter(u =>
    `${u.nom_us} ${u.ape_us}`.toLowerCase().includes(search.toLowerCase()) ||
    (u.corre || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestionar Usuarios</Text>
      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={18} color="#28a745" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuario..."
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#28a745" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredUsuarios}
          keyExtractor={item => (item && item.id ? item.id.toString() : Math.random().toString())}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View style={styles.cardPresentation}>
              <View style={styles.avatarContainer}>
                <FontAwesome5 name="user" size={54} color="#28a745" style={styles.avatarIcon} />
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.userName}>{item.nom_us} {item.ape_us}</Text>
                <Text style={styles.userEmail}>{item.corre}</Text>
              </View>
              <TouchableOpacity style={styles.editBtnPresentation} onPress={() => handleEdit(item)}>
                <MaterialIcons name="edit" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={editData.nom_us}
              onChangeText={v => setEditData({ ...editData, nom_us: v })}
            />
            <TextInput
              style={styles.input}
              placeholder="Apellido"
              value={editData.ape_us}
              onChangeText={v => setEditData({ ...editData, ape_us: v })}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo"
              value={editData.corre}
              onChangeText={v => setEditData({ ...editData, corre: v })}
              keyboardType="email-address"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={{ color: '#28a745', fontWeight: 'bold' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{saving ? 'Guardando...' : 'Guardar'}</Text>
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
    backgroundColor: '#f5f7fa', // fondo claro
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 28,
    color: '#28a745', // azul principal
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 22,
    alignSelf: 'center',
    letterSpacing: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 22,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 5,
  },
  cardPresentation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 18,
    marginHorizontal: 22,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e6ed',
    position: 'relative',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 2,
    borderColor: '#28a745',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
  },
  avatarIcon: {
    alignSelf: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  editBtnPresentation: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#28a745',
    borderRadius: 18,
    padding: 10,
    borderWidth: 2,
    borderColor: '#218838',
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e6ed',
  },
  userIcon: {
    marginRight: 18,
    color: '#28a745', // verde icono
  },
  userName: {
    fontSize: 19,
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 15,
    color: '#6c757d',
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: '#28a745', // verde botón
    borderRadius: 10,
    padding: 10,
    marginLeft: 14,
    borderWidth: 2,
    borderColor: '#218838',
    elevation: 2,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    width: '88%',
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e0e6ed',
  },
  modalTitle: {
    fontSize: 24,
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f5f7fa',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  cancelBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#28a745',
  },
  saveBtn: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#218838',
  },
});

export default UsuariosAdmin;
