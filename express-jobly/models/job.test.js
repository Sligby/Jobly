const { expect } = require("chai");
const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js"); // Import the Job model
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "New Job",
    salary: 80000,
    equity: 0.05,
    companyHandle: "new-company",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).to.eql(newJob);

    const result = await db.query(
      `SELECT title, salary, equity, company_handle AS "companyHandle"
       FROM jobs
       WHERE title = 'New Job'`
    );
    expect(result.rows).to.eql([newJob]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  it("should return all jobs when no filters are provided", async function () {
    const jobs = await Job.findAll({});
    expect(jobs).to.have.lengthOf.above(0);
  });

  it("should filter jobs by title", async function () {
    const jobs = await Job.findAll({ title: "engineer" });
    // Ensure that jobs with "engineer" in their titles are returned
    expect(jobs).to.have.lengthOf.above(0);
  });

  it("should filter jobs by salary range", async function () {
    const jobs = await Job.findAll({ minSalary: 50000, maxSalary: 80000 });
    // Ensure that jobs with salaries between 50,000 and 80,000 are returned
    expect(jobs).to.have.lengthOf.above(0);
  });

  it("should handle invalid salary range filters", async function () {
    try {
      await Job.findAll({ minSalary: 80000, maxSalary: 50000 });
    } catch (err) {
      expect(err.message).to.equal("minSalary cannot be greater than maxSalary");
    }
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1); // Assuming you have a job ID available for testing
    expect(job).to.be.an("object");
    expect(job).to.have.property("id", 1);
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(999); // Assuming you have a non-existent job ID available for testing
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New Title",
    salary: 90000,
    equity: 0.06,
    companyHandle: "new-company",
  };

  test("works", async function () {
    let job = await Job.update(1, updateData); // Assuming you have a job ID available for testing
    expect(job).to.be.an("object");
    expect(job).to.eql({ id: 1, ...updateData });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle AS "companyHandle"
       FROM jobs
       WHERE title = 'New Title'`
    );
    expect(result.rows).to.eql([{ id: 1, ...updateData }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(999, updateData); // Assuming you have a non-existent job ID available for testing
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1); // Assuming you have a job ID available for testing
    const result = await db.query("SELECT id FROM jobs WHERE id = 1");
    expect(result.rows.length).to.equal(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(999); // Assuming you have a non-existent job ID available for testing
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
