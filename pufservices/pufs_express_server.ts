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
}

// Create an instance of the express application
const app = express();
const port = 8088;
app.use(cors());

// Try to load the library and handle any errors
let pufs: PufsLibrary;
try {
  pufs = ffi.Library('./pufs_c_lib/fw/bin/libpufse_ffi.so', {
    pufs_cmd_iface_init_js: ["int", []],
    pufs_cmd_iface_deinit_js: ["int", []],
    pufs_rand_js: ["int", []],
    pufs_get_uid_js: [ref.types.CString, []],
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

// // Define the POST endpoint for pufs_get_uid_js
// app.post('/get-uid', (req, res) => {
//   try {
//     const uid = pufs.pufs_get_uid_js();
//     res.json({ uid });
//     console.log(uid)
//   } catch (error: unknown) {
//     const err = error as Error;
//     console.error(`pufs_get_uid_js failed with error: ${err.message}`);
//     res.status(500).send(`Error: ${err.message}`);
//   }
// });

// Define the GET endpoint for pufs_get_uid_js
app.get('/get-uid', (req, res) => {
  console.log('Received request for /get-uid');
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
