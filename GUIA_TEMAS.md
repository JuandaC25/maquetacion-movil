# 🎨 Guía de Implementación de Temas

## ✅ Lo que ya está hecho:

1. **ThemeContext** creado en `src/context/ThemeContext.tsx`
   - Maneja temas 'dark' y 'light'
   - Guarda la preferencia en AsyncStorage
   - Provee colores dinámicos

2. **ThemeProvider** envuelve toda la app en `App.tsx`

3. **Toggle de tema** en el menú lateral del Header
   - Switch con emoji 🌙 (oscuro) / ☀️ (claro)
   - Cambia instantáneamente

4. **Archivo de ejemplo** `EspaciosDynamic.ts` muestra cómo hacer estilos dinámicos

---

## 🚀 Cómo usar el tema en tus componentes:

### Opción 1: Estilos Dinámicos (Recomendado)

**Paso 1:** Convierte tu archivo de estilos de StyleSheet a función

```typescript
// Antes (Espacios.ts)
import { StyleSheet } from 'react-native';

export const EspaciosStyles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',  // ❌ Color fijo
  }
});

// Después (EspaciosDynamic.ts)
import { Colors } from '../../../context/ThemeContext';

export const getEspaciosStyles = (colors: Colors) => ({
  container: {
    backgroundColor: colors.background,  // ✅ Color dinámico
  }
});
```

**Paso 2:** Usa el hook en tu componente

```typescript
// En Espacios.tsx
import { useTheme } from '../../../context/ThemeContext';
import { getEspaciosStyles } from '../../../styles/Instructor/Solicitudes/EspaciosDynamic';

export default function EspaciosScreen({ navigation }: any) {
  const { colors } = useTheme();
  const styles = getEspaciosStyles(colors);  // ✅ Estilos dinámicos
  
  return (
    <View style={styles.container}>
      {/* ... */}
    </View>
  );
}
```

---

### Opción 2: Solo colores específicos

Si no quieres cambiar todos los estilos, solo usa colores específicos:

```typescript
import { useTheme } from '../../../context/ThemeContext';

export default function MiComponente() {
  const { colors } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.textPrimary }}>Texto adaptable</Text>
    </View>
  );
}
```

---

## 🎨 Paleta de colores disponibles:

```typescript
// Fondos
colors.background         // Fondo principal
colors.cardBackground     // Fondo de tarjetas
colors.modalBackground    // Fondo de modales
colors.inputBackground    // Fondo de inputs

// Textos
colors.textPrimary        // Texto principal
colors.textSecondary      // Texto secundario
colors.textTertiary       // Texto terciario (gris)

// Acentos
colors.primary            // Verde principal (#3fbb34)
colors.primaryLight       // Verde claro
colors.success            // Verde éxito
colors.error              // Rojo error
colors.warning            // Amarillo advertencia

// Bordes
colors.border             // Borde normal
colors.borderLight        // Borde claro
colors.borderDark         // Borde oscuro

// Otros
colors.overlay            // Overlay semi-transparente
colors.shadow             // Color de sombras
colors.disabled           // Elementos deshabilitados
```

---

## 📝 Ejemplo completo con Espacios.tsx:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getEspaciosStyles } from '../../../styles/Instructor/Solicitudes/EspaciosDynamic';
import HeaderWithDrawer from '../Header/Header';

export default function EspaciosScreen({ navigation }: any) {
  const { colors, theme } = useTheme();
  const styles = getEspaciosStyles(colors);
  
  return (
    <View style={styles.container}>
      <HeaderWithDrawer title="Solicitud de Espacios" navigation={navigation} />
      
      <ScrollView style={styles.content}>
        <View style={styles.espacioCard}>
          <Text style={styles.espacioNombre}>Mi Espacio</Text>
          <Text style={styles.espacioDescripcion}>
            Este componente se adapta al tema {theme}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
```

---

## 🔄 Componentes que deberías actualizar:

### Alta prioridad (interfaz visible):
1. ✅ **Header.tsx** - Ya tiene el toggle
2. **Solicitudes.tsx** - Pantalla principal de equipos
3. **Espacios.tsx** - Listado de espacios
4. **Reportes.tsx** - Formulario de reportes
5. **LoginScreen.tsx** - Pantalla de login

### Media prioridad:
6. Todos los archivos en `src/styles/Instructor/Solicitudes/`
7. Estilos del Header si quieres que el drawer cambie de color

---

## ⚡ Tips:

1. **No uses colores hardcodeados** como '#000000', '#ffffff'
   - Usa `colors.background`, `colors.textPrimary`

2. **El verde (#3fbb34) se mantiene en ambos temas**
   - Es tu color de marca, no cambia

3. **Los textos negros/blancos SÍ cambian**
   - Dark: texto blanco sobre fondo negro
   - Light: texto negro sobre fondo blanco

4. **Puedes obtener el tema actual:**
   ```typescript
   const { theme } = useTheme();
   // 'dark' o 'light'
   ```

5. **Puedes cambiar el tema programáticamente:**
   ```typescript
   const { setTheme } = useTheme();
   setTheme('light');  // o 'dark'
   ```

---

## 🧪 Cómo probar:

1. Ejecuta la app: `npm start`
2. Abre el menú lateral (☰)
3. Activa el switch de tema
4. Observa cómo cambian los componentes actualizados
5. Cierra y abre la app - el tema se mantiene guardado

---

## 🎯 Siguiente paso recomendado:

Actualiza **Espacios.tsx** primero como ejemplo:

1. Importa `useTheme` y `getEspaciosStyles`
2. Usa `const styles = getEspaciosStyles(colors)`
3. Cambia `EspaciosStyles` por `styles` en todo el componente
4. Prueba el cambio de tema

¡Listo! 🚀
