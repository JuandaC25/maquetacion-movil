
import { StyleSheet } from 'react-native';

export const SolicitudesStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notification: {
    marginRight: 1,
    width: 330,
    height: 128,
    backgroundColor: '#0cfc78ff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  notificationInner: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 3,
    bottom: 2,
    backgroundColor: '#18181b',
    borderRadius: 15,
    padding: 10,
  },
 
  notititle: {
    color: '#ffffffff',
    paddingTop: 20,
    paddingLeft: 20,
    paddingBottom: 6,
    fontWeight: '500',
    fontSize: 30,
  },
  notibody: {
    marginTop: 2,
    color: '#ffffffff',
    paddingLeft: 20,
    fontSize: 14,
  },
});