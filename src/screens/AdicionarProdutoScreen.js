import React, { useState } from 'react';
import { 
  View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { addItem } from '../services/db';

export default function AdicionarProdutoScreen() {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('0');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('recorrente');
  const [historico, setHistorico] = useState([]);

  const formatarValor = (text) => {
    // Remove caracteres não numéricos
    let num = text.replace(/\D/g, '');
    // Formata como R$
    num = (parseFloat(num)/100).toFixed(2);
    return `R$ ${num}`.replace('.', ',');
  };

  const handleAdd = async () => {
    if (!nome.trim()) return Alert.alert('Erro', 'Nome obrigatório');

    const quantidadeNum = parseInt(quantidade);
    if (isNaN(quantidadeNum) || quantidadeNum < 0) return Alert.alert('Erro', 'Quantidade inválida');

    const valorNum = valor ? parseFloat(valor.replace(/\D/g,'')/100) : null;

    try {
      await addItem({
        nome,
        quantidade: quantidadeNum,
        valorUnitario: valorNum,
        categoria,
        naLista: false,
      });

      Alert.alert('Sucesso', 'Produto adicionado!');

      // Atualiza histórico
      setHistorico([{ nome, quantidade: quantidadeNum, valor: valorNum, categoria }, ...historico]);

      // Reseta campos
      setNome('');
      setQuantidade('0');
      setValor('');
      setCategoria('recorrente');
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex:1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="Quantidade"
          value={quantidade}
          onChangeText={text => setQuantidade(text.replace(/\D/g,''))}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Valor Unitário (opcional)"
          value={valor}
          onChangeText={text => setValor(formatarValor(text))}
          keyboardType="numeric"
        />

        <View style={styles.pickerContainer}>
          <TouchableOpacity 
            style={[styles.pickerButton, categoria==='recorrente' && styles.pickerSelected]} 
            onPress={() => setCategoria('recorrente')}
          >
            <Text>Recorrente</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.pickerButton, categoria==='esporadico' && styles.pickerSelected]} 
            onPress={() => setCategoria('esporadico')}
          >
            <Text>Esporádico</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>Adicionar</Text>
        </TouchableOpacity>

        <Text style={styles.historicoTitle}>Últimos itens adicionados:</Text>
        {historico.length === 0 ? (
          <Text style={styles.empty}>Nenhum item adicionado nesta sessão</Text>
        ) : (
          <FlatList
            data={historico}
            keyExtractor={(item,index) => index.toString()}
            renderItem={({item}) => (
              <View style={styles.historicoItem}>
                <Text style={{ fontWeight:'bold' }}>{item.nome}</Text>
                <Text>Quantidade: {item.quantidade}</Text>
                <Text>Categoria: {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}</Text>
                <Text>Valor: {item.valor != null ? `R$ ${item.valor.toFixed(2).replace('.',',')}` : 'Sem registro de valor'}</Text>
              </View>
            )}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:{ flexGrow:1, padding:20 },
  input:{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:10, marginBottom:10 },
  pickerContainer:{ flexDirection:'row', justifyContent:'space-around', marginBottom:20 },
  pickerButton:{ padding:10, borderWidth:1, borderColor:'#ccc', borderRadius:5 },
  pickerSelected:{ backgroundColor:'#ddd' },
  button:{ backgroundColor:'#4CAF50', padding:15, borderRadius:8, alignItems:'center', marginBottom:20 },
  buttonText:{ color:'white', fontWeight:'bold', fontSize:16 },
  historicoTitle:{ fontWeight:'bold', fontSize:16, marginBottom:10 },
  empty:{ color:'#666', fontStyle:'italic', marginBottom:10 },
  historicoItem:{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:10, marginBottom:10 }
});
