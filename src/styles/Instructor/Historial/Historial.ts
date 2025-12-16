import { StyleSheet } from 'react-native';
import { Colors } from '../../../context/ThemeContext';

export const createHistorialStyles = (colors: Colors) => StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
	},
	scrollView: {
		flex: 1,
		paddingHorizontal: 10,
	},
	tabsContainer: {
		marginTop: 15,
		flexDirection: 'row',
		justifyContent: 'space-around',
		backgroundColor: colors.inputBackground,
		marginBottom: 10,
		padding: 5,
		borderRadius: 5,
		marginHorizontal: 10,
	},
	tabButton: {
		flex: 1,
		paddingVertical: 10,
		alignItems: 'center',
		borderRadius: 5,
	},
	activeTab: {
		backgroundColor: colors.cardBackground,
		shadowColor: colors.shadow,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 1.41,
		elevation: 2,
	},
	tabText: {
		fontSize: 14,
		color: colors.textSecondary,
	},
	activeTabText: {
		fontWeight: 'bold',
		color: colors.primary,
	},
	filterContainer: {
		padding: 10,
		backgroundColor: colors.cardBackground,
		borderRadius: 8,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: colors.border,
	},
	filterLabel: {
		fontSize: 14,
		fontWeight: 'bold',
		marginTop: 5,
		marginBottom: 5,
		color: colors.textPrimary,
	},
	filterButtons: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginVertical: 5,
	},
	filterTypeButton: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 20,
		backgroundColor: colors.buttonCancel,
		marginRight: 8,
		marginBottom: 8,
	},
	activeFilterTypeButton: {
		backgroundColor: colors.primary,
	},
	filterButtonText: {
		color: 'white',
		fontSize: 12,
	},
	dropdownPicker: {
		padding: 10,
		backgroundColor: colors.inputBackground,
		borderRadius: 5,
		borderWidth: 1,
		borderColor: colors.border,
		marginTop: 5,
	},
	dropdownPickerText: {
		fontSize: 14,
		color: colors.textPrimary,
	},
	stackContainer: {
		marginBottom: 20,
	},
	card: {
		backgroundColor: colors.cardBackground,
		padding: 15,
		borderRadius: 8,
		borderLeftWidth: 5,
		borderLeftColor: colors.primary,
		shadowColor: colors.shadow,
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 1.41,
		elevation: 2,
		marginBottom: 10,
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 5,
	},
	cardEmoji: {
		fontSize: 20,
	},
	badge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 15,
	},
	badgeText: {
		color: 'white',
		fontSize: 12,
		fontWeight: 'bold',
	},
	cardBody: {
		marginTop: 5,
	},
	cardLabel: {
		fontWeight: 'bold',
		color: colors.textPrimary,
	},
	cardText: {
		fontSize: 14,
		marginBottom: 2,
		color: colors.textSecondary,
	},
	observationText: {
		marginTop: 5,
		fontSize: 13,
		color: colors.textTertiary,
		fontStyle: 'italic',
	},
	cancelButton: {
		marginTop: 10,
		backgroundColor: colors.error,
		padding: 8,
		borderRadius: 5,
		alignItems: 'center',
	},
	cancelButtonText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 14,
	},
	disabledButton: {
		backgroundColor: colors.disabled,
	},
	loading: {
		padding: 20,
	},
	errorContainer: {
		padding: 20,
		backgroundColor: colors.warning,
		margin: 10,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.warning,
	},
	errorTitle: {
		color: '#856404',
		fontWeight: 'bold',
		fontSize: 16,
		marginBottom: 5,
	},
	errorText: {
		color: '#856404',
		textAlign: 'center',
	},
	errorTip: {
		marginTop: 5,
		fontSize: 12,
		color: '#856404',
		fontStyle: 'italic',
	},
	emptyText: {
		padding: 20,
		textAlign: 'center',
		color: colors.textTertiary,
	},
	paginationContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 15,
		backgroundColor: colors.cardBackground,
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
	paginationButton: {
		paddingVertical: 8,
		paddingHorizontal: 15,
		marginHorizontal: 5,
		backgroundColor: colors.primary,
		borderRadius: 5,
	},
	paginationText: {
		color: 'white',
		fontWeight: 'bold',
	},
	pageIndicator: {
		paddingHorizontal: 10,
		backgroundColor: colors.inputBackground,
		borderRadius: 5,
		paddingVertical: 8,
	},
	footerContainer: {
		padding: 10,
		backgroundColor: colors.cardBackground,
		alignItems: 'center',
	},
	footerText: {
		color: colors.textSecondary,
		fontSize: 12,
	},
});
