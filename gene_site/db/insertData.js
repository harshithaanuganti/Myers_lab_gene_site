const fs = require("fs");
const { parse } = require("csv-parse");
const db = require('./database.js');

fs.createReadStream("db/data.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {
    db.serialize(function () {
      db.run(
        `INSERT INTO gene_data VALUES (?, ?, ? )`,
        [row[0], row[1], row[2]],
        function (error) {
          if (error) {
            return console.log(error.message);
          }
          console.log(`Inserted a row with the id: ${this.lastID}`);
        }
      );
    });
  });