import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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
      const response = await authService.login(username, password);
      console.log('✅ Login exitoso, token recibido');
      
      console.log('📡 Obteniendo datos del usuario...');
      const userData = await authService.getMe();
      console.log('✅ Datos del usuario:', userData);
      const userRoles = userData?.roles || [];
      console.log('👤 Roles:', userRoles);
      
      if (userRoles.includes('INSTRUCTOR')) {
        console.log('🎯 Navegando a Solicitudes...');
        navigation.replace('Solicitudes');
      } else {
        Alert.alert(
          'Login exitoso',
          `Bienvenido ${userData.nombre || username}\nRoles: ${userRoles.join(', ')}`
        );
      }
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={LoginStyles.container}>
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
    </View>
  );
}