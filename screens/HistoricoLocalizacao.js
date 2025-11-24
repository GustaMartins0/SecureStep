import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // importação adicionada

import { supabase } from '../lib/supabase';

export default function HistoricoLocalizacao() {
  const navigation = useNavigation(); // hook de navegação
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('location_history')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(100);
      if (error) {
        console.log('Erro ao buscar histórico de localização:', error);
      } else if (mounted) {
        setDados(
          data.map((d) => ({
            id: d.id,
            endereco: d.address_text || d.metadata?.display_name || 'Endereço desconhecido',
            hora: d.occurred_at ? new Date(d.occurred_at).toLocaleTimeString() : '',
          }))
        );
      }
      setLoading(false);
    };
    fetchHistory();
    return () => {
      mounted = false;
    };
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
        <Text style={styles.subTitle}>Por onde você andou</Text>
        <Ionicons name="location-outline" size={20} color="#9FE870" />
      </View>

      {/* LISTA */}
      <FlatList
        data={dados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.endereco}>{item.endereco}</Text>
            {item.hora !== '' && <Text style={styles.hora}>{item.hora}</Text>}
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
  endereco: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  hora: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
