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
import { ticketsService } from '../../../services/Api';

interface Ticket {
  id_ticket: number;
  num_ticket: string;
  nom_problema: string;
  nom_cat: string;
  nom_elem: string;
  nom_usu: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  id_estado_ticket: number;
  nom_estado: string;
  descripcion?: string;
}

const DetallesTicket = ({ route, navigation }: any) => {
  const { ticket } = route.params;
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
      await ticketsService.update(ticket.id_ticket, {
        id_estado_ticket: nuevoEstado,
      });

      const estadoNombre =
        nuevoEstado === 1 ? 'Abierto' :
        nuevoEstado === 2 ? 'En Proceso' :
        nuevoEstado === 3 ? 'Resuelto' : 'Cerrado';

      Alert.alert('Éxito', `Ticket actualizado a: ${estadoNombre}`);
      navigation.goBack();
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudo actualizar el ticket');
    } finally {
      setActualizando(false);
      setModalVisible(false);
    }
  };

  const obtenerIdEstado = (nombreEstado: string) => {
    switch (nombreEstado?.toLowerCase()) {
      case 'abierto':
        return 1;
      case 'en proceso':
        return 2;
      case 'resuelto':
        return 3;
      case 'cerrado':
        return 4;
      default:
        return 1;
    }
  };

  const confirmarAccion = () => {
    if (accionActual === 'enProceso') {
      cambiarEstado(2);
    } else if (accionActual === 'resolver') {
      cambiarEstado(3);
    }
  };

  const getTextoModal = () => {
    switch (accionActual) {
      case 'enProceso':
        return {
          titulo: '¿Iniciar trabajo?',
          mensaje: 'Cambiarás el estado a "En Proceso"',
        };
      case 'resolver':
        return {
          titulo: '¿Resolver ticket?',
          mensaje: 'Cambiarás el estado a "Resuelto"',
        };
      default:
        return { titulo: '', mensaje: '' };
    }
  };

  const getColorEstado = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'abierto':
        return '#FF9800';
      case 'en proceso':
        return '#2196F3';
      case 'resuelto':
        return '#4CAF50';
      case 'cerrado':
        return '#757575';
      default:
        return '#666';
    }
  };

  const textoModal = getTextoModal();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#3fbb34', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 5 }}>
            Ticket #{ticket.num_ticket}
          </Text>
          <View
            style={{
              backgroundColor: getColorEstado(ticket.nom_estado),
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>
              {ticket.nom_estado}
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
        {/* Problema */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 8 }}>
            PROBLEMA
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#333' }}>
            {ticket.nom_problema}
          </Text>
        </View>

        {/* Descripción */}
        {ticket.descripcion && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 8 }}>
              DESCRIPCIÓN
            </Text>
            <Text style={{ fontSize: 14, color: '#555', lineHeight: 20 }}>
              {ticket.descripcion}
            </Text>
          </View>
        )}

        {/* Información General */}
        <View style={{ backgroundColor: '#f9f9f9', padding: 12, borderRadius: 6, marginBottom: 20 }}>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 4 }}>
              Categoría
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#333' }}>
              {ticket.nom_cat}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 4 }}>
              Elemento/Equipo
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#333' }}>
              {ticket.nom_elem}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 4 }}>
              Reportado por
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#333' }}>
              {ticket.nom_usu}
            </Text>
          </View>

          <View style={{ marginBottom: 0 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 4 }}>
              Fecha de Creación
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#333' }}>
              {new Date(ticket.fecha_creacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {/* Última Actualización */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 4 }}>
            Última Actualización
          </Text>
          <Text style={{ fontSize: 13, color: '#666' }}>
            {new Date(ticket.fecha_actualizacion).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </ScrollView>

      {/* Botones de Acción */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0' }}>
        {ticket.nom_estado?.toLowerCase() === 'abierto' && (
          <TouchableOpacity
            onPress={() => abrirModal('enProceso')}
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
              Iniciar Trabajo
            </Text>
          </TouchableOpacity>
        )}

        {ticket.nom_estado?.toLowerCase() === 'en proceso' && (
          <TouchableOpacity
            onPress={() => abrirModal('resolver')}
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
              Marcar como Resuelto
            </Text>
          </TouchableOpacity>
        )}

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

export default DetallesTicket;
