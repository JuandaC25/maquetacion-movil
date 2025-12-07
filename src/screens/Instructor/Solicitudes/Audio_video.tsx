import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { elementosService } from '../../../services/Api';
import HeaderWithDrawer from '../Header/Header';
import { styles } from '../../../styles/Instructor/Solicitudes/AudioVideo';

const { width } = Dimensions.get('window');

const AUDIO_VIDEO_IMAGES = [
  require('../../../../public/Audiovideo/Audifonos.png'),
  require('../../../../public/Audiovideo/Camara.png'),
  require('../../../../public/Audiovideo/Reflector.png'),
  require('../../../../public/Audiovideo/tabletaGrafica.png'),
  require('../../../../public/Audiovideo/Trajedecroma.png'),
];

export default function Audio_video({ navigation }: any) {
  const [equiposDisponibles, setEquiposDisponibles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadElementos();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % AUDIO_VIDEO_IMAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const loadElementos = async () => {
    try {
      setIsLoading(true);
      const response = await elementosService.getAll();
      const data = response.data || [];
      
      const subcategoriasExcluir = ['Equipo de edicion', 'Portátil de edicion'];
      const multimediaItems = data.filter(
        (item: any) =>
          item.tip_catg &&
          item.tip_catg.toLowerCase().trim() === 'multimedia' &&
          (!item.sub_catg || !subcategoriasExcluir.includes(item.sub_catg))
      );
      
      const activos = multimediaItems.filter((item: any) => item.est === 1);
      setEquiposDisponibles(activos.length);
    } catch (error) {
      console.error('Error al cargar elementos:', error);
      Alert.alert('Error', 'No se pudieron cargar los elementos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithDrawer navigation={navigation} title="Audio y Video" />
      
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.title}>🎬 Audio/Video</Text>
            <Text style={styles.subtitle}>
              Visualiza aquí los detalles generales de los elementos de audio/video disponibles
            </Text>
          </View>

          {/* Carrusel de imágenes */}
          <View style={styles.carouselContainer}>
            <Image
              source={AUDIO_VIDEO_IMAGES[currentImageIndex]}
              style={styles.carouselImage}
              resizeMode="contain"
            />
          </View>

          {/* Descripción */}
          <View style={styles.descripcionContainer}>
            <Text style={styles.sectionTitle}>📹 Zona de Producción Audiovisual</Text>
            <View style={styles.descripcionTextContainer}>
              <Text style={styles.descripcionText}>
                En este apartado encontrarás los accesorios y elementos esenciales para la creación
                de proyectos o trabajos de multimedia dentro del Centro. Equipos como micrófonos,
                pantallas verdes, audífonos, iluminación entre otros están disponibles para
                actividades de grabación, ensayo, diseño de escenas y producción audiovisual
                en general.
              </Text>
            </View>
          </View>

          {/* Especificaciones */}
          <View style={styles.especificacionesContainer}>
            <Text style={styles.sectionTitle}> ¿Qué encontrarás en esta categoría?</Text>
            <View style={styles.listaContainer}>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Equipos para captura de audio</Text>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Herramientas para composición visual y chromas</Text>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Accesorios de ambientación multimedia</Text>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Elementos para monitorización y control de sonido</Text>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Recursos para actividades de grabación y producción</Text>
            </View>
          </View>

          {/* Botón de solicitud */}
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Realizar solicitud</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
