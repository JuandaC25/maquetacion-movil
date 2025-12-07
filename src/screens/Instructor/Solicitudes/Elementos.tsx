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
import { styles } from '../../../styles/Instructor/Solicitudes/Elementos';

const { width } = Dimensions.get('window');

const ELEMENTOS_IMAGES = [
  require('../../../../public/Elementos/CableInternet.png'),
  require('../../../../public/Elementos/destornillador.png'),
  require('../../../../public/Elementos/Mouse.png'),
  require('../../../../public/Elementos/Teclaado.png'),
];

export default function Elementos({ navigation }: any) {
  const [equiposDisponibles, setEquiposDisponibles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadElementos();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % ELEMENTOS_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadElementos = async () => {
    try {
      setIsLoading(true);
      const response = await elementosService.getAll();
      const data = response.data || [];
      
      const subcategoriasExcluir = ['Equipo de edicion', 'Portátil de edicion', 'Equipo de mesa', 'Portátil'];
      const elementosGenerales = data.filter(
        (item: any) =>
          item.tip_catg &&
          item.tip_catg.toLowerCase().trim() !== 'multimedia' &&
          (!item.sub_catg || !subcategoriasExcluir.includes(item.sub_catg))
      );
      
      const activos = elementosGenerales.filter((item: any) => item.est === 1);
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
      <HeaderWithDrawer navigation={navigation} title="Elementos" />
      
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.title}>🔧 Equipos Generales</Text>
            <Text style={styles.subtitle}>
              Visualiza aquí los detalles generales de todos los equipos disponibles
            </Text>
          </View>

          {/* Carrusel de imágenes */}
          <View style={styles.carouselContainer}>
            <Image
              source={ELEMENTOS_IMAGES[currentImageIndex]}
              style={styles.carouselImage}
              resizeMode="contain"
            />
          </View>

          {/* Descripción */}
          <View style={styles.descripcionContainer}>
            <Text style={styles.sectionTitle}>📦 Equipos y Recursos Generales</Text>
            <View style={styles.descripcionTextContainer}>
              <Text style={styles.descripcionText}>
                En este apartado encontrarás todos los elementos y accesorios disponibles del Centro,
                abarcando diferentes categorías y subcategorías. Aquí podrás solicitar elementos de 
                distintas áreas según las necesidades de tu proyecto o actividad académica.
              </Text>
            </View>
          </View>

          {/* Especificaciones */}
          <View style={styles.especificacionesContainer}>
            <Text style={styles.sectionTitle}>  ¿Qué encontrarás en esta categoría?</Text>
            <View style={styles.listaContainer}>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Equipos de diferentes categorías del Centro</Text>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Herramientas para múltiples propósitos académicos</Text>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Accesorios complementarios</Text>
              <Text style={styles.listaItem}><Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>Elementos para desarrollo de proyectos</Text>
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
