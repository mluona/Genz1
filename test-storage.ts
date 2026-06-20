import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { getAuth, signInAnonymously } from "firebase/auth";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

async function testUpload() {
  try {
    await signInAnonymously(auth);
    const storageRef = ref(storage, "test.txt");
    await uploadString(storageRef, "Hello World", "raw");
    const url = await getDownloadURL(storageRef);
    console.log("SUCCESS:", url);
    process.exit(0);
  } catch (err) {
    console.error("FAIL:", err.message);
    process.exit(1);
  }
}

testUpload();
