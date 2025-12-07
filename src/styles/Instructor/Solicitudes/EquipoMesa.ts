import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000ff',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  toggleContainer: {
    marginBottom: 15,
  },
  toggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  toggleButtonActive: {
    backgroundColor: '#4caf50',
    borderColor: '#388e3c',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#388e3c',
  },
  toggleButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
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
    marginTop: -11,
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
  counterContainer: {
     alignSelf: 'flex-end',
     marginTop: -10,
     marginBottom: 10,
     backgroundColor: '#e8f5e9',
     paddingVertical: 4,
     paddingHorizontal: 14,
     borderRadius: 16,
     borderWidth: 1.5,
     borderColor: '#4caf50',
  },
  counterText: {
     fontSize: 13,
     fontWeight: '700',
     color: '#388e3c',
     letterSpacing: 0.5,
     textShadowColor: '#fff',
     textShadowOffset: { width: 0, height: 1 },
     textShadowRadius: 2,
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
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});
