#include <stdint.h>
#include <stdio.h>
#include "pufs_basic.h"
#include "pufs_rt.h"
#include "pufs_pkc.h"
#include <string.h>
#include <openssl/ec.h>
#include <openssl/evp.h>
#include <openssl/pem.h>
#include <openssl/err.h>
#include <openssl/bn.h>

void handle_errors(void)
{
    ERR_print_errors_fp(stderr);
    abort();
}

EVP_PKEY *generate_key(void)
{
    EVP_PKEY *pkey = NULL;
    EVP_PKEY_CTX *pctx = NULL;

    /* Create the context for key generation */
    pctx = EVP_PKEY_CTX_new_id(EVP_PKEY_EC, NULL);
    if (!pctx)
        handle_errors();

    /* Initialize the key generation context */
    if (EVP_PKEY_keygen_init(pctx) <= 0)
        handle_errors();

    /* Set the elliptic curve to use for the key generation */
    if (EVP_PKEY_CTX_set_ec_paramgen_curve_nid(pctx, NID_X9_62_prime256v1) <= 0)
        handle_errors();

    /* Generate the key */
    if (EVP_PKEY_keygen(pctx, &pkey) <= 0)
        handle_errors();

    /* Clean up */
    EVP_PKEY_CTX_free(pctx);

    return pkey;
}

pufs_status_t pufs_cmd_iface_init_js(void)
{
    pufs_status_t status;
    wchar_t serial_number[] = {'0', '0', 'E', '0', '6', '0', '0', 'D', 'C', '0', 'D', 'E', '\0'};
    /* PUFse cmd interface init */
    status = pufs_cmd_iface_init(serial_number);
    if (status != SUCCESS)
    {
        return status;
    }
    return status;
}

void pufs_outnumber_js(int *outnumber)
{
    *outnumber = 168;
}

void pufs_outString_js(char **outstring)
{
    *outstring = "0414c58e581c7656ba153195669fe4ce53ff78dd5ede60a4039771a90c58cb41deec41869995bd661849414c523c7dff9a96f1c8dbc2e5e78172118f91c7199869";
}

pufs_status_t pufs_rand_js(void)
{
    pufs_status_t status;
    uint32_t r1;
    status = pufs_rand((uint8_t *)&r1, 1);
    if (status != SUCCESS)
    {
        pufs_cmd_iface_deinit();
        return status;
    }
    return status;
}

#define UID_LENGTH 32

char *pufs_get_uid_js(void)
{
    pufs_status_t status;
    static char uid_str[UID_LENGTH * 2 + 1]; // Static buffer for UID string
    pufs_uid_st uid;
    status = pufs_get_uid(&uid, 0);

    // Converting each byte to its hexadecimal representation and storing it in the static string buffer
    for (int i = 0; i < UID_LENGTH; ++i)
    {
        sprintf(&uid_str[i * 2], "%02x", uid.uid[i]);
    }

    // Null-terminating the string
    uid_str[UID_LENGTH * 2] = '\0';

    if (status != SUCCESS)
    {
        pufs_cmd_iface_deinit();
    }

    return uid_str;
}

char *pufs_p256_sign_js(char *msgdigest)
{
    static char signature[129];
    pufs_ecdsa_sig_st sig;
    pufs_dgst_st md;
    pufs_status_t status;
    // Ensure the message digest length is correct
    if (strlen(msgdigest) != 64)
    {
        fprintf(stderr, "Invalid message digest length\n");
        return NULL;
    }

    // Convert the message digest from hex string to bytes
    md.dlen = 32;
    for (int i = 0; i < 32; i++)
    {
        sscanf(&msgdigest[i * 2], "%2hhx", &md.dgst[i]);
    }
    status = pufs_ecp_set_curve_byname(NISTP256);
    if (status != SUCCESS)
    {
        pufs_cmd_iface_deinit();
    }
    pufs_ecp_ecdsa_sign_dgst(&sig, md, PRKEY, PRK_0, NULL);

    if (status != SUCCESS)
    {
        pufs_cmd_iface_deinit();
    }
    // Convert the signature to a 128-byte string (hex format)
    for (uint32_t i = 0; i < sig.qlen; i++)
    {
        sprintf(&signature[i * 2], "%02x", sig.r[i]);
    }
    for (uint32_t i = 0; i < sig.qlen; i++)
    {
        sprintf(&signature[64 + i * 2], "%02x", sig.s[i]);
    }

    signature[128] = '\0';
    return signature;
}

const char *pufs_get_p256_pubkey_js(void)
{
    static char pubkey[131]; // 1 byte for 0x04 + 2*32 bytes for x and y + 1 byte for null terminator
    pufs_status_t status;
    pufs_ec_point_st puk;
    pufs_ka_slot_t prvslot = PRK_0;
    const char *salt = "pufsecurity salt";
    const char *info = "pufsecurity info";
    pufs_rt_slot_t pufslot = PUFSLOT_1;

    status = pufs_ecp_set_curve_byname(NISTP256);
    if (status != SUCCESS)
    {
        pufs_cmd_iface_deinit();
    }
    status = pufs_ecp_gen_sprk(prvslot, pufslot, (uint8_t *)salt, 16, (uint8_t *)info, 16, HASH_DEFAULT); 
    pufs_ecp_gen_puk(&puk, PRKEY, PRK_0);
    pufs_clear_key(PRKEY, PRK_0, 32);
    if (status != SUCCESS)
    {
        pufs_cmd_iface_deinit();
    }

    pubkey[0] = '0';
    pubkey[1] = '4';

    pubkey[0] = '0';
    pubkey[1] = '4';
    for (uint32_t i = 0; i < puk.qlen; i++)
    {
        sprintf(&pubkey[2 + i * 2], "%02x", puk.x[i]);
    }
    for (uint32_t i = 0; i < puk.qlen; i++)
    {
        sprintf(&pubkey[2 + 2 * puk.qlen + i * 2], "%02x", puk.y[i]);
    }
    pubkey[130] = '\0';

    return pubkey;
}

// Aetheras's VRF ??
const char *pufs_p256_signed_random_js(void)
{
    static char vrf[145]; // 8 bytes random + 64 byte signature
    // Not sure if PUFSecurity's firmware supports this feature.
    // PUFSecurity introduces an additional Host Lib layer, meaning the VRF doesn't come directly from USB.
    // Therefore, the VRF is actually originating from the hardware? :) :)
    return vrf;
}

pufs_status_t pufs_cmd_iface_deinit_js(void)
{
    pufs_status_t status;
    /* PUFse cmd interface de-init */
    status = pufs_cmd_iface_deinit();
    if (status != SUCCESS)
    {
        return status;
    }
    return status;
}


// pufs_status_t pufs_jeff(void)
// {
//     pufs_status_t check = SUCCESS;
//  
//   // 使用PUFKEY，Private key不會出來，所以只會有Public key的產出
//     pufs_ec_point_st puk;
//  
//   // 將產生得Private Key放到KA上，方可給後面的function來取並使用
//     pufs_ka_slot_t prvslot = PRK_0;
//  
//   // 產生Private Key，使用PUFSLOT_1, PUFSLOT_2, PUFSLOT_3作為base，可自行決定salt and info >> 需記錄起來
//     pufs_rt_slot_t pufslot = PUFSLOT_1;
//     const char *salt = "pufsecurity salt";
//     const char *info = "pufsecurity info";
//  
//   // md - sha的規則要跟著pufs_ecp_set_curve_byname and pufs_ecp_gen_sprk 內的參數
//     uint8_t message[32] = {0};
//     uint32_t msglen = 32;
//     pufs_dgst_st md;
//     pufs_ecdsa_sig_st sig;
//  
// // Get Public Key
// // pufs_ecp_set_curve_byname >> pufs_ecp_gen_sprk >> pufs_ecp_gen_puk >> pufs_clear_key
// #ifdef get_public_key 1
//     pufs_ecp_set_curve_byname(NISTP256);
//     if ((check = pufs_ecp_gen_sprk(prvslot, pufslot, (uint8_t *)salt, 16,
//                                    (uint8_t *)info, 16, HASH_DEFAULT)) == SUCCESS) {
//    
//       // 產生Public Key
//         check = pufs_ecp_gen_puk(&puk, PRKEY, PRK_0);
//     }
//  
//     if (check = SUCCESS) {
//         check = pufs_clear_key(PRKEY, PRK_0, 32);
//     }
//  
//     return check;
//  
// // Sign message
// // pufs_hash >> pufs_ecp_set_curve_byname >> pufs_ecp_gen_sprk >> pufs_ecp_ecdsa_sign_dgst >> pufs_clear_key
// #else // sign_message
//  
//     if ((check = pufs_hash(&md, message, msglen, HASH_DEFAULT)) != SUCCESS) {
//            
//         pufs_ecp_set_curve_byname(NISTP256);
//         if ((check = pufs_ecp_gen_sprk(prvslot, pufslot, (uint8_t *)salt, 16,
//                                    (uint8_t *)info, 16, HASH_DEFAULT)) == SUCCESS) {
//            
//             check = pufs_ecp_ecdsa_sign_dgst(&sig, md, PRKEY, PRK_0, NULL)
//         }
//     }
//  
//     if (check = SUCCESS) {
//         check = pufs_clear_key(PRKEY, PRK_0, 32);
//     }
//  
// #endif
//  
//     return check;
// }
