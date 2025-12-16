import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../../context/ThemeContext';

const { width } = Dimensions.get('window');

export const createEquipoMesaStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  carouselContainer: {
    marginTop: -11,
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: colors.cardBackground,
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
    backgroundColor: colors.cardBackground,
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  descripcionText: {
    fontSize: 15,
    color: colors.textSecondary,
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
    color: colors.textSecondary,
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
    borderColor: colors.primary,
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
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  availableDot: {
    fontWeight: 'bold',
    color: colors.primary,
    fontSize: 14,
  },
  listItemDot: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay,
  },
  modalContent: {
    backgroundColor: colors.modalBackground,
    borderRadius: 16,
    padding: 20,
    width: width - 100,
    maxWidth: width,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.textPrimary,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 10,
    padding: 8,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
  },
  modalText: {
    marginBottom: 8,
    color: colors.textPrimary,
  },
});