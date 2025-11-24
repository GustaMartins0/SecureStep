import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons'; // importação adicionada
import { useNavigation } from '@react-navigation/native'; // importação adicionada
import { supabase } from '../lib/supabase';

export default function HistoricoBotao() {
  const navigation = useNavigation(); // hook de navegação
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchButtons = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('button_history')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(100);
      if (error) console.log('Erro ao carregar historico de botões', error);
      if (mounted && data) {
        setDados(data.map(d => ({ id: d.id, titulo: d.title || 'Evento', hora: d.occurred_at ? new Date(d.occurred_at).toLocaleTimeString() : '' })));
      }
      setLoading(false);
    };
    fetchButtons();
    return () => { mounted = false; };
  }, []);

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#9FE870" />}
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Atividades</Text>
        <View style={{ width: 28 }} /> 
      </View>

      {/* SUBTÍTULO */}
      <View style={styles.subHeader}>
        <Text style={styles.subTitle}>Historico de botão apertados</Text>
        <MaterialIcons name="touch-app" size={24} color="#B2FF59" />
      </View>

      {/* LISTA */}
      <FlatList
        data={dados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text style={styles.hora}>{item.hora}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001A1A', // Fundo escuro
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subTitle: {
    color: '#94A3B8',
    fontSize: 14,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#123',
    borderBottomWidth: 0.5,
  },
  titulo: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  hora: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
