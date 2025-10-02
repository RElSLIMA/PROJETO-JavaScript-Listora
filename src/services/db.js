import AsyncStorage from '@react-native-async-storage/async-storage';

const ITENS_KEY = 'itens';
const COMPRAS_KEY = 'compras';

// Inicializa os dados
export const initDB = async () => {
  const itens = await AsyncStorage.getItem(ITENS_KEY);
  if (!itens) await AsyncStorage.setItem(ITENS_KEY, JSON.stringify([]));

  const compras = await AsyncStorage.getItem(COMPRAS_KEY);
  if (!compras) await AsyncStorage.setItem(COMPRAS_KEY, JSON.stringify([]));
};

// Gera ID único simples
const gerarId = () => Date.now().toString() + Math.floor(Math.random() * 1000);

// --- Adiciona item ---
export const addItem = async ({
  nome,
  quantidade = 0,
  valorUnitario = null,
  categoria = 'recorrente',
  naLista = false,
}) => {
  const itens = JSON.parse(await AsyncStorage.getItem(ITENS_KEY)) || [];

  // Verifica nome único
  if (itens.some(item => item.nome.toLowerCase() === nome.toLowerCase())) {
    throw new Error('Item já cadastrado');
  }

  const id = gerarId();
  const novoItem = { id, nome, quantidade, valorUnitario, categoria, naLista };
  itens.push(novoItem);

  await AsyncStorage.setItem(ITENS_KEY, JSON.stringify(itens));
  return id;
};

// --- Busca todos os itens (com min/max valor) ---
export const getAllItems = async () => {
  const itens = JSON.parse(await AsyncStorage.getItem(ITENS_KEY)) || [];
  const compras = JSON.parse(await AsyncStorage.getItem(COMPRAS_KEY)) || [];

  return itens.map(item => {
    const registros = compras.filter(c => c.itemId === item.id);
    const valores = registros.map(r => r.valorUnitario).filter(v => v != null);
    const minValor = valores.length > 0 ? Math.min(...valores) : null;
    const maxValor = valores.length > 0 ? Math.max(...valores) : null;
    return { ...item, minValor, maxValor };
  });
};

// --- Atualiza item ---
export const updateItem = async (id, { nome, quantidade, categoria, naLista }) => {
  const itens = JSON.parse(await AsyncStorage.getItem(ITENS_KEY)) || [];
  const index = itens.findIndex(i => i.id === id);
  if (index > -1) {
    itens[index] = {
      ...itens[index],
      ...(nome !== undefined ? { nome } : {}),
      ...(quantidade !== undefined ? { quantidade } : {}),
      ...(categoria !== undefined ? { categoria } : {}),
      ...(naLista !== undefined ? { naLista } : {}),
    };
    await AsyncStorage.setItem(ITENS_KEY, JSON.stringify(itens));
  }
};

// --- Registra compra ---
export const registrarCompra = async (itemId, quantidadeComprada, valorUnitario = null) => {
  if (quantidadeComprada <= 0) throw new Error('Quantidade deve ser maior que 0');

  const itens = JSON.parse(await AsyncStorage.getItem(ITENS_KEY)) || [];
  const compras = JSON.parse(await AsyncStorage.getItem(COMPRAS_KEY)) || [];

  const index = itens.findIndex(i => i.id === itemId);
  if (index === -1) throw new Error('Item não encontrado');

  // Atualiza quantidade no estoque
  itens[index].quantidade = (itens[index].quantidade || 0) + quantidadeComprada;
  itens[index].naLista = false; // remove da lista de compra
  await AsyncStorage.setItem(ITENS_KEY, JSON.stringify(itens));

  // Adiciona registro de compra
  compras.push({
    id: gerarId(),
    itemId,
    quantidade: quantidadeComprada,
    valorUnitario,
    data: new Date().toISOString(),
  });
  await AsyncStorage.setItem(COMPRAS_KEY, JSON.stringify(compras));
};

// --- Exclui item ---
export const deleteItem = async (id) => {
  let itens = JSON.parse(await AsyncStorage.getItem(ITENS_KEY)) || [];
  let compras = JSON.parse(await AsyncStorage.getItem(COMPRAS_KEY)) || [];

  itens = itens.filter(item => item.id !== id);
  compras = compras.filter(c => c.itemId !== id);

  await AsyncStorage.setItem(ITENS_KEY, JSON.stringify(itens));
  await AsyncStorage.setItem(COMPRAS_KEY, JSON.stringify(compras));
};
