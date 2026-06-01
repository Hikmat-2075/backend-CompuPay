import admin from "firebase-admin";
import fs from "fs";
import path from "path";

class FirebaseService {
  constructor() {
    this.app = null;
    this.init();
  }

  init() {
    if (admin.apps.length) {
      this.app = admin.app();
      return;
    }

    const customPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    const candidates = [
      customPath,
      path.join(process.cwd(), "src/config/firebase-service-account.json"),
      path.join(process.cwd(), "dist/config/firebase-service-account.json"),
      path.join(process.cwd(), "config/firebase-service-account.json"),
    ].filter(Boolean);

    const serviceAccountPath = candidates.find((candidate) =>
      fs.existsSync(candidate),
    );

    if (!serviceAccountPath) {
      console.warn(
        "⚠️ Firebase service account file not found. Push notification disabled.",
      );
      return;
    }

    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf-8"),
    );

    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin initialized");
  }

  async sendToTokens(tokens = [], payload = {}) {
    if (!this.app) {
      console.warn("⚠️ Firebase is not initialized. Skip push notification.");
      return null;
    }

    if (!tokens.length) {
      console.warn("⚠️ No active device token found. Skip push notification.");
      return null;
    }

    return admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    });
  }
}

export default new FirebaseService();
