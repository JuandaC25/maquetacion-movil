import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InventarioAdmin = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Inventario (Admin)</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 22, color: '#1976d2', fontWeight: 'bold' },
});

export default InventarioAdmin;
