
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include "pufs_basic.h"
#include "pufs_rt.h"
#include "pufs_pkc.h"


int pufs_rand_js(void)
{
    pufs_status_t status;
    wchar_t serial_number[] =  {'0', '0', 'E', '0', '6', '0', '0', 'D', 'C', '0', 'D', 'E', '\0'  };
    /* PUFse cmd interface init */
    status = pufs_cmd_iface_init(serial_number);
    // if (status != SUCCESS) {
    //     printf("debugging :%d\n", status);
    //     return status;
    // }
   
    // pufs_ec_point_st puk;
    uint32_t r1;
    status = pufs_rand((uint8_t*)&r1, 1);
        if (status != SUCCESS) {
            status = 2;
            return status; 
        }
    // printf("Random number r1: %u\n", r1);
    // pufs_uid_st uid;
    // pufs_get_uid(&uid, 0); 
    //  // Printing each element of the array
    // printf("uid:");
    // for (int i = 0; i < 32; ++i) {
    //     printf(" %02x", uid.uid[i]);  // Print each value in hexadecimal format
    // }
    // printf("\n");  // Print a new line at the end
    // pufs_ecp_gen_puk(&puk, PRKEY, PRK_0);
    //   for (int i = 0; i < QLEN_MAX; ++i) {
    //     printf("%u ", puk.x[i]);  // Assuming you want to print each value followed by a space
    // }
    // printf("\n");  // Print a new line at the end

    /* PUFse cmd interface de-init */
    status = pufs_cmd_iface_deinit();
    if (status != SUCCESS) {
        printf("pufs_cmd_iface_deinit fail\n");
        return status;
    }

    return r1;
}

