import React, { useState, useRef } from 'react';
import { 
  View, TouchableOpacity, Text, StyleSheet, Modal, Animated, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { limparTudo } from '../services/db';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [toastDesc, setToastDesc] = useState('');
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

  const confirmarLimparBanco = async () => {
    try {
      await limparTudo();
      setModalVisible(false);
      showToast('Sucesso!', 'Todos os registros foram apagados!');
    } catch (error) {
      setModalVisible(false);
      showToast('Erro', 'Não foi possível apagar os registros.');
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>

      {toastVisible && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.toastTitle}>{toastTitle}</Text>
          <Text style={styles.toastDesc}>{toastDesc}</Text>
        </Animated.View>
      )}

      <TouchableOpacity
        style={styles.trash}
        onPress={() => setModalVisible(true)}>
        <Ionicons name="trash-sharp" size={30} color="black" />
      </TouchableOpacity>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdicionarProduto')}>
          <Text style={styles.buttonText}>Adicionar Produto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ListaCompra')}>
          <Text style={styles.buttonText}>Lista de Compras</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Estoque')}>
          <Text style={styles.buttonText}>Estoque</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              Deseja apagar todos os produtos registrados?
            </Text>

            <View style={{ flexDirection: 'row', justifyContent:'space-between' }}>
              <TouchableOpacity
                style={styles.modalButtonCancelar}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Não</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={confirmarLimparBanco}
              >
                <Text style={styles.buttonText}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent:'center', alignItems:'center' },
  trash: { position: 'absolute', top: 40, right: 20 },
  buttonsContainer: { width: '80%', justifyContent:'center', alignItems:'center' },
  button: {
    backgroundColor:'#4CAF50',
    paddingVertical:20,
    paddingHorizontal:30,
    borderRadius:10,
    width:'100%',
    marginVertical:10,
    alignItems:'center',
  },
  buttonText:{ color:'white', fontSize:18, fontWeight:'bold' },

  modalBackground:{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },
  modalContainer:{ width:width-40, backgroundColor:'white', borderRadius:10, padding:20 },
  modalText:{ fontSize:18, textAlign:'center', marginBottom:20 },
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
  toastDesc:{ fontSize:14, color:'#444' }
});
