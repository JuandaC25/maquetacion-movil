import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, PanResponder } from 'react-native';
import { HeaderComponentStyles } from '../../../styles/Instructor/Header/Header';

const DRAWER_WIDTH = 280;

interface HeaderWithDrawerProps {
  title: string;
  navigation: any;
}

export default function HeaderWithDrawer({ title, navigation }: HeaderWithDrawerProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: menuVisible ? 0 : -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [menuVisible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (evt.nativeEvent.pageX < 20 && gestureState.dx > 10) {
          return true;
        }
        return false;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx > 0) {
          translateX.setValue(Math.min(0, -DRAWER_WIDTH + gestureState.dx));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > DRAWER_WIDTH / 3) {
          setMenuVisible(true);
        } else {
          setMenuVisible(false);
        }
      },
    })
  ).current;

  return (
    <>
      <View style={HeaderComponentStyles.header}>
        <Text style={HeaderComponentStyles.headerTitle}>{title}</Text>
        <TouchableOpacity 
          style={HeaderComponentStyles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={HeaderComponentStyles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Overlay del drawer */}
      {menuVisible && (
        <TouchableOpacity 
          style={HeaderComponentStyles.drawerOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        />
      )}

      {/* Drawer lateral izquierdo */}
      <Animated.View 
        style={[
          HeaderComponentStyles.drawer,
          {
            transform: [{ translateX }],
          }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={HeaderComponentStyles.drawerHeader}>
          <Text style={HeaderComponentStyles.drawerTitle}>Menú</Text>
        </View>
        
        <TouchableOpacity 
          style={HeaderComponentStyles.menuItem}
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate('Solicitudes');
          }}
        >
          <Text style={HeaderComponentStyles.menuItemText}>Solicitudes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={HeaderComponentStyles.menuItem}
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate('Reportes');
          }}
        >
          <Text style={HeaderComponentStyles.menuItemText}>Reporte de equipos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={HeaderComponentStyles.menuItem}
          onPress={() => setMenuVisible(false)}
        >
          <Text style={HeaderComponentStyles.menuItemText}>Historial</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[HeaderComponentStyles.menuItem, HeaderComponentStyles.closeButton]}
          onPress={() => setMenuVisible(false)}
        >
          <Text style={HeaderComponentStyles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Área de gestos para abrir el drawer */}
      <View 
        style={HeaderComponentStyles.gestureArea}
        {...panResponder.panHandlers}
      />
    </>
  );
}