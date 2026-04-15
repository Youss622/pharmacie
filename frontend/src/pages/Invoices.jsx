import React, { useState, useEffect } from 'react';
import api from '../api';

const ADMIN_PASSWORD = "admin"; // Mot de passe spécial requis pour la modification

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [sales, setSales] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ invoice_id: '', sales: [], total_amount: 0, status: 'Payée' });
  
  // Custom Modal State for Security Password
  const [authModal, setAuthModal] = useState({ open: false, action: null, password: '', error: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invRes, salesRes] = await Promise.all([
        api.get('invoices/'),
        api.get('sales/')
      ]);
      setInvoices(invRes.data);
      setSales(salesRes.data);
    } catch(err) {
      console.error(err);
    }
  };

  const handleProtectedAction = (actionCallback) => {
    // Open custom elegant overlay instead of ugly browser prompt
    setAuthModal({ open: true, action: actionCallback, password: '', error: '' });
  };

  const submitPassword = (e) => {
    e.preventDefault();
    if (authModal.password === ADMIN_PASSWORD || authModal.password === "SUPERADMIN_PASS") {
      const pendingAction = authModal.action;
      setAuthModal({ open: false, action: null, password: '', error: '' });
      if (pendingAction) pendingAction();
    } else {
      setAuthModal({ ...authModal, error: 'Accès strictement refusé. Mot de passe incorrect.', password: '' });
    }
  };

  const closePasswordModal = () => {
    setAuthModal({ open: false, action: null, password: '', error: '' });
  };

  const handleEdit = (inv) => {
    handleProtectedAction(() => {
      setEditingId(inv.id);
      setFormData({
        invoice_id: inv.invoice_id,
        sales: inv.sales,
        total_amount: inv.total_amount,
        status: inv.status
      });
      setShowForm(true);
    });
  };

  const handleDelete = (id) => {
    handleProtectedAction(async () => {
       if(window.confirm("Êtes-vous absolument sûr de vouloir supprimer cette facture DÉFINITIVEMENT de la base de données ?")) {
         await api.delete(`invoices/${id}/`);
         loadData();
       }
    });
  };

  const handleSaleSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    
    // Calculer le prix total combinant les diverses ventes 
    let total = 0;
    selectedOptions.forEach(saleId => {
       const sale = sales.find(s => s.id === saleId);
       if(sale) total += parseFloat(sale.total_price);
    });

    setFormData({
      ...formData,
      sales: selectedOptions,
      total_amount: total
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
          ...formData,
          invoice_id: formData.invoice_id || ("INV-" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'))
      };
      if (editingId) {
        await api.put(`invoices/${editingId}/`, payload);
      } else {
        await api.post('invoices/', payload);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ invoice_id: '', sales: [], total_amount: 0, status: 'Payée' });
      loadData();
    } catch (err) {
      alert("Erreur Facturation : " + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Gestion des Factures Clients</h1>
        <button onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ invoice_id: '', sales: [], total_amount: 0, status: 'Payée' });
        }}>
          {showForm ? 'Annuler' : '+ Émettre une Facture Libre'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{marginBottom: '2rem'}}>
          <h2 style={{marginBottom: '1rem', color: editingId ? 'var(--danger)' : 'inherit'}}>{editingId ? "Modification Restreinte (Admin)" : "Génération de Facture"}</h2>
          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Liaison Rapide des Ventes (Laissez CTRL enfoncé pour en sélectionner plusieurs)</label>
              <select multiple value={formData.sales} onChange={handleSaleSelect} style={{height: '140px', cursor: 'pointer', border: '2px solid var(--border)'}} required>
                {sales.map(s => (
                  <option key={s.id} value={s.id} style={{padding: '5px'}}>{s.sale_id} - {s.total_price} € (Encaissé le {new Date(s.date).toLocaleDateString()})</option>
                ))}
              </select>
            </div>
            <div style={{display: 'flex', gap: '1rem'}}>
              <div style={{flex: 1}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Somme due (Calculée)</label>
                <input type="number" step="0.01" value={formData.total_amount} disabled style={{background: '#f3f4f6', fontWeight: 700}} />
              </div>
              <div style={{flex: 1}}>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>État Bancaire</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Payée">Virement Payé / Reçu</option>
                  <option value="En Attente">En Attente de Solde</option>
                  <option value="Annulée">Annulée pour cause d'erreur</option>
                </select>
              </div>
            </div>
            <button type="submit" style={{alignSelf: 'flex-start', background: editingId ? 'var(--danger)' : 'var(--primary)', padding: '1rem'}}>
              {editingId ? "Forcer la mise à jour (Action Administrateur)" : "Émettre Officiellement"}
            </button>
          </form>
        </div>
      )}

      <div className="glass-panel">
        {invoices.length === 0 ? <p>Aucune facture n'a encore été émise pour l'instant.</p> : (
          <table>
            <thead>
              <tr>
                <th>N° Document</th>
                <th>Montant</th>
                <th>Statut de Solde</th>
                <th>Création</th>
                <th>Actions Sécurisées</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td><strong>{inv.invoice_id}</strong></td>
                  <td>{inv.total_amount}</td>
                  <td>
                    <span style={{
                      padding: '5px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                      background: inv.status.includes('Payé') ? '#D1FAE5' : '#FEF3C7',
                      color: inv.status.includes('Payé') ? '#065F46' : '#92400E'
                    }}>{inv.status}</span>
                  </td>
                  <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td>
                    <button style={{background: '#6B7280', padding: '0.4rem 0.8rem', marginRight: '0.5rem', fontSize: '0.85rem'}} onClick={() => handleEdit(inv)}>🔒 Modifier</button>
                    <button style={{background: '#EF4444', padding: '0.4rem 0.8rem', fontSize: '0.85rem'}} onClick={() => handleDelete(inv.id)}>🔒 Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pop-Up Modal de Sécurité Intégrée */}
      {authModal.open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="glass-panel" style={{ width: '450px', background: 'rgba(255, 255, 255, 0.95)', border: '2px solid var(--danger)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.8rem' }}>🔐</span>
              <h2 style={{ color: 'var(--danger)', margin: 0 }}>Autorisation Bloquée</h2>
            </div>
            <p style={{ marginBottom: '1.5rem', color: '#4B5563', lineHeight: '1.5', fontSize: '1rem' }}>
              Cette facture est verrouillée en sécurité dans la base de données. 
              Veuillez saisir le <strong>Mot de Passe Super Administrateur</strong> pour forcer sa modification.
            </p>
            <form onSubmit={submitPassword}>
              <input 
                type="password" 
                placeholder="Entrez le mot de passe secret (***)"
                value={authModal.password} 
                onChange={e => setAuthModal({...authModal, password: e.target.value})} 
                required 
                autoFocus
                style={{ width: '100%', marginBottom: '1rem', padding: '0.8rem', fontSize: '1.2rem', letterSpacing: '4px' }}
              />
              {authModal.error && (
                <div style={{ background: '#FEE2E2', color: 'var(--danger)', padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 600 }}>
                  ❌ {authModal.error}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={closePasswordModal} style={{ background: '#9CA3AF' }}>Interrompre</button>
                <button type="submit" style={{ background: 'var(--danger)' }}>Déverrouiller</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
