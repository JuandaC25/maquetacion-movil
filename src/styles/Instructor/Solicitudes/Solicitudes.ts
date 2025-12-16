import { StyleSheet } from 'react-native';
import { Colors } from '../../../context/ThemeContext';

export const createSolicitudesStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Tabs Menu
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.inputBackground,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  activeTabText: {
    color: '#ffffff',
  },
  
  // Content Layout
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  textContainer: {
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex: 1, 
  },

  notification: {
    marginTop: 20,
    marginRight: 1,
    width: 330,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    overflow: 'hidden',
  },
  notificationInner: {
    position: 'absolute',
    height: 120,
    width: 150,
    top: 12,
    right: 15,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 10,
  },
  notititle: {
    color: colors.textPrimary,
    paddingTop: 10,
    paddingLeft: 20,
    paddingBottom: 6,
    fontWeight: '500',
    fontSize: 30,
  },
  notibody: {
    marginTop: 2,
    color: colors.textPrimary,
    paddingLeft: 20,
    fontSize: 14,
  },

  // Portatil
  portatilContainer: {
    marginTop: 15,
    marginRight: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    height: 128,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    overflow: 'hidden',
  },
  portatilImage: {
    position: 'absolute',
    height: 120,
    width: 150,
    top: 12,
    right: 15,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 10,
  },

  // Equipos de Escritorio
  escritorioContainer: {
    marginTop: 20,
    marginRight: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    height: 128,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    overflow: 'hidden',
  },
  escritorioImage: {
    position: 'absolute',
    height: 100,
    width: 240,
    top: 12,
    right: -30,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
  },

  // Audio/Video
  audioVideoContainer: {
    marginTop: 20,
    marginRight: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    height: 128,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    overflow: 'hidden',
  },
  audioVideoImage: {
    position: 'absolute',
    height: 120,
    width: 120,
    top: 12,
    right: -1,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 10,
  },

  // Elementos
  elementosContainer: {
    marginTop: 20,
    marginRight: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    height: 128,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    overflow: 'hidden',
  },
  elementosImage: {
    position: 'absolute',
    height: 120,
    width: 210,
    top: 12,
    right: -16,
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 10,
  },
});