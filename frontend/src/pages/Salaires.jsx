import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Salaires() {
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', role: 'Pharmacien Titulaire', base_salary: 0, hire_date: new Date().toISOString().split('T')[0] });

  useEffect(() => { loadData(); }, []);
  const loadData = () => {
      api.get('employees/').then(res => setEmployees(res.data));
      api.get('payrolls/').then(res => setPayrolls(res.data));
  };

  const handleCreateEmployee = (e) => {
    e.preventDefault();
    api.post('employees/', formData).then(() => {
      setShowForm(false);
      loadData();
    });
  };

  const payerSalaire = (employee_id, employee_name, salaire) => {
      if(!window.confirm(`⚠️ CONFIRMATION BANCAIRE\nVoulez-vous déclencher le paiement immédiat du salaire de ${salaire} GNF pour ${employee_name} ? (Cela créera une Dépense fiscale).`)) return;
      const today = new Date().toISOString().split('T')[0];
      
      api.post('payrolls/', {
          employee: employee_id,
          month: today,
          amount_paid: salaire,
          status: 'Payé',
          payment_date: today
      }).then(() => {
          // Engendrer mécaniquement la dépense dans le bilan !
          api.post('expenses/', {
              title: `Paiement Salaire (${employee_name})`,
              category: "Salaires",
              amount: salaire,
              date: today,
              description: "Déversement automatique des fonds RH."
          }).then(() => {
              alert("✅ Salaire Payé et Dépense enregistrée dans le Livre des Comptes.");
              loadData();
          });
      }).catch(err => alert("Le paiement a été refusé par le serveur."));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ressources Humaines & Registre de Paie</h1>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Annuler' : '+ Embaucher un Salarié'}</button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{marginBottom: '2rem'}}>
          <h2 style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Création Fiche Salarié</h2>
          <form onSubmit={handleCreateEmployee} style={{display: 'flex', gap: '1rem', flexDirection: 'column'}}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div><label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Prénom</label><input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required style={{width: '100%'}}/></div>
              <div><label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Nom de famille</label><input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required style={{width: '100%'}}/></div>
              <div><label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Grade / Rôle Pharmacien</label><input type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required style={{width: '100%'}}/></div>
              <div><label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Salaire net fixe convenu</label><input type="number" step="0.01" value={formData.base_salary} onChange={e => setFormData({...formData, base_salary: e.target.value})} required style={{width: '100%'}}/></div>
            </div>
            <button type="submit" style={{alignSelf: 'flex-start'}}>✅ Officialiser le contrat RH</button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.2fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Bloc 1 : Liste */}
          <div className="glass-panel">
              <h3 style={{marginBottom: '1.5rem'}}>Liste du Personnel Actif</h3>
              {employees.length === 0 ? <p style={{color:'var(--text-muted)'}}>Aucun cadre médical enregistré.</p> : (
              <table>
                  <thead><tr><th>Identité Employé(e)</th><th>Rôle (Poste)</th><th>Salaire Net Prévu</th><th>Action de Paie</th></tr></thead>
                  <tbody>
                      {employees.map(emp => (
                          <tr key={emp.id}>
                              <td><strong>{emp.first_name} {emp.last_name}</strong></td>
                              <td>{emp.role}</td>
                              <td>{emp.base_salary} GNF</td>
                              <td><button style={{background:'var(--blue)', fontSize:'0.75rem', fontWeight:'bold'}} onClick={() => payerSalaire(emp.id, `${emp.first_name} ${emp.last_name}`, emp.base_salary)}>💰 Lancer le Virement</button></td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              )}
          </div>
          
          {/* Bloc 2 : Traces */}
          <div className="glass-panel">
              <h3 style={{marginBottom: '1.5rem'}}>Historique des Fiches de Paie (Mois M)</h3>
              {payrolls.length === 0 ? <p style={{color:'var(--text-muted)'}}>Aucun versement n'a encore été déclenché depuis l'interface banque.</p> : (
              <table>
                  <thead><tr><th>Exécution</th><th>Bénéficiaire Compte</th><th>Montant Transféré</th><th>Validation</th></tr></thead>
                  <tbody>
                      {payrolls.map(p => (
                          <tr key={p.id}>
                              <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                              <td><strong>{p.employee_name}</strong></td>
                              <td>{p.amount_paid}</td>
                              <td><span className="badge badge-green" style={{border:'none', padding:'0.2rem 0.6rem'}}>Réussi</span></td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              )}
          </div>
      </div>
    </div>
  );
}
