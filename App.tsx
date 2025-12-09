import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/context/ThemeContext';
import LoginScreen from './src/screens/LoginScreen';
import SolicitudesScreen from './src/screens/Instructor/Solicitudes/Solicitudes';
import ReportesScreen from './src/screens/Instructor/Reportes/Reportes';
import AdminDashboard from './src/screens/Administrador/AdminDashboard';
import UsuariosAdmin from './src/screens/Administrador/UsuariosAdmin';
import CategoriasAdmin from './src/screens/Administrador/CategoriasAdmin';
import InventarioAdmin from './src/screens/Administrador/InventarioAdmin';
import SolicitudesElementoAdmin from './src/screens/Administrador/SolicitudesElementoAdmin';
import SolicitudesEspacioAdmin from './src/screens/Administrador/SolicitudesEspacioAdmin';
import ReportesAdmin from './src/screens/Administrador/ReportesAdmin';
import Portatiles from './src/screens/Instructor/Solicitudes/Portatiles';
import EquipoMesa from './src/screens/Instructor/Solicitudes/Equipo_Mesa';
import AudioVideo from './src/screens/Instructor/Solicitudes/Audio_video';
import Elementos from './src/screens/Instructor/Solicitudes/Elementos';
import HistorialPrueba from './src/screens/Instructor/Solicitudes/Historial';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Solicitudes" component={SolicitudesScreen} />
          <Stack.Screen name="Reportes" component={ReportesScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          <Stack.Screen name="UsuariosAdmin" component={UsuariosAdmin} />
          <Stack.Screen name="CategoriasAdmin" component={CategoriasAdmin} />
          <Stack.Screen name="InventarioAdmin" component={InventarioAdmin} />
          <Stack.Screen name="SolicitudesElementoAdmin" component={SolicitudesElementoAdmin} />
          <Stack.Screen name="SolicitudesEspacioAdmin" component={SolicitudesEspacioAdmin} />
          <Stack.Screen name="ReportesAdmin" component={ReportesAdmin} />
          <Stack.Screen name="PortatilesScreen" component={Portatiles} />
          <Stack.Screen name="EscritorioScreen" component={EquipoMesa} />
          <Stack.Screen name="AudioVideoScreen" component={AudioVideo} />
          <Stack.Screen name="ElementosScreen" component={Elementos} />
          <Stack.Screen name="HistorialPrueba" component={HistorialPrueba} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </ThemeProvider>
  );
}
