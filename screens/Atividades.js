import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation();

  return (
    <View style={styles.container}>

      {/* --- CABEÇALHO --- */}
      <View style={styles.header}>
        <Text style={styles.title}>Atividades</Text>

        <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
          <Ionicons name="person-circle-outline" size={42} color="#B2FF59" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* --- CARD 1: Caminhos --- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Por onde você andou</Text>
            <MaterialIcons name="location-on" size={26} color="#B2FF59" />
          </View>

          {caminhos.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.textPrimary}>{item.endereco}</Text>
              <Text style={styles.textSecondary}>{item.horario}</Text>
            </View>
          ))}

          <TouchableOpacity 
            style={styles.moreButton} 
            onPress={() => navigation.navigate('HistoricoLocalizacao')}
          >
            <Text style={styles.moreText}>Ver mais</Text>
          </TouchableOpacity>
        </View>

        {/* --- CARD 2: Botões apertados --- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Histórico de botões apertados</Text>
            <MaterialIcons name="touch-app" size={26} color="#B2FF59" />
          </View>

          {botoes.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.textPrimary}>{item.dia}</Text>
              <Text style={styles.textSecondary}>{item.horario}</Text>
            </View>
          ))}

          <TouchableOpacity 
            style={styles.moreButton} 
            onPress={() => navigation.navigate('HistoricoBotao')}
          >
            <Text style={styles.moreText}>Ver mais</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#011a1f',
    paddingTop: 40,
  },

  // --- Cabeçalho ---
  header: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    paddingBottom: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { color: 'white', fontSize: 26, fontWeight: '700' },

  // Scroll geral
  scroll: { paddingHorizontal: 18 },

  // --- Cards mais modernos ---
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 18,
    borderRadius: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  cardTitle: { 
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },

  // itens da lista
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  textPrimary: { color: '#e8e8e8', fontSize: 14, flex: 1, paddingRight: 10 },
  textSecondary: { color: '#ffffffff', fontSize: 14, fontWeight: '600' },

  // botao ver mais
  moreButton: { marginTop: 10, alignSelf: 'flex-end' },
  moreText: { color: '#B2FF59', fontSize: 14, textDecorationLine: 'underline' },
});
