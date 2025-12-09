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
      await prestamosService.update(prestamo.id_prest, {
        id_estado_prestamo: nuevoEstado,
      });

      const estadoNombre = nuevoEstado === 3 ? 'Devuelto' : 'Actualizado';

      Alert.alert('Éxito', `Préstamo marcado como: ${estadoNombre}`);
      navigation.goBack();
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudo actualizar el préstamo');
    } finally {
      setActualizando(false);
      setModalVisible(false);
    }
  };

  const confirmarAccion = () => {
    if (accionActual === 'devolver') {
      cambiarEstado(3); // 3 = Devuelto
    }
  };

  const getTextoModal = () => {
    switch (accionActual) {
      case 'devolver':
        return {
          titulo: '¿Marcar como devuelto?',
          mensaje: 'Cambiarás el estado del préstamo a "Devuelto"',
        };
      default:
        return { titulo: '', mensaje: '' };
    }
  };

  const textoModal = getTextoModal();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#3fbb34', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 5 }}>
            {prestamo.nom_elem}
          </Text>
          <View
            style={{
              backgroundColor: '#FFC107',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>
              {prestamo.nom_estado}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 30,
            height: 30,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#e0e0e0',
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 16, color: '#666' }}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20 }}>
        {/* Categoría */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 8 }}>
            CATEGORÍA
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#333' }}>
            {prestamo.nom_cat}
          </Text>
        </View>

        {/* Información General */}
        <View style={{ backgroundColor: '#f9f9f9', padding: 12, borderRadius: 6, marginBottom: 20 }}>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 4 }}>
              Usuario que Toma en Préstamo
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#333' }}>
              {prestamo.nom_usu}
            </Text>
          </View>

          <View style={{ marginBottom: 0 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 4 }}>
              Fecha de Inicio del Préstamo
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#333' }}>
              {new Date(prestamo.fecha_ini).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {/* Estado Actual */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 4 }}>
            Estado Actual
          </Text>
          <Text style={{ fontSize: 14, color: '#FFC107', fontWeight: '700' }}>
            {prestamo.nom_estado}
          </Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Este préstamo está activo y en posesión del usuario.
          </Text>
        </View>
      </ScrollView>

      {/* Botones de Acción */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
        <TouchableOpacity
          onPress={() => abrirModal('devolver')}
          style={{
            backgroundColor: '#fff',
            borderWidth: 2,
            borderColor: '#3fbb34',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 4,
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Text style={{ color: '#3fbb34', fontWeight: '700', fontSize: 14 }}>
            ✓ Marcar como Devuelto
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: '#3fbb34',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 4,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
            Volver
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Confirmación */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 20,
            }}
          >
            {/* Botón Cerrar */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 30,
                height: 30,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#e0e0e0',
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 16, color: '#666' }}>✕</Text>
            </TouchableOpacity>

            {/* Título */}
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8, marginRight: 30 }}>
              {textoModal.titulo}
            </Text>

            {/* Mensaje */}
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
              {textoModal.mensaje}
            </Text>

            {/* Botones */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                disabled={actualizando}
                style={{
                  flex: 1,
                  backgroundColor: '#3fbb34',
                  paddingVertical: 12,
                  borderRadius: 4,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                  No
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmarAccion}
                disabled={actualizando}
                style={{
                  flex: 1,
                  backgroundColor: '#fff',
                  borderWidth: 2,
                  borderColor: '#3fbb34',
                  paddingVertical: 12,
                  borderRadius: 4,
                  alignItems: 'center',
                }}
              >
                {actualizando ? (
                  <ActivityIndicator color="#3fbb34" size="small" />
                ) : (
                  <Text style={{ color: '#3fbb34', fontWeight: '700', fontSize: 14 }}>
                    Sí
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DetallesPrestamo;
