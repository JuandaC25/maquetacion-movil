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
      const response = await authService.login(username.trim(), password);

      const userData = await authService.getMe();
      const userRoles = userData?.roles || userData?.role || [];

      await AsyncStorage.setItem('usuario', JSON.stringify(userData));

      if ((userData.email || userData.correo || username) === 'admin@tech.com') {
        navigation.replace('UsuariosAdmin');
      } else if (Array.isArray(userRoles) && userRoles.includes('INSTRUCTOR')) {
        navigation.replace('Solicitudes');
      } else if (Array.isArray(userRoles) && userRoles.includes('TECNICO')) {
        navigation.replace('SolicitudesTecnico');
      } else {
        Alert.alert(
          'Login exitoso',
          `Bienvenido ${userData.nombre || userData.nom_usu || username}\nRoles: ${userRoles.join(', ')}`
        );
      }
    } catch (err: any) {
      console.error('❌ Error en login:', err, err?.response?.data);
      if (err?.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err?.response?.status === 403 || err?.response?.status === 401) {
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