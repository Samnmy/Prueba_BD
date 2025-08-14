#   import data
#   python database/import_data.py 

import csv # import para leer csv
import mysql.connector # import para conectar a la base de datos MySQL
from datetime import datetime # import para manejar fechas y horas
import os # import para manejar rutas de archivos
from dotenv import load_dotenv # import para cargar variables de entorno de .env

load_dotenv()  # Cargar variables de entorno desde el archivo .env

def create_db_connection(): # Crear una conexión a la base de datos
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', '6466O'),
        database=os.getenv('DB_NAME', 'pd_samuel_monsalve_gosling')
    )

def disable_foreign_keys(cursor): # Deshabilitar claves foráneas
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")

def enable_foreign_keys(cursor): # Habilitar claves foráneas
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

def import_platforms(db):   # Importar plataformas desde un archivo CSV
    cursor = db.cursor()
    print("➡️ Importando plataformas...")
    with open(os.path.join('.', 'data', 'platforms.csv'), mode='r', encoding='utf-8-sig') as file:  # Abrir el archivo CSV
        reader = csv.DictReader(file)   # Leer el archivo CSV
        for row in reader:  # Iterar sobre las filas del archivo CSV
            cursor.execute("""
                INSERT INTO platforms (platform_id, name)   
                VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE name=VALUES(name)
            """, (int(row['platform_id']), row['name'])) # Insertar o actualizar la plataforma
    db.commit()
    print(f"✅ {cursor.rowcount} plataformas importadas")

def import_customers(db):
    cursor = db.cursor()
    print("➡️ Importando clientes...")
    with open(os.path.join('.', 'data', 'customers.csv'), mode='r', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)
        for row in reader:
            cursor.execute("""
                INSERT INTO customers (customer_id, name, identification_number, address, phone, email)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                    name=VALUES(name),
                    identification_number=VALUES(identification_number),
                    address=VALUES(address),
                    phone=VALUES(phone),
                    email=VALUES(email)
            """, (
                int(row['customer_id']),
                row['name'],
                row['identification_number'],
                row['address'],
                row['phone'],
                row['email']
            ))
    db.commit()
    print(f"✅ {cursor.rowcount} clientes importados")

def import_invoices(db):
    cursor = db.cursor()
    print("➡️ Importando facturas...")
    with open(os.path.join('.', 'data', 'invoices.csv'), mode='r', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)
        for row in reader:
            cursor.execute("""
                INSERT INTO invoices (invoice_id, number_invoices, billing_period, billed_amount, paid_amount, customer_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE number_invoices=VALUES(number_invoices)
            """, (
                int(row['invoice_id']),
                row['number_invoices'],
                datetime.strptime(row['billing_period'] + '-01', '%Y-%m-%d').date(),
                float(row['billed_amount']),
                float(row['paid_amount']),
                int(row['customer_id'])
            ))
    db.commit()
    print(f"✅ {cursor.rowcount} facturas importadas")

def import_transactions(db):
    cursor = db.cursor()
    print("➡️ Importando transacciones...")
    with open(os.path.join('.', 'data', 'transactions.csv'), mode='r', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)
        for row in reader:
            cursor.execute("""
                INSERT INTO transactions (transaction_id, transaction_datetime, amount, status, transaction_type, customer_id, platform_id, invoice_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE transaction_id=VALUES(transaction_id)
            """, (
                row['transaction_id'],
                datetime.strptime(row['transaction_datetime'], '%Y-%m-%d %H:%M:%S'),
                float(row['amount']),
                row['status'],
                row['transaction_type'],
                int(row['customer_id']),
                int(row['platform_id']),
                int(row['invoice_id'])
            ))
    db.commit()
    print(f"✅ {cursor.rowcount} transacciones importadas")

def main():
    try:
        db = create_db_connection()
        disable_foreign_keys(db.cursor())
        
        import_platforms(db)
        import_customers(db)
        import_invoices(db)
        import_transactions(db)
        
        enable_foreign_keys(db.cursor())
        print("🎉 ¡Importación completada con éxito!")
        
    except Exception as e:
        print(f"❌ Error durante la importación: {str(e)}")
        if 'db' in locals():
            db.rollback()
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    main()