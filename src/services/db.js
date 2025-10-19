import AsyncStorage from '@react-native-async-storage/async-storage';

const ITENS_KEY = 'itens';
const COMPRAS_KEY = 'compras';

export const initDB = async () => {
  const itens = await AsyncStorage.getItem(ITENS_KEY);
  if (!itens) await AsyncStorage.setItem(ITENS_KEY, JSON.stringify([]));

  const compras = await AsyncStorage.getItem(COMPRAS_KEY);
  if (!compras) await AsyncStorage.setItem(COMPRAS_KEY, JSON.stringify([]));
};

const gerarId = () => Date.now().toString() + Math.floor(Math.random() * 1000);

export const addItem = async ({
  nome,
  quantidade_total = 0,
  quantidade_lista = 0,
  valorUnitario = null,
  categoria = 'recorrente',
  naLista = false,
}) => {
  const itens = JSON.parse(await AsyncStorage.getItem(ITENS_KEY)) || [];

  if (itens.some(item => item.nome.toLowerCase() === nome.toLowerCase())) {
    throw new Error('Item já cadastrado');
  }

  const id = gerarId();
  const novoItem = {
    id,
    nome,
    quantidade_total: quantidade_total || 0,
    quantidade_lista: quantidade_lista,
    valorUnitario,
    categoria,
    naLista,
  };

  itens.push(novoItem);

  await AsyncStorage.setItem(ITENS_KEY, JSON.stringify(itens));
  return id;
};

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

export const updateItem = async (id, updates) => {
  const itens = JSON.parse(await AsyncStorage.getItem(ITENS_KEY)) || [];
  const index = itens.findIndex(i => i.id === id);
  if (index === -1) throw new Error('Item não encontrado');

  itens[index] = { ...itens[index], ...updates };
  await AsyncStorage.setItem(ITENS_KEY, JSON.stringify(itens));
};

export const registrarCompra = async (itemId, quantidadeComprada, valorUnitario = null) => {
  if (quantidadeComprada <= 0) throw new Error('Quantidade deve ser maior que 0');

  const itens = JSON.parse(await AsyncStorage.getItem(ITENS_KEY)) || [];
  const compras = JSON.parse(await AsyncStorage.getItem(COMPRAS_KEY)) || [];

  const index = itens.findIndex(i => i.id === itemId);
  if (index === -1) throw new Error('Item não encontrado');

  itens[index].quantidade_total = (itens[index].quantidade_total || 0) + quantidadeComprada;
  itens[index].quantidade_lista = 0;
  itens[index].naLista = false;

  await AsyncStorage.setItem(ITENS_KEY, JSON.stringify(itens));

  compras.push({
    id: gerarId(),
    itemId,
    quantidade: quantidadeComprada,
    valorUnitario,
    data: new Date().toISOString(),
  });
  await AsyncStorage.setItem(COMPRAS_KEY, JSON.stringify(compras));
};

export const deleteItem = async (id) => {
  let itens = JSON.parse(await AsyncStorage.getItem(ITENS_KEY)) || [];
  let compras = JSON.parse(await AsyncStorage.getItem(COMPRAS_KEY)) || [];

  itens = itens.filter(item => item.id !== id);
  compras = compras.filter(c => c.itemId !== id);

  await AsyncStorage.setItem(ITENS_KEY, JSON.stringify(itens));
  await AsyncStorage.setItem(COMPRAS_KEY, JSON.stringify(compras));
};

export const limparTudo = async () => {
  await AsyncStorage.setItem(ITENS_KEY, JSON.stringify([]));
  await AsyncStorage.setItem(COMPRAS_KEY, JSON.stringify([]));
};

export const limparListaCompras = async () => {
  const itens = JSON.parse(await AsyncStorage.getItem(ITENS_KEY)) || [];
  const itensAtualizados = itens.map(i => ({ ...i, naLista: false, quantidade_lista: 0 }));
  await AsyncStorage.setItem(ITENS_KEY, JSON.stringify(itensAtualizados));
};
