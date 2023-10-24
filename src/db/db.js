import mysql from 'mysql2';

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'url_shortener_db',
  connectionLimit: 10, 
});


(async () => {
  try {
    await db.promise().getConnection(); 
    console.log('Conectado ao banco de dados');
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  }
})();

export default db;