import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, TextInput, Modal, StyleSheet, Dimensions, Animated,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAllItems, updateItem, deleteItem } from '../services/db';

const { width } = Dimensions.get('window');

export default function EstoqueScreen() {
  const [itens, setItens] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [modalEditar, setModalEditar] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [itemEditar, setItemEditar] = useState(null);
  const [itemExcluir, setItemExcluir] = useState(null);
  const [novoNome, setNovoNome] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('recorrente');
  const [novaQuantidade, setNovaQuantidade] = useState('0');

  const [toastVisible, setToastVisible] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [toastDesc, setToastDesc] = useState(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const [ordenacao, setOrdenacao] = useState(0);

  const showToast = (title, message) => {
    setToastTitle(title);
    setToastDesc(message);
    setToastVisible(true);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => hideToast(), 2000);
  };

  const hideToast = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setToastVisible(false));
  };

  const loadItens = async () => {
    const all = await getAllItems();
    const estoque = all
      .filter(i => i.naLista === false)
      .sort((a, b) => parseInt(b.id) - parseInt(a.id));
    setItens(estoque);
  };

  useEffect(() => { loadItens(); }, []);

  const itensFiltrados = itens.filter(i => {
    const correspondeFiltro = filtro==='todos' ? true : i.categoria===filtro;
    const correspondeBusca = i.nome.toLowerCase().includes(busca.toLowerCase());
    return correspondeFiltro && correspondeBusca;
  }).sort((a, b) => {
    if (ordenacao === 0) return parseInt(b.id) - parseInt(a.id);
    if (ordenacao === 1) return parseInt(a.id) - parseInt(b.id);
    if (ordenacao === 2) return a.nome.localeCompare(b.nome);
    if (ordenacao === 3) return b.nome.localeCompare(a.nome);
  });

  const totalItens = itensFiltrados.reduce((acc, i)=> acc + i.quantidade, 0);
  const tituloTotal = filtro==='todos'
    ? `Total de produtos no estoque: ${totalItens}`
    : `Total de produtos ${filtro==='recorrente'?'recorrentes':'esporádicos'}: ${totalItens}`;

  const formatarCategoria = (cat) => {
    if(!cat) return '';
    return cat.toLowerCase() === 'recorrente' ? 'Recorrente' : 'Esporádico';
  };

  const alternarOrdenacao = () => setOrdenacao((ordenacao + 1) % 4);

  const textoOrdenacao = () => {
    switch(ordenacao){
      case 0: return 'Mais recentes ↑';
      case 1: return 'Mais antigos ↓';
      case 2: return 'Alfabético A-Z';
      case 3: return 'Alfabético Z-A';
    }
  };

  const abrirModalEditar = (item) => {
    setItemEditar(item);
    setNovoNome(item.nome);
    setNovaCategoria(item.categoria);
    setNovaQuantidade(item.quantidade.toString());
    setModalEditar(true);
  };

  const confirmarEditar = async () => {
    if (!novoNome.trim()) { 
      setModalEditar(false);
      showToast('Erro', 'Nome obrigatório'); 
      return; 
    }

    const quantidadeNum = parseInt(novaQuantidade);
    if (isNaN(quantidadeNum) || quantidadeNum < 0) { 
      setModalEditar(false);
      showToast('Erro', 'Quantidade inválida'); 
      return; 
    }

    try {
      await updateItem(itemEditar.id, { nome: novoNome, categoria: novaCategoria, quantidade: quantidadeNum });
      setModalEditar(false);
      showToast('Sucesso', `${novoNome} atualizado`);
      loadItens();
    } catch (error) {
      setModalEditar(false); 
      if (error.message.includes('outro item com esse nome')) {
        showToast('Erro', 'Já existe outro item com esse nome');
      } else {
        showToast('Erro', 'Não foi possível atualizar o item');
        console.log(error);
      }
    }
  };

  const zerarEstoque = async () => {
    await updateItem(itemEditar.id, { quantidade:0 });
    setModalEditar(false);
    showToast('Sucesso', `${itemEditar.nome} teve seu estoque zerado`);
    loadItens();
  };

  const abrirModalExcluir = (item) => {
    setItemExcluir(item);
    setModalExcluir(true);
  };

  const confirmarExcluir = async () => {
    await deleteItem(itemExcluir.id);
    setModalExcluir(false);
    showToast('Sucesso', `${itemExcluir.nome} excluído`);
    loadItens();
  };

  const handleAdicionarNaLista = async (item) => {
    await updateItem(item.id, { naLista:true });
    showToast('Sucesso', `${item.nome} adicionado à lista`);
    loadItens();
  };

  return (
    <View style={styles.container}>

      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { transform:[{ translateY: slideAnim }] }]}>
          <Text style={styles.toastTitle}>{toastTitle}</Text>
          <Text style={styles.toastDesc}>{toastDesc}</Text>
        </Animated.View>
      )}

      <Text style={styles.total}>{tituloTotal}</Text>

      <TextInput
        style={styles.busca}
        placeholder="Buscar produto..."
        placeholderTextColor="#999"
        value={busca}
        onChangeText={setBusca}
        color="#000"
      />

      <TouchableOpacity style={styles.ordenacaoBtnGrande} onPress={alternarOrdenacao}>
        <Text style={styles.ordenacaoBtnText}>Ordenar: {textoOrdenacao()}</Text>
      </TouchableOpacity>

      <View style={styles.filtroRow}>
        {['todos','recorrente','esporadico'].map((f, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.filtroBtn, filtro===f && styles.filtroAtivo]}
            onPress={()=>setFiltro(f)}
          >
            <Text style={filtro===f ? { color:'white', fontWeight:'bold' } : {}}>
              {f==='todos'?'Todos':f==='recorrente'?'Recorrente':'Esporádico'}
            </Text>
          </TouchableOpacity>
        ))}
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
              <Text style={{ marginBottom:4 }}><Text style={{ fontWeight:'bold' }}>Categoria: </Text>{formatarCategoria(item.categoria)}</Text>
              <Text style={{ marginBottom:8 }}><Text style={{ fontWeight:'bold' }}>Valor: </Text>{item.minValor != null && item.maxValor != null ? `R$ ${item.minValor.toFixed(2)} - R$ ${item.maxValor.toFixed(2)}` : 'Sem registro de valor'}</Text>
              <Text style={{ marginBottom:8 }}><Text style={{ fontWeight:'bold' }}>Quantidade: </Text>{item.quantidade}</Text>

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.smallButtonExcluir}
                  onPress={()=>abrirModalExcluir(item)}
                >
                  <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.smallButtonEditar}
                  onPress={()=>abrirModalEditar(item)}
                >
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.smallButtonLista, item.naLista && { backgroundColor:'#66bb6a' }]}
                  onPress={item.naLista ? null : ()=>handleAdicionarNaLista(item)}
                  disabled={item.naLista}
                >
                  <Text style={styles.buttonText}>{item.naLista ? 'Na lista' : 'Adicionar à Lista'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalEditar} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
                Editar Item
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Nome</Text>
                <TextInput
                  placeholder="Nome"
                  placeholderTextColor="#999"
                  value={novoNome}
                  onChangeText={setNovoNome}
                  style={styles.modalInput}
                  color="#000"
                />

                <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Quantidade</Text>
                <TextInput
                  placeholder="Quantidade"
                  placeholderTextColor="#999"
                  value={novaQuantidade}
                  onChangeText={setNovaQuantidade}
                  keyboardType="numeric"
                  style={styles.modalInput}
                  color="#000"
                />

                <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Categoria</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 20,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.pickerButton,
                      novaCategoria === 'recorrente' && styles.pickerSelected,
                    ]}
                    onPress={() => setNovaCategoria('recorrente')}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        novaCategoria === 'recorrente' && styles.pickerTextSelected,
                      ]}
                    >
                      Recorrente
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.pickerButton,
                      novaCategoria === 'esporadico' && styles.pickerSelected,
                    ]}
                    onPress={() => setNovaCategoria('esporadico')}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        novaCategoria === 'esporadico' && styles.pickerTextSelected,
                      ]}
                    >
                      Esporádico
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.modalButtonZerar} onPress={zerarEstoque}>
                  <Text style={styles.buttonText}>Zerar Estoque</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    style={styles.modalButtonCancelar}
                    onPress={() => setModalEditar(false)}
                  >
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalButton} onPress={confirmarEditar}>
                    <Text style={styles.buttonText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={modalExcluir} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ fontSize:16, marginBottom:20 }}>
              Deseja excluir <Text style={{ fontWeight:'bold' }}>{itemExcluir?.nome}</Text>?
            </Text>
            <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
              <TouchableOpacity style={styles.modalButtonExcluirModal} onPress={confirmarExcluir}>
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonCancelar} onPress={()=>setModalExcluir(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
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
  busca:{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:12, marginBottom:10, backgroundColor:'#fff', color:'#000' },
  filtroRow:{ flexDirection:'row', justifyContent:'space-between', marginBottom:10 },
  filtroBtn:{ flex:1, paddingVertical:10, borderWidth:1, borderColor:'#ccc', borderRadius:5, marginHorizontal:5, alignItems:'center' },
  filtroAtivo:{ backgroundColor:'#4CAF50', borderColor:'#4CAF50' },
  emptyContainer:{ flex:1, justifyContent:'center', alignItems:'center' },
  empty:{ fontSize:18, color:'#666' },
  item:{ padding:15, borderWidth:1, borderColor:'#ccc', borderRadius:8, marginBottom:12, backgroundColor:'#fff' },
  itemText:{ fontSize:16 },
  buttonsRow:{ flexDirection:'row', justifyContent:'space-between', marginTop:10 },
  smallButtonEditar:{ flex:1, backgroundColor:'#2196F3', padding:10, borderRadius:5, alignItems:'center', justifyContent:'center', marginHorizontal:5 },
  smallButtonExcluir:{ flex:1, backgroundColor:'#f44336', padding:10, borderRadius:5, alignItems:'center', justifyContent:'center', marginHorizontal:5 },
  smallButtonLista:{ flex:1, backgroundColor:'#4CAF50', padding:10, borderRadius:5, alignItems:'center', justifyContent:'center', marginHorizontal:5 },
  buttonText:{ color:'white', fontWeight:'bold', textAlign:'center' },
  modalBackground:{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)' },
  modalContainer:{ width:'85%', backgroundColor:'white', padding:20, borderRadius:10 },
  modalInput:{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:12, marginBottom:10, backgroundColor:'#fff', color:'#000' },
  modalButton:{ flex:1, backgroundColor:'#4CAF50', padding:12, margin:5, borderRadius:5, alignItems:'center', justifyContent:'center' },
  modalButtonCancelar:{ flex:1, backgroundColor:'#888', padding:12, margin:5, borderRadius:5, alignItems:'center', justifyContent:'center' },
  modalButtonZerar:{ width:'100%', backgroundColor:'#2196F3', padding:12, borderRadius:5, alignItems:'center', justifyContent:'center', marginBottom:10 },
  modalButtonExcluirModal:{ flex:1, backgroundColor:'#f44336', padding:12, margin:5, borderRadius:5, alignItems:'center', justifyContent:'center' },

  toastContainer:{
    position:'absolute',
    top:0,
    alignSelf:'center',
    backgroundColor:'white',
    padding:15,
    borderRadius:8,
    width: width-40,
    shadowColor:'#000',
    shadowOffset:{ width:0, height:2 },
    shadowOpacity:0.3,
    shadowRadius:4,
    elevation:5,
    zIndex:1000
  },
  toastTitle:{ fontWeight:'bold', fontSize:16, marginBottom:5 },
  toastDesc:{ fontSize:14, color:'#444' },

  ordenacaoBtnGrande:{
    backgroundColor:'#4CAF50',
    paddingVertical:10, 
    borderRadius:5,
    alignItems:'center',
    marginBottom:10
  },
  ordenacaoBtnText:{
    color:'white',
    fontWeight:'bold',
    fontSize:14
  },
  pickerButton:{
    flex:1,
    padding:12,
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:8,
    alignItems:'center',
    marginHorizontal:5
  },
  pickerSelected:{ backgroundColor:'#4CAF50', borderColor:'#4CAF50' },
  pickerText:{ fontSize:14 },
  pickerTextSelected:{ color:'white', fontWeight:'bold' }
});
