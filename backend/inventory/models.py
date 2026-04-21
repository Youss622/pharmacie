from django.db import models

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('Antalgique', 'Antalgique'),
        ('Antibiotique', 'Antibiotique'),
        ('Anti-inflammatoire', 'Anti-inflammatoire'),
        ('Antidiabétique', 'Antidiabétique'),
        ('Vitamines', 'Vitamines'),
        ('Gastro-entérologie', 'Gastro-entérologie'),
        ('Antihistaminique', 'Antihistaminique'),
        ('Soin', 'Soin'),
    ]
    
    product_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    stock = models.IntegerField(default=0)
    lot = models.CharField(max_length=100)
    expiry_date = models.DateField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='GNF')
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='Antalgique')

    def __str__(self):
        return self.name
