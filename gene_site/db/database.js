const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const filepath = "db/gene_data.db";

function connectToDatabase() {
  if (fs.existsSync(filepath)) {
    console.log("Connected to the database successfully");
    return new sqlite3.Database(filepath);
  } else {
    const db = new sqlite3.Database(filepath, (error) => {
      if (error) {
        return console.error(error.message);
      }
      createTable(db);
      console.log("Connected to the database successfully");
    });
    return db;
  }
}

function createTable(db) {
  db.exec(`
  CREATE TABLE gene_data
  (
    gene_id text PRIMARY KEY NOT NULL,
    Temp37_effect_size REAL NOT NULL, 
    Temp37_fdr REAL NOT NULL
  )
`);
}

module.exports = connectToDatabase();
//module.exports = db