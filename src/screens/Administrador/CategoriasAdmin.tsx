
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import AdminHeader from './AdminHeader/AdminHeader';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { categoriasService, subcategoriasService } from '../../services/Api';

type Categoria = {
  id_cat: number;
  nom_cat: string;
};

type Subcategoria = {
  id_subcat: number;
  nom_subcat: string;
  nom_cat?: string;
};

const CategoriasAdmin = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'categorias' | 'subcategorias'>('categorias');

  useEffect(() => {
    fetchCategorias();
    fetchSubcategorias();
  }, []);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const res = await categoriasService.getAll();
      setCategorias(res.data as Categoria[] || []);
    } catch (e) {
      setCategorias([
        { id_cat: 1, nom_cat: 'Electrónica' },
        { id_cat: 2, nom_cat: 'Muebles' },
        { id_cat: 3, nom_cat: 'Papelería' },
      ]);
    }
    setLoading(false);
  };

  const fetchSubcategorias = async () => {
    try {
      const res = await subcategoriasService.getAll();
      console.log('Respuesta subcategoriasService.getAll:', res.data);
      // Normalizar los datos recibidos del backend para asegurar los campos correctos
      let data: any = res.data || [];
      // Si el backend responde con { data: [...] }
      if (Array.isArray(data)) {
        // Mapear los campos reales del DTO: id, nom_subcateg, nom_cat
        data = data.map((s: any) => ({
          id_subcat: s.id,
          nom_subcat: s.nom_subcateg,
          nom_cat: s.nom_cat,
        }));
      } else if (data.data && Array.isArray(data.data)) {
        data = data.data.map((s: any) => ({
          id_subcat: s.id,
          nom_subcat: s.nom_subcateg,
          nom_cat: s.nom_cat,
        }));
      }
      setSubcategorias(data);
    } catch (e) {
      setSubcategorias([
        { id_subcat: 1, nom_subcat: 'Laptops' },
        { id_subcat: 2, nom_subcat: 'Sillas' },
        { id_subcat: 3, nom_subcat: 'Cuadernos' },
      ]);
    }
  };

  const renderCategorias = () => (
    loading ? (
      <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
    ) : (
      <FlatList
        data={categorias}
        keyExtractor={item => item.id_cat.toString()}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={[styles.cardPresentation, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow, borderColor: colors.primary }]}> 
            <View style={[styles.iconContainer, { backgroundColor: colors.background }]}> 
              <MaterialIcons name="category" size={44} color={colors.primary} />
            </View>
            <View style={styles.infoContainer}>
              <Text style={[styles.catName, { color: colors.primary }]}>{item.nom_cat}</Text>
            </View>
          </View>
        )}
      />
    )
  );

  const renderSubcategorias = () => {
    // Filtrar subcategorías válidas (con id_subcat definido)
    const validSubcats = (subcategorias || []).filter(
      (item) => item && typeof item.id_subcat !== 'undefined' && item.id_subcat !== null
    );
    if (validSubcats.length === 0) {
      return <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 40 }}>No hay subcategorías</Text>;
    }
    return (
      <FlatList
        data={validSubcats}
        keyExtractor={item => String(item.id_subcat)}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <View style={[styles.cardPresentation, { backgroundColor: colors.cardBackground, shadowColor: colors.shadow, borderColor: colors.primary }]}> 
            <View style={[styles.iconContainer, { backgroundColor: colors.background }]}> 
              <MaterialIcons name="category" size={44} color={colors.primary} />
            </View>
            <View style={styles.infoContainer}>
              <Text style={[styles.catName, { color: colors.primary }]}>{item.nom_subcat}</Text>
              {item.nom_cat && (
                <Text style={[styles.catSubLabel, { color: colors.primaryLight }]}>Categoría: {item.nom_cat}</Text>
              )}
            </View>
          </View>
        )}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <AdminHeader title={activeTab === 'categorias' ? 'Categorías' : 'Subcategorías'} navigation={navigation} />
      <View style={{ height: 12 }} />
      {/* Tabs para cambiar entre categorías y subcategorías */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[activeTab === 'categorias' ? styles.activeTab : styles.inactiveTab, { backgroundColor: activeTab === 'categorias' ? colors.primary : colors.cardBackground, shadowColor: colors.shadow }]}
          onPress={() => setActiveTab('categorias')}
        >
          <Text style={[activeTab === 'categorias' ? styles.activeTabText : styles.inactiveTabText, { color: activeTab === 'categorias' ? colors.cardBackground : colors.textPrimary }]}>Categorías</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[activeTab === 'subcategorias' ? styles.activeTab : styles.inactiveTab, { backgroundColor: activeTab === 'subcategorias' ? colors.primary : colors.cardBackground, shadowColor: colors.shadow }]}
          onPress={() => setActiveTab('subcategorias')}
        >
          <Text style={[activeTab === 'subcategorias' ? styles.activeTabText : styles.inactiveTabText, { color: activeTab === 'subcategorias' ? colors.cardBackground : colors.textPrimary }]}>Ver las subcategorías</Text>
        </TouchableOpacity>
      </View>
      {activeTab === 'categorias' ? renderCategorias() : renderSubcategorias()}
    </View>
  );
};

const styles = StyleSheet.create({
    catSubLabel: {
      fontSize: 15,
      color: '#09b41a',
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 2,
      letterSpacing: 0.2,
    },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: -10,
    gap: 12,
  },
  activeTab: {
    backgroundColor: '#09b41a',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 8,
    marginRight: 8,
    shadowColor: '#09b41a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  inactiveTab: {
    backgroundColor: '#e6fbe7',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  inactiveTabText: {
    color: '#4b4b4b',
    fontWeight: 'bold',
    fontSize: 18,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 28,
    // color: '#09b41a',
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 22,
    alignSelf: 'center',
    letterSpacing: 1,
  },
  cardPresentation: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'linear-gradient(135deg, #09b41a 0%, #078516 50%, #065f11 100%)',
    borderRadius: 22,
    paddingVertical: 32,
    paddingHorizontal: 18,
    marginHorizontal: 22,
    marginBottom: 24,
    shadowColor: '#09b41a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    // backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 0,
  },
  infoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  catName: {
    fontSize: 22,
    // color: '#09b41a',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

export default CategoriasAdmin;
