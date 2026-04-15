import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Assurances() {
  const [assurances, setAssurances] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ provider_name: '', coverage_rate: 0 });

  useEffect(() => { loadData(); }, []);
  const loadData = () => api.get('insurances/').then(res => setAssurances(res.data));

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('insurances/', formData).then(() => {
      setShowForm(false);
      setFormData({ provider_name: '', coverage_rate: 0 });
      loadData();
    });
  };

  const handleDelete = (id) => {
     if(window.confirm("Supprimer cette mutuelle partenaire ?")) {
         api.delete(`insurances/${id}/`).then(loadData);
     }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestion des Mutuelles Paretanaires</h1>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Annuler' : '+ Nouveau Contrat Assureur'}</button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{marginBottom: '2rem'}}>
          <h2 style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Enregistrement Assurance</h2>
          <form onSubmit={handleSubmit} style={{display: 'flex', gap: '1rem', flexDirection: 'column'}}>
            <div style={{display: 'flex', gap: '1rem'}}>
              <div style={{flex: 1}}>
                  <label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Nom de l'Organisme / Mutuelle</label>
                  <input type="text" value={formData.provider_name} onChange={e => setFormData({...formData, provider_name: e.target.value})} required style={{width: '100%'}}/>
              </div>
              <div>
                  <label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Taux de Couverture (Ex: 80%)</label>
                  <input type="number" step="0.5" value={formData.coverage_rate} onChange={e => setFormData({...formData, coverage_rate: e.target.value})} required style={{width: '100%'}}/>
              </div>
            </div>
            <button type="submit" style={{alignSelf: 'flex-start'}}>✅ Valider le paramétrage</button>
          </form>
        </div>
      )}

      <div className="glass-panel">
        {assurances.length === 0 ? <p style={{color: 'var(--text-muted)'}}>Aucune assurance paramétrée.</p> : (
            <table>
            <thead>
                <tr><th>Mutuelle Conventionnée</th><th>Couverture Financière (%)</th><th>Boutons d'Actions</th></tr>
            </thead>
            <tbody>
                {assurances.map(a => (
                <tr key={a.id}>
                    <td><span style={{fontSize: '1.2rem', marginRight: '10px'}}>🛡️</span> <strong>{a.provider_name}</strong></td>
                    <td><span className="badge badge-green" style={{fontSize:'0.9rem'}}>Prise en charge à {a.coverage_rate}%</span></td>
                    <td><button style={{background: 'var(--danger)', padding:'0.3rem 0.6rem'}} onClick={() => handleDelete(a.id)}>Rompre le contrat</button></td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
      </div>
    </div>
  );
}
