 // Carrega as configurações do arquivo .env
require('dotenv').config();

// Importa as bibliotecas
const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');

// Cria a aplicação
const app = express();

// Permite receber dados JSON e acessar a API pelo frontend
app.use(cors());
app.use(express.json());

// Configura a conexão com o banco de dados
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// POST: cadastra uma nova tarefa
app.post('/tarefas', async (req, res) => {
    // Recebe os dados enviados pelo frontend
    const { nome, descricao, responsavel, data_tarefa, concluido } = req.body;

    try {
        const conn = await pool.getConnection();

        // Comando SQL para inserir uma tarefa
        const sql = `INSERT INTO tarefas
        (nome, descricao, responsavel, data_tarefa, concluido)
        VALUES (?, ?, ?, ?, ?)`;

        // Executa o cadastro no banco
        await conn.query(sql, [
            nome, descricao, responsavel, data_tarefa, concluido ?? false
        ]);

        conn.release(); // Libera a conexão
        res.status(201).json({ mensagem: 'Tarefa cadastrada!' });

    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

// GET: consulta uma tarefa pelo ID
app.get('/tarefas/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();

        // Busca a tarefa com o ID informado na URL
        const dados = await conn.query(
            'SELECT * FROM tarefas WHERE id = ?', [req.params.id]
        );

        conn.release();
        res.json(dados); // Retorna os dados encontrados

    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

// GET: lista tarefas dentro de um período
app.get('/tarefas', async (req, res) => {
    // Recebe as datas enviadas na URL
    const { inicio, fim } = req.query;

    try {
        const conn = await pool.getConnection();

        // Busca tarefas entre a data inicial e a final
        const dados = await conn.query(
            `SELECT * FROM tarefas
            WHERE data_tarefa BETWEEN ? AND ?`,
            [inicio, fim]
        );

        conn.release();
        res.json(dados); // Retorna a lista de tarefas

    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

// PUT: atualiza uma tarefa pelo ID
app.put('/tarefas/:id', async (req, res) => {
    // Recebe os novos dados da tarefa
    const { nome, descricao, responsavel, data_tarefa, concluido } = req.body;

    try {
        const conn = await pool.getConnection();

        // Atualiza os campos da tarefa no banco
        await conn.query(
            `UPDATE tarefas SET nome=?, descricao=?, responsavel=?,
            data_tarefa=?, concluido=? WHERE id=?`,
            [nome, descricao, responsavel, data_tarefa, concluido, req.params.id]
        );

        conn.release();
        res.json({ mensagem: 'Tarefa atualizada!' });

    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

// DELETE: exclui uma tarefa pelo ID
app.delete('/tarefas/:id', async (req, res) => {
    try {
        const conn = await pool.getConnection();

        // Remove a tarefa que possui o ID informado
        await conn.query(
            'DELETE FROM tarefas WHERE id = ?', [req.params.id]
        );

        conn.release();
        res.json({ mensagem: 'Tarefa excluída!' });

    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
