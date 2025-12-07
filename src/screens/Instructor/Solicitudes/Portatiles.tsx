
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
import { styles } from '../../../styles/Instructor/Solicitudes/Portatiles';

const { width } = Dimensions.get('window');

const PORTATILES_IMAGES = [
  require('../../../../public/imagenes_port/portatil1.png'),
  require('../../../../public/imagenes_port/portatil2.png'),
  require('../../../../public/imagenes_port/portatil3.png'),
  require('../../../../public/imagenes_port/portatil4.png'),
  require('../../../../public/imagenes_port/portatil5.png'),
  require('../../../../public/imagenes_port/portatil6.png'),
];

export default function Portatiles({ navigation }: any) {
  const [categoriaFiltro, setCategoriaFiltro] = useState('computo');
  const [equiposDisponibles, setEquiposDisponibles] = useState(0);
  const [portatilInfo, setPortatilInfo] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadElementos();
  }, [categoriaFiltro]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % PORTATILES_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadElementos = async () => {
    try {
      setIsLoading(true);
      const response = await elementosService.getAll();
      const data = response.data || [];
      // Filtro robusto para computo y multimedia
      let subCatgFiltroNombres;
      if (categoriaFiltro === 'computo') {
        subCatgFiltroNombres = ['portatil', 'portátil'];
      } else {
        subCatgFiltroNombres = ['portatil de edicion', 'portatil de edición', 'multimedia'];
      }
      const filtrados = data.filter((item: any) =>
        item.sub_catg && subCatgFiltroNombres.some(val =>
          item.sub_catg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(val)
        )
      );
      const activos = filtrados.filter((item: any) => item.est === 1);
      setEquiposDisponibles(activos.length);

      if (filtrados.length > 0) {
        const primerElemento = filtrados[0];
        setPortatilInfo({
          nombre: primerElemento.sub_catg || '',
          observacion: primerElemento.obse || '',
          especificaciones: (primerElemento.componen || '')
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0),
        });
      } else {
        setPortatilInfo(null);
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
      <HeaderWithDrawer navigation={navigation} title="Portátiles" />
      <ScrollView style={styles.content}>
        {/* Toggle de categorías */}
        <View style={styles.filterContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                categoriaFiltro === 'computo' && styles.filterButtonActive,
              ]}
              onPress={() => setCategoriaFiltro('computo')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  categoriaFiltro === 'computo' && styles.filterButtonTextActive,
                ]}
              >
                Computo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                categoriaFiltro === 'multimedia' && styles.filterButtonActive,
              ]}
              onPress={() => setCategoriaFiltro('multimedia')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  categoriaFiltro === 'multimedia' && styles.filterButtonTextActive,
                ]}
              >
                Multimedia
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {portatilInfo ? (
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.title}>🖥️ {portatilInfo.nombre}</Text>
              <Text style={styles.subtitle}>
                Visualiza aquí los detalles generales de los portátiles disponibles
              </Text>
            </View>

            {/* Badge de disponibles igual que Elementos */}
            <View style={styles.counterContainer}>
              <Text style={styles.counterText}>
                <Text style={{fontWeight: 'bold', color: '#4caf50', fontSize: 14}}>● </Text>
                {equiposDisponibles} disponibles
              </Text>
            </View>

            {/* Carrusel de imágenes */}
            <View style={styles.carouselContainer}>
              <Image
                source={PORTATILES_IMAGES[currentImageIndex]}
                style={styles.carouselImage}
                resizeMode="contain"
              />
            </View>

            {/* Descripción */}
            <View style={styles.descripcionContainer}>
              <Text style={styles.sectionTitle}>📋 Descripción general</Text>
              <View style={styles.descripcionTextContainer}>
                <Text style={styles.descripcionText}>
                  {portatilInfo.observacion || 'Sin observaciones disponibles.'}
                </Text>
              </View>
            </View>

            {/* Especificaciones */}
            <View style={styles.especificacionesContainer}>
              <Text style={styles.sectionTitle}>  Componentes principales</Text>
              <View style={styles.listaContainer}>
                {portatilInfo.especificaciones.map((esp: string, i: number) => (
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
