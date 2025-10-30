import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Linking, Alert, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';

export default function Inicio() {
  const [location, setLocation] = useState(null);
  const [MapComponents, setMapComponents] = useState({ MapView: null, Marker: null });
  const [address, setAddress] = useState('');
  const [brTime, setBrTime] = useState('');
  const [destCoords, setDestCoords] = useState(null);
  const [destName, setDestName] = useState('Terminal Rodoviaria Caçapava - Caçapava');
  const [distanceStr, setDistanceStr] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');

  // Coordenadas corrigidas para Caçapava-SP
  const predefinedLocations = {
    'Supermercado Shibata': { 
      latitude: -23.1015,
      longitude: -45.7068,
      query: 'Supermercado Shibata, Caçapava, São Paulo'
    },
    'Praça da Bandeira': { 
      latitude: -23.1003,
      longitude: -45.7059,
      query: 'Praça da Bandeira, Caçapava, São Paulo'
    },
    'Igreja Matriz': { 
      latitude: -23.1008, // COORDENADA CORRIGIDA
      longitude: -45.7055, // COORDENADA CORRIGIDA
      query: 'Igreja Matriz São João Batista - Paróquia Nossa Senhora d´Ajuda, Praça Dr. Pedro de Toledo, s/n - Centro, Caçapava - SP, 12281-500'
    },
    'Terminal Rodoviária': {
      latitude: -23.1021,
      longitude: -45.7043,
      query: 'Terminal Rodoviaria Caçapava, Caçapava, Brasil'
    }
  };

  // Função utilitária para formatar placemark do expo-location
  const formatPlacemark = (p) => {
    const street = p.street || p.name || '';
    const city = p.city || p.region || '';
    return street ? (city ? `${street} - ${city}` : street) : (city || 'Endereço desconhecido');
  };
  
  // Importação dinâmica de react-native-maps apenas no mobile
  useEffect(() => {
    // carregar mapa nativo no mobile
    if (Platform.OS !== 'web') {
      const MapView = require('react-native-maps').default;
      const Marker = require('react-native-maps').Marker;
      setMapComponents({ MapView, Marker });
    }

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let coords;
      if (status !== 'granted') {
        console.log('Permissão negada para acessar localização');
        coords = { latitude: -23.099, longitude: -45.707 };
        setLocation({ coords });
      } else {
        let loc = await Location.getCurrentPositionAsync({});
        coords = loc.coords;
        setLocation(loc);
      }

      // Reverse geocoding: mobile via expo-location, web via Nominatim (OpenStreetMap)
      try {
        if (Platform.OS === 'web') {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`
          );
          const data = await resp.json();
          if (data) {
            const display = data.address
              ? [
                  data.address.road,
                  data.address.neighbourhood,
                  data.address.suburb,
                  data.address.city || data.address.town || data.address.village,
                ]
                  .filter(Boolean)
                  .join(', ')
              : data.display_name;
            setAddress(display || 'Endereço desconhecido');
          }
        } else {
          const placemarks = await Location.reverseGeocodeAsync(coords);
          if (placemarks && placemarks.length > 0) {
            setAddress(formatPlacemark(placemarks[0]));
          }
        }
        // Geocode do destino (Terminal) para obter coordenadas
        try {
          const query = predefinedLocations['Terminal Rodoviária'].query;
          if (Platform.OS === 'web') {
            const s = await fetch(
              `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1`
            );
            const r = await s.json();
            if (r && r.length > 0) {
              setDestCoords({ latitude: parseFloat(r[0].lat), longitude: parseFloat(r[0].lon) });
              setDestName(r[0].display_name || destName);
            } else {
              // Usar coordenadas predefinidas se a busca falhar
              setDestCoords(predefinedLocations['Terminal Rodoviária']);
            }
          } else {
            const res = await Location.geocodeAsync(query);
            if (res && res.length > 0) {
              setDestCoords({ latitude: res[0].latitude, longitude: res[0].longitude });
            } else {
              setDestCoords(predefinedLocations['Terminal Rodoviária']);
            }
          }
        } catch (err) {
          console.log('Erro no geocoding do destino:', err);
          setDestCoords(predefinedLocations['Terminal Rodoviária']);
        }
      } catch (err) {
        console.log('Erro no reverse geocoding:', err);
      }
    })();
  }, []);
  
  // Atualiza o horário de Brasília a cada minuto
  useEffect(() => {
    const updateTime = () => {
      try {
        const formatter = new Intl.DateTimeFormat('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Sao_Paulo',
        });
        setBrTime(formatter.format(new Date()));
      } catch (err) {
        // fallback simples
        const d = new Date();
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        setBrTime(`${hh}:${mm}`);
      }
    };

    updateTime();
    const id = setInterval(updateTime, 60 * 1000);
    return () => clearInterval(id);
  }, []);
  
  // calcula distância (metros) usando haversine
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000; // metros
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  
  // atualiza distância quando local ou destino mudam
  useEffect(() => {
    if (location && location.coords && destCoords) {
      const d = haversineDistance(
        location.coords.latitude,
        location.coords.longitude,
        destCoords.latitude,
        destCoords.longitude
      );
      if (d < 1000) setDistanceStr(`${Math.round(d)}m`);
      else setDistanceStr(`${(d / 1000).toFixed(1)} km`);
    }
  }, [location, destCoords]);
  
  // abre rota no Google Maps (web abre em nova aba)
  const openRoute = () => {
    if (!location || !location.coords || !destCoords) return;
    const origin = `${location.coords.latitude},${location.coords.longitude}`;
    const destination = `${destCoords.latitude},${destCoords.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };
  
  // Adicione a função para abrir rotas para locais específicos
  const openRouteTo = async (query) => {
    try {
      let coords;
      if (Platform.OS === 'web') {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1`
        );
        const result = await response.json();
        if (result && result.length > 0) {
          coords = { latitude: parseFloat(result[0].lat), longitude: parseFloat(result[0].lon) };
        } else {
          // Se não encontrar pelo nome, usar coordenadas predefinidas
          const locationKey = Object.keys(predefinedLocations).find(key => 
            query.includes(key)
          );
          if (locationKey) {
            coords = predefinedLocations[locationKey];
          }
        }
      } else {
        const geocode = await Location.geocodeAsync(query);
        if (geocode && geocode.length > 0) {
          coords = { latitude: geocode[0].latitude, longitude: geocode[0].longitude };
        } else {
          const locationKey = Object.keys(predefinedLocations).find(key => 
            query.includes(key)
          );
          if (locationKey) {
            coords = predefinedLocations[locationKey];
          }
        }
      }
      if (coords) {
        const origin = `${location.coords.latitude},${location.coords.longitude}`;
        const destination = `${coords.latitude},${coords.longitude}`;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
        if (Platform.OS === 'web') {
          window.open(url, '_blank');
        } else {
          Linking.openURL(url);
        }
      }
    } catch (err) {
      console.log('Erro ao abrir rota:', err);
    }
  };
  
  // Adicione a função para calcular a distância para locais específicos
  const calculateDistance = (query) => {
    if (!location || !location.coords) return null;

    const dest = predefinedLocations[query];
    if (!dest) return null;

    const distance = haversineDistance(
      location.coords.latitude,
      location.coords.longitude,
      dest.latitude,
      dest.longitude
    );

    return distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)} km`;
  };

  // Simulação de reconhecimento de voz (para demonstração)
  const simulateVoiceRecognition = () => {
    setIsListening(true);
    setLastCommand('');
    
    setTimeout(() => {
      setIsListening(false);
      
      const commands = [
        'Abrir rota para o supermercado',
        'Navegar até a praça',
        'Ir para a igreja',
        'Mostrar caminho para o terminal'
      ];
      
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      setLastCommand(randomCommand);
      processVoiceCommand(randomCommand);
    }, 2000);
  };

  // Processa o comando de voz
  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();

    const voiceCommands = {
      'supermercado': predefinedLocations['Supermercado Shibata'].query,
      'shibata': predefinedLocations['Supermercado Shibata'].query,
      'praça': predefinedLocations['Praça da Bandeira'].query,
      'bandeira': predefinedLocations['Praça da Bandeira'].query,
      'igreja': predefinedLocations['Igreja Matriz'].query,
      'matriz': predefinedLocations['Igreja Matriz'].query,
      'terminal': predefinedLocations['Terminal Rodoviária'].query,
      'rodoviária': predefinedLocations['Terminal Rodoviária'].query,
      'rodoviaria': predefinedLocations['Terminal Rodoviária'].query
    };

    const matchedCommand = Object.keys(voiceCommands).find(key => 
      lowerCommand.includes(key)
    );

    if (matchedCommand) {
      const destination = voiceCommands[matchedCommand];
      
      Speech.speak(`Abrindo rota para ${matchedCommand}`, {
        language: 'pt-BR',
        pitch: 1.0,
        rate: 0.8
      });
      
      Alert.alert('Comando reconhecido', `Navegando para: ${matchedCommand}`);

      // Adicione um atraso de 2 segundos antes de abrir o Google Maps
      setTimeout(() => {
        openRouteTo(destination);
      }, 2000);
    } else {
      Speech.speak('Comando não reconhecido. Tente novamente.', {
        language: 'pt-BR'
      });
      Alert.alert(
        'Comando não reconhecido', 
        `Comando: "${command}"\n\nComandos disponíveis: supermercado, praça, igreja, terminal`
      );
    }
  };

  // Função principal de reconhecimento de voz
  const handleVoiceCommand = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    simulateVoiceRecognition();
  };

  const { MapView, Marker } = MapComponents;
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="eye-outline" size={30} color="#fff" />
          <Text style={styles.logo}>SecureStep</Text>
        </View>
        
        <Text style={styles.title}>Localização</Text>

        {/* Localização atual */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização atual</Text>

          {location ? (
            Platform.OS === 'web' ? (
              <iframe
                title="Mapa"
                style={{
                  width: '100%',
                  height: 180,
                  borderRadius: 12,
                  border: 'none',
                  marginBottom: 10,
                }}
                src={`https://maps.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}&z=15&output=embed`}
              />
            ) : (
              MapView &&
              Marker && (
                <MapView
                  style={styles.mapa}
                  initialRegion={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  {/* Marcador da localização atual */}
                  <Marker
                    coordinate={{
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                    }}
                    title="Você está aqui"
                    pinColor="red"
                  />
                </MapView>
              )
            )
          ) : (
            <Text style={{ color: '#aaa', textAlign: 'center' }}>Carregando localização...</Text>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.endereco}>{address || 'Carregando endereço...'}</Text>
            <Text style={styles.hora}>{brTime || '...'}</Text>
          </View>
        </View>

        {/* Reconhecimento de Voz */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comando de Voz</Text>
          <TouchableOpacity 
            style={[
              styles.micButton, 
              isListening && styles.listeningButton
            ]} 
            onPress={handleVoiceCommand}
          >
            <MaterialIcons 
              name={isListening ? "mic-off" : "keyboard-voice"} 
              size={32} 
              color="white" 
            />
          </TouchableOpacity>
          <Text style={styles.voiceStatus}>
            {isListening ? 'Ouvindo... Fale agora!' : 'Toque no microfone e dite um comando'}
          </Text>
          {lastCommand ? (
            <Text style={styles.lastCommand}>Último comando: "{lastCommand}"</Text>
          ) : null}
        </View>

        {/* Locais mais frequentados */}
        <View style={[styles.section, { marginTop: 7 }]}>
          <Text style={styles.sectionTitle}>Locais mais frequentados</Text>

          {/* Terminal Rodoviária */}
          <TouchableOpacity onPress={openRoute} style={{ marginTop: 9 }}>
            <View style={styles.infoRow}>
              <Text style={styles.endereco}>Terminal Rodoviária</Text>
              <Text style={styles.distancia}>{distanceStr || '...'} </Text>
            </View>
            <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 6 }}>
              Toque para abrir rota no Maps
            </Text>
          </TouchableOpacity>

          {/* Supermercado Shibata */}
          <TouchableOpacity onPress={() => openRouteTo(predefinedLocations['Supermercado Shibata'].query)} style={{ marginTop: 20 }}>
            <View style={styles.infoRow}>
              <Text style={styles.endereco}>Supermercado Shibata</Text>
              <Text style={styles.distancia}>{calculateDistance('Supermercado Shibata') || '...'} </Text>
            </View>
            <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 6 }}>
              Toque para abrir rota no Maps
            </Text>
          </TouchableOpacity>

          {/* Praça da Bandeira */}
          <TouchableOpacity onPress={() => openRouteTo(predefinedLocations['Praça da Bandeira'].query)} style={{ marginTop: 20 }}>
            <View style={styles.infoRow}>
              <Text style={styles.endereco}>Praça da Bandeira</Text>
              <Text style={styles.distancia}>{calculateDistance('Praça da Bandeira') || '...'} </Text>
            </View>
            <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 6 }}>
              Toque para abrir rota no Maps
            </Text>
          </TouchableOpacity>

          {/* Igreja Matriz */}
          <TouchableOpacity onPress={() => openRouteTo(predefinedLocations['Igreja Matriz'].query)} style={{ marginTop: 20 }}>
            <View style={styles.infoRow}>
              <Text style={styles.endereco}>Igreja Matriz</Text>
              <Text style={styles.distancia}>{calculateDistance('Igreja Matriz') || '...'} </Text>
            </View>
            <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 6 }}>
              Toque para abrir rota no Maps
            </Text>
          </TouchableOpacity>
        </View>

        {/* Espaço extra no final para melhor scroll */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#001A1A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30, // Adicionado padding no final
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 10,
  },
  mapa: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  endereco: {
    color: 'white',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  hora: {
    color: 'white',
    fontWeight: 'bold',
  },
  distancia: {
    color: '#9FE870',
    fontWeight: 'bold',
  },
  micButton: {
    alignSelf: 'center',
    backgroundColor: '#D32F2F',
    padding: 18,
    borderRadius: 50,
    marginBottom: 10,
    marginTop: 10,
  },
  listeningButton: {
    backgroundColor: '#388E3C',
  },
  voiceStatus: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 5,
  },
  lastCommand: {
    color: '#9FE870',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 20, // Espaço extra no final para melhor scroll
  },
});