document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const API_URL = 'http://localhost:3000/api';
    let currentCustomerId = null;
    
    // Elementos del DOM
    const tabCustomers = document.getElementById('tab-customers');
    const tabTransactions = document.getElementById('tab-transactions');
    const tabReports = document.getElementById('tab-reports');
    const customersSection = document.getElementById('customers-section');
    const transactionsSection = document.getElementById('transactions-section');
    const reportsSection = document.getElementById('reports-section');
    const addCustomerBtn = document.getElementById('add-customer-btn');
    const customerModal = new bootstrap.Modal(document.getElementById('customerModal'));
    const saveCustomerBtn = document.getElementById('save-customer-btn');
    const customerForm = document.getElementById('customer-form');
    
    // Manejar pestañas
    tabCustomers.addEventListener('click', () => showSection('customers'));
    tabTransactions.addEventListener('click', () => showSection('transactions'));
    tabReports.addEventListener('click', () => showSection('reports'));
    
    // Mostrar sección
    function showSection(section) {
        customersSection.style.display = 'none';
        transactionsSection.style.display = 'none';
        reportsSection.style.display = 'none';
        
        tabCustomers.classList.remove('active');
        tabTransactions.classList.remove('active');
        tabReports.classList.remove('active');
        
        if (section === 'customers') {
            customersSection.style.display = 'block';
            tabCustomers.classList.add('active');
            loadCustomers();
        } else if (section === 'transactions') {
            transactionsSection.style.display = 'block';
            tabTransactions.classList.add('active');
            loadTransactions();
        } else {
            reportsSection.style.display = 'block';
            tabReports.classList.add('active');
            loadReports();
        }
    }
    
    // Cargar clientes
    async function loadCustomers() {
        try {
            const response = await fetch(`${API_URL}/customers`);
            const customers = await response.json();
            
            const tbody = document.querySelector('#customers-table tbody');
            tbody.innerHTML = '';
            
            customers.forEach(customer => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${customer.customer_id}</td>
                    <td>${customer.name}</td>
                    <td>${customer.identification_number}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone}</td>
                    <td>
                        <button class="btn btn-sm btn-primary btn-action edit-btn" data-id="${customer.customer_id}">Editar</button>
                        <button class="btn btn-sm btn-danger btn-action delete-btn" data-id="${customer.customer_id}">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            // Agregar eventos a los botones
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => editCustomer(btn.dataset.id));
            });
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteCustomer(btn.dataset.id));
            });
            
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            alert('Error al cargar clientes');
        }
    }
    
    // Cargar transacciones
    async function loadTransactions() {
        try {
            const response = await fetch(`${API_URL}/transactions`);
            const transactions = await response.json();
            
            const tbody = document.querySelector('#transactions-table tbody');
            tbody.innerHTML = '';
            
            transactions.forEach(trans => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${trans.transaction_id}</td>
                    <td>${new Date(trans.transaction_datetime).toLocaleString()}</td>
                    <td>$${trans.amount.toLocaleString()}</td>
                    <td>${trans.status}</td>
                    <td>${trans.platform_name}</td>
                    <td>${trans.customer_name}</td>
                `;
                tbody.appendChild(tr);
            });
            
        } catch (error) {
            console.error('Error al cargar transacciones:', error);
            alert('Error al cargar transacciones');
        }
    }
    
    // Cargar reportes
    async function loadReports() {
        try {
            // Total pagado por cliente
            const paidResponse = await fetch(`${API_URL}/reports/total-paid`);
            const paidData = await paidResponse.json();
            
            const paidTbody = document.querySelector('#total-paid-table tbody');
            paidTbody.innerHTML = '';
            
            paidData.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.identification_number}</td>
                    <td>$${item.total_paid.toLocaleString()}</td>
                    <td>${item.transactions_count}</td>
                `;
                paidTbody.appendChild(tr);
            });
            
            // Facturas pendientes
            const invoicesResponse = await fetch(`${API_URL}/reports/pending-invoices`);
            const invoicesData = await invoicesResponse.json();
            
            const invoicesTbody = document.querySelector('#pending-invoices-table tbody');
            invoicesTbody.innerHTML = '';
            
            invoicesData.forEach(invoice => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${invoice.number_invoices}</td>
                    <td>${invoice.customer_name}</td>
                    <td>$${invoice.billed_amount.toLocaleString()}</td>
                    <td>$${(invoice.billed_amount - invoice.paid_amount).toLocaleString()}</td>
                `;
                invoicesTbody.appendChild(tr);
            });
            
        } catch (error) {
            console.error('Error al cargar reportes:', error);
            alert('Error al cargar reportes');
        }
    }
    
    // Agregar nuevo cliente
    addCustomerBtn.addEventListener('click', () => {
        currentCustomerId = null;
        document.getElementById('modal-title').textContent = 'Nuevo Cliente';
        customerForm.reset();
        customerModal.show();
    });
    
    // Editar cliente
    async function editCustomer(id) {
        try {
            const response = await fetch(`${API_URL}/customers/${id}`);
            const customer = await response.json();
            
            currentCustomerId = id;
            document.getElementById('modal-title').textContent = 'Editar Cliente';
            document.getElementById('customer-id').value = customer.customer_id;
            document.getElementById('customer-name').value = customer.name;
            document.getElementById('customer-identification').value = customer.identification_number;
            document.getElementById('customer-address').value = customer.address;
            document.getElementById('customer-phone').value = customer.phone;
            document.getElementById('customer-email').value = customer.email;
            
            customerModal.show();
        } catch (error) {
            console.error('Error al cargar cliente:', error);
            alert('Error al cargar cliente');
        }
    }
    
    // Guardar cliente
    saveCustomerBtn.addEventListener('click', async () => {
        const customerData = {
            name: document.getElementById('customer-name').value,
            identification_number: document.getElementById('customer-identification').value,
            address: document.getElementById('customer-address').value,
            phone: document.getElementById('customer-phone').value,
            email: document.getElementById('customer-email').value
        };
        
        try {
            let response;
            if (currentCustomerId) {
                // Actualizar cliente existente
                response = await fetch(`${API_URL}/customers/${currentCustomerId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(customerData)
                });
            } else {
                // Crear nuevo cliente
                response = await fetch(`${API_URL}/customers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(customerData)
                });
            }
            
            const result = await response.json();
            
            if (response.ok) {
                customerModal.hide();
                loadCustomers();
                alert(currentCustomerId ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente');
            } else {
                alert(result.error || 'Error al guardar cliente');
            }
        } catch (error) {
            console.error('Error al guardar cliente:', error);
            alert('Error al guardar cliente');
        }
    });
    
    // Eliminar cliente
    async function deleteCustomer(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) return;
        
        try {
            const response = await fetch(`${API_URL}/customers/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Cliente eliminado correctamente');
                loadCustomers();
            } else {
                alert(result.error || 'Error al eliminar cliente');
            }
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            alert('Error al eliminar cliente');
        }
    }
    
    // Inicializar
    showSection('customers');
});