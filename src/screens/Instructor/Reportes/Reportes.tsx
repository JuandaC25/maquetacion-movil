import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  Alert as RNAlert,
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { createReportesStyles } from '../../../styles/Instructor/Reportes/Reportes';
import HeaderWithDrawer from '../Header/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { problemasService, API_URL } from '../../../services/Api';
import { useTheme } from '../../../context/ThemeContext';
import { Modal } from 'react-native';

interface Problema {
  id: number;
  descr_problem: string;
  tipo_problema?: string; // Añadir tipo_problema
}

// Estado para los detalles de cada problema (descripción e imágenes)
interface ProblemaDetalles {
  descripcion: string;
  imagenes: string[];
}

interface FormData {
  idElemento: string;
  ambiente: string;
  // Se elimina 'observaciones' y 'problemasSeleccionados' del nivel superior
  problemas: Record<number, ProblemaDetalles>; // Usamos un objeto para detalles por ID de problema
}

export default function ReportesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const ReportesStyles = useMemo(() => createReportesStyles(colors), [colors]);
  
  const [problemas, setProblemas] = useState<Problema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagenCargando, setImagenCargando] = useState(false);
  
  // Estado para el modal de detalles
  const [modalVisible, setModalVisible] = useState(false);
  const [problemaSeleccionado, setProblemaSeleccionado] = useState<Problema | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    idElemento: '',
    ambiente: '',
    problemas: {}
  });

  const [imagenes, setImagenes] = useState<string[]>([]);

  // Estados para editar/eliminar problemas
  const [editingProblemaId, setEditingProblemaId] = useState<number | null>(null);
  const [editingProblemaText, setEditingProblemaText] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [deletingProblemaId, setDeletingProblemaId] = useState<number | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Estados para editar/eliminar tipos de problemas
  const [editingTipo, setEditingTipo] = useState<string | null>(null);
  const [editingTipoName, setEditingTipoName] = useState('');
  const [editTipoSubmitting, setEditTipoSubmitting] = useState(false);

  const [deletingTipo, setDeletingTipo] = useState<string | null>(null);
  const [deleteTipoSubmitting, setDeleteTipoSubmitting] = useState(false);

  // Cargar problemas
  useEffect(() => {
    cargarProblemas();
  }, []);

  // Inicializar selectedTipo cuando se cargan los problemas
  useEffect(() => {
    if (problemas && problemas.length > 0) {
      const tipos = Object.keys(
        problemas.reduce((acc, problema) => {
          const tipo = problema.tipo_problema || 'Otros';
          if (!acc[tipo]) acc[tipo] = [];
          acc[tipo].push(problema);
          return acc;
        }, {} as Record<string, Problema[]>)
      );
      setSelectedTipo(prev => prev || tipos[0] || null);
    }
  }, [problemas]);

  const cargarProblemas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await problemasService.getDescripciones();
      const data = response.data;
      setProblemas(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error en cargarProblemas:', err);
      setError('No se pudieron cargar los problemas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProblemaChange = (problema: Problema) => {
    setFormData(prev => {
      const nuevosProblemas = { ...prev.problemas };
      if (nuevosProblemas[problema.id]) {
        delete nuevosProblemas[problema.id]; // Deseleccionar
      } else {
        nuevosProblemas[problema.id] = { descripcion: '', imagenes: [] }; // Seleccionar
      }
      return { ...prev, problemas: nuevosProblemas };
    });
  };

  const handleInputChange = (name: keyof Omit<FormData, 'problemas'>, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAgregarImagen = async () => {
    setImagenCargando(true);
    setError(null);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64 && problemaSeleccionado) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        
        setFormData(prev => {
          const nuevosProblemas = { ...prev.problemas };
          nuevosProblemas[problemaSeleccionado.id].imagenes.push(base64Image);
          return { ...prev, problemas: nuevosProblemas };
        });

        setSuccess('✓ Imagen agregada correctamente');
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch (err: any) {
      setError('No se pudo cargar la imagen: ' + err.message);
    } finally {
      setImagenCargando(false);
    }
  };

  const handleEliminarImagen = (index: number) => {
    if (!problemaSeleccionado) return;

    setFormData(prev => {
      const nuevosProblemas = { ...prev.problemas };
      nuevosProblemas[problemaSeleccionado.id].imagenes.splice(index, 1);
      return { ...prev, problemas: nuevosProblemas };
    });
  };

  const handleGuardarDetalles = () => {
    setModalVisible(false);
    setProblemaSeleccionado(null);
  };

  const handleEditarProblema = async () => {
    if (!editingProblemaId) return;
    setEditSubmitting(true);
    try {
      await problemasService.editarProblema(editingProblemaId, {
        descr_problem: editingProblemaText
      });
      setSuccess('Problema actualizado correctamente');
      setEditingProblemaId(null);
      setEditingProblemaText('');
      await cargarProblemas();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar problema');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleEliminarProblema = async () => {
    if (!deletingProblemaId) return;
    setDeleteSubmitting(true);
    try {
      await problemasService.eliminarProblema(deletingProblemaId);
      setSuccess('Problema eliminado correctamente');
      setDeletingProblemaId(null);
      await cargarProblemas();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar problema');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleEditarTipoProblema = async () => {
    if (!editingTipo) return;
    if (!editingTipoName.trim()) {
      setError('El nombre del tipo no puede estar vacío');
      return;
    }
    setEditTipoSubmitting(true);
    try {
      const problemasDelTipo = problemas.filter(p => (p.tipo_problema || 'Otros') === editingTipo);
      const ids = problemasDelTipo.map(p => p.id);
      
      await problemasService.editarTipoProblema(ids, editingTipoName.trim());
      setSuccess('Tipo de problema actualizado correctamente');
      setEditingTipo(null);
      setEditingTipoName('');
      await cargarProblemas();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar tipo');
    } finally {
      setEditTipoSubmitting(false);
    }
  };

  const handleEliminarTipoProblema = async () => {
    if (!deletingTipo) return;
    setDeleteTipoSubmitting(true);
    try {
      const problemasDelTipo = problemas.filter(p => (p.tipo_problema || 'Otros') === deletingTipo);
      const ids = problemasDelTipo.map(p => p.id);
      
      await problemasService.eliminarTipoProblema(ids);
      setSuccess('Tipo y problemas relacionados eliminados correctamente');
      setDeletingTipo(null);
      await cargarProblemas();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar tipo');
    } finally {
      setDeleteTipoSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    // Validaciones
    if (!formData.idElemento.trim()) {
      setError('El ID del equipo es obligatorio');
      return;
    }
    if (!formData.ambiente.trim()) {
      setError('El ambiente es obligatorio');
      return;
    }
    if (Object.keys(formData.problemas).length === 0) {
      setError('Debe seleccionar al menos un problema');
      return;
    }

    setSubmitting(true);

    try {
      const usuarioStr = await AsyncStorage.getItem('user'); 
      const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
      
      if (!usuario?.id) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      const token = await AsyncStorage.getItem('token');
      const authHeader = token 
        ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`)
        : '';

      // Pre-check: verificar disponibilidad del elemento en backend
      try {
        const elResp = await fetch(`${API_URL}/api/elementos/${formData.idElemento}`, {
          headers: { 'Authorization': authHeader }
        });
        if (!elResp.ok) {
          const txt = await elResp.text().catch(() => 'Error al verificar elemento');
          throw new Error(txt || `Elemento ${formData.idElemento} no encontrado`);
        }
        const elementoJson = await elResp.json().catch(() => null);
        const estadoElem = elementoJson?.estadosoelement ?? elementoJson?.est ?? elementoJson?.estado ?? null;
        if (estadoElem != null && Number(estadoElem) !== 1) {
          const estadoTexto = Number(estadoElem) === 2 ? 'Mantenimiento' : Number(estadoElem) === 0 ? 'Inactivo' : String(estadoElem);
          throw new Error(`El elemento no está disponible: ${estadoTexto}`);
        }
      } catch (err: any) {
        throw new Error('No se pudo verificar disponibilidad del elemento: ' + (err.message || err));
      }

      // 1. Agrupar problemas por tipo
      const problemasSeleccionados = problemas.filter(p => formData.problemas[p.id]);
      const gruposPorTipo = problemasSeleccionados.reduce((grupos, problema) => {
        const tipo = problema.tipo_problema || 'Otros';
        if (!grupos[tipo]) {
          grupos[tipo] = [];
        }
        grupos[tipo].push(problema);
        return grupos;
      }, {} as Record<string, Problema[]>);

      // 2. Crear un ticket por cada tipo de problema
      const promesasTickets = Object.entries(gruposPorTipo).map(async ([tipo, problemasDelTipo]) => {
        
        // 3. Subir imágenes y construir el payload de problemas
        const problemasConDetalles = await Promise.all(
          problemasDelTipo.map(async p => {
            const detalles = formData.problemas[p.id];
            let urlsImagenes: string[] = [];

            if (detalles.imagenes.length > 0) {
              const uploadResponse = await fetch(`${API_URL}/api/tickets/upload-images`, {
                method: 'POST',
                headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
                body: JSON.stringify({ images: detalles.imagenes })
              });
              if (!uploadResponse.ok) throw new Error('Error al subir imágenes');
              const uploadResult = await uploadResponse.json();
              urlsImagenes = uploadResult.urls || [];
            }

            return {
              id: p.id,
              descripcion: detalles.descripcion || '',
              imagenes: urlsImagenes
            };
          })
        );

        // 4. Enviar la petición para crear el ticket
        const payload = {
          id_elem: parseInt(formData.idElemento),
          ambiente: formData.ambiente,
          id_usu: usuario.id,
          fecha_in: new Date().toISOString(),
          id_est_tick: 2,
          problemas: problemasConDetalles
        };

        const response = await fetch(`${API_URL}/api/tickets`, {
          method: 'POST',
          headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error creando ticket para tipo "${tipo}": ${errorText}`);
        }
        return response.json();
      });

      await Promise.all(promesasTickets);

      const totalTickets = Object.keys(gruposPorTipo).length;
      const nombresTipos = Object.keys(gruposPorTipo).join(', ');
      setSuccess(`✓ Reporte exitoso! Se crearon ${totalTickets} ticket(s) para el equipo ID ${formData.idElemento} (Tipos: ${nombresTipos})`);
      
      // Limpiar formulario
      handleLimpiar();
      RNAlert.alert('Éxito', 'Reporte creado correctamente');

    } catch (err: any) {
      setError('Error al reportar el equipo: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLimpiar = () => {
    setFormData({
      idElemento: '',
      ambiente: '',
      problemas: {}
    });
    setError(null);
    setSuccess(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, paddingTop: StatusBar.currentHeight || 24 }}>
      <HeaderWithDrawer title="Reportes" navigation={navigation} />

      <ScrollView style={ReportesStyles.formContainer}>
        {/* Mensajes de error/éxito */}
        {error && (
          <View style={ReportesStyles.alertDanger}>
            <Text style={ReportesStyles.alertText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <Text style={ReportesStyles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {success && (
          <View style={ReportesStyles.alertSuccess}>
            <Text style={ReportesStyles.alertText}>{success}</Text>
            <TouchableOpacity onPress={() => setSuccess(null)}>
              <Text style={ReportesStyles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ID del Equipo */}
        <View style={ReportesStyles.formGroup}>
          <Text style={ReportesStyles.label}>Identificador del equipo*</Text>
          <TextInput
            style={ReportesStyles.input}
            placeholder="Ingrese el ID del equipo"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            value={formData.idElemento}
            onChangeText={(text) => handleInputChange('idElemento', text)}
          />
        </View>

        {/* Ambiente */}
        <View style={ReportesStyles.formGroup}>
          <Text style={ReportesStyles.label}>Ambiente/Ubicación *</Text>
          <TextInput
            style={ReportesStyles.input}
            placeholder="Ej: Ambiente 301"
            placeholderTextColor={colors.textTertiary}
            value={formData.ambiente}
            onChangeText={(text) => handleInputChange('ambiente', text)}
          />
        </View>

        {/* Problemas agrupados por tipo */}
        <View style={ReportesStyles.formGroup}>
          <Text style={ReportesStyles.label}>Seleccione los problemas *</Text>
          {loading ? (
            <View style={ReportesStyles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={ReportesStyles.loadingText}>Cargando problemas...</Text>
            </View>
          ) : (
            <View style={{ flex: 1, flexDirection: 'row', gap: 12 }}>
              {/* Columna izquierda: Tipos de problemas */}
              <View style={{ width: 140, paddingRight: 12 }}>
                {Object.entries(
                  problemas.reduce((acc, problema) => {
                    const tipo = problema.tipo_problema || 'Otros';
                    if (!acc[tipo]) acc[tipo] = [];
                    acc[tipo].push(problema);
                    return acc;
                  }, {} as Record<string, Problema[]>)
                ).map(([tipo, lista]) => (
                  <View
                    key={tipo}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      marginBottom: 6,
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        ReportesStyles.tipoItem,
                        selectedTipo === tipo && ReportesStyles.tipoItemActive,
                        { flex: 1 }
                      ]}
                      onPress={() => setSelectedTipo(tipo)}
                    >
                      <Text style={[
                        ReportesStyles.tipoItemText,
                        selectedTipo === tipo && ReportesStyles.tipoItemTextActive
                      ]}>
                        {tipo}
                      </Text>
                      <Text style={[
                        ReportesStyles.tipoCount,
                        selectedTipo === tipo && ReportesStyles.tipoCountActive
                      ]}>
                        ({lista.length})
                      </Text>
                    </TouchableOpacity>
                    
                    {/* Botones de editar y eliminar tipo */}
                    <TouchableOpacity
                      onPress={() => {
                        setEditingTipo(tipo);
                        setEditingTipoName(tipo);
                      }}
                      style={{ padding: 4 }}
                    >
                      <Text style={{ fontSize: 16 }}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setDeletingTipo(tipo)}
                      style={{ padding: 4 }}
                    >
                      <Text style={{ fontSize: 16 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Columna derecha: Descripciones */}
              <View style={{ flex: 1 }}>
                {selectedTipo ? (
                  <View style={ReportesStyles.problemasGrid}>
                    {problemas.filter(p => (p.tipo_problema || 'Otros') === selectedTipo).map(problema => {
                      const isSelected = !!formData.problemas[problema.id];
                      return (
                        <View key={problema.id} style={ReportesStyles.problemaItemContainer}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
                            <TouchableOpacity
                              style={[ReportesStyles.problemaItem, { flex: 1 }]}
                              onPress={() => handleProblemaChange(problema)}
                            >
                              <View style={[
                                ReportesStyles.checkbox,
                                isSelected && ReportesStyles.checkboxChecked
                              ]}>
                                {isSelected && (
                                  <Text style={ReportesStyles.checkmark}>✓</Text>
                                )}
                              </View>
                              <Text style={ReportesStyles.problemaText}>{problema.descr_problem}</Text>
                            </TouchableOpacity>
                            
                            {/* Botones de editar y eliminar problema */}
                            <TouchableOpacity
                              onPress={() => {
                                setEditingProblemaId(problema.id);
                                setEditingProblemaText(problema.descr_problem);
                              }}
                              style={{ padding: 4 }}
                            >
                              <Text style={{ fontSize: 14 }}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => setDeletingProblemaId(problema.id)}
                              style={{ padding: 4 }}
                            >
                              <Text style={{ fontSize: 14 }}>🗑️</Text>
                            </TouchableOpacity>
                          </View>
                          
                          {isSelected && (
                            <TouchableOpacity
                              style={ReportesStyles.detailsButton}
                              onPress={() => {
                                setProblemaSeleccionado(problema);
                                setModalVisible(true);
                              }}
                            >
                              <Text style={ReportesStyles.detailsButtonText}>📝 Detalles</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={{ color: colors.textTertiary, textAlign: 'center', marginTop: 20 }}>
                    Selecciona un tipo para ver las descripciones
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Modal para Detalles del Problema */}
        {problemaSeleccionado && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={handleGuardarDetalles}
          >
            <View style={ReportesStyles.modalContainer}>
              <View style={ReportesStyles.modalContent}>
                <Text style={ReportesStyles.modalTitle}>Detalles para "{problemaSeleccionado.descr_problem}"</Text>
                
                {/* Observaciones del problema */}
                <View style={ReportesStyles.formGroup}>
                  <Text style={ReportesStyles.label}>Observaciones (Opcional)</Text>
                  <TextInput
                    style={[ReportesStyles.input, ReportesStyles.textarea]}
                    placeholder="Detalles adicionales del problema..."
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    numberOfLines={4}
                    maxLength={255}
                    value={formData.problemas[problemaSeleccionado.id]?.descripcion || ''}
                    onChangeText={(text) => {
                      setFormData(prev => ({
                        ...prev,
                        problemas: {
                          ...prev.problemas,
                          [problemaSeleccionado.id]: {
                            ...prev.problemas[problemaSeleccionado.id],
                            descripcion: text
                          }
                        }
                      }));
                    }}
                  />
                  <Text style={ReportesStyles.charCount}>
                    {(formData.problemas[problemaSeleccionado.id]?.descripcion || '').length}/255 caracteres
                  </Text>
                </View>

                {/* Imágenes del problema */}
                <View style={ReportesStyles.formGroup}>
                  <View style={ReportesStyles.imageHeader}>
                    <Text style={ReportesStyles.label}>Imágenes (Opcional)</Text>
                    <TouchableOpacity 
                      style={ReportesStyles.addImageButton}
                      onPress={handleAgregarImagen}
                      disabled={imagenCargando}
                    >
                      <Text style={ReportesStyles.addImageText}>
                        {imagenCargando ? 'Procesando...' : '📷 Agregar'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {formData.problemas[problemaSeleccionado.id]?.imagenes.length > 0 && (
                    <ScrollView horizontal style={ReportesStyles.imagePreviewContainer}>
                      {formData.problemas[problemaSeleccionado.id].imagenes.map((img, index) => (
                        <View key={index} style={ReportesStyles.imageCard}>
                          <Image source={{ uri: img }} style={ReportesStyles.imagePreview} />
                          <TouchableOpacity
                            style={ReportesStyles.deleteImageButton}
                            onPress={() => handleEliminarImagen(index)}
                          >
                            <Text style={ReportesStyles.deleteImageText}>Eliminar</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                </View>

                <TouchableOpacity
                  style={[ReportesStyles.button, ReportesStyles.buttonSubmit]}
                  onPress={handleGuardarDetalles}
                >
                  <Text style={ReportesStyles.buttonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* MODAL EDITAR PROBLEMA */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!editingProblemaId}
          onRequestClose={() => setEditingProblemaId(null)}
        >
          <View style={[ReportesStyles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <View style={[ReportesStyles.modalContent, { width: '85%', paddingVertical: 24 }]}>
              <Text style={[ReportesStyles.modalTitle, { marginBottom: 20 }]}>Editar Problema</Text>
              
              <View style={ReportesStyles.formGroup}>
                <Text style={ReportesStyles.label}>Descripción</Text>
                <TextInput
                  style={[ReportesStyles.input, ReportesStyles.textarea]}
                  placeholder="Editar descripción del problema"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={4}
                  maxLength={255}
                  value={editingProblemaText}
                  onChangeText={setEditingProblemaText}
                  editable={!editSubmitting}
                />
                <Text style={ReportesStyles.charCount}>
                  {editingProblemaText.length}/255 caracteres
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end' }}>
                <TouchableOpacity
                  style={[ReportesStyles.button, ReportesStyles.buttonSecondary, editSubmitting && ReportesStyles.buttonDisabled]}
                  onPress={() => setEditingProblemaId(null)}
                  disabled={editSubmitting}
                >
                  <Text style={ReportesStyles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[ReportesStyles.button, ReportesStyles.buttonSubmit, editSubmitting && ReportesStyles.buttonDisabled]}
                  onPress={handleEditarProblema}
                  disabled={editSubmitting}
                >
                  <Text style={ReportesStyles.buttonText}>{editSubmitting ? 'Guardando...' : 'Guardar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL ELIMINAR PROBLEMA */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!deletingProblemaId}
          onRequestClose={() => setDeletingProblemaId(null)}
        >
          <View style={[ReportesStyles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <View style={[ReportesStyles.modalContent, { width: '85%', paddingVertical: 24 }]}>
              <Text style={[ReportesStyles.modalTitle, { marginBottom: 20, color: '#d32f2f' }]}>Eliminar Problema</Text>
              <Text style={{ fontSize: 14, color: colors.textPrimary, marginBottom: 24, textAlign: 'center' }}>
                ¿Deseas eliminar este problema? Esta acción no se puede deshacer.
              </Text>

              <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end' }}>
                <TouchableOpacity
                  style={[ReportesStyles.button, ReportesStyles.buttonSecondary, deleteSubmitting && ReportesStyles.buttonDisabled]}
                  onPress={() => setDeletingProblemaId(null)}
                  disabled={deleteSubmitting}
                >
                  <Text style={ReportesStyles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[ReportesStyles.button, { backgroundColor: '#d32f2f' }, deleteSubmitting && ReportesStyles.buttonDisabled]}
                  onPress={handleEliminarProblema}
                  disabled={deleteSubmitting}
                >
                  <Text style={ReportesStyles.buttonText}>{deleteSubmitting ? 'Eliminando...' : 'Eliminar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL EDITAR TIPO DE PROBLEMA */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!editingTipo}
          onRequestClose={() => setEditingTipo(null)}
        >
          <View style={[ReportesStyles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <View style={[ReportesStyles.modalContent, { width: '85%', paddingVertical: 24 }]}>
              <Text style={[ReportesStyles.modalTitle, { marginBottom: 20 }]}>Editar Tipo de Problema</Text>
              
              <View style={ReportesStyles.formGroup}>
                <Text style={ReportesStyles.label}>Nombre del tipo</Text>
                <TextInput
                  style={[ReportesStyles.input]}
                  placeholder="Nuevo nombre del tipo"
                  placeholderTextColor={colors.textTertiary}
                  maxLength={80}
                  value={editingTipoName}
                  onChangeText={setEditingTipoName}
                  editable={!editTipoSubmitting}
                />
                <Text style={ReportesStyles.charCount}>
                  {editingTipoName.length}/80 caracteres
                </Text>
              </View>

              <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 24 }}>
                Al renombrar este tipo, todos los problemas relacionados cambiarán a este nuevo tipo.
              </Text>

              <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end' }}>
                <TouchableOpacity
                  style={[ReportesStyles.button, ReportesStyles.buttonSecondary, editTipoSubmitting && ReportesStyles.buttonDisabled]}
                  onPress={() => setEditingTipo(null)}
                  disabled={editTipoSubmitting}
                >
                  <Text style={ReportesStyles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[ReportesStyles.button, ReportesStyles.buttonSubmit, editTipoSubmitting && ReportesStyles.buttonDisabled]}
                  onPress={handleEditarTipoProblema}
                  disabled={editTipoSubmitting}
                >
                  <Text style={ReportesStyles.buttonText}>{editTipoSubmitting ? 'Guardando...' : 'Guardar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL ELIMINAR TIPO DE PROBLEMA */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!deletingTipo}
          onRequestClose={() => setDeletingTipo(null)}
        >
          <View style={[ReportesStyles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <View style={[ReportesStyles.modalContent, { width: '85%', paddingVertical: 24 }]}>
              <Text style={[ReportesStyles.modalTitle, { marginBottom: 20, color: '#d32f2f' }]}>Eliminar Tipo de Problema</Text>
              <Text style={{ fontSize: 14, color: colors.textPrimary, marginBottom: 24, textAlign: 'center' }}>
                ¿Deseas eliminar el tipo "{deletingTipo}"? Esto también eliminará todos los problemas relacionados. Esta acción no se puede deshacer.
              </Text>

              <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'flex-end' }}>
                <TouchableOpacity
                  style={[ReportesStyles.button, ReportesStyles.buttonSecondary, deleteTipoSubmitting && ReportesStyles.buttonDisabled]}
                  onPress={() => setDeletingTipo(null)}
                  disabled={deleteTipoSubmitting}
                >
                  <Text style={ReportesStyles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[ReportesStyles.button, { backgroundColor: '#d32f2f' }, deleteTipoSubmitting && ReportesStyles.buttonDisabled]}
                  onPress={handleEliminarTipoProblema}
                  disabled={deleteTipoSubmitting}
                >
                  <Text style={ReportesStyles.buttonText}>{deleteTipoSubmitting ? 'Eliminando...' : 'Eliminar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Botones */}
        <View style={ReportesStyles.buttonContainer}>
          <TouchableOpacity
            style={[ReportesStyles.button, ReportesStyles.buttonSubmit, submitting && ReportesStyles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <ActivityIndicator size="small" color="#fff" style={ReportesStyles.spinner} />
                <Text style={ReportesStyles.buttonText}>Reportando...</Text>
              </>
            ) : (
              <Text style={ReportesStyles.buttonText}>🚨 Reportar Equipo</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[ReportesStyles.button, ReportesStyles.buttonSecondary]}
            onPress={handleLimpiar}
            disabled={submitting}
          >
            <Text style={ReportesStyles.buttonText}>🔄 Limpiar Formulario</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
