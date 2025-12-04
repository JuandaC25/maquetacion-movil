import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UsuariosAdmin = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Gestión de Usuarios (Admin)</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 22, color: '#1976d2', fontWeight: 'bold' },
});

export default UsuariosAdmin;
