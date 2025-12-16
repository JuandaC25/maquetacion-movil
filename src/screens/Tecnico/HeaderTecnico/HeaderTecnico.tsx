import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, PanResponder, Switch, TextInput, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HeaderTecnicoStyles, CAMERA_OFFSET } from '../../../styles/Tecnico/Header/HeaderTecnico';
import { useTheme } from '../../../context/ThemeContext';
import { usuariosService } from '../../../services/Api';

const DRAWER_WIDTH = 280;

interface HeaderTecnicoProps {
  title: string;
  navigation: any;
}

export default function HeaderTecnico({ title, navigation }: HeaderTecnicoProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    nom_us: '',
    ape_us: '',
    corre: '',
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const { theme, toggleTheme, colors } = useTheme();
  const PROFILE_TOP = CAMERA_OFFSET + 60; // coloca modal justo debajo del header

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

  const handleLogout = () => {
    AsyncStorage.clear();
    Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');
    navigation.navigate('Login');
  };

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
      <View style={[HeaderTecnicoStyles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <TouchableOpacity 
          style={HeaderTecnicoStyles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={HeaderTecnicoStyles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={HeaderTecnicoStyles.headerTitle}>{title}</Text>
        </View>
        <TouchableOpacity onPress={handleShowProfile} style={{ marginLeft: 18, backgroundColor: '#4caf50', borderRadius: 20, padding: 2 }}>
          <View style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="white">
              <Path d="M12 2.5a5.5 5.5 0 0 1 3.096 10.047A9.005 9.005 0 0 1 21 20.728a.75.75 0 1 1-1.499.044a7.5 7.5 0 0 0-14.993 0a.75.75 0 0 1-1.5-.045a9.005 9.005 0 0 1 5.9-8.18A5.5 5.5 0 0 1 12 2.5ZM8 8a4 4 0 1 0 8 0a4 4 0 0 0-8 0Z" />
            </Svg>
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal de perfil */}
      {showProfile && (
        <View style={{ position: 'absolute', top: PROFILE_TOP, right: 18, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.0)' }}>
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

      {/* Modal de edición de perfil */}
      {showEditModal && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.25)', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%', elevation: 20 }}>
            <TouchableOpacity onPress={handleCloseEditModal} style={{ position: 'absolute', top: 12, right: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>✖</Text>
            </TouchableOpacity>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16, textAlign: 'center' }}>Editar Información</Text>
            
            <Text style={{ marginBottom: 6, fontWeight: 'bold' }}>Nombre</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 12 }}
              placeholder="Nombre"
              value={formData.nom_us}
              onChangeText={(value) => handleInputChange('nom_us', value)}
            />
            
            <Text style={{ marginBottom: 6, fontWeight: 'bold' }}>Apellido</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 12 }}
              placeholder="Apellido"
              value={formData.ape_us}
              onChangeText={(value) => handleInputChange('ape_us', value)}
            />
            
            <Text style={{ marginBottom: 6, fontWeight: 'bold' }}>Correo</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 12 }}
              placeholder="Correo"
              value={formData.corre}
              onChangeText={(value) => handleInputChange('corre', value)}
            />
            
            <Text style={{ marginBottom: 6, fontWeight: 'bold', marginTop: 12 }}>Contraseña Actual</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 12 }}
              placeholder="Contraseña actual"
              secureTextEntry
              value={formData.currentPassword}
              onChangeText={(value) => handleInputChange('currentPassword', value)}
            />
            
            <Text style={{ marginBottom: 6, fontWeight: 'bold' }}>Nueva Contraseña</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 12 }}
              placeholder="Nueva contraseña"
              secureTextEntry
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
            />
            
            <Text style={{ marginBottom: 6, fontWeight: 'bold' }}>Confirmar Contraseña</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 16 }}
              placeholder="Confirmar contraseña"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
            />
            
            <TouchableOpacity onPress={handleSaveEdit} style={{ backgroundColor: '#4caf50', padding: 12, borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Guardar cambios</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Overlay del drawer */}
      {menuVisible && (
        <TouchableOpacity 
          style={HeaderTecnicoStyles.drawerOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        />
      )}

      {/* Drawer lateral izquierdo */}
      <Animated.View 
        style={[
          HeaderTecnicoStyles.drawer,
          {
            transform: [{ translateX }],
          }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={HeaderTecnicoStyles.drawerHeader}>
          <Text style={HeaderTecnicoStyles.drawerTitle}>Menú</Text>
        </View>
        
        <TouchableOpacity 
          style={HeaderTecnicoStyles.menuItem}
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate('SolicitudesTecnico');
          }}
        >
          <Text style={HeaderTecnicoStyles.menuItemText}>Solicitudes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={HeaderTecnicoStyles.menuItem}
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate('Tickets');
          }}
        >
          <Text style={HeaderTecnicoStyles.menuItemText}>Tickets</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={HeaderTecnicoStyles.menuItem}
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate('EspaciosTecnico');
          }}
        >
          <Text style={HeaderTecnicoStyles.menuItemText}>Espacios</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={HeaderTecnicoStyles.menuItem}
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate('Historial');
          }}
        >
          <Text style={HeaderTecnicoStyles.menuItemText}>Historial</Text>
        </TouchableOpacity>
        
        {/* Toggle de Tema */}
        <View style={HeaderTecnicoStyles.themeToggleContainer}>
          <Text style={HeaderTecnicoStyles.menuItemText}>
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

      {/* Área de gestos para abrir el drawer */}
      <View 
        style={HeaderTecnicoStyles.gestureArea}
        {...panResponder.panHandlers}
      />
    </>
  );
}