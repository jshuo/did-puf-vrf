import ffi from 'ffi-napi';
import ref from 'ref-napi';
import ArrayType from 'ref-array-napi';
import path from 'path';
import { existsSync } from 'fs';

// Define wchar_t as unsigned short
const wchar_t = ref.types.ushort;

// Define the serial number as an array of wchar_t
const WCHARArray = ArrayType(wchar_t);
const serialNumber = new WCHARArray([
  '0'.charCodeAt(0), '0'.charCodeAt(0), 'E'.charCodeAt(0), '0'.charCodeAt(0), 
  '6'.charCodeAt(0), '0'.charCodeAt(0), '0'.charCodeAt(0), 'D'.charCodeAt(0),
  'C'.charCodeAt(0), '0'.charCodeAt(0), 'D'.charCodeAt(0), 'E'.charCodeAt(0),
  '\0'.charCodeAt(0)
]);

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
    pufs_rand_js: ['int', []]  // Correcting the function signature
  });
} catch (error) {
  console.error(`Failed to load library: ${(error as Error).message}`);
  process.exit(1);
}

// Define a type for the status result
type PufsStatus = number; // Adjust this based on the actual status type definition

// Call the init function
let status: PufsStatus;
try {
  status = pufs.pufs_rand_js();
} catch (error) {
  console.error(`pufs_cmd_iface_init failed with error: ${(error as Error).message}`);
  process.exit(1);
}

if (status !== 0) {  // Assuming 0 is the success code, adjust as necessary
  console.error(`pufs_cmd_iface_init failed with status: ${status}`);
  process.exit(status);
} else {
  console.log('pufs_cmd_iface_init succeeded');
}
