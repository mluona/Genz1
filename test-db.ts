import { initDb, executeQuery } from "./server-db";

async function test() {
  await initDb();
  const res = await executeQuery("series", "select");
  console.log("Result:", res);
}
test().catch(console.error);
