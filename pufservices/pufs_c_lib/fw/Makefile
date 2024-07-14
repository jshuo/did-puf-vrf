TOPTARGETS = all clean debug
CFLAGS = -Wall -Werror -Wextra -pedantic -pedantic-errors -Wstrict-prototypes -lpthread -fPIC


    CC = gcc


CFLAGS += -O2

export CFLAGS
export CPPFLAGS


# PUFSE_HOST_LIBRARY -------------------------------------
PUFSE_HOST_LIB_DIR=pufse_host_lib
PUFSE_LIB_DIR=$(PUFSE_HOST_LIB_DIR)/lib
PUFSE_INCLUDE_DIR=$(PUFSE_HOST_LIB_DIR)/include

PUFSE_INCLUDE_DIRS := ${shell find ${PUFSE_INCLUDE_DIR} -type d -print}


# Set libpufse libraries
LIB_PUFSE=$(PUFSE_LIB_DIR)/libpufse_x86.so
LIBS = $(LIB_PUFSE)


# TEST and APP DIR/SRC, Include dirs -------------------------------------
APP_DIR=app


# Output Folder and target execution  --------------------------------------------
BIN_DIR=bin
TARGET_SO=libpufse_ffi.so  # Change target name to a shared object file


# Include option -------------------------------------------

INC_PUFSE_OPTION = $(addprefix -I, $(PUFSE_INCLUDE_DIRS))
INC_OPTION= $(INC_PUFSE_OPTION) 


# Target --------------------------------------------------
all: $(TARGET_SO) gen_bin

$(TARGET_SO):  $(APP_DIR)/pufs_ffi.c $(LIBS)
	@echo "CC: $(CC)"
	$(CC) $(CFLAGS) $(CPPFLAGS) $(LDFLAGS) $(INC_OPTION) -shared -o $(BIN_DIR)/$@ $^

clean:
	$(RM) $(BIN_DIR)/$(TARGET_SO)
	$(RM) -r $(BIN_DIR)
	mkdir -p bin

gen_bin:
	mkdir -p $(BIN_DIR)
	cp $(LIB_PUFSE) $(BIN_DIR)/libpufse.so
	cp set_env.sh $(BIN_DIR)

.PHONY: $(TOPTARGETS)
