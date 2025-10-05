import React, { useState, useRef } from 'react';
import { 
  View, TextInput, TouchableOpacity, Text, StyleSheet, FlatList, 
  KeyboardAvoidingView, Platform, Dimensions, Animated, Easing 
} from 'react-native';
import { addItem } from '../services/db';

const { width } = Dimensions.get("window");

export default function AdicionarProdutoScreen() {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [categoria, setCategoria] = useState('recorrente');
  const [historico, setHistorico] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState(null); 
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const showModal = (title, description) => {
    setModalTitle(title);
    setModalDesc(description);
    setModalVisible(true);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    setTimeout(() => hideModal(), 2000);
  };

  const hideModal = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const handleAdd = async () => {
    if (!nome.trim()) {
      showModal('Erro', <Text>Nome obrigatório</Text>);
      return;
    }

    const quantidadeNum = quantidade === '' ? 0 : parseInt(quantidade);
    if (isNaN(quantidadeNum) || quantidadeNum < 0) {
      showModal('Erro', <Text>Quantidade inválida</Text>);
      return;
    }

    try {
      await addItem({
        nome,
        quantidade: quantidadeNum,
        categoria,
        naLista: false,
      });

      const destino = quantidadeNum === 0 ? "Lista de Compras" : "Estoque";
      showModal(
        'Produto adicionado!',
        <Text>
          <Text style={{fontWeight:'bold'}}>{nome}</Text> foi adicionado à {destino}
        </Text>
      );

      setHistorico([{ nome, quantidade: quantidadeNum, categoria }, ...historico]);

      setNome('');
      setQuantidade('');
      setCategoria('recorrente');
    } catch (e) {
      showModal('Erro', <Text>{e.message}</Text>);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex:1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>

        {modalVisible && (
          <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalDesc}>{modalDesc}</Text>
          </Animated.View>
        )}

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Margarina, Arroz, Feijão..."
          placeholderTextColor="#999999"
          value={nome}
          onChangeText={setNome}
          color="#000"
        />

        <Text style={styles.label}>Quantidade</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor="#999999"
          value={quantidade}
          onChangeText={text => setQuantidade(text.replace(/\D/g,''))}
          keyboardType="numeric"
          color="#000"
        />
        <Text style={styles.infoText}>ℹ️ Quantidade 0 → Lista | Maior que 0 → Estoque</Text>

        <Text style={styles.label}>Frequência de Compra</Text>
        <View style={styles.pickerContainer}>
          <TouchableOpacity 
            style={[styles.pickerButton, categoria==='recorrente' && styles.pickerSelected]} 
            onPress={() => setCategoria('recorrente')}
          >
            <Text style={[styles.pickerText, categoria==='recorrente' && styles.pickerTextSelected]}>Recorrente</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.pickerButton, categoria==='esporadico' && styles.pickerSelected]} 
            onPress={() => setCategoria('esporadico')}
          >
            <Text style={[styles.pickerText, categoria==='esporadico' && styles.pickerTextSelected]}>Esporádico</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.infoText}>
          {categoria === 'recorrente' 
            ? 'ℹ️ Produtos que você compra com frequência' 
            : 'ℹ️ Produtos que você não compra com frequência'}
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>Adicionar</Text>
        </TouchableOpacity>

        <Text style={styles.historicoTitle}>Últimos produtos adicionados:</Text>
        {historico.length === 0 ? (
          <Text style={styles.empty}>Nenhum produto adicionado nesta sessão</Text>
        ) : (
          <FlatList
            data={historico}
            keyExtractor={(item,index) => index.toString()}
            style={{maxHeight:300}}
            renderItem={({item}) => {
              const destino = item.quantidade === 0 ? "Lista de Compras" : "Estoque";
              return (
                <View style={styles.historicoItem}>
                  <Text style={styles.itemNome}>🛒 <Text style={{fontWeight:'bold'}}>{item.nome}</Text></Text>
                  <Text style={styles.itemInfo}>
                    Qtd: {item.quantidade}  •  {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}  •  {destino}
                  </Text>
                </View>
              );
            }}
          />
        )}

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:20, backgroundColor:'#f7f7f7' },
  label:{ fontWeight:'bold', fontSize:14, marginBottom:5 },
  input:{ 
    borderWidth:1, 
    borderColor:'#ccc', 
    borderRadius:8, 
    padding:12, 
    marginBottom:10, 
    backgroundColor:'#fff', 
    color:'#000',
    fontSize:14
  },
  infoText:{ fontSize:12, color:'#666', marginBottom:15 },
  pickerContainer:{ flexDirection:'row', justifyContent:'space-between', marginBottom:10 },
  pickerButton:{ 
    width: (width - 60)/2, 
    padding:12, 
    borderWidth:1, 
    borderColor:'#ccc',  
    borderRadius:8, 
    alignItems:'center'
  },
  pickerSelected:{ backgroundColor:'#4CAF50', borderColor:'#4CAF50' },
  pickerText:{ fontSize:14, color:'#000' },
  pickerTextSelected:{ color:'white', fontWeight:'bold' },
  button:{ backgroundColor:'#4CAF50', padding:15, borderRadius:8, alignItems:'center', marginBottom:20 },
  buttonText:{ color:'white', fontWeight:'bold', fontSize:16 },
  historicoTitle:{ fontWeight:'bold', fontSize:16, marginBottom:10 },
  empty:{ color:'#666', fontStyle:'italic', marginBottom:10 },
  historicoItem:{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:10, marginBottom:10, backgroundColor:'#fff' },
  itemNome: { fontWeight:'bold', fontSize:18, marginBottom:4 },
  itemInfo: { fontSize:14, color:'#444' },

  modalContainer:{
    position:'absolute',
    top:0,
    alignSelf:'center',
    backgroundColor:'white',
    padding:15,
    borderRadius:8,
    width: width - 40,
    shadowColor:'#000',
    shadowOffset:{ width:0, height:2 },
    shadowOpacity:0.3,
    shadowRadius:4,
    elevation:5,
    zIndex:1000
  },
  modalTitle:{ fontWeight:'bold', fontSize:16, marginBottom:5 },
  modalDesc:{ fontSize:14, color:'#444' }
});
