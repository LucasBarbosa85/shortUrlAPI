const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const secretKey = 'secreto';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'url_shortener_db',
});

db.connect(function (err) {
  if (err) {
    console.error('Erro ao conectar ao banco de dados: ' + err.message);
  } else {
    console.log('Conectado com sucesso!');
  }
});

function generateShortURL() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const shortURLLength = 6;

  let shortURL = '';
  for (let i = 0; i < shortURLLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    shortURL += characters.charAt(randomIndex);
  }

  return shortURL;
}

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  jwt.verify(token.replace('Bearer ', ''), secretKey, function (err, decoded) {
    if (err) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    req.decoded = decoded;
    next();
  });
}

app.post('/api/login', function (req, res) {
  const { username, password } = req.body;


  const query = 'SELECT * FROM user WHERE username = ? AND password = ?';

  db.query(query, [username, password], function (err, results) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao verificar o login' });
    }

    if (results.length === 1) {
      const userId = results[0].id;
      const token = jwt.sign({ username, userId }, secretKey, { expiresIn: '1h' });

      res.json({ token, userId });
    } else {
      res.status(401).json({ message: 'Credenciais inválidas' });
    }
  });
});

app.post('/api/shorten', verifyToken, function (req, res) {
  const { originalURL, customPath, maxVisits } = req.body;
  const userId = req.decoded.userId;

  const shortURL = generateShortURL();

  const query = "INSERT INTO urls (originalURL, shortURL, customPath, userId, maxVisitsCount, visitCount, isInvalid, expirationDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [originalURL, shortURL, customPath, userId, maxVisits, 0, 0, req.body.expirationDate];

  db.query(query, values, function (err, results) {
    if (err) {
      console.error('Erro no servidor:', err);
      return res.status(500).json({ message: 'Erro ao encurtar a URL' });
    }

    res.json({ success: true, message: 'URL encurtada com sucesso' });
  });
});


app.get('/api/shorturls', verifyToken, function (req, res) {
  const userId = req.decoded.userId;

  const query = "SELECT * FROM urls WHERE userId = ?";

  db.query(query, [userId], function (err, results) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar URLs curtas' });
    }

    const shortURLs = results.map(function (row) {
      return {
        id: row.id,
        shortURL: row.shortURL,
        customPath: row.customPath,
        maxVisitsCount: row.maxVisitsCount,
        visitCount: row.visitCount,
        isInvalid: row.isInvalid,
        expirationDate: row.expirationDate, 
      };
    });

    res.json({ success: true, urls: shortURLs });
  });
});


app.get('/:shortURL', function (req, res) {
  const { shortURL } = req.params;

  const query = "SELECT originalURL, maxVisitsCount, visitCount, isInvalid, expirationDate FROM urls WHERE shortURL = ?";

  db.query(query, [shortURL], function (err, results) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar URL original' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'URL não encontrada' });
    }

    const originalURL = results[0].originalURL;
    const maxVisitsCount = results[0].maxVisitsCount;
    const visitCount = results[0].visitCount;
    const isInvalid = results[0].isInvalid;
    const expirationDate = results[0].expirationDate;

    if ((maxVisitsCount && visitCount >= maxVisitsCount)) {
      return res.status(404).json({ message: 'URL Expirada' });
    }

    if ((expirationDate && moment().isAfter(expirationDate))) {
      return res.status(404).json({ message: 'URL Expirada por data' });
    }

    if (isInvalid ) {
      return res.status(404).json({ message: 'URL foi invalidada' });
    }


    db.query("UPDATE urls SET visitCount = visitCount + 1 WHERE shortURL = ?", [shortURL], function (err) {
      if (err) {
        console.error('Erro ao atualizar a contagem de visitas:', err);
      }
    });

    res.redirect(originalURL);
  });
});

app.post('/api/invalidate/:linkId', verifyToken, function (req, res) {
  const { linkId } = req.params;
  const userId = req.decoded.userId;

  db.query("SELECT id FROM urls WHERE id = ? AND userId = ?", [linkId, userId], function (err, results) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao verificar a propriedade do link' });
    }

    if (results.length === 0) {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }

    db.query("UPDATE urls SET isInvalid = 1 WHERE id = ?", [linkId], function (err) {
      if (err) {
        console.error('Erro ao invalidar o link:', err);
        return res.status(500).json({ message: 'Erro ao invalidar o link' });
      }

      res.json({ success: true, message: 'Link invalidado com sucesso' });
    });
  });
});

app.listen(port, function () {
  console.log(`Servidor rodando na porta ${port}`);
});