import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { SolicitudesStyles } from '../../../styles/Instructor/Solicitudes/Solicitudes';
import HeaderWithDrawer from '../Header/Header';

export default function SolicitudesScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <HeaderWithDrawer title="Solicitudes" navigation={navigation} />

      {/* Contenido principal con scroll */}
      <ScrollView style={styles.content}>
        {/* Portátiles */}
        <View style={SolicitudesStyles.portatilContainer}>
          <View style={styles.textContainer}>
            <Text style={SolicitudesStyles.notititle}>Portátiles</Text>
            <Text style={[SolicitudesStyles.notibody, { lineHeight: 19 }]}>
              Escoge los portátiles{'\n'}que necesites
            </Text>
          </View>
          <ImageBackground 
            source={require('../../../../public/Imagenes_solicitudes/Portatil.png')}
            style={SolicitudesStyles.portatilImage}
            imageStyle={{ borderRadius: 15 }}
            resizeMode="cover"
          />
        </View>

        {/* Equipos de Escritorio */}
        <View style={SolicitudesStyles.escritorioContainer}>
          <View style={styles.textContainer}>
            <Text style={SolicitudesStyles.notititle}>Escritorio</Text>
            <Text style={[SolicitudesStyles.notibody, { lineHeight: 19 }]}>
              Escoge los equipos{'\n'}de escritorio
            </Text>
          </View>
          <ImageBackground 
            source={require('../../../../public/Imagenes_solicitudes/escritorio.png')}
            style={SolicitudesStyles.escritorioImage}
            imageStyle={{ borderRadius: 15 }}
            resizeMode="cover"
          />
        </View>

        {/* Audio/Video */}
        <View style={SolicitudesStyles.audioVideoContainer}>
          <View style={styles.textContainer}>
            <Text style={SolicitudesStyles.notititle}>Audio/Video</Text>
            <Text style={[SolicitudesStyles.notibody, { lineHeight: 19 }]}>
              Escoge equipos{'\n'}de audio/video
            </Text>
          </View>
          <ImageBackground 
            source={require('../../../../public/Imagenes_solicitudes/Audio_video.png')}
            style={SolicitudesStyles.audioVideoImage}
            imageStyle={{ borderRadius: 15 }}
            resizeMode="cover"
          />
        </View>

        {/* Elementos */}
        <View style={SolicitudesStyles.elementosContainer}>
          <View style={styles.textContainer}>
            <Text style={SolicitudesStyles.notititle}>Elementos</Text>
            <Text style={[SolicitudesStyles.notibody, { lineHeight: 19 }]}>
              Escoge los{'\n'}elementos
            </Text>
          </View>
          <ImageBackground 
            source={require('../../../../public/Imagenes_solicitudes/Elementos.png')}
            style={SolicitudesStyles.elementosImage}
            imageStyle={{ borderRadius: 15 }}
            resizeMode="cover"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000ff',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  textContainer: {
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex: 1, 
  },
});