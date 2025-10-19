import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  Modal
} from 'react-native';
import { getAllItems, registrarCompra, updateItem } from '../services/db';

const { width } = Dimensions.get('window');

export default function ListaCompraScreen() {
  const [itens, setItens] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [modalCompraVisible, setModalCompraVisible] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [valorCompra, setValorCompra] = useState('');

  const [ordenacao, setOrdenacao] = useState(0);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [toastDesc, setToastDesc] = useState(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;

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
    const listaCompra = all.filter(i => i.naLista === true);
    setItens(listaCompra.map(i => ({
      ...i,
      quantidadeSelecionada: i.quantidade_lista > 0 ? i.quantidade_lista : 1
    })));
  };

  useEffect(() => { loadItens(); }, []);

  const compararItens = (a, b) => {
    switch(ordenacao) {
      case 0: return parseInt(b.id) - parseInt(a.id); 
      case 1: return parseInt(a.id) - parseInt(b.id); 
      case 2: return a.nome.localeCompare(b.nome);    
      case 3: return b.nome.localeCompare(a.nome);  
      default: return parseInt(b.id) - parseInt(a.id);
    }
  };

  const itensFiltrados = itens
    .filter(i => {
      const correspondeFiltro = filtro === 'todos' ? true : i.categoria.toLowerCase() === filtro;
      const correspondeBusca = i.nome.toLowerCase().includes(busca.toLowerCase());
      return correspondeFiltro && correspondeBusca;
    })
    .sort(compararItens);

  const abrirModalCompra = (item) => {
    setItemSelecionado(item);
    setValorCompra('');
    setModalCompraVisible(true);
  };

  const formatarReal = (valor) => {
    let v = valor.replace(/\D/g, '');
    v = (v/100).toFixed(2) + '';
    v = v.replace('.', ',');
    return 'R$ ' + v;
  };

  const handleValorCompraChange = (text) => {
    const numeric = text.replace(/\D/g, '');
    setValorCompra(formatarReal(numeric));
  };

  const confirmarCompra = async () => {
    if (!itemSelecionado) return;

    const valorNum = valorCompra.trim() === ''
      ? null
      : parseFloat(valorCompra.replace(/\D/g, '')) / 100;

    const quantidade = itemSelecionado.quantidadeSelecionada || 1;

    try {
      await registrarCompra(itemSelecionado.id, quantidade, valorNum);
      setModalCompraVisible(false);
      showToast(
        'Sucesso!',
        <Text>
          Produto <Text style={{ fontWeight: 'bold' }}>{itemSelecionado.nome}</Text> comprado.
        </Text>
      );
      setItemSelecionado(null);
      setValorCompra('');
      loadItens();
    } catch (error) {
      setModalCompraVisible(false);
      showToast('Erro', <Text>{error.message}</Text>);
      console.log(error);
    }
  };

  const cancelarCompra = () => {
    setModalCompraVisible(false);
  };

  const removerItem = async (item) => {
    try {
      await updateItem(item.id, { naLista: false, quantidade_lista: 1 });

      await loadItens();

      showToast(
        'Sucesso!',
        <Text>
          Produto <Text style={{ fontWeight: 'bold' }}>{item.nome}</Text> removido da lista.
        </Text>
      );
    } catch (error) {
      showToast('Erro', <Text>Não foi possível remover o item.</Text>);
      console.log('Erro ao remover item:', error);
    }
  };

  const alterarQuantidade = async (itemId, delta) => {
    setItens(prev => prev.map(i => {
      if (i.id === itemId) {
        const novaQtd = Math.max(1, (i.quantidadeSelecionada || 1) + delta);

        updateItem(itemId, { quantidade_lista: novaQtd }).catch(console.log);

        return { ...i, quantidadeSelecionada: novaQtd };
      }
      return i;
    }));
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

  return (
    <KeyboardAvoidingView
      style={{ flex:1 }}
      behavior={Platform.OS==='ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>

        {toastVisible && (
          <Animated.View style={[styles.toastContainer, { transform:[{ translateY: slideAnim }] }]}>
            <Text style={styles.toastTitle}>{toastTitle}</Text>
            <Text style={styles.toastDesc}>{toastDesc}</Text>
          </Animated.View>
        )}

        <TextInput
          style={styles.busca}
          placeholder="Buscar produto..."
          placeholderTextColor="#999999"
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
              <Text style={filtro===f ? { color:'white', fontWeight:'bold' } : { color:'#000' }}>
                {f==='todos'?'Todos':f==='recorrente'?'Recorrente':'Esporádico'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {itensFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>{busca ? 'Produto não encontrado' : 'Lista vazia'}</Text>
          </View>
        ) : (
          <FlatList
            data={itensFiltrados}
            keyExtractor={item=>item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
                  <Text style={[styles.itemText,{ fontWeight:'bold', fontSize:22 }]}>{item.nome}</Text>
                  <View style={{ flexDirection:'row', alignItems:'center' }}>
                    <TouchableOpacity style={styles.stepperBtn} onPress={()=>alterarQuantidade(item.id, -1)}>
                      <Text style={styles.stepperText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.itemText}>{item.quantidadeSelecionada}</Text>
                    <TouchableOpacity style={styles.stepperBtn} onPress={()=>alterarQuantidade(item.id, +1)}>
                      <Text style={styles.stepperText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text>
                  <Text style={{ fontWeight:'bold' }}>Categoria: </Text>
                  {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}
                </Text>
                <Text>
                  <Text style={{ fontWeight:'bold' }}>Valor: </Text>
                  {item.minValor!=null && item.maxValor!=null ? `R$ ${item.minValor.toFixed(2)} - R$ ${item.maxValor.toFixed(2)}` : 'Sem registro de valor'}
                </Text>

                <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop:8 }}>
                  <TouchableOpacity style={styles.smallButtonExcluir} onPress={()=>removerItem(item)}>
                    <Text style={styles.buttonText}>Remover</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={()=>abrirModalCompra(item)}>
                    <Text style={styles.buttonText}>Comprado</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        <Modal
          visible={modalCompraVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={cancelarCompra}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
                  Registrar Compra: {itemSelecionado?.nome}
                </Text>

                <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Valor unitário (opcional)</Text>
                <TextInput
                  placeholder="R$ 0,00"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  value={valorCompra}
                  onChangeText={handleValorCompraChange}
                  style={styles.modalInput}
                  color="#000"
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    style={styles.modalButtonCancelar}
                    onPress={cancelarCompra}
                  >
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={confirmarCompra}
                  >
                    <Text style={styles.buttonText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:20, backgroundColor:'#f7f7f7' },
  busca:{ 
    borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:12, marginBottom:10,
    backgroundColor:'#fff', color:'#000', fontSize:14
  },
  filtroRow:{ flexDirection:'row', justifyContent:'space-between', marginBottom:10 },
  filtroBtn:{ flex:1, paddingVertical:10, borderWidth:1, borderColor:'#ccc', borderRadius:5, marginHorizontal:5, alignItems:'center', backgroundColor:'#fff' },
  filtroAtivo:{ backgroundColor:'#4CAF50', borderColor:'#4CAF50'},
  emptyContainer:{ flex:1, justifyContent:'center', alignItems:'center' },
  empty:{ fontSize:18, color:'#666' },
  item:{ padding:15, borderWidth:1, borderColor:'#ccc', borderRadius:8, marginBottom:12, backgroundColor:'#fff' },
  itemText:{ fontSize:16, color:'#000' },
  stepperBtn:{ width:30, height:30, borderWidth:1, borderColor:'#ccc', borderRadius:5, alignItems:'center', justifyContent:'center', marginHorizontal:5 },
  stepperText:{ fontSize:16, fontWeight:'bold' },
  button:{ flex:1, backgroundColor:'#4CAF50', padding:10, borderRadius:5, alignItems:'center', justifyContent:'center', marginLeft:5 },
  smallButtonExcluir:{ flex:1, backgroundColor:'#f44336', padding:10, borderRadius:5, alignItems:'center', justifyContent:'center', marginRight:5 },
  buttonText:{ color:'white', fontWeight:'bold', textAlign:'center' },
  modalBackground:{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)' },
  modalContainer:{ width:width-40, backgroundColor:'white', padding:20, borderRadius:10 },
  modalInput:{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:12, marginVertical:10, backgroundColor:'#fff', color:'#000', fontSize:14 },
  modalButton:{ flex:1, backgroundColor:'#4CAF50', padding:12, margin:5, borderRadius:5, alignItems:'center', justifyContent:'center' },
  modalButtonCancelar:{ flex:1, backgroundColor:'#888', padding:12, margin:5, borderRadius:5, alignItems:'center', justifyContent:'center' },

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
  }
});
