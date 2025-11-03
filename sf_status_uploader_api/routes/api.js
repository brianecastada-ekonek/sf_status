const express = require("express")
const oracledb = require("oracledb");
const bcrypt = require("bcrypt");

const dbconfig = require('../configs/dbconfig');

const router = express.Router();

const options = { outFormat : oracledb.OUT_FORMAT_OBJECT };

router.post("/save", async (req, res) => {
    let params = req.body;

    let conn;
    let isSuccess = true;
    let result = {};

    conn = await oracledb.getConnection(dbconfig);

    // let acceptedStatus = ['Vehicle Unload', 'Customs Release', 'Short Landed', 'Formal Clearance'];
    
    try {
        for (let i = 0; i < params.data.length; i++) {
            let data = params.data[i];

            let sql = `INSERT INTO ${process.env.SCHEMA}.SF_STATUS_TABLE VALUES (
                :1, 'UPLOAD-${data.USERNAME}', :2, TO_DATE(:3, 'MM/DD/YYYY HH24:MI:SS'), NULL, 
                SEQ_SF_STATUS.nextval, 'N', :4, NULL, :5, :6, :7, SYSDATE
            )`;

            const SF_STATUS_TABLE_QUERY = await conn.execute(sql, [
                data.HAWB, 
                data.EVENT_NAME,
                data.DATE,
                data.EVENT_CODE,
                data.EVENT_NAME,
                data.REASON_CODE,
                data.REASON_NAME
            ]);
        }

        await conn.execute("COMMIT");

        result.message = 'Successfully saved data.';
    }
    catch (err) {
        await conn.execute("ROLLBACK");

        console.error("save", err);
       
        isSuccess = false;
        
        result.success = isSuccess;
        result.message = 'Please contact your system administrator.';
        result.details = err.message;
    }
    finally {
        console.log(new Date(), " --- ", "save", " : ", isSuccess ? "✅" : "❌", " ---");
        
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(new Date(), "- ORACLE CONN -", err);
            }
        }

        result.success = isSuccess;

        res.json(result)
    }
});

router.get("/reference", async (req, res) => {
    let conn;
    let isSuccess = false;
    let result = {};

    try {
        conn = await oracledb.getConnection(dbconfig);

        result = await conn.execute(`SELECT * FROM ${process.env.SCHEMA}.SF_REF_EVENT`, [], options);

        isSuccess = true;
    }
    catch (err) {
        isSuccess = false;
        
        console.error("reference", err);

        result.success = isSuccess;
        result.message = 'Please contact your system administrator.';
        result.details = err.message;
    } 
    finally {
        console.log(new Date(), " --- ", "reference", " : ", isSuccess ? "✅" : "❌", " ---");
        
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(new Date(), "- ORACLE CONN -", err);
            }
        }

        result.success = isSuccess;

        res.json(result)
    }
});

router.get("/sf_status", async (req, res) => {
    let conn;
    let isSuccess = false;
    let result = {};

    try {
        conn = await oracledb.getConnection(dbconfig);

        result = await conn.execute(`
            SELECT 
                WAYBILL_NO, 
                SF_STATUS_SENT_FLAG, 
                "TYPE", 
                E2M_STATUS, 
                TO_CHAR(STATUS_DATE, 'YYYY-MM-DD HH24:MI:SS') AS STATUS_DATE, 
                TRACKPH_ID, 
                STATUS_ID, 
                SF_STATUS_SENT_FLAG, 
                SF_STATUS, 
                TO_CHAR(PROCESSED_DATE, 'YYYY-MM-DD HH24:MI:SS') AS PROCESSED_DATE, 
                OP_NAME, 
                REASON_CODE, 
                REASON_NAME, 
                TO_CHAR(CREATED_DATE, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_DATE
            FROM ${process.env.SCHEMA}.SF_STATUS_TABLE 
            ORDER BY STATUS_DATE
        `, [], options);

        isSuccess = true;
    }
    catch (err) {
        isSuccess = false;
        
        console.error("sf_status", err);

        result.success = isSuccess;
        result.message = 'Please contact your system administrator.';
        result.details = err.message;
    } 
    finally {
        console.log(new Date(), " --- ", "sf_status", " : ", isSuccess ? "✅" : "❌", " ---");
        
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(new Date(), "- ORACLE CONN -", err);
            }
        }

        result.success = isSuccess;

        res.json(result)
    }
});

router.get("/sf_status/:hawb", async (req, res) => {
    let hawb = req.params.hawb;
    let conn;
    let isSuccess = false;
    let result = {};

    try {
        conn = await oracledb.getConnection(dbconfig);

        result = await conn.execute(`
            SELECT 
                WAYBILL_NO, 
                SF_STATUS_SENT_FLAG, 
                "TYPE", 
                E2M_STATUS, 
                TO_CHAR(STATUS_DATE, 'YYYY-MM-DD HH24:MI:SS') AS STATUS_DATE, 
                TRACKPH_ID, 
                STATUS_ID, 
                SF_STATUS_SENT_FLAG, 
                SF_STATUS, 
                TO_CHAR(PROCESSED_DATE, 'YYYY-MM-DD HH24:MI:SS') AS PROCESSED_DATE, 
                OP_NAME, 
                REASON_CODE, 
                REASON_NAME, 
                TO_CHAR(CREATED_DATE, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_DATE
            FROM ${process.env.SCHEMA}.SF_STATUS_TABLE 
            WHERE WAYBILL_NO = :1 
            ORDER BY STATUS_DATE
        `, [hawb], options);

        isSuccess = true;
    }
    catch (err) {
        isSuccess = false;
        
        console.error("sf_status", err);

        result.success = isSuccess;
        result.message = 'Please contact your system administrator.';
        result.details = err.message;
    } 
    finally {
        console.log(new Date(), " --- ", "sf_status", " : ", isSuccess ? "✅" : "❌", " ---");
        
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(new Date(), "- ORACLE CONN -", err);
            }
        }

        result.success = isSuccess;

        res.json(result)
    }
});

router.post("/sf_status_save", async (req, res) => {
    let params = req.body;

    let conn;
    let isSuccess = true;
    let result = {};

    conn = await oracledb.getConnection(dbconfig);

    try {
        let { data } = params;

        if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                let row = data[i];

                let sql = `INSERT INTO ${process.env.SCHEMA}.SF_STATUS_TABLE
                    (
                        WAYBILL_NO, 
                        "TYPE", 
                        E2M_STATUS, 
                        STATUS_DATE, 
                        TRACKPH_ID, 
                        STATUS_ID, 
                        SF_STATUS_SENT_FLAG, 
                        SF_STATUS, 
                        PROCESSED_DATE, 
                        OP_NAME, 
                        REASON_CODE, 
                        REASON_NAME, 
                        CREATED_DATE
                    )
                    VALUES (:1, :2, :3, TO_DATE(:4, 'MM/DD/YYYY HH24:MI:SS'), NULL, NULL, 'N', :5, NULL, :6, :7, :8, SYSDATE)
                `;

                const SF_STATUS_TABLE_QUERY = await conn.execute(sql, [
                    row.waybill_no, 
                    row.type, 
                    row.e2m_status, 
                    row.status_date, 
                    row.sf_status, 
                    row.op_name, 
                    row.reason_code, 
                    row.reason_name 
                ]);
            }

            await conn.execute("COMMIT");
    
            result.message = 'Successfully saved data.';
        }
    }
    catch (err) {
        await conn.execute("ROLLBACK");

        console.error("sf_status_save", err);
       
        isSuccess = false;
        
        result.success = isSuccess;
        result.message = 'Please contact your system administrator.';
        result.details = err.message;
    }
    finally {
        console.log(new Date(), " --- ", "sf_status_save", " : ", isSuccess ? "✅" : "❌", " ---");
        
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(new Date(), "- ORACLE CONN -", err);
            }
        }

        result.success = isSuccess;

        res.json(result)
    }
});

router.post("/login", async (req, res) => {
    let params = req.body;
    let conn;
    let isSuccess = false;
    let result = {};

    try {
        conn = await oracledb.getConnection(dbconfig);

        let sf_user = await conn.execute(`
            SELECT * FROM ${process.env.SCHEMA}.SF_USER_ACCOUNTS 
            WHERE 
                USERNAME = :1 
        `, [params.LOGIN_USERNAME], options);

        if (sf_user.rows.length > 0) {
            const passwordMatch = await bcrypt.compare(
                params.LOGIN_PASSWORD,
                sf_user.rows[0].PASSWORD
            );

            if (passwordMatch) {
                isSuccess = true;
                result.message = "Successfully logged in.";
            } else {
                isSuccess = false;
                result.message = "Incorrect password.";
            }
        } else {
            isSuccess = false;
            result.message = "Invalid username.";
        }

    }
    catch (err) {
        isSuccess = false;
        
        console.error("login", err);

        result.success = isSuccess;
        result.message = 'Please contact your system administrator.';
        result.details = err.message;
    } 
    finally {
        console.log(new Date(), " --- ", "login", " : ", isSuccess ? "✅" : "❌", " ---");
        
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(new Date(), "- ORACLE CONN -", err);
            }
        }

        result.success = isSuccess;

        res.json(result)
    }
});

module.exports = router;