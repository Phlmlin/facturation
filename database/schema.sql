-- =============================================
-- SaaS Gestion Commerciale – Schéma PostgreSQL
-- Multi-tenant : chaque entreprise a ses données isolées
-- =============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- COMPANIES (une par utilisateur en MVP)
-- =============================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT '',
    logo_url VARCHAR(500),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    nif VARCHAR(100),
    rccm VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'XOF',
    plan VARCHAR(20) DEFAULT 'free', -- free | pro | business
    doc_count_this_month INTEGER DEFAULT 0,
    doc_count_reset_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- CLIENTS
-- =============================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- PRODUCTS / SERVICES
-- =============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5, 2) DEFAULT 0, -- ex: 18 pour 18%
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- QUOTES (DEVIS)
-- =============================================
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    number VARCHAR(50) NOT NULL, -- ex: DEV-2024-0001
    status VARCHAR(20) DEFAULT 'draft', -- draft | sent | accepted | refused
    issue_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    subtotal NUMERIC(15, 2) DEFAULT 0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    total NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    converted_to_invoice UUID, -- référence facture si convertie
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, number)
);

CREATE TABLE quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 1,
    unit_price NUMERIC(15, 2) DEFAULT 0,
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    line_total NUMERIC(15, 2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0
);

-- =============================================
-- INVOICES (FACTURES + PROFORMA)
-- =============================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    number VARCHAR(50) NOT NULL, -- FAC-2024-0001 ou PRO-2024-0001
    type VARCHAR(20) DEFAULT 'invoice', -- invoice | proforma
    status VARCHAR(20) DEFAULT 'pending', -- pending | paid | overdue
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal NUMERIC(15, 2) DEFAULT 0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    total NUMERIC(15, 2) DEFAULT 0,
    amount_paid NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, number)
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 1,
    unit_price NUMERIC(15, 2) DEFAULT 0,
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    line_total NUMERIC(15, 2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0
);

-- =============================================
-- PAYMENTS
-- =============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    method VARCHAR(50) DEFAULT 'cash', -- cash | bank | mobile_money | other
    paid_at TIMESTAMP DEFAULT NOW(),
    notes TEXT
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_clients_company_id ON clients(company_id);
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_quotes_company_id ON quotes(company_id);
CREATE INDEX idx_quotes_client_id ON quotes(client_id);
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);

-- =============================================
-- FUNCTION: Auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trig_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trig_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trig_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trig_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trig_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
