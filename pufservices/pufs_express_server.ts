// Express server using ffi-napi to interact with PUFS library"

import express from 'express';
import ffi from 'ffi-napi';
import ref from 'ref-napi';
import process from 'process';
import cors from 'cors';

interface PufsLibrary {
  pufs_cmd_iface_init_js: () => number;
  pufs_cmd_iface_deinit_js: () => number;
  pufs_rand_js: () => number;
  pufs_get_uid_js: () => string;
  pufs_p256_sign_js: (input: string) => string;
  pufs_get_p256_pubkey_js: () => string;
  pufs_outnumber_js: (output: Buffer) => void;
  pufs_outString_js: (output: Buffer) => void;
}

// Create an instance of the express application
const app = express();
const port = 8088;
app.use(cors());

const charPtr = ref.types.CString; // Assuming CString for null-terminated string in C
var intPtr = ref.refType('int');
var strPtr = ref.refType('string');

// Try to load the library and handle any errors
let pufs: PufsLibrary;
try {
  pufs = ffi.Library('./pufs_c_lib/fw/bin/libpufse_ffi.so', {
    pufs_cmd_iface_init_js: ['int', []],
    pufs_cmd_iface_deinit_js: ['int', []],
    pufs_rand_js: ['int', []],
    pufs_get_uid_js: [charPtr, []],
    pufs_p256_sign_js: [charPtr, [charPtr]],
    pufs_get_p256_pubkey_js: [charPtr, []],
    pufs_outnumber_js: ['void', [intPtr]],
    pufs_outString_js: ['void', [strPtr]],
  }) as PufsLibrary;
} catch (error: unknown) {
  const err = error as Error;
  console.error(`Failed to load library: ${err.message}`);
  process.exit(1);
}

// Initialize the PUFS interface when the server starts
try {
  const initResult = pufs.pufs_cmd_iface_init_js();
  if (initResult !== 0) {
    throw new Error(`Initialization failed with code ${initResult}`);
  }
  console.log('PUFS interface initialized successfully');
} catch (error: unknown) {
  const err = error as Error;
  console.error(`Initialization failed: ${err.message}`);
  process.exit(1);
}

// Middleware to parse JSON bodies
app.use(express.json());

// Define the POST endpoint for pufs_p256_sign_js
app.post('/pufs_p256_sign_js', (req, res) => {
  console.log('Received request for /pufs_p256_sign_js');
  const { hash } = req.body;
  try {
    const sig = pufs.pufs_p256_sign_js(hash);

    // Ensure sig is a hex string, and split it into r and s
    const r = sig.substring(0, 64); // First 32 bytes (64 hex characters)
    const s = sig.substring(64, 128); // Second 32 bytes (64 hex characters)

    // Return the response in the required format
    res.json({
      sig: {
        r,
        s,
      },
    });
    console.log(sig);
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`pufs_p256_sign_js failed with error: ${err.message}`);
    res.status(500).send(`Error: ${err.message}`);
  }
});

// Define the GET endpoint for pufs_get_uid_js
app.get('/pufs_get_uid_js', (req, res) => {
  console.log('Received request for /pufs_get_uid_js');
  try {
    const uid = pufs.pufs_get_uid_js();
    console.log(`UID: ${uid}`);
    res.json({ uid });
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`pufs_get_uid_js failed with error: ${err.message}`);
    res.status(500).send(`Error: ${err.message}`);
  }
});

app.get('/pufs_get_p256_pubkey_js', (req, res) => {
  console.log('Received request for /pufs_get_p256_pubkey_js');
  try {
    const pubkey = pufs.pufs_get_p256_pubkey_js();
    console.log(`public key: ${pubkey}`);
    res.json({ pubkey });
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`pufs_get_p256_pubkey_js failed with error: ${err.message}`);
    res.status(500).send(`Error: ${err.message}`);
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Handle server shutdown and cleanup
const cleanup = () => {
  try {
    const deinitResult = pufs.pufs_cmd_iface_deinit_js();
    if (deinitResult !== 0) {
      console.error(`Deinitialization failed with code ${deinitResult}`);
    } else {
      console.log('PUFS interface deinitialized successfully');
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`Deinitialization failed: ${err.message}`);
  } finally {
    process.exit();
  }
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

server.on('close', cleanup);
