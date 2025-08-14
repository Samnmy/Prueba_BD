# Financial Transactions Management System – SQL & CRUD

## 📌 Description
This project is the implementation of a complete SQL-based data management system for organizing and managing financial transaction information from fintech platforms such as **Nequi** and **Daviplata**.  
The system was developed as a solution for a client of **ExpertSoft**, following the specifications described in the performance test statement (Module 4 – SQL Databases).  

It includes:
- **Data normalization** (1NF, 2NF, 3NF).
- **Relational model** designed manually.
- **SQL database creation script** with constraints.
- **Mass data loading** from CSV.
- **CRUD API** built with Express.js.
- **Frontend dashboard** for entity management.
- **Advanced SQL queries**.
- **Postman collection** with endpoints.

---

## 🛠️ Technologies Used
- **Node.js** & **Express.js** – Backend API
- **MySQL** – Relational database
- **Bootstrap** – Frontend styling
- **JavaScript / HTML / CSS** – Dashboard UI
- **Postman** – API testing
- **dbdiagram** – Relational model design
- **python** – File upload

---

## 📂 Project Structure
```
/backend
  ├── app.js
  ├── routes/
  ├── controllers/
  ├── database/
  ├── sql/
      └── create_db.sql
/frontend
  ├── index.html
  ├── dashboard.html
  ├── assets/
/csv
  └── data.csv
/postman
  └── collection.json
/model
  └── relational_model.png
README.md
```

---

## 🗃️ Database Normalization
The original Excel dataset was disorganized and denormalized.  
The following normalization steps were applied:

1. **First Normal Form (1NF)**  
   - Removed repeating groups.  
   - Ensured each column contains atomic values.  

2. **Second Normal Form (2NF)**  
   - Removed partial dependencies from composite keys.  
   - Each non-key attribute fully depends on the primary key.  

3. **Third Normal Form (3NF)**  
   - Removed transitive dependencies.  
   - Only attributes directly related to the primary key remain.

The final **relational model** can be found in:  
`/model/relational_model.png`

---

## 🗄️ Database Creation
Run the provided SQL script to create the database and tables:

```bash
mysql -u root -p < backend/sql/create_db.sql
```

Database naming format:  
```
pd_firstname_lastname_clan
```

---

## 📥 Mass Data Loading from CSV
The original Excel file was converted to CSV for bulk insertion.  

Load the CSV into MySQL using:
```sql
LOAD DATA LOCAL INFILE 'path/to/data.csv'
INTO TABLE transactions
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;
```
> This process can be executed manually or triggered from the frontend button (if implemented).

---

## 🔄 CRUD API
An Express.js API provides **Create**, **Read**, **Update**, and **Delete** operations for one of the main entities (e.g., `clients`).  

Base URL:  
```
http://localhost:3000/api
```

Example endpoints:
- `POST /clients`
- `GET /clients`
- `PUT /clients/:id`
- `DELETE /clients/:id`

---

## 📊 Advanced Queries
The API (via Postman) includes endpoints for:
1. **Total paid by each client** – aggregated payments.  
2. **Pending invoices** with client & transaction details.  
3. **Transactions by platform** (Nequi/Daviplata) with client and invoice info.

---

## 💻 Frontend Dashboard
A minimal dashboard built with **Bootstrap** is included to manage the CRUD operations visually.

---

## 🧪 Postman Collection
A ready-to-use Postman collection is included in:  
`/postman/collection.json`  
It contains:
- CRUD endpoints.
- The 3 advanced queries.

---

## 🚀 Installation & Usage
1. **Clone the repository**
```bash
git clone https://github.com/Samnmy/Prueba_BD.git
cd Prueba_BD
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Configure database connection**  
   Edit `backend/database/config.js` with your MySQL credentials.

4. **Create the database**  
```bash
mysql -u root -p < backend/sql/create_db.sql
```

5. **Load CSV data** (manually or via provided method).

6. **Run the backend server**
```bash
npm start
```

7. **Open the frontend**
   Open `frontend/index.html` in your browser.

---

## 📌 Developer Info
**Name:** Samuel Monsalve Orrego 
**Clan:** Gosling  
**Email:** Samuel.Monsalve.Orrego@gmail.com  

---
