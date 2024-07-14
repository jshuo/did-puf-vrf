//gcc -I$(brew --prefix openssl)/include -L$(brew --prefix openssl)/lib -shared -lssl -lcrypto  -o libcrypto.so.dylib -fPIC libcrypto.c

#include <stdio.h>
#include <string.h>
#include <openssl/sha.h>

void signHash(const char *hash32, unsigned char *signature64) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256_CTX sha256;

    // Initialize the SHA256 context
    SHA256_Init(&sha256);
    
    // Update the SHA256 hash with your data
    SHA256_Update(&sha256, hash32, strlen(hash32));
    
    // Finalize the SHA256 hash
    SHA256_Final(hash, &sha256);
    
    // Convert the hash to hexadecimal string (64 bytes)
    for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        sprintf((unsigned char*)&signature64[i * 2], "%02x", hash[i]);
    }
}