import express from 'express';
import db from '../db/db.js';
import shortid from 'shortid';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/encurtar', (req, res) => {
  const { original_url, custom_path, max_visits, expiration_date } = req.body;
  const short_id = custom_path || shortid.generate();

  const insertQuery = 'INSERT INTO urls (original_url, short_id, access_count, max_visits, expiration_date) VALUES (?, ?, 0, ?, ?)';

  db.query(insertQuery, [original_url, short_id, max_visits, expiration_date], (err, result) => {
    if (err) {
      console.error('Erro ao encurtar a URL:', err);
      res.status(500).json({ error: 'Erro ao encurtar a URL' });
    } else {
      res.json({ short_url: `http://localhost:3000/api/${short_id}` });
    }
  });
});

router.get('/:short_id', (req, res) => {
  const { short_id } = req.params;
  const selectQuery = 'SELECT original_url, access_count, max_visits, expiration_date FROM urls WHERE short_id = ?';
  const updateQuery = 'UPDATE urls SET access_count = ?, max_visits = ? WHERE short_id = ?';

  db.query(selectQuery, [short_id], (err, result) => {
    if (err) {
      console.error('Erro ao acessar a URL encurtada:', err);
      res.status(500).json({ error: 'Erro ao acessar a URL encurtada' });
    } else if (result.length > 0) {
      const { original_url, access_count, max_visits, expiration_date } = result[0];
      const newAccessCount = access_count + 1;

      if (max_visits !== null && newAccessCount > max_visits) {
        res.status(410).json({ error: 'Este link expirou devido ao número máximo de visitas' });
      } else if (expiration_date && new Date() > new Date(expiration_date)) {
        res.status(410).json({ error: 'Este link expirou devido à data de expiração' });
      } else {
        db.query(updateQuery, [newAccessCount, max_visits, short_id], (updateErr, updateResult) => {
          if (updateErr) {
            console.error('Erro ao atualizar o contador de acessos:', updateErr);
          }
          res.redirect(original_url);
        });
      }
    } else {
      res.status(404).json({ error: 'URL não encontrada' });
    }
  });
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await checkUserExists(username, email);

  if (userExists) {
    return res.status(400).json({ error: 'Usuário ou email já estão em uso.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const insertQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(insertQuery, [username, email, passwordHash], (err, result) => {
    if (err) {
      console.error('Erro no registro de usuário:', err);
      res.status(500).json({ error: 'Erro no registro de usuário' });
    } else {
      res.status(200).json({ message: 'Registro bem-sucedido! Faça login para acessar sua conta.' });
    }
  });
});

async function checkUserExists(username, email) {
  const selectQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
  try {
    const [rows] = await db.promise().query(selectQuery, [username, email]);
    return rows.length > 0;
  } catch (err) {
    console.error('Erro ao verificar a existência de usuário:', err);
    return false; 
  }
}

router.post('/login', async (req, res) => {
  
  const { username, password } = req.body;

  const userExists = await checkUserExists(username);

  if (!userExists) {
    return res.status(401).json({ error: 'Usuário não encontrado' });
  }

  
  const selectQuery = 'SELECT * FROM users WHERE username = ?';
  try {
    const [rows] = await db.promise().query(selectQuery, [username]);

    const user = rows[0];

    if (await bcrypt.compare(password, user.password)) {
      
      res.status(200).json({ message: 'Login bem-sucedido' });
    } else {
     
      res.status(401).json({ error: 'Credenciais incorretas' });
    }
  } catch (err) {
    console.error('Erro no processo de login:', err);
    res.status(500).json({ error: 'Erro no processo de login' });
  }
});

export default router;