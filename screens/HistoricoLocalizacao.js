import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // importação adicionada

const dados = [
  { id: '1', endereco: 'Rua Manoel, Bairro Residencial Galo Preto', hora: '' },
  { id: '2', endereco: 'Rua Simpatia, Bairro Exemplos', hora: '16:30' },
  { id: '3', endereco: 'Rua exemplo 123, Bairro exemplo', hora: '16:30' },
  { id: '4', endereco: 'Rua Simpatia, Bairro Exemplos', hora: '16:30' },
  { id: '5', endereco: 'Rua exemplo 123, Bairro exemplo', hora: '16:30' },
  { id: '6', endereco: 'Rua exemplo 123, Bairro exemplo', hora: '16:30' },
  { id: '7', endereco: 'Rua exemplo 123, Bairro exemplo', hora: '16:30' },
  { id: '8', endereco: 'Rua exemplo 123, Bairro exemplo', hora: '16:30' },
  { id: '9', endereco: 'Rua exemplo 123, Bairro exemplo', hora: '16:30' },
  { id: '10', endereco: 'Rua exemplo 123, Bairro exemplo', hora: '16:30' },
];

export default function HistoricoLocalizacao() {
  const navigation = useNavigation(); // hook de navegação

  return (
    <View style={styles.container}>
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
