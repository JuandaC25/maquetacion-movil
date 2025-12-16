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
import { ticketsService } from '../../../services/Api';

interface Ticket {
  id_tickets?: number;
  id_ticket?: number;
  num_ticket?: string;
  nom_problema?: string;
  nom_problm?: string;
  nom_cat?: string;
  nom_elem?: string;
  nom_usu?: string;
  fecha_creacion?: string;
  fecha_in?: string;
  fecha_actualizacion?: string;
  id_estado_ticket?: number;
  id_est_tick?: number;
  nom_estado?: string;
  tip_est_ticket?: string;
  ambient?: string;
  obser?: string;
  observaciones?: string;
}

const DetallesTicket = ({ route, navigation }: any) => {
  const { ticket } = route.params;
  const { colors, theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [estadoActual, setEstadoActual] = useState(ticket.nom_estado);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<string | null>(null);

  const obtenerIdEstado = (estado: string): number => {
    const estados: { [key: string]: number } = {
      'Abierto': 1,
      'En Proceso': 1,  // Estado 1 = Activo/En Proceso
      'Resuelto': 3,
      'Cerrado': 4,
    };
    return estados[estado] || 1;
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    try {
      setLoading(true);
      const nuevoIdEstado = obtenerIdEstado(nuevoEstado);
      // Obtener ID del ticket de múltiples variantes posibles
      const ticketId = ticket.id_tickets || ticket.id_ticket;
      
      console.log('🔍 Ticket objeto recibido:', {
        id_tickets: ticket.id_tickets,
        id_ticket: ticket.id_ticket,
        ticketIdUsado: ticketId,
        allKeys: Object.keys(ticket)
      });
      
      if (!ticketId) {
        console.error('❌ ERROR CRÍTICO: No se pudo obtener el ID del ticket');
        Alert.alert('Error', 'No se pudo identificar el ticket');
        setLoading(false);
        return;
      }
      
      console.log('📤 Enviando actualización:', {
        ticketId: ticketId,
        id_est_tick: nuevoIdEstado,
        nuevoEstado: nuevoEstado
      });
      
      const datosActualizacion = {
        id_ticket: ticketId,
        id_est_tick: nuevoIdEstado,
      };
      
      const respuesta = await ticketsService.update(ticketId, datosActualizacion);
      console.log('✅ Respuesta del servidor:', respuesta);
      console.log('✅ Status:', respuesta?.status);
      console.log('✅ Data:', respuesta?.data);
      
      setEstadoActual(nuevoEstado);
      setModalVisible(false);
      setModalAction(null);
      
      const mensaje = nuevoEstado === 'En Proceso' 
        ? 'Ticket tomado correctamente' 
        : 'Ticket cancelado correctamente';
      Alert.alert('Éxito', mensaje);
      
      // Volver a la lista después de 1 segundo
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error: any) {
      console.error('❌ Error al actualizar ticket:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo actualizar el ticket');
    } finally {
      setLoading(false);
    }
  };

  // Función independiente para Tomar
  const abrirModalTomar = () => {
    setModalAction('tomar');
    setModalVisible(true);
  };

  // Función independiente para Cancelar
  const abrirModalCancelar = () => {
    setModalAction('cancelar');
    setModalVisible(true);
  };

  const confirmarAccion = () => {
    if (modalAction === 'tomar') {
      cambiarEstado('En Proceso');
    } else if (modalAction === 'cancelar') {
      // Solo cierra el modal sin cambiar estado
      setModalVisible(false);
      setModalAction(null);
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header Verde Premium */}
      <View style={{ backgroundColor: '#3fbb34', paddingTop: 50, paddingBottom: 30, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Número de Ticket
          </Text>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 12 }}>
            #{ticket.id_tickets || ticket.id_ticket || ticket.num_ticket}
          </Text>
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.3)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              alignSelf: 'flex-start',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.5)',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>
              {ticket.tip_est_ticket || ticket.nom_estado || 'Pendiente'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 20, color: '#fff' }}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 }}>
          {/* Problema - Destacado */}
          <View style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              ⚠️ Problema Reportado
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, lineHeight: 28 }}>
              {ticket.nom_problm || ticket.nom_problema || ticket.descripcion || 'Sin descripción'}
            </Text>
          </View>

          {/* Grid de 2x2 - Información Principal */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              
              {/* Equipo */}
              <View style={{ flex: 1, backgroundColor: colors.cardBackground, padding: 14, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3fbb34', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  ⚙️ Equipo
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                  {ticket.nom_elem || ticket.nom_elemento || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* Reportado por */}
              <View style={{ flex: 1, backgroundColor: colors.cardBackground, padding: 14, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3fbb34', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  👤 Usuario
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                  {ticket.nom_usu || 'Desconocido'}
                </Text>
              </View>
              {/* Ubicación */}
              <View style={{ flex: 1, backgroundColor: colors.cardBackground, padding: 14, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3fbb34', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  📄 Ambiente
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                  {ticket.ambient || 'No especificada'}
                </Text>
              </View>
            </View>
          </View>

          {/* Fechas */}
          <View style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                📅 Fecha de Creación
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                {ticket.fecha_in ? new Date(ticket.fecha_in).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }) : 'N/A'}
              </Text>
            </View>
            {ticket.fecha_actualizacion && (
              <View>
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  🔄 Última Actualización
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                  {new Date(ticket.fecha_actualizacion).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            )}
          </View>

          {/* Observaciones si existen */}
          {(ticket.obser || ticket.observaciones) && (
            <View style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#FF9800', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                📝 Observaciones
              </Text>
              <Text style={{ fontSize: 14, color: colors.textTertiary, lineHeight: 22 }}>
                {ticket.obser || ticket.observaciones}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botones de Acción - Fixed Footer */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 24, backgroundColor: colors.cardBackground, borderTopWidth: 1, borderTopColor: colors.border, gap: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}>
        <TouchableOpacity
          onPress={abrirModalTomar}
          disabled={loading}
          style={{
            backgroundColor: '#3fbb34',
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: 'center',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
              ✓ Tomar Ticket
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={abrirModalCancelar}
          disabled={loading}
          style={{
            backgroundColor: colors.cardBackground,
            borderWidth: 2,
            borderColor: colors.textSecondary,
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: 'center',
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textSecondary }}>
            ✕ Cerrar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal para Tomar */}
      <Modal
        visible={modalVisible && modalAction === 'tomar'}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <View
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              paddingHorizontal: 24,
              paddingVertical: 30,
              width: '100%',
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            {/* Icono de check */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 36, color: '#3fbb34' }}>✓</Text>
              </View>
            </View>

            {/* Título */}
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 12, textAlign: 'center' }}>
              ¿Tomar este Ticket?
            </Text>

            {/* Mensaje */}
            <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: 28, textAlign: 'center', lineHeight: 22 }}>
              El estado cambiará a <Text style={{ fontWeight: '700', color: '#3fbb34' }}>En Proceso</Text> y empezarás a trabajar en él.
            </Text>

            {/* Botones */}
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={confirmarAccion}
                disabled={loading}
                style={{
                  backgroundColor: '#3fbb34',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                    ✓ Sí, Tomar Ticket
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                disabled={loading}
                style={{
                  backgroundColor: colors.cardBackground,
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: 15 }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para Cerrar */}
      <Modal
        visible={modalVisible && modalAction === 'cancelar'}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <View
            style={{
              backgroundColor: colors.cardBackground,
              borderRadius: 16,
              paddingHorizontal: 24,
              paddingVertical: 30,
              width: '100%',
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            {/* Icono de cerrar */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: colors.inputBackground, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 36, color: colors.textSecondary }}>✕</Text>
              </View>
            </View>

            {/* Título */}
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 12, textAlign: 'center' }}>
              Cerrar Detalles
            </Text>

            {/* Mensaje */}
            <Text style={{ fontSize: 14, color: colors.textTertiary, marginBottom: 28, textAlign: 'center', lineHeight: 22 }}>
              El ticket permanecerá en la lista sin cambios.
            </Text>

            {/* Botones */}
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={confirmarAccion}
                disabled={loading}
                style={{
                  backgroundColor: colors.textSecondary,
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                  ✕ Cerrar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                disabled={loading}
                style={{
                  backgroundColor: colors.cardBackground,
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '700', fontSize: 15 }}>
                  Volver
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DetallesTicket;
