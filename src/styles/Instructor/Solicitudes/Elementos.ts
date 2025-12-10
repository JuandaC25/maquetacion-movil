import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    pickerContainer: {
      borderWidth: 2,
      borderColor: '#4caf50',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginBottom: 10,
      backgroundColor: '#fff',
    },
  container: {
    flex: 1,
    backgroundColor: '#000000ff',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#ffffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#4caf50',
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  carouselContainer: {
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },
  carouselImage: {
    width: width - 90,
    height: 280,
    borderRadius: 10,
  },
  descripcionContainer: {
    marginBottom: 20,
  },
  descripcionTextContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4caf50',
    marginBottom: 12,
  },
  descripcionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    textAlign: 'justify',
  },
  especificacionesContainer: {
    marginBottom: 20,
    padding: 0,
  },
  listaContainer: {
    gap: 12,
  },
  listaItem: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: width - 100, // Deja 20px de margen a cada lado
    maxWidth: width,
    minHeight: 800,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 7,
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: '100%',
    minWidth: '100%',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  pickerInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 7, // más delgado
    marginBottom: 10,
    paddingVertical: 1, // menos alto
    paddingHorizontal: 10,
    width: '100%',
    minWidth: '100%',
    backgroundColor: '#fff',
  },
});
