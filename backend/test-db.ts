import { Client } from 'pg';

const connectionString = "postgresql://postgres.tyahxiffkvnuubtdotbf:Pasobet123*@18.214.78.123:5432/postgres";

async function test() {
  const client = new Client({ connectionString });
  try {
    console.log('Connecting to 5432...');
    await client.connect();
    console.log('Connected!');
    const res = await client.query('SELECT NOW()');
    console.log(res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Failed to connect to 5432:', err.message);
  }

  const connectionString6543 = "postgresql://postgres.tyahxiffkvnuubtdotbf:Pasobet123*@18.214.78.123:6543/postgres";
  const client2 = new Client({ connectionString: connectionString6543 });
  try {
    console.log('Connecting to 6543...');
    await client2.connect();
    console.log('Connected!');
    const res = await client2.query('SELECT NOW()');
    console.log(res.rows[0]);
    await client2.end();
  } catch (err) {
    console.error('Failed to connect to 6543:', err.message);
  }
}

test();
