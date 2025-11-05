import React, { useEffect, useState } from 'react';
import './ListingCard.css';
import ContactModal from './ContactModal';

function ListingCard({ listing, isSaved, onSave, onRemove }) {
  const {
    id,
    address,
    price,
    beds,
    baths,
    image,
    featured,
    status = 'Available',
    postedDate,
    sellerEmail,
    sellerName,
    sellerImage,
    sellerRating,
  } = listing;

  const [fadeIn, setFadeIn] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  const getDaysOnMarket = () => {
    if (!postedDate) return null;
    const posted = new Date(postedDate);
    const today = new Date();
    return Math.floor((today - posted) / (1000 * 60 * 60 * 24));
  };

  const daysOnMarket = getDaysOnMarket();
  const isHot = daysOnMarket !== null && daysOnMarket < 7;

  return (
    <>
      <div className={`listing-card ${fadeIn ? 'fade-in' : ''}`}>
        {featured && <div className="featured-ribbon">Featured</div>}
        {isHot && <div className="hot-badge">🔥 Hot!</div>}
        <div className="image-wrapper">
          <img src={image || '/placeholder.jpg'} alt="Property" />
          {isSaved && <div className="heart-icon" title="You saved this listing">❤️</div>}
          <div className={`status-badge ${status.toLowerCase()}`} title={`Status: ${status}`}>
            {status}
          </div>
        </div>
        <h4>{address}</h4>
        <p>${price}/mo · {beds} Bed · {baths} Bath</p>
        {daysOnMarket !== null && (
          <p className="listing-age">Listed {daysOnMarket} days ago</p>
        )}
        {sellerName && (
          <div className="seller-profile">
            <img src={sellerImage || '/default-avatar.png'} alt="Seller" />
            <div>
              <p><strong>{sellerName}</strong></p>
              <p>⭐ {sellerRating || 'N/A'}</p>
            </div>
          </div>
        )}
        {!isSaved ? (
          <button onClick={() => onSave(listing)} title="Click to save this listing">
            Save Listing
          </button>
        ) : (
          <button className="remove-button" onClick={() => onRemove(id)} title="Remove from saved listings">
            Remove
          </button>
        )}
        {sellerEmail && (
          <button className="contact-button" onClick={() => setShowModal(true)}>
            Contact Seller
          </button>
        )}
      </div>

      {showModal && (
        <ContactModal
          listingId={id}
          sellerEmail={sellerEmail}
          sellerName={sellerName}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export default ListingCard;
import { doc, getDoc } from 'firebase/firestore';

useEffect(() => {
  const fetchSellerRating = async () => {
    const sellerRef = doc(db, 'sellers', listing.sellerId);
    const sellerSnap = await getDoc(sellerRef);
    if (sellerSnap.exists()) {
      setSellerRating(sellerSnap.data().rating);
    }
  };
  fetchSellerRating();
}, [listing.sellerId]);
<p>⭐ {sellerRating?.toFixed(1) || 'N/A'} rating</p>
