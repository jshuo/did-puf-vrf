import ffi from 'ffi-napi';
import ref from 'ref-napi';
import ArrayType from 'ref-array-napi';
import path from 'path';
import { existsSync } from 'fs';


// Resolve the absolute path to libpufse.so
const libraryPath = path.resolve(__dirname, './pufs_c_lib/fw/bin/libpufse_ffi.so');

// Check if the library exists
if (!existsSync(libraryPath)) {
  console.error(`Library not found at path: ${libraryPath}`);
  process.exit(1);
}

// Try to load the library and handle any errors
let pufs;
try {
  pufs = ffi.Library(libraryPath, {
    pufs_rand_js: [ref.types.CString, []]  // Correcting the function signature
  });
} catch (error) {
  console.error(`Failed to load library: ${(error as Error).message}`);
  process.exit(1);
}

// Define a type for the status result
type PufsStatus = number; // Adjust this based on the actual status type definition

// Call the init function
let status: number;
try {
  const uid = pufs.pufs_rand_js();
  console.log(uid)
} catch (error) {
  console.error(`pufs_cmd_iface_init failed with error: ${(error as Error).message}`);
  process.exit(1);
}
