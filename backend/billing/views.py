from rest_framework import viewsets, permissions
from .models import Invoice
from .serializers import InvoiceSerializer

class InvoicePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        # Les Guests ne gèrent pas les factures, seuls Admin/Pharmacien lisent ou créent
        if request.user.role == 'GUEST':
            return request.method in permissions.SAFE_METHODS
        if request.method in ['POST', 'GET', 'HEAD', 'OPTIONS']:
            return True
        # Strictement Admin pour modif/suppression
        return request.user.role == 'ADMIN'

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [InvoicePermission]
