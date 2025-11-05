const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();
const db = admin.firestore();
sgMail.setApiKey(functions.config().sendgrid.key); // Set this via CLI

// 🔔 Notify seller when a new message is created
exports.notifySeller = functions.firestore
  .document('messages/{msgId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const {
      sellerEmail,
      senderName,
      senderEmail,
      message,
      listingId,
      listingAddress = 'Unspecified',
    } = data;

    const dashboardUrl = `https://hi-awto.com/dashboard?seller=${encodeURIComponent(sellerEmail)}&listing=${listingId}`;

    const msg = {
      to: sellerEmail,
      from: 'hi-awto@yourdomain.com',
      subject: `New message from ${senderName} about ${listingAddress}`,
      text: `You received a message from ${senderName} (${senderEmail}) about ${listingAddress}:\n\n${message}\n\nReply here: ${dashboardUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 1rem; background-color: #f9f9f9;">
          <h2 style="color: #003366;">HI AWTO Message Alert</h2>
          <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
          <p><strong>Listing:</strong> ${listingAddress}</p>
          <blockquote style="border-left: 4px solid #00A86B; padding-left: 1rem; color: #333;">
            ${message}
          </blockquote>
          <p>
            <a href="${dashboardUrl}" style="display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background-color: #00A86B; color: white; text-decoration: none; border-radius: 4px;">
              Reply in Dashboard
            </a>
          </p>
          <hr />
          <p style="font-size: 0.8rem; color: #666;">This message was sent via HI AWTO. Please do not reply directly to this email.</p>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log('Email sent to seller:', sellerEmail);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  });

// ⭐ Update seller rating when a new review is created
exports.updateSellerRating = functions.firestore
  .document('reviews/{reviewId}')
  .onCreate(async (snap, context) => {
    const { sellerId } = snap.data();

    const reviewsRef = db.collection('reviews').where('sellerId', '==', sellerId);
    const snapshot = await reviewsRef.get();

    const ratings = snapshot.docs.map(doc => doc.data().rating);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    const sellerRef = db.collection('sellers').doc(sellerId);
    await sellerRef.update({
      rating: parseFloat(avgRating.toFixed(2)),
      reviewCount: ratings.length
    });
  });

// 📩 Notify seller when a new review is submitted
exports.notifySellerOfReview = functions.firestore
  .document('reviews/{reviewId}')
  .onCreate(async (snap, context) => {
    const { sellerId, buyerEmail, rating, comment } = snap.data();

    const sellerDoc = await db.collection('sellers').doc(sellerId).get();
    if (!sellerDoc.exists) return;

    const sellerEmail = sellerDoc.data().email;

    const msg = {
      to: sellerEmail,
      from: 'hi-awto@yourdomain.com',
      subject: `New review from ${buyerEmail}`,
      text: `You received a new review:\n\nRating: ${rating}\nComment: ${comment}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 1rem;">
          <h2>New Review Received</h2>
          <p><strong>From:</strong> ${buyerEmail}</p>
          <p><strong>Rating:</strong> ⭐ ${rating}</p>
          <blockquote>${comment}</blockquote>
          <p>View your profile on <a href="https://hi-awto.com/dashboard">HI AWTO</a>.</p>
        </div>
      `,
    };

    await sgMail.send(msg);
  });

// ⏱️ Update seller response rate when a reply is added
exports.updateResponseRate = functions.firestore
  .document('messages/{msgId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!before.replyTimestamp && after.replyTimestamp) {
      const sellerEmail = after.sellerEmail;

      const messagesRef = db.collection('messages')
        .where('sellerEmail', '==', sellerEmail)
        .where('replyTimestamp', '!=', null);

      const snapshot = await messagesRef.get();
      const responseTimes = snapshot.docs.map(doc => {
        const data = doc.data();
        const sent = data.timestamp?.toDate();
        const replied = data.replyTimestamp?.toDate();
        return sent && replied ? (replied - sent) / 1000 : null;
      }).filter(t => t !== null);

      const avgSeconds = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const responseRate = avgSeconds < 3600 ? 1 : avgSeconds < 86400 ? 0.8 : 0.5;

      const sellerSnap = await db.collection('sellers')
        .where('email', '==', sellerEmail)
        .get();

      if (!sellerSnap.empty) {
        const sellerDoc = sellerSnap.docs[0];
        await sellerDoc.ref.update({ responseRate: parseFloat(responseRate.toFixed(2)) });
      }

      const responseTimeSeconds = (after.replyTimestamp.toDate() - after.timestamp.toDate()) / 1000;
      await change.after.ref.update({ responseTime: responseTimeSeconds });
    }
  });

// 🏅 Aggregate reviews and assign badges
exports.aggregateReviews = functions.firestore
  .document('reviews/{reviewId}')
  .onCreate(async (snap, context) => {
    const { sellerId } = snap.data();
    const reviewsRef = db.collection('reviews').where('sellerId', '==', sellerId);
    const snapshot = await reviewsRef.get();

    const ratings = snapshot.docs.map(doc => doc.data().rating);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    const reviewCount = ratings.length;
    const badges = [];

    if (avgRating >= 4.8) badges.push('Top Seller');
    if (reviewCount >= 20) badges.push('Trusted Seller');

    await db.collection('sellers').doc(sellerId).update({
      rating: parseFloat(avgRating.toFixed(1)),
      reviewCount,
      badges
    });
  });
