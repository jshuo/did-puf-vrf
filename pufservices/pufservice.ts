// ffi for PUFS Services 

import ffi from 'ffi-napi';
import ref from 'ref-napi';


const charPtr = ref.types.CString;  // Assuming CString for null-terminated string in C
var intPtr = ref.refType('int');
var strPtr = ref.refType('string');

// Try to load the library and handle any errors
let pufs;
try {
  pufs = ffi.Library('./pufs_c_lib/fw/bin/libpufse_ffi.so', {
    pufs_cmd_iface_init_js: ["int", []] ,
    pufs_cmd_iface_deinit_js: ["int", []] ,
    pufs_rand_js: ["int", []] ,
    pufs_get_uid_js: [charPtr, []] ,
    pufs_p256_sign_js: [charPtr, [charPtr]],
    pufs_get_p256_pubkey_js: [charPtr, []] ,
    pufs_outnumber_js: [ 'void', [ intPtr ] ],
    pufs_outString_js: [ 'void', [ strPtr ] ]
  });
} catch (error) {
  console.error(`Failed to load library: ${(error as Error).message}`);
  process.exit(1);
}

try {
  pufs.pufs_cmd_iface_init_js();
  var outNumber = ref.alloc('int'); // allocate a 4-byte (32-bit) chunk for the output data
  pufs.pufs_outnumber_js(outNumber);
  var actualNumber = outNumber.deref();
  console.log(actualNumber)

  var outString = ref.alloc('string'); 
  pufs.pufs_outString_js(outString);
  var actualString = outString.deref();
  console.log(actualString)

  const uid = pufs.pufs_get_uid_js();
  console.log(uid)
  const sig = pufs.pufs_p256_sign_js(uid)
  console.log(sig)
  const pubkey = pufs.pufs_get_p256_pubkey_js()
  console.log(pubkey)
  pufs.pufs_cmd_iface_deinit_js();
} catch (error) {
  console.error(`pufs_get_uid_js failed with error: ${(error as Error).message}`);
  process.exit(1);
}
