import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
type AdminStackParamList = {
  AdminDashboard: undefined;
  UsuariosAdmin: undefined;
  CategoriasAdmin: undefined;
  InventarioAdmin: undefined;
  SolicitudesElementoAdmin: undefined;
  SolicitudesEspacioAdmin: undefined;
  ReportesAdmin: undefined;
};

const adminSections = [
  { label: 'Usuarios', route: 'UsuariosAdmin' },
  { label: 'Categorías', route: 'CategoriasAdmin' },
  { label: 'Inventario', route: 'InventarioAdmin' },
  { label: 'Solicitudes Elementos', route: 'SolicitudesElementoAdmin' },
  { label: 'Solicitudes Espacios', route: 'SolicitudesEspacioAdmin' },
  { label: 'Reportes', route: 'ReportesAdmin' },
];

const AdminDashboard = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Panel de Administrador</Text>
      {adminSections.map((section) => (
        <TouchableOpacity
          key={section.route}
          style={styles.button}
          onPress={() => navigation.navigate(section.route as keyof AdminStackParamList)}
        >
          <Text style={styles.buttonText}>{section.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#1976d2',
  },
  button: {
    backgroundColor: '#1976d2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 18,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdminDashboard;
