from rest_framework import viewsets, permissions
from .models import Product
from .serializers import ProductSerializer

class IsAdminOrPharmacist(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser or request.user.role in ['ADMIN', 'PHARMACIST']:
            return True
        return False

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrPharmacist]
