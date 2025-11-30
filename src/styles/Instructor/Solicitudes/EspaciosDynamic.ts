import { Dimensions } from 'react-native';
import { Colors } from '../../../context/ThemeContext';

const { width } = Dimensions.get('window');

export const getEspaciosStyles = (colors: Colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.textPrimary,
  },
  errorContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: colors.error,
    borderRadius: 10,
  },
  errorText: {
    color: '#ffffff',
    textAlign: 'center' as const,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textTertiary,
    textAlign: 'center' as const,
  },
  // Card de espacio
  espacioCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: colors.border,
  },
  carouselContainer: {
    height: 220,
    width: '100%',
  },
  carouselImage: {
    width: width - 30,
    height: 220,
    resizeMode: 'cover' as const,
  },
  paginationContainer: {
    paddingVertical: 8,
  },
  dotStyle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  inactiveDotStyle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.disabled,
  },
  cardContent: {
    padding: 15,
  },
  espacioNombre: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.primary,
    marginBottom: 8,
  },
  espacioDescripcion: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 15,
  },
  reservarButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center' as const,
    marginTop: 5,
  },
  reservarButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  modalContent: {
    backgroundColor: colors.modalBackground,
    borderRadius: 20,
    padding: 25,
    width: width - 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.primary,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.textTertiary,
  },
  formLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: '600' as const,
  },
  formRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 15,
  },
  formHalfInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  formGroup: {
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center' as const,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});
