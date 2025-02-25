const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const hostname = '127.0.0.1';
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Database Connection
const connection = mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    user: '2zybdNBoVbXwYua.root',
    password: 'sUTRHqXzvsAhj8E2',
    database: 'ChronicDiseaseDB',
    port: 4000,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});
    

// Test Database Connection
connection.connect((err) => {
    if (err) {
        console.error('เชื่อมต่อฐานข้อมูลล้มเหลว:', err);
        return;
    }
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');
});

// Root Route
app.get('/', (req, res) => {
    res.send('ยินดีต้อนรับสู่ระบบติดตามผู้ป่วยโรคเรื้อรัง API');
});

// ========== ฟังก์ชันการจัดการผู้ป่วย ==========

// ดึงข้อมูลผู้ป่วยทั้งหมด
app.get('/getPatients', (req, res) => {
    const sql = 'SELECT * FROM ChronicPatients';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'ไม่สามารถดึงข้อมูลได้' });
        }
        res.json(results);
    });
});

// ดึงข้อมูลผู้ป่วยตาม ID
app.get('/getPatient/:id', (req, res) => {
    const sql = 'SELECT * FROM ChronicPatients WHERE PatientID = ?';
    connection.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'ไม่สามารถดึงข้อมูลได้' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: true, message: 'ไม่พบข้อมูลผู้ป่วย' });
        }
        res.json(results[0]);
    });
});

// เพิ่มผู้ป่วยใหม่
app.post('/addPatient', (req, res) => {
    const { PatientName, PatientCode, Gender, PhoneNumber, DateOfBirth } = req.body;
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!PatientName || !PatientCode || !Gender || !PhoneNumber || !DateOfBirth) {
        return res.status(400).json({ 
            error: true, 
            message: 'กรุณากรอกข้อมูลให้ครบถ้วน' 
        });
    }

    const sql = 'INSERT INTO ChronicPatients (PatientName, PatientCode, Gender, PhoneNumber, DateOfBirth) VALUES (?, ?, ?, ?, ?)';
    
    connection.query(sql, [PatientName, PatientCode, Gender, PhoneNumber, DateOfBirth], (err, result) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ 
                error: true, 
                message: 'ไม่สามารถเพิ่มข้อมูลได้: ' + err.message 
            });
        }
        res.status(201).json({ 
            error: false, 
            message: 'เพิ่มข้อมูลผู้ป่วยสำเร็จ',
            data: result
        });
    });
});

// แก้ไขข้อมูลผู้ป่วย
app.put('/editPatient/:id', (req, res) => {
    const { PatientName, PatientCode, Gender, PhoneNumber, DateOfBirth } = req.body;
    const sql = 'UPDATE ChronicPatients SET PatientName=?, PatientCode=?, Gender=?, PhoneNumber=?, DateOfBirth=? WHERE PatientID=?';
    
    connection.query(sql, [PatientName, PatientCode, Gender, PhoneNumber, DateOfBirth, req.params.id], (err, result) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'ไม่สามารถแก้ไขข้อมูลได้' });
        }
        res.json({ error: false, message: 'แก้ไขข้อมูลสำเร็จ' });
    });
});

// ลบข้อมูลผู้ป่วย
app.delete('/deletePatient/:id', (req, res) => {
    const sql = 'DELETE FROM ChronicPatients WHERE PatientID = ?';
    connection.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'ไม่สามารถลบข้อมูลได้' });
        }
        res.json({ error: false, message: 'ลบข้อมูลสำเร็จ' });
    });
});

// ========== ฟังก์ชันการจัดการประวัติสุขภาพ ==========

// ดึงข้อมูลประวัติสุขภาพทั้งหมด
app.get('/getHealthRecords', (req, res) => {
    const sql = 'SELECT * FROM HealthRecords';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'ไม่สามารถดึงข้อมูลได้' });
        }
        res.json(results);
    });
});

// ดึงข้อมูลประวัติสุขภาพตาม ID
app.get('/getHealthRecord/:id', (req, res) => {
    const sql = 'SELECT * FROM HealthRecords WHERE RecordID = ?';
    connection.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'ไม่สามารถดึงข้อมูลได้' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: true, message: 'ไม่พบข้อมูลประวัติสุขภาพ' });
        }
        res.json(results[0]);
    });
});

// ดึงข้อมูลประวัติสุขภาพตาม PatientID
app.get('/getHealthRecordsByPatient/:patientId', (req, res) => {
    const sql = 'SELECT * FROM HealthRecords WHERE PatientID = ? ORDER BY RecordDate DESC';
    connection.query(sql, [req.params.patientId], (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'ไม่สามารถดึงข้อมูลได้' });
        }
        res.json(results);
    });
});

// เพิ่มประวัติสุขภาพใหม่
app.post('/addHealthRecord', (req, res) => {
    const { PatientID, RecordDate, BloodSugarLevel, BloodPressure, Cholesterol } = req.body;
    const sql = 'INSERT INTO HealthRecords (PatientID, RecordDate, BloodSugarLevel, BloodPressure, Cholesterol) VALUES (?, ?, ?, ?, ?)';
    
    connection.query(sql, [PatientID, RecordDate, BloodSugarLevel, BloodPressure, Cholesterol], (err, result) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'ไม่สามารถเพิ่มข้อมูลได้' });
        }
        res.json({ error: false, message: 'เพิ่มข้อมูลประวัติสุขภาพสำเร็จ' });
    });
});

// แก้ไขประวัติสุขภาพ
app.put('/editHealthRecord/:id', (req, res) => {
    const { RecordDate, BloodSugarLevel, BloodPressure, Cholesterol } = req.body;
    const sql = 'UPDATE HealthRecords SET RecordDate=?, BloodSugarLevel=?, BloodPressure=?, Cholesterol=? WHERE RecordID=?';
    
    connection.query(sql, [RecordDate, BloodSugarLevel, BloodPressure, Cholesterol, req.params.id], (err, result) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'ไม่สามารถแก้ไขข้อมูลได้' });
        }
        res.json({ error: false, message: 'แก้ไขข้อมูลสำเร็จ' });
    });
});

// ลบประวัติสุขภาพ
app.delete('/deleteHealthRecord/:id', (req, res) => {
    const sql = 'DELETE FROM HealthRecords WHERE RecordID = ?';
    connection.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'ไม่สามารถลบข้อมูลได้' });
        }
        res.json({ error: false, message: 'ลบข้อมูลสำเร็จ' });
    });
});

// ========== ฟังก์ชันการจัดการแพทย์ ==========

// ดึงข้อมูลแพทย์ทั้งหมด
app.get('/getDoctors', (req, res) => {
    const sql = 'SELECT * FROM Doctors';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'ไม่สามารถดึงข้อมูลได้' });
        }
        res.json(results);
    });
});

// ดึงข้อมูลแพทย์ตาม ID
app.get('/getDoctor/:id', (req, res) => {
    const sql = 'SELECT * FROM Doctors WHERE DoctorID = ?';
    connection.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'ไม่สามารถดึงข้อมูลได้' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: true, message: 'ไม่พบข้อมูลแพทย์' });
        }
        res.json(results[0]);
    });
});

// เพิ่มแพทย์ใหม่
app.post('/addDoctor', (req, res) => {
    const { Username, Password, DoctorName, Email, Department } = req.body;
    const sql = 'INSERT INTO Doctors (Username, Password, DoctorName, Email, Department) VALUES (?, ?, ?, ?, ?)';
    
    connection.query(sql, [Username, Password, DoctorName, Email, Department], (err, result) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'ไม่สามารถเพิ่มข้อมูลได้' });
        }
        res.json({ error: false, message: 'เพิ่มข้อมูลแพทย์สำเร็จ' });
    });
});

// แก้ไขข้อมูลแพทย์
app.put('/editDoctor/:id', (req, res) => {
    const { Username, Password, DoctorName, Email, Department } = req.body;
    const sql = 'UPDATE Doctors SET Username=?, Password=?, DoctorName=?, Email=?, Department=? WHERE DoctorID=?';
    
    connection.query(sql, [Username, Password, DoctorName, Email, Department, req.params.id], (err, result) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'ไม่สามารถแก้ไขข้อมูลได้' });
        }
        res.json({ error: false, message: 'แก้ไขข้อมูลสำเร็จ' });
    });
});

// ลบข้อมูลแพทย์
app.delete('/deleteDoctor/:id', (req, res) => {
    const sql = 'DELETE FROM Doctors WHERE DoctorID = ?';
    connection.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'ไม่สามารถลบข้อมูลได้' });
        }
        res.json({ error: false, message: 'ลบข้อมูลสำเร็จ' });
    });
});

// ========== ระบบเข้าสู่ระบบ ==========


// เข้าสู่ระบบ
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM Doctors WHERE Username = ?  AND Password = ?';
    
    connection.query(sql, [username,  password], (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: true, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: true, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }
        
        const doctor = {...results[0]};
        delete doctor.Password;
        res.json({ 
            error: false, 
            message: 'เข้าสู่ระบบสำเร็จ',
            doctor: doctor
        });
    });
});

// เพิ่มในส่วน ========== ระบบเข้าสู่ระบบ ==========

// ลงทะเบียนแพทย์ใหม่
app.post('/register', (req, res) => {
    const { username, password, doctorName, email, department } = req.body;
    
    // ตรวจสอบว่ามี username ซ้ำหรือไม่
    const checkUser = 'SELECT * FROM Doctors WHERE Username = ?';
    connection.query(checkUser, [username], (err, results) => {
        if (err) {
            console.error('ข้อผิดพลาด:', err);
            return res.status(500).json({ error: true, message: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล' });
        }
        
        if (results.length > 0) {
            return res.status(400).json({ error: true, message: 'ชื่อผู้ใช้นี้มีในระบบแล้ว' });
        }
        
        // ถ้าไม่ซ้ำ ทำการเพิ่มข้อมูล
        const sql = 'INSERT INTO Doctors (Username, Password, DoctorName, Email, Department) VALUES (?, ?, ?, ?, ?)';
        connection.query(sql, [username, password, doctorName, email, department], (err, result) => {
            if (err) {
                console.error('ข้อผิดพลาด:', err);
                return res.status(500).json({ error: true, message: 'ไม่สามารถลงทะเบียนได้' });
            }
            res.json({ error: false, message: 'ลงทะเบียนสำเร็จ' });
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});