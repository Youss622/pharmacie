import uuid
from datetime import datetime, timedelta
from google.adk.agents import LlmAgent
from google.adk.tools import ToolContext
from db import load_data, save_data

STOCKS_FILE = "stocks.json"
SALES_FILE = "sales.json"
INVOICES_FILE = "invoices.json"

DEFAULT_STOCKS = {
    "P001": {"name": "Paracétamol", "stock": 120, "lot": "LOT-2026-001", "expiry_date": "2026-10-30", "price": 2.50},
    "P002": {"name": "Ibuprofène", "stock": 50, "lot": "LOT-2025-010", "expiry_date": "2025-06-15", "price": 3.00}
}
DEFAULT_SALES = {}
DEFAULT_INVOICES = {}

# ---- Tools pour la gestion des stocks ----

def get_stock(product_id: str) -> dict:
    stocks = load_data(STOCKS_FILE, DEFAULT_STOCKS)
    if product_id in stocks:
        product_info = stocks[product_id]
        return {
            "product_id": product_id,
            "stock": product_info["stock"],
            "lot": product_info["lot"],
            "expiry_date": product_info["expiry_date"],
            "price": product_info.get("price", 0.0)
        }
    return {"error": f"Produit {product_id} non trouvé"}

def update_stock(product_id: str, quantity: int) -> dict:
    stocks = load_data(STOCKS_FILE, DEFAULT_STOCKS)
    if product_id in stocks:
        stocks[product_id]["stock"] += quantity
        save_data(STOCKS_FILE, stocks)
        return {
            "product_id": product_id,
            "updated_stock": stocks[product_id]["stock"]
        }
    return {"error": f"Produit {product_id} non trouvé"}

def list_expiring_products(days: int) -> dict:
    stocks = load_data(STOCKS_FILE, DEFAULT_STOCKS)
    expiring = []
    target_date = datetime.now() + timedelta(days=days)
    
    for pid, data in stocks.items():
        try:
            exp_date = datetime.strptime(data["expiry_date"], "%Y-%m-%d")
            if exp_date <= target_date:
                expiring.append({"product_id": pid, "name": data["name"], "expiry_date": data["expiry_date"]})
        except ValueError:
            pass
            
    return {
        "days": days,
        "products": expiring
    }

# ---- Tools pour la gestion des ventes ----

def register_sale(product_id: str, qty: int, tool_context: ToolContext = None) -> dict:
    stocks = load_data(STOCKS_FILE, DEFAULT_STOCKS)
    if product_id not in stocks:
        return {"error": f"Produit {product_id} non trouvé"}
        
    if stocks[product_id]["stock"] < qty:
        return {"error": f"Stock insuffisant. Stock actuel: {stocks[product_id]['stock']}"}
        
    stocks[product_id]["stock"] -= qty
    save_data(STOCKS_FILE, stocks)
    
    sales = load_data(SALES_FILE, DEFAULT_SALES)
    sale_id = f"SALE-{uuid.uuid4().hex[:8].upper()}"
    sale_data = {
        "sale_id": sale_id,
        "product_id": product_id,
        "quantity_sold": qty,
        "date": datetime.now().isoformat(),
        "total_price": qty * stocks[product_id].get("price", 0.0)
    }
    sales[sale_id] = sale_data
    save_data(SALES_FILE, sales)
    
    return {
        "status": "sale_registered",
        "sale_id": sale_id,
        "product_id": product_id,
        "quantity_sold": qty
    }

def generate_invoice(sale_id: str) -> dict:
    sales = load_data(SALES_FILE, DEFAULT_SALES)
    if sale_id not in sales:
        return {"error": f"Vente {sale_id} introuvable"}
        
    sale = sales[sale_id]
    return create_invoice([sale])

def validate_sale(product_id: str, qty: int) -> dict:
    stocks = load_data(STOCKS_FILE, DEFAULT_STOCKS)
    if product_id not in stocks:
        return {"is_valid": False, "reason": "Produit non trouvé"}
    if stocks[product_id]["stock"] < qty:
        return {"is_valid": False, "reason": f"Stock insuffisant. Actuel: {stocks[product_id]['stock']}"}
    return {
        "is_valid": True,
        "product_id": product_id,
        "quantity_validated": qty
    }

# ---- Tools pour la gestion des factures ----

def create_invoice(cart: list) -> dict:
    invoices = load_data(INVOICES_FILE, DEFAULT_INVOICES)
    invoice_id = f"INV-{uuid.uuid4().hex[:8].upper()}"
    
    total_amount = sum(item.get("total_price", 0.0) for item in cart)
    
    invoice_data = {
        "invoice_id": invoice_id,
        "date": datetime.now().isoformat(),
        "cart": cart,
        "total_amount": total_amount,
        "status": "created"
    }
    invoices[invoice_id] = invoice_data
    save_data(INVOICES_FILE, invoices)
    
    return {
        "invoice_id": invoice_id,
        "cart": cart,
        "status": "invoice_created"
    }

def modify_invoice(invoice_id: str, changes: dict) -> dict:
    invoices = load_data(INVOICES_FILE, DEFAULT_INVOICES)
    if invoice_id not in invoices:
        return {"error": f"Facture {invoice_id} introuvable"}
        
    invoices[invoice_id].update(changes)
    invoices[invoice_id]["modified_at"] = datetime.now().isoformat()
    save_data(INVOICES_FILE, invoices)
    
    return {
        "invoice_id": invoice_id,
        "changes": changes,
        "status": "invoice_modified"
    }

def get_invoice(invoice_id: str) -> dict:
    invoices = load_data(INVOICES_FILE, DEFAULT_INVOICES)
    if invoice_id in invoices:
        return {
            "invoice_id": invoice_id,
            "status": "invoice_retrieved",
            "data": invoices[invoice_id]
        }
    return {"error": f"Facture {invoice_id} introuvable"}

# ---- Tools pour l'AnalyticsAgent ----

def sales_report(date_range: str) -> dict:
    sales = load_data(SALES_FILE, DEFAULT_SALES)
    total_revenue = sum(sale.get("total_price", 0.0) for sale in sales.values())
    
    return {
        "date_range": date_range,
        "total_sales": len(sales),
        "total_revenue": total_revenue,
        "status": "report_generated"
    }

def top_selling_products() -> dict:
    sales = load_data(SALES_FILE, DEFAULT_SALES)
    product_counts = {}
    for sale in sales.values():
        pid = sale["product_id"]
        product_counts[pid] = product_counts.get(pid, 0) + sale["quantity_sold"]
        
    sorted_products = sorted(product_counts.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "status": "analysis_complete",
        "top_products": [{"product_id": k, "quantity_sold": v} for k, v in sorted_products[:5]]
    }

def monthly_sales_analysis() -> dict:
    sales = load_data(SALES_FILE, DEFAULT_SALES)
    monthly_data = {}
    
    for sale in sales.values():
        try:
            dt = datetime.fromisoformat(sale["date"])
            month_key = dt.strftime("%Y-%m")
            monthly_data[month_key] = monthly_data.get(month_key, 0.0) + sale.get("total_price", 0.0)
        except ValueError:
            pass
            
    return {
        "status": "monthly_analysis_complete",
        "monthly_revenue": monthly_data
    }

# ---- Sous-agents spécialisés ----

stock_agent = LlmAgent(
    name="StockAgent",
    model="gemini-2.5-flash",
    instruction="Vous gérez les stocks de la pharmacie. Vous vérifiez les stocks et prévenez des péremptions.",
    tools=[get_stock, update_stock, list_expiring_products]
)

sales_agent = LlmAgent(
    name="SalesAgent",
    model="gemini-2.5-flash",
    instruction="Vous gérez les ventes. Vérifiez les stocks avant toute vente et générez les factures correspondantes.",
    tools=[register_sale, generate_invoice, validate_sale]
)

invoice_agent = LlmAgent(
    name="InvoiceAgent",
    model="gemini-2.5-flash",
    instruction="Vous gérez les factures (création, modification, consultation). Pour usage administratif uniquement.",
    tools=[create_invoice, modify_invoice, get_invoice]
)

analytics_agent = LlmAgent(
    name="AnalyticsAgent",
    model="gemini-2.5-flash",
    instruction="Vous créez des rapports d'analyse sur les ventes et les performances de la pharmacie.",
    tools=[sales_report, top_selling_products, monthly_sales_analysis]
)

# ---- PharmacyOrchestrator Agent ----

pharmacy_agent = LlmAgent(
    name="PharmacyOrchestrator",
    model="gemini-2.5-flash",
    instruction="""
    Vous êtes un agent de gestion de pharmacie. Vous devez orchestrer les sous-agents pour gérer les stocks, les ventes et les factures. Vous devez :
    - Vérifier la disponibilité des stocks avant de permettre une vente.
    - Créer et gérer des factures de vente.
    - Analyser les ventes pour produire des rapports détaillés sur la performance commerciale.
    """,
    tools=[
        get_stock,
        update_stock,
        list_expiring_products,
        register_sale,
        generate_invoice,
        validate_sale,
        create_invoice,
        modify_invoice,
        get_invoice,
        sales_report,
        top_selling_products,
        monthly_sales_analysis
    ]
)
