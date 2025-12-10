import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AdminHeader from './AdminHeader/AdminHeader';
import { useEffect } from 'react';

const AdminDashboard = ({ navigation }: any) => {
  useEffect(() => {
    const t = setTimeout(() => {
      navigation.navigate('UsuariosAdmin');
    }, 50);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <AdminHeader title="Panel de Administrador" navigation={navigation} />
      <View style={styles.content}>
        <Text style={styles.placeholder}>Redirigiendo a Usuarios...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholder: { fontSize: 18, color: '#333' },
});

export default AdminDashboard;
