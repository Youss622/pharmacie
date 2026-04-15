from django.db import models

class Expense(models.Model):
    CATEGORY_CHOICES = (
        ('Achats', 'Achats Fournisseurs'),
        ('Loyer', 'Loyer + Charges'),
        ('Salaires', 'Salaires + Divers'),
        ('Autre', 'Autre'),
    )
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='Autre')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} - {self.amount}"

class Employee(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    base_salary = models.DecimalField(max_digits=15, decimal_places=2)
    hire_date = models.DateField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Payroll(models.Model):
    STATUS_CHOICES = (
        ('Non payé', 'Non payé'),
        ('Payé', 'Payé'),
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    month = models.DateField(help_text="Premier jour du mois concerné")
    amount_paid = models.DecimalField(max_digits=15, decimal_places=2)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Non payé')
    payment_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"Paie - {self.employee} - {self.month.strftime('%Y-%m')}"
