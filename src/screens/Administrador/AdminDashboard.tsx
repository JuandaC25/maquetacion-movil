import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons, FontAwesome5, Ionicons, Entypo } from '@expo/vector-icons';

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
  { label: 'Usuarios', route: 'UsuariosAdmin', icon: <FontAwesome5 name="users" size={34} color="#12bb1a" /> },
  { label: 'Categorías', route: 'CategoriasAdmin', icon: <Entypo name="list" size={34} color="#12bb1a" /> },
  { label: 'Inventario', route: 'InventarioAdmin', icon: <MaterialIcons name="inventory" size={34} color="#12bb1a" /> },
  { label: 'Solicitudes Elementos', route: 'SolicitudesElementoAdmin', icon: <Ionicons name="cube-outline" size={34} color="#12bb1a" /> },
  { label: 'Solicitudes Espacios', route: 'SolicitudesEspacioAdmin', icon: <Ionicons name="business-outline" size={34} color="#12bb1a" /> },
  { label: 'Reportes', route: 'ReportesAdmin', icon: <MaterialIcons name="assessment" size={34} color="#12bb1a" /> },
];

const AdminDashboard = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AdminStackParamList>>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.gradientBg}>
        <Text style={styles.title}>
          <Text style={{ color: '#fff', textShadowColor: '#0a7d13', textShadowOffset: {width: 1, height: 2}, textShadowRadius: 6 }}>Panel de </Text>
          <Text style={{ color: '#fff', fontWeight: 'bold', textShadowColor: '#0a7d13', textShadowOffset: {width: 1, height: 2}, textShadowRadius: 6 }}>Administrador</Text>
        </Text>
      </View>
      <View style={styles.menuContainer}>
        {adminSections.map((section, idx) => (
          <TouchableOpacity
            key={section.route}
            style={[styles.card, { backgroundColor: '#e8f5e8', borderColor: '#12bb1a', borderWidth: 1.5, shadowColor: '#12bb1a' }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(section.route as keyof AdminStackParamList)}
          >
            <View style={styles.iconContainer}>{section.icon}</View>
            <Text style={styles.cardText}>{section.label}</Text>
            <View style={styles.arrow}>
              <MaterialIcons name="arrow-forward-ios" size={22} color="#12bb1a" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#e8f5e8',
    paddingVertical: 0,
    minHeight: '100%',
  },
  gradientBg: {
    width: '100%',
    paddingTop: 0,
    paddingBottom: 32,
    backgroundColor: '#12bb1a',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#12bb1a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 48,
    marginBottom: 18,
    color: '#fff',
    letterSpacing: 1.2,
    textAlign: 'center',
    textShadowColor: '#0a7d13',
    textShadowOffset: {width: 1, height: 2},
    textShadowRadius: 6,
  },
  menuContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 28,
    marginBottom: 18,
    width: '88%',
    elevation: 4,
    shadowColor: '#12bb1a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    borderWidth: 1.5,
    borderColor: '#12bb1a',
    position: 'relative',
  },
  iconContainer: {
    marginRight: 18,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    elevation: 2,
    shadowColor: '#12bb1a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
  },
  cardText: {
    fontSize: 21,
    color: '#12bb1a',
    fontWeight: 'bold',
    letterSpacing: 0.7,
    flex: 1,
  },
  arrow: {
    marginLeft: 10,
    alignSelf: 'center',
  },
});

export default AdminDashboard;
