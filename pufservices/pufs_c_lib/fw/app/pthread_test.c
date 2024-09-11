// HSM Linux Program

// gcc -o hsm_dispatcher hsm_dispatcher.c -I/usr/include/hidapi -L/usr/lib/x86_64-linux-gnu/ -lhidapi-hidraw -lpthread
// sudo ./hsm_dispatcher

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <hidapi/hidapi.h>

#define MAX_DEVICES 10
#define REPORT_SIZE 64 // Adjust based on your device's report size

// Structure to hold information about each device
typedef struct {
    hid_device *device;
    unsigned short vendor_id;
    unsigned short product_id;
    wchar_t serial_number[256];
} HSM_Device;

// Task function for each HSM device
void* handle_hsm_device(void* arg) {
    HSM_Device* hsm_device = (HSM_Device*) arg;
    
    unsigned char report[REPORT_SIZE];
    int res;

    printf("Handling HSM device with VID: 0x%04hx, PID: 0x%04hx\n", 
            hsm_device->vendor_id, hsm_device->product_id);

    // Send a report to the device (example)
    memset(report, 0x00, sizeof(report));
    report[0] = 0x01; // Report ID or command byte, depends on your device
    res = hid_write(hsm_device->device, report, REPORT_SIZE);
    if (res < 0) {
        printf("Error: Unable to read from device\n");
    } else {
        printf("Data received from HSM device: ");
        for (int i = 0; i < res; i++) {
            printf("%02x ", report[i]);
        }
        printf("\n");
    }

    hid_close(hsm_device->device);
    pthread_exit(NULL);
}

int main() {
    struct hid_device_info *devs, *cur_dev;
    HSM_Device hsm_devices[MAX_DEVICES];
    int device_count = 0;

    // Initialize HIDAPI
    if (hid_init() != 0) {
        fprintf(stderr, "Failed to initialize HIDAPI\n");
        return -1;
    }

    // Enumerate connected HID devices
    devs = hid_enumerate(0x0, 0x0); // Pass VID, PID = 0 to list all devices
    cur_dev = devs;

    // Iterate through the devices and select HSMs (based on some condition)
    while (cur_dev && device_count < MAX_DEVICES) {
        if (cur_dev->vendor_id == 0xff08 && cur_dev->product_id == 0x9001) { // Adjust VID/PID
            wprintf(L"Found HSM device: %s\n", cur_dev->serial_number);

            hsm_devices[device_count].device = hid_open(cur_dev->vendor_id, cur_dev->product_id, cur_dev->serial_number);
            hsm_devices[device_count].vendor_id = cur_dev->vendor_id;
            hsm_devices[device_count].product_id = cur_dev->product_id;
            wcscpy(hsm_devices[device_count].serial_number, cur_dev->serial_number);

            if (hsm_devices[device_count].device == NULL) {
                printf("Unable to open device\n");
            } else {
                device_count++;
            }
        }
        cur_dev = cur_dev->next;
    }

    hid_free_enumeration(devs);

    // Create threads to handle each HSM device
    pthread_t threads[MAX_DEVICES];
    for (int i = 0; i < device_count; i++) {
        if (pthread_create(&threads[i], NULL, handle_hsm_device, (void*)&hsm_devices[i])) {
            fprintf(stderr, "Error creating thread for device %d\n", i);
        }
    }

    // Wait for threads to complete
    for (int i = 0; i < device_count; i++) {
        if (pthread_create(&threads[i], NULL, handle_hsm_device, (void*)&hsm_devices[i])) {
            fprintf(stderr, "Error creating thread for device %d\n", i);
        }
    }

    // Wait for threads to complete
    for (int i = 0; i < device_count; i++) {
        pthread_join(threads[i], NULL);
    }

    // Clean up HIDAPI
    hid_exit();

    return 0;
}