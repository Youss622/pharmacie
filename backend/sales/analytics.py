from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
import datetime
from .models import Sale
from inventory.models import Product

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_selling_products(request):
    top_sales = Sale.objects.values('product__name').annotate(
        total_quantity=Sum('quantity_sold'),
        total_revenue=Sum('total_price')
    ).order_by('-total_quantity')[:5]
    return Response(top_sales)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_sales_analysis(request):
    monthly = Sale.objects.annotate(month=TruncMonth('date')).values('month').annotate(
        revenue=Sum('total_price'),
        sales_count=Count('id')
    ).order_by('month')
    return Response(monthly)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    today = timezone.now().date()
    yesterday = today - datetime.timedelta(days=1)
    
    # KPIs
    ventes_jour = Sale.objects.filter(date__date=today).aggregate(Sum('total_price'))['total_price__sum'] or 0
    ventes_hier = Sale.objects.filter(date__date=yesterday).aggregate(Sum('total_price'))['total_price__sum'] or 0
    ordo_jour = Sale.objects.filter(date__date=today).count()
    clients_mois = Sale.objects.filter(date__month=today.month, date__year=today.year).values('client').distinct().count()
    
    produits_critiques = Product.objects.filter(stock__lte=20).order_by('stock')
    
    # Graphique Ventes semaine
    start_of_week = today - datetime.timedelta(days=today.weekday())
    chart_data = []
    days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
    for i in range(7):
        d = start_of_week + datetime.timedelta(days=i)
        val = Sale.objects.filter(date__date=d).aggregate(Sum('total_price'))['total_price__sum'] or 0
        chart_data.append({
            "name": days[i], 
            "uv": float(val),
            "fill": "#10B981" if d == today else "#bfdbfe"
        })
        
    stocks_alert = []
    for p in produits_critiques[:6]:
        stocks_alert.append({
            "id": p.id,
            "name": p.name,
            "stock": p.stock,
            "status": "Critique" if p.stock < 10 else "Faible",
            "color": "var(--danger)" if p.stock < 10 else "var(--warning)",
            "width": str(max(min(p.stock * 5, 100), 5)) + "%"
        })

    return Response({
        "kpis": {
            "vente_jour": float(ventes_jour),
            "vente_hier": float(ventes_hier),
            "ordo_jour": ordo_jour,
            "clients_mois": clients_mois,
            "alertes": produits_critiques.count()
        },
        "chart": chart_data,
        "stocks": stocks_alert
    })
