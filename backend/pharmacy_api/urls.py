from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter

from inventory.views import ProductViewSet
from clients.views import ClientViewSet
from sales.views import SaleViewSet
from billing.views import InvoiceViewSet
from sales.analytics import top_selling_products, monthly_sales_analysis, dashboard_stats
from operations.views import SupplierViewSet, DeliveryViewSet, InsuranceViewSet, PrescriptionViewSet
from administration.views import ExpenseViewSet, EmployeeViewSet, PayrollViewSet
from administration.analytics import accounting_balance, purge_database

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'clients', ClientViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'invoices', InvoiceViewSet)

# V2 Routers
router.register(r'suppliers', SupplierViewSet)
router.register(r'deliveries', DeliveryViewSet)
router.register(r'insurances', InsuranceViewSet)
router.register(r'prescriptions', PrescriptionViewSet)
router.register(r'expenses', ExpenseViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'payrolls', PayrollViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/analytics/top-products/', top_selling_products, name='top_products'),
    path('api/analytics/monthly-sales/', monthly_sales_analysis, name='monthly_sales'),
    path('api/analytics/dashboard/', dashboard_stats, name='dashboard_stats'),
    path('api/analytics/accounting/', accounting_balance, name='accounting_balance'),
    path('api/admin/purge/', purge_database, name='purge_database'),
    path('api/', include(router.urls)),
]
