import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import HeaderTecnico from '../HeaderTecnico/HeaderTecnico';
import { SolicitudesTecnicoStyles } from '../../../styles/Tecnico/Solicitudes/SolicitudesTecnico';
import { solicitudesService } from '../../../services/Api';

interface DetallesSolicitudProps {
  route: any;
  navigation: any;
}

export default function DetallesSolicitud({ route, navigation }: DetallesSolicitudProps) {
  const { solicitud } = route.params;
  const [loading, setLoading] = useState(false);
  const [estadoActual, setEstadoActual] = useState(solicitud.est_soli);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<string | null>(null);
  const [isAprobarPressed, setIsAprobarPressed] = useState(false);
  const [isRechazarPressed, setIsRechazarPressed] = useState(false);

  const obtenerIdEstado = (estado: string): number => {
    const estados: { [key: string]: number } = {
      'Pendiente': 1,
      'Aprobada': 2,
      'Rechazada': 3,
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
      
      const respuesta = await solicitudesService.update(solicitud.id_soli, datosActualizacion);
      console.log('✅ Respuesta del servidor:', respuesta);
      
      setEstadoActual(nuevoEstado);
      setModalVisible(false);
      setModalAction(null);
      
      const mensaje = nuevoEstado === 'Aprobada' 
        ? 'Solicitud aprobada correctamente' 
        : 'Solicitud rechazada correctamente';
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

  const abrirModalConfirmacion = (accion: string) => {
    setModalAction(accion);
    setModalVisible(true);
  };

  const confirmarAccion = () => {
    if (modalAction === 'aprobar') {
      cambiarEstado('Aprobada');
    } else if (modalAction === 'rechazar') {
      cambiarEstado('Rechazada');
    }
  };

  return (
    <View style={SolicitudesTecnicoStyles.container}>
      <HeaderTecnico title="Detalles de Solicitud" navigation={navigation} />
      
      <ScrollView style={SolicitudesTecnicoStyles.contentContainer}>
        <View style={SolicitudesTecnicoStyles.filterContainer}>
          {/* Botón para volver */}
          <TouchableOpacity
            style={{ 
              alignSelf: 'flex-end', 
              marginBottom: 15, 
              padding: 5,
              backgroundColor: '#e0e0e0',
              borderRadius: 50,
              width: 30,
              height: 30,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#666' }}>✕</Text>
          </TouchableOpacity>
          <View style={SolicitudesTecnicoStyles.tarjeta}>
            <Text style={SolicitudesTecnicoStyles.cardModelo}>
              {solicitud.nom_elem}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>ID Solicitud: </Text>
              {solicitud.id_soli}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Categoría: </Text>
              {solicitud.nom_cat}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Subcategoría: </Text>
              {solicitud.nom_subcat}
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
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Cantidad: </Text>
              {solicitud.cantid}
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
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Ambiente: </Text>
              {solicitud.ambient}
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
            {estadoActual !== 'Aprobada' && (
              <TouchableOpacity
                style={{
                  padding: 12,
                  backgroundColor: isAprobarPressed ? '#3fbb34' : '#fff',
                  borderWidth: 2,
                  borderColor: '#3fbb34',
                  borderRadius: 5,
                  alignItems: 'center',
                }}
                onPress={() => abrirModalConfirmacion('aprobar')}
                onPressIn={() => setIsAprobarPressed(true)}
                onPressOut={() => setIsAprobarPressed(false)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#3fbb34" />
                ) : (
                  <Text style={{ color: isAprobarPressed ? '#fff' : '#3fbb34', fontWeight: 'bold', fontSize: 14 }}>✓ Aprobar Solicitud</Text>
                )}
              </TouchableOpacity>
            )}

            {estadoActual !== 'Rechazada' && (
              <TouchableOpacity
                style={{
                  padding: 12,
                  backgroundColor: isRechazarPressed ? '#3fbb34' : '#fff',
                  borderWidth: 2,
                  borderColor: '#3fbb34',
                  borderRadius: 5,
                  alignItems: 'center',
                }}
                onPress={() => abrirModalConfirmacion('rechazar')}
                onPressIn={() => setIsRechazarPressed(true)}
                onPressOut={() => setIsRechazarPressed(false)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#3fbb34" />
                ) : (
                  <Text style={{ color: isRechazarPressed ? '#fff' : '#3fbb34', fontWeight: 'bold', fontSize: 14 }}>✕ Rechazar Solicitud</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Modal de Confirmación */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 20, width: '85%' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
                  {modalAction === 'aprobar' ? '¿Aprobar solicitud?' : '¿Rechazar solicitud?'}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' }}>
                  {modalAction === 'aprobar'
                    ? 'Una vez aprobada, se notificará al usuario'
                    : 'Una vez rechazada, se notificará al usuario'}
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
                      backgroundColor: '#fff',
                      borderWidth: 2,
                      borderColor: '#3fbb34',
                      borderRadius: 5, 
                      alignItems: 'center' 
                    }}
                    onPress={confirmarAccion}
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
