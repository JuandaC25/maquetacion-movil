import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import HeaderTecnico from '../HeaderTecnico/HeaderTecnico';
import { SolicitudesTecnicoStyles } from '../../../styles/Tecnico/Solicitudes/SolicitudesTecnico';
import { solicitudesService } from '../../../services/Api';

interface DetallesEspaciosProps {
  route: any;
  navigation: any;
}

export default function DetallesEspacios({ route, navigation }: DetallesEspaciosProps) {
  const { solicitud } = route.params;
  const { colors, theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [estadoActual, setEstadoActual] = useState(solicitud.est_soli);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<string | null>(null);

  const obtenerIdEstado = (estado: string): number => {
    const estados: { [key: string]: number } = {
      'Pendiente': 1,
      'Aprobado': 2,
      'Rechazado': 3,
      'Cancelado': 4,
      'Finalizado': 5,
    };
    return estados[estado] || 1;
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    try {
      setLoading(true);
      const nuevoIdEstado = obtenerIdEstado(nuevoEstado);
      console.log('📤 Enviando actualización:', {
        id_soli: solicitud.id_soli,
        id_est_soli: nuevoIdEstado,
        nuevoEstado: nuevoEstado
      });
      
      const datosActualizacion = {
        id_est_soli: nuevoIdEstado,
      };
      
      const respuesta = await solicitudesService.updateEstado(solicitud.id_soli, datosActualizacion);
      console.log('✅ Respuesta del servidor:', respuesta);
      
      setEstadoActual(nuevoEstado);
      setModalVisible(false);
      setModalAction(null);
      
      const mensaje = nuevoEstado === 'Aprobado' 
        ? 'Solicitud de espacio aprobada correctamente' 
        : 'Solicitud de espacio rechazada correctamente';
      Alert.alert('Éxito', mensaje);
      
      // Volver a la lista después de 1 segundo
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      console.error('❌ Error al actualizar solicitud:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo actualizar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Función independiente para Aprobar
  const abrirModalAprobar = () => {
    setModalAction('aprobar');
    setModalVisible(true);
  };

  // Función independiente para Rechazar
  const abrirModalRechazar = () => {
    setModalAction('rechazar');
    setModalVisible(true);
  };

  const confirmarAccion = () => {
    if (modalAction === 'rechazar') {
      cambiarEstado('Rechazado');
    } else if (modalAction === 'aprobar') {
      cambiarEstado('Aprobado');
    }
  };

  return (
    <View style={[SolicitudesTecnicoStyles.container, { backgroundColor: colors.background }]}>
      <HeaderTecnico title="Detalles de Espacio" navigation={navigation} />
      
      <ScrollView style={[SolicitudesTecnicoStyles.contentContainer, { backgroundColor: colors.background }]}>
        <View style={SolicitudesTecnicoStyles.filterContainer}>
          {/* Botón para volver */}
          <TouchableOpacity
            style={{ 
              alignSelf: 'flex-end', 
              marginBottom: 15, 
              padding: 5,
              backgroundColor: colors.cardBackground,
              borderRadius: 50,
              width: 30,
              height: 30,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border
            }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>✕</Text>
          </TouchableOpacity>
          <View style={SolicitudesTecnicoStyles.tarjeta}>
            <Text style={SolicitudesTecnicoStyles.cardModelo}>
              {solicitud.nom_espa}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>ID Solicitud: </Text>
              {solicitud.id_soli}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Espacio: </Text>
              {solicitud.nom_espa}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Usuario: </Text>
              {solicitud.nom_usu}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Correo: </Text>
              {solicitud.correo}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Fecha Inicio: </Text>
              {new Date(solicitud.fecha_ini).toLocaleString()}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Fecha Fin: </Text>
              {new Date(solicitud.fecha_fn).toLocaleString()}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Número de Ficha: </Text>
              {solicitud.num_fich}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Estado: </Text>
              {estadoActual}
            </Text>

            {solicitud.mensaj && (
              <Text style={SolicitudesTecnicoStyles.cardInfo}>
                <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Mensaje: </Text>
                {solicitud.mensaj}
              </Text>
            )}
          </View>

          {/* Botones de Acción */}
          <View style={{ marginTop: 20, gap: 10 }}>
            <TouchableOpacity
              style={{
                width: '100%',
                padding: 12,
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: '#3fbb34',
                borderRadius: 5,
                alignItems: 'center',
              }}
              onPress={abrirModalAprobar}
              disabled={loading}
            >
              <Text style={{ color: '#3fbb34', fontWeight: 'bold', fontSize: 14 }}>Aprobar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: '100%',
                padding: 12,
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: '#d9534f',
                borderRadius: 5,
                alignItems: 'center',
              }}
              onPress={abrirModalRechazar}
              disabled={loading}
            >
              <Text style={{ color: '#d9534f', fontWeight: 'bold', fontSize: 14 }}>Rechazar</Text>
            </TouchableOpacity>
          </View>

          {/* Modal de Confirmación */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible && (modalAction === 'rechazar' || modalAction === 'aprobar')}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: colors.cardBackground, borderRadius: 10, padding: 20, width: '85%' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: colors.textPrimary }}>
                  {modalAction === 'rechazar' ? '¿Rechazar solicitud?' : '¿Aprobar solicitud?'}
                </Text>
                <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: 20, textAlign: 'center' }}>
                  {modalAction === 'rechazar' 
                    ? 'Una vez rechazada, se notificará al usuario' 
                    : 'La solicitud de espacio será aprobada'}
                </Text>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    style={{ 
                      flex: 1, 
                      padding: 12, 
                      backgroundColor: '#3fbb34', 
                      borderRadius: 5, 
                      alignItems: 'center' 
                    }}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>No</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ 
                      flex: 1, 
                      padding: 12, 
                      backgroundColor: colors.inputBackground,
                      borderWidth: 2,
                      borderColor: '#3fbb34',
                      borderRadius: 5, 
                      alignItems: 'center' 
                    }}
                    onPress={() => confirmarAccion()}
                  >
                    <Text style={{ color: '#3fbb34', fontWeight: 'bold' }}>Sí</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </View>
  );
}
