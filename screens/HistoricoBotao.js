import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons'; // importação adicionada
import { useNavigation } from '@react-navigation/native'; // importação adicionada

const dados = [
  { id: '1', titulo: 'Hoje - 10/09', hora: '16:30' },
  { id: '2', titulo: 'Ontem - 09/09', hora: '09:00' },
  { id: '3', titulo: 'Segunda - 03/09', hora: '03:30' },
  { id: '4', titulo: 'Dia - 29/08', hora: '02:30' },
  { id: '5', titulo: 'Dia - 26/08', hora: '17:00' },
  { id: '6', titulo: 'Dia - 25/08', hora: '13:30' },
  { id: '7', titulo: 'Dia - 20/08', hora: '11:20' },
];

export default function HistoricoBotao() {
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
