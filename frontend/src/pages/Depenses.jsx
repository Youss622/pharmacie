import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Depenses() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'Autre', amount: 0, date: new Date().toISOString().split('T')[0], description: '' });

  useEffect(() => { loadData(); }, []);
  const loadData = () => api.get('expenses/').then(res => setExpenses(res.data));

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('expenses/', formData).then(() => {
      setShowForm(false);
      setFormData({ title: '', category: 'Autre', amount: 0, date: new Date().toISOString().split('T')[0], description: '' });
      loadData();
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Suivi des Dépenses & Flux Sortants</h1>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Annuler' : '+ Déclarer une Dépense'}</button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{marginBottom: '2rem', animation: 'fadeIn 0.3s'}}>
          <h2 style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Enregistrer un flux sortant autorisé</h2>
          <form onSubmit={handleSubmit} style={{display: 'flex', gap: '1rem', flexDirection: 'column'}}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div><label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Intitulé Comptable (Ex: Achat Seringues X)</label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{width: '100%'}}/></div>
              <div>
                  <label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Catégorie Globale</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required style={{width: '100%'}}>
                      <option value="Achats">Achats Fournisseurs / Produits</option>
                      <option value="Loyer">Loyer Immeuble + Charges Eau/Électricité</option>
                      <option value="Salaires">Salaires + Primes diverses</option>
                      <option value="Autre">Autre dépense inconnue</option>
                  </select>
              </div>
              <div><label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Montant (GNF)</label><input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required style={{width: '100%'}}/></div>
              <div><label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Date du débit bancaire</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required style={{width: '100%'}}/></div>
            </div>
            <button type="submit" style={{alignSelf: 'flex-start', background: 'var(--danger)'}}>✅ Acter la Dépense Définitive</button>
          </form>
        </div>
      )}

      <div className="glass-panel">
        {expenses.length === 0 ? <p style={{color: 'var(--text-muted)'}}>Aucune dépense enregistrée dans le grand livre cette année.</p> : (
            <table>
            <thead><tr><th>Date Opération</th><th>Intitulé de l'achat</th><th>Catégorie Code</th><th>Montant Débité</th><th>Action Admin</th></tr></thead>
            <tbody>
                {expenses.map(d => (
                <tr key={d.id}>
                    <td>{new Date(d.date).toLocaleDateString()}</td>
                    <td><strong>{d.title}</strong></td>
                    <td><span className="badge badge-orange" style={{color: 'var(--warning)', border: 'none', background:'#fef3c7'}}>{d.category}</span></td>
                    <td style={{color: 'var(--danger)', fontWeight: '800'}}>- {d.amount}</td>
                    <td><button style={{background: '#9CA3AF', padding:'0.3rem 0.6rem', border:'1px solid var(--danger)', color:'white'}} onClick={() => { if(window.confirm("Avertissement: Annuler la trace de cette dépense affectera les bilans. Confirmer ?")) { api.delete(`expenses/${d.id}/`).then(loadData) } }}>🗑️ Annuler Écriture</button></td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
      </div>
    </div>
  );
}
