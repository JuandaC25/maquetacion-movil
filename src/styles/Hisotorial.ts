import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000000ff',
	},
	scrollView: {
		flex: 1,
		paddingHorizontal: 10,
	},
	tabsContainer: {
		marginTop: 15,
		flexDirection: 'row',
		justifyContent: 'space-around',
		backgroundColor: '#e9ecef',
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
		backgroundColor: 'white',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 1.41,
		elevation: 2,
	},
	tabText: {
		fontSize: 14,
		color: '#495057',
	},
	activeTabText: {
		fontWeight: 'bold',
		color: '#007bff',
	},
	filterContainer: {
		padding: 10,
		backgroundColor: '#fff',
		borderRadius: 8,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	filterLabel: {
		fontSize: 14,
		fontWeight: 'bold',
		marginTop: 5,
		marginBottom: 5,
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
		backgroundColor: '#6c757d',
		marginRight: 8,
		marginBottom: 8,
	},
	activeFilterTypeButton: {
		backgroundColor: '#007bff',
	},
	filterButtonText: {
		color: 'white',
		fontSize: 12,
	},
	dropdownPicker: {
		padding: 10,
		backgroundColor: '#f1f1f1',
		borderRadius: 5,
		borderWidth: 1,
		borderColor: '#ccc',
		marginTop: 5,
	},
	dropdownPickerText: {
		fontSize: 14,
		color: '#333',
	},
	stackContainer: {
		marginBottom: 20,
	},
	card: {
		backgroundColor: '#fff',
		padding: 15,
		borderRadius: 8,
		borderLeftWidth: 5,
		borderLeftColor: '#007bff', 
		shadowColor: '#000',
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
		color: '#333',
	},
	cardText: {
		fontSize: 14,
		marginBottom: 2,
		color: '#555',
	},
	observationText: {
		marginTop: 5,
		fontSize: 13,
		color: '#777',
		fontStyle: 'italic',
	},
	cancelButton: {
		marginTop: 10,
		backgroundColor: '#dc3545',
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
		backgroundColor: '#adb5bd',
	},
	loading: {
		padding: 20,
	},
	errorContainer: {
		padding: 20,
		backgroundColor: '#fff3cd',
		margin: 10,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#ffc107',
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
		color: '#6c757d',
	},
	paginationContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 15,
		backgroundColor: '#fff',
		borderTopWidth: 1,
		borderTopColor: '#eee',
	},
	paginationButton: {
		paddingVertical: 8,
		paddingHorizontal: 15,
		marginHorizontal: 5,
		backgroundColor: '#007bff',
		borderRadius: 5,
	},
	paginationText: {
		color: 'white',
		fontWeight: 'bold',
	},
	pageIndicator: {
		paddingHorizontal: 10,
		backgroundColor: '#e9ecef',
		borderRadius: 5,
		paddingVertical: 8,
	},
	footerContainer: {
		padding: 10,
		backgroundColor: '#343a40',
		alignItems: 'center',
	},
	footerText: {
		color: '#f8f9fa',
		fontSize: 12,
	}
});
