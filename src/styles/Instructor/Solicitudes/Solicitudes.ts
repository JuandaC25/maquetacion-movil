import { StyleSheet } from 'react-native';

export const SolicitudesStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000ff',
    paddingHorizontal: 10, // Añadido para margen lateral adaptable
  },
  
  // Tabs Menu
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2a2a2a',
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
    backgroundColor: '#2a2a2a',
  },
  activeTab: {
    backgroundColor: '#3fbb34',
  },
  tabIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888888',
  },
  activeTabText: {
    color: '#ffffff',
  },
  
  // Content Layout
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

  notification: {
    marginTop: 20,
    marginRight: 1,
    width: 330,
    backgroundColor: '#000',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0cfc78',
    overflow: 'hidden',
  },
  notificationInner: {
    position: 'absolute',
    height: 120,
    width: 150,
    top: 12,
    right: 15,
    backgroundColor: '#000',
    borderRadius: 15,
    padding: 10,
  },
  notititle: {
    color: '#fff',
    paddingTop: 10,
    paddingLeft: 20,
    paddingBottom: 6,
    fontWeight: '500',
    fontSize: 30,
  },
  notibody: {
    marginTop: 2,
    color: '#fff',
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
    backgroundColor: '#000',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0cfc78',
    overflow: 'hidden',
  },
  portatilImage: {
    position: 'absolute',
    height: 120,
    width: 150,
    top: 12,
    right: 15,
    backgroundColor: '#000',
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
    backgroundColor: '#000',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0cfc78',
    overflow: 'hidden',
  },
  escritorioImage: {
    position: 'absolute',
    height: 100,
    width: 240,
    top: 12,
    right: -30,
    backgroundColor: '#000',
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
    backgroundColor: '#000',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0cfc78',
    overflow: 'hidden',
  },
  audioVideoImage: {
    position: 'absolute',
    height: 120,
    width: 120,
    top: 12,
    right: -1,
    backgroundColor: '#000',
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
    backgroundColor: '#000',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0cfc78',
    overflow: 'hidden',
  },
  elementosImage: {
    position: 'absolute',
    height: 120,
    width: 210,
    top: 12,
    right: -16,
    backgroundColor: '#000',
    borderRadius: 15,
    padding: 10,
  },
});