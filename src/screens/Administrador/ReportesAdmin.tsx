
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
    default: return { label: '🟡 Pendiente', color: '#ef6c00', bg: '#fff3e0' };
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
  const [trazabilidades, setTrazabilidades] = React.useState<any[]>([]);

  // Abrir modal del ticket con trazabilidad
  const openTicketModal = async (ticket: any) => {
    try {
      setModalTicket(ticket);
      
      // Obtener trazabilidad del ticket
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const ticketId = ticket.id ?? ticket.id_tickets;
        try {
          const res = await trazabilidadService.getByTicketId(ticketId);
          let history = [];
          if (res.data && Array.isArray(res.data)) {
            history = res.data;
          } else if (Array.isArray(res)) {
            history = res;
          }
          setTrazabilidades(history);
          console.log('[MODAL TICKET] Trazabilidades cargadas:', history);
        } catch (err) {
          console.log('[MODAL TICKET] Error cargando trazabilidades:', err);
          setTrazabilidades([]);
        }
      }
    } catch (err) {
      console.error('[MODAL TICKET] Error abriendo modal:', err);
    }
  };

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
    <View style={{ flex: 1, backgroundColor: colors.background }}> 
      <AdminHeader title="Reportes" navigation={navigation} />
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView contentContainerStyle={styles.listContainer}>
          {tickets.map((t) => {
            // Compatibilidad con campos posibles: id, id_tickets, ticket, nom_elem, estado, id_est_tick
            const id = t.id ?? t.id_tickets;
            const nombre = t.ticket ?? `Ticket #${id}`;
            const elemento = t.nom_elem ?? t.elemento ?? 'Sin elemento';
            const estado = estadoInfo(t.id_est_tick ?? t.estado);
            
            return (
              <View
                key={id}
                style={[styles.newCard, { backgroundColor: colors.cardBackground, borderColor: estado.color }]}
              >
                {/* Izquierda: Icono y info */}
                <View style={styles.cardLeft}>
                  <View style={[styles.statusBadge, { backgroundColor: estado.bg }]}>
                    <Text style={[styles.statusText, { color: estado.color }]}>{estado.label}</Text>
                  </View>
                  <View style={styles.infoSection}>
                    <Text style={[styles.ticketNumber, { color: colors.title }]}>#{id}</Text>
                    <Text style={[styles.ticketName, { color: colors.title }]}>{nombre}</Text>
                    <Text style={[styles.elementName, { color: colors.textPrimary }]}>{elemento}</Text>
                  </View>
                </View>

                {/* Derecha: Botones */}
                <View style={styles.cardRight}>
                  <TouchableOpacity 
                    style={[styles.newBtn, styles.btnVer]} 
                    onPress={() => openTicketModal(t)}
                  >
                    <Text style={styles.btnTextVer}>👁️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.newBtn, styles.btnTrazabilidad]} 
                    onPress={() => openHistorialModal(t)}
                  >
                    <Text style={styles.btnTextTraz}>📊</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
              <Text style={[styles.modalTitleFull, { color: colors.title }]}>Ticket — Observación principal</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textPrimary }]}>Ticket: {modalTicket?.id_tickets ?? modalTicket?.id ?? '-'}</Text>
            </View>
            <ScrollView style={styles.modalBodyFullScroll} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Meta información */}
              <View style={styles.metaSection}>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: colors.title }]}>Fecha apertura</Text>
                  <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{modalTicket?.fecha_in ?? modalTicket?.fecha_creacion ?? '-'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: colors.title }]}>Elemento</Text>
                  <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{modalTicket?.nom_elem ?? modalTicket?.elemento ?? '-'}</Text>
                </View>
              </View>

              {/* Sección de observación principal */}
              <View style={styles.observacionSection}>
                <Text style={[styles.sectionLabel, { color: colors.title }]}>Observación del Ticket (BD)</Text>
                <View style={[styles.observacionBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.observacionText, { color: colors.textPrimary }]}>
                    {modalTicket?.obser ?? modalTicket?.Obser ?? modalTicket?.observa ?? modalTicket?.descripcion ?? modalTicket?.observacion ?? modalTicket?.observ ?? 'Sin observación en la base de datos'}
                  </Text>
                </View>
              </View>

              {/* Información adicional */}
              <View style={styles.additionalSection}>
                <View style={styles.infoRow}>
                  <View style={styles.infoPair}>
                    <Text style={[styles.metaLabel, { color: colors.title }]}>Estado</Text>
                    <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{estadoInfo(modalTicket?.estado ?? modalTicket?.id_est_tick).label}</Text>
                  </View>
                  <View style={styles.infoPair}>
                    <Text style={[styles.metaLabel, { color: colors.title }]}>Ambiente</Text>
                    <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{modalTicket?.ambient ?? modalTicket?.ambiente ?? '-'}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoPair}>
                    <Text style={[styles.metaLabel, { color: colors.title }]}>Problema</Text>
                    <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{modalTicket?.nom_problm ?? modalTicket?.problema ?? '-'}</Text>
                  </View>
                  <View style={styles.infoPair}>
                    <Text style={[styles.metaLabel, { color: colors.title }]}>Usuario</Text>
                    <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{modalTicket?.nom_usu ?? modalTicket?.usuario ?? '-'}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoPair}>
                    <Text style={[styles.metaLabel, { color: colors.title }]}>Fecha de fin</Text>
                    <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{modalTicket?.fecha_fin ?? '-'}</Text>
                  </View>
                </View>
              </View>
              
              {/* Divider */}
              <View style={{ height: 1, backgroundColor: '#e0e0e0', marginVertical: 16 }} />

              {/* Trazabilidades */}
              {trazabilidades.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={[styles.sectionLabel, { color: colors.title, fontSize: 16, marginBottom: 12 }]}>Historial de Trazabilidad</Text>
                  {trazabilidades.map((h, idx) => {
                    const id = h.id_trsa ?? h.id ?? idx;
                    const fecha = h.fech ?? h.fecha ?? h.fecha1 ?? '-';
                    const observ = h.obser ?? h.obse ?? h.descripcion ?? h.observa ?? h.respuesta ?? 'Sin respuesta registrada';
                    const elemento = h.nom_elemen ?? h.nom_elem ?? h.elemento ?? '-';
                    const tecnico = h.nom_us ?? h.nom_usu ?? '-';
                    const usuarioReporta = h.nom_us_reporta ?? '-';
                    
                    return (
                      <View key={id} style={[styles.trazabilidadCard, { backgroundColor: colors.cardBackground, borderColor: '#28a745' }]}>
                        <View style={styles.trazabilidadHeader}>
                          <Text style={[styles.trazabilidadTitle, { color: colors.title }]}>Trazabilidad — Entrada #{id}</Text>
                          <Text style={[styles.trazabilidadTicket, { color: colors.textPrimary }]}>Ticket: {modalTicket?.id_tickets ?? modalTicket?.id ?? '-'}</Text>
                        </View>

                        <View style={styles.metaSection}>
                          <View style={styles.metaItem}>
                            <Text style={[styles.metaLabel, { color: colors.title }]}>Fecha</Text>
                            <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{fecha}</Text>
                          </View>

                          <View style={{ marginBottom: 12 }}>
                            <Text style={[styles.metaLabel, { color: colors.title }]}>Reportado por / Respondido por</Text>
                            <View style={{ marginTop: 4 }}>
                              <Text style={[styles.metaValue, { color: colors.textPrimary, marginBottom: 8 }]}>
                                <Text style={{ fontWeight: 'bold' }}>Reportó: </Text>
                                {usuarioReporta}
                              </Text>
                              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                                <Text style={{ fontWeight: 'bold' }}>Respondió (Técnico): </Text>
                                {tecnico}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.metaItem}>
                            <Text style={[styles.metaLabel, { color: colors.title }]}>Elemento</Text>
                            <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{elemento}</Text>
                          </View>
                        </View>

                        <View style={styles.observacionSection}>
                          <Text style={[styles.sectionLabel, { color: colors.title }]}>Respuesta del Técnico</Text>
                          <View style={[styles.observacionBox, { backgroundColor: colors.background }]}>
                            <Text style={[styles.observacionText, { color: colors.textPrimary }]}>
                              {observ}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Sección de imágenes */}
              <View style={{ marginTop: 10 }}>
                <Text style={[styles.modalLabelFull, { color: colors.title, marginBottom: 8 }]}>Imágenes:</Text>
                {(() => {
                  // Intentar obtener imágenes de múltiples campos posibles
                  const raw = modalTicket?.imageness ?? modalTicket?.imagenes ?? modalTicket?.imagen ?? modalTicket?.fotos ?? null;
                  
                  console.log('[IMAGES DEBUG] modalTicket completo:', modalTicket);
                  console.log('[IMAGES DEBUG] Campo raw de imágenes:', raw);
                  console.log('[IMAGES DEBUG] Tipo de raw:', typeof raw);
                  
                  if (!raw) {
                    return (
                      <View style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8 }}>
                        <Text style={{ color: colors.textPrimary }}>No hay imágenes disponibles</Text>
                      </View>
                    );
                  }

                  let urls: string[] = [];
                  try {
                    if (Array.isArray(raw)) {
                      urls = raw.filter(u => u); // Filtrar valores vacíos
                    } else if (typeof raw === 'string') {
                      const s = raw.trim();
                      if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
                        const parsed = JSON.parse(s);
                        if (Array.isArray(parsed)) urls = parsed.filter(u => u);
                        else if (typeof parsed === 'string') urls = [parsed];
                      } else if (s.length > 0) {
                        urls = [s];
                      }
                    }
                  } catch (e) {
                    console.log('[IMAGES ERROR] Error al parsear imágenes:', e);
                    urls = typeof raw === 'string' ? [raw] : [];
                  }

                  console.log('[IMAGES DEBUG] URLs procesadas:', urls);

                  if (!urls || urls.length === 0) {
                    return (
                      <View style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8 }}>
                        <Text style={{ color: colors.textPrimary }}>No hay imágenes disponibles</Text>
                      </View>
                    );
                  }

                  const normalizeUrl = (u: string) => {
                    if (!u) return null;
                    if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u;
                    if (u.startsWith('/uploads/')) {
                      const finalUrl = `http://10.232.222.133:8081${u}`;
                      console.log('[IMAGES] URL final construida:', finalUrl);
                      return finalUrl;
                    }
                    // Si no tiene protocolo, asumir que es una ruta en uploads
                    const finalUrl = `http://10.232.222.133:8081/uploads/${u}`;
                    console.log('[IMAGES] URL final construida (sin /uploads):', finalUrl);
                    return finalUrl;
                  };

                  return (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                      {urls.map((url, idx) => {
                        const src = normalizeUrl(url);
                        console.log('[IMAGES] Intentando cargar imagen:', src);
                        if (!src) return null;
                        return (
                          <View key={idx} style={{ marginRight: 12 }}>
                            <Image
                              source={{ uri: src }}
                              style={{ width: 180, height: 120, borderRadius: 8, backgroundColor: '#f0f0f0' }}
                              resizeMode="cover"
                              onError={(e) => console.log('[IMAGES ERROR] Error cargando imagen:', e.nativeEvent.error)}
                              onLoad={() => console.log('[IMAGES] Imagen cargada exitosamente:', src)}
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
            </ScrollView>
            <View style={styles.modalFooterFull}>
              <TouchableOpacity style={styles.btnCerrarFull} onPress={() => {
                setModalTicket(null);
                setTrazabilidades([]);
              }}>
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
              <Text style={[styles.modalTitleFull, { color: colors.title }]}>Historial de entradas</Text>
            </View>
            <ScrollView style={styles.modalBodyFull}>
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
            </ScrollView>
            <View style={styles.modalFooterFull}>
              <TouchableOpacity style={styles.btnCerrarFull} onPress={() => setModalHistorial(null)}>
                <Text style={styles.btnCerrarTextFull}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
      // --- ESTILOS NUEVOS PARA TARJETAS ---
      listContainer: {
        paddingBottom: 40,
        paddingHorizontal: 12,
      },
      newCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 14,
        borderWidth: 2,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
      },
      cardLeft: {
        flex: 1,
        marginRight: 12,
      },
      cardRight: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
      },
      statusBadge: {
        alignSelf: 'flex-start',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 8,
      },
      statusText: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.4,
      },
      infoSection: {
        gap: 4,
      },
      ticketNumber: {
        fontSize: 13,
        fontWeight: '600',
        opacity: 0.7,
      },
      ticketName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
      },
      elementName: {
        fontSize: 13,
        fontWeight: '500',
        opacity: 0.75,
      },
      newBtn: {
        width: 48,
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 2,
      },
      btnVer: {
        backgroundColor: '#12bb1a',
      },
      btnTrazabilidad: {
        backgroundColor: '#1976d2',
      },
      btnTextVer: {
        fontSize: 24,
      },
      btnTextTraz: {
        fontSize: 24,
      },

      // --- MODAL DETALLE TICKET FULL ---
      modalContentFull: {
        // backgroundColor: '#fff',
        borderRadius: 14,
        width: '95%',
        maxWidth: 600,
        height: '88%',
        maxHeight: '90%',
        flexDirection: 'column',
        alignItems: 'stretch',
        overflow: 'hidden',
      },
      modalHeaderFull: {
        backgroundColor: '#28a745',
        paddingVertical: 14,
        paddingHorizontal: 20,
      },
      modalTitleFull: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left',
      },
      modalSubtitle: {
        fontSize: 12,
        marginTop: 4,
        opacity: 0.9,
      },
      modalBodyFull: {
        padding: 20,
      },
      modalBodyFullScroll: {
        padding: 20,
        flex: 1,
      },
      metaSection: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
      },
      metaItem: {
        marginBottom: 12,
      },
      metaLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
      },
      metaValue: {
        fontSize: 14,
      },
      observacionSection: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
      },
      sectionLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
      },
      observacionBox: {
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        minHeight: 80,
      },
      observacionText: {
        fontSize: 14,
        lineHeight: 20,
      },
      additionalSection: {
        marginTop: 12,
      },
      infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 12,
      },
      infoPair: {
        flex: 1,
      },
      trazabilidadCard: {
        borderWidth: 1.5,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderColor: '#28a745',
      },
      trazabilidadHeader: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
      },
      trazabilidadTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 4,
      },
      trazabilidadTicket: {
        fontSize: 12,
        opacity: 0.7,
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: 18,
        backgroundColor: '#f8f9fa',
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        gap: 12,
      },
      btnCerrarFull: {
        backgroundColor: '#6c757d',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 40,
        minWidth: 150,
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
        paddingVertical: 12,
        paddingHorizontal: 40,
        minWidth: 150,
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
          paddingVertical: 12,
          paddingHorizontal: 40,
          minWidth: 150,
          alignItems: 'center',
        },
        btnEditarProblemaTextFull: {
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 15,
        },

  container: { flex: 1, padding: 16 },
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
