const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Criar novo item
const criarItem = async (req, res) => {
  const { nome, foto_url, categoriaId, recorrente, quantidade_atual } = req.body;
  const usuarioId = req.usuarioId;

  try {
    const item = await prisma.item.create({
      data: {
        nome,
        foto_url,
        categoriaId: categoriaId || null,
        recorrente: recorrente || false,
        quantidade_atual: quantidade_atual || 0,
        usuarioId
      }
    });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao criar item', detalhes: err.message });
  }
};

// Listar itens do usuário
const listarItens = async (req, res) => {
  const usuarioId = req.usuarioId;
  try {
    const itens = await prisma.item.findMany({
      where: { usuarioId },
      include: { registros_compra: true, categoria: true }
    });
    res.json(itens);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao listar itens', detalhes: err.message });
  }
};

// Atualizar item
const atualizarItem = async (req, res) => {
  const { id } = req.params;
  const { nome, foto_url, categoriaId, recorrente, quantidade_atual, preco_minimo, preco_maximo } = req.body;

  try {
    const itemAtualizado = await prisma.item.update({
      where: { id },
      data: {
        nome,
        foto_url,
        categoriaId: categoriaId || null,
        recorrente,
        quantidade_atual,
        preco_minimo,
        preco_maximo
      }
    });
    res.json(itemAtualizado);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao atualizar item', detalhes: err.message });
  }
};

// Deletar item
const deletarItem = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.item.delete({ where: { id } });
    res.json({ status: 'Item deletado com sucesso' });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao deletar item', detalhes: err.message });
  }
};

// Registrar compra
const registrarCompra = async (req, res) => {
  const { id } = req.params;
  const { quantidade, preco_unitario, notas } = req.body;
  const usuarioId = req.usuarioId;

  try {
    const compra = await prisma.purchaseRecord.create({
      data: {
        itemId: id,
        usuarioId,
        quantidade,
        preco_unitario,
        preco_total: quantidade * preco_unitario,
        notas: notas || ''
      }
    });

    const item = await prisma.item.update({
      where: { id },
      data: {
        quantidade_atual: { increment: quantidade }
      }
    });

    res.json({ compra, item });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao registrar compra', detalhes: err.message });
  }
};

module.exports = { criarItem, listarItens, atualizarItem, deletarItem, registrarCompra };
