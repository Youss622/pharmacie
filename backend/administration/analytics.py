from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from .models import Expense, Payroll
from sales.models import Sale
from django.utils import timezone

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def accounting_balance(request):
    today = timezone.now().date()
    
    # 1. Total Recettes (Ventes du mois)
    sales = Sale.objects.filter(date__month=today.month, date__year=today.year)
    total_sales = sales.aggregate(Sum('total_price'))['total_price__sum'] or 0
    
    # 2. Total Dépenses
    expenses = Expense.objects.filter(date__month=today.month, date__year=today.year)
    achats = expenses.filter(category='Achats').aggregate(Sum('amount'))['amount__sum'] or 0
    loyer = expenses.filter(category='Loyer').aggregate(Sum('amount'))['amount__sum'] or 0
    autres_expenses = expenses.exclude(category__in=['Achats', 'Loyer']).aggregate(Sum('amount'))['amount__sum'] or 0
    total_expenses = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
    
    # 3. Salaires
    salaires = Payroll.objects.filter(month__month=today.month, month__year=today.year).aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
    total_expenses += salaires 
    
    # 4. Calcul Bilan
    net_profit = float(total_sales) - float(total_expenses)
    tva = float(total_sales) * 0.18 # 18% par défaut pour l'exemple
    
    return Response({
        "recettes": {
            "total": float(total_sales),
            "ventes": float(total_sales)
        },
        "depenses": {
            "total": float(total_expenses),
            "achats": float(achats),
            "loyer": float(loyer),
            "salaires_et_divers": float(salaires) + float(autres_expenses)
        },
        "bilan": {
            "benefice_net": net_profit,
            "tva": tva
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purge_database(request):
    password = request.data.get('password', '')
    if password != '12345':
        return Response({'detail': 'Accès Interdit. Mot de passe incorrect.'}, status=403)
        
    from inventory.models import Product
    from clients.models import Client
    from billing.models import Invoice
    from operations.models import Supplier, Delivery, Insurance, Prescription
    from sales.models import Sale
    from administration.models import Employee
    
    Sale.objects.all().delete()
    Product.objects.all().delete()
    Client.objects.all().delete()
    Invoice.objects.all().delete()
    Supplier.objects.all().delete()
    Delivery.objects.all().delete()
    Insurance.objects.all().delete()
    Prescription.objects.all().delete()
    Expense.objects.all().delete()
    Employee.objects.all().delete()
    Payroll.objects.all().delete()
    
    return Response({'status': 'Database purged successfully'})
