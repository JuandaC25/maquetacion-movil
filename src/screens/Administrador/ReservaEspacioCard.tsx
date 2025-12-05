import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export type ReservaEspacio = {
  id: number;
  nom_espa: string;
  usuario: string;
  ambient: string;
  num_ficha?: string;
  fecha_ini: string;
  fecha_fn: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Cancelado' | 'Finalizado' | 'Terminado' | string;
  imagen?: string;
  _locked?: boolean;
  elementos?: string;
};

interface Props {
  reserva: ReservaEspacio;
  onAprobar?: () => void;
  onRechazar?: () => void;
  onPendiente?: () => void;
}


const estadoStyle = (estado: string) => {
  switch (estado.toUpperCase()) {
    case 'PENDIENTE': return { color: '#e67e22', bg: 'rgba(230,126,34,0.1)' };
    case 'APROBADO': return { color: '#43b97f', bg: 'rgba(67,185,127,0.12)' };
    case 'RECHAZADO': return { color: '#e53935', bg: 'rgba(229,57,53,0.12)' };
    case 'CANCELADO': return { color: '#17a2b8', bg: 'rgba(23,162,184,0.12)' };
    case 'FINALIZADO':
    case 'TERMINADO': return { color: '#6c757d', bg: 'rgba(108,117,125,0.12)' };
    default: return { color: '#888', bg: '#eee' };
  }
};

const ReservaEspacioCard: React.FC<Props> = ({ reserva, onAprobar, onRechazar, onPendiente }) => {
  const estado = estadoStyle(reserva.estado);
  // Normaliza el estado para comparación robusta
  // Normaliza el estado para comparación robusta
  const estadoUpper = typeof reserva.estado === 'string' ? reserva.estado.trim().toUpperCase() : '';
  const mostrarBotones = estadoUpper === 'PENDIENTE' && !reserva._locked;
  return (
    <View style={[styles.card, estadoUpper === 'TERMINADO' ? { backgroundColor: '#6c757d22' } : {}]}>
      <View style={styles.cardBorderTop} />
      {reserva.imagen ? (
        <Image source={{ uri: reserva.imagen }} style={styles.imagen} />
      ) : (
        <View style={styles.imagenPlaceholder} />
      )}
      <View style={[styles.cardContent, { backgroundColor: '#09b41a', borderRadius: 12, padding: 16 }]}> 
        <Text style={[styles.titulo, { color: '#fff', fontWeight: 'bold', fontSize: 22, marginBottom: 8 }]}>{reserva.nom_espa || 'Espacio N/A'}</Text>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Usuario: <Text style={{ fontWeight: 'normal' }}>{reserva.usuario}</Text></Text>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Ambiente: <Text style={{ fontWeight: 'normal' }}>{reserva.ambient}</Text></Text>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Ficha: <Text style={{ fontWeight: 'normal' }}>{reserva.num_ficha || 'N/A'}</Text></Text>
        {reserva.elementos && (
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Elementos: <Text style={{ fontWeight: 'normal' }}>{reserva.elementos}</Text></Text>
        )}
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Inicio: <Text style={{ fontWeight: 'normal' }}>{reserva.fecha_ini}</Text></Text>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Fin: <Text style={{ fontWeight: 'normal' }}>{reserva.fecha_fn}</Text></Text>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginTop: 8 }}>Estado: <Text style={{ fontWeight: 'normal', color: estadoStyle(reserva.estado).color }}>{estadoUpper}</Text></Text>
        {mostrarBotones && (
          <View style={styles.botones}>
            <TouchableOpacity style={[styles.btn, styles.btnPendiente]} onPress={onPendiente}>
              <Text style={styles.btnText}>Pendiente</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnAprobar]} onPress={onAprobar}>
              <Text style={styles.btnText}>Aprobar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnRechazar]} onPress={onRechazar}>
              <Text style={styles.btnText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 300,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  cardBorderTop: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgb(9,180,26)',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  imagen: {
    width: '100%',
    height: 90,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginBottom: 0,
    resizeMode: 'cover',
  },
  imagenPlaceholder: {
    width: '100%',
    height: 90,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginBottom: 0,
  },
  cardContent: {
    padding: 18,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tipoEspacio: {
    fontWeight: '600',
    color: 'rgb(9,180,26)',
    fontSize: 15,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  usuario: {
    fontWeight: '700',
    color: '#2c3e50',
    fontSize: 16,
    marginBottom: 2,
  },
  ficha: {
    fontSize: 15,
    color: '#555',
    marginBottom: 2,
  },
  fecha: {
    fontWeight: '400',
    color: '#7f8c8d',
    fontSize: 14,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 14,
    marginRight: 2,
  },
  estado: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 12,
    marginTop: 6,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 25,
    textTransform: 'capitalize',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  botones: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  btn: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  btnPendiente: {
    backgroundColor: '#FFD600',
  },
  btnAprobar: {
    backgroundColor: 'rgb(9,180,26)',
  },
  btnRechazar: {
    backgroundColor: '#e53935',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

export default ReservaEspacioCard;
