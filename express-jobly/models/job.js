
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");


// associated functions for jobs
class Job {
    static async create({title, salary, equity, company_handle}){
       const duplicateCheck = await db.query(
        `SELECT title
        FROM jobs
        WHERE title =$1 AND company_handle =$2`,
        [title, company_handle]
       )
       
        if (duplicateCheck.rows[0])
            throw new BadRequestError(`Duplicate job: ${title}`);
        
            const result = await db.query(
                `INSERT INTO jobs
                 (title, salary, equity, company_handle)
                 VALUES ($1, $2, $3, $4)
                 RETURNING title, salary, equity, company_handle`,
              [
                title,
                salary,
                equity,
                company_handle
              ],
          );
          const job = result.rows[0];
      
          return job;

    }
     /** Find all jobs.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

      static async findAll({ title, minSalary, maxSalary }) {
        let query = `SELECT id,
                          title,
                          salary,
                          equity,
                          company_handle AS "companyHandle"
                   FROM jobs`;
    
        let values = [];
    
        // Construct the WHERE clause based on the provided filters
        const whereClauses = [];
    
        if (title) {
          whereClauses.push(`LOWER(title) LIKE $${values.length + 1}`);
          values.push(`%${title.toLowerCase()}%`);
        }
    
        if (minSalary !== undefined) {
          whereClauses.push(`salary >= $${values.length + 1}`);
          values.push(minSalary);
        }
    
        if (maxSalary !== undefined) {
          whereClauses.push(`salary <= $${values.length + 1}`);
          values.push(maxSalary);
        }
    
        if (whereClauses.length > 0) {
          query += ` WHERE ${whereClauses.join(" AND ")}`;
        }
    
        const jobsRes = await db.query(query, values);
        return jobsRes.rows;
      }

    //   get a job by id
    // 
    static async get(id) {
        const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
          [id]
        );
      
        const job = jobRes.rows[0];
      
        if (!job) throw new NotFoundError(`No job with ID: ${id}`);
      
        return job;
      }

    //   update job data
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
          data,
          {
            title: "title",
            salary: "salary",
            equity: "equity",
            companyHandle: "company_handle",
          }
        );
        const idVarIdx = "$" + (values.length + 1);
      
        const querySql = `UPDATE jobs 
                          SET ${setCols} 
                          WHERE id = ${idVarIdx} 
                          RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];
      
        if (!job) throw new NotFoundError(`No job with ID: ${id}`);
      
        return job;
      }

    //   remove specific job
    static async remove(id) {
        const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
          [id]
        );
        const job = result.rows[0];
      
        if (!job) throw new NotFoundError(`No job with ID: ${id}`);
      }
            

    }   

    module.exports = {Job}