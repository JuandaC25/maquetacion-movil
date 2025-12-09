import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/Api';
import { LoginStyles } from '../styles/LoginStyles';

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      console.log('🔐 Iniciando login...');
      console.log('Login payload:', { username, password });
      const response = await authService.login(username.trim(), password);
      console.log('✅ Login exitoso, token recibido:', response);

      console.log('📡 Obteniendo datos del usuario...');
      const userData = await authService.getMe();
      console.log('✅ Datos del usuario:', userData);
      console.log('✅ Tipo de userData:', typeof userData);
      console.log('✅ Keys de userData:', userData ? Object.keys(userData) : 'null');
      
      // Fallback: si userData está vacío, intenta crear un objeto básico
      let userDataToUse = userData;
      if (!userData || Object.keys(userData).length === 0) {
        console.log('⚠️ userData vacío, usando valores por defecto');
        userDataToUse = {
          correo: username,
          roles: [],
          nombre: username.split('@')[0]
        };
      }
      
      const userRoles = userDataToUse?.roles || userDataToUse?.role || [];
      console.log('👤 Roles:', userRoles);

      // Guardar el usuario en AsyncStorage para futuras pantallas
      await AsyncStorage.setItem('usuario', JSON.stringify(userDataToUse));
      console.log('💾 Usuario guardado en AsyncStorage:', userDataToUse);

      // Normalizar roles a mayúsculas para comparación
      const normalizedRoles = Array.isArray(userRoles) 
        ? userRoles.map(r => (typeof r === 'string' ? r.toUpperCase() : r))
        : [];
      console.log('🔄 Roles normalizados:', normalizedRoles);

      // Navegar según el rol del usuario
      if (normalizedRoles.includes('ADMINISTRADOR')) {
        console.log('🎯 Navegando a AdminDashboard...');
        navigation.replace('AdminDashboard');
      } else if (normalizedRoles.includes('TECNICO')) {
        console.log('🎯 Navegando a SolicitudesTecnico...');
        navigation.replace('SolicitudesTecnico');
      } else if (normalizedRoles.includes('INSTRUCTOR')) {
        console.log('🎯 Navegando a Solicitudes (Instructor)...');
        navigation.replace('Solicitudes');
      } else {
        Alert.alert(
          'Login exitoso',
          `Bienvenido ${userData.nombre || userData.nom_usu || username}\nRoles: ${normalizedRoles.join(', ')}`
        );
      }
    } catch (err: any) {
      console.error('❌ Error en login:', err, err?.response?.data);
      if (err?.response?.status === 403 || err?.response?.status === 401) {
        setError('Credenciales incorrectas o permisos insuficientes. Verifica tu usuario y contraseña.');
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/login-bg.png')}
      style={LoginStyles.container}
      resizeMode="cover"
    >
      <View style={LoginStyles.formBox}>
        <Text style={LoginStyles.title}>Iniciar sesión</Text>

        <View style={LoginStyles.inputGroup}>
          <TextInput
            style={LoginStyles.input}
            placeholder="Correo electrónico"
            value={username}
            onChangeText={setUsername}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={LoginStyles.inputGroup}>
          <TextInput
            style={LoginStyles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {error ? (
          <Text style={LoginStyles.error}>{error}</Text>
        ) : null}

        <TouchableOpacity 
          style={[LoginStyles.button, loading && LoginStyles.buttonDisabled]} 
          onPress={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={LoginStyles.buttonText}>Iniciar sesión</Text>
          )}
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}