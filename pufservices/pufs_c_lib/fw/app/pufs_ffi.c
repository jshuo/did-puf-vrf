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
    pufs_ec_point_st puk0;

    status = pufs_ecp_set_curve_byname(NISTP256);
    if (status != SUCCESS)
    {
        pufs_cmd_iface_deinit();
    }
    status = pufs_ecp_gen_puk(&puk0, PRKEY, PRK_0);
    if (status != SUCCESS)
    {
        pufs_cmd_iface_deinit();
    }

    // Set the qlen to 32 bytes (length of x and y)
    puk0.qlen = 32;

    uint8_t x_data[32] = {
        0x14, 0xc5, 0x8e, 0x58, 0x1c, 0x76, 0x56, 0xba,
        0x15, 0x31, 0x95, 0x66, 0x9f, 0xe4, 0xce, 0x53,
        0xff, 0x78, 0xdd, 0x5e, 0xde, 0x60, 0xa4, 0x03,
        0x97, 0x71, 0xa9, 0x0c, 0x58, 0xcb, 0x41, 0xde};

    // Example data for y-coordinate
    uint8_t y_data[32] = {
        0xec, 0x41, 0x86, 0x99, 0x95, 0xbd, 0x66, 0x18,
        0x49, 0x41, 0x4c, 0x52, 0x3c, 0x7d, 0xff, 0x9a,
        0x96, 0xf1, 0xc8, 0xdb, 0xc2, 0xe5, 0xe7, 0x81,
        0x72, 0x11, 0x8f, 0x91, 0xc7, 0x19, 0x98, 0x69};

    // Copy data into the structure
    memcpy(puk0.x, x_data, 32);
    memcpy(puk0.y, y_data, 32);
    // Construct the uncompressed public key
    pubkey[0] = '0';
    pubkey[1] = '4';
    for (uint32_t i = 0; i < puk0.qlen; i++)
    {
        sprintf(&pubkey[2 + i * 2], "%02x", puk0.x[i]);
    }
    for (uint32_t i = 0; i < puk0.qlen; i++)
    {
        sprintf(&pubkey[2 + 2 * puk0.qlen + i * 2], "%02x", puk0.y[i]);
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
