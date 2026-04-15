import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Ordonnances() {
  const [ordonnances, setOrdonnances] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ client: '', doctor_name: '', date_issued: new Date().toISOString().split('T')[0], status: 'Pending' });

  useEffect(() => { 
      loadData(); 
  }, []);

  const loadData = () => {
      api.get('prescriptions/').then(res => setOrdonnances(res.data));
      api.get('clients/').then(res => setClients(res.data));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('prescriptions/', formData).then(() => {
      setShowForm(false);
      setFormData({ client: '', doctor_name: '', date_issued: new Date().toISOString().split('T')[0], status: 'Pending' });
      loadData();
    });
  };

  const markProcessed = (id) => {
      api.patch(`prescriptions/${id}/`, { status: 'Processed' }).then(loadData);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Registre des Ordonnances Médicales</h1>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Annuler' : '+ Saisir une Ordonnance'}</button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{marginBottom: '2rem'}}>
          <h2 style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Nouvelle Ordonnance</h2>
          <form onSubmit={handleSubmit} style={{display: 'flex', gap: '1rem', flexDirection: 'column'}}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div>
                  <label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Client Associé</label>
                  <select value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} required style={{width: '100%'}}>
                    <option value="">Sélectionner un patient...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                  </select>
              </div>
              <div>
                  <label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Médecin Prescripteur</label>
                  <input type="text" placeholder="Dr. Nom du médecin" value={formData.doctor_name} onChange={e => setFormData({...formData, doctor_name: e.target.value})} style={{width: '100%'}}/>
              </div>
              <div>
                  <label style={{display:'block', marginBottom:'5px', fontSize:'0.85rem'}}>Date de l'ordonnance</label>
                  <input type="date" value={formData.date_issued} onChange={e => setFormData({...formData, date_issued: e.target.value})} required style={{width: '100%'}}/>
              </div>
            </div>
            <button type="submit" style={{alignSelf: 'flex-start'}}>Générer le dossier Médical</button>
          </form>
        </div>
      )}

      <div className="glass-panel">
        {ordonnances.length === 0 ? <p style={{color: 'var(--text-muted)'}}>Le registre des ordonnances est vierge.</p> : (
            <table>
            <thead>
                <tr><th>Patient Renseigné</th><th>Médecin</th><th>Date de Prescription</th><th>Statut de Vente</th><th>Validation</th></tr>
            </thead>
            <tbody>
                {ordonnances.map(o => (
                <tr key={o.id}>
                    <td><strong>{o.client_name || 'Patient inconnu'}</strong></td>
                    <td>{o.doctor_name || 'Non renseigné'}</td>
                    <td>{new Date(o.date_issued).toLocaleDateString()}</td>
                    <td>
                        <span className={`badge ${o.status === 'Processed' ? 'badge-green' : 'badge-orange'}`}>
                            {o.status === 'Processed' ? 'Traitée Validée' : 'En attente de délivrance'}
                        </span>
                    </td>
                    <td>
                        {o.status === 'Pending' && (
                            <button style={{background: 'var(--primary)', padding:'0.3rem 0.6rem', fontSize: '0.8rem'}} onClick={() => markProcessed(o.id)}>
                                ✔️ Déclarer Délivrée
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
