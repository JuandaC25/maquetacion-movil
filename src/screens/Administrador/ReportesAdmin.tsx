
import React, { FC, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AdminHeader from './AdminHeader/AdminHeader';
import { ticketsService } from '../../services/Api';
import { trazabilidadService } from '../../services/Api';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const estadoInfo = (estado: number | string) => {
  switch (Number(estado)) {
    case 1: return { label: '🟢 Activo', color: '#12bb1a', bg: '#e8f5e8' };
    case 2: return { label: '🟡 Pendiente', color: '#ef6c00', bg: '#fff3e0' };
    case 3: return { label: '🔴 Inactivo', color: '#e53935', bg: '#ffebee' };
    default: return { label: 'Pendiente', color: '#ef6c00', bg: '#fff3e0' };
  }
};

const ReportesAdmin: FC = () => {
  const [tickets, setTickets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [modalTicket, setModalTicket] = React.useState<any | null>(null);
  const [modalHistorial, setModalHistorial] = React.useState<any | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | number | null>(null);

  // Helper to fetch full ticket/trazabilidad details and resolve user/element names
  const openHistorialModal = async (ticket: any) => {
    try {
      // Check if user is authenticated
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setModalHistorial({
          id: ticket.id ?? ticket.id_tickets,
          fecha: '-',
          usuarioReporta: '-',
          usuario: '-',
          elemento: '-',
          ticketNum: ticket.id ?? ticket.id_tickets ?? '-',
          observacion: 'Debes iniciar sesión para ver el historial.',
        });
        return;
      }
      
      // Fetch trazabilidad history for the ticket
      const ticketId = ticket.id ?? ticket.id_tickets;
      console.log('[TRAZABILIDAD][MÓVIL] Intentando obtener historial para ticket:', ticketId);
      console.log('[TRAZABILIDAD][MÓVIL] Token disponible:', !!token);
      
      const res = await trazabilidadService.getByTicketId(ticketId);
      console.log('[TRAZABILIDAD][MÓVIL] Respuesta completa de la API:', res);
      console.log('[TRAZABILIDAD][MÓVIL] Data de la respuesta:', res.data);
      // Manejar diferentes tipos de respuesta
      let history = [];
      if (res.data && Array.isArray(res.data)) {
        history = res.data;
      } else if (Array.isArray(res)) {
        history = res;
      }
      console.log('[TRAZABILIDAD][MÓVIL] Historial procesado:', history);
      let latest = history.length > 0 ? [...history].sort((a, b) => {
        const fechaA = new Date(
          a.fech || a.fecha || a.fecha1 || a.fecha_ini || 0
        );
        const fechaB = new Date(
          b.fech || b.fecha || b.fecha1 || b.fecha_ini || 0
        );
        return fechaB.getTime() - fechaA.getTime();
      })[0] : null;
      if (latest) {
        console.log('[TRAZABILIDAD] Objeto latest antes de setModalHistorial:', latest);
        setModalHistorial({
          id: latest.id_trsa ?? latest.id ?? '-',
          fecha: latest.fech ?? latest.fecha ?? '-',
          usuarioReporta: latest.nom_us_reporta ?? '-',
          usuario: latest.nom_us ?? '-',
          elemento: latest.nom_elemen ?? latest.nom_elem ?? '-',
          ticketNum: latest.id_ticet ?? latest.id_ticket ?? latest.id_tickets ?? ticketId ?? '-',
          observacion: latest.obser ?? latest.obse ?? latest.descripcion ?? latest.respuesta ?? 'Sin respuesta registrada',
          problema: latest.nom_problm ?? '-', // Agregar campo de problema
          ...latest
        });
      } else {
        setModalHistorial({
          id: ticketId ?? '-',
          fecha: '-',
          usuarioReporta: '-',
          usuario: '-',
          elemento: '-',
          ticketNum: ticketId ?? '-',
          observacion: 'Sin respuesta registrada',
        });
      }
    } catch (err: any) {
      console.error('[TRAZABILIDAD][MÓVIL] Error al obtener historial:', err);
      
      // Handle specific error cases
      let errorMessage = 'Error al cargar historial';
      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = 'No tienes permisos para ver el historial. Inicia sesión nuevamente.';
        } else if (err.response.status === 401) {
          errorMessage = 'Sesión expirada. Inicia sesión nuevamente.';
        } else if (err.response.status === 404) {
          errorMessage = 'No se encontró historial para este ticket.';
        }
      }
      
      setModalHistorial({
        id: ticket.id ?? ticket.id_tickets,
        fecha: '-',
        usuarioReporta: '-',
        usuario: '-',
        elemento: '-',
        ticketNum: ticket.id ?? ticket.id_tickets ?? '-',
        observacion: errorMessage,
      });
    }
  };


  React.useEffect(() => {
    console.log('[MODAL] modalHistorial:', modalHistorial);
  }, [modalHistorial]);

  React.useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await ticketsService.getAll();
        // res.data debe ser un array de tickets
        setTickets(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <AdminHeader title="Reportes" navigation={navigation} />
      <View style={{ height: 12 }} />
      {loading ? (
        <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {tickets.map((t) => {
            // Compatibilidad con campos posibles: id, id_tickets, ticket, nom_elem, estado, id_est_tick
            const id = t.id ?? t.id_tickets;
            const nombre = t.ticket ?? `Ticket #${id}`;
            const elemento = t.nom_elem ?? t.elemento ?? 'Sin elemento';
            const estado = estadoInfo(t.id_est_tick ?? t.estado);
            const isExpanded = expandedId === id;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.cardOriginal, { backgroundColor: colors.cardBackground }]}
                activeOpacity={0.92}
                onPress={() => setExpandedId(isExpanded ? null : id)}
              >
                <View style={styles.ribbonModern}>
                  <Text style={styles.ribbonTextModern}>{estado.label}</Text>
                </View>
                <View style={styles.iconCircleModern}>
                  <Text style={styles.iconEmojiModern}>🎫</Text>
                </View>
                <View style={styles.cardContentOriginal}>
                  <Text style={[styles.cardTitleOriginal, { color: colors.title }]}>{nombre}</Text>
                  <Text style={[styles.cardElemOriginal, { color: colors.textPrimary }]}>{elemento}</Text>
                </View>
                {isExpanded && (
                  <View style={styles.cardFooterModern}>
                    <TouchableOpacity style={[styles.actionBtnModern, { backgroundColor: '#12bb1a' }]} onPress={() => setModalTicket(t)}>
                      <Text style={styles.actionBtnTextModern} numberOfLines={1} ellipsizeMode="tail">VER</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtnModern, { backgroundColor: '#1976d2' }]} onPress={() => openHistorialModal(t)}>
                      <Text style={styles.actionBtnTextModern} numberOfLines={1} ellipsizeMode="tail">TRAZABILIDAD</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Modal para ver ticket */}
      {modalTicket && console.log('modalTicket:', modalTicket)}
      <Modal visible={!!modalTicket} transparent animationType="slide" onRequestClose={() => setModalTicket(null)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}> 
          <View style={[styles.modalContentFull, { backgroundColor: colors.modalBackground }]}> 
            <View style={styles.modalHeaderFull}>
              <Text style={[styles.modalTitleFull, { color: colors.title }]}>Detalles del Ticket</Text>
            </View>
            <View style={styles.modalBodyFull}>
              <View style={styles.modalRowFull}><Text style={[styles.modalLabelFull, { color: colors.title }]}>Número del Ticket:</Text><Text style={[styles.modalValueFull, { color: colors.textPrimary }]}>{modalTicket?.id_tickets ?? modalTicket?.id ?? '-'}</Text></View>
              <View style={styles.modalRowFull}><Text style={[styles.modalLabelFull, { color: colors.title }]}>Fecha de inicio:</Text><Text style={[styles.modalValueFull, { color: colors.textPrimary }]}>{modalTicket?.fecha_in ?? '-'}</Text></View>
              <View style={styles.modalRowFull}><Text style={[styles.modalLabelFull, { color: colors.title }]}>Fecha de fin:</Text><Text style={[styles.modalValueFull, { color: colors.textPrimary }]}>{modalTicket?.fecha_fin ?? '-'}</Text></View>
              <View style={styles.modalRowFull}><Text style={[styles.modalLabelFull, { color: colors.title }]}>Ambiente:</Text><Text style={[styles.modalValueFull, { color: colors.textPrimary }]}>{modalTicket?.ambient ?? '-'}</Text></View>
              <View style={styles.modalRowFull}><Text style={[styles.modalLabelFull, { color: colors.title }]}>Problema:</Text><Text style={[styles.modalValueFull, { color: colors.textPrimary }]}>{modalTicket?.Obser ?? modalTicket?.nom_problm ?? '-'}</Text></View>
              <View style={styles.modalRowFull}><Text style={[styles.modalLabelFull, { color: colors.title }]}>Usuario:</Text><Text style={[styles.modalValueFull, { color: colors.textPrimary }]}>{modalTicket?.nom_usu ?? '-'}</Text></View>
              <View style={styles.modalRowFull}><Text style={[styles.modalLabelFull, { color: colors.title }]}>Nombre del Elemento:</Text><Text style={[styles.modalValueFull, { color: colors.textPrimary }]}>{modalTicket?.nom_elem ?? '-'}</Text></View>
              <View style={styles.modalRowFull}>
                <Text style={[styles.modalLabelFull, { color: colors.title }]}>Estado:</Text>
                <View style={styles.estadoBadgeFull}>
                  <Text style={{ fontSize: 16, color: colors.textPrimary }}>{estadoInfo(modalTicket?.estado ?? modalTicket?.id_est_tick).label}</Text>
                </View>
              </View>
              <View style={styles.modalRowFull}>
                <Text style={[styles.modalLabelFull, { color: colors.title }]}>Observaciones:</Text>
                <Text style={[styles.modalValueFull, { color: colors.textPrimary }]}>{modalTicket?.observaciones ?? modalTicket?.observacion ?? '-'}</Text>
              </View>
              
              {/* Sección de imágenes */}
              <View style={{ marginTop: 10 }}>
                <Text style={[styles.modalLabelFull, { color: colors.title, marginBottom: 8 }]}>Imágenes:</Text>
                {(() => {
                  const raw = modalTicket?.imageness ?? modalTicket?.imagenes ?? modalTicket?.imagen ?? null;
                  if (!raw) return <Text style={{ color: colors.textPrimary }}>No hay imágenes disponibles</Text>;

                  let urls: string[] = [];
                  try {
                    if (Array.isArray(raw)) {
                      urls = raw;
                    } else if (typeof raw === 'string') {
                      const s = raw.trim();
                      if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
                        const parsed = JSON.parse(s);
                        if (Array.isArray(parsed)) urls = parsed;
                        else if (typeof parsed === 'string') urls = [parsed];
                      } else {
                        urls = [s];
                      }
                    }
                  } catch (e) {
                    urls = typeof raw === 'string' ? [raw] : [];
                  }

                  if (!urls || urls.length === 0) return <Text style={{ color: colors.textPrimary }}>No hay imágenes disponibles</Text>;

                  const normalizeUrl = (u: string) => {
                    if (!u) return null;
                    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
                    if (u.startsWith('/uploads/')) {
                      return `http://192.168.20.60:8081${u}`;
                    }
                    return u;
                  };

                  return (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                      {urls.map((url, idx) => {
                        const src = normalizeUrl(url);
                        if (!src) return null;
                        return (
                          <View key={idx} style={{ marginRight: 12 }}>
                            <Image
                              source={{ uri: src }}
                              style={{ width: 180, height: 120, borderRadius: 8, backgroundColor: '#f0f0f0' }}
                              resizeMode="cover"
                            />
                            {urls.length > 1 && (
                              <Text style={{ color: colors.textPrimary, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                                Imagen {idx + 1}
                              </Text>
                            )}
                          </View>
                        );
                      })}
                    </ScrollView>
                  );
                })()}
              </View>
            </View>
            <View style={styles.modalFooterFull}>
              <TouchableOpacity style={styles.btnCerrarFull} onPress={() => setModalTicket(null)}>
                <Text style={styles.btnCerrarTextFull}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* Modal para ver trazabilidad */}
      <Modal visible={!!modalHistorial} transparent animationType="slide" onRequestClose={() => setModalHistorial(null)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}> 
          <View style={[styles.modalContentFull, { backgroundColor: colors.modalBackground }]}> 
            <View style={styles.modalHeaderFull}>
              <Text style={styles.modalTitleFull}>Historial de entradas</Text>
            </View>
            <View style={styles.modalBodyFull}>
              <Text style={[styles.modalLabelFull, { fontWeight: 'bold', fontSize: 17, marginBottom: 10, color: colors.title }]}>Trazabilidad — Entrada #{modalHistorial?.id ?? '-'}</Text>
              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.modalLabelFull, { color: colors.title, fontWeight: 'bold' }]}>Fecha</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 16 }}>{modalHistorial?.fecha ?? '-'}</Text>
              </View>
              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.modalLabelFull, { color: colors.title, fontWeight: 'bold' }]}>Reportado por / Respondido por</Text>
                <View style={{ flexDirection: 'row', gap: 20 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14 }}><Text style={{ fontWeight: 'bold' }}>Reportó:</Text> {modalHistorial?.usuarioReporta ?? '-'}</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, marginLeft: 20, borderLeftWidth: 1, borderLeftColor: '#ddd', paddingLeft: 20 }}><Text style={{ fontWeight: 'bold' }}>Respondió (Técnico):</Text> {modalHistorial?.usuario ?? '-'}</Text>
                </View>
              </View>
              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.modalLabelFull, { color: colors.title, fontWeight: 'bold' }]}>Elemento</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 16 }}>{modalHistorial?.elemento ?? '-'}</Text>
              </View>
              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.modalLabelFull, { color: colors.title, fontWeight: 'bold' }]}>Problema</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 16 }}>{modalHistorial?.problema ?? '-'}</Text>
              </View>
              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.modalLabelFull, { color: colors.title, fontWeight: 'bold' }]}>ID interno</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 16 }}>{modalHistorial?.id ?? '-'}</Text>
              </View>
              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.modalLabelFull, { color: colors.title, fontWeight: 'bold' }]}>Respuesta del Técnico</Text>
                <View style={{ backgroundColor: '#f1f8f4', borderRadius: 8, padding: 8, minHeight: 32, marginBottom: 10 }}>
                  <Text style={{ color: '#333', fontSize: 14 }}>{modalHistorial?.observacion ?? 'Sin respuesta registrada'}</Text>
                </View>
              </View>
            </View>
            <View style={styles.modalFooterFull}>
              <TouchableOpacity style={styles.btnCerrarFull} onPress={() => setModalHistorial(null)}>
                <Text style={styles.btnCerrarTextFull}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
      // --- MODAL DETALLE TICKET FULL ---
      modalContentFull: {
        // backgroundColor: '#fff',
        borderRadius: 14,
        width: '92%',
        maxWidth: 500,
        alignItems: 'stretch',
        overflow: 'hidden',
      },
      modalHeaderFull: {
        backgroundColor: '#12bb1a',
        paddingVertical: 18,
        paddingHorizontal: 20,
      },
      modalTitleFull: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'left',
      },
      modalBodyFull: {
        padding: 20,
      },
      modalRowFull: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
      },
      modalLabelFull: {
        fontWeight: 'bold',
        fontSize: 16,
        minWidth: 130,
        color: '#222',
      },
      modalValueFull: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        marginLeft: 8,
      },
      estadoBadgeFull: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginLeft: 8,
      },
      modalFooterFull: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        backgroundColor: '#f8f9fa',
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        gap: 8,
      },
      btnCerrarFull: {
        backgroundColor: '#6c757d',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 18,
        minWidth: 90,
        alignItems: 'center',
      },
      btnCerrarTextFull: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
      },
      btnEditarEstadoFull: {
        backgroundColor: '#ffc107',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 18,
        minWidth: 110,
        alignItems: 'center',
      },
      btnEditarEstadoTextFull: {
        color: '#222',
        fontWeight: 'bold',
        fontSize: 15,
      },
        btnEditarProblemaFull: {
          backgroundColor: '#00bcd4',
          borderRadius: 8,
          paddingVertical: 10,
          paddingHorizontal: 18,
          minWidth: 120,
          alignItems: 'center',
        },
        btnEditarProblemaTextFull: {
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 15,
        },
    ribbonModern: {
      alignSelf: 'center',
      marginTop: -18,
      marginBottom: 6,
      // backgroundColor: '#fff',
      borderRadius: 16,
      paddingVertical: 2,
      paddingHorizontal: 16,
      minWidth: 110,
      alignItems: 'center',
      shadowColor: '#12bb1a',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.10,
      shadowRadius: 2,
      elevation: 2,
      zIndex: 2,
    },
    ribbonTextModern: {
      fontWeight: 'bold',
      fontSize: 15,
      color: '#12bb1a',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    iconCircleModern: {
      alignSelf: 'center',
      marginTop: 2,
      marginBottom: 8,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#e8f5e8',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#12bb1a',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.10,
      shadowRadius: 4,
      elevation: 2,
    },
    iconEmojiModern: {
      fontSize: 36,
      color: '#12bb1a',
      textAlign: 'center',
    },
    cardFooterModern: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: '#f1f8e9',
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
      gap: 0,
    },
    actionBtnModern: {
      width: 120,
      marginHorizontal: 0,
      marginRight: 8,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#12bb1a',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.10,
      shadowRadius: 2,
      elevation: 2,
    },
    actionBtnTextModern: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 15,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      textAlign: 'center',
    },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', /* color: 'rgb(9,180,26)', */ marginBottom: 16, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 40 },
  ribbon: {
    position: 'absolute',
    top: 0,
    right: 0,
    // backgroundColor: '#fff',
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 18,
    zIndex: 2,
    shadowColor: '#12bb1a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  ribbonText: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#12bb1a',
    letterSpacing: 0.5,
  },
  iconCircle: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 2,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#12bb1a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  iconEmoji: {
    fontSize: 28,
    color: '#12bb1a',
  },
  cardContentOriginal: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 6,
  },
  cardTitleOriginal: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#263238',
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  cardElemOriginal: {
    fontSize: 15,
    color: '#1976d2',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  cardOriginal: {
    // backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#e0f2f1',
    overflow: 'visible',
    position: 'relative',
    paddingTop: 18,
  },
  cardFooterOriginal: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: '#f1f8e9',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  actionBtnOriginal: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#12bb1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  actionBtnTextOriginal: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    // backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', /* color: '#1976d2', */ marginBottom: 16, textAlign: 'center' },
});

export default ReportesAdmin;
