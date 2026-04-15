import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    api.get('clients/').then(res => setClients(res.data)).catch(console.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('clients/', formData);
      setShowForm(false);
      setFormData({ name: '', phone: '', address: '' });
      loadClients();
    } catch (err) {
      alert("Erreur lors de la création du client");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Annuaire Clients</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Nouveau Client'}
        </button>
      </div>
      
      {showForm && (
        <div className="glass-panel" style={{marginBottom: '2rem'}}>
          <h2 style={{marginBottom: '1rem'}}>Ajouter un client</h2>
          <form onSubmit={handleSubmit} style={{display: 'flex', gap: '1rem', alignItems: 'flex-end'}}>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Nom complet</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Téléphone</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div style={{flex: 2}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Adresse</label>
              <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <button type="submit">Enregistrer</button>
          </form>
        </div>
      )}

      <div className="glass-panel">
        {clients.length === 0 ? <p>Aucun client enregistré dans la base de données.</p> : (
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Adresse</th>
                <th>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id}>
                  <td style={{fontWeight: 500}}>{c.name}</td>
                  <td>{c.phone || '-'}</td>
                  <td>{c.address || '-'}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
