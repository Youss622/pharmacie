from django.db import models
from clients.models import Client
from inventory.models import Product

class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    delivery_time_days = models.IntegerField(default=1)

    def __str__(self):
        return self.name

class Delivery(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'En attente'),
        ('Received', 'Réceptionné'),
        ('Cancelled', 'Annulé'),
    )
    reference = models.CharField(max_length=100, unique=True)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    expected_date = models.DateField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.reference} - {self.supplier.name}"

class DeliveryItem(models.Model):
    delivery = models.ForeignKey(Delivery, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

class Insurance(models.Model):
    provider_name = models.CharField(max_length=255)
    coverage_rate = models.DecimalField(max_digits=5, decimal_places=2, help_text="Taux de couverture en %")

    def __str__(self):
        return self.provider_name

class Prescription(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'En attente'),
        ('Processed', 'Traitée'),
    )
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True)
    doctor_name = models.CharField(max_length=255, blank=True, null=True)
    date_issued = models.DateField()
    image_url = models.CharField(max_length=500, blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ordonnance de {self.client.name if self.client else 'Inconnu'}"
