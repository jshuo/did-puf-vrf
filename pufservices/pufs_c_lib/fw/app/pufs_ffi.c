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
        printf("Random number generation failed: %d\n", status);
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
    pufs_get_uid(&uid, 0);

    // Converting each byte to its hexadecimal representation and storing it in the static string buffer
    for (int i = 0; i < UID_LENGTH; ++i)
    {
        sprintf(&uid_str[i * 2], "%02x", uid.uid[i]);
    }

    // Null-terminating the string
    uid_str[UID_LENGTH * 2] = '\0';

    /* PUFse cmd interface de-init */
    status = pufs_cmd_iface_deinit();
    if (status != SUCCESS)
    {
        printf("PUFse cmd interface de-init failed: %d\n", status);
        return NULL;
    }

    return uid_str;
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
