const {sqlForPartialUpdate} = require('./sql.js')
const { expect } = require("chai");
const { expressError } =require('../expressError.js')

describe("sqlForPartialUpdate", () => {
    it("should generate SQL setCols and values when data is provided", () => {
      const dataToUpdate = {
        firstName: 'Aliya',
        age: 32,
      };
  
      const jsToSql = {
        firstName: 'first_name',
      };
  
      const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
  
      expect(result).to.be.an("object");
      expect(result).to.have.property("setCols").to.be.a("string");
      expect(result).to.have.property("values").to.be.an("array");
  
      expect(result.setCols).to.equal("\"first_name\"=$1, \"age\"=$2");
      expect(result.values).to.deep.equal(['Aliya', 32]);
    });
  
    it("should throw a BadRequestError when no data is provided", () => {
      const dataToUpdate = {};
  
      try {
        sqlForPartialUpdate(dataToUpdate, {});
        // If it doesn't throw an error, fail the test
        expect.fail("Expected Error to be thrown");
      } catch (error) {
        expect(error).to.be.instanceOf(expressError);
        expect(error.message).to.equal("No data");
      }
    });
});  