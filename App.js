import React from 'react';
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
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdicionarProduto"
          component={AdicionarProdutoScreen}
          options={{ title: 'Adicionar Produto', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="ListaCompra"
          component={ListaCompraScreen}
          options={{ title: 'Lista de Compra', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="Estoque"
          component={EstoqueScreen}
          options={{ title: 'Estoque', headerTitleAlign: 'center' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
