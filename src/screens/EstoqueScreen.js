import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, TextInput, Alert, StyleSheet, Modal 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAllItems, updateItem, deleteItem } from '../services/db';

export default function EstoqueScreen() {
  const [itens, setItens] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [modalEditar, setModalEditar] = useState(false);
  const [itemEditar, setItemEditar] = useState(null);
  const [novoNome, setNovoNome] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('recorrente');
  const [novaQuantidade, setNovaQuantidade] = useState('0');

  const loadItens = async () => {
    const all = await getAllItems();
    const estoque = all
      .filter(i => i.quantidade > 0)
      .sort((a,b) => parseInt(b.id)-parseInt(a.id));
    setItens(estoque);
  };

  useEffect(() => { loadItens(); }, []);

  const itensFiltrados = itens.filter(i => {
    const correspondeFiltro = filtro==='todos' ? true : i.categoria===filtro;
    const correspondeBusca = i.nome.toLowerCase().includes(busca.toLowerCase());
    return correspondeFiltro && correspondeBusca;
  });

  const handleExcluir = (item) => {
    Alert.alert('Excluir', `Deseja excluir ${item.nome}?`, [
      { text:'Cancelar', style:'cancel' },
      { text:'Excluir', style:'destructive', onPress: async ()=> {
          await deleteItem(item.id);
          loadItens();
      }}
    ]);
  };

  const handleAdicionarNaLista = async (item) => {
    await updateItem(item.id, { naLista:true });
    Alert.alert('Sucesso', `${item.nome} adicionado à lista`);
    loadItens();
  };

  const abrirModalEditar = (item) => {
    setItemEditar(item);
    setNovoNome(item.nome);
    setNovaCategoria(item.categoria);
    setNovaQuantidade(item.quantidade.toString());
    setModalEditar(true);
  };

  const confirmarEditar = async () => {
    if(!novoNome.trim()){ Alert.alert('Erro', 'Nome obrigatório'); return; }
    const quantidadeNum = parseInt(novaQuantidade);
    if(isNaN(quantidadeNum) || quantidadeNum < 0){
      Alert.alert('Erro', 'Quantidade inválida');
      return;
    }
    await updateItem(itemEditar.id, { 
      nome: novoNome, 
      categoria: novaCategoria,
      quantidade: quantidadeNum 
    });
    setModalEditar(false);
    loadItens();
  };

  const zerarEstoque = async () => {
    await updateItem(itemEditar.id, { quantidade:0 });
    setModalEditar(false);
    loadItens();
  };

  const formatarCategoria = (cat) => {
    if(!cat) return '';
    return cat.toLowerCase() === 'recorrente' ? 'Recorrente' : 'Esporádico';
  };

  const totalItens = itens.reduce((acc, i)=> acc + i.quantidade, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.total}>Total de itens no estoque: {totalItens}</Text>

      <TextInput
        style={styles.busca}
        placeholder="Buscar item..."
        value={busca}
        onChangeText={setBusca}
      />

      <View style={styles.filtroRow}>
        <TouchableOpacity style={[styles.filtroBtn, filtro==='todos' && styles.filtroAtivo]} onPress={()=>setFiltro('todos')}><Text>Todos</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.filtroBtn, filtro==='recorrente' && styles.filtroAtivo]} onPress={()=>setFiltro('recorrente')}><Text>Recorrente</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.filtroBtn, filtro==='esporadico' && styles.filtroAtivo]} onPress={()=>setFiltro('esporadico')}><Text>Esporádico</Text></TouchableOpacity>
      </View>

      {itensFiltrados.length===0 ? (
        <View style={styles.emptyContainer}><Text style={styles.empty}>Estoque vazio</Text></View>
      ) : (
        <FlatList
          data={itensFiltrados}
          keyExtractor={item=>item.id}
          renderItem={({item})=>(
            <View style={styles.item}>
              <Text style={[styles.itemText, { fontWeight:'bold', fontSize:18, marginBottom:4 }]}>{item.nome}</Text>

              <Text style={{ marginBottom:4 }}>
                <Text style={{ fontWeight:'bold' }}>Categoria: </Text>
                {formatarCategoria(item.categoria)}
              </Text>

              <Text style={{ marginBottom:8 }}>
                <Text style={{ fontWeight:'bold' }}>Valor: </Text>
                {item.minValor != null && item.maxValor != null
                  ? `R$ ${item.minValor.toFixed(2)} - R$ ${item.maxValor.toFixed(2)}`
                  : 'Sem registro de valor'}
              </Text>

              <Text style={{ marginBottom:8 }}>
                <Text style={{ fontWeight:'bold' }}>Quantidade: </Text>{item.quantidade}
              </Text>

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={[styles.smallButtonEditar]}
                  onPress={()=>abrirModalEditar(item)}
                >
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallButtonExcluir]}
                  onPress={()=>handleExcluir(item)}
                >
                  <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallButtonLista, item.naLista && { backgroundColor:'#66bb6a' }]}
                  onPress={item.naLista ? null : ()=>handleAdicionarNaLista(item)}
                  disabled={item.naLista}
                >
                  <Text style={styles.buttonText}>
                    {item.naLista ? 'Na lista' : 'Adicionar à Lista'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal Editar */}
      <Modal visible={modalEditar} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight:'bold', fontSize:18, marginBottom:10 }}>Editar Item</Text>

            <TextInput
              placeholder="Nome"
              value={novoNome}
              onChangeText={setNovoNome}
              style={styles.modalInput}
            />

            <TextInput
              placeholder="Quantidade"
              value={novaQuantidade}
              onChangeText={setNovaQuantidade}
              keyboardType="numeric"
              style={styles.modalInput}
            />

            <Picker
              selectedValue={novaCategoria}
              onValueChange={setNovaCategoria}
              style={{ height:50, width:'100%', marginBottom:20 }}
            >
              <Picker.Item label="Recorrente" value="recorrente"/>
              <Picker.Item label="Esporádico" value="esporadico"/>
            </Picker>

            <TouchableOpacity
              style={styles.modalButtonZerar}
              onPress={zerarEstoque}
            >
              <Text style={styles.buttonText}>Zerar Estoque</Text>
            </TouchableOpacity>

            <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
              <TouchableOpacity style={styles.modalButton} onPress={confirmarEditar}><Text style={styles.buttonText}>Salvar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButtonCancelar]} onPress={()=>setModalEditar(false)}><Text style={styles.buttonText}>Cancelar</Text></TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:20 },
  total:{ fontSize:16, fontWeight:'bold', marginBottom:10 },
  busca:{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:10, marginBottom:10 },
  filtroRow:{ flexDirection:'row', justifyContent:'space-around', marginBottom:10 },
  filtroBtn:{ padding:10, borderWidth:1, borderColor:'#ccc', borderRadius:5 },
  filtroAtivo:{ backgroundColor:'#ddd' },
  emptyContainer:{ flex:1, justifyContent:'center', alignItems:'center' },
  empty:{ fontSize:18, color:'#666' },
  item:{ padding:15, borderWidth:1, borderColor:'#ccc', borderRadius:8, marginBottom:12 },
  itemText:{ fontSize:16, marginBottom:4 },
  buttonsRow:{ flexDirection:'row', justifyContent:'space-between', marginTop:10 },
  smallButtonEditar:{ flex:1, backgroundColor:'#2196F3', padding:10, borderRadius:5, alignItems:'center', justifyContent:'center', marginHorizontal:5 },
  smallButtonExcluir:{ flex:1, backgroundColor:'#f44336', padding:10, borderRadius:5, alignItems:'center', justifyContent:'center', marginHorizontal:5 },
  smallButtonLista:{ flex:1, backgroundColor:'#4CAF50', padding:10, borderRadius:5, alignItems:'center', justifyContent:'center', marginHorizontal:5 },
  buttonText:{ color:'white', fontWeight:'bold', textAlign:'center' },
  modalBackground:{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)' },
  modalContainer:{ width:'85%', backgroundColor:'white', padding:20, borderRadius:10 },
  modalInput:{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:10, marginBottom:10 },
  modalButton:{ flex:1, backgroundColor:'#4CAF50', padding:10, margin:5, borderRadius:5, alignItems:'center', justifyContent:'center' },
  modalButtonCancelar:{ flex:1, backgroundColor:'#888', padding:10, margin:5, borderRadius:5, alignItems:'center', justifyContent:'center' },
  modalButtonZerar:{ width:'100%', backgroundColor:'#2196F3', padding:12, borderRadius:5, alignItems:'center', justifyContent:'center', marginBottom:10 },
});
