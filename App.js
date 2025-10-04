import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import AdicionarProdutoScreen from './src/screens/AdicionarProdutoScreen';
import ListaCompraScreen from './src/screens/ListaCompraScreen';
import EstoqueScreen from './src/screens/EstoqueScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#fff' },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdicionarProduto"
          component={AdicionarProdutoScreen}
          options={{ title: 'Adicionar Produto' }}
        />
        <Stack.Screen
          name="ListaCompra"
          component={ListaCompraScreen}
          options={{ title: 'Lista de Compras' }}
        />
        <Stack.Screen
          name="Estoque"
          component={EstoqueScreen}
          options={{ title: 'Estoque' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
