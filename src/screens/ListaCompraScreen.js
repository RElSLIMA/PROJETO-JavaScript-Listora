import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getAllItems, registrarCompra } from '../services/db';

export default function ListaCompraScreen() {
  const [itens, setItens] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [quantidadeCompra, setQuantidadeCompra] = useState('');
  const [valorCompra, setValorCompra] = useState('');

  // Carrega itens da lista de compra
  const loadItens = async () => {
    const all = await getAllItems();
    const listaCompra = all
      .filter(i => i.quantidade === 0 || i.naLista)
      .sort((a, b) => parseInt(b.id) - parseInt(a.id)); // mais recente primeiro
    setItens(listaCompra);
  };

  useEffect(() => {
    loadItens();
  }, []);

  // Filtra por categoria e busca
  const itensFiltrados = itens.filter(i => {
    const correspondeFiltro =
      filtro === 'todos' ? true : i.categoria.toLowerCase() === filtro;
    const correspondeBusca =
      i.nome.toLowerCase().includes(busca.toLowerCase());
    return correspondeFiltro && correspondeBusca;
  });

  // Abre modal para registrar compra
  const abrirModalCompra = (item) => {
    setItemSelecionado(item);
    setQuantidadeCompra('');
    setValorCompra('');
    setModalVisible(true);
  };

  // Formata valor em Real
  const formatarReal = (valor) => {
    let v = valor.replace(/\D/g, '');
    v = (v/100).toFixed(2) + '';
    v = v.replace('.', ',');
    v = 'R$ ' + v;
    return v;
  };

  // Atualiza valor com máscara
  const handleValorCompraChange = (text) => {
    const numeric = text.replace(/\D/g, '');
    setValorCompra(formatarReal(numeric));
  };

  // Confirma compra
  const confirmarCompra = async () => {
    const quantidadeNum = parseInt(quantidadeCompra);
    if (isNaN(quantidadeNum) || quantidadeNum <= 0)
      return Alert.alert('Erro', 'Quantidade inválida');

    const valorNum = valorCompra
      ? parseFloat(valorCompra.replace(/\D/g, '')) / 100
      : 0;

    await registrarCompra(itemSelecionado.id, quantidadeNum, valorNum);
    setModalVisible(false);
    loadItens();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex:1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <TextInput
          style={styles.busca}
          placeholder="Nunca..."
          value={busca}
          onChangeText={setBusca}
        />

        <View style={styles.filtroRow}>
          <TouchableOpacity style={[styles.filtroBtn, filtro==='todos' && styles.filtroAtivo]} onPress={()=>setFiltro('todos')}><Text>Todos</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.filtroBtn, filtro==='recorrente' && styles.filtroAtivo]} onPress={()=>setFiltro('recorrente')}><Text>Recorrente</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.filtroBtn, filtro==='esporadico' && styles.filtroAtivo]} onPress={()=>setFiltro('esporadico')}><Text>Esporádico</Text></TouchableOpacity>
        </View>

        {itensFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>Lista vazia</Text>
          </View>
        ) : (
          <FlatList
            data={itensFiltrados}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={[styles.itemText, { fontWeight:'bold', fontSize:18 }]}>
                  {item.nome}
                </Text>

                <Text>
                  <Text style={{ fontWeight:'bold' }}>Categoria: </Text>
                  {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}
                </Text>

                <Text>
                  <Text style={{ fontWeight:'bold' }}>Valor: </Text>
                  {item.minValor != null && item.maxValor != null
                    ? `R$ ${item.minValor.toFixed(2)} - R$ ${item.maxValor.toFixed(2)}`
                    : 'Sem registro de valor'}
                </Text>

                <TouchableOpacity style={styles.button} onPress={()=>abrirModalCompra(item)}>
                  <Text style={styles.buttonText}>Comprado</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* Modal de registrar compra */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={{ fontWeight:'bold', fontSize:18 }}>
                Registrar Compra: {itemSelecionado?.nome}
              </Text>
              <TextInput
                placeholder="Quantidade"
                keyboardType="numeric"
                value={quantidadeCompra}
                onChangeText={setQuantidadeCompra}
                style={styles.modalInput}
              />
              <TextInput
                placeholder="Valor unitário (opcional)"
                keyboardType="numeric"
                value={valorCompra}
                onChangeText={handleValorCompraChange}
                style={styles.modalInput}
              />
              <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                <TouchableOpacity style={styles.modalButton} onPress={confirmarCompra}>
                  <Text style={styles.buttonText}>Confirmar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor:'#f44336' }]} onPress={()=>setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:20 },
  busca:{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:10, marginBottom:10 },
  filtroRow:{ flexDirection:'row', justifyContent:'space-around', marginBottom:10 },
  filtroBtn:{ padding:10, borderWidth:1, borderColor:'#ccc', borderRadius:5 },
  filtroAtivo:{ backgroundColor:'#ddd' },
  emptyContainer:{ flex:1, justifyContent:'center', alignItems:'center' },
  empty:{ fontSize:18, color:'#666' },
  item:{ padding:15, borderWidth:1, borderColor:'#ccc', borderRadius:8, marginBottom:10 },
  itemText:{ fontSize:16 },
  button:{ backgroundColor:'#4CAF50', marginTop:5, padding:10, borderRadius:5, alignItems:'center' },
  buttonText:{ color:'white', fontWeight:'bold', textAlign:'center' },
  modalBackground:{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)' },
  modalContainer:{ width:'80%', backgroundColor:'white', padding:20, borderRadius:10 },
  modalInput:{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:10, marginVertical:10 },
  modalButton:{ flex:1, backgroundColor:'#4CAF50', padding:10, margin:5, borderRadius:5, alignItems:'center' },
});
