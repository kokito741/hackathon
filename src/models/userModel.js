const pool = require('../config/db');

const User = {
  async create({name,email,password}) {
    const [r] = await pool.execute(
      'INSERT INTO users (name,email,password) VALUES (?,?,?)',
      [name,email,password]
    );
    return {id:r.insertId,name,email};
  },

  async findById(id){
    const [rows] = await pool.query('SELECT id,name,email FROM users WHERE id=?',[id]);
    return rows[0];
  },

  async findAll(){
    const [rows] = await pool.query('SELECT id,name,email FROM users');
    return rows;
  },

  async findByEmail(email){
    const [rows] = await pool.query('SELECT * FROM users WHERE email=?',[email]);
    return rows[0];
  }
};

module.exports = User;