importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
 apiKey: "AIzaSyBo3bHyfYYtBBeYAFt6_sV9iWqLF_bYwuY",
 authDomain: "scanserve-app.firebaseapp.com",
 projectId: "scanserve-app",
 messagingSenderId: "124173740082",
 appId: "1:124173740082:web:bac36fceefbd378f08742b",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/icon.png",
    }
  );
});
