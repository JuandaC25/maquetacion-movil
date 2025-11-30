import React, { useState } from 'react';
import { View, Text, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { SolicitudesStyles } from '../../../styles/Instructor/Solicitudes/Solicitudes';
import HeaderWithDrawer from '../Header/Header';
import EspaciosContent from './Espacios';

export default function SolicitudesScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<string>('equipos');

  return (
    <View style={SolicitudesStyles.container}>
      <HeaderWithDrawer title="Solicitudes" navigation={navigation} />

      {/* Menú de Tabs - SIEMPRE VISIBLE */}
      <View style={SolicitudesStyles.tabContainer}>
        <TouchableOpacity 
          style={[SolicitudesStyles.tab, activeTab === 'equipos' && SolicitudesStyles.activeTab]}
          onPress={() => setActiveTab('equipos')}
        >
          <Text style={SolicitudesStyles.tabIcon}>💻</Text>
          <Text style={[SolicitudesStyles.tabText, activeTab === 'equipos' && SolicitudesStyles.activeTabText]}>
            Equipos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[SolicitudesStyles.tab, activeTab === 'espacios' && SolicitudesStyles.activeTab]}
          onPress={() => setActiveTab('espacios')}
        >
          <Text style={SolicitudesStyles.tabIcon}>🏢</Text>
          <Text style={[SolicitudesStyles.tabText, activeTab === 'espacios' && SolicitudesStyles.activeTabText]}>
            Espacios
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido condicional */}
      {activeTab === 'equipos' ? (
        <ScrollView style={SolicitudesStyles.content}>
          {/* Portátiles */}
          <View style={SolicitudesStyles.portatilContainer}>
            <View style={SolicitudesStyles.textContainer}>
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
            <View style={SolicitudesStyles.textContainer}>
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
            <View style={SolicitudesStyles.textContainer}>
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
            <View style={SolicitudesStyles.textContainer}>
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
      ) : (
        <EspaciosContent navigation={navigation} />
      )}
    </View>
  );
}