import React, { useState, useEffect } from 'react';
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
import { ReportesStyles } from '../../../styles/Usuario/Solicitudes/Reportes/Reportes';
import HeaderWithDrawer from '../Header/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

interface Problema {
  id: number;
  descr_problem: string;
}

interface FormData {
  idElemento: string;
  ambiente: string;
  observaciones: string;
  problemasSeleccionados: number[];
}

export default function ReportesScreen({ navigation }: any) {
  const [problemas, setProblemas] = useState<Problema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imagenCargando, setImagenCargando] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    idElemento: '',
    ambiente: '',
    observaciones: '',
    problemasSeleccionados: []
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
      const token = await AsyncStorage.getItem('token'); 
      console.log('Token obtenido:', token ? 'Sí hay token' : 'No hay token');
      console.log('Token value:', token);
      
      const authHeader = token 
        ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`)
        : '';
      
      console.log('Authorization header:', authHeader.substring(0, 30) + '...');
      
      const response = await fetch('http://192.168.1.90:8081/api/problemas/descripcion', {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });

      console.log('Status response problemas:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Problemas recibidos:', data);
      setProblemas(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error en cargarProblemas:', err);
      setError('No se pudieron cargar los problemas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProblemaChange = (problemaId: number) => {
    setFormData(prev => {
      const problemas = prev.problemasSeleccionados.includes(problemaId)
        ? prev.problemasSeleccionados.filter(id => id !== problemaId)
        : [...prev.problemasSeleccionados, problemaId];
      return { ...prev, problemasSeleccionados: problemas };
    });
  };

  const handleInputChange = (name: keyof FormData, value: string) => {
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

      if (!result.canceled && result.assets[0].base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setImagenes(prev => [...prev, base64Image]);
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
    setImagenes(prev => prev.filter((_, i) => i !== index));
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
    if (formData.problemasSeleccionados.length === 0) {
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
       // Subir imágenes si hay
      let imageUrls: string[] = [];
      if (imagenes.length > 0) {
        const token = await AsyncStorage.getItem('token');
        const authHeader = token 
          ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`)
          : '';
        
        const uploadResponse = await fetch('http://192.168.0.7:8081/api/tickets/upload-images', {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ images: imagenes })
        });

        if (!uploadResponse.ok) throw new Error('Error al subir imágenes');
        
        const uploadResult = await uploadResponse.json();
        imageUrls = uploadResult.urls || [];
      }

      // Crear tickets
      const token = await AsyncStorage.getItem('token');
      const authHeader = token 
        ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`)
        : '';
      
      const problemasNombres = problemas
        .filter(p => formData.problemasSeleccionados.includes(p.id))
        .map(p => p.descr_problem);

      await Promise.all(
        formData.problemasSeleccionados.map(async idProblema => {
          const response = await fetch('http://192.168.0.7:8081/api/tickets', {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id_elem: parseInt(formData.idElemento),
              id_problem: idProblema,
              ambient: formData.ambiente,
              obser: formData.observaciones || '',
              imageness: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
              id_usu: usuario.id,
              fecha_in: new Date().toISOString(),
              id_est_tick: 2
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
          }
        })
      );

      setSuccess(`✓ Reporte exitoso! Se crearon ${formData.problemasSeleccionados.length} ticket(s) para el equipo ID ${formData.idElemento}:\n• ${problemasNombres.join('\n• ')}`);
      // Limpiar formulario
      setFormData({
        idElemento: '',
        ambiente: '',
        observaciones: '',
        problemasSeleccionados: []
      });
      setImagenes([]);

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
      observaciones: '',
      problemasSeleccionados: []
    });
    setImagenes([]);
    setError(null);
    setSuccess(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000', paddingTop: StatusBar.currentHeight || 24 }}>
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
          <Text style={ReportesStyles.label}>ID del Equipo *</Text>
          <TextInput
            style={ReportesStyles.input}
            placeholder="Ingrese el ID del equipo"
            placeholderTextColor="#999"
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
            placeholderTextColor="#999"
            value={formData.ambiente}
            onChangeText={(text) => handleInputChange('ambiente', text)}
          />
        </View>

        {/* Problemas */}
        <View style={ReportesStyles.formGroup}>
          <Text style={ReportesStyles.label}>Seleccione los problemas *</Text>
          {loading ? (
            <View style={ReportesStyles.loadingContainer}>
              <ActivityIndicator size="small" color="#3fbb34" />
              <Text style={ReportesStyles.loadingText}>Cargando problemas...</Text>
            </View>
          ) : (
            <View style={ReportesStyles.problemasGrid}>
              {problemas.map(problema => (
                <TouchableOpacity
                  key={problema.id}
                  style={ReportesStyles.problemaItem}
                  onPress={() => handleProblemaChange(problema.id)}
                >
                  <View style={[
                    ReportesStyles.checkbox,
                    formData.problemasSeleccionados.includes(problema.id) && ReportesStyles.checkboxChecked
                  ]}>
                    {formData.problemasSeleccionados.includes(problema.id) && (
                      <Text style={ReportesStyles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={ReportesStyles.problemaText}>{problema.descr_problem}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Observaciones */}
        <View style={ReportesStyles.formGroup}>
          <Text style={ReportesStyles.label}>Observaciones (Opcional)</Text>
          <TextInput
            style={[ReportesStyles.input, ReportesStyles.textarea]}
            placeholder="Detalles adicionales del problema..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            maxLength={255}
            value={formData.observaciones}
            onChangeText={(text) => handleInputChange('observaciones', text)}
          />
          <Text style={ReportesStyles.charCount}>{formData.observaciones.length}/255 caracteres</Text>
        </View>

        {/* Imágenes */}
        <View style={ReportesStyles.formGroup}>
          <View style={ReportesStyles.imageHeader}>
            <Text style={ReportesStyles.label}>Imágenes (Opcional)</Text>
            <TouchableOpacity 
              style={ReportesStyles.addImageButton}
              onPress={handleAgregarImagen}
              disabled={imagenCargando}
            >
              <Text style={ReportesStyles.addImageText}>
                {imagenCargando ? 'Procesando...' : '📷 Agregar Imagen'}
              </Text>
            </TouchableOpacity>
          </View>

          {imagenes.length > 0 && (
            <ScrollView horizontal style={ReportesStyles.imagePreviewContainer}>
              {imagenes.map((img, index) => (
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

          <Text style={ReportesStyles.imageCount}>
            {imagenes.length > 0 
              ? `${imagenes.length} imagen(es) agregada(s)` 
              : 'No hay imágenes agregadas'}
          </Text>
        </View>

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
