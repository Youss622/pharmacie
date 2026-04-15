import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Livraison() {
  const [deliveries, setDeliveries] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ reference: '', expected_date: '', supplier: '', status: 'Pending' });

  useEffect(() => { 
      loadData(); 
  }, []);

  const loadData = () => {
      api.get('deliveries/').then(res => setDeliveries(res.data));
      api.get('suppliers/').then(res => setSuppliers(res.data));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('deliveries/', formData).then(() => {
      setShowForm(false);
      setFormData({ reference: '', expected_date: '', supplier: '', status: 'Pending' });
      loadData();
    }).catch(err => alert("Erreur d'ajout. Veuillez vérifier les informations saisies."));
  };

  const markReceived = (id) => {
      api.patch(`deliveries/${id}/`, { status: 'Received' }).then(loadData);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Suivi Logistique des Livraisons</h1>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Annuler' : '+ Prévoir une Livraison'}</button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{marginBottom: '2rem'}}>
          <h2 style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Nouvel Arrivage (Commande)</h2>
          <form onSubmit={handleSubmit} style={{display: 'flex', gap: '1rem', flexDirection: 'column'}}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div>
                  <label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Référence Bon Commande</label>
                  <input type="text" placeholder="Ex: BL-1002" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} required style={{width: '100%'}}/>
              </div>
              <div>
                  <label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Fournisseur Destinataire</label>
                  <select value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} required style={{width: '100%'}}>
                    <option value="">Sélectionner une entreprise...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.delivery_time_days}j estimé)</option>)}
                  </select>
              </div>
              <div>
                  <label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Date planifiée d'arrivée</label>
                  <input type="date" value={formData.expected_date} onChange={e => setFormData({...formData, expected_date: e.target.value})} required style={{width: '100%'}}/>
              </div>
            </div>
            <button type="submit" style={{alignSelf: 'flex-start'}}>Générer le module de livraison</button>
          </form>
        </div>
      )}

      <div className="glass-panel">
        {deliveries.length === 0 ? <p style={{color: 'var(--text-muted)'}}>Aucun flux logistique ne circule vers nos centres.</p> : (
            <table>
            <thead>
                <tr><th>Ref B/L</th><th>Fournisseur</th><th>Date Prévue</th><th>Étape</th><th>Actions Terrain</th></tr>
            </thead>
            <tbody>
                {deliveries.map(d => (
                <tr key={d.id}>
                    <td><strong>📦 {d.reference}</strong></td>
                    <td>{d.supplier_name || 'Chargement des méta-data...'}</td>
                    <td>{new Date(d.expected_date).toLocaleDateString()}</td>
                    <td>
                        <span className={`badge ${d.status === 'Received' ? 'badge-green' : 'badge-orange'}`}>
                            {d.status === 'Received' ? 'Marchandise Réceptionnée' : 'Camion en transit (Attente)'}
                        </span>
                    </td>
                    <td>
                        {d.status === 'Pending' && (
                            <button style={{background: 'var(--primary)', padding:'0.3rem 0.6rem', fontSize: '0.8rem'}} onClick={() => markReceived(d.id)}>
                                📥 Confirmer la rentrée en Bilan
                            </button>
                        )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
      </div>
    </div>
  );
}
