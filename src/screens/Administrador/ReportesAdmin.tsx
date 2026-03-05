
import React, { FC, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Image, TextInput, Alert as RNAlert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AdminHeader from './AdminHeader/AdminHeader';
import { ticketsService, problemasService } from '../../services/Api';
import { trazabilidadService } from '../../services/Api';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const estadoInfo = (estado: number | string) => {
  switch (Number(estado)) {
    case 1: return { label: '🟢 Activo', color: '#12bb1a', bg: '#e8f5e8' };
    case 2: return { label: '🟡 Pendiente', color: '#ef6c00', bg: '#fff3e0' };
    case 3: return { label: '✅ Terminado', color: '#1976d2', bg: '#e3f2fd' };
    case 4: return { label: '🔴 Inactivo', color: '#e53935', bg: '#ffebee' };
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
  
  const [showCrearProblemaModal, setShowCrearProblemaModal] = React.useState(false);
  const [nuevoTipo, setNuevoTipo] = React.useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = React.useState('');
  const [savingProblema, setSavingProblema] = React.useState(false);
  const [crearError, setCrearError] = React.useState<string | null>(null);

  // Abrir modal del ticket (información del ticket)
  const openTicketModal = async (ticket: any) => {
    try {
      setModalTicket(ticket);
      console.log('[MODAL TICKET] Ticket abierto:', ticket);
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
      
      // Guardar todas las trazabilidades
      setTrazabilidades(history);
      
      // Guardar el ticket para mostrar en el modal de trazabilidad
      setModalTicket(ticket);
      
      // Asignar el modal historial para que el modal sepa que está abierto
      setModalHistorial({
        ticketNum: ticketId ?? '-',
      });
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
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <TouchableOpacity 
          style={styles.crearProblemaBtn}
          onPress={() => { setShowCrearProblemaModal(true); setCrearError(null); }}
        >
          <Text style={styles.crearProblemaText}>+ Crear Problema</Text>
        </TouchableOpacity>
      </View>
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
                    <Text style={styles.btnTextVer}>📊</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.newBtn, styles.btnTrazabilidad]} 
                    onPress={() => openHistorialModal(t)}
                  >
                    <Text style={styles.btnTextTraz}>👁️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Modal para ver ticket */}
      {modalTicket && console.log('modalTicket:', modalTicket)}
      <Modal visible={!!modalTicket} transparent animationType="slide" onRequestClose={() => {
        setModalTicket(null);
        setTrazabilidades([]);
      }}>
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
                    {(() => {
                      const baseObservation = modalTicket?.obser ?? modalTicket?.Obser ?? modalTicket?.observa ?? modalTicket?.descripcion ?? modalTicket?.observacion ?? modalTicket?.observ ?? 'Sin observación en la base de datos';
                      
                      if (Array.isArray(modalTicket?.problemas) && modalTicket.problemas.length > 0) {
                        const problemDescriptions = modalTicket.problemas
                          .map((p: any) => p?.problemaDesc || (p?.problema && (p.problema.desc_problema || p.problema.desc)) || p?.descripcion || p?.descr || null)
                          .filter((desc: any) => desc && desc.trim())
                          .join('\n\n');
                        
                        return problemDescriptions ? `${baseObservation}\n\n${problemDescriptions}` : baseObservation;
                      }
                      
                      return baseObservation;
                    })()}
                  </Text>
                </View>
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
      <Modal visible={!!modalHistorial} transparent animationType="slide" onRequestClose={() => {
        setModalHistorial(null);
        setModalTicket(null);
        setTrazabilidades([]);
      }}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}> 
          <View style={[styles.modalContentFull, { backgroundColor: colors.modalBackground }]}> 
            <View style={styles.modalHeaderFull}>
              <Text style={[styles.modalTitleFull, { color: colors.title }]}>Historial de Trazabilidad</Text>
            </View>
            <ScrollView style={styles.modalBodyFullScroll} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Observación principal del ticket */}
              {modalTicket && (
                <View key="ticket-observ" style={[styles.trazabilidadCard, { backgroundColor: colors.cardBackground, borderColor: '#ffc107', borderWidth: 2 }]}>
                  <View style={styles.trazabilidadHeader}>
                    <Text style={[styles.trazabilidadTitle, { color: colors.title }]}>Ticket — Observación principal</Text>
                    <Text style={[styles.trazabilidadTicket, { color: colors.textPrimary }]}>Ticket: {modalTicket?.id_tickets ?? modalTicket?.id ?? '-'}</Text>
                  </View>

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

                  <View style={styles.observacionSection}>
                    <Text style={[styles.sectionLabel, { color: colors.title }]}>Observación del Ticket (BD)</Text>
                    <View style={[styles.observacionBox, { backgroundColor: colors.background }]}>
                      <Text style={[styles.observacionText, { color: colors.textPrimary }]}>
                        {modalTicket?.obser ?? modalTicket?.Obser ?? modalTicket?.observa ?? modalTicket?.descripcion ?? modalTicket?.observacion ?? modalTicket?.observ ?? 'Sin observación en la base de datos'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Divider */}
              {modalTicket && trazabilidades.length > 0 && (
                <View style={{ height: 1, backgroundColor: '#e0e0e0', marginVertical: 16 }} />
              )}

              {/* Entradas de trazabilidad */}
              {trazabilidades.length > 0 ? (
                trazabilidades.map((h, idx) => {
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
                        <Text style={[styles.trazabilidadTicket, { color: colors.textPrimary }]}>Ticket: {modalTicket?.id_tickets ?? modalTicket?.id ?? modalHistorial?.ticketNum ?? '-'}</Text>
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
                })
              ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 16 }}>No hay entradas de trazabilidad disponibles</Text>
                </View>
              )}
            </ScrollView>
            <View style={styles.modalFooterFull}>
              <TouchableOpacity style={styles.btnCerrarFull} onPress={() => {
                setModalHistorial(null);
                setModalTicket(null);
                setTrazabilidades([]);
              }}>
                <Text style={styles.btnCerrarTextFull}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL PARA CREAR PROBLEMA */}
      <Modal visible={showCrearProblemaModal} transparent animationType="fade" onRequestClose={() => { setShowCrearProblemaModal(false); setCrearError(null); }}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.title }]}>Crear Problema</Text>
            
            {crearError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{crearError}</Text>
              </View>
            )}
            
            <View style={{ width: '100%', marginTop: 16 }}>
              <Text style={[styles.labelInput, { color: colors.title }]}>Tipo de Problema</Text>
              <TextInput
                style={[styles.inputField, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Ej: Hardware, Software, Redes..."
                placeholderTextColor={colors.textSecondary}
                value={nuevoTipo}
                onChangeText={setNuevoTipo}
                editable={!savingProblema}
              />
            </View>

            <View style={{ width: '100%', marginTop: 12 }}>
              <Text style={[styles.labelInput, { color: colors.title }]}>Descripción</Text>
              <TextInput
                style={[styles.inputField, { color: colors.textPrimary, borderColor: colors.border, height: 100, textAlignVertical: 'top' }]}
                placeholder="Descripción del problema"
                placeholderTextColor={colors.textSecondary}
                value={nuevaDescripcion}
                onChangeText={setNuevaDescripcion}
                multiline
                editable={!savingProblema}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20, justifyContent: 'flex-end' }}>
              <TouchableOpacity 
                style={[styles.btnModalCancel, savingProblema && styles.btnDisabled]}
                onPress={() => { setShowCrearProblemaModal(false); setCrearError(null); }}
                disabled={savingProblema}
              >
                <Text style={styles.btnModalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btnModalSave, savingProblema && styles.btnDisabled]}
                onPress={async () => {
                  try {
                    setSavingProblema(true);
                    setCrearError(null);
                    if (!nuevoTipo || nuevoTipo.trim() === '') {
                      setCrearError('Ingrese el tipo de problema');
                      setSavingProblema(false);
                      return;
                    }
                    await problemasService.crearProblema({ tipo: nuevoTipo.trim(), descripcion: nuevaDescripcion.trim() });
                    RNAlert.alert('Éxito', 'Problema creado correctamente');
                    setShowCrearProblemaModal(false);
                    setNuevoTipo('');
                    setNuevaDescripcion('');
                  } catch (err: any) {
                    console.error('Error creando problema:', err);
                    setCrearError(err.message || 'Error al crear problema');
                  } finally {
                    setSavingProblema(false);
                  }
                }}
                disabled={savingProblema}
              >
                <Text style={styles.btnModalSaveText}>{savingProblema ? 'Guardando...' : 'Guardar'}</Text>
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
  crearProblemaBtn: {
    backgroundColor: '#12bb1a',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  crearProblemaText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderColor: '#e53935',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    width: '100%',
    marginBottom: 12,
  },
  errorText: {
    color: '#c62828',
    fontSize: 13,
    fontWeight: '500',
  },
  labelInput: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  btnModalCancel: {
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  btnModalCancelText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 13,
  },
  btnModalSave: {
    backgroundColor: '#12bb1a',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  btnModalSaveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});

export default ReportesAdmin;
