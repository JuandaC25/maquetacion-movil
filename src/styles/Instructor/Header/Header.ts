import { StyleSheet } from 'react-native';
import { Colors } from '../../../context/ThemeContext';

export const createHeaderStyles = (colors: Colors) => StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    height: 60,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 5,
    marginLeft: 'auto',
    marginRight: 'auto',
    color: '#fff',
  },
  menuButton: {
    marginTop: 5,
  },
  menuIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    zIndex: 999,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: colors.cardBackground,
    zIndex: 1000,
    elevation: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  drawerHeader: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 50,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.inputBackground,
  },
  closeButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    marginTop: 20,
    borderBottomWidth: 0,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gestureArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    zIndex: 100,
  },
});

// Estilos estáticos que no dependen del tema
export const staticStyles = StyleSheet.create({
  profileIcon: {
    marginLeft: 18,
    backgroundColor: '#4caf50',
    borderRadius: 20,
    padding: 2,
  },
});