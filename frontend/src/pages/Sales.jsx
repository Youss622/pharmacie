import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ product: '', client: '', quantity_sold: 1, total_price: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [salesRes, prodRes, cliRes] = await Promise.all([
        api.get('sales/'),
        api.get('products/'),
        api.get('clients/')
      ]);
      setSales(salesRes.data);
      setProducts(prodRes.data);
      setClients(cliRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductChange = (e) => {
    const prodId = e.target.value;
    const prod = products.find(p => p.id == prodId);
    setFormData({
      ...formData,
      product: prodId,
      total_price: prod ? (prod.price * formData.quantity_sold) : 0
    });
  };

  const handleQuantityChange = (e) => {
    const qty = parseInt(e.target.value) || 1;
    const prod = products.find(p => p.id == formData.product);
    setFormData({
      ...formData,
      quantity_sold: qty,
      total_price: prod ? (prod.price * qty) : 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        sale_id: "SALE-" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
        client: formData.client || null // Si pas de client on envoie null
      };

      await api.post('sales/', payload);
      
      // Mettre à jour le stock côté front visuellement ou recharger tout complet
      setShowForm(false);
      setFormData({ product: '', client: '', quantity_sold: 1, total_price: 0 });
      loadData();
    } catch (err) {
      alert("Erreur Caisse : " + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Point de Vente (Caisse)</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Fermer Caisse' : '+ Nouvelle Vente'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{marginBottom: '2rem'}}>
          <h2 style={{marginBottom: '1rem'}}>Enregistrer une Vente Directe</h2>
          <form onSubmit={handleSubmit} style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
            <div style={{flex: '1 1 200px'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Produit Actif</label>
              <select value={formData.product} onChange={handleProductChange} required>
                <option value="">Sélectionner un médicament...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} — ({p.price} {p.currency})</option>)}
              </select>
            </div>
            <div style={{flex: '1 1 200px'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Client (Optionnel)</label>
              <select value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})}>
                <option value="">Client de passage anonyme</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{flex: '1 1 100px'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Quantité</label>
              <input type="number" min="1" value={formData.quantity_sold} onChange={handleQuantityChange} required />
            </div>
            <div style={{flex: '1 1 150px'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Prix Cumulé</label>
              <input type="number" value={formData.total_price} disabled style={{background: '#f3f4f6', fontWeight: 'bold'}} />
            </div>
            <div style={{width: '100%', marginTop: '1rem'}}>
              <button type="submit" style={{padding: '1rem', width: '200px', fontSize: '1.1rem'}}>Encaisser</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel">
        {sales.length === 0 ? <p>Aucune transaction enregistrée aujourd'hui dans l'historique.</p> : (
          <table>
            <thead>
              <tr>
                <th>ID Vente</th>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Total Facturé</th>
                <th>Date et Heure</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.sale_id}</strong></td>
                  <td>{products.find(p => p.id === s.product)?.name || 'Produit Inconnu'}</td>
                  <td>{s.quantity_sold} unités</td>
                  <td><strong style={{color: 'var(--secondary)'}}>{s.total_price}</strong></td>
                  <td>{new Date(s.date).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
