import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import './ReviewForm.css';

function ReviewForm({ sellerId }) {
  const [eligible, setEligible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const checkEligibility = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'messages'),
        where('senderEmail', '==', user.email),
        where('sellerEmail', '==', sellerId)
      );
      const snapshot = await getDocs(q);
      setEligible(!snapshot.empty);
    };
    checkEligibility();
  }, [sellerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !eligible) return;

    await addDoc(collection(db, 'reviews'), {
      sellerId,
      buyerEmail: user.email,
      rating,
      comment,
      timestamp: serverTimestamp(),
    });

    setStatus('Review submitted!');
    setRating(5);
    setComment('');
  };

  if (!eligible) return <p>You must contact this seller before leaving a review.</p>;

  return (
    <div className="review-form">
      <h3>Leave a Review</h3>
      <form onSubmit={handleSubmit}>
        <label>Rating</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>⭐ {r}</option>
          ))}
        </select>

        <label>Comment</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} />

        <button type="submit">Submit Review</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}

export default ReviewForm;
<div className="star-rating">
  {[1, 2, 3, 4, 5].map((star) => (
    <span
      key={star}
      className={star <= rating ? 'filled' : ''}
      onClick={() => setRating(star)}
    >
      ★
    </span>
  ))}
</div>
const q = query(
  collection(db, 'buyerApplications'),
  where('email', '==', user.email),
  where('sellerId', '==', sellerId),
  where('status', '==', 'approved') // or 'completed'
);
<div className="star-rating">
  {[1, 2, 3, 4, 5].map((star) => (
    <span
      key={star}
      className={star <= rating ? 'filled' : ''}
      onClick={() => setRating(star)}
    >
      ★
    </span>
  ))}
</div>
const checkEligibility = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(
    collection(db, 'buyerApplications'),
    where('email', '==', user.email),
    where('sellerId', '==', sellerId),
    where('status', 'in', ['approved', 'completed']) // adjust based on your flow
  );
  const snapshot = await getDocs(q);
  setEligible(!snapshot.empty);
};
await addDoc(collection(db, 'reviews'), {
  sellerId,
  buyerEmail: user.email,
  rating,
  comment,
  timestamp: serverTimestamp(),
  flagged: false // default
});
