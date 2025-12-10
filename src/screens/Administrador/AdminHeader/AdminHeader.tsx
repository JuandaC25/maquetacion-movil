import Svg, { Path } from 'react-native-svg';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, PanResponder, Switch, TextInput, Alert, Platform, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HeaderComponentStyles } from '../../../styles/Administrador/Header/Header';
import { useTheme } from '../../../context/ThemeContext';
import { usuariosService } from '../../../services/Api';

const DRAWER_WIDTH = 280;

interface HeaderWithDrawerProps {
  title: string;
  navigation: any;
}

export default function AdminHeader({ title, navigation }: HeaderWithDrawerProps) {
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 18) : 24;
  const baseHeaderInner = 72;
  const headerPaddingTop = statusBarHeight;
  const headerHeight = headerPaddingTop + baseHeaderInner;
  const handleSaveEdit = async () => {
    try {
      if (!formData.nom_us || !formData.ape_us || !formData.corre) {
        Alert.alert('Error', 'Todos los campos son obligatorios.');
        return;
      }
      let updatePayload: any = {
        nom_us: formData.nom_us,
        ape_us: formData.ape_us,
        corre: formData.corre,
      };
      if (formData.currentPassword || formData.password || formData.confirmPassword) {
        updatePayload.currentPassword = formData.currentPassword;
        updatePayload.password = formData.password;
      }
      try {
        const res = await usuariosService.updateProfile(updatePayload);
        const updatedUser = res.data;
        await AsyncStorage.setItem('usuario', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setShowEditModal(false);
        AsyncStorage.clear();
        Alert.alert('Información actualizada', 'Debes iniciar sesión nuevamente.', [
          {
            text: 'Aceptar',
            onPress: () => {
              navigation.navigate('Login');
            }
          }
        ]);
      } catch (err) {
        Alert.alert('Error', 'No se pudo actualizar en el servidor.');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar la información.');
    }
  };

  const [showProfile, setShowProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    nom_us: '',
    ape_us: '',
    corre: '',
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    AsyncStorage.getItem('usuario').then(u => {
      if (u) setUser(JSON.parse(u));
    });
  }, []);

  const handleShowProfile = () => setShowProfile(true);
  const handleCloseProfile = () => setShowProfile(false);
  const handleShowEditModal = () => {
    setShowProfile(false);
    setFormData({
      nom_us: user?.nombre || user?.name || '',
      ape_us: user?.apellido || '',
      corre: user?.email || user?.correo || '',
      currentPassword: '',
      password: '',
      confirmPassword: ''
    });
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setFormData({
      nom_us: '',
      ape_us: '',
      corre: '',
      currentPassword: '',
      password: '',
      confirmPassword: ''
    });
  };
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleLogout = () => {
    AsyncStorage.clear();
    Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');
    navigation.navigate('Login');
  };

  const [menuVisible, setMenuVisible] = useState(false);
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const { theme, toggleTheme, colors } = useTheme();

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: menuVisible ? 0 : -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [menuVisible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (evt.nativeEvent.pageX < 20 && gestureState.dx > 10) {
          return true;
        }
        return false;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx > 0) {
          translateX.setValue(Math.min(0, -DRAWER_WIDTH + gestureState.dx));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > DRAWER_WIDTH / 3) {
          setMenuVisible(true);
        } else {
          setMenuVisible(false);
        }
      },
    })
  ).current;

  return (
    <>
      <View style={[HeaderComponentStyles.header, { paddingTop: headerPaddingTop, height: headerHeight, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
        <TouchableOpacity 
          style={HeaderComponentStyles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={HeaderComponentStyles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={HeaderComponentStyles.headerTitle} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
        </View>
        <TouchableOpacity onPress={handleShowProfile} style={{ marginLeft: 18, backgroundColor: '#4caf50', borderRadius: 20, padding: 2 }}>
          <View style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="white">
              <Path d="M12 2.5a5.5 5.5 0 0 1 3.096 10.047A9.005 9.005 0 0 1 21 20.728a.75.75 0 1 1-1.499.044a7.5 7.5 0 0 0-14.993 0a.75.75 0 0 1-1.5-.045a9.005 9.005 0 0 1 5.9-8.18A5.5 5.5 0 0 1 12 2.5ZM8 8a4 4 0 1 0 8 0a4 4 0 0 0-8 0Z" />
            </Svg>
          </View>
        </TouchableOpacity>
      </View>

      {showProfile && (
        <View style={{ position: 'absolute', top: 110, right: 18, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.0)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 250, elevation: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8 }}>
            <TouchableOpacity onPress={handleCloseProfile} style={{ position: 'absolute', top: 12, right: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>✖</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#4caf50', justifyContent: 'center', alignItems: 'center' }}>
                <Svg width={40} height={40} viewBox="0 0 24 24" fill="white">
                  <Path d="M12 2.5a5.5 5.5 0 0 1 3.096 10.047A9.005 9.005 0 0 1 21 20.728a.75.75 0 1 1-1.499.044a7.5 7.5 0 0 0-14.993 0a.75.75 0 0 1-1.5-.045a9.005 9.005 0 0 1 5.9-8.18A5.5 5.5 0 0 1 12 2.5ZM8 8a4 4 0 1 0 8 0a4 4 0 0 0-8 0Z" />
                </Svg>
              </View>
            </View>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4, textAlign: 'center' }}>¡Hola, {user?.nombre || user?.name || user?.username || 'usuario'}!</Text>
            <Text style={{ color: '#555', marginBottom: 8, textAlign: 'center' }}>{user?.email || user?.correo || 'Sin correo'}</Text>
            <View style={{ marginTop: 16 }}>
              <TouchableOpacity onPress={handleShowEditModal} style={{ backgroundColor: '#4caf50', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Editar información</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: '#dc3545', padding: 12, borderRadius: 8 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showEditModal && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.25)', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%', elevation: 20 }}>
            <TouchableOpacity onPress={handleCloseEditModal} style={{ position: 'absolute', top: 12, right: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>✖</Text>
            </TouchableOpacity>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10, textAlign: 'center' }}>Editar Perfil</Text>
            <View>
              <Text>Nombre</Text>
              <TextInput value={formData.nom_us} onChangeText={v => handleInputChange('nom_us', v)} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 6 }} />
              <Text>Apellido</Text>
              <TextInput value={formData.ape_us} onChangeText={v => handleInputChange('ape_us', v)} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 6 }} />
              <Text>Correo Electrónico</Text>
              <TextInput value={formData.corre} onChangeText={v => handleInputChange('corre', v)} style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 6 }} />
              <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Cambio de Contraseña</Text>
              <TextInput value={formData.currentPassword} onChangeText={v => handleInputChange('currentPassword', v)} placeholder="Contraseña actual" secureTextEntry style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 6 }} />
              <TextInput value={formData.password} onChangeText={v => handleInputChange('password', v)} placeholder="Nueva contraseña" secureTextEntry style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 6 }} />
              <TextInput value={formData.confirmPassword} onChangeText={v => handleInputChange('confirmPassword', v)} placeholder="Confirmar nueva contraseña" secureTextEntry style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 8, padding: 6 }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
              <TouchableOpacity onPress={handleCloseEditModal} style={{ backgroundColor: '#ccc', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8, marginRight: 8, minWidth: 100 }}>
                <Text style={{ textAlign: 'center' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveEdit} style={{ backgroundColor: '#4caf50', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8, minWidth: 100 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {menuVisible && (
        <TouchableOpacity 
          style={[HeaderComponentStyles.drawerOverlay, { top: headerHeight }]}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        />
      )}


      <Animated.View
        style={[
          HeaderComponentStyles.drawer,
          {
            backgroundColor: colors.background,
            borderRightColor: theme === 'dark' ? colors.border : '#eee',
            borderRightWidth: 1,
            transform: [{ translateX }],
            marginTop: headerHeight
          }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={[
          HeaderComponentStyles.drawerHeader,
          { backgroundColor: theme === 'dark' ? colors.cardBackground : '#3fbb34', borderBottomColor: theme === 'dark' ? colors.border : '#3fbb34', borderBottomWidth: 1 }
        ]}>
          <Text style={[HeaderComponentStyles.drawerTitle, { color: '#fff' }]}>Menú Administrador</Text>
        </View>

        {[
          { label: 'Usuarios', route: 'UsuariosAdmin' },
          { label: 'Categorías', route: 'CategoriasAdmin' },
          { label: 'Inventario', route: 'InventarioAdmin' },
          { label: 'Solicitudes Elementos', route: 'SolicitudesElementoAdmin' },
          { label: 'Solicitudes Espacios', route: 'SolicitudesEspacioAdmin' },
          { label: 'Reportes', route: 'ReportesAdmin' },
        ].map((item, idx) => (
          <TouchableOpacity
            key={item.route}
            style={[
              HeaderComponentStyles.menuItem,
              {
                borderBottomColor: theme === 'dark' ? colors.border : '#eee',
                backgroundColor: 'transparent',
              },
            ]}
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate(item.route);
            }}
          >
            <Text style={[
              HeaderComponentStyles.menuItemText,
              {
                color: theme === 'dark' ? colors.textPrimary : '#333',
                fontFamily: 'sans-serif',
              },
            ]}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={[
          HeaderComponentStyles.themeToggleContainer,
          { backgroundColor: theme === 'dark' ? colors.cardBackground : '#f8f8f8', borderTopColor: theme === 'dark' ? colors.border : '#eee', borderTopWidth: 1 }
        ]}>
          <Text style={[HeaderComponentStyles.menuItemText, { color: theme === 'dark' ? colors.textPrimary : '#333' }] }>
            {theme === 'dark' ? '🌙 Tema Oscuro' : '☀️ Tema Claro'}
          </Text>
          <Switch
            value={theme === 'light'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#2a2a2a', true: '#3fbb34' }}
            thumbColor={theme === 'light' ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#2a2a2a"
          />
        </View>
      </Animated.View>

      <View 
        style={[HeaderComponentStyles.gestureArea, { top: headerHeight }]}
        {...panResponder.panHandlers}
      />
    </>
  );
}
