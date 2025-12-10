import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import HeaderTecnico from '../HeaderTecnico/HeaderTecnico';

const DetallesHistorial = ({ route, navigation }: any) => {
  const { item, tipo } = route.params;
  const { colors, theme } = useTheme();

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTicketDetails = () => {
    const ticket = item;
    return (
      <>
        <View style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#3fbb34' }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            🎟️ Número de Ticket
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>
            #{ticket.id_tickets || ticket.id_ticket || ticket.num_ticket}
          </Text>
        </View>

        <View style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FF9800' }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            ⚠️ Problema
          </Text>
          <Text style={{ fontSize: 14, color: colors.textPrimary, lineHeight: 22 }}>
            {ticket.nom_problm || ticket.nom_problema || 'Sin descripción'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1, backgroundColor: colors.cardBackground, padding: 14, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3fbb34' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              🏷️ Categoría
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
              {ticket.nom_cat || 'N/A'}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.cardBackground, padding: 14, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3fbb34' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              ⚙️ Equipo
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
              {ticket.nom_elem || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: colors.cardBackground, padding: 14, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3fbb34' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              👤 Usuario
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
              {ticket.nom_usu || 'Desconocido'}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.cardBackground, padding: 14, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3fbb34' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              📍 Ubicación
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
              {ticket.ambient || 'No especificada'}
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            📅 Fechas
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
            Creado: {formatDate(ticket.fecha_in || ticket.fecha_creacion)}
          </Text>
          {ticket.fecha_actualizacion && (
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
              Actualizado: {formatDate(ticket.fecha_actualizacion)}
            </Text>
          )}
        </View>

        {(ticket.obser || ticket.observaciones) && (
          <View style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FF9800' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              📝 Observaciones
            </Text>
            <Text style={{ fontSize: 14, color: colors.textTertiary, lineHeight: 22 }}>
              {ticket.obser || ticket.observaciones}
            </Text>
          </View>
        )}
      </>
    );
  };

  const renderPrestamoDetails = () => {
    const prestamo = item;
    return (
      <>
        <View style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#3fbb34' }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            🎁 Equipo
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>
            {prestamo.nom_elem}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1, backgroundColor: colors.cardBackground, padding: 14, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3fbb34' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              🏷️ Categoría
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
              {prestamo.nom_cat || 'N/A'}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.cardBackground, padding: 14, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3fbb34' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              👤 Usuario
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
              {prestamo.nom_usu}
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            📅 Fechas
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
            Inicio: {formatDate(prestamo.fecha_ini)}
          </Text>
          {prestamo.fecha_entreg && (
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
              Entrega: {formatDate(prestamo.fecha_entreg)}
            </Text>
          )}
        </View>
      </>
    );
  };

  const renderSolicitudDetails = () => {
    const solicitud = item;
    return (
      <>
        <View style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#3fbb34' }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            📋 Solicitud
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>
            {solicitud.nom_elem || solicitud.nom_espa}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <View style={{ flex: 1, backgroundColor: colors.cardBackground, padding: 14, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3fbb34' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              🏷️ Categoría
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
              {solicitud.nom_cat || 'N/A'}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.cardBackground, padding: 14, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3fbb34' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              👤 Usuario
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
              {solicitud.nom_usu}
            </Text>
          </View>
        </View>

        {solicitud.nom_subcat && (
          <View style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FF9800' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              📂 Subcategoría
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
              {solicitud.nom_subcat}
            </Text>
          </View>
        )}

        <View style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            📅 Fecha
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
            {formatDate(solicitud.fecha_ini || solicitud.fecha_act)}
          </Text>
        </View>
      </>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderTecnico title={`Detalles del ${tipo === 'tickets' ? 'Ticket' : tipo === 'prestamos' ? 'Préstamo' : 'Espacio'}`} navigation={navigation} />
      
      <ScrollView style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
        {/* Botón de cerrar */}
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
            borderColor: colors.border,
          }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>✕</Text>
        </TouchableOpacity>

        {/* Estado Badge */}
        <View style={{ backgroundColor: colors.cardBackground, padding: 16, borderRadius: 12, marginBottom: 16, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Estado
          </Text>
          <View style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor:
              item.nom_estado === 'Finalizado' ? '#4CAF50' :
              item.nom_estado === 'Aprobada' ? '#4CAF50' :
              item.nom_estado === 'Pendiente' ? '#FF9800' :
              item.nom_estado === 'Cerrado' ? '#757575' :
              item.nom_estado === 'Rechazada' ? '#F44336' :
              '#2196F3',
          }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
              {item.nom_estado}
            </Text>
          </View>
        </View>

        {/* Detalles por tipo */}
        {tipo === 'tickets' && renderTicketDetails()}
        {tipo === 'prestamos' && renderPrestamoDetails()}
        {tipo === 'solicitudes' && renderSolicitudDetails()}

        {/* Espaciador inferior */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Footer con botón Cerrar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 24, backgroundColor: colors.cardBackground, borderTopWidth: 1, borderTopColor: colors.border }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: colors.textSecondary,
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
            ← Cerrar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DetallesHistorial;
