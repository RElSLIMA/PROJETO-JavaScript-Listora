import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.gear} onPress={() => alert('Configurações')}>
        <Ionicons name="settings-sharp" size={30} color="black" />
      </TouchableOpacity>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdicionarProduto')}>
          <Text style={styles.buttonText}>Adicionar Produto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ListaCompra')}>
          <Text style={styles.buttonText}>Lista de Compra</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Estoque')}>
          <Text style={styles.buttonText}>Estoque</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gear: { position: 'absolute', top: 40, right: 20 },
  buttonsContainer: { width: '80%', justifyContent: 'center', alignItems: 'center' },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
