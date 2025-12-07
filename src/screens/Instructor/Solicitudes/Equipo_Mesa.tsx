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
import { styles } from '../../../styles/Instructor/Solicitudes/EquipoMesa';

const { width } = Dimensions.get('window');

const ESCRITORIO_IMAGES = [
  require('../../../../public/imagenes_escritorio/Escritorio1.png'),
  require('../../../../public/imagenes_escritorio/Escritorio2.png'),
  require('../../../../public/imagenes_escritorio/Escritorio3.png'),
];

export default function Equipo_Mesa({ navigation }: any) {
  const [subcatInfo, setSubcatInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriaFiltro, setCategoriaFiltro] = useState('computo');
  const [equiposDisponibles, setEquiposDisponibles] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadElementos();
  }, [categoriaFiltro]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % ESCRITORIO_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadElementos = async () => {
    try {
      setIsLoading(true);
      const response = await elementosService.getAll();
      const data = response.data || [];
      
      const subCatgFiltroNombre = categoriaFiltro === 'computo' ? 'Equipo de mesa' : 'Equipo de edicion';
      
      const filtrados = data.filter((item: any) => item.sub_catg === subCatgFiltroNombre);
      const activos = filtrados.filter((item: any) => item.est === 1);
      setEquiposDisponibles(activos.length);

      if (filtrados.length > 0) {
        const primerElemento = filtrados[0];
        setSubcatInfo({
          nombre: subCatgFiltroNombre,
          observacion: primerElemento.obse || '',
          especificaciones: (primerElemento.componen || '')
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0),
        });
      } else {
        setSubcatInfo(null);
      }
    } catch (error) {
      console.error('Error al cargar elementos:', error);
      Alert.alert('Error', 'No se pudieron cargar los elementos');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithDrawer navigation={navigation} title="Equipos de Escritorio" />
      
      <ScrollView style={styles.content}>
        {/* Toggle de categorías */}
        <View style={styles.toggleContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                categoriaFiltro === 'computo' && styles.toggleButtonActive,
              ]}
              onPress={() => setCategoriaFiltro('computo')}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  categoriaFiltro === 'computo' && styles.toggleButtonTextActive,
                ]}
              >
                Cómputo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                categoriaFiltro === 'multimedia' && styles.toggleButtonActive,
              ]}
              onPress={() => setCategoriaFiltro('multimedia')}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  categoriaFiltro === 'multimedia' && styles.toggleButtonTextActive,
                ]}
              >
                Multimedia
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {subcatInfo ? (
          <View style={styles.card}>

            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.title}>💻 {subcatInfo.nombre}</Text>
              <Text style={styles.subtitle}>
                Visualiza aquí los detalles generales de los equipos disponibles
              </Text>
            </View>

            {/* Contador de equipos - Badge debajo del header */}
            <View style={styles.counterContainer}>
              <Text style={styles.counterText}>
                <Text style={{fontWeight: 'bold', color: '#4caf50', fontSize: 14}}>● </Text>
                {equiposDisponibles} disponibles
              </Text>
            </View>

            {/* Carrusel de imágenes */}
            <View style={styles.carouselContainer}>
              <Image
                source={ESCRITORIO_IMAGES[currentImageIndex]}
                style={styles.carouselImage}
                resizeMode="contain"
              />
            </View>

            {/* Descripción */}
            <View style={styles.descripcionContainer}>
              <Text style={styles.sectionTitle}>📋 Descripción general</Text>
              <View style={styles.descripcionTextContainer}>
                <Text style={styles.descripcionText}>
                  {subcatInfo.observacion || 'Sin observaciones disponibles.'}
                </Text>
              </View>
            </View>

            {/* Especificaciones */}
            <View style={styles.especificacionesContainer}>
              <Text style={styles.sectionTitle}>  Componentes principales</Text>
              <View style={styles.listaContainer}>
                {subcatInfo.especificaciones.map((esp: string, i: number) => (
                  <Text key={i} style={styles.listaItem}>
                    <Text style={{color: '#4caf50', fontSize: 22, fontWeight: 'bold'}}>• </Text>
                    {esp}
                  </Text>
                ))}
              </View>
            </View>

            {/* Botón de solicitud */}
            <TouchableOpacity 
              style={[styles.submitButton, equiposDisponibles === 0 && styles.submitButtonDisabled]}
              disabled={equiposDisponibles === 0}
            >
              <Text style={styles.submitButtonText}>Realizar solicitud</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.noDataText}>
              {isLoading ? 'Cargando información...' : 'No hay datos disponibles.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
