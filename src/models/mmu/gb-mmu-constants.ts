export const ROM_BANK_START = 0x4000;
export const VRAM_START = 0x8000;
export const EXT_RAM_START = 0xa000;
export const WORK_RAM_START = 0xc000;
export const ECHO_RAM_START = 0xe000;
export const SPRITE_RAM_START = 0xfe00;
export const FORBIDDEN_RAM_START = 0xfea0;
export const IO_REG_START = 0xff00;
export const HIGH_RAM_START = 0xff80;
export const IE_REG = 0xffff;

export const DISABLE_BOOT_ROM_REG_ADDRESS = 0xff50;

export const TILE_DATA_BLOCK_0_ADDRESS = 0x8000;
export const TILE_DATA_BLOCK_1_ADDRESS = 0x8800;
export const TILE_DATA_BLOCK_2_ADDRESS = 0x9000;

export const TILE_MAP_0_ADDRESS = 0x9800;
export const TILE_MAP_1_ADDRESS = 0x9c00;

export const OAM_ADDRESS = 0xfe00;
export const DMA_REG_ADDRESS = 0xff46;

export const LCDC_REG_ADDRESS = 0xff40;

export const STAT_REG_ADDRESS = 0xff41;

export const SCROLL_Y_ADDRESS = 0xff42;
export const SCROLL_X_ADDRESS = 0xff43;
export const LY_ADDRESS = 0xff44;
export const LYC_ADDRESS = 0xff45;
export const WINDOW_Y_ADDRESS = 0xff4a;
export const WINDOW_X_ADDRESS = 0xff4b;

export const BG_PALETTE_DATA_ADDRESS = 0xff47;
export const OBJ_PALETTE_0_DATA_ADDRESS = 0xff48;
export const OBJ_PALETTE_1_DATA_ADDRESS = 0xff49;

export const CONTROLLER_REG_ADDRESS = 0xff00;

export const INTERRUPT_ENABLE_ADDRESS = 0xffff;
export const INTERRUPT_FLAG_ADDRESS = 0xff0f;
