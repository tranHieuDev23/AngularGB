/// <reference lib="webworker" />

import { disassemblyRom, RomDisassemblerInput } from "./rom-disassembler.common";


addEventListener("message", ({ data }) => {
  const input = data as RomDisassemblerInput;
  const output = disassemblyRom(input);
  postMessage(output);
});
