import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';
import ContactModal from './ContactModal';
import './SellerDashboard.css';

function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const messagesQuery = query(
          collection(db, 'messages'),
          where('sellerEmail', '==', currentUser.email)
        );

        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
          const msgs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages(msgs);
        });

        return () => unsubscribeMessages();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleReply = async (msg) => {
    setReplyTo(msg);
    if (!msg.read) {
      await updateDoc(doc(db, 'messages', msg.id), { read: true });
    }
  };

  return (
    <div className="seller-dashboard">
      <h2>Seller Dashboard</h2>
      {messages.length > 0 ? (
        <ul className="message-list">
          {messages.map((msg) => (
            <li key={msg.id}>
              <strong>{msg.senderName}</strong> ({msg.senderEmail})<br />
              <em>{msg.message}</em><br />
              <span>{msg.listingAddress || 'Unspecified'}</span>
              {!msg.read && <span className="unread-badge">🔵 Unread</span>}
              <button onClick={() => handleReply(msg)}>Reply</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No messages yet.</p>
      )}
      {replyTo && (
        <ContactModal
          listingId={replyTo.listingId}
          sellerEmail={replyTo.senderEmail}
          sellerName={replyTo.senderName}
          onClose={() => setReplyTo(null)}
        />
      )}
    </div>
  );
}

export default SellerDashboard;
await updateDoc(doc(db, 'messages', msg.id), {
  replyTimestamp: serverTimestamp(),
  read: true
});
