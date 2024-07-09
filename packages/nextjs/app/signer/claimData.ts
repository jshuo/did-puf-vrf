export const jetsonData = {
  Jetson_AGX_Orin_32GB: {
    AI_Performance: "200 TOPS (INT8)",
    GPU: "NVIDIA Ampere architecture with 1792 NVIDIA CUDA cores and 56 Tensor Cores",
    Max_GPU_Freq: "930 MHz",
    CPU: "8-core Arm Cortex-A78AE v8.2 64-bit CPU, 2MB L2 + 4MB L3",
    CPU_Max_Freq: "2.2 GHz",
    DL_Accelerator: "2x NVDLA v2.0",
    DLA_Max_Frequency: "1.4 GHz",
    Vision_Accelerator: "PVA v2.0",
    Memory: "32GB 256-bit LPDDR5, 204.8 GB/s",
    Storage: "64GB eMMC 5.1",
    CSI_Camera:
      "Up to 6 cameras (16 via virtual channels), 16 lanes MIPI CSI-2, D-PHY 2.1 (up to 40Gbps) | C-PHY 2.0 (up to 164Gbps)",
    Video_Encode: "1x 4K60 | 3x 4K30 | 6x 1080p60 | 12x 1080p30 (H.265), H.264, AV1",
    Video_Decode: "1x 8K30 | 2x 4K60 | 4x 4K30 | 9x 1080p60| 18x 1080p30 (H.265), H.264, VP9, AV1",
    UPHY: "Up to 2 x8, 1 x4, 2 x1 (PCIe Gen4, Root Port & Endpoint), 3x USB 3.2",
    Networking: "1x GbE",
    Display: "1x 8K60 multi-mode DP 1.4a (+MST)/eDP 1.4a/HDMI 2.1",
    Other_IO: "4x USB 2.0, 4x UART, 3x SPI, 4x I2S, 8x I2C, 2x CAN, DMIC & DSPK, GPIOs",
    Power: "15W - 40W",
    Mechanical: "100mm x 87mm, 699-pin Molex Mirror Mezz Connector, Integrated Thermal Transfer Plate",
  },
};

export const teslaBatt = {
  model: "Tesla Model Y",
  variants: [
    {
      name: "Long Range",
      battery: {
        capacity_kWh: 75,
        chemistry: "NCA (Nickel Cobalt Aluminum Oxide)",
        voltage_V: 350,
        modules: 4,
        cells_per_module: 384,
        total_cells: 1536,
      },
      range_miles: 330,
      power_hp: 384,
      torque_lb_ft: 376,
      "0_to_60_mph_seconds": 4.8,
      top_speed_mph: 135,
      charging: {
        max_supercharging_speed_kW: 250,
        home_charging_speed_kW: 11.5,
        charging_time_110V_hours: 40,
        charging_time_220V_hours: 11,
        charging_time_supercharger_80_percent_minutes: 25,
      },
      weight_lbs: 4416,
    },
    {
      name: "Performance",
      battery: {
        capacity_kWh: 75,
        chemistry: "NCA (Nickel Cobalt Aluminum Oxide)",
        voltage_V: 350,
        modules: 4,
        cells_per_module: 384,
        total_cells: 1536,
      },
      range_miles: 303,
      power_hp: 456,
      torque_lb_ft: 497,
      "0_to_60_mph_seconds": 3.5,
      top_speed_mph: 155,
      charging: {
        max_supercharging_speed_kW: 250,
        home_charging_speed_kW: 11.5,
        charging_time_110V_hours: 40,
        charging_time_220V_hours: 11,
        charging_time_supercharger_80_percent_minutes: 25,
      },
      weight_lbs: 4553,
    },
  ],
};

export const clife = {
    "id": "did:neopuf:4b8e8c9da0f6a1b9e9e6c0cfa6f292a3f6b8c1d4e5f4a8b9e9c6f3d2a4e9e2c3",
    "product": {
      "name": "Clife key C series",
      "category": "FIDO",
      "description": {
        "en": "Clife key is a ChipWon Technology product, certified by the FIDO Association. It offers strong multi-factor authentication (MFA) and secure login.",
        "zh": "Clife key 是群旺科技的產品，通過FIDO協會認證。提供強大的多因素身份驗證 (MFA) 和安全登錄。"
      },
      "features": {
        "en": [
          "Supports FIDO protocols: WebAuthn, FIDO2 CTAP1, FIDO2 CTAP2, U2F.",
          "Compatible with Windows, MacOS, Linux, iOS, Android, ChromeOS.",
          "Flexible authentication options: single-factor, 2FA, MFA. Durable, tamper-proof, water-resistant, crush-proof. Made in Taiwan."
        ],
        "zh": [
          "支援FIDO協議: WebAuthn, FIDO2 CTAP1, FIDO2 CTAP2, U2F。",
          "兼容Windows, MacOS, Linux, iOS, Android, ChromeOS。",
          "靈活的身份驗證選項: 單因素, 2FA, MFA。耐用、防篡改、防水、防擠壓。台灣製造。"
        ]
      }
    },
    "serialNumber": "4b8e8c9da0f6a1b9e9e6c0cfa6f292a3f6b8c1d4e5f4a8b9e9c6f3d2a4e9e2c3",
    "uuid": "4b8e8c9da0f6a1b9e9e6c0cfa6f292a3f6b8c1d4e5f4a8b9e9c6f3d2a4e9e2c3",
    "chipFingerprintId": "4b8e8c9da0f6a1b9e9e6c0cfa6f292a3f6b8c1d4e5f4a8b9e9c6f3d2a4e9e2c3"
  }
  