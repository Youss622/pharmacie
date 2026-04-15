from django.db import models
from sales.models import Sale

class Invoice(models.Model):
    invoice_id = models.CharField(max_length=50, unique=True)
    sales = models.ManyToManyField(Sale)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='created')
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.invoice_id
