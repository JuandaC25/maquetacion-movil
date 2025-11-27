import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, ImageBackground } from 'react-native';
import { SolicitudesStyles } from '../../../styles/Solicitudes/Solicitudes';
import { HeaderStyles } from '../../../styles/Header';

export default function SolicitudesScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>

      <View style={HeaderStyles.header}>
        <Text style={HeaderStyles.headerTitle}>Solicitudes</Text>
        <TouchableOpacity 
          style={HeaderStyles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={HeaderStyles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Modal del menú desplegable */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={HeaderStyles.modalOverlay}>
          <View style={HeaderStyles.menuContainer}>
            <Text style={HeaderStyles.menuTitle}>Menú</Text>
            
            <TouchableOpacity style={HeaderStyles.menuItem}>
              <Text style={HeaderStyles.menuItemText}>Solicitudes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={HeaderStyles.menuItem}>
              <Text style={HeaderStyles.menuItemText}>Reporte de equipos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={HeaderStyles.menuItem}>
              <Text style={HeaderStyles.menuItemText}>Historial</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[HeaderStyles.menuItem, HeaderStyles.closeButton]}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={HeaderStyles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Contenido principal con scroll */}
      <ScrollView style={styles.content}>
        <View style={SolicitudesStyles.notification}>
          <ImageBackground 
            source={require('../../../../public/Imagenes_solicitudes/Portatil.png')}
            style={SolicitudesStyles.notificationInner}
            imageStyle={{ borderRadius: 15 }}
            resizeMode="cover"
          >
              <Text style={SolicitudesStyles.notititle}>Portátiles</Text>
              <Text style={SolicitudesStyles.notibody}>Escoge los portátiles que necesites</Text>
          </ImageBackground>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 10,
  },
});