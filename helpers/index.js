import { getToken, onMessage } from "firebase/messaging";
import { messagingPromise } from "../lib/firebase";

export async function requestNotificationPermission() {
  const messaging = await messagingPromise;
  if (!messaging) return;

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    const token = await getToken(messaging, {
      vapidKey: "BP69HgTnLOKAUweGtzG27LRDh7PXS58oLeHg2qKrLr_Hi-3DzJB73YMYFjEtogU3NJnIh5SCaV64IqwcgxLhuQQ",
    });

    console.log("FCM Token:", token);

    // 🔥 Send this token to your backend & save it
  }
}