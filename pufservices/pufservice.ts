// ffi for PUFS Services 

import ffi from 'ffi-napi';
import ref from 'ref-napi';

// Try to load the library and handle any errors
let pufs;
try {
  pufs = ffi.Library('./pufs_c_lib/fw/bin/libpufse_ffi.so', {
    pufs_cmd_iface_init_js: ["int", []] ,
    pufs_cmd_iface_deinit_js: ["int", []] ,
    pufs_rand_js: ["int", []] ,
    pufs_get_uid_js: [ref.types.CString, []] ,
  });
} catch (error) {
  console.error(`Failed to load library: ${(error as Error).message}`);
  process.exit(1);
}

try {
  pufs.pufs_cmd_iface_init_js();
  const uid = pufs.pufs_get_uid_js();
  console.log(uid)
  pufs.pufs_cmd_iface_deinit_js();
} catch (error) {
  console.error(`pufs_get_uid_js failed with error: ${(error as Error).message}`);
  process.exit(1);
}
