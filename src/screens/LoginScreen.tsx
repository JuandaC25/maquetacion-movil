import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
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
      const response = await authService.login(username, password);
      const token = response.token;
      await AsyncStorage.setItem('token', token);
      
      await AsyncStorage.multiRemove(['force_admin', 'force_tecnico']);
      
      // Obtener información del usuario
      const userData = await authService.getMe();
      const userRoles = userData?.roles || [];
      
      if (userRoles.includes('ADMINISTRADOR')) {
        await AsyncStorage.setItem('force_admin', '1');
        navigation.replace('Admin');
      } else if (userRoles.includes('TECNICO')) {
        await AsyncStorage.setItem('force_tecnico', '1');
        navigation.replace('PrestamosTecnico');
      } else if (userRoles.includes('INSTRUCTOR')) {
        navigation.replace('Solicitudes');
      } else {
        navigation.replace('Inicio');
      }
    } catch (err: any) {
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

        <TouchableOpacity onPress={() => navigation.navigate('Recuperar')}>
          <Text style={LoginStyles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

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