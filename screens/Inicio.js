import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Linking, Alert, Vibration } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';

export default function Inicio() {
  const [location, setLocation] = useState(null);
  const [MapComponents, setMapComponents] = useState({ MapView: null, Marker: null });
  const [address, setAddress] = useState('');
  const [brTime, setBrTime] = useState('');
  const [destCoords, setDestCoords] = useState(null);
  const [distanceStr, setDistanceStr] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Coordenadas corrigidas para Caçapava-SP
  const predefinedLocations = {
    'Supermercado Shibata': { 
      latitude: -23.1015,
      longitude: -45.7068,
      query: 'Supermercado Shibata, Caçapava, São Paulo',
      displayName: 'Supermercado Shibata'
    },
    'Praça da Bandeira': { 
      latitude: -23.1003,
      longitude: -45.7059,
      query: 'Praça da Bandeira, Caçapava, São Paulo',
      displayName: 'Praça da Bandeira'
    },
    'Igreja Matriz': { 
      latitude: -23.1008,
      longitude: -45.7055,
      query: 'Igreja Matriz São João Batista - Paróquia Nossa Senhora d´Ajuda, Praça Dr. Pedro de Toledo, s/n - Centro, Caçapava - SP, 12281-500',
      displayName: 'Igreja Matriz'
    },
    'Terminal Rodoviária': {
      latitude: -23.1021,
      longitude: -45.7043,
      query: 'Terminal Rodoviaria Caçapava, Caçapava, Brasil',
      displayName: 'Terminal Rodoviária'
    }
  };

  // If present, fetch predefined locations from Supabase (overrides local predefinedLocations)
  useEffect(() => {
    let mounted = true;
    const fetchPredefined = async () => {
      try {
        const { data, error } = await (await import('../lib/supabase')).supabase
          .from('predefined_locations')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && data && mounted && data.length > 0) {
          const map = {};
          data.forEach((d) => {
            map[d.display_name] = { latitude: d.latitude, longitude: d.longitude, query: d.query, displayName: d.display_name };
          });
          // merge with local predefinedLocations (local keys preserved)
          Object.assign(predefinedLocations, map);
        }
      } catch (err) {
        console.log('Erro ao buscar predefined_locations', err);
      }
    };
    fetchPredefined();
    return () => { mounted = false; };
  }, []);

  // Função para falar com feedback tátil
  const speak = async (text, options = {}) => {
    if (isSpeaking) {
      await Speech.stop();
    }
    
    setIsSpeaking(true);
    Vibration.vibrate(50); // Feedback tátil
    
    return new Promise((resolve) => {
      Speech.speak(text, {
        language: 'pt-BR',
        pitch: 1.0,
        rate: 0.9,
        ...options,
        onDone: () => {
          setIsSpeaking(false);
          resolve();
        },
        onError: () => {
          setIsSpeaking(false);
          resolve();
        }
      });
    });
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
        // REMOVIDO: fala automática quando permissão é negada
      } else {
        let loc = await Location.getCurrentPositionAsync({});
        coords = loc.coords;
        setLocation(loc);
        // REMOVIDO: fala automática quando localização é obtida
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
            const formattedAddress = formatPlacemark(placemarks[0]);
            setAddress(formattedAddress);
            // REMOVIDO: fala automática do endereço
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
  
  // Adicione a função para abrir rotas para locais específicos
  const openRouteTo = async (query, displayName) => {
    try {
      Vibration.vibrate(100); // Feedback tátil ao tocar
      
      await speak(`Calculando rota para ${displayName}`);

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
      
      if (coords && location && location.coords) {
        const origin = `${location.coords.latitude},${location.coords.longitude}`;
        const destination = `${coords.latitude},${coords.longitude}`;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
        
        setSelectedDestination(displayName);
        
        await speak(`Rota para ${displayName} calculada. Abrindo mapa de navegação.`);
        
        if (Platform.OS === 'web') {
          window.open(url, '_blank');
        } else {
          Linking.openURL(url);
        }
      } else {
        await speak('Não foi possível calcular a rota. Verifique sua conexão e tente novamente.');
      }
    } catch (err) {
      console.log('Erro ao abrir rota:', err);
      await speak('Erro ao abrir rota. Tente novamente.');
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

  // Função para falar instruções completas
  const speakInstructions = async () => {
    await speak(
      'Bem vindo ao Secure Step. ' +
      'Aplicativo de navegação para pessoas com deficiência visual. ' +
      'Toque em qualquer destino na tela para abrir a rota no mapa. ' +
      'Destinos disponíveis: Terminal Rodoviária, Supermercado Shibata, Praça da Bandeira e Igreja Matriz. ' +
      'Cada toque fornecerá feedback por voz e vibração.',
      { rate: 0.85 }
    );
  };

  // Função para falar informações da localização atual
  const speakLocationInfo = async () => {
    if (location && address) {
      await speak(
        `Localização atual: ${address}. ` +
        `Horário: ${brTime}. ` +
        `Distância até o Terminal Rodoviária: ${distanceStr || 'calculando'}.`
      );
    } else {
      await speak('Carregando informações de localização...');
    }
  };

  const { MapView, Marker } = MapComponents;
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header com acessibilidade */}
        <TouchableOpacity 
          style={styles.header} 
          onPress={speakInstructions}
          accessible={true}
          accessibilityLabel="Secure Step. Toque duas vezes para ouvir instruções completas"
        >
          <Ionicons name="eye-outline" size={30} color="#fff" />
          <Text style={styles.logo}>SecureStep</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Localização</Text>

        {/* Localização atual - REMOVIDA a fala automática ao tocar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Localização atual</Text>

          {location ? (
            Platform.OS === 'web' ? (
              <iframe
                title="Mapa da localização atual"
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

        {/* Assistência por Voz */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assistência por Voz</Text>
          
          <View style={styles.voiceButtonsContainer}>
            <TouchableOpacity 
              style={styles.voiceButton} 
              onPress={speakInstructions}
              accessible={true}
              accessibilityLabel="Ouvir instruções completas do aplicativo"
            >
              <MaterialIcons 
                name="record-voice-over" 
                size={32} 
                color="white" 
              />
              <Text style={styles.buttonText}>Instruções</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.voiceButton} 
              onPress={speakLocationInfo}
              accessible={true}
              accessibilityLabel="Ouvir informações da localização atual"
            >
              <MaterialIcons 
                name="location-on" 
                size={32} 
                color="white" 
              />
              <Text style={styles.buttonText}>Localização</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.voiceStatus}>
            Toque nos botões para navegação por voz
          </Text>
          
          {selectedDestination ? (
            <Text style={styles.selectedDestination}>
              Destino selecionado: {selectedDestination}
            </Text>
          ) : null}
        </View>

        {/* Locais mais frequentados com acessibilidade */}
        <View style={[styles.section, { marginTop: 7 }]}>
          <Text style={styles.sectionTitle}>Locais mais frequentados</Text>

          {Object.entries(predefinedLocations).map(([key, locationInfo]) => (
            <TouchableOpacity 
              key={key}
              onPress={() => openRouteTo(locationInfo.query, locationInfo.displayName)} 
              style={styles.locationButton}
              accessible={true}
              accessibilityLabel={`${locationInfo.displayName}. Distância: ${calculateDistance(key) || 'calculando'}. Toque duas vezes para abrir rota`}
            >
              <View style={styles.infoRow}>
                <View style={styles.locationTextContainer}>
                  <MaterialIcons name="place" size={20} color="#9FE870" />
                  <Text style={styles.endereco}>{locationInfo.displayName}</Text>
                </View>
                <Text style={styles.distancia}>{calculateDistance(key) || '...'} </Text>
              </View>
              <Text style={styles.routeHint}>
                Toque para abrir rota no Maps
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* REMOVIDA: Seção de informações de acessibilidade */}

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
    paddingBottom: 30,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
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
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '600',
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
  locationTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  endereco: {
    color: 'white',
    fontSize: 16,
    flex: 1,
    marginRight: 10,
    marginLeft: 8,
    fontWeight: '500',
  },
  hora: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  distancia: {
    color: '#9FE870',
    fontWeight: 'bold',
    fontSize: 14,
  },
  voiceButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    marginTop: 10,
  },
  voiceButton: {
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  voiceStatus: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 5,
  },
  selectedDestination: {
    color: '#4FC3F7',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  locationButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#9FE870',
  },
  routeHint: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 30,
  },
});