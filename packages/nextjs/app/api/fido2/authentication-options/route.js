import mysql from 'mysql2/promise';
// Function to get user credentials from MySQL
async function getUserCredentials(userId) {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'fido2_db'
    });

    const [rows] = await connection.execute('SELECT credential_id FROM credentials WHERE user_id = ?', [userId]);
    await connection.end();
    return rows.map(row => ({
        id: Buffer.from(row.credential_id, 'hex'),
        type: 'public-key'
    }));
}

async function generateAuthOptions(userId) {
    const userCredentials = await getUserCredentials(userId);

    const options = {
        challenge: crypto.randomBytes(32),
        timeout: 60000,
        allowCredentials: userCredentials,
        userVerification: 'required',
        rpId: 'localhost',
        rpName: 'ACME',
        rpIcon: 'https://example.com/logo.png',
        allowCredentials: userCredentials,
        extensions: {
            txAuthSimple: 'Example transaction authorization',
            txAuthGeneric: {
                contentType: 'text/plain',
                content: 'Example transaction authorization'
            }
        }
    };

    return options;
}