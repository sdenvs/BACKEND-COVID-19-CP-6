const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

let dbpath = path.join(__dirname, "covid19India.db");

let db = null;

const initialisation = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server started");
    });
  } catch (e) {
    console.log(`error: ${e}`);
  }
};

initialisation();

//API-1 get states
app.get("/states/", async (req, res) => {
  const getStatesQuery = `SELECT *
        FROM 
            state`;

  const getStates = await db.all(getStatesQuery);
  res.send(
    getStates.map((eachItem) => {
      return {
        stateId: eachItem.state_id,
        stateName: eachItem.state_name,
        population: eachItem.population,
      };
    })
  );
});

//API-2 Get state by id

app.get("/states/:stateId/", async (req, res) => {
  let { stateId } = req.params;
  const getStateByIdQuery = `SELECT * 
        FROM 
            state 
        WHERE 
            state_id = ${stateId};`;
  const getStateById = await db.get(getStateByIdQuery);
  res.send({
    stateId: getStateById.state_id,
    stateName: getStateById.state_name,
    population: getStateById.population,
  });
});

//API-3 post districts
app.post("/districts/", async (req, res) => {
  const { districtName, stateId, cases, cured, active, deaths } = req.body;
  //console.log(districtName);
  const postDistrictQuery = `INSERT INTO district
    (district_name, state_id, cases, cured, active, deaths)
    VALUES('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths} );`;

  const postDistrict = await db.run(postDistrictQuery);
  res.send("District Successfully Added");
});

//API-4 get District by id
app.get("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const getDistrictByIdQuery = `SELECT *
        FROM district 
        WHERE 
            district_id = ${districtId};`;
  const getDistrictById = await db.get(getDistrictByIdQuery);
  res.send({
    districtId: getDistrictById.district_id,
    districtName: getDistrictById.district_name,
    stateId: getDistrictById.state_id,
    cases: getDistrictById.cases,
    cured: getDistrictById.cured,
    active: getDistrictById.active,
    deaths: getDistrictById.deaths,
  });
});

//API-5 delete district by Id
app.delete("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const deleteDistrictQuery = `DELETE 
        FROM 
            district 
        WHERE 
            district_id = ${districtId};`;
  const deleteDistrict = await db.run(deleteDistrictQuery);
  res.send("District Removed");
});

//API-6 put district
app.put("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const { districtName, stateId, cases, cured, active, deaths } = req.body;
  const putDistrictByIdQuery = `INSERT INTO district
        (
        district_name,
        state_id,
        cases,
        cured,
        active,
        deaths) 
        VALUES
        ('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`;
  const putDistrictById = await db.run(putDistrictByIdQuery);
  res.send("District Details Updated");
});

//API-7 get statistict of corona by stateId
app.get("/states/:stateId/stats/", async (req, res) => {
  const { stateId } = req.params;
  const getStatsByDistrictIdQuery = `SELECT 
            sum(cases) as totalCases,
            sum(cured) as totalCured,
            sum(active) as totalActive,
            sum(deaths) as totalDeaths
        FROM 
            district
        WHERE 
            district_id = ${stateId};`;
  const getStatsByDistrictId = await db.all(getStatsByDistrictIdQuery);
  res.send(getStatsByDistrictId[0]);
});

//API-8 get districtName by district_id
app.get("/districts/:districtId/details/", async (req, res) => {
  const { districtId } = req.params;
  const getDistrictNameByIdQuery = `SELECT 
            state.state_name as stateName
        FROM 
            state INNER JOIN district ON state.state_id = district.state_id
        WHERE 
            district.district_id = ${districtId};`;
  const getDistrictNameById = await db.get(getDistrictNameByIdQuery);
  res.send(getDistrictNameById);
});

module.exports = app;
