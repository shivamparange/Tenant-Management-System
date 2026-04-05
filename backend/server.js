// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const cron = require('node-cron');
// const Razorpay = require('razorpay');

const JWT_SECRET = 'your_super_secret_key_here'; // In a real app, use environment variables

const app = express();
const port = 5000;

// Razorpay Initialization removed
// const razorpay = new Razorpay({
//   key_id: 'rzp_test_your_key_id',
//   key_secret: 'your_key_secret'
// });

// Middleware
app.use(cors()); // Allow requests from your frontend
app.use(bodyParser.json()); // Parse JSON request bodies

// --- Database Connection ---
const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Shivam@504401",
  database: "parange_estates"
});

db.connect(err => {
  if(err){
    console.log("Database connection failed: " + err.stack);
  } else {
    console.log("Database connected to parange_estates");
  }
});
// -------------------------------------------------------------------------


// --- API Endpoints ---

// 1. Add Property Endpoint (POST request)
app.post('/add-property', (req, res) => {
  const { property_name, unit_number, type, address, rent, status } = req.body;
  const initialStatus = status || 'vacant';

  const sql = `
  INSERT INTO properties 
  (property_name, unit_number, type, address, monthly_rent, status)
  VALUES (?,?,?,?,?,?)
  `;

  db.query(sql, [property_name, unit_number, type, address, rent, initialStatus], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json({ message: "Property added successfully", id: result.insertId });
    }
  });
});

// 2. Fetch Properties API (GET request)
app.get('/properties', (req, res) => {
  const sql = "SELECT * FROM properties WHERE status != 'inactive'";

  db.query(sql, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

// 3. Update Property API (PUT request)
app.put('/property', (req, res) => {
  const { id, property_name, unit_number, type, address, rent, status } = req.body;
  if (!id) return res.status(400).json({ error: "Property ID required" });

  const sql = `
  UPDATE properties 
  SET property_name=?, unit_number=?, type=?, address=?, monthly_rent=?, status=?
  WHERE id=?
  `;

  db.query(sql, [property_name, unit_number, type, address, rent, status || 'vacant', id], (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send("Property updated successfully");
    }
  });
});

// 4. Delete Property API (Soft Delete)
app.delete('/property', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Property ID required" });

  console.log("Soft deleting property ID:", id);

  const sql = "UPDATE properties SET status = 'inactive' WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error soft deleting property:", err);
      return res.status(500).json({ error: "Failed to soft delete property", details: err });
    }
    res.send("Property marked as inactive successfully");
  });
});

// 5. User Signup API (POST request)
app.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'tenant';
    
    const sql = `
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
    `;
    
    db.query(sql, [name, email, hashedPassword, userRole], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
           return res.status(409).json({ error: "Email already exists" });
        }
        res.status(500).send(err);
      } else {
        res.status(201).json({ message: "User registered successfully", id: result.insertId });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Error hashing password" });
  }
});

// 6. User Login API (POST request)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const sql = "SELECT * FROM users WHERE email = ?";
  
  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).send(err);
    } 
    
    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      
      if (match) {
        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role }, 
          JWT_SECRET, 
          { expiresIn: '1h' }
        );
        
        // Remove password from response
        delete user.password; 
        res.json({ message: "Login successful", user, token });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });
});

app.get('/dashboard-stats', (req, res) => {
  const sql = "SELECT COUNT(*) AS total_properties FROM properties WHERE status != 'inactive'";

  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(result[0] || { total_properties: 0 });
    }
  });
});

// 8. Create Payment API (Disabled)
app.post("/create-payment", (req, res) => {
  res.status(501).json({ message: "Payment integration temporarily disabled" });
});

// 9. Payment Success API (Disabled)
app.post("/payment-success", (req, res) => {
  res.status(501).json({ message: "Payment integration temporarily disabled" });
});

// 10. Raise Maintenance Request API (Alias for Raise Complaint)
app.post("/api/maintenance-request", (req, res) => {
  const { user_id, property_id, issue_type, description } = req.body;
  const sql = "INSERT INTO maintenance_requests (user_id, property_id, issue_type, description) VALUES (?, ?, ?, ?)";

  db.query(sql, [user_id, property_id, issue_type, description], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: err });
    }
    res.json({ success: true, message: "Maintenance request submitted successfully", id: result.insertId });
  });
});

app.post("/raise-complaint", (req, res) => {
  // Keeping this for backward compatibility if any frontend calls it
  res.redirect(307, '/api/maintenance-request');
});

// 11. Fetch All Maintenance Requests (for Admin/Manager)
app.get("/maintenance-requests", (req, res) => {
  const sql = `
    SELECT m.*, u.name as tenant_name, p.property_name 
    FROM maintenance_requests m
    JOIN users u ON m.user_id = u.id
    JOIN properties p ON m.property_id = p.id
    ORDER BY m.created_at DESC
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.get("/complaints", (req, res) => {
  res.redirect('/maintenance-requests');
});

// 11b. Update Maintenance Request Status
app.put("/maintenance-requests/:id", async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    const updateReqSql = "UPDATE maintenance_requests SET status = ? WHERE id = ?";
    await db.promise().query(updateReqSql, [status, id]);

    let message = "Maintenance request updated successfully";

    if (status === 'Resolved') {
      const updatePropSql = `
        UPDATE properties 
        SET status = 'occupied'
        WHERE id = (SELECT property_id FROM maintenance_requests WHERE id = ?)
          AND status = 'maintenance' 
          AND tenant_id IS NOT NULL
      `;
      const [result] = await db.promise().query(updatePropSql, [id]);
      if (result.affectedRows > 0) {
        message = "Maintenance resolved. Property marked as Occupied.";
      }
    }

    res.json({ success: true, message });
  } catch (err) {
    console.error("Maintenance Update Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Rent Reminder Scheduler (Disabled) ---
/*
cron.schedule("0 9 * * *", () => {
  console.log("Running scheduled rent reminder check...");
  
  // Find tenants whose rent is due in 2 days
  const sql = "SELECT * FROM tenants WHERE rent_due_day = DAY(DATE_ADD(CURDATE(), INTERVAL 2 DAY))";
  
  db.query(sql, (err, results) => {
    if (err) return console.error("Cron Error:", err);
    
    results.forEach(tenant => {
      console.log(`Sending reminder to ${tenant.name} (${tenant.phone}) for ₹${tenant.rent_amount}`);
    });
  });
});
*/

// 12. Fetch Tenant's Assigned Property (JOIN version)
app.get("/tenant/property/:userId", (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT t.*, p.property_name, p.address as property_location, p.type as property_type
    FROM tenants t
    JOIN properties p ON t.property_id = p.id
    WHERE t.user_id = ?
    ORDER BY t.move_in_date DESC
    LIMIT 1
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Dashboard Query Error:", err);
      return res.status(500).send(err);
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.json(null);
    }
  });
});

app.get("/tenant-property/:uid", (req, res) => {
  res.redirect(`/tenant/property/${req.params.uid}`);
});

// 13. Fetch Tenant's Maintenance Requests
app.get("/tenant-maintenance/:userId", (req, res) => {
  const userId = req.params.userId;
  const sql = "SELECT * FROM maintenance_requests WHERE user_id = ? ORDER BY created_at DESC";
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.get("/tenant-complaints/:uid", (req, res) => {
  res.redirect(`/tenant-maintenance/${req.params.uid}`);
});

// 14. Fetch All Users (for dropdowns)
app.get("/all-users", (req, res) => {
  const sql = "SELECT id, name, email, role FROM users";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// 15. Add/Update Tenant Record (History) with Auto-User Creation & Sync
app.post("/add-tenant", async (req, res) => {
  const { id, property_id, user_id, name, phone, email, password, move_in_date, move_out_date, deposit, rent_amount, rent_due_day } = req.body;

  if (!name || !property_id) {
    return res.status(400).json({ success: false, message: "Missing required fields (name, property_id)" });
  }

  try {
    // 1. Resolve User linkage or creation
    let finalUserId = user_id;
    let isNewUser = false;
    
    if (!user_id || user_id === "") {
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required to create a new account." });
        }
        const [existingUsers] = await db.promise().query("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ success: false, message: "Email already registered. Please select existing account or use another email." });
        }
        
        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required for new accounts." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [userResult] = await db.promise().query(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'tenant')",
          [name, email, hashedPassword]
        );
        finalUserId = userResult.insertId;
        isNewUser = true;
    }

    // 3. Insert/Update into tenants table
    const tenantSql = `
      INSERT INTO tenants 
      (id, property_id, user_id, name, phone, email, move_in_date, move_out_date, deposit, rent_amount, rent_due_day)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      user_id=VALUES(user_id), name=VALUES(name), phone=VALUES(phone), email=VALUES(email),
      move_in_date=VALUES(move_in_date), move_out_date=VALUES(move_out_date),
      deposit=VALUES(deposit), rent_amount=VALUES(rent_amount), rent_due_day=VALUES(rent_due_day)
    `;

    const [tenantResult] = await db.promise().query(tenantSql, [
      id || null, property_id, finalUserId, name, phone, email, move_in_date, move_out_date, deposit, rent_amount, rent_due_day
    ]);

    // 4. Update property status and data
    if (!move_out_date) {
      const updatePropSql = `
        UPDATE properties 
        SET tenant_id = ?, status = 'occupied'
        WHERE id = ?
      `;
      await db.promise().query(updatePropSql, [finalUserId, property_id]);

      // 5. Update/Insert into property_history for tracking
      const historySql = `
        INSERT INTO property_history (property_id, tenant_name, move_in_date, rent_amount, tenant_id)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE tenant_name=VALUES(tenant_name)
      `;
      await db.promise().query(historySql, [property_id, name, move_in_date, rent_amount, finalUserId]);
    } else {
      // If move_out_date is provided, set property to vacant
      await db.promise().query("UPDATE properties SET status = 'vacant', tenant_id = NULL WHERE id = ?", [property_id]);
    }

    res.json({ 
      success: true, 
      message: isNewUser ? "Tenant account created successfully. They can now login." : "Tenant synchronized successfully", 
      userId: finalUserId,
      tenantId: id || tenantResult.insertId 
    });

  } catch (error) {
    console.error("Add Tenant Error:", error);
    res.status(500).json({ success: false, message: "Server error during synchronization", error: error.message });
  }
});

// 16. Get Property History
app.get("/history/:propertyId", (req, res) => {
  const { propertyId } = req.params;
  const sql = "SELECT * FROM tenants WHERE property_id = ? ORDER BY move_in_date DESC";
  db.query(sql, [propertyId], (err, tenants) => {
    if (err) return res.status(500).send(err);
    if (!tenants || tenants.length === 0) return res.json([]);
    
    const tenantIds = tenants.map(t => t.id).filter(id => id);
    if (tenantIds.length === 0) return res.json(tenants);

    const paySql = "SELECT * FROM rent_payments WHERE tenant_id IN (?)";
    db.query(paySql, [tenantIds], (err, payments) => {
      if (err) return res.status(500).send(err);
      
      const paymentsByTenant = payments.reduce((acc, pay) => {
        if (!acc[pay.tenant_id]) acc[pay.tenant_id] = [];
        acc[pay.tenant_id].push({
          id: pay.id.toString(),
          month: pay.rent_month,
          amount: Number(pay.amount),
          paymentDate: pay.payment_date ? new Date(pay.payment_date).toISOString().split('T')[0] : undefined,
          status: pay.payment_status
        });
        return acc;
      }, {});

      const finalResults = tenants.map(t => ({
        ...t,
        payments: paymentsByTenant[t.id] || []
      }));
      res.json(finalResults);
    });
  });
});

app.post('/add-payment', (req, res) => {
  const { tenant_id, property_id, month, amount, paymentDate, status } = req.body;
  if (!tenant_id || !property_id || !month || amount == null) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO rent_payments 
    (tenant_id, property_id, rent_month, amount, payment_date, payment_status) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [tenant_id, property_id, month, amount, paymentDate || null, status], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Payment recorded successfully", id: result.insertId });
  });
});

app.put('/payment-status', (req, res) => {
  const { id, status, paymentDate } = req.body;
  const sql = "UPDATE rent_payments SET payment_status = ?, payment_date = ? WHERE id = ?";
  db.query(sql, [status, paymentDate || null, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Payment status updated" });
  });
});

app.delete('/payment/:id', (req, res) => {
  const sql = "DELETE FROM rent_payments WHERE id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Payment deleted" });
  });
});

// Root endpoint to confirm API is running
app.get('/', (req, res) => {
    res.send("<h1>Parange Estates API</h1><p>The backend is running successfully. Please visit the <a href='http://localhost:5173'>Frontend</a> to use the application.</p>");
});

// A simple GET endpoint just to test if the server is running
app.get('/api/test', (req, res) => {
    res.json({ message: "Backend API is running!" });
});


// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
