
import { StyleSheet } from 'react-native';

export const SolicitudesStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notification: {
    width: 288,
    height: 128,
    backgroundColor: '#29292c',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  notificationInner: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    backgroundColor: '#18181b',
    borderRadius: 15,
    padding: 10,
  },
  leftAccent: {
    position: 'absolute',
    left: 8,
    top: 10,
    bottom: 10,
    width: 4,
    backgroundColor: '#32a6ff',
    borderRadius: 2,
  },
  notititle: {
    color: '#32a6ff',
    paddingTop: 10,
    paddingLeft: 20,
    paddingBottom: 6,
    fontWeight: '500',
    fontSize: 18,
  },
  notibody: {
    color: '#99999d',
    paddingLeft: 20,
    fontSize: 14,
  },
});