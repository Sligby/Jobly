const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
// 

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // checks if there is any data to update
  const keys = Object.keys(dataToUpdate);
  //if no data throws an error 
  if (keys.length === 0) throw new BadRequestError("No data");

  //processes the data into two pieces for an sql update 
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

    //returns object with two properties. setCols a string that can be used in an sql statement
    // to deterimine which columns to update and values with the new values for those columns
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
