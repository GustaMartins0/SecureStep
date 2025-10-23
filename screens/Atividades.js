import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // ícones
import { useNavigation } from '@react-navigation/native'; // importação adicionada

const caminhos = [
  { id: '1', endereco: 'Rua Manoel, Bairro Residencial Galo Preto', horario: '16:30' },
  { id: '2', endereco: 'Rua Simpatia, Bairro Exemplos', horario: '13:30' },
  { id: '3', endereco: 'Rua exemplo 123, Bairro exemplo', horario: '03:30' },
];

const botoes = [
  { id: '1', dia: 'Hoje - 10/09', horario: '16:30' },
  { id: '2', dia: 'Ontem - 09/09', horario: '09:00' },
  { id: '3', dia: 'Segunda - 03/09', horario: '03:30' },
];

export default function Atividades() {
  const navigation = useNavigation(); // hook de navegação

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Atividades</Text>
        {/* changed: ícone agora é um botão que redireciona para a tela Perfil */}
        <TouchableOpacity onPress={() => navigation.navigate('Perfil')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="person-circle-outline" size={36} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Por onde você andou */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Por onde você andou</Text>
            <MaterialIcons name="location-pin" size={24} color="#B2FF59" />
          </View>
          {caminhos.map((item) => (
            <View key={item.id} style={styles.item}>
              <Text style={styles.endereco}>{item.endereco}</Text>
              <Text style={styles.horario}>{item.horario}</Text>
            </View>
          ))}
          <View style={styles.verMaisContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('HistoricoLocalizacao')}>
              <Text style={styles.verMais}>Ver mais</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Histórico de botão apertados */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historico de botão apertados</Text>
            <MaterialIcons name="touch-app" size={24} color="#B2FF59" />
          </View>
          {botoes.map((item) => (
            <View key={item.id} style={styles.item}>
              <Text style={styles.endereco}>{item.dia}</Text>
              <Text style={styles.horario}>{item.horario}</Text>
            </View>
          ))}
          <View style={styles.verMaisContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('HistoricoBotao')}>
              <Text style={styles.verMais}>Ver mais</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Rodapé */}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#011a1f', // cor de fundo única
    paddingTop: 30, // adicionado: distância do topo aplicada em toda a tela
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginTop: 0, // ajustado: removido margin extra para não somar com paddingTop
    backgroundColor: '#011a1f', // garante fundo igual
  },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  section: { marginBottom: 30, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  endereco: { color: 'white', fontSize: 14 },
  horario: { color: '#ffffffff', fontSize: 14 },
  verMaisContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  verMais: { color: '#818181', marginTop: 0 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    backgroundColor: '#011a1f',
  },
});
