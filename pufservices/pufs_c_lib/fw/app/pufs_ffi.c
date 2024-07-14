#include <stdint.h>
#include <stdio.h>
#include "pufs_basic.h"
#include "pufs_rt.h"
#include "pufs_pkc.h"

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


char *pufs_p256sign_js(char *hash)
{
    return hash;
}

const char *pufs_get_pubkey_js(void)
{
    const char *pubkey = "0414c58e581c7656ba153195669fe4ce53ff78dd5ede60a4039771a90c58cb41deec41869995bd661849414c523c7dff9a96f1c8dbc2e5e78172118f91c7199869";
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
