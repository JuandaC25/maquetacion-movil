import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import HeaderTecnico from '../HeaderTecnico/HeaderTecnico';
import { SolicitudesTecnicoStyles } from '../../../styles/Tecnico/Solicitudes/SolicitudesTecnico';
import { prestamosService } from '../../../services/Api';

interface Prestamo {
  id_prest: number;
  nom_elem: string;
  nom_cat: string;
  nom_usu: string;
  fecha_ini: string;
  nom_estado: string;
  id_estado_prestamo: number;
}

const DetallesPrestamo = ({ route, navigation }: any) => {
  const { prestamo } = route.params;
  const { colors, theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [accionActual, setAccionActual] = useState('');
  const [actualizando, setActualizando] = useState(false);

  const abrirModal = (accion: string) => {
    setAccionActual(accion);
    setModalVisible(true);
  };

  const cambiarEstado = async (nuevoEstado: number) => {
    try {
      setActualizando(true);
      
      // Preparar el objeto de actualización con los datos correctos
      const datosActualizacion = {
        id_prest: prestamo.id_prest,
        estado: nuevoEstado, // 0 = Finalizado
      };
      
      console.log('Actualizando préstamo con:', datosActualizacion);
      
      await prestamosService.update(prestamo.id_prest, datosActualizacion);

      const estadoNombre = nuevoEstado === 0 ? 'Finalizado' : 'Actualizado';

      Alert.alert('Éxito', `Préstamo marcado como: ${estadoNombre}`);
      navigation.goBack();
    } catch (error: any) {
      console.error('Error al actualizar:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      Alert.alert('Error', 'No se pudo actualizar el préstamo');
    } finally {
      setActualizando(false);
      setModalVisible(false);
    }
  };

  const confirmarAccion = () => {
    if (accionActual === 'devolver') {
      cambiarEstado(0); // 0 = Finalizado
    }
  };

  const getTextoModal = () => {
    switch (accionActual) {
      case 'devolver':
        return {
          titulo: '¿Marcar como finalizado?',
          mensaje: 'Cambiarás el estado del préstamo a "Finalizado"',
        };
      default:
        return { titulo: '', mensaje: '' };
    }
  };

  const textoModal = getTextoModal();

  return (
    <View style={[SolicitudesTecnicoStyles.container, { backgroundColor: colors.background }]}>
      <HeaderTecnico title="Detalles de Préstamo" navigation={navigation} />
      
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

          {/* Tarjeta de Detalles */}
          <View style={SolicitudesTecnicoStyles.tarjeta}>
            <Text style={SolicitudesTecnicoStyles.cardModelo}>
              {prestamo.nom_elem}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>ID Préstamo: </Text>
              {prestamo.id_prest}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Categoría: </Text>
              {prestamo.nom_cat}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Usuario: </Text>
              {prestamo.nom_usu}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Fecha de Inicio: </Text>
              {new Date(prestamo.fecha_ini).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>

            <Text style={SolicitudesTecnicoStyles.cardInfo}>
              <Text style={SolicitudesTecnicoStyles.cardInfoLabel}>Estado: </Text>
              {prestamo.nom_estado}
            </Text>
          </View>

          {/* Botones de Acción */}
          <View style={{ marginTop: 20, gap: 10, flexDirection: 'row' }}>
            <TouchableOpacity
              style={{
                flex: 1,
                padding: 12,
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: '#3fbb34',
                borderRadius: 5,
                alignItems: 'center',
              }}
              onPress={() => navigation.goBack()}
            >
              <Text style={{ color: '#3fbb34', fontWeight: 'bold', fontSize: 14 }}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                padding: 12,
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: '#3fbb34',
                borderRadius: 5,
                alignItems: 'center',
              }}
              onPress={() => abrirModal('devolver')}
              disabled={actualizando}
            >
              <Text style={{ color: '#3fbb34', fontWeight: 'bold', fontSize: 14 }}>
                {actualizando ? 'Cargando...' : 'Finalizar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Confirmación Mejorado */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <View
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              paddingHorizontal: 24,
              paddingVertical: 30,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
              maxWidth: '95%',
            }}
          >
            {/* Icono Decorativo */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ 
                width: 60, 
                height: 60, 
                borderRadius: 30, 
                backgroundColor: colors.inputBackground, 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                <Text style={{ fontSize: 32 }}>⚠️</Text>
              </View>
            </View>

            {/* Título */}
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>
              {textoModal.titulo}
            </Text>

            {/* Mensaje */}
            <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: 24, textAlign: 'center', lineHeight: 20 }}>
              {textoModal.mensaje}
            </Text>

            {/* Botones */}
            <View style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={confirmarAccion}
                disabled={actualizando}
                style={{
                  backgroundColor: '#3fbb34',
                  paddingVertical: 12,
                  borderRadius: 5,
                  alignItems: 'center',
                }}
              >
                {actualizando ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                    ✓ Confirmar
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                disabled={actualizando}
                style={{
                  backgroundColor: colors.inputBackground,
                  paddingVertical: 12,
                  borderRadius: 5,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#3fbb34',
                }}
              >
                <Text style={{ color: '#3fbb34', fontWeight: '700', fontSize: 14 }}>
                  ✕ Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DetallesPrestamo;
