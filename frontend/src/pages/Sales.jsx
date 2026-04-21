import React, { useState, useEffect } from 'react';
import api from '../api';

const getExpiryStatus = (dateStr) => {
    if(!dateStr) return { text: 'N/A', bg: '#f1f5f9', color: '#64748b' };
    const exp = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Expiré', bg: '#fee2e2', color: '#ef4444' };
    if (diffDays < 90) return { text: 'Bientôt', bg: '#fef3c7', color: '#d97706' };
    return { text: 'Valide', bg: '#dbeafe', color: '#2563eb' };
};

const getStockStatus = (stock) => {
    if(stock > 50) return { text: 'OK', bg: '#dcfce7', color: '#16a34a' };
    if(stock > 0) return { text: 'Faible', bg: '#fef3c7', color: '#d97706' };
    return { text: 'Rupture', bg: '#fee2e2', color: '#ef4444' };
};

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Toutes");
  
  const [cart, setCart] = useState([]);
  const [inputQtys, setInputQtys] = useState({}); // Local state for the "Qty" input box in the product list
  
  const [paymentMethod, setPaymentMethod] = useState("Espèces");
  const [globalDiscount, setGlobalDiscount] = useState("");
  const [saleNote, setSaleNote] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Gestion de la modification/suppression de produits ---
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ product_id: '', name: '', stock: 0, lot: '', expiry_date: '', price: 0, currency: 'GNF', category: 'Antalgique' });

  const categoriesList = ["Toutes", "Antalgique", "Antibiotique", "Anti-inflammatoire", "Antidiabétique", "Vitamines", "Gastro-entérologie", "Antihistaminique", "Soin"];

  const loadProducts = () => { 
    api.get('products/')
      .then(res => {
        setProducts(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  };

  useEffect(() => { loadProducts(); }, []);

  const filteredProducts = products.filter(p => {
      const name = p.name || "";
      const lot = p.lot || "";
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || lot.toLowerCase().includes(searchQuery.toLowerCase());
      
      const cat = p.category || 'Générique';
      // Comparaison insensible à la casse et plus souple
      const matchesCat = activeCategory === "Toutes" || cat.toLowerCase() === activeCategory.toLowerCase();
      
      return matchesSearch && matchesCat;
  });

  const handleListQtyChange = (productId, val) => {
      setInputQtys({...inputQtys, [productId]: val < 1 ? 1 : val});
  };

  const addToCartFromList = (product) => {
      const qtyToAdd = inputQtys[product.id] || 1;
      const existing = cart.find(c => c.product.id === product.id);
      if(existing) {
          setCart(cart.map(c => c.product.id === product.id ? {...c, qty: c.qty + qtyToAdd} : c));
      } else {
          setCart([...cart, { product, qty: qtyToAdd }]);
      }
      setInputQtys({...inputQtys, [product.id]: 1}); // reset
  };

  const updateCartQty = (productId, delta) => {
      setCart(cart.map(c => {
          if (c.product.id === productId) {
              const newQty = c.qty + delta;
              return {...c, qty: newQty < 1 ? 1 : newQty};
          }
          return c;
      }));
  };

  const removeCartItem = (productId) => setCart(cart.filter(c => c.product.id !== productId));

  const totalRaw = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const discountVal = parseFloat(globalDiscount) || 0;
  const finalTotal = totalRaw - discountVal;

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditFormData({
      product_id: product.product_id,
      name: product.name,
      stock: product.stock,
      lot: product.lot,
      expiry_date: product.expiry_date,
      price: product.price,
      currency: product.currency || 'GNF',
      category: product.category || 'Antalgique'
    });
    setShowEditForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce médicament ?")) {
      try { 
          await api.delete(`products/${id}/`); 
          loadProducts(); 
          setCart(cart.filter(c => c.product.id !== id));
      } catch (err) { alert("Erreur lors de la suppression."); }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`products/${editingId}/`, editFormData);
      setShowEditForm(false);
      setEditingId(null);
      loadProducts();
      // Mettre à jour le panier si le produit y est
      const inCart = cart.find(c => c.product.id === editingId);
      if (inCart) {
          setCart(cart.map(c => c.product.id === editingId ? { ...c, product: { ...c.product, ...editFormData } } : c));
      }
    } catch (err) {
      const errorDetail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert("Erreur lors de la mise à jour : " + errorDetail);
    }
  };

  const confirmAndPrint = async () => {
    setIsProcessing(true);
    try {
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const rand = Math.floor(Math.random() * 9000) + 1000;
        const invoiceId = `VTE-${today}-${rand}`;

        const salePromises = cart.map(item => api.post('sales/', {
            sale_id: `SALE-${invoiceId}-${item.product.id}`,
            product: item.product.id,
            quantity_sold: item.qty,
            total_price: (item.product.price * item.qty)
        }));

        const saleResults = await Promise.all(salePromises);
        const saleIds = saleResults.map(r => r.data.id);

        await api.post('invoices/', {
            invoice_id: invoiceId,
            sales: saleIds,
            total_amount: finalTotal,
            status: paymentMethod
        });

        alert(`✅ Vente Validée !\nFacture ${invoiceId} enregistrée sous le mode : ${paymentMethod}`);
        
        setCart([]);
        setGlobalDiscount("");
        setSaleNote("");
        setShowModal(false);
        loadData();
    } catch(err) {
        alert("Erreur de communication avec le serveur.");
        console.error(err);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#f8fafc', overflow: 'hidden' }}>
      
      {/* ===== ZONE GAUCHE : RECHERCHE ET LISTE ===== */}
      <div style={{ flex: '1 1 65%', display: 'flex', flexDirection: 'column', padding: '0.8rem', borderRight: '1px solid #e2e8f0', overflow: 'hidden' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <h2 style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Vente — Produits</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={loadProducts} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>🔄 Actualiser</button>
                <div style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #16a34a' }}>
                   📡 {products.length} produits
                </div>
            </div>
         </div>
         
         <div style={{ background: 'white', borderRadius: '12px', padding: '0.8rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '0.6rem' }}>
            <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', top: '10px', left: '12px', fontSize: '1.2rem' }}>🔍</span>
                <input 
                    type="text" 
                    placeholder="Désignation, catégorie, code..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', background: '#f8fafc' }}
                />
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {categoriesList.map(cat => (
                    <button 
                       key={cat} 
                       onClick={() => setActiveCategory(cat)}
                       style={{ 
                           padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', border: '1px solid', cursor: 'pointer',
                           background: activeCategory === cat ? '#2563eb' : 'white',
                           color: activeCategory === cat ? 'white' : '#475569',
                           borderColor: activeCategory === cat ? '#2563eb' : '#e2e8f0',
                           transition: 'all 0.2s'
                       }}>
                       {cat}
                    </button>
                ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.8rem', marginTop: '1rem', borderTop: '1px dashed #e2e8f0', paddingTop: '0.8rem' }}>
                {['Espèces', 'Orange Money', 'Wave', 'Mixte'].map(pm => (
                    <button 
                        key={pm}
                        onClick={() => setPaymentMethod(pm)}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '20px', border: '2px solid', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                            borderColor: paymentMethod === pm ? '#2563eb' : '#e2e8f0',
                            background: paymentMethod === pm ? '#eff6ff' : 'white',
                            color: paymentMethod === pm ? '#1e40af' : '#64748b'
                        }}>
                        {pm === 'Espèces' && <span style={{color:'#16a34a'}}>💵</span>}
                        {pm === 'Orange Money' && <span style={{color:'#f97316'}}>🟠</span>}
                        {pm === 'Wave' && <span style={{color:'#0ea5e9'}}>🌊</span>}
                        {pm === 'Mixte' && <span>💳</span>}
                        {pm}
                    </button>
                ))}
            </div>
         </div>

         {/* Liste des produits (Table) */}
         <div style={{ background: 'white', borderRadius: '12px', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ overflowY: 'auto', flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                {filteredProducts.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                        <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</span>
                        <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>Aucun produit ne correspond à votre recherche.</p>
                        <button onClick={() => { setSearchQuery(""); setActiveCategory("Toutes"); }} style={{ marginTop: '1rem', color: '#2563eb', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Réinitialiser les filtres</button>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', borderBottom: '1px solid #e2e8f0', zIndex: 1 }}>
                        <tr>
                            <th style={{ padding: '0.6rem 0.8rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>DÉSIGNATION</th>
                            <th style={{ padding: '0.6rem 0.8rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>PRIX-VENTE</th>
                            <th style={{ padding: '0.6rem 0.8rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>DATE EXPIRATION</th>
                            <th style={{ padding: '0.6rem 0.8rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>CATÉGORIE</th>
                            <th style={{ padding: '0.6rem 0.8rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>STOCKS</th>
                            <th style={{ padding: '0.6rem 0.8rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((p, idx) => {
                             const exp = getExpiryStatus(p.expiry_date);
                             const stk = getStockStatus(p.stock);
                             const myQty = inputQtys[p.id] || 1;
                             const inCart = cart.some(c => c.product.id === p.id);
                             const isExpired = exp.text === 'Expiré';

                             return (
                                 <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', background: isExpired ? '#fee2e244' : 'white', transition: 'background 0.2s' }}>
                                     <td style={{ padding: '0.5rem 0.8rem' }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.85rem', color: isExpired ? '#dc2626' : '#1e293b' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: isExpired ? '#ef4444' : '#64748b', marginTop: '1px' }}>{p.lot ? p.lot : p.product_id}</div>
                                    </td>
                                    <td style={{ padding: '0.5rem 0.8rem', fontWeight: '800', color: '#1d4ed8', fontSize: '0.85rem' }}>{Number(p.price).toLocaleString()} GNF</td>
                                    <td style={{ padding: '0.5rem 0.8rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: isExpired ? '#dc2626' : '#475569', marginRight: '6px' }}>{p.expiry_date ? new Date(p.expiry_date).toLocaleDateString('fr-FR') : '-'}</span>
                                        <span style={{ background: exp.bg, color: exp.color, padding: '2px 6px', borderRadius: '12px', fontSize: '0.6rem', fontWeight: 700 }}>{exp.text}</span>
                                    </td>
                                    <td style={{ padding: '0.5rem 0.8rem' }}>
                                        <span style={{ background: '#dbeafe', color: '#2563eb', padding: '3px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 600 }}>{p.category || 'Générique'}</span>
                                    </td>
                                    <td style={{ padding: '0.5rem 0.8rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>{p.stock}</span>
                                            <span style={{ background: stk.bg, color: stk.color, padding: '1px 5px', borderRadius: '4px', fontSize: '0.55rem', fontWeight: 'bold', width: 'fit-content' }}>{stk.text}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.5rem 0.8rem', textAlign: 'right' }}>
                                        {!isExpired ? (
                                            <button onClick={() => addToCartFromList(p)} style={{ padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>+ Ajouter</button>
                                        ) : (
                                            <button disabled style={{ padding: '5px 10px', background: '#f1f5f9', color: '#94a3b8', border: 'none', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>Expiré</button>
                                        )}
                                    </td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
            )}
            </div>
            <div style={{ padding: '1rem', background: '#f1f5f9', borderTop: '2px solid #cbd5e1', fontSize: '1rem', color: 'black', fontWeight: 'bold' }}>
                ✅ {filteredProducts.length} produit(s) prêt(s) à la vente / {products.length} stockés.
            </div>
         </div>
      </div>

      {/* ===== ZONE DROITE : PANIER ===== */}
      <div style={{ flex: '0 0 35%', minWidth: '350px', background: 'white', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e2e8f0' }}>
          
          {/* Header Panier */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>🛒 Mon Panier</h2>
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem' }}>{cart.reduce((s,c)=>s+c.qty, 0)} article(s) • {cart.length} produit(s)</div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
              {cart.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>🛒</div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Panier vide</h3>
                      <p style={{ fontSize: '0.9rem' }}>Cliquez sur "+ Ajouter" pour commencer</p>
                  </div>
              ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ paddingBottom: '0.5rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>DÉSIGNATION</th>
                          <th style={{ paddingBottom: '0.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>QTÉ</th>
                          <th style={{ paddingBottom: '0.5rem', textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>MONTANT</th>
                          <th></th>
                      </tr>
                  </thead>
                  <tbody>
                      {cart.map(c => (
                          <tr key={c.product.id} style={{ borderBottom: '1px dashed #f1f5f9' }}>
                              <td style={{ padding: '1.2rem 0' }}>
                                  <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem' }}>{c.product.name}</div>
                                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>{Number(c.product.price).toLocaleString()} GNF / unité</div>
                              </td>
                              <td style={{ padding: '1rem 0', textAlign: 'center' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                                      <button onClick={() => updateCartQty(c.product.id, -1)} style={{ background: 'white', border: 'none', padding: '2px 6px', cursor: 'pointer' }}>-</button>
                                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', width: '24px' }}>{c.qty}</span>
                                      <button onClick={() => updateCartQty(c.product.id, +1)} style={{ background: 'white', border: 'none', padding: '2px 6px', cursor: 'pointer' }}>+</button>
                                  </div>
                              </td>
                              <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 'bold', color: '#1d4ed8' }}>
                                  {(c.product.price * c.qty).toLocaleString()} GNF
                              </td>
                              <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                                  <button onClick={() => removeCartItem(c.product.id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              )}
          </div>

          {/* Footer Panier (Totaux et Action) */}
          <div style={{ padding: '1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Remise Fixe (GNF)</span>
                  <input type="number" placeholder="0" value={globalDiscount} onChange={e => setGlobalDiscount(e.target.value)} style={{ width: '100px', textAlign: 'right', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                  <textarea placeholder="Note (ordonnance, commentaire...)" value={saleNote} onChange={e => setSaleNote(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'none', height: '60px', outline: 'none' }}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1rem', color: '#475569' }}>
                  <span>Sous-total</span>
                  <span>{totalRaw.toLocaleString()} GNF</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingTop: '0.5rem', borderTop: '2px solid #e2e8f0' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>Total</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#16a34a' }}>{finalTotal.toLocaleString()} GNF</span>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setShowModal(true)} disabled={cart.length === 0} style={{ flex: 2, padding: '1rem', background: '#16a34a', color: 'white', borderRadius: '8px', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: cart.length > 0 ? 'pointer' : 'not-allowed', opacity: cart.length > 0 ? 1 : 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      ✅ Valider
                  </button>
                  <button onClick={() => { setCart([]); setGlobalDiscount(""); }} disabled={cart.length === 0} style={{ flex: 1, padding: '1rem', background: '#dc2626', color: 'white', borderRadius: '8px', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: cart.length > 0 ? 'pointer' : 'not-allowed', opacity: cart.length > 0 ? 1 : 0.5 }}>
                      ✖ Annuler
                  </button>
              </div>
          </div>
      </div>

      {/* ===== MODAL DE CONFIRMATION ===== */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <div style={{ background: 'white', borderRadius: '16px', width: '500px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>Confirmer la vente</h2>
                <div style={{ color: '#64748b', marginBottom: '2rem' }}>{cart.reduce((s,c)=>s+c.qty, 0)} article(s) • Mode : {paymentMethod}</div>

                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
                    {cart.map(c => (
                        <div key={c.product.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ color: '#334155' }}>{c.product.name} <span style={{ color: '#94a3b8' }}>x{c.qty}</span></span>
                            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{(c.product.price * c.qty).toLocaleString()} GNF</span>
                        </div>
                    ))}
                    {discountVal > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px double #f1f5f9', color: '#ef4444' }}>
                            <span>Remise appliquée</span>
                            <span style={{ fontWeight: 'bold' }}>- {discountVal.toLocaleString()} GNF</span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #e2e8f0', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>TOTAL</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#16a34a' }}>{finalTotal.toLocaleString()} GNF</span>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={confirmAndPrint} disabled={isProcessing} style={{ flex: 1, padding: '1.2rem', background: '#047857', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                        {isProcessing ? 'Génération...' : '☑ Confirmer & Imprimer'}
                    </button>
                    <button onClick={() => setShowModal(false)} disabled={isProcessing} style={{ flex: 1, padding: '1.2rem', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                        Retour
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* ===== MODAL D'ÉDITION DE PRODUIT (Gestion de stock déportée) ===== */}
      {showEditForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200 }}>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                  <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>Modifier le produit</h2>
                  <form onSubmit={handleUpdateSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Désignation</label>
                          <input type="text" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} required />
                      </div>
                      <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Catégorie</label>
                          <select value={editFormData.category} onChange={e => setEditFormData({ ...editFormData, category: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                              {categoriesList.filter(c => c !== "Toutes").map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                      <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Stock actuel</label>
                          <input type="number" value={editFormData.stock} onChange={e => setEditFormData({ ...editFormData, stock: parseInt(e.target.value) })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} required />
                      </div>
                      <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Prix (GNF)</label>
                          <input type="number" value={editFormData.price} onChange={e => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} required />
                      </div>
                      <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>N° Lot</label>
                          <input type="text" value={editFormData.lot} onChange={e => setEditFormData({ ...editFormData, lot: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} required />
                      </div>
                      <div>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Expiration</label>
                          <input type="date" value={editFormData.expiry_date} onChange={e => setEditFormData({ ...editFormData, expiry_date: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} required />
                      </div>
                      <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '1rem' }}>
                          <button type="submit" style={{ flex: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Enregistrer les modifications</button>
                          <button type="button" onClick={() => setShowEditForm(false)} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Annuler</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
