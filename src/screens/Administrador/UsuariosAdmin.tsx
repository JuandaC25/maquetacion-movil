import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, ScrollView } from 'react-native';
// Estados posibles (puedes ajustar los valores según tu backend)
const ESTADOS = [
  { label: 'Activo', value: 1 },
  { label: 'Inactivo', value: 2 },
];

// Tipo para rol
type Rol = {
  id: number;
  nom_rol: string;
};
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { usuariosService } from '../../services/Api';
import DateTimePicker from '@react-native-community/datetimepicker';

type Usuario = {
  id_usuari: number;
  nom_usua: string;
  ape_usua: string;
  corre: string;
  num_docu?: string | number;
  id_rol?: number;
  nom_est?: number;
};

const UsuariosAdmin = () => {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({ nom_us: '', ape_us: '', corre: '', password: '', rol: null as null | number, estado: null as null | number });
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [showRolModal, setShowRolModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);

  // Obtener roles únicos de los usuarios cargados (como en la web)
  useEffect(() => {
    // Obtener roles únicos de los usuarios cargados (como en la web, pero usando el campo correcto)
    const obtenerRolesUnicos = () => {
      const rolesMap: { [key: number]: string } = {};
      usuarios.forEach(u => {
        if (u.id_rol && u.nom_est !== undefined && u.id_rol > 0) {
          // Usar el campo correcto para el nombre del rol
          if (u.id_rol === 1) rolesMap[u.id_rol] = 'Instructor';
          else if (u.id_rol === 2) rolesMap[u.id_rol] = 'Administrador';
          else if (u.id_rol === 3) rolesMap[u.id_rol] = 'Técnico';
        }
      });
      // Si no hay roles, usar fallback
      const rolesList = Object.keys(rolesMap).map(id => ({ id: Number(id), nom_rol: rolesMap[Number(id)] })).filter(r => r.nom_rol);
      if (rolesList.length === 0) {
        return [
          { id: 1, nom_rol: 'Instructor' },
          { id: 3, nom_rol: 'Técnico' },
          { id: 2, nom_rol: 'Administrador' },
        ];
      }
      return rolesList;
    };
    setRoles(obtenerRolesUnicos());
  }, [usuarios]);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await usuariosService.getAll();
      setUsuarios((res.data as Usuario[]) || []);
    } catch (e) {
      setUsuarios([]);
    }
    setLoading(false);
  };

  const handleEdit = (user: Usuario) => {
    setSelectedUser(user);
    setEditData({
      nom_us: user.nom_usua,
      ape_us: user.ape_usua,
      corre: user.corre,
      password: '',
      rol: user.id_rol || null,
      estado: user.nom_est || 1,
    });
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      // Construir payload para el backend
      const payload = {
        nom_us: editData.nom_us,
        ape_us: editData.ape_us,
        corre: editData.corre,
        password: editData.password || undefined,
        id_rl: editData.rol,
        est_usu: editData.estado,
      };
      await usuariosService.update((selectedUser as Usuario).id_usuari, payload);
      fetchUsuarios();
    } catch (e) {}
    setSaving(false);
  };

  const filteredUsuarios = usuarios.filter(u =>
    `${u.nom_usua} ${u.ape_usua}`.toLowerCase().includes(search.toLowerCase()) ||
    (u.corre || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.num_docu ? String(u.num_docu).includes(search) : false)
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.primary }]}>Gestionar Usuarios</Text>
      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow }]}> 
        <FontAwesome5 name="search" size={18} color={colors.primary} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="Buscar usuario..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredUsuarios}
          keyExtractor={item => (item && item.id_usuari ? item.id_usuari.toString() : Math.random().toString())}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View style={[styles.cardPresentation, { backgroundColor: colors.cardBackground, borderColor: colors.border, shadowColor: colors.shadow }]}> 
              <View style={[styles.avatarContainer, { backgroundColor: colors.background, borderColor: colors.primary, shadowColor: colors.shadow }]}> 
                <FontAwesome5 name="user" size={54} color={colors.primary} style={styles.avatarIcon} />
              </View>
              <View style={styles.infoContainer}>
                <Text style={[styles.userName, { color: colors.primary }]}>{item.nom_usua} {item.ape_usua}</Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.corre}</Text>
                {item.num_docu ? (
                  <Text style={[styles.userEmail, { color: colors.textSecondary }]}>Identidad: {item.num_docu}</Text>
                ) : null}
              </View>
              <TouchableOpacity style={[styles.editBtnPresentation, { backgroundColor: colors.primary, borderColor: colors.primaryLight }]} onPress={() => handleEdit(item)}>
                <MaterialIcons name="edit" size={28} color={colors.cardBackground} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={[styles.modalBg, { backgroundColor: 'rgba(0,0,0,0.4)' }]}> 
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}> 
            <Text style={[styles.modalTitle, { color: colors.title }]}>Editar Usuario</Text>
            <ScrollView>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]}
                placeholder="Nombre"
                placeholderTextColor={isDark ? '#aaa' : '#555'}
                value={editData.nom_us}
                onChangeText={v => setEditData({ ...editData, nom_us: v })}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]}
                placeholder="Apellido"
                placeholderTextColor={isDark ? '#aaa' : '#555'}
                value={editData.ape_us}
                onChangeText={v => setEditData({ ...editData, ape_us: v })}
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]}
                placeholder="Correo"
                placeholderTextColor={isDark ? '#aaa' : '#555'}
                value={editData.corre}
                onChangeText={v => setEditData({ ...editData, corre: v })}
                keyboardType="email-address"
              />
              {/* Campo para cambiar contraseña */}
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]}
                placeholder="Nueva contraseña (dejar vacío para no cambiar)"
                placeholderTextColor={isDark ? '#aaa' : '#555'}
                value={editData.password}
                onChangeText={v => setEditData({ ...editData, password: v })}
                secureTextEntry
              />
              {/* Selector de Rol */}
              <TouchableOpacity style={[styles.input, { backgroundColor: colors.inputBackground }]} onPress={() => setShowRolModal(true)}>
                <Text style={{ color: editData.rol ? colors.textPrimary : '#aaa' }}>
                  {editData.rol
                    ? (roles.find(r => r.id === editData.rol)?.nom_rol || 'Seleccionar rol')
                    : 'Seleccionar rol'}
                </Text>
              </TouchableOpacity>
              <Modal visible={showRolModal} transparent animationType="fade" onRequestClose={() => setShowRolModal(false)}>
                <View style={[styles.modalBg, { backgroundColor: 'rgba(0,0,0,0.4)' }]}> 
                  <View style={[styles.modalContent, {maxHeight: 350, backgroundColor: colors.background }]}>
                    <Text style={styles.modalTitle}>Selecciona un rol</Text>
                    {roles.length === 0 ? (
                      <Text style={{textAlign:'center',color:'red',marginTop:20}}>No hay roles disponibles</Text>
                    ) : (
                      <FlatList
                        data={roles}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => {
                          // Bloquear Administrador si ya existe uno (igual que la web)
                          const isAdmin = item.nom_rol.toLowerCase().includes('admin');
                          const adminExists = usuarios.some(u => {
                            const r = roles.find(r2 => r2.id === u.id_rol);
                            return r && r.nom_rol.toLowerCase().includes('admin');
                          });
                          return (
                            <TouchableOpacity
                              style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee', opacity: isAdmin && adminExists ? 0.5 : 1 }}
                              disabled={isAdmin && adminExists}
                              onPress={() => {
                                setEditData(prev => ({ ...prev, rol: item.id }));
                                setShowRolModal(false);
                              }}
                            >
                              <Text style={isAdmin && adminExists ? { color: 'gray' } : {}}>
                                {item.nom_rol}{isAdmin && adminExists ? ' (Bloqueado)' : ''}
                              </Text>
                            </TouchableOpacity>
                          );
                        }}
                      />
                    )}
                  </View>
                </View>
              </Modal>
              {/* Selector de Estado */}
              <TouchableOpacity
                style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.primary }]}
                onPress={() => setShowEstadoModal(true)}
              >
                <Text style={{ color: editData.estado ? colors.textPrimary : '#aaa' }}>
                  {editData.estado
                    ? (ESTADOS.find(e => e.value === editData.estado)?.label || 'Seleccionar estado')
                    : 'Seleccionar estado'}
                </Text>
              </TouchableOpacity>
              <Modal visible={showEstadoModal} transparent animationType="fade" onRequestClose={() => setShowEstadoModal(false)}>
                <View style={[styles.modalBg, { backgroundColor: 'rgba(0,0,0,0.4)' }]}> 
                  <View style={[styles.modalContent, { maxHeight: 250, backgroundColor: colors.background }]}> 
                    <Text style={[styles.modalTitle, { color: colors.title }]}>Selecciona un estado</Text>
                    <FlatList
                      data={ESTADOS}
                      keyExtractor={item => item.value.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={{ padding: 12, borderBottomWidth: 1, borderColor: colors.border }}
                          onPress={() => {
                            setEditData(prev => ({ ...prev, estado: item.value }));
                            setShowEstadoModal(false);
                          }}
                        >
                          <Text style={{ color: colors.textPrimary }}>{item.label}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              </Modal>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: colors.buttonCancel, borderColor: colors.buttonCancel, borderWidth: 1 }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={{ color: isDark ? '#fff' : '#222', fontWeight: 'bold' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.buttonPrimary, borderColor: colors.buttonPrimary, borderWidth: 1 }]}
                onPress={handleSave}
                disabled={saving}
              >
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
    // color: '#28a745', // azul principal
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 22,
    alignSelf: 'center',
    letterSpacing: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#fff',
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
    // backgroundColor: '#fff',
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
    // backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    width: '88%',
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e0e6ed',
  },
  modalTitle: {
    fontSize: 24,
    // color: '#28a745',
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
    // backgroundColor: '#fff',
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
