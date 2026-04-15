import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact: '', email: '', delivery_time_days: 1 });

  useEffect(() => { loadData(); }, []);
  const loadData = () => api.get('suppliers/').then(res => setFournisseurs(res.data));

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('suppliers/', formData).then(() => {
      setShowForm(false);
      setFormData({ name: '', contact: '', email: '', delivery_time_days: 1 });
      loadData();
    });
  };

  const handleDelete = (id) => {
     if(window.confirm("Supprimer ce fournisseur ?")) {
         api.delete(`suppliers/${id}/`).then(loadData);
     }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Annuaire Fournisseurs</h1>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Annuler' : '+ Nouveau Fournisseur'}</button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{marginBottom: '2rem', animation: 'fadeIn 0.3s ease'}}>
          <h2 style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Enregistrement Fournisseur</h2>
          <form onSubmit={handleSubmit} style={{display: 'flex', gap: '1rem', flexDirection: 'column'}}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <input type="text" placeholder="Nom de l'entreprise pharmaceutique" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required/>
              <input type="text" placeholder="Numéro de contact (Ligne directe)" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})}/>
              <input type="email" placeholder="Email professionnel" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
              <input type="number" placeholder="Délai estimé des livraisons (en jours)" value={formData.delivery_time_days} onChange={e => setFormData({...formData, delivery_time_days: e.target.value})}/>
            </div>
            <button type="submit" style={{alignSelf: 'flex-start'}}>Générer le dossier Fournisseur</button>
          </form>
        </div>
      )}

      <div className="glass-panel">
        {fournisseurs.length === 0 ? <p style={{color: 'var(--text-muted)'}}>Aucun fournisseur enregistré.</p> : (
            <table>
            <thead>
                <tr><th>Entreprise Partenaire</th><th>Contact</th><th>Email</th><th>Délai moyen d'expédition</th><th>Administration</th></tr>
            </thead>
            <tbody>
                {fournisseurs.map(f => (
                <tr key={f.id}>
                    <td><div style={{display: 'flex', alignItems: 'center', gap: '10px'}}><div style={{width:'30px',height:'30px',borderRadius:'50%',background:'var(--bg-main)',display:'flex',justifyContent:'center',alignItems:'center'}}>🏢</div><strong>{f.name}</strong></div></td>
                    <td>{f.contact || 'Non renseigné'}</td>
                    <td>{f.email || '-'}</td>
                    <td><span className="badge badge-purple">{f.delivery_time_days} jours</span></td>
                    <td><button style={{background: 'var(--danger)', padding:'0.3rem 0.6rem'}} onClick={() => handleDelete(f.id)}>Exclure</button></td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
      </div>
    </div>
  );
}
