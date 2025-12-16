import { StyleSheet } from 'react-native';
import { Colors } from '../../../../context/ThemeContext';

export const createReportesStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
    textAlign: 'right',
  },
  alertDanger: {
    backgroundColor: colors.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertSuccess: {
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertText: {
    color: '#fff',
    flex: 1,
  },
  closeButton: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: colors.textPrimary,
    marginLeft: 10,
  },
  problemasGrid: {
    // gap no soportado en todas las versiones de RN
  },
  problemaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  problemaText: {
    color: colors.textPrimary,
    fontSize: 14,
    flex: 1,
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addImageButton: {
    backgroundColor: colors.buttonCancel,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addImageText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  imagePreviewContainer: {
    marginBottom: 12,
  },
  imageCard: {
    marginRight: 12,
    width: 150,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  deleteImageButton: {
    backgroundColor: colors.error,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  imageCount: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonSubmit: {
    backgroundColor: colors.error,
  },
  buttonSecondary: {
    backgroundColor: colors.buttonCancel,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  spinner: {
    marginRight: 8,
  },
});