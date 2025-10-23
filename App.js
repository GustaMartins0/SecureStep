import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';




// Screens
import SplashScreen from './screens/SplashScreen';
import Login from './screens/Login';
import Cadastro from './screens/Cadastro';
import EsqueceuSenha from './screens/EsqueceuSenha';
import Inicio from './screens/Inicio';
import Atividades from './screens/Atividades';
import HistoricoLocalizacao from './screens/HistoricoLocalizacao';
import HistoricoBotao from './screens/HistoricoBotao';
import Perfil from './screens/Perfil';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tabs
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',   // permite flutuar
          bottom: 20,             // distância da borda inferior
          left: 20,               // distância da borda lateral esquerda
          right: 20,              // distância da borda lateral direita
          elevation: 5,           // sombra no Android
          backgroundColor: '#000', 
          borderRadius: 15,       // bordas arredondadas
          height: 60,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={Inicio}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Atividades"
        component={Atividades}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="running" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={Perfil}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}


// Main App
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="EsqueceuSenha" component={EsqueceuSenha} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="HistoricoLocalizacao" component={HistoricoLocalizacao} />
        <Stack.Screen name="HistoricoBotao" component={HistoricoBotao} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
