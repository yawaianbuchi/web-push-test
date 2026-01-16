"use server";

import webpush, { PushSubscription as WebPushSubscription } from "web-push";

webpush.setVapidDetails(
  "https://web-push-test-sand.vercel.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

let subscription: WebPushSubscription[] = [];

export async function subscribeUser(sub: WebPushSubscription) {
  // subscription.push(sub);
  // // In a production environment, you would want to store the subscription in a database
  // // For example: await db.subscriptions.create({ data: sub })
  // return { success: true };

  const formattedSub: WebPushSubscription = {
    endpoint: sub.endpoint,
    expirationTime: sub.expirationTime,
    keys: {
      p256dh: sub.keys?.p256dh,
      auth: sub.keys?.auth,
    },
  };

  // Avoid duplicates
  const exists = subscription.find((s) => s.endpoint === formattedSub.endpoint);

  if (!exists) {
    subscription.push(formattedSub);
  }

  return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
  // console.log(subscription, "Unsubscribing user");
  // subscription = [];
  // // In a production environment, you would want to remove the subscription from the database
  // // For example: await db.subscriptions.delete({ where: { ... } })
  // return { success: true };

  console.log("Before unsubscribe:", subscription.length);

  subscription = subscription.filter((sub) => sub.endpoint !== endpoint);

  console.log("After unsubscribe:", subscription.length);

  return { success: true };
}

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error("No subscription available");
  }

  console.log(message, subscription);
  try {
    await Promise.allSettled(
      subscription.map((sub) =>
        webpush.sendNotification(
          sub,
          JSON.stringify({
            title: "Test Notification",
            body: message,
            icon: "/icon.png",
          })
        )
      )
    );
    // await webpush.sendNotification(
    //   subscription,
    //   JSON.stringify({
    //     title: "Test Notification",
    //     body: message,
    //     icon: "/icon.png",
    //   })
    // );
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
