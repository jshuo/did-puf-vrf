#include <stdint.h>
#include <stdio.h>
#include "pufs_basic.h"
#include "pufs_rt.h"
#include "pufs_pkc.h"
#include <string.h>
#include <openssl/sha.h>
#include <json-c/json.h>





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

#define RAND_LENGTH 32
#define MEMORY_ALLOCATION_FAILURE -1

pufs_status_t pufs_rand_js(int blk, char **rand)
{

   pufs_status_t status;
    uint8_t privkey[RAND_LENGTH];
    static char random[RAND_LENGTH * 2 + 1]; // Added missing semicolon

    status = pufs_rand(privkey, blk);
    if (status != SUCCESS)
    {
        pufs_cmd_iface_deinit();
        return status;
    }

    // Convert privkey to hex string
    for (int i = 0; i < RAND_LENGTH; ++i)
    {
        sprintf(&random[i * 2], "%02x", privkey[i]);
    }
    random[RAND_LENGTH * 2] = '\0'; // Corrected to use RAND_LENGTH

    // Allocate memory for rand if not already allocated by the caller
    if (*rand == NULL)
    {
        *rand = (char *)malloc((RAND_LENGTH * 2 + 1) * sizeof(char));
        if (*rand == NULL)
        {
            // Handle memory allocation failure
            pufs_cmd_iface_deinit();
            return MEMORY_ALLOCATION_FAILURE; // Define appropriate error code
        }
    }

    // Copy the generated hex string to rand
    strcpy(*rand, random);

    return SUCCESS;
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


pufs_status_t pufs_puf_vrf_service(int blk, char **rand) {

   pufs_status_t status;
    uint8_t privkey[RAND_LENGTH];
    static char random[RAND_LENGTH * 2 + 1]; // Added missing semicolon

    status = pufs_rand(privkey, blk);
    if (status != SUCCESS)
    {
        pufs_cmd_iface_deinit();
        return status;
    }

    // Convert privkey to hex string
    for (int i = 0; i < RAND_LENGTH; ++i)
    {
        sprintf(&random[i * 2], "%02x", privkey[i]);
    }
    random[RAND_LENGTH * 2] = '\0'; // Corrected to use RAND_LENGTH

    // Allocate memory for rand if not already allocated by the caller
    if (*rand == NULL)
    {
        *rand = (char *)malloc((RAND_LENGTH * 2 + 1) * sizeof(char));
        if (*rand == NULL)
        {
            // Handle memory allocation failure
            pufs_cmd_iface_deinit();
            return MEMORY_ALLOCATION_FAILURE; // Define appropriate error code
        }
    }

    // Copy the generated hex string to rand
    // strcpy(*rand, random);

    pufs_dgst_st md;
    pufs_ka_slot_t prvslot = PRK_0;
    const char *salt = "pufsecurity salt";
    const char *info = "pufsecurity info";
    pufs_rt_slot_t pufslot = PUFSLOT_1;
    pufs_ecdsa_sig_st sig;
    md.dlen = 32;

        // Create a buffer for the SHA-256 hash
    // unsigned char hash[SHA256_DIGEST_LENGTH];
     char hash[SHA256_DIGEST_LENGTH];

    // Create and initialize the SHA256 context
    SHA256_CTX sha256;
    SHA256_Init(&sha256);

    // Update the context with the message
    SHA256_Update(&sha256, *rand, strlen(*rand));

    // Finalize the hash and store it in the 'hash' buffer
    SHA256_Final((unsigned char*) hash, &sha256);

    md.dlen = 32;
    for (int i = 0; i < 32; i++)
    {
        sscanf(&hash[i * 2], "%2hhx", &md.dgst[i]);
    }

    status = pufs_ecp_set_curve_byname(NISTP256);
    if (status != SUCCESS)
    {
        pufs_cmd_iface_deinit();
    }
    pufs_ecp_gen_sprk(prvslot, pufslot, (uint8_t *)salt, 16, (uint8_t *)info, 16, HASH_DEFAULT);

    pufs_ecp_ecdsa_sign_dgst(&sig, md, PRKEY, PRK_0, NULL);

    if (status != SUCCESS)
    {
        pufs_cmd_iface_deinit();
    }

    if (status == SUCCESS) {
      status = pufs_clear_key(PRKEY, PRK_0, 32);
    }

    static char signature[129];
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


    json_object *root = json_object_new_object();
    json_object_object_add(root, "signature", json_object_new_string(signature));
    json_object_object_add(root, "random", json_object_new_string(random));

    const char *json_str = json_object_to_json_string_ext(root, JSON_C_TO_STRING_PRETTY);
    size_t json_string_length = strlen(json_str) + 1;
    *rand = (char *)malloc(json_string_length);
    if (*rand == NULL) {
        json_object_put(root);
        pufs_cmd_iface_deinit();
    }

    strcpy(*rand, json_str);
    json_object_put(root);

    return SUCCESS;
}
char *pufs_p256_sign_js(char *msgdigest)
{
    static char signature[129];
    pufs_status_t status;
    pufs_dgst_st md;
    pufs_ka_slot_t prvslot = PRK_0;
    const char *salt = "pufsecurity salt";
    const char *info = "pufsecurity info";
    pufs_rt_slot_t pufslot = PUFSLOT_1;
    pufs_ecdsa_sig_st sig;

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
    pufs_ecp_gen_sprk(prvslot, pufslot, (uint8_t *)salt, 16, (uint8_t *)info, 16, HASH_DEFAULT);

    pufs_ecp_ecdsa_sign_dgst(&sig, md, PRKEY, PRK_0, NULL);

    if (status != SUCCESS)
    {
        pufs_cmd_iface_deinit();
    }

    if (status == SUCCESS) {
      status = pufs_clear_key(PRKEY, PRK_0, 32);
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
    if (status != SUCCESS)
    {
        pufs_cmd_iface_deinit();
    }
    if (status == SUCCESS) {
      status = pufs_clear_key(PRKEY, PRK_0, 32);
    }
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


