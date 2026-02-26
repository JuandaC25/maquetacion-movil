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

  const [formData, setFormData] = useState<FormData>({
    idElemento: '',
    ambiente: '',
    problemas: {}
  });

  const [imagenes, setImagenes] = useState<string[]>([]);

  // Cargar problemas
  useEffect(() => {
    cargarProblemas();
  }, []);

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

        {/* Problemas */}
        <View style={ReportesStyles.formGroup}>
          <Text style={ReportesStyles.label}>Seleccione los problemas *</Text>
          {loading ? (
            <View style={ReportesStyles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={ReportesStyles.loadingText}>Cargando problemas...</Text>
            </View>
          ) : (
            <View style={ReportesStyles.problemasGrid}>
              {problemas.map(problema => {
                const isSelected = !!formData.problemas[problema.id];
                return (
                  <View key={problema.id} style={ReportesStyles.problemaItemContainer}>
                    <TouchableOpacity
                      style={ReportesStyles.problemaItem}
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
