import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, PanResponder, Switch } from 'react-native';
import { HeaderTecnicoStyles } from '../../../styles/Tecnico/Header/HeaderTecnico';
import { useTheme } from '../../../context/ThemeContext';

const DRAWER_WIDTH = 280;

interface HeaderTecnicoProps {
  title: string;
  navigation: any;
}

export default function HeaderTecnico({ title, navigation }: HeaderTecnicoProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const { theme, toggleTheme, colors } = useTheme();

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
      <View style={HeaderTecnicoStyles.header}>
        <Text style={HeaderTecnicoStyles.headerTitle}>{title}</Text>
        <TouchableOpacity 
          style={HeaderTecnicoStyles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={HeaderTecnicoStyles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Overlay del drawer */}
      {menuVisible && (
        <TouchableOpacity 
          style={HeaderTecnicoStyles.drawerOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        />
      )}

      {/* Drawer lateral izquierdo */}
      <Animated.View 
        style={[
          HeaderTecnicoStyles.drawer,
          {
            transform: [{ translateX }],
          }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={HeaderTecnicoStyles.drawerHeader}>
          <Text style={HeaderTecnicoStyles.drawerTitle}>Menú</Text>
        </View>
        
        <TouchableOpacity 
          style={HeaderTecnicoStyles.menuItem}
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate('SolicitudesTecnico');
          }}
        >
          <Text style={HeaderTecnicoStyles.menuItemText}>Solicitudes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={HeaderTecnicoStyles.menuItem}
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate('Tickets');
          }}
        >
          <Text style={HeaderTecnicoStyles.menuItemText}>Tickets</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={HeaderTecnicoStyles.menuItem}
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate('EspaciosTecnico');
          }}
        >
          <Text style={HeaderTecnicoStyles.menuItemText}>Espacios</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={HeaderTecnicoStyles.menuItem}
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate('Historial');
          }}
        >
          <Text style={HeaderTecnicoStyles.menuItemText}>Historial</Text>
        </TouchableOpacity>
        
        {/* Toggle de Tema */}
        <View style={HeaderTecnicoStyles.themeToggleContainer}>
          <Text style={HeaderTecnicoStyles.menuItemText}>
            {theme === 'dark' ? '🌙 Tema Oscuro' : '☀️ Tema Claro'}
          </Text>
          <Switch
            value={theme === 'light'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#2a2a2a', true: '#3fbb34' }}
            thumbColor={theme === 'light' ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#2a2a2a"
          />
        </View>
      </Animated.View>

      {/* Área de gestos para abrir el drawer */}
      <View 
        style={HeaderTecnicoStyles.gestureArea}
        {...panResponder.panHandlers}
      />
    </>
  );
}